import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { saveClientConsultingPlan } from "../../../actions";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};


export default async function ClientConsultingPlanPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile, client, plan, consultors, and roadmap deliverables
  const [
    { data: profile },
    { data: client },
    { data: plan },
    { data: consultors },
    { data: roadmap }
  ] = await Promise.all([
    supabase.from("profiles").select("role, tenant_id").eq("user_id", user.id).single(),
    supabase.from("clients").select("id, name, status, industry").eq("id", id).single(),
    supabase.from("client_consulting_plans").select("objective, success_metrics, scope, key_risks, next_90_days, engagement_model, updated_at, consultor_id").eq("client_id", id).maybeSingle(),
    // Fetch all consultants for this tenant
    supabase.from("profiles").select("user_id, full_name").eq("tenant_id", profile?.tenant_id ?? "").eq("role", "consultant"),
    // Fetch roadmap deliverables for this client
    supabase.from("consulting_plan_roadmaps").select("id, phase, deliverable, is_complete").eq("client_id", id).order("phase", { ascending: true }),
  ]);

  if (!profile || profile.role === "client") {
    redirect("/app");
  }

  if (!client) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <Link href={`/app/clients/${client.id}`} className="text-sm text-cyan-300 transition hover:text-cyan-200">
            ← Volver al expediente
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-cyan-400">Plan de consultoria</p>
          <h1 className="mt-3 text-3xl font-semibold">{client.name}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {client.industry ?? "Sin industria"} · Estado {client.status}
          </p>
          {plan?.updated_at ? (
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
              Ultima actualizacion: {new Date(plan.updated_at).toLocaleString("es-MX")}
            </p>
          ) : null}
        </div>

        <form action={saveClientConsultingPlan} className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <input type="hidden" name="clientId" value={client.id} />

          {/* Consultor responsable */}
          <div className="grid gap-3">
            <h2 className="text-lg font-semibold">Consultor responsable</h2>
            <select
              name="consultorId"
              defaultValue={plan?.consultor_id ?? user.id}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
            >
              {consultors?.map((c: any) => (
                <option key={c.user_id} value={c.user_id}>
                  {c.full_name || c.user_id}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3">
            <h2 className="text-lg font-semibold">1) Objetivo de la consultoria</h2>
            <textarea
              name="objective"
              rows={4}
              defaultValue={plan?.objective ?? ""}
              placeholder="Ej. Incrementar margen operativo 15% en 18 meses..."
              className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
            />
          </div>

          <div className="grid gap-3">
            <h2 className="text-lg font-semibold">2) Como mediremos el exito (KPI y resultados)</h2>
            <textarea
              name="successMetrics"
              rows={4}
              defaultValue={plan?.success_metrics ?? ""}
              placeholder="Definir KPIs, baseline, target y horizonte temporal..."
              className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-3">
              <h2 className="text-lg font-semibold">3) Alcance del proyecto</h2>
              <textarea
                name="scope"
                rows={6}
                defaultValue={plan?.scope ?? ""}
                placeholder="Procesos, areas, unidades de negocio incluidas/excluidas..."
                className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
              />
            </div>
            <div className="grid gap-3">
              <h2 className="text-lg font-semibold">4) Riesgos clave y mitigacion</h2>
              <textarea
                name="keyRisks"
                rows={6}
                defaultValue={plan?.key_risks ?? ""}
                placeholder="Riesgos de ejecucion, datos, adopcion y mitigaciones..."
                className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-3">
              <h2 className="text-lg font-semibold">5) Plan de 90 dias</h2>
              <textarea
                name="next90Days"
                rows={6}
                defaultValue={plan?.next_90_days ?? ""}
                placeholder="Hitos mensuales, entregables y responsables..."
                className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
              />
            </div>
            <div className="grid gap-3">
              <h2 className="text-lg font-semibold">6) Modelo de engagement</h2>
              <textarea
                name="engagementModel"
                rows={6}
                defaultValue={plan?.engagement_model ?? ""}
                placeholder="Cadencia de sesiones, comite, decision makers, formato de reportes..."
                className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-400">
              Guardar plan de consultoria
            </button>
            <Link href={`/app/clients/${client.id}/retainer`} className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm transition hover:bg-slate-800">
              Ir a retainer y KPI
            </Link>
          </div>
        </form>

        {/* Roadmap/Checklist UI */}
        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold mb-4">Roadmap y checklist de entregables</h2>
          {/* Add new deliverable */}
          <form action="/app/app/actions" method="post" className="mb-6 flex flex-wrap gap-3 items-end">
            <input type="hidden" name="clientId" value={client.id} />
            <input type="hidden" name="actionType" value="addRoadmapDeliverable" />
            <div>
              <label className="block text-xs mb-1">Fase</label>
              <input name="phase" required placeholder="Fase (ej. Diagnóstico, Implementación)" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs mb-1">Entregable</label>
              <input name="deliverable" required placeholder="Descripción del entregable" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring w-full" />
            </div>
            <button type="submit" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400">Agregar</button>
          </form>

          {/* List deliverables grouped by phase */}
          {roadmap && roadmap.length > 0 ? (
            <div className="space-y-6">
              {[...new Set(roadmap.map((r: any) => r.phase))].map((phase) => (
                <div key={phase}>
                  <h3 className="text-lg font-bold text-cyan-300 mb-2">Fase: {phase}</h3>
                  <ul className="space-y-2">
                    {roadmap.filter((r: any) => r.phase === phase).map((item: any) => (
                      <li key={item.id} className="flex items-center gap-3">
                        {/* Toggle complete */}
                        <form action="/app/app/actions" method="post" className="flex items-center gap-2">
                          <input type="hidden" name="roadmapId" value={item.id} />
                          <input type="hidden" name="actionType" value="toggleRoadmapDeliverableComplete" />
                          <input type="checkbox" name="isComplete" defaultChecked={item.is_complete} onChange={() => { (event?.target as HTMLFormElement)?.form?.submit(); }} />
                        </form>
                        {/* Edit deliverable */}
                        <form action="/app/app/actions" method="post" className="flex items-center gap-2">
                          <input type="hidden" name="roadmapId" value={item.id} />
                          <input type="hidden" name="actionType" value="updateRoadmapDeliverable" />
                          <input name="phase" defaultValue={item.phase} className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs w-28" />
                          <input name="deliverable" defaultValue={item.deliverable} className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs w-64" />
                          <button type="submit" className="text-xs text-cyan-400 hover:underline">Guardar</button>
                        </form>
                        {/* Delete deliverable */}
                        <form action="/app/app/actions" method="post" className="inline">
                          <input type="hidden" name="roadmapId" value={item.id} />
                          <input type="hidden" name="actionType" value="deleteRoadmapDeliverable" />
                          <button type="submit" className="text-xs text-red-400 hover:underline ml-2">Eliminar</button>
                        </form>
                        <span className={item.is_complete ? "line-through text-slate-500 ml-2" : "ml-2"}>{item.deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No hay entregables definidos aún.</p>
          )}
        </section>
      </section>
    </main>
  );
}
