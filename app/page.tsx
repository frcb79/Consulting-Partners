import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-4xl font-bold mb-4">PETER - Consultoría Aumentada</h1>
      <p className="mb-6 text-slate-300">Bienvenido al sistema. Inicia sesión para continuar.</p>
      <div className="space-x-2">
        <Link href="/login" className="rounded bg-accent-blue px-4 py-2 font-semibold hover:bg-blue-700">
          Login
        </Link>
        <Link href="/app" className="rounded border border-white/20 px-4 py-2 font-semibold hover:bg-white/5">
          Dashboard
        </Link>
      </div>
    </main>
  );
}
