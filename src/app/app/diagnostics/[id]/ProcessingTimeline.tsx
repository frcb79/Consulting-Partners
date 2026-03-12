"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Snapshot = {
  status: string;
  processing_started_at: string | null;
  processed_at: string | null;
  processing_step: number;
  processing_step_label: string | null;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
  primary_model: string | null;
  validation_model: string | null;
  processing_error: string | null;
};

type Props = {
  diagnosticId: string;
  initialSnapshot: Snapshot;
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

function elapsedSeconds(snapshot: Snapshot) {
  if (!snapshot.processing_started_at) {
    return 0;
  }

  const start = new Date(snapshot.processing_started_at).getTime();
  const end = snapshot.processed_at ? new Date(snapshot.processed_at).getTime() : Date.now();
  return Math.max(0, Math.floor((end - start) / 1000));
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function ProcessingTimeline({ diagnosticId, initialSnapshot }: Props) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<Snapshot>(initialSnapshot);

  useEffect(() => {
    if (snapshot.status !== "processing") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/diagnostics/${diagnosticId}/status`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const json = (await response.json()) as { ok?: boolean; diagnostic?: Snapshot };
        if (!json.ok || !json.diagnostic) {
          return;
        }

        setSnapshot(json.diagnostic);

        if (json.diagnostic.status !== "processing") {
          router.refresh();
        }
      } catch {
        // Ignore polling errors and keep UI responsive.
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [diagnosticId, router, snapshot.status]);

  const totalTokens = (snapshot.input_tokens ?? 0) + (snapshot.output_tokens ?? 0);
  const duration = useMemo(() => elapsedSeconds(snapshot), [snapshot]);

  return (
    <div className="rounded-3xl border border-cyan-900/50 bg-gradient-to-br from-cyan-950/30 via-slate-900/80 to-slate-950 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Procesamiento IA</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-100">
            {snapshot.status === "processing" ? "Pipeline en curso" : "Pipeline finalizado"}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{snapshot.processing_step_label ?? "Preparando ejecución"}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-slate-300">
            <span className="text-slate-500">Tiempo</span>
            <p className="mt-0.5 font-semibold text-cyan-300">{formatTime(duration)}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-slate-300">
            <span className="text-slate-500">Tokens</span>
            <p className="mt-0.5 font-semibold text-cyan-300">{totalTokens.toLocaleString("es-MX")}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-slate-300">
            <span className="text-slate-500">Costo est.</span>
            <p className="mt-0.5 font-semibold text-cyan-300">${Number(snapshot.estimated_cost_usd ?? 0).toFixed(4)} USD</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-slate-300">
            <span className="text-slate-500">Modelos</span>
            <p className="mt-0.5 font-semibold text-cyan-300">
              {snapshot.primary_model ?? "-"}
              {snapshot.validation_model ? ` + ${snapshot.validation_model}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {STEPS.map((stepLabel, index) => {
          const step = index + 1;
          const done = snapshot.processing_step >= step && snapshot.status !== "failed";
          const inProgress = snapshot.status === "processing" && snapshot.processing_step === step;

          return (
            <div
              key={stepLabel}
              className={`rounded-2xl border px-4 py-3 text-sm ${
                done
                  ? "border-emerald-800/60 bg-emerald-950/20 text-emerald-300"
                  : inProgress
                  ? "border-cyan-800/60 bg-cyan-950/20 text-cyan-300"
                  : "border-slate-800 bg-slate-950/70 text-slate-500"
              }`}
            >
              <span className="mr-2 text-xs">{step}.</span>
              {stepLabel}
              {inProgress ? <span className="ml-2 animate-pulse text-xs">procesando...</span> : null}
            </div>
          );
        })}
      </div>

      {snapshot.status === "failed" && snapshot.processing_error ? (
        <div className="mt-4 rounded-xl border border-red-800/60 bg-red-950/30 px-3 py-2 text-xs text-red-400">
          {snapshot.processing_error}
        </div>
      ) : null}
    </div>
  );
}
