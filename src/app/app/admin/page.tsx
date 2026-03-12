import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const { data: latestDiagnostics } = await supabase
    .from("diagnostics")
    .select("id, title, status, framework, created_at, clients(name)")
    .order("created_at", { ascending: false })
    .limit(8);

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

        <div className="grid gap-4 md:grid-cols-4">
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
          </section>
        </div>
      </section>
    </main>
  );
}
