"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!password || password.length < 8) {
      setMessage("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
    setLoading(false);
    setPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm uppercase tracking-[0.22em] text-cyan-400">Consulting Partners</p>
        <h1 className="mt-3 text-2xl font-semibold">Restablecer contraseña</h1>
        <p className="mt-2 text-sm text-slate-400">
          Define una nueva contraseña para tu cuenta.
        </p>

        <form onSubmit={handleReset} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-300">Nueva contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-cyan-400 focus:ring"
              required
              minLength={8}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-300">Confirmar contraseña</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-cyan-400 focus:ring"
              required
              minLength={8}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-cyan-300">{message}</p> : null}

        <Link href="/login" className="mt-4 inline-flex text-sm text-cyan-300 transition hover:text-cyan-200">
          Volver a login
        </Link>
      </section>
    </main>
  );
}
