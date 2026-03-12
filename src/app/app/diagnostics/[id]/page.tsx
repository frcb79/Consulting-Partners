import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { addManualFinding, saveFinding, updateDiagnosticStatus } from "../../actions";
import { createClient } from "@/lib/supabase/server";
import ExecuteButton from "./ExecuteButton";

type DiagnosticDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type DiagnosticClient = {
  id: string;
  name: string;
};

type DiagnosticDocumentEntry = {
  documents:
    | {
        id: string;
        name: string;
        category: string | null;
      }[]
    | {
        id: string;
        name: string;
        category: string | null;
      }
    | null;
};

type Finding = {
  id: string;
  title: string;
  body: string;
  so_what: string | null;
  impact_estimate: string | null;
  status: string;
  display_order: number;
};

export default async function DiagnosticDetailPage({ params }: DiagnosticDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: diagnostic } = await supabase
    .from("diagnostics")
    .select("id, title, analysis_type, framework, areas, additional_context, validation_mode, turbo_mode, web_research, detail_level, status, created_at, processed_at, clients(id, name)")
    .eq("id", id)
    .single();

  if (!diagnostic) {
    notFound();
  }

  const diagnosticClient = Array.isArray(diagnostic.clients)
    ? (diagnostic.clients[0] as DiagnosticClient | undefined)
    : (diagnostic.clients as DiagnosticClient | undefined);

  if (!diagnosticClient) {
    notFound();
  }

  const { data: selectedDocuments } = await supabase
    .from("diagnostic_documents")
    .select("documents(id, name, category)")
    .eq("diagnostic_id", id);

  const typedSelectedDocuments = (selectedDocuments ?? []) as DiagnosticDocumentEntry[];

  const { data: findings } = await supabase
    .from("findings")
    .select("id, title, body, so_what, impact_estimate, status, display_order")
    .eq("diagnostic_id", id)
    .order("display_order", { ascending: true });

  const typedFindings = (findings ?? []) as Finding[];
  const validatedCount = typedFindings.filter((finding) => finding.status === "validated").length;
  const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const isPending = diagnostic.status === "pending" || diagnostic.status === "failed";
  const isProcessing = diagnostic.status === "processing";

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href={`/app/clients/${diagnosticClient.id}`} className="text-sm text-cyan-300 transition hover:text-cyan-200">
              ← Volver al expediente
            </Link>
            <a
              href={`/api/diagnostics/${diagnostic.id}/report`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-slate-300 transition hover:bg-slate-800"
            >
              Exportar PDF
            </a>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-cyan-400">Diagnostico</p>
          <h1 className="mt-3 text-3xl font-semibold">{diagnostic.title}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {diagnosticClient.name} · {diagnostic.framework} ·{" "}
            <span
              className={
                diagnostic.status === "qc" || diagnostic.status === "completed"
                  ? "text-emerald-400"
                  : diagnostic.status === "failed"
                  ? "text-red-400"
                  : diagnostic.status === "processing"
                  ? "text-cyan-400"
                  : "text-amber-400"
              }
            >
              {diagnostic.status}
            </span>
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Framework</p>
              <p className="mt-2 text-lg font-medium text-slate-100">{diagnostic.framework}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Areas</p>
              <p className="mt-2 text-lg font-medium text-slate-100">{diagnostic.areas.length || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Hallazgos</p>
              <p className="mt-2 text-lg font-medium text-slate-100">{typedFindings.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Validados</p>
              <p className="mt-2 text-lg font-medium text-slate-100">{validatedCount}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            {(isPending || isProcessing) && (
              <div className="rounded-3xl border border-cyan-900/60 bg-cyan-950/20 p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-400">
                  {isProcessing ? "Procesando…" : "Listo para ejecutar"}
                </p>
                <h2 className="mt-2 text-lg font-semibold">
                  {isProcessing
                    ? "El análisis IA está en curso"
                    : "Ejecuta el análisis IA para generar hallazgos"}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {isProcessing
                    ? "Claude Sonnet está procesando los documentos y construyendo los hallazgos. Actualiza la página en unos momentos."
                    : "El diagnóstico está configurado. Pulsa el botón para que Claude Sonnet analice los documentos y genere los hallazgos automáticamente."}
                </p>
                {!isProcessing && (
                  <div className="mt-5">
                    <ExecuteButton
                      diagnosticId={diagnostic.id}
                      hasApiKey={hasApiKey}
                      currentStatus={diagnostic.status}
                    />
                  </div>
                )}
                {isProcessing && (
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-cyan-500" />
                  </div>
                )}
              </div>
            )}

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">QC de hallazgos</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Edita, valida o rechaza hallazgos. Tambien puedes agregar manuales.
                  </p>
                </div>
                <form action={addManualFinding}>
                  <input type="hidden" name="diagnosticId" value={diagnostic.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
                  >
                    Agregar manual
                  </button>
                </form>
              </div>

              <div className="mt-6 space-y-4">
                {typedFindings.length ? (
                  typedFindings.map((finding) => (
                    <form key={finding.id} action={saveFinding} className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <input type="hidden" name="findingId" value={finding.id} />
                      <input type="hidden" name="diagnosticId" value={diagnostic.id} />
                      <input
                        name="title"
                        defaultValue={finding.title}
                        className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                      />
                      <textarea
                        name="body"
                        rows={4}
                        defaultValue={finding.body}
                        className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                      />
                      <textarea
                        name="soWhat"
                        rows={3}
                        defaultValue={finding.so_what ?? ""}
                        className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                      />
                      <div className="grid gap-3 md:grid-cols-[1fr_180px_160px]">
                        <input
                          name="impactEstimate"
                          defaultValue={finding.impact_estimate ?? ""}
                          placeholder="Impacto estimado"
                          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                        />
                        <select
                          name="status"
                          defaultValue={finding.status}
                          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                        >
                          <option value="draft">Draft</option>
                          <option value="validated">Validated</option>
                          <option value="rejected">Rejected</option>
                          <option value="manual">Manual</option>
                        </select>
                        <button
                          type="submit"
                          className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                        >
                          Guardar
                        </button>
                      </div>
                    </form>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                    {isPending || isProcessing
                      ? "Los hallazgos aparecerán aquí una vez que se complete el análisis IA."
                      : "Aún no hay hallazgos. Agrega uno manual o ejecuta el análisis IA."}
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Procesamiento</h2>
              <div className="mt-4 space-y-2 text-sm">
                {[
                  { label: "1. Configuración guardada", done: true },
                  {
                    label: "2. Documentos asociados",
                    done: typedSelectedDocuments.length > 0,
                    note: typedSelectedDocuments.length === 0 ? "(sin documentos — análisis por contexto)" : undefined,
                  },
                  {
                    label: "3. Análisis IA ejecutado",
                    done: diagnostic.status === "qc" || diagnostic.status === "completed",
                    inProgress: diagnostic.status === "processing",
                  },
                  {
                    label: "4. QC de hallazgos",
                    done: diagnostic.status === "completed",
                    inProgress: diagnostic.status === "qc",
                  },
                ].map((step, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl border px-4 py-3 ${
                      step.done
                        ? "border-emerald-800/60 bg-emerald-950/20 text-emerald-300"
                        : step.inProgress
                        ? "border-cyan-800/60 bg-cyan-950/20 text-cyan-300"
                        : "border-slate-800 bg-slate-950/70 text-slate-500"
                    }`}
                  >
                    {step.label}
                    {step.note && <span className="ml-1 text-xs opacity-70">{step.note}</span>}
                    {step.inProgress && <span className="ml-2 animate-pulse text-xs">…</span>}
                  </div>
                ))}
              </div>
              {isPending && (
                <div className="mt-4">
                  <ExecuteButton
                    diagnosticId={diagnostic.id}
                    hasApiKey={hasApiKey}
                    currentStatus={diagnostic.status}
                  />
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Documentos fuente</h2>
              <div className="mt-4 space-y-3">
                {typedSelectedDocuments.length ? (
                  typedSelectedDocuments.map((entry, index) => (
                    <div key={index} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                      <p className="font-medium text-slate-100">
                        {(Array.isArray(entry.documents) ? entry.documents[0]?.name : entry.documents?.name) ?? "Documento"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {(Array.isArray(entry.documents)
                          ? entry.documents[0]?.category
                          : entry.documents?.category) ?? "Sin categoria"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
                    Este diagnostico no tiene documentos asociados.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Cerrar diagnostico</h2>
              <form action={updateDiagnosticStatus} className="mt-4 grid gap-3">
                <input type="hidden" name="diagnosticId" value={diagnostic.id} />
                <select
                  name="status"
                  defaultValue={diagnostic.status}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                >
                  <option value="draft">Draft</option>
                  <option value="qc">QC</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
                <button
                  type="submit"
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
                >
                  Actualizar estado
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}