'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Revisa tu correo para restablecer la contraseña.');
      }
    } catch (err) {
      setError('Error al enviar el email de restablecimiento.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <section className="w-full max-w-md bg-bg-surface p-8 rounded-xl border border-white/10 shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Restablecer contraseña</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded border border-white/10 bg-bg-elevated px-3 py-2 text-white outline-none focus:border-accent-blue"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-accent-blue px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? 'Enviando...' : 'Enviar restablecimiento'}
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-green-400">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      </section>
    </main>
  );
}
