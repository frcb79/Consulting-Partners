import Link from "next/link";
import { redirect } from "next/navigation";
import { createClientRecord, signOut } from "./actions";
import { createClient } from "@/lib/supabase/server";

type AppPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function AppPage({ searchParams }: AppPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const searchQuery = resolvedSearchParams?.q?.trim() ?? "";
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

  const { data: clientStats } = await supabase
    .from("clients")
    .select("id, status");

  let clientsQuery = supabase
    .from("clients")
    .select(
      "id, name, industry, company_size, status, primary_contact_name, primary_contact_email, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(25);

  if (searchQuery) {
    clientsQuery = clientsQuery.or(
      `name.ilike.%${searchQuery}%,industry.ilike.%${searchQuery}%,primary_contact_name.ilike.%${searchQuery}%`
    );
  }

  const { data: clients } = await clientsQuery;

  const totalClients = clientStats?.length ?? 0;
  const prospectCount = clientStats?.filter((client) => client.status === "prospect").length ?? 0;
  const activeCount = clientStats?.filter((client) => client.status === "active").length ?? 0;
  const retainerCount = clientStats?.filter((client) => client.status === "retainer").length ?? 0;

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-400">Consulting Partners</p>
              <h1 className="mt-3 text-3xl font-semibold">Workspace privado</h1>
              <p className="mt-2 text-slate-300">Sesion activa para: {user.email}</p>
              <p className="mt-1 text-sm text-slate-400">Rol: {profile.role}</p>
            </div>

            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
              >
                Cerrar sesion
              </button>
            </form>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Clientes totales</p>
              <p className="mt-3 text-3xl font-semibold">{totalClients}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Prospects</p>
              <p className="mt-3 text-3xl font-semibold text-amber-300">{prospectCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Activos</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-300">{activeCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Retainers</p>
              <p className="mt-3 text-3xl font-semibold text-cyan-300">{retainerCount}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Clientes</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Lista operativa con busqueda y acceso al expediente.
                </p>
              </div>

              <form className="flex w-full max-w-md gap-2">
                <input
                  type="search"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Buscar por cliente, industria o contacto"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
                >
                  Buscar
                </button>
              </form>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
              <div className="grid grid-cols-[1.2fr_0.95fr_0.8fr_1fr] gap-3 bg-slate-950/90 px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                <span>Cliente</span>
                <span>Industria</span>
                <span>Estado</span>
                <span>Contacto</span>
              </div>
              <div className="divide-y divide-slate-800">
                {clients?.length ? (
                  clients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/app/clients/${client.id}`}
                      className="grid grid-cols-[1.2fr_0.95fr_0.8fr_1fr] gap-3 px-4 py-4 text-sm transition hover:bg-slate-950/60"
                    >
                      <div>
                        <p className="font-medium text-slate-100">{client.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{client.company_size ?? "Tamano sin definir"}</p>
                      </div>
                      <p className="text-slate-300">{client.industry ?? "Sin industria"}</p>
                      <p className="text-slate-300">{client.status}</p>
                      <div className="text-slate-300">
                        <p>{client.primary_contact_name ?? "Sin contacto"}</p>
                        <p className="mt-1 text-xs text-slate-500">{client.primary_contact_email ?? "Sin email"}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-6 text-sm text-slate-400">
                    No hay clientes para el filtro actual.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold">Alta de cliente</h2>
            <p className="mt-1 text-sm text-slate-400">
              Formulario largo alineado al expediente de V1.
            </p>

            <form action={createClientRecord} className="mt-6 grid gap-6">
              <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Info de empresa
                </h3>
                <input
                  name="name"
                  required
                  placeholder="Nombre del cliente"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    name="industry"
                    placeholder="Industria"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                  />
                  <input
                    name="companySize"
                    placeholder="Tamano de empresa"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                  />
                </div>
                <select
                  name="status"
                  defaultValue="prospect"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                >
                  <option value="prospect">Prospect</option>
                  <option value="active">Active</option>
                  <option value="retainer">Retainer</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Contacto principal
                </h3>
                <input
                  name="primaryContactName"
                  placeholder="Nombre del contacto"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="email"
                    name="primaryContactEmail"
                    placeholder="Email del contacto"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                  />
                  <input
                    name="primaryContactPhone"
                    placeholder="Telefono del contacto"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                  />
                </div>
              </div>

              <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Contexto estrategico
                </h3>
                <textarea
                  name="strategicContext"
                  rows={5}
                  placeholder="Reto principal, contexto y situacion actual"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
              </div>

              <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Comercial e internas
                </h3>
                <textarea
                  name="commercialContext"
                  rows={4}
                  placeholder="Alcance comercial, propuesta o contexto de venta"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <textarea
                  name="internalNotes"
                  rows={4}
                  placeholder="Notas internas solo para el consultor"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
              </div>

              <button
                type="submit"
                className="w-fit rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
              >
                Guardar cliente
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
