import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { ThemeSwitcher } from "@/components/app/ThemeSwitcher";

type AppLayoutProps = {
  children: React.ReactNode;
};

const MAIN_NAV = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/consulting", label: "Centro de consultoria" },
  { href: "/app/diagnostics/new", label: "Diagnosticos" },
];

const OPERATIONS_NAV = [
  { href: "/app", label: "Clientes" },
];

const INTELLIGENCE_NAV = [
  { href: "/app/library", label: "Biblioteca de inteligencia" },
];

const BUSINESS_NAV = [
  { href: "/app/revenue", label: "Revenue global" },
];

export default async function AppLayout({ children }: AppLayoutProps) {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 md:grid md:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-800 bg-slate-950/95 p-5 md:min-h-screen md:border-b-0 md:border-r">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-400">Consulting Partners</p>
          <p className="mt-3 text-sm text-slate-300">{user.email}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{profile?.role ?? "consultor"}</p>
        </div>

        <nav className="mt-6 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Workspace</p>
            <div className="mt-2 grid gap-2">
              {MAIN_NAV.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Operacion</p>
            <div className="mt-2 grid gap-2">
              {OPERATIONS_NAV.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Inteligencia</p>
            <div className="mt-2 grid gap-2">
              {INTELLIGENCE_NAV.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Negocio</p>
            <div className="mt-2 grid gap-2">
              {BUSINESS_NAV.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Administracion</p>
            <div className="mt-2 grid gap-2">
              {profile?.role === "super_admin" ? (
                <Link
                  href="/app/admin"
                  className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
                >
                  Super Admin
                </Link>
              ) : null}
              <Link
                href="/app/settings"
                className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
              >
                Configuracion
              </Link>
            </div>
          </div>
        </nav>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <ThemeSwitcher />
        </div>

        <form action={signOut} className="mt-8">
          <button
            type="submit"
            className="w-full rounded-xl border border-slate-700 px-3 py-2 text-sm transition hover:bg-slate-800"
          >
            Cerrar sesion
          </button>
        </form>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
