import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { PDFParse, VerbosityLevel } from "pdf-parse";

export const maxDuration = 300;

const FindingsSchema = z.object({
  findings: z
    .array(
      z.object({
        title: z.string().describe("Finding title, 6-10 words, action-oriented, in Spanish"),
        body: z
          .string()
          .describe("Evidence-based analysis in Spanish, 150-350 words, references document data when available"),
        so_what: z
          .string()
          .describe("Executive implication in Spanish, 50-100 words — what decision or action does this enable?"),
        impact_estimate: z
          .string()
          .describe(
            "Quantified impact in Spanish: € range, % improvement, or time savings. Write 'Pendiente cuantificar' only if truly impossible."
          ),
        area: z.string().describe("The analysis area this finding belongs to (from the provided list)"),
      })
    )
    .min(3)
    .max(12),
});

  type FindingDraft = z.infer<typeof FindingsSchema>["findings"][number];

type DocumentText = { name: string; category: string; text: string };
type ClientInfo = {
  name: string;
  industry?: string | null;
  strategic_context?: string | null;
};

const PRIMARY_MODEL = "claude-3-5-sonnet-20241022";
const VALIDATION_MODEL = "gpt-4o";

const STEP_LABELS: Record<number, string> = {
  1: "Inicializando diagnóstico",
  2: "Cargando documentos asociados",
  3: "Extrayendo texto de fuentes",
  4: "Generando hallazgos con IA",
  5: "Validación cruzada",
  6: "Persistiendo hallazgos",
  7: "Completado",
};

const FRAMEWORK_NOTES: Record<string, string> = {
  MECE: "Structure findings so they are Mutually Exclusive and Collectively Exhaustive — no overlap, full coverage of critical areas",
  "Full Potential": "Identify the full performance potential vs current state, sized by business impact",
  "McKinsey 7S": "Assess the 7 levers: Strategy, Structure, Systems, Shared values, Skills, Style, Staff",
  "Porter 5 Fuerzas":
    "Analyze competitive forces: rivalry intensity, buyer power, supplier power, new entrant threat, substitutes",
  BMC: "Evaluate Business Model Canvas blocks: value proposition, channels, customer segments, revenue streams, key activities, key resources, key partners, cost structure",
  Custom: "Use a pragmatic, framework-agnostic approach based on evidence found in the documents",
};

const DETAIL_NOTES = [
  "Brief overview only",
  "Concise with key points",
  "Standard consulting depth (recommended)",
  "Detailed with supporting data and quotes",
  "Maximum depth with full evidence chain",
];

function buildPrompt(params: {
  title: string;
  framework: string;
  areas: string[];
  additionalContext: string;
  detailLevel: number;
  client: ClientInfo | null;
  documents: DocumentText[];
}): string {
  const { title, framework, areas, additionalContext, detailLevel, client, documents } = params;

  const frameworkNote = FRAMEWORK_NOTES[framework] ?? framework;
  const detailNote = DETAIL_NOTES[Math.max(0, Math.min(4, detailLevel - 1))];
  const wordCount = detailLevel >= 4 ? "250-400" : "150-250";

  const docSection = documents.length
    ? documents.map((d) => `### Document: "${d.name}" [${d.category}]\n${d.text.slice(0, 7000)}`).join("\n\n---\n\n")
    : "(No documents provided — base analysis on client context, stated areas, and your consulting expertise)";

  return `You are a senior consultant at a top-tier management consulting firm (McKinsey / BCG / Bain level). \
Your task is to produce a structured business diagnostic report ENTIRELY IN SPANISH.

## Client
Name: ${client?.name ?? "Unknown"}
Industry: ${client?.industry ?? "Not specified"}
Strategic context: ${client?.strategic_context ?? "Not provided"}

## Assignment
Title: ${title}
Framework: ${framework} — ${frameworkNote}
Areas to analyze: ${areas.join(", ")}
Detail level: ${detailLevel}/5 (${detailNote})
${additionalContext ? `\nAdditional context from the consultant: ${additionalContext}` : ""}

## Source Documents
${docSection}

## Instructions
Produce between 4 and 8 hallazgos (findings). Requirements per finding:

1. **title**: 6-10 words, action-oriented verb in Spanish (e.g., "Optimizar la estructura de costos fijos para liberar margen")
2. **body**: ${wordCount} words of evidence-based analysis. Reference specific data, figures, and quotes from documents when available. Use the ${framework} lens.
3. **so_what**: 50-100 words. Executive implication — what specific decision or action does this finding demand from leadership?
4. **impact_estimate**: Quantify in Spanish (e.g., "€400K–€900K de ahorro anual en OPEX al consolidar proveedores" or "Reducción del 25–35% en tiempo de ciclo"). Use "Pendiente cuantificar" only as a last resort.
5. **area**: Must be one of: ${areas.join(", ")}

Prioritize findings by potential business impact (highest first). Write everything in Spanish. Be specific, not generic.`;
}

function buildCrossValidationPrompt(params: {
  framework: string;
  areas: string[];
  originalFindings: FindingDraft[];
}) {
  const { framework, areas, originalFindings } = params;

  return `You are a cross-validation reviewer for management consulting diagnostics.
You must review and improve findings generated by another model.

Framework: ${framework}
Allowed areas: ${areas.join(", ")}

Original findings JSON:
${JSON.stringify(originalFindings, null, 2)}

Rules:
1) Keep the same number of findings.
2) Preserve business meaning, but improve precision, evidence quality, and executive clarity.
3) Ensure each finding has: title, body, so_what, impact_estimate, and area.
4) Keep all output in Spanish.
5) area must be one of: ${areas.join(", ")}.
6) Remove vagueness and generic claims.

Return ONLY the corrected findings in the required schema.`;
}

function estimateTokensFromText(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

function estimateCostUsd(params: {
  model: "claude" | "gpt-4o";
  inputTokens: number;
  outputTokens: number;
}) {
  const { model, inputTokens, outputTokens } = params;
  const pricing =
    model === "claude"
      ? { inPerMillion: 3, outPerMillion: 15 }
      : { inPerMillion: 5, outPerMillion: 15 };

  const inputCost = (inputTokens / 1_000_000) * pricing.inPerMillion;
  const outputCost = (outputTokens / 1_000_000) * pricing.outPerMillion;
  return Number((inputCost + outputCost).toFixed(6));
}

async function updateProgress(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  diagnosticId: string;
  step: number;
  extra?: Record<string, unknown>;
}) {
  const { supabase, diagnosticId, step, extra } = params;

  await supabase
    .from("diagnostics")
    .update({
      processing_step: step,
      processing_step_label: STEP_LABELS[step] ?? "Procesando",
      updated_at: new Date().toISOString(),
      ...extra,
    })
    .eq("id", diagnosticId);
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY no está configurada. Agrega la variable de entorno en .env.local y reinicia el servidor.",
      },
      { status: 503 }
    );
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

  const { data: diagnostic } = await supabase
    .from("diagnostics")
    .select(
      "id, title, framework, areas, additional_context, detail_level, validation_mode, tenant_id, status, clients(id, name, industry, strategic_context)"
    )
    .eq("id", diagnosticId)
    .single();

  if (!diagnostic) {
    return NextResponse.json({ error: "Diagnóstico no encontrado" }, { status: 404 });
  }

  if (diagnostic.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  if (diagnostic.status === "completed") {
    return NextResponse.json({ error: "Este diagnóstico ya está completado y no se puede re-ejecutar" }, { status: 400 });
  }

  await supabase
    .from("diagnostics")
    .update({
      status: "processing",
      processing_started_at: new Date().toISOString(),
      processed_at: null,
      processing_error: null,
      input_tokens: 0,
      output_tokens: 0,
      estimated_cost_usd: 0,
      primary_model: PRIMARY_MODEL,
      validation_model: null,
    })
    .eq("id", diagnosticId);

  await updateProgress({ supabase, diagnosticId, step: 1 });

  // Fetch linked documents
  await updateProgress({ supabase, diagnosticId, step: 2 });
  const { data: docLinks } = await supabase
    .from("diagnostic_documents")
    .select("documents(id, name, category, storage_path, mime_type)")
    .eq("diagnostic_id", diagnosticId);

  // Extract text from PDF and plain-text documents
  await updateProgress({ supabase, diagnosticId, step: 3 });
  const documentTexts: DocumentText[] = [];

  for (const link of docLinks ?? []) {
    const doc = Array.isArray(link.documents) ? link.documents[0] : link.documents;
    if (!doc?.storage_path) continue;

    try {
      const { data: fileData } = await supabase.storage.from("client-documents").download(doc.storage_path);

      if (!fileData) continue;

      const mimeType = (doc.mime_type ?? "").toLowerCase();

      if (mimeType.includes("pdf") || doc.storage_path.toLowerCase().endsWith(".pdf")) {
        const buffer = Buffer.from(await fileData.arrayBuffer());
        const parser = new PDFParse({ data: buffer, verbosity: VerbosityLevel.ERRORS });
        const textResult = await parser.getText();
        await parser.destroy();
        const text = textResult.text.replace(/\s+/g, " ").trim();
        if (text.length > 50) {
          documentTexts.push({ name: doc.name, category: doc.category ?? "general", text });
        }
      } else if (mimeType.includes("text") || mimeType.includes("plain")) {
        const text = (await fileData.text()).trim();
        if (text.length > 50) {
          documentTexts.push({ name: doc.name, category: doc.category ?? "general", text });
        }
      }
    } catch {
      // Skip unreadable documents and continue with the rest
    }
  }

  const clientRaw = diagnostic.clients;
  const clientInfo: ClientInfo | null = Array.isArray(clientRaw) ? (clientRaw[0] as ClientInfo) ?? null : (clientRaw as ClientInfo) ?? null;
  const areas = Array.isArray(diagnostic.areas) ? (diagnostic.areas as string[]) : [];

  const prompt = buildPrompt({
    title: diagnostic.title as string,
    framework: diagnostic.framework as string,
    areas,
    additionalContext: (diagnostic.additional_context as string | null) ?? "",
    detailLevel: typeof diagnostic.detail_level === "number" ? diagnostic.detail_level : 3,
    client: clientInfo,
    documents: documentTexts,
  });

  try {
    await updateProgress({ supabase, diagnosticId, step: 4 });

    const { object } = await generateObject({
      model: anthropic(PRIMARY_MODEL),
      schema: FindingsSchema,
      prompt,
      temperature: 0.3,
    });

    const promptInputTokens = estimateTokensFromText(prompt);
    const claudeOutputText = JSON.stringify(object.findings);
    const claudeOutputTokens = estimateTokensFromText(claudeOutputText);
    let totalInputTokens = promptInputTokens;
    let totalOutputTokens = claudeOutputTokens;
    let totalCostUsd = estimateCostUsd({
      model: "claude",
      inputTokens: promptInputTokens,
      outputTokens: claudeOutputTokens,
    });

    await supabase
      .from("diagnostics")
      .update({
        input_tokens: totalInputTokens,
        output_tokens: totalOutputTokens,
        estimated_cost_usd: totalCostUsd,
      })
      .eq("id", diagnosticId);

    let finalFindings = object.findings;
    let validationModel: string | null = null;

    await updateProgress({ supabase, diagnosticId, step: 5 });

    if (diagnostic.validation_mode && process.env.OPENAI_API_KEY) {
      const crossValidationPrompt = buildCrossValidationPrompt({
        framework: diagnostic.framework as string,
        areas,
        originalFindings: object.findings,
      });

      const { object: validatedObject } = await generateObject({
        model: openai(VALIDATION_MODEL),
        schema: FindingsSchema,
        prompt: crossValidationPrompt,
        temperature: 0.2,
      });

      finalFindings = validatedObject.findings;
      validationModel = VALIDATION_MODEL;

      const validationInputTokens = estimateTokensFromText(crossValidationPrompt);
      const validationOutputTokens = estimateTokensFromText(JSON.stringify(validatedObject.findings));

      totalInputTokens += validationInputTokens;
      totalOutputTokens += validationOutputTokens;
      totalCostUsd += estimateCostUsd({
        model: "gpt-4o",
        inputTokens: validationInputTokens,
        outputTokens: validationOutputTokens,
      });

      await supabase
        .from("diagnostics")
        .update({
          input_tokens: totalInputTokens,
          output_tokens: totalOutputTokens,
          estimated_cost_usd: Number(totalCostUsd.toFixed(6)),
          validation_model: VALIDATION_MODEL,
        })
        .eq("id", diagnosticId);
    }

    // Remove any existing placeholder findings before inserting real ones
    await updateProgress({ supabase, diagnosticId, step: 6 });
    await supabase.from("findings").delete().eq("diagnostic_id", diagnosticId);

    await supabase.from("findings").insert(
      finalFindings.map((f, index) => ({
        diagnostic_id: diagnosticId,
        title: f.title,
        body: f.body,
        so_what: f.so_what,
        impact_estimate: f.impact_estimate,
        status: "draft",
        display_order: index,
      }))
    );

    await supabase
      .from("diagnostics")
      .update({
        status: "qc",
        processed_at: new Date().toISOString(),
        processing_step: 7,
        processing_step_label: STEP_LABELS[7],
        input_tokens: totalInputTokens,
        output_tokens: totalOutputTokens,
        estimated_cost_usd: Number(totalCostUsd.toFixed(6)),
      })
      .eq("id", diagnosticId);

    return NextResponse.json({
      ok: true,
      findingsCount: finalFindings.length,
      crossValidated: validationModel === "gpt-4o",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    await supabase
      .from("diagnostics")
      .update({
        status: "failed",
        processing_error: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", diagnosticId);
    return NextResponse.json({ error: `Error en pipeline IA: ${message}` }, { status: 500 });
  }
}
