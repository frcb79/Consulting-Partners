import { redirect } from "next/navigation";
import { createClientRecord, signOut } from "./actions";
import { createClient } from "@/lib/supabase/server";

export default async function AppPage() {
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
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
        <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h1 className="text-2xl font-semibold">Perfil no inicializado</h1>
          <p className="mt-2 text-slate-300">
            No se encontro un tenant para este usuario. Cierra sesion y vuelve a entrar para reintentar.
          </p>
          <form action={signOut} className="mt-6">
            <button
              type="submit"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
            >
              Cerrar sesion
            </button>
          </form>
        </section>
      </main>
    );
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, industry, status, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">Consulting Partners</p>
        <h1 className="mt-3 text-2xl font-semibold">Workspace privado</h1>
        <p className="mt-2 text-slate-300">Sesion activa para: {user.email}</p>
        <p className="mt-1 text-sm text-slate-400">Rol: {profile.role}</p>

        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
          <p className="text-cyan-300">Conexion real a Supabase y RLS activo por tenant.</p>
        </div>

        <form action={createClientRecord} className="mt-6 grid gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="text-lg font-semibold">Nuevo cliente</h2>
          <input
            name="name"
            required
            placeholder="Nombre del cliente"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
          />
          <input
            name="industry"
            placeholder="Industria (opcional)"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
          />
          <button
            type="submit"
            className="w-fit rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            Guardar cliente
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="text-lg font-semibold">Ultimos clientes</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {clients?.length ? (
              clients.map((client) => (
                <li key={client.id} className="rounded-lg border border-slate-800 px-3 py-2">
                  <p className="font-medium text-slate-100">{client.name}</p>
                  <p className="text-slate-400">
                    {client.industry ?? "Sin industria"} · {client.status}
                  </p>
                </li>
              ))
            ) : (
              <li className="text-slate-400">Aun no hay clientes en este tenant.</li>
            )}
          </ul>
        </div>

        <form action={signOut} className="mt-6">
          <button
            type="submit"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
          >
            Cerrar sesion
          </button>
        </form>
      </section>
    </main>
  );
}
