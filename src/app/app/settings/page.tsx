import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getAiProviderConnections,
  getCurrentMonthBounds,
  getPolicyByPlan,
  resolveTenantPlanFromDb,
} from "@/lib/platform/governance";

export default async function SettingsPage() {
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

  const aiConnections = getAiProviderConnections();
  const tenantPlan = profile?.tenant_id ? await resolveTenantPlanFromDb(supabase, profile.tenant_id) : "starter";
  const activePolicy = getPolicyByPlan(tenantPlan);
  const monthBounds = getCurrentMonthBounds();

  const { data: monthDiagnostics } = profile?.tenant_id
    ? await supabase
        .from("diagnostics")
        .select("id, web_research")
        .eq("tenant_id", profile.tenant_id)
        .gte("created_at", monthBounds.startIso)
        .lt("created_at", monthBounds.endIso)
    : { data: [] };

  const reportUsage = monthDiagnostics?.length ?? 0;
  const researchUsage = monthDiagnostics?.filter((diagnostic) => Boolean(diagnostic.web_research)).length ?? 0;

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">Configuracion</p>
          <h1 className="mt-3 text-3xl font-semibold">Centro de operacion del consultor</h1>
          <p className="mt-2 text-sm text-slate-400">
            Configura perfil, modelo de negocio y acceso a herramientas para operar tu firma de consultoria.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Perfil profesional</h2>
            <p className="mt-2 text-sm text-slate-400">Base para firma, contacto y posicionamiento comercial.</p>
            <div className="mt-4 grid gap-3">
              <input
                disabled
                value={user.email ?? ""}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-400"
              />
              <input
                disabled
                value={profile?.role ?? "consultor"}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-400"
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Modelo de negocio</h2>
            <p className="mt-2 text-sm text-slate-400">
              Define como cobras: por proyecto, por retainer o por esquema mixto.
            </p>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
              Configuracion editable en el siguiente sprint (estructura ya reservada).
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Integraciones IA</h2>
            <p className="mt-2 text-sm text-slate-400">
              En esta etapa se usara IA central de CP para pruebas iniciales. La conexion de proveedores la gestiona Super Admin.
            </p>
            <div className="mt-4 space-y-2">
              {aiConnections.map((provider) => (
                <div key={provider.key} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm">
                  <span className="text-slate-300">{provider.label}</span>
                  <span className={provider.connected ? "text-emerald-300" : "text-amber-300"}>
                    {provider.connected ? "Disponible" : "Pendiente de conexion"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              BYOK por consultor quedo diferido para una fase posterior.
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Fuentes y licencias</h2>
            <p className="mt-2 text-sm text-slate-400">
              El acceso a listas premium no es ilimitado y se controla por membresia/cuota asignada por Super Admin.
            </p>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
              <p className="font-medium text-slate-100">Politica activa inicial</p>
              <p className="mt-1 text-slate-400">Plan {activePolicy.label} (asignado por tenant)</p>
              <ul className="mt-3 space-y-1 text-slate-400">
                <li>Reportes mensuales: {reportUsage} / {activePolicy.monthlyReportRuns}</li>
                <li>Consultas premium: {researchUsage} / {activePolicy.monthlyPremiumQueries}</li>
                <li>Descargas premium: 0 / {activePolicy.monthlyPremiumDownloads}</li>
              </ul>
            </div>
            <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
              El Super Admin puede ampliar o restringir estas cuotas por membresia del consultor.
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
