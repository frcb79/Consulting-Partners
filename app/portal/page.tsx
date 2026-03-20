import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function PortalPage() {
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

  if (profile.error || !profile.data || profile.data.role !== 'client') {
    redirect('/app');
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold">Portal Cliente</h1>
      <p className="mt-2 text-slate-300">Bienvenido, {profile.data.full_name ?? data.user.email}.</p>
      <p className="mt-6">Aquí verás el contenido privado para clientes.</p>
    </main>
  );
}
