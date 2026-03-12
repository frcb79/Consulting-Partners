import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAppProfile } from "@/lib/auth/profile";

type PortalDocument = {
  id: string;
  name: string;
  bucket_id: string;
  storage_path: string;
  category: string | null;
  mime_type: string | null;
  visible_in_portal: boolean;
  created_at: string;
};

type PortalReport = {
  id: string;
  title: string;
  framework: string;
  status: string;
  processed_at: string | null;
  created_at: string;
};

type ReportView = {
  diagnostic_id: string;
};

type Kpi = {
  id: string;
  name: string;
  unit: string | null;
  baseline_value: number | null;
  target_value: number | null;
  direction: string;
};

type KpiReading = {
  kpi_id: string;
  value: number;
  reading_date: string;
};

type RetainerSession = {
  next_steps: string | null;
  session_date: string;
};

function toProgress(kpi: Kpi, value: number | null): number | null {
  if (value === null || kpi.baseline_value === null || kpi.target_value === null) {
    return null;
  }

  const baseline = Number(kpi.baseline_value);
  const target = Number(kpi.target_value);
  const current = Number(value);

  if (target === baseline) {
    return null;
  }

  const ratio =
    kpi.direction === "decrease"
      ? (baseline - current) / (baseline - target)
      : (current - baseline) / (target - baseline);

  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

function trafficColor(progress: number | null) {
  if (progress === null) return "text-slate-400";
  if (progress >= 75) return "text-emerald-300";
  if (progress >= 40) return "text-amber-300";
  return "text-red-300";
}

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/portal");
  }

  const profile = await getAppProfile(supabase, user);

  if (!profile || profile.role !== "client" || !profile.client_id) {
    redirect("/app");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, industry, status, strategic_context")
    .eq("id", profile.client_id)
    .single();

  if (!client) {
    redirect("/login");
  }

  const [{ data: documents }, { data: reports }, { data: reportViews }, { data: kpis }, { data: readings }, { data: sessions }] =
    await Promise.all([
      supabase
        .from("documents")
        .select("id, name, bucket_id, storage_path, category, mime_type, visible_in_portal, created_at")
        .eq("client_id", profile.client_id)
        .eq("visible_in_portal", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("diagnostics")
        .select("id, title, framework, status, processed_at, created_at")
        .eq("client_id", profile.client_id)
        .in("status", ["qc", "completed"])
        .order("processed_at", { ascending: false })
        .limit(12),
      supabase
        .from("client_report_views")
        .select("diagnostic_id")
        .eq("client_user_id", user.id),
      supabase
        .from("kpis")
        .select("id, name, unit, baseline_value, target_value, direction")
        .eq("client_id", profile.client_id)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("kpi_readings")
        .select("kpi_id, value, reading_date")
        .eq("client_id", profile.client_id)
        .order("reading_date", { ascending: false })
        .limit(120),
      supabase
        .from("retainer_sessions")
        .select("next_steps, session_date")
        .eq("client_id", profile.client_id)
        .order("session_date", { ascending: false })
        .limit(5),
    ]);

  const typedDocuments = (documents ?? []) as PortalDocument[];
  const typedReports = (reports ?? []) as PortalReport[];
  const typedViews = (reportViews ?? []) as ReportView[];
  const typedKpis = (kpis ?? []) as Kpi[];
  const typedReadings = (readings ?? []) as KpiReading[];
  const typedSessions = (sessions ?? []) as RetainerSession[];

  const viewedSet = new Set(typedViews.map((view) => view.diagnostic_id));

  const latestByKpi = new Map<string, number>();
  for (const reading of typedReadings) {
    if (!latestByKpi.has(reading.kpi_id)) {
      latestByKpi.set(reading.kpi_id, Number(reading.value));
    }
  }

  const pendingActionItems = typedSessions
    .flatMap((session) => (session.next_steps ? session.next_steps.split("\n") : []))
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6);

  const signedUrls = typedDocuments.length
    ? await Promise.all(
        typedDocuments.map(async (document) => {
          const { data } = await supabase.storage
            .from(document.bucket_id)
            .createSignedUrl(document.storage_path, 60 * 60);

          return [document.id, data?.signedUrl ?? null] as const;
        })
      )
    : [];

  const signedUrlMap = new Map(signedUrls);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">Portal del cliente</p>
          <h1 className="mt-3 text-3xl font-semibold">{client.name}</h1>
          <p className="mt-2 text-slate-300">Bienvenido{profile.full_name ? `, ${profile.full_name}` : ""}.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estado</p>
              <p className="mt-2 text-lg font-medium text-slate-100">{client.status}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Industria</p>
              <p className="mt-2 text-lg font-medium text-slate-100">{client.industry ?? "Sin industria"}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reportes</p>
              <p className="mt-2 text-lg font-medium text-slate-100">{typedReports.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Documentos visibles</p>
              <p className="mt-2 text-lg font-medium text-slate-100">{typedDocuments.length}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Mis reportes</h2>
              <p className="mt-1 text-sm text-slate-400">Reportes generados por tu consultor. Puedes abrir o descargar PDF.</p>

              <div className="mt-5 space-y-3">
                {typedReports.length ? (
                  typedReports.map((report) => {
                    const isNew = !viewedSet.has(report.id);
                    return (
                      <a
                        key={report.id}
                        href={`/api/diagnostics/${report.id}/report`}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:bg-slate-900"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium text-slate-100">{report.title}</p>
                          {isNew ? (
                            <span className="rounded-full border border-emerald-700/60 bg-emerald-950/30 px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] text-emerald-300">
                              Nuevo
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{report.framework} · estado {report.status}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                          {new Date(report.processed_at ?? report.created_at).toLocaleDateString("es-MX")}
                        </p>
                      </a>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                    Aún no hay reportes disponibles.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Mis documentos</h2>
              <p className="mt-1 text-sm text-slate-400">Solo se muestran los archivos compartidos por el consultor.</p>

              <div className="mt-6 space-y-3">
                {typedDocuments.length ? (
                  typedDocuments.map((document) => {
                    const signedUrl = signedUrlMap.get(document.id);

                    return (
                      <div key={document.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-medium text-slate-100">{document.name}</p>
                            <p className="mt-1 text-sm text-slate-400">
                              {document.category ?? "Sin categoria"} · {document.mime_type ?? "tipo no detectado"}
                            </p>
                          </div>
                          {signedUrl ? (
                            <a
                              href={signedUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-slate-700 px-4 py-2 text-center text-sm transition hover:bg-slate-800"
                            >
                              Abrir
                            </a>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                    Aun no hay documentos visibles para tu portal.
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Estado del retainer</h2>
              <p className="mt-2 text-sm text-slate-400">Semáforo de KPIs según avance vs baseline y meta.</p>

              <div className="mt-4 space-y-3">
                {typedKpis.length ? (
                  typedKpis.map((kpi) => {
                    const latest = latestByKpi.get(kpi.id) ?? null;
                    const progress = toProgress(kpi, latest);
                    return (
                      <div key={kpi.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-slate-100">{kpi.name}</p>
                          <span className={`text-xs uppercase tracking-[0.16em] ${trafficColor(progress)}`}>
                            {progress === null ? "sin dato" : progress >= 75 ? "verde" : progress >= 40 ? "amarillo" : "rojo"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-300">
                          Actual: {latest !== null ? `${latest}${kpi.unit ? ` ${kpi.unit}` : ""}` : "Sin lectura"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Baseline {kpi.baseline_value ?? "-"} · Meta {kpi.target_value ?? "-"}
                        </p>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-cyan-500" style={{ width: `${progress ?? 4}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
                    Aún no hay KPIs disponibles para mostrar.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Action items</h2>
              <p className="mt-2 text-sm text-slate-400">Pendientes recientes compartidos en sesiones.</p>
              <div className="mt-4 space-y-2">
                {pendingActionItems.length ? (
                  pendingActionItems.map((item, index) => (
                    <div key={`${item}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
                      {item}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-400">
                    Sin action items pendientes.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Resumen</h2>
              <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
                {client.strategic_context ?? "Tu consultor compartira aqui el contexto relevante del proyecto."}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Acceso</h2>
              <p className="mt-2 text-sm text-slate-400">
                Este portal es de solo lectura y solo muestra la informacion compartida por Consulting Partners.
              </p>
              <Link href="/login" className="mt-4 inline-flex text-sm text-cyan-300 transition hover:text-cyan-200">
                Volver a login
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
