import type { SupabaseClient, User } from "@supabase/supabase-js";

export type AppRole = "consultant" | "client" | "super_admin";

export type AppProfile = {
  tenant_id: string;
  role: AppRole;
  full_name: string | null;
  client_id: string | null;
};

export async function getAppProfile(supabase: SupabaseClient, user: User) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role, full_name, client_id")
    .eq("user_id", user.id)
    .single();

  return (profile ?? null) as AppProfile | null;
}

export function getDefaultRouteForRole(role: AppRole | null | undefined) {
  if (role === "client") {
    return "/portal";
  }

  if (role === "super_admin") {
    return "/admin";
  }

  return "/app";
}