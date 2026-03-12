import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createRevenueEvent, updateRevenueEventStatus } from "../../../actions";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

type RevenueEvent = {
  id: string;
  stream: string;
  amount_mxn: number;
  status: string;
  recognized_at: string;
  notes: string | null;
  created_at: string;
};

const STREAM_LABELS: Record<string, string> = {
  diagnostico: "Diagnóstico",
  retainer: "Retainer",
  implementacion: "Implementación",
  licencia: "Licencia SaaS",
  success_fee: "Go-along Success Fee",
  otro: "Otro",
};

export default async function ClientRevenuePage({ params }: PageProps) {
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
    .select("id, name, status")
    .eq("id", id)
    .single();

  if (!client) {
    notFound();
  }

  const { data: events } = await supabase
    .from("revenue_events")
    .select("id, stream, amount_mxn, status, recognized_at, notes, created_at")
    .eq("client_id", id)
    .order("recognized_at", { ascending: false })
    .limit(100);

  const typedEvents = (events ?? []) as RevenueEvent[];

  const projected = typedEvents
    .filter((event) => event.status === "projected" || event.status === "invoiced")
    .reduce((sum, event) => sum + Number(event.amount_mxn ?? 0), 0);
  const collected = typedEvents
    .filter((event) => event.status === "collected")
    .reduce((sum, event) => sum + Number(event.amount_mxn ?? 0), 0);

  const byStream = new Map<string, number>();
  for (const event of typedEvents) {
    byStream.set(event.stream, (byStream.get(event.stream) ?? 0) + Number(event.amount_mxn ?? 0));
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <Link href={`/app/clients/${client.id}`} className="text-sm text-cyan-300 transition hover:text-cyan-200">
            ← Volver al expediente
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-cyan-400">Revenue Management</p>
          <h1 className="mt-3 text-3xl font-semibold">{client.name}</h1>
          <p className="mt-2 text-sm text-slate-400">Gestión de ingresos por stream para este cliente.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pipeline MXN</p>
              <p className="mt-2 text-2xl font-semibold text-amber-300">${projected.toLocaleString("es-MX")}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cobrado MXN</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">${collected.toLocaleString("es-MX")}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Eventos</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-300">{typedEvents.length}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Registrar ingreso</h2>
            <p className="mt-1 text-sm text-slate-400">Incluye diagnóstico, retainer, implementación, licencia y success fee.</p>
            <form action={createRevenueEvent} className="mt-4 grid gap-3">
              <input type="hidden" name="clientId" value={client.id} />
              <select
                name="stream"
                defaultValue="diagnostico"
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
              >
                <option value="diagnostico">Diagnóstico</option>
                <option value="retainer">Retainer</option>
                <option value="implementacion">Implementación</option>
                <option value="licencia">Licencia SaaS</option>
                <option value="success_fee">Go-along Success Fee</option>
                <option value="otro">Otro</option>
              </select>
              <input
                name="amountMxn"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="Monto MXN"
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  name="status"
                  defaultValue="projected"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                >
                  <option value="projected">Projected</option>
                  <option value="invoiced">Invoiced</option>
                  <option value="collected">Collected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input
                  type="date"
                  name="recognizedAt"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
              </div>
              <textarea
                name="notes"
                rows={3}
                placeholder="Notas del ingreso (alcance, contrato, hito de cobro, etc.)"
                className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
              />
              <button
                type="submit"
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
              >
                Guardar evento de revenue
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Por stream</h3>
              <div className="mt-3 space-y-2">
                {Array.from(byStream.entries()).length ? (
                  Array.from(byStream.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([stream, amount]) => (
                      <div key={stream} className="flex items-center justify-between rounded-xl border border-slate-800 px-3 py-2 text-sm">
                        <span className="text-slate-300">{STREAM_LABELS[stream] ?? stream}</span>
                        <span className="font-semibold text-slate-100">${amount.toLocaleString("es-MX")}</span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-slate-500">Sin eventos aún.</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Historial de revenue</h2>
            <div className="mt-4 space-y-3">
              {typedEvents.length ? (
                typedEvents.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-slate-100">{STREAM_LABELS[event.stream] ?? event.stream}</p>
                      <p className="text-sm font-semibold text-slate-100">${Number(event.amount_mxn).toLocaleString("es-MX")}</p>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                      {event.recognized_at} · {event.status}
                    </p>
                    {event.notes ? <p className="mt-2 text-sm text-slate-300">{event.notes}</p> : null}
                    <form action={updateRevenueEventStatus} className="mt-3 flex flex-wrap items-center gap-2">
                      <input type="hidden" name="revenueId" value={event.id} />
                      <input type="hidden" name="clientId" value={client.id} />
                      <select
                        name="status"
                        defaultValue={event.status}
                        className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs outline-none ring-cyan-400 focus:ring"
                      >
                        <option value="projected">Projected</option>
                        <option value="invoiced">Invoiced</option>
                        <option value="collected">Collected</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-700 px-2 py-1 text-xs transition hover:bg-slate-800"
                      >
                        Actualizar
                      </button>
                    </form>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
                  No hay eventos de revenue para este cliente.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
