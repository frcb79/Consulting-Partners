import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ConsultingCenterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: clients }, { data: diagnostics }, { data: retainers }, { data: sessions }, { data: plans }] =
    await Promise.all([
      supabase.from("profiles").select("tenant_id, role").eq("user_id", user.id).single(),
      supabase.from("clients").select("id, name, status, updated_at").order("updated_at", { ascending: false }).limit(200),
      supabase.from("diagnostics").select("id, client_id, status, created_at").order("created_at", { ascending: false }).limit(200),
      supabase.from("retainers").select("id, client_id, status").order("created_at", { ascending: false }).limit(200),
      supabase.from("retainer_sessions").select("id, client_id, session_date, title").order("session_date", { ascending: false }).limit(30),
      supabase.from("client_consulting_plans").select("client_id, updated_at").order("updated_at", { ascending: false }).limit(300),
    ]);

  if (!profile?.tenant_id || profile.role === "client") {
    redirect("/app");
  }

  const totalClients = clients?.length ?? 0;
  const activeClients = clients?.filter((client) => client.status === "active" || client.status === "retainer").length ?? 0;
  const diagnosticsInProgress = diagnostics?.filter((diagnostic) => diagnostic.status === "pending" || diagnostic.status === "processing" || diagnostic.status === "qc").length ?? 0;
  const activeRetainers = retainers?.filter((retainer) => retainer.status === "active").length ?? 0;

  const planClientIds = new Set((plans ?? []).map((plan) => plan.client_id));
  const clientsWithoutPlan = (clients ?? []).filter((client) => !planClientIds.has(client.id)).slice(0, 8);

  const diagnosticsByClient = new Map<string, number>();
  (diagnostics ?? []).forEach((diagnostic) => {
    diagnosticsByClient.set(diagnostic.client_id, (diagnosticsByClient.get(diagnostic.client_id) ?? 0) + 1);
  });

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">Consulting Partners</p>
          <h1 className="mt-3 text-3xl font-semibold">Centro de consultoria</h1>
          <p className="mt-2 text-sm text-slate-400">
            Vista operativa para ejecutar consultorias de CP: plan por cliente, diagnosticos, sesiones y seguimiento de avance.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Clientes totales</p>
            <p className="mt-2 text-3xl font-semibold">{totalClients}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Clientes activos</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">{activeClients}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Diagnosticos en curso</p>
            <p className="mt-2 text-3xl font-semibold text-amber-300">{diagnosticsInProgress}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Retainers activos</p>
            <p className="mt-2 text-3xl font-semibold text-cyan-300">{activeRetainers}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Clientes sin plan de consultoria</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Prioriza estos clientes para alinear objetivo, KPI de exito y plan de 90 dias.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {clientsWithoutPlan.length ? (
                clientsWithoutPlan.map((client) => (
                  <Link
                    key={client.id}
                    href={`/app/clients/${client.id}/plan`}
                    className="block rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:bg-slate-900"
                  >
                    <p className="font-medium text-slate-100">{client.name}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Estado: {client.status} · Diagnosticos: {diagnosticsByClient.get(client.id) ?? 0}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                  Excelente: todos los clientes visibles ya tienen plan de consultoria base.
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Playbook operativo CP</h2>
              <ol className="mt-4 grid gap-2 text-sm text-slate-300">
                <li>1. Definir plan de consultoria por cliente (objetivo, exito, alcance).</li>
                <li>2. Ejecutar diagnostico inicial y validar hallazgos.</li>
                <li>3. Activar retainer con KPI y sesiones de seguimiento.</li>
                <li>4. Medir avance y ajustar roadmap cada 30 dias.</li>
              </ol>
              <div className="mt-4 grid gap-2">
                <Link href="/app" className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800">Ir al dashboard de clientes</Link>
                <Link href="/app/diagnostics/new" className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800">Crear nuevo diagnostico</Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Sesiones recientes</h2>
              <div className="mt-3 space-y-2">
                {(sessions ?? []).length ? (
                  (sessions ?? []).map((session) => (
                    <Link key={session.id} href={`/app/clients/${session.client_id}/retainer`} className="block rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm transition hover:bg-slate-900">
                      <p className="text-slate-200">{session.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{new Date(session.session_date).toLocaleDateString("es-MX")}</p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-sm text-slate-400">
                    Sin sesiones registradas aun.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
