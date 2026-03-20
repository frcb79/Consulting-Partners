import { redirect } from 'next/navigation';
import { getDefaultRouteForRole } from '@/lib/auth/profile';
import { createClient } from '@/lib/supabase/server';

export default async function AppPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect('/login');
  }

  const profile = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', data.user.id)
    .single();

  if (profile.error || !profile.data) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>No se encontró el perfil de usuario. Contacta al administrador.</p>
      </main>
    );
  }

  const defaultRoute = getDefaultRouteForRole(profile.data.role);

  if (defaultRoute !== '/app') {
    redirect(defaultRoute);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-slate-300">Bienvenido, {profile.data.full_name ?? data.user.email}.</p>
      <p className="mt-4">Rol: {profile.data.role}</p>
      <p className="mt-6">Este es el área principal de usuarios (consultores).</p>
    </main>
  );
}
