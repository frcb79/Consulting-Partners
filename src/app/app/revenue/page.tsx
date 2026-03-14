import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type RevenueEvent = {
  id: string;
  stream: string;
  amount_mxn: number;
  status: string;
  recognized_at: string;
  client_id: string;
  clients: { name: string }[] | { name: string } | null;
};

const STREAM_LABELS: Record<string, string> = {
  diagnostico: "Diagnostico",
  retainer: "Retainer",
  implementacion: "Implementacion",
  licencia: "Licencia",
  success_fee: "Success Fee",
  otro: "Otro",
};

export default async function GlobalRevenuePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: revenueEvents } = await supabase
    .from("revenue_events")
    .select("id, stream, amount_mxn, status, recognized_at, client_id, clients(name)")
    .order("recognized_at", { ascending: false })
    .limit(500);

  const events = (revenueEvents ?? []) as RevenueEvent[];
  const collected = events
    .filter((event) => event.status === "collected")
    .reduce((sum, event) => sum + Number(event.amount_mxn ?? 0), 0);
  const pipeline = events
    .filter((event) => event.status === "projected" || event.status === "invoiced")
    .reduce((sum, event) => sum + Number(event.amount_mxn ?? 0), 0);
  const conversion = collected + pipeline > 0 ? (collected / (collected + pipeline)) * 100 : 0;

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">Negocio</p>
          <h1 className="mt-3 text-3xl font-semibold">Revenue global</h1>
          <p className="mt-2 text-sm text-slate-400">
            Vista consolidada por streams y clientes para operar el negocio de consultoria.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cobrado</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">${collected.toLocaleString("es-MX")}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pipeline</p>
            <p className="mt-2 text-2xl font-semibold text-amber-300">${pipeline.toLocaleString("es-MX")}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Conversion</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-300">{conversion.toFixed(1)}%</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr] gap-3 border-b border-slate-800 pb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
            <span>Cliente</span>
            <span>Stream</span>
            <span>Monto</span>
            <span>Status</span>
            <span>Fecha</span>
          </div>
          <div className="divide-y divide-slate-800">
            {events.length ? (
              events.map((event) => {
                const client = Array.isArray(event.clients) ? event.clients[0] : event.clients;
                return (
                  <Link
                    key={event.id}
                    href={`/app/clients/${event.client_id}/revenue`}
                    className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr] gap-3 py-3 text-sm transition hover:bg-slate-900/40"
                  >
                    <span className="text-slate-200">{client?.name ?? "Sin cliente"}</span>
                    <span className="text-slate-400">{STREAM_LABELS[event.stream] ?? event.stream}</span>
                    <span className="text-slate-200">${Number(event.amount_mxn ?? 0).toLocaleString("es-MX")}</span>
                    <span className="text-slate-400">{event.status}</span>
                    <span className="text-slate-500">{new Date(event.recognized_at).toLocaleDateString("es-MX")}</span>
                  </Link>
                );
              })
            ) : (
              <div className="py-6 text-sm text-slate-400">Sin eventos de revenue registrados.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
