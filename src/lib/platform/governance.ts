export type AiProviderKey = "anthropic" | "openai" | "perplexity";

export type PremiumPlanKey = "starter" | "growth" | "scale";

export const AI_PROVIDER_CATALOG: Array<{
  key: AiProviderKey;
  label: string;
  envKey: string;
  purpose: string;
}> = [
  {
    key: "anthropic",
    label: "Proveedor IA 1",
    envKey: "ANTHROPIC_API_KEY",
    purpose: "Analisis profundo y redaccion estructurada",
  },
  {
    key: "openai",
    label: "Proveedor IA 2",
    envKey: "OPENAI_API_KEY",
    purpose: "Validacion cruzada y generacion de variantes",
  },
  {
    key: "perplexity",
    label: "Proveedor IA 3",
    envKey: "PERPLEXITY_API_KEY",
    purpose: "Investigacion web y evidencia reciente",
  },
];

export const PREMIUM_SOURCE_CATALOG: Array<{
  key: string;
  label: string;
  type: "premium" | "free";
}> = [
  { key: "statista", label: "Statista", type: "premium" },
  { key: "ibisworld", label: "IBISWorld", type: "premium" },
  { key: "euromonitor", label: "Euromonitor", type: "premium" },
  { key: "inegi", label: "INEGI", type: "free" },
  { key: "banxico", label: "Banxico", type: "free" },
  { key: "world_bank", label: "World Bank", type: "free" },
];

export const PREMIUM_PLAN_POLICIES: Array<{
  key: PremiumPlanKey;
  label: string;
  monthlyReportRuns: number;
  monthlyPremiumQueries: number;
  monthlyPremiumDownloads: number;
  enabledPremiumSources: string[];
}> = [
  {
    key: "starter",
    label: "Starter",
    monthlyReportRuns: 10,
    monthlyPremiumQueries: 25,
    monthlyPremiumDownloads: 10,
    enabledPremiumSources: ["statista"],
  },
  {
    key: "growth",
    label: "Growth",
    monthlyReportRuns: 30,
    monthlyPremiumQueries: 100,
    monthlyPremiumDownloads: 40,
    enabledPremiumSources: ["statista", "ibisworld"],
  },
  {
    key: "scale",
    label: "Scale",
    monthlyReportRuns: 80,
    monthlyPremiumQueries: 300,
    monthlyPremiumDownloads: 120,
    enabledPremiumSources: ["statista", "ibisworld", "euromonitor"],
  },
];

function isValidPlan(value: string): value is PremiumPlanKey {
  return value === "starter" || value === "growth" || value === "scale";
}

export function resolveTenantPlan(tenantId: string): PremiumPlanKey {
  const defaultPlan = process.env.CP_DEFAULT_PLAN;
  const safeDefault = defaultPlan && isValidPlan(defaultPlan) ? defaultPlan : "starter";
  const rawOverrides = process.env.CP_TENANT_PLAN_OVERRIDES;

  if (!rawOverrides) {
    return safeDefault;
  }

  try {
    const parsed = JSON.parse(rawOverrides) as Record<string, string>;
    const tenantPlan = parsed[tenantId];
    if (tenantPlan && isValidPlan(tenantPlan)) {
      return tenantPlan;
    }
  } catch {
    return safeDefault;
  }

  return safeDefault;
}

type TenantMembershipReader = {
  from: (table: "tenant_memberships") => {
    select: (columns: "plan") => {
      eq: (column: "tenant_id", value: string) => {
        maybeSingle: () => PromiseLike<{ data: { plan: string | null } | null; error: unknown }>;
      };
    };
  };
};

export async function resolveTenantPlanFromDb(supabase: TenantMembershipReader, tenantId: string) {
  const { data, error } = await supabase
    .from("tenant_memberships")
    .select("plan")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (!error && data?.plan && isValidPlan(data.plan)) {
    return data.plan;
  }

  return resolveTenantPlan(tenantId);
}

export function getPolicyByPlan(plan: PremiumPlanKey) {
  return PREMIUM_PLAN_POLICIES.find((policy) => policy.key === plan) ?? PREMIUM_PLAN_POLICIES[0];
}

export function getCurrentMonthBounds(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

export function getAiProviderConnections() {
  return AI_PROVIDER_CATALOG.map((provider) => ({
    ...provider,
    connected: Boolean(process.env[provider.envKey]),
  }));
}
