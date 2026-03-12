"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  diagnosticId: string;
  hasApiKey: boolean;
  currentStatus: string;
};

export default function ExecuteButton({ diagnosticId, hasApiKey, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(currentStatus === "processing");
  const [error, setError] = useState<string | null>(null);
  const [findingsCount, setFindingsCount] = useState<number | null>(null);

  if (!hasApiKey) {
    return (
      <div className="rounded-2xl border border-amber-800/60 bg-amber-950/30 p-4 text-sm">
        <p className="font-medium text-amber-300">ANTHROPIC_API_KEY no configurada</p>
        <p className="mt-1 text-xs text-amber-400/80">
          Agrega{" "}
          <code className="font-mono text-amber-300">ANTHROPIC_API_KEY=sk-ant-...</code> en{" "}
          <code className="font-mono text-amber-300">.env.local</code> y reinicia el servidor de desarrollo.
        </p>
      </div>
    );
  }

  async function handleExecute() {
    setLoading(true);
    setError(null);
    setFindingsCount(null);

    try {
      const res = await fetch(`/api/diagnostics/${diagnosticId}/execute`, {
        method: "POST",
      });
      const json = await res.json() as { ok?: boolean; findingsCount?: number; error?: string };

      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Error ejecutando el análisis");
      }

      setFindingsCount(json.findingsCount ?? 0);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {currentStatus === "failed" && !error && (
        <div className="rounded-xl border border-red-800/60 bg-red-950/30 px-3 py-2 text-xs text-red-400">
          El análisis anterior falló. Puedes intentarlo de nuevo.
        </div>
      )}

      <button
        onClick={handleExecute}
        disabled={loading}
        className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Ejecutando análisis IA…" : currentStatus === "failed" ? "Reintentar análisis IA" : "Ejecutar análisis IA"}
      </button>

      {loading && (
        <div className="space-y-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-500" />
          </div>
          <p className="text-xs text-slate-400">
            Claude Sonnet está analizando los documentos. Esto puede tomar 30–90 segundos…
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-800/60 bg-red-950/30 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {findingsCount !== null && (
        <p className="text-xs text-emerald-400">
          ✓ {findingsCount} hallazgos generados. La página se actualizará.
        </p>
      )}
    </div>
  );
}
