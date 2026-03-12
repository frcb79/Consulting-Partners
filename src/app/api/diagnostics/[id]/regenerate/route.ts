import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const RegeneratedFindingsSchema = z.object({
  findings: z
    .array(
      z.object({
        id: z.string().uuid(),
        title: z.string(),
        body: z.string(),
        so_what: z.string(),
        impact_estimate: z.string(),
      })
    )
    .min(1)
    .max(12),
});

function buildRegenerationPrompt(params: {
  framework: string;
  areas: string[];
  diagnosticTitle: string;
  instructions: string;
  selectedFindings: Array<{
    id: string;
    title: string;
    body: string;
    so_what: string | null;
    impact_estimate: string | null;
  }>;
}) {
  const { framework, areas, diagnosticTitle, instructions, selectedFindings } = params;

  return `You are a senior Bain-level consultant rewriting rejected findings.

Diagnostic title: ${diagnosticTitle}
Framework: ${framework}
Areas: ${areas.join(", ")}
Additional instructions from consultant: ${instructions || "(none)"}

Selected findings to regenerate (must keep same IDs):
${JSON.stringify(selectedFindings, null, 2)}

Instructions:
1) Rewrite ONLY the provided findings and keep each original id unchanged.
2) Return improved, specific, evidence-oriented Spanish consulting language.
3) Keep structure: title, body, so_what, impact_estimate.
4) Body should be 140-280 words.
5) so_what should be 40-90 words.
6) impact_estimate should be quantified when possible; otherwise "Pendiente cuantificar".

Return only the regenerated findings in the schema.`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY no está configurada." }, { status: 503 });
  }

  const { id: diagnosticId } = await params;
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

  if (!profile || profile.role === "client") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as
    | { findingIds?: string[]; instructions?: string }
    | null;

  const findingIds = Array.isArray(body?.findingIds) ? body.findingIds.filter(Boolean) : [];
  const instructions = typeof body?.instructions === "string" ? body.instructions.trim() : "";

  if (!findingIds.length) {
    return NextResponse.json({ error: "Selecciona al menos un hallazgo para regenerar" }, { status: 400 });
  }

  const { data: diagnostic } = await supabase
    .from("diagnostics")
    .select("id, title, framework, areas, tenant_id")
    .eq("id", diagnosticId)
    .single();

  if (!diagnostic || diagnostic.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: "Diagnóstico no encontrado" }, { status: 404 });
  }

  const { data: selectedFindings } = await supabase
    .from("findings")
    .select("id, title, body, so_what, impact_estimate")
    .eq("diagnostic_id", diagnosticId)
    .in("id", findingIds);

  if (!selectedFindings?.length) {
    return NextResponse.json({ error: "No se encontraron hallazgos válidos para regenerar" }, { status: 400 });
  }

  try {
    const { object } = await generateObject({
      model: anthropic("claude-3-5-sonnet-20241022"),
      schema: RegeneratedFindingsSchema,
      prompt: buildRegenerationPrompt({
        framework: diagnostic.framework as string,
        areas: Array.isArray(diagnostic.areas) ? (diagnostic.areas as string[]) : [],
        diagnosticTitle: diagnostic.title as string,
        instructions,
        selectedFindings,
      }),
      temperature: 0.25,
    });

    for (const finding of object.findings) {
      await supabase
        .from("findings")
        .update({
          title: finding.title,
          body: finding.body,
          so_what: finding.so_what,
          impact_estimate: finding.impact_estimate,
          status: "draft",
          updated_at: new Date().toISOString(),
        })
        .eq("id", finding.id)
        .eq("diagnostic_id", diagnosticId);
    }

    return NextResponse.json({ ok: true, updatedCount: object.findings.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `No se pudo regenerar: ${message}` }, { status: 500 });
  }
}
