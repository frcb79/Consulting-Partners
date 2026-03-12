"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  diagnosticId: string;
  hasApiKey: boolean;
  currentStatus: string;
};

type ProcessingSnapshot = {
  status: string;
  processing_step: number;
  processing_step_label: string | null;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
  processing_error: string | null;
};

const STEPS = [
  "Inicializando diagnóstico",
  "Cargando documentos asociados",
  "Extrayendo texto de fuentes",
  "Generando hallazgos con IA",
  "Validación cruzada",
  "Persistiendo hallazgos",
  "Completado",
];

export default function ExecuteButton({ diagnosticId, hasApiKey, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(currentStatus === "processing");
  const [error, setError] = useState<string | null>(null);
  const [findingsCount, setFindingsCount] = useState<number | null>(null);
  const [snapshot, setSnapshot] = useState<ProcessingSnapshot | null>(null);

  useEffect(() => {
    if (!loading) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/diagnostics/${diagnosticId}/status`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) return;
        const json = (await response.json()) as { ok?: boolean; diagnostic?: ProcessingSnapshot };

        if (json.ok && json.diagnostic) {
          setSnapshot(json.diagnostic);
        }
      } catch {
        // Keep UX stable if status polling temporarily fails.
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [diagnosticId, loading]);

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
    setSnapshot(null);

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
        <>
          <div className="space-y-1">
            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-500" />
            </div>
            <p className="text-xs text-slate-400">
              Claude Sonnet está analizando los documentos. Esto puede tomar 30–90 segundos…
            </p>
          </div>

          <div className="fixed inset-0 z-50 bg-slate-950/95 p-6 text-slate-100 md:p-8">
            <div className="mx-auto max-w-4xl rounded-3xl border border-cyan-900/50 bg-slate-900/80 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-400">Procesamiento en vivo</p>
              <h3 className="mt-2 text-2xl font-semibold">Motor de Diagnóstico IA</h3>
              <p className="mt-2 text-sm text-slate-400">
                {snapshot?.processing_step_label ?? "Preparando ejecución..."}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs">
                  <span className="text-slate-500">Paso actual</span>
                  <p className="mt-1 font-semibold text-cyan-300">{Math.max(1, snapshot?.processing_step ?? 1)} / 7</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs">
                  <span className="text-slate-500">Tokens</span>
                  <p className="mt-1 font-semibold text-cyan-300">
                    {((snapshot?.input_tokens ?? 0) + (snapshot?.output_tokens ?? 0)).toLocaleString("es-MX")}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs">
                  <span className="text-slate-500">Costo est.</span>
                  <p className="mt-1 font-semibold text-cyan-300">${Number(snapshot?.estimated_cost_usd ?? 0).toFixed(4)} USD</p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {STEPS.map((stepLabel, index) => {
                  const step = index + 1;
                  const done = (snapshot?.processing_step ?? 1) > step;
                  const inProgress = (snapshot?.processing_step ?? 1) === step;
                  return (
                    <div
                      key={stepLabel}
                      className={`rounded-xl border px-3 py-2 text-sm ${
                        done
                          ? "border-emerald-800/60 bg-emerald-950/20 text-emerald-300"
                          : inProgress
                          ? "border-cyan-800/60 bg-cyan-950/20 text-cyan-300"
                          : "border-slate-800 bg-slate-950/60 text-slate-500"
                      }`}
                    >
                      <span className="mr-2 text-xs">{step}.</span>
                      {stepLabel}
                      {inProgress ? <span className="ml-2 animate-pulse text-xs">procesando...</span> : null}
                    </div>
                  );
                })}
              </div>

              {snapshot?.processing_error ? (
                <div className="mt-4 rounded-xl border border-red-800/60 bg-red-950/30 px-3 py-2 text-xs text-red-400">
                  {snapshot.processing_error}
                </div>
              ) : null}
            </div>
          </div>
        </>
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
