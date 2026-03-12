import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAppProfile, getDefaultRouteForRole } from "@/lib/auth/profile";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const profile = await getAppProfile(supabase, user);
    redirect(getDefaultRouteForRole(profile?.role));
  }

  redirect("/login");
}
