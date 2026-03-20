import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PREMIUM_PLAN_POLICIES,
  PREMIUM_SOURCE_CATALOG,
  getCurrentMonthBounds,
  getPolicyByPlan,
  getAiProviderConnections,
  resolveTenantPlan,
  resolveTenantPlanFromDb,
} from "@/lib/platform/governance";
import { updateTenantMembershipPlan } from "../actions";

type RoleCount = {
  role: string;
  count: number;
};

type DiagnosticClient = {
  name: string;
};

type LatestDiagnostic = {
  id: string;
  title: string;
  status: string;
  framework: string;
  created_at: string;
  clients: DiagnosticClient[] | DiagnosticClient | null;
};

type RevenueEvent = {
  stream: string;
  amount_mxn: number;
  status: string;
  client_id: string;
  clients: { name: string }[] | { name: string } | null;
};

const STREAM_LABELS: Record<string, string> = {
  diagnostico: "Diagnóstico",
  retainer: "Retainer",
  implementacion: "Implementación",
  licencia: "Licencia SaaS",
  success_fee: "Go-along Success Fee",
  otro: "Otro",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile?.tenant_id) {
    redirect("/app");
  }

  if (profile.role !== "super_admin") {
    redirect("/app");
  }

  const [{ data: users }, { count: clientsCount }, { count: diagnosticsCount }, { count: documentsCount }] =
    await Promise.all([
      supabase.from("profiles").select("role"),
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("diagnostics").select("id", { count: "exact", head: true }),
      supabase.from("documents").select("id", { count: "exact", head: true }),
    ]);

  const roleMap = new Map<string, number>();
  (users ?? []).forEach((userRow) => {
    const role = userRow.role ?? "unknown";
    roleMap.set(role, (roleMap.get(role) ?? 0) + 1);
  });

  const roleCounts: RoleCount[] = [...roleMap.entries()]
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count);

  const [{ data: latestDiagnostics }, { data: revenueEvents }] = await Promise.all([
    supabase
      .from("diagnostics")
      .select("id, title, status, framework, created_at, clients(name)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("revenue_events")
      .select("stream, amount_mxn, status, client_id, clients(name)")
      .order("recognized_at", { ascending: false })
      .limit(500),
  ]);

  const monthBounds = getCurrentMonthBounds();
  const { data: monthUsageDiagnostics } = await supabase
    .from("diagnostics")
    .select("tenant_id, web_research")
    .gte("created_at", monthBounds.startIso)
    .lt("created_at", monthBounds.endIso)
    .limit(10000);

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, name, tenant_memberships(plan)")
    .order("name", { ascending: true });

  const typedRevenueEvents = (revenueEvents ?? []) as RevenueEvent[];
  const collectedRevenue = typedRevenueEvents
    .filter((event) => event.status === "collected")
    .reduce((sum, event) => sum + Number(event.amount_mxn ?? 0), 0);
  const pipelineRevenue = typedRevenueEvents
    .filter((event) => event.status === "projected" || event.status === "invoiced")
    .reduce((sum, event) => sum + Number(event.amount_mxn ?? 0), 0);

  const streamMap = new Map<string, number>();
  for (const event of typedRevenueEvents) {
    streamMap.set(event.stream, (streamMap.get(event.stream) ?? 0) + Number(event.amount_mxn ?? 0));
  }

  const clientRevenueMap = new Map<string, { name: string; amount: number }>();
  for (const event of typedRevenueEvents.filter((item) => item.status === "collected")) {
    const client = Array.isArray(event.clients) ? event.clients[0] : event.clients;
    const clientName = client?.name ?? "Sin cliente";
    const current = clientRevenueMap.get(event.client_id) ?? { name: clientName, amount: 0 };
    current.amount += Number(event.amount_mxn ?? 0);
    clientRevenueMap.set(event.client_id, current);
  }

  const topClients = Array.from(clientRevenueMap.entries())
    .map(([clientId, value]) => ({ clientId, ...value }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  const aiConnections = getAiProviderConnections();
  const totalPremiumSources = PREMIUM_SOURCE_CATALOG.filter((source) => source.type === "premium").length;

  const usageByTenant = new Map<string, { reports: number; premiumQueries: number }>();
  for (const row of monthUsageDiagnostics ?? []) {
    const tenantId = row.tenant_id ?? "unknown";
    const current = usageByTenant.get(tenantId) ?? { reports: 0, premiumQueries: 0 };
    current.reports += 1;
    if (row.web_research) {
      current.premiumQueries += 1;
    }
    usageByTenant.set(tenantId, current);
  }

  const tenantUsageRows = await Promise.all(
    Array.from(usageByTenant.entries()).map(async ([tenantId, usage]) => {
      const plan = tenantId === "unknown" ? "starter" : await resolveTenantPlanFromDb(supabase as any, tenantId);
      const policy = getPolicyByPlan(plan);
      return {
        tenantId,
        plan: policy.label,
        reports: usage.reports,
        reportLimit: policy.monthlyReportRuns,
        premiumQueries: usage.premiumQueries,
        premiumQueryLimit: policy.monthlyPremiumQueries,
      };
    })
  );

  const sortedTenantUsageRows = tenantUsageRows
    .sort((a, b) => b.reports - a.reports)
    .slice(0, 10);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <Link href="/app" className="text-sm text-cyan-300 transition hover:text-cyan-200">
            ← Volver al workspace
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-cyan-400">Super Admin</p>
          <h1 className="mt-3 text-3xl font-semibold">Panel de control</h1>
          <p className="mt-2 text-sm text-slate-400">
            Vista consolidada del tenant: usuarios, clientes y actividad diagnóstica.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Usuarios</p>
            <p className="mt-2 text-3xl font-semibold text-cyan-300">{users?.length ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Clientes</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">{clientsCount ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Diagnósticos</p>
            <p className="mt-2 text-3xl font-semibold text-amber-300">{diagnosticsCount ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Documentos</p>
            <p className="mt-2 text-3xl font-semibold text-fuchsia-300">{documentsCount ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Revenue cobrado</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">${collectedRevenue.toLocaleString("es-MX")}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Revenue pipeline</p>
            <p className="mt-2 text-2xl font-semibold text-amber-300">${pipelineRevenue.toLocaleString("es-MX")}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Distribución de roles</h2>
            <div className="mt-4 space-y-3">
              {roleCounts.length ? (
                roleCounts.map((row) => (
                  <div
                    key={row.role}
                    className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                  >
                    <span className="uppercase tracking-[0.14em] text-slate-300">{row.role}</span>
                    <span className="font-semibold text-slate-100">{row.count}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                  No hay usuarios para mostrar.
                </div>
              )}
            </div>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Revenue por stream</h3>
            <div className="mt-3 space-y-2">
              {Array.from(streamMap.entries()).length ? (
                Array.from(streamMap.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([stream, amount]) => (
                    <div key={stream} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm">
                      <span className="text-slate-300">{STREAM_LABELS[stream] ?? stream}</span>
                      <span className="font-semibold text-slate-100">${amount.toLocaleString("es-MX")}</span>
                    </div>
                  ))
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                  Sin datos de revenue aún.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Diagnósticos recientes</h2>
            <div className="mt-4 space-y-3">
              {latestDiagnostics?.length ? (
                (latestDiagnostics as LatestDiagnostic[]).map((diagnostic) => {
                  const clientName = Array.isArray(diagnostic.clients)
                    ? diagnostic.clients[0]?.name
                    : diagnostic.clients?.name;

                  return (
                    <Link
                      key={diagnostic.id}
                      href={`/app/diagnostics/${diagnostic.id}`}
                      className="block rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:bg-slate-900"
                    >
                      <p className="font-medium text-slate-100">{diagnostic.title}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {clientName ?? "Sin cliente"} · {diagnostic.framework} · {diagnostic.status}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {new Date(diagnostic.created_at).toLocaleDateString("es-MX")}
                      </p>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                  Sin actividad diagnóstica reciente.
                </div>
              )}
            </div>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Top clientes por cobro</h3>
            <div className="mt-3 space-y-2">
              {topClients.length ? (
                topClients.map((row) => (
                  <Link
                    key={row.clientId}
                    href={`/app/clients/${row.clientId}/revenue`}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm transition hover:bg-slate-900"
                  >
                    <span className="text-slate-300">{row.name}</span>
                    <span className="font-semibold text-emerald-300">${row.amount.toLocaleString("es-MX")}</span>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                  Sin cobros registrados aún.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Conectividad IA central (CP)</h2>
            <p className="mt-2 text-sm text-slate-400">
              El Super Admin gestiona conectores globales para pruebas iniciales de consultores.
            </p>
            <div className="mt-4 space-y-3">
              {aiConnections.map((provider) => (
                <div
                  key={provider.key}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-100">{provider.label}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs uppercase tracking-[0.16em] ${
                        provider.connected
                          ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border border-amber-500/40 bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {provider.connected ? "Conectado" : "Pendiente"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{provider.purpose}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{provider.envKey}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Politica de cuotas para listas premium</h2>
            <p className="mt-2 text-sm text-slate-400">
              Los consultores con membresia no tienen acceso ilimitado; se controla por plan y consumo mensual.
            </p>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
              Fuentes premium disponibles en catalogo: {totalPremiumSources}
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
              <div className="grid grid-cols-[0.8fr_0.8fr_1fr_1fr] gap-3 bg-slate-950/90 px-3 py-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                <span>Plan</span>
                <span>Reportes</span>
                <span>Consultas premium</span>
                <span>Descargas premium</span>
              </div>
              <div className="divide-y divide-slate-800">
                {PREMIUM_PLAN_POLICIES.map((policy) => (
                  <div key={policy.key} className="grid grid-cols-[0.8fr_0.8fr_1fr_1fr] gap-3 px-3 py-3 text-sm">
                    <span className="font-medium text-slate-200">{policy.label}</span>
                    <span className="text-slate-300">{policy.monthlyReportRuns}</span>
                    <span className="text-slate-300">{policy.monthlyPremiumQueries}</span>
                    <span className="text-slate-300">{policy.monthlyPremiumDownloads}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Siguiente paso: persistir plan por tenant y registrar consumo por fuente para enforcement automatico.
            </p>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold">Consumo mensual por tenant</h2>
          <p className="mt-2 text-sm text-slate-400">
            Vista de uso actual contra limites del plan para auditar membresias SaaS.
          </p>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
            <div className="grid grid-cols-[1.1fr_0.6fr_1fr_1fr] gap-3 bg-slate-950/90 px-3 py-2 text-xs uppercase tracking-[0.16em] text-slate-500">
              <span>Tenant</span>
              <span>Plan</span>
              <span>Reportes</span>
              <span>Consultas premium</span>
            </div>
            <div className="divide-y divide-slate-800">
              {sortedTenantUsageRows.length ? (
                sortedTenantUsageRows.map((row) => (
                  <div key={row.tenantId} className="grid grid-cols-[1.1fr_0.6fr_1fr_1fr] gap-3 px-3 py-3 text-sm">
                    <span className="truncate text-slate-300">{row.tenantId}</span>
                    <span className="text-slate-300">{row.plan}</span>
                    <span className="text-slate-300">{row.reports} / {row.reportLimit}</span>
                    <span className="text-slate-300">{row.premiumQueries} / {row.premiumQueryLimit}</span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-sm text-slate-400">Sin consumo mensual registrado aun.</div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold">Membresias por tenant</h2>
          <p className="mt-2 text-sm text-slate-400">
            Ajusta el plan comercial de cada consultor para controlar cupos de reportes y research premium.
          </p>
          <div className="mt-4 space-y-3">
            {tenants?.length ? (
              tenants.map((tenant) => {
                const membership = Array.isArray(tenant.tenant_memberships)
                  ? tenant.tenant_memberships[0]
                  : tenant.tenant_memberships;
                const fallbackPlan = resolveTenantPlan(tenant.id);
                const selectedPlan = membership?.plan ?? fallbackPlan;

                return (
                  <form key={tenant.id} action={updateTenantMembershipPlan} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <input type="hidden" name="tenantId" value={tenant.id} />
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-medium text-slate-100">{tenant.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{tenant.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          name="plan"
                          defaultValue={selectedPlan}
                          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
                        >
                          <option value="starter">Starter</option>
                          <option value="growth">Growth</option>
                          <option value="scale">Scale</option>
                        </select>
                        <button
                          type="submit"
                          className="rounded-xl border border-cyan-600/60 bg-cyan-950/30 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-900/30"
                        >
                          Guardar plan
                        </button>
                      </div>
                    </div>
                  </form>
                );
              })
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                No hay tenants disponibles para configurar.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
