import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { addManualFinding, saveFinding, updateDiagnosticStatus } from "../../actions";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <Link href={`/app/clients/${diagnosticClient.id}`} className="text-sm text-cyan-300 transition hover:text-cyan-200">
            ← Volver al expediente
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-cyan-400">Diagnostico</p>
          <h1 className="mt-3 text-3xl font-semibold">{diagnostic.title}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {diagnosticClient.name} · {diagnostic.framework} · estado {diagnostic.status}
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
                    Aun no hay hallazgos. Agrega uno manual para iniciar la revision.
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Procesamiento</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">1. Configuracion guardada</div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">2. Documentos asociados</div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">3. QC listo para edicion</div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                El pipeline IA externo se conecta sobre esta estructura. Por ahora el diagnostico ya persiste configuracion, fuentes y hallazgos para revision manual.
              </p>
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