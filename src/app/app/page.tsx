import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/stat-card";
import { AlertWidget } from "@/components/ui/alert-widget";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Stethoscope,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Plus,
} from "@/components/ui/icons";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "accent" | "muted" | "info" }
> = {
  prospect: { label: "Prospecto", variant: "warning" },
  active: { label: "Activo", variant: "success" },
  retainer: { label: "En retainer", variant: "accent" },
  inactive: { label: "Inactivo", variant: "muted" },
};

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return "hoy";
  if (diffDays === 1) return "ayer";
  if (diffDays < 7) return `hace ${diffDays} dias`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} sem.`;
  return `hace ${Math.floor(diffDays / 30)} mes.`;
}

type AlertLevel = "critical" | "warning" | "info" | "success";

type DashboardAlert = {
  id: string;
  level: AlertLevel;
  title: string;
  description: string;
  clientName?: string;
  timestamp: string;
  href: string;
};

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile?.tenant_id) {
    return (
      <main className="p-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-status-warning/30 bg-status-warning/5 p-6">
          <h1 className="font-sora text-xl font-bold text-foreground">Perfil no inicializado</h1>
          <p className="mt-2 text-sm text-foreground/60">
            No se encontro un tenant para este usuario. Cierra sesion y vuelve a entrar.
          </p>
          <form action={signOut} className="mt-5">
            <button
              type="submit"
              className="rounded-lg border border-border px-4 py-2 text-sm text-foreground/70 transition hover:bg-surface-strong"
            >
              Cerrar sesion
            </button>
          </form>
        </div>
      </main>
    );
  }

  const [
    { data: allClients },
    { data: recentClients },
    { data: diagnosticsQC },
    { data: activeRetainers },
    { data: upcomingSessions },
  ] = await Promise.all([
    supabase.from("clients").select("id, status"),
    supabase
      .from("clients")
      .select("id, name, industry, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("diagnostics")
      .select("id, client_id, status, updated_at, clients(name)")
      .eq("status", "qc")
      .order("updated_at", { ascending: true })
      .limit(5),
    supabase.from("retainers").select("id, status").eq("status", "active").limit(10),
    supabase
      .from("retainer_sessions")
      .select("id, session_date, title, client_id, clients(name)")
      .gte("session_date", new Date().toISOString())
      .order("session_date", { ascending: true })
      .limit(3),
  ]);

  const totalClients = allClients?.length ?? 0;
  const prospectCount = allClients?.filter((c) => c.status === "prospect").length ?? 0;
  const activeCount = allClients?.filter((c) => c.status === "active").length ?? 0;
  const retainerCount = allClients?.filter((c) => c.status === "retainer").length ?? 0;
  const qcCount = diagnosticsQC?.length ?? 0;
  const retainerActive = activeRetainers?.length ?? 0;

  const alerts: DashboardAlert[] = [];

  if (qcCount > 0) {
    const firstQC = diagnosticsQC?.[0];
    if (firstQC) {
      const client = Array.isArray(firstQC.clients) ? firstQC.clients[0] : firstQC.clients;
      alerts.push({
        id: "qc",
        level: "critical",
        title: `${qcCount} diagnostico${qcCount > 1 ? "s" : ""} esperando QC`,
        description: "Hallazgos IA listos para validacion.",
        clientName: client?.name ?? "Cliente",
        timestamp: formatRelative(String(firstQC.updated_at)),
        href: `/app/diagnostics/${firstQC.id}`,
      });
    }
  }

  if (upcomingSessions && upcomingSessions.length > 0) {
    const nextSession = upcomingSessions[0];
    const client = Array.isArray(nextSession.clients) ? nextSession.clients[0] : nextSession.clients;
    const sessionDate = new Date(String(nextSession.session_date));
    const daysUntil = Math.max(0, Math.ceil((sessionDate.getTime() - Date.now()) / 86_400_000));

    alerts.push({
      id: "session",
      level: daysUntil <= 2 ? "warning" : "info",
      title: (nextSession.title as string) ?? "Sesion proxima",
      description: `En ${daysUntil} dia${daysUntil !== 1 ? "s" : ""}.`,
      clientName: client?.name ?? "Cliente",
      timestamp: sessionDate.toLocaleDateString("es-MX", { weekday: "long", month: "short", day: "numeric" }),
      href: `/app/clients/${nextSession.client_id}`,
    });
  }

  if (prospectCount > 2) {
    alerts.push({
      id: "prospects",
      level: "info",
      title: `${prospectCount} prospectos sin convertir`,
      description: "Revisa el pipeline para acelerar conversion.",
      timestamp: "pipeline",
      href: "/app/clients",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "ok",
      level: "success",
      title: "Todo al dia",
      description: "No hay acciones urgentes.",
      timestamp: "ahora",
      href: "/app/clients",
    });
  }

  const firstName = user.email?.split("@")[0] ?? "Consultor";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos dias" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              {greeting}, {firstName}
            </p>
            <h1 className="mt-1 font-sora text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 text-sm text-foreground/50">
              {new Date().toLocaleDateString("es-MX", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Link
            href="/app/clients"
            className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition-all hover:bg-accent/15 hover:shadow-accent-glow"
          >
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </Link>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Clientes totales" value={totalClients} icon={<Users className="h-7 w-7" />} accentColor="info" delay={0} />
          <StatCard
            title="Activos"
            value={activeCount}
            icon={<TrendingUp className="h-7 w-7" />}
            accentColor="success"
            subtext={totalClients > 0 ? `${Math.round((activeCount / totalClients) * 100)}% del portafolio` : undefined}
            delay={60}
          />
          <StatCard title="En retainer" value={retainerCount} icon={<CheckCircle className="h-7 w-7" />} accentColor="accent" delay={120} />
          <StatCard title="Prospectos" value={prospectCount} icon={<AlertTriangle className="h-7 w-7" />} accentColor="warning" delay={180} />
          <StatCard
            title="Diagnosticos en QC"
            value={qcCount}
            icon={<Stethoscope className="h-7 w-7" />}
            accentColor={qcCount > 0 ? "error" : "success"}
            subtext={qcCount > 0 ? "Requieren validacion" : "Al dia"}
            delay={240}
          />
          <StatCard title="Retainers activos" value={retainerActive} icon={<Calendar className="h-7 w-7" />} accentColor="success" delay={300} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sora text-lg font-semibold text-foreground">Atencion requerida</h2>
              {alerts.length > 1 && (
                <span className="rounded-full bg-status-error/15 px-2.5 py-0.5 text-xs font-bold text-status-error">
                  {alerts.filter((a) => a.level === "critical" || a.level === "warning").length}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Link key={alert.id} href={alert.href} className="block">
                  <AlertWidget
                    level={alert.level}
                    title={alert.title}
                    description={alert.description}
                    clientName={alert.clientName}
                    timestamp={alert.timestamp}
                  />
                </Link>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sora text-lg font-semibold text-foreground">Clientes recientes</h2>
              <Link href="/app/clients" className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="grid grid-cols-[1.5fr_1fr_auto] gap-4 border-b border-border bg-surface-strong px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Cliente</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Industria</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Estado</span>
              </div>

              <div className="divide-y divide-border">
                {recentClients?.length ? (
                  recentClients.map((client) => {
                    const statusCfg = STATUS_CONFIG[client.status] ?? {
                      label: String(client.status ?? "Sin estado"),
                      variant: "muted" as const,
                    };

                    return (
                      <Link
                        key={client.id}
                        href={`/app/clients/${client.id}`}
                        className="group grid grid-cols-[1.5fr_1fr_auto] items-center gap-4 px-4 py-3.5 transition hover:bg-surface-strong"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
                            {client.name}
                          </p>
                          <p className="mt-0.5 text-xs text-foreground/40">{formatRelative(String(client.updated_at))}</p>
                        </div>
                        <p className="truncate text-xs text-foreground/60">{client.industry ?? "-"}</p>
                        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                      </Link>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <Users className="h-8 w-8 text-foreground/20" />
                    <div>
                      <p className="text-sm font-medium text-foreground/60">Sin clientes aun</p>
                      <p className="mt-1 text-xs text-foreground/40">Agrega tu primer cliente para comenzar.</p>
                    </div>
                    <Link
                      href="/app/clients"
                      className="mt-1 flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/15"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Agregar cliente
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
