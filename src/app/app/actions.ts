"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createClientRecord(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const rawName = formData.get("name");
  const rawIndustry = formData.get("industry");

  const name = typeof rawName === "string" ? rawName.trim() : "";
  const industry = typeof rawIndustry === "string" ? rawIndustry.trim() : "";

  if (!name) {
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.tenant_id) {
    return;
  }

  await supabase.from("clients").insert({
    tenant_id: profile.tenant_id,
    name,
    industry: industry || null,
    created_by: user.id,
  });

  revalidatePath("/app");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
