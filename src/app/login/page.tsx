"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth/errors";

export default function LoginPage() {
  const [nextUrl] = useState(() => {
    if (typeof window === "undefined") {
      return "/app";
    }

    const params = new URLSearchParams(window.location.search);
    return params.get("next") ?? "/app";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function signInWithPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(getAuthErrorMessage(error.message));
      setLoading(false);
      return;
    }

    window.location.href = nextUrl;
  }

  async function sendMagicLink() {
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setMessage(getAuthErrorMessage(error.message));
      setLoading(false);
      return;
    }

    setMessage("Magic link enviado. Revisa tu correo.");
    setLoading(false);
  }

  async function sendPasswordRecovery() {
    if (!email) {
      setMessage("Ingresa tu email para recuperar contraseña.");
      return;
    }

    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setMessage(getAuthErrorMessage(error.message));
      setLoading(false);
      return;
    }

    setMessage("Correo de recuperación enviado. Revisa tu bandeja de entrada.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-10">
        <section className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">Consulting Partners</p>
          <h1 className="mt-3 text-2xl font-semibold">Inicia sesion</h1>
          <p className="mt-2 text-sm text-slate-300">Acceso para consultores y clientes.</p>

          <form onSubmit={signInWithPassword} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-300">Email</span>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-cyan-400 focus:ring"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-slate-300">Password</span>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-cyan-400 focus:ring"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar con password"}
            </button>
          </form>

          <button
            type="button"
            onClick={sendMagicLink}
            disabled={loading || !email}
            className="mt-3 w-full rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
          >
            Enviar magic link
          </button>

          <button
            type="button"
            onClick={sendPasswordRecovery}
            disabled={loading || !email}
            className="mt-2 w-full rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
          >
            Recuperar contraseña
          </button>

          {message ? <p className="mt-4 text-sm text-cyan-300">{message}</p> : null}
        </section>
      </div>
    </main>
  );
}
