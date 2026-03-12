import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getDefaultRouteForRole } from "@/lib/auth/profile";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginRoute = request.nextUrl.pathname.startsWith("/login");
  const isAppRoute = request.nextUrl.pathname.startsWith("/app");
  const isPortalRoute = request.nextUrl.pathname.startsWith("/portal");
  const isProtectedRoute = isAppRoute || isPortalRoute;

  const profile = user
    ? await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => data)
    : null;

  const defaultRoute = getDefaultRouteForRole(profile?.role ?? null);

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = defaultRoute;
    return NextResponse.redirect(url);
  }

  if (user && profile?.role === "client" && isAppRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal";
    return NextResponse.redirect(url);
  }

  if (user && profile?.role !== "client" && isPortalRoute) {
    const url = request.nextUrl.clone();
    url.pathname = defaultRoute;
    return NextResponse.redirect(url);
  }

  return response;
}
