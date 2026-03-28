import { redirect } from "next/navigation";
import { signOut } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { ThemeSwitcher } from "@/components/app/ThemeSwitcher";
import { NavSection } from "@/components/ui/nav-section";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  BookOpen,
  TrendingUp,
  Settings,
  Shield,
  Sparkles,
  LogOut,
} from "@/components/ui/icons";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = profile?.role ?? "consultor";
  const isSuperAdmin = role === "super_admin";

  const workspaceNav = [
    { href: "/app", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { href: "/app/consulting", label: "Centro de consultoría", icon: <Sparkles size={16} /> },
    { href: "/app/diagnostics/new", label: "Nuevo diagnóstico", icon: <Stethoscope size={16} /> },
  ];
  const operationsNav = [
    { href: "/app/clients", label: "Clientes", icon: <Users size={16} /> },
  ];
  const intelligenceNav = [
    { href: "/app/library", label: "Biblioteca", icon: <BookOpen size={16} /> },
  ];
  const businessNav = [
    { href: "/app/revenue", label: "Revenue", icon: <TrendingUp size={16} /> },
  ];
  const adminNav = [
    ...(isSuperAdmin
      ? [{ href: "/app/admin", label: "Super Admin", icon: <Shield size={16} /> }]
      : []),
    { href: "/app/settings", label: "Configuración", icon: <Settings size={16} /> },
  ];

  const emailInitials = user.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "CP";

  return (
    <div className="min-h-screen bg-background text-foreground md:grid md:grid-cols-[260px_1fr]">
      <aside className="flex flex-col border-b border-border bg-surface md:min-h-screen md:border-b-0 md:border-r">
        <div className="px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
              <span className="font-sora text-sm font-bold text-accent">CP</span>
            </div>
            <div>
              <p className="font-sora text-sm font-semibold leading-none text-foreground">Consulting Partners</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-widest text-foreground/40">Strategic AI Platform</p>
            </div>
          </div>
        </div>
        <div className="mx-5 h-px bg-border" />
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
          <NavSection title="Workspace" items={workspaceNav} currentPath="/app" />
          <NavSection title="Operación" items={operationsNav} currentPath="/app/clients" />
          <NavSection title="Inteligencia" items={intelligenceNav} currentPath="/app/library" />
          <NavSection title="Negocio" items={businessNav} currentPath="/app/revenue" />
          <NavSection title="Sistema" items={adminNav} currentPath="/app/settings" />
        </nav>
        <div className="mx-5 h-px bg-border" />
        <div className="space-y-3 px-4 py-4">
          <div className="rounded-lg border border-border bg-surface-strong px-3 py-2">
            <ThemeSwitcher />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
                <span className="font-sora text-[10px] font-bold text-accent">{emailInitials}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground/80">{user.email}</p>
                <p className="text-[10px] uppercase tracking-widest text-foreground/40">{role}</p>
              </div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                title="Cerrar sesión"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-foreground/40 transition-colors hover:border-status-error/40 hover:bg-status-error/10 hover:text-status-error"
              >
                <LogOut size={14} />
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 overflow-y-auto">{children}</div>
    </div>
  );
}
