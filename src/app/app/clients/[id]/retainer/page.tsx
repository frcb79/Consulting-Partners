import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  addKpiReading,
  createKpi,
  createRetainer,
  createRetainerSession,
} from "../../../actions";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

type Retainer = {
  id: string;
  name: string;
  status: string;
  monthly_fee: number | null;
  start_date: string | null;
  end_date: string | null;
  scope_summary: string | null;
};

type Kpi = {
  id: string;
  retainer_id: string | null;
  name: string;
  unit: string | null;
  baseline_value: number | null;
  target_value: number | null;
  direction: string;
  notes: string | null;
};

type KpiReading = {
  kpi_id: string;
  reading_date: string;
  value: number;
};

type RetainerSession = {
  id: string;
  retainer_id: string | null;
  session_date: string;
  title: string;
  summary: string | null;
  outcomes: string | null;
  risks: string | null;
  next_steps: string | null;
};

function toProgressPercent(kpi: Kpi, latestValue: number | null): number | null {
  if (latestValue === null || kpi.baseline_value === null || kpi.target_value === null) {
    return null;
  }

  const baseline = Number(kpi.baseline_value);
  const target = Number(kpi.target_value);
  const current = Number(latestValue);

  if (target === baseline) {
    return null;
  }

  let ratio: number;
  if (kpi.direction === "decrease") {
    ratio = (baseline - current) / (baseline - target);
  } else {
    ratio = (current - baseline) / (target - baseline);
  }

  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

export default async function ClientRetainerPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role === "client") {
    redirect("/app");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, industry, status")
    .eq("id", id)
    .single();

  if (!client) {
    notFound();
  }

  const [{ data: retainers }, { data: kpis }, { data: readings }, { data: sessions }] = await Promise.all([
    supabase
      .from("retainers")
      .select("id, name, status, monthly_fee, start_date, end_date, scope_summary")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("kpis")
      .select("id, retainer_id, name, unit, baseline_value, target_value, direction, notes")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("kpi_readings")
      .select("kpi_id, reading_date, value")
      .eq("client_id", id)
      .order("reading_date", { ascending: false })
      .limit(200),
    supabase
      .from("retainer_sessions")
      .select("id, retainer_id, session_date, title, summary, outcomes, risks, next_steps")
      .eq("client_id", id)
      .order("session_date", { ascending: false })
      .limit(30),
  ]);

  const typedRetainers = (retainers ?? []) as Retainer[];
  const typedKpis = (kpis ?? []) as Kpi[];
  const typedReadings = (readings ?? []) as KpiReading[];
  const typedSessions = (sessions ?? []) as RetainerSession[];

  const latestByKpi = new Map<string, number>();
  for (const reading of typedReadings) {
    if (!latestByKpi.has(reading.kpi_id)) {
      latestByKpi.set(reading.kpi_id, Number(reading.value));
    }
  }

  const activeRetainer = typedRetainers.find((retainer) => retainer.status === "active") ?? typedRetainers[0];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <Link href={`/app/clients/${client.id}`} className="text-sm text-cyan-300 transition hover:text-cyan-200">
            ← Volver al expediente
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-cyan-400">Retainer & KPI Monitor</p>
          <h1 className="mt-3 text-3xl font-semibold">{client.name}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {client.industry ?? "Sin industria"} · estado {client.status}
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Retainer activo</h2>
                  <p className="mt-1 text-sm text-slate-400">Control mensual, alcance y foco del servicio.</p>
                </div>
              </div>

              {activeRetainer ? (
                <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-medium text-slate-100">{activeRetainer.name}</p>
                    <span className="rounded-full border border-cyan-700/50 bg-cyan-950/40 px-3 py-1 text-xs uppercase tracking-[0.16em] text-cyan-300">
                      {activeRetainer.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">
                    Fee mensual: {activeRetainer.monthly_fee ? `$${activeRetainer.monthly_fee.toLocaleString("es-MX")}` : "No definida"}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Inicio: {activeRetainer.start_date ?? "No definido"} · Fin: {activeRetainer.end_date ?? "Sin fecha"}
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                    {activeRetainer.scope_summary ?? "Sin resumen de alcance."}
                  </p>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                  Aún no hay retainer activo. Crea uno en el panel derecho.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">KPI monitor</h2>
                  <p className="mt-1 text-sm text-slate-400">Seguimiento de evolución contra baseline y target.</p>
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{typedKpis.length} KPI</p>
              </div>

              <div className="mt-5 space-y-4">
                {typedKpis.length ? (
                  typedKpis.map((kpi) => {
                    const latest = latestByKpi.get(kpi.id) ?? null;
                    const progress = toProgressPercent(kpi, latest);

                    return (
                      <div key={kpi.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-medium text-slate-100">{kpi.name}</p>
                          <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-[0.15em] text-slate-400">
                            {kpi.direction}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-300">
                          Último valor: {latest !== null ? `${latest}${kpi.unit ? ` ${kpi.unit}` : ""}` : "Sin lecturas"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Baseline {kpi.baseline_value ?? "-"} · Target {kpi.target_value ?? "-"}
                        </p>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-cyan-500"
                            style={{ width: `${progress ?? 5}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Avance: {progress !== null ? `${progress}%` : "Pendiente definir baseline/target o lectura"}
                        </p>

                        <form action={addKpiReading} className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_1.2fr_auto]">
                          <input type="hidden" name="clientId" value={client.id} />
                          <input type="hidden" name="kpiId" value={kpi.id} />
                          <input
                            name="readingDate"
                            type="date"
                            defaultValue={new Date().toISOString().slice(0, 10)}
                            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                          />
                          <input
                            name="value"
                            type="number"
                            step="0.01"
                            placeholder="Valor"
                            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                          />
                          <input
                            name="note"
                            placeholder="Nota (opcional)"
                            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                          />
                          <button
                            type="submit"
                            className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
                          >
                            + Lectura
                          </button>
                        </form>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                    No hay KPIs configurados para este cliente.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Sesiones de retainer</h2>
              <p className="mt-1 text-sm text-slate-400">Bitácora de sesiones, acuerdos y riesgos.</p>

              <div className="mt-5 space-y-3">
                {typedSessions.length ? (
                  typedSessions.map((session) => (
                    <article key={session.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-medium text-slate-100">{session.title}</p>
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{session.session_date}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{session.summary ?? "Sin resumen"}</p>
                      {session.next_steps ? (
                        <p className="mt-2 text-xs text-cyan-300">Próximos pasos: {session.next_steps}</p>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                    Sin sesiones registradas.
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Nuevo retainer</h2>
              <form action={createRetainer} className="mt-4 grid gap-3">
                <input type="hidden" name="clientId" value={client.id} />
                <input
                  name="name"
                  placeholder="Retainer Transformación Comercial"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    name="status"
                    defaultValue="active"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <input
                    name="monthlyFee"
                    type="number"
                    step="0.01"
                    placeholder="Fee mensual"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="startDate"
                    type="date"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                  />
                  <input
                    name="endDate"
                    type="date"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                  />
                </div>
                <textarea
                  name="scopeSummary"
                  rows={4}
                  placeholder="Scope: foco de trabajo, entregables y límites del retainer"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                >
                  Crear retainer
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Nuevo KPI</h2>
              <form action={createKpi} className="mt-4 grid gap-3">
                <input type="hidden" name="clientId" value={client.id} />
                <select
                  name="retainerId"
                  defaultValue=""
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                >
                  <option value="">Sin retainer específico</option>
                  {typedRetainers.map((retainer) => (
                    <option key={retainer.id} value={retainer.id}>
                      {retainer.name}
                    </option>
                  ))}
                </select>
                <input
                  name="name"
                  placeholder="Margen bruto"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="unit"
                    placeholder="% / $ / días"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                  />
                  <select
                    name="direction"
                    defaultValue="increase"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                  >
                    <option value="increase">Increase</option>
                    <option value="decrease">Decrease</option>
                    <option value="maintain">Maintain</option>
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="baselineValue"
                    type="number"
                    step="0.01"
                    placeholder="Baseline"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                  />
                  <input
                    name="targetValue"
                    type="number"
                    step="0.01"
                    placeholder="Target"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                  />
                </div>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Contexto del KPI"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
                >
                  Crear KPI
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Nueva sesión</h2>
              <form action={createRetainerSession} className="mt-4 grid gap-3">
                <input type="hidden" name="clientId" value={client.id} />
                <select
                  name="retainerId"
                  defaultValue={activeRetainer?.id ?? ""}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                >
                  <option value="">Sin retainer específico</option>
                  {typedRetainers.map((retainer) => (
                    <option key={retainer.id} value={retainer.id}>
                      {retainer.name}
                    </option>
                  ))}
                </select>
                <input
                  name="sessionDate"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <input
                  name="title"
                  placeholder="Weekly steering"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <textarea
                  name="summary"
                  rows={3}
                  placeholder="Resumen ejecutivo"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <textarea
                  name="outcomes"
                  rows={2}
                  placeholder="Acuerdos"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <textarea
                  name="risks"
                  rows={2}
                  placeholder="Riesgos"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <textarea
                  name="nextSteps"
                  rows={2}
                  placeholder="Próximos pasos"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
                >
                  Guardar sesión
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
