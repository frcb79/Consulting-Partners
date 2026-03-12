import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;

type RouteParams = { params: Promise<{ id: string }> };

type ChatMessageRow = {
  role: "user" | "assistant";
  content: string;
};

function toSafeText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY no está configurada en el servidor." },
      { status: 503 }
    );
  }

  const { id: clientId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile?.tenant_id || profile.role === "client") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { message?: unknown } | null;
  const userMessage = toSafeText(body?.message).trim();

  if (!userMessage) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, industry, strategic_context, commercial_context, internal_notes")
    .eq("id", clientId)
    .single();

  if (!client || client.id !== clientId) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  await supabase.from("chat_messages").insert({
    tenant_id: profile.tenant_id,
    client_id: clientId,
    user_id: user.id,
    role: "user",
    content: userMessage,
  });

  const [{ data: diagnostics }, { data: docs }, { data: historyRows }] = await Promise.all([
    supabase
      .from("diagnostics")
      .select("id, title, framework, status, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("documents")
      .select("name, category, ai_summary, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("chat_messages")
      .select("role, content")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true })
      .limit(20),
  ]);

  const diagnosticIds = (diagnostics ?? []).map((d) => toSafeText(d.id)).filter(Boolean);

  const { data: findings } = diagnosticIds.length
    ? await supabase
        .from("findings")
        .select("title, so_what, impact_estimate, status, display_order")
        .in("diagnostic_id", diagnosticIds)
        .order("display_order", { ascending: true })
        .limit(8)
    : { data: [] as Array<{ title: string; so_what: string | null; impact_estimate: string | null; status: string }> };

  const systemPrompt = [
    "Eres un consultor senior de estrategia y operaciones.",
    "Responde en español, con claridad ejecutiva y foco en decisiones accionables.",
    "No inventes datos. Si falta información, dilo explícitamente y sugiere qué dato pedir.",
    "Usa bullets cortos cuando sea útil, y propone próximos pasos concretos.",
    "",
    `Cliente: ${client.name}`,
    `Industria: ${client.industry ?? "No especificada"}`,
    `Contexto estratégico: ${client.strategic_context ?? "No disponible"}`,
    `Contexto comercial: ${client.commercial_context ?? "No disponible"}`,
    `Notas internas: ${client.internal_notes ?? "No disponibles"}`,
    "",
    "Diagnósticos recientes:",
    ...(diagnostics?.length
      ? diagnostics.map(
          (d, i) =>
            `${i + 1}. ${toSafeText(d.title)} | ${toSafeText(d.framework)} | estado=${toSafeText(d.status)}`
        )
      : ["Sin diagnósticos registrados."]),
    "",
    "Hallazgos recientes:",
    ...(findings?.length
      ? findings.map(
          (f, i) =>
            `${i + 1}. ${toSafeText(f.title)} | impacto=${toSafeText(f.impact_estimate, "Pendiente")} | so_what=${toSafeText(f.so_what, "Pendiente")}`
        )
      : ["Sin hallazgos registrados."]),
    "",
    "Documentos recientes:",
    ...(docs?.length
      ? docs.map(
          (d, i) =>
            `${i + 1}. ${toSafeText(d.name)} [${toSafeText(d.category, "sin categoría")}] resumen=${toSafeText(d.ai_summary, "pendiente")}`
        )
      : ["Sin documentos registrados."]),
  ].join("\n");

  const history = ((historyRows ?? []) as ChatMessageRow[]).map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const result = streamText({
    model: anthropic("claude-3-5-sonnet-20241022"),
    system: systemPrompt,
    messages: history,
    temperature: 0.3,
    maxOutputTokens: 900,
  });

  let assistantText = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const chunk of result.textStream) {
          assistantText += chunk;
          controller.enqueue(encoder.encode(chunk));
        }

        if (assistantText.trim()) {
          await supabase.from("chat_messages").insert({
            tenant_id: profile.tenant_id,
            client_id: clientId,
            user_id: user.id,
            role: "assistant",
            content: assistantText,
          });
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
