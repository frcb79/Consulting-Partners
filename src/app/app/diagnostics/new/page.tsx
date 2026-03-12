import Link from "next/link";
import { redirect } from "next/navigation";
import { createDiagnosticRun } from "../../actions";
import { createClient } from "@/lib/supabase/server";

const FRAMEWORKS = ["MECE", "Full Potential", "McKinsey 7S", "Porter 5 Fuerzas", "BMC", "Custom"];
const AREAS = ["Finanzas", "Operaciones", "Comercial", "Organizacion", "Tecnologia", "Talento"];

type NewDiagnosticPageProps = {
  searchParams?: Promise<{
    clientId?: string;
  }>;
};

export default async function NewDiagnosticPage({ searchParams }: NewDiagnosticPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const preselectedClientId = resolvedSearchParams?.clientId ?? "";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, status")
    .order("name", { ascending: true });

  const { data: documents } = await supabase
    .from("documents")
    .select("id, client_id, name, category, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <Link href="/app" className="text-sm text-cyan-300 transition hover:text-cyan-200">
            ← Volver al workspace
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-cyan-400">Nuevo diagnostico</p>
          <h1 className="mt-3 text-3xl font-semibold">Configuracion de analisis</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Flujo base de diagnostico con persistencia real de configuracion, documentos y hallazgos.
          </p>
        </div>

        <form action={createDiagnosticRun} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Paso 1 · Configuracion</h2>
              <select
                name="clientId"
                defaultValue={preselectedClientId}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                required
              >
                <option value="">Selecciona un cliente</option>
                {clients?.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} · {client.status}
                  </option>
                ))}
              </select>
              <input
                name="title"
                required
                placeholder="Titulo del diagnostico"
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
              />
              <input
                name="analysisType"
                placeholder="Tipo de analisis"
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
              />
              <div className="grid gap-3 md:grid-cols-2">
                {FRAMEWORKS.map((framework) => (
                  <label
                    key={framework}
                    className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300"
                  >
                    <input type="radio" name="framework" value={framework} defaultChecked={framework === "MECE"} />
                    <span>{framework}</span>
                  </label>
                ))}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {AREAS.map((area) => (
                  <label
                    key={area}
                    className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300"
                  >
                    <input type="checkbox" name="areas" value={area} defaultChecked={area === "Finanzas" || area === "Operaciones"} />
                    <span>{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Paso 2 · Documentos</h2>
              <p className="text-sm text-slate-400">
                Selecciona documentos ya cargados para este diagnostico.
              </p>
              <div className="grid gap-3">
                {documents?.length ? (
                  documents.map((document) => (
                    <label
                      key={document.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300"
                    >
                      <div>
                        <p className="font-medium text-slate-100">{document.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{document.category ?? "Sin categoria"}</p>
                      </div>
                      <input type="checkbox" name="documentIds" value={document.id} defaultChecked={document.client_id === preselectedClientId} />
                    </label>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
                    No hay documentos cargados aun. Puedes subirlos desde el expediente del cliente.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Paso 3 · Config IA</h2>
              <textarea
                name="additionalContext"
                rows={5}
                placeholder="Informacion adicional para el diagnostico"
                className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
              />
              <div className="grid gap-3 md:grid-cols-3">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" name="validationMode" defaultChecked />
                  Validacion cruzada
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" name="turboMode" />
                  Modo turbo
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" name="webResearch" />
                  Busqueda web
                </label>
              </div>
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Nivel de detalle</span>
                <input type="range" min="1" max="5" name="detailLevel" defaultValue="3" />
              </label>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Estado actual</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Esta fase deja el motor con persistencia real de configuracion, documentos, hallazgos y flujo QC.
                La ejecucion con modelos externos se conecta en el siguiente bloque, cuando definamos proveedor y credenciales.
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
            >
              Crear diagnostico
            </button>
          </aside>
        </form>
      </section>
    </main>
  );
}