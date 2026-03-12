"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FindingItem = {
  id: string;
  title: string;
  status: string;
};

type Props = {
  diagnosticId: string;
  findings: FindingItem[];
};

export default function RegeneratePanel({ diagnosticId, findings }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(
    findings.filter((finding) => finding.status === "rejected").map((finding) => finding.id)
  );
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggleFinding(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function handleRegenerate() {
    if (!selected.length) {
      setError("Selecciona al menos un hallazgo.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`/api/diagnostics/${diagnosticId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ findingIds: selected, instructions }),
      });

      const json = (await response.json().catch(() => null)) as {
        ok?: boolean;
        updatedCount?: number;
        error?: string;
      } | null;

      if (!response.ok || !json?.ok) {
        throw new Error(json?.error ?? "No se pudo regenerar los hallazgos");
      }

      setResult(`Se regeneraron ${json.updatedCount ?? selected.length} hallazgos.`);
      setInstructions("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-amber-900/50 bg-amber-950/15 p-6">
      <h3 className="text-lg font-semibold text-amber-200">Regeneración parcial</h3>
      <p className="mt-1 text-sm text-amber-100/70">
        Selecciona hallazgos rechazados, agrega instrucciones y regenera solo esos elementos.
      </p>

      <div className="mt-4 max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-amber-900/40 bg-slate-950/40 p-3">
        {findings.length ? (
          findings.map((finding) => (
            <label
              key={finding.id}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={selectedSet.has(finding.id)}
                onChange={() => toggleFinding(finding.id)}
                className="mt-0.5 size-4 rounded border-slate-600 bg-slate-900"
              />
              <span className="min-w-0">
                <span className="block truncate text-slate-100">{finding.title}</span>
                <span className="mt-0.5 block text-xs uppercase tracking-[0.16em] text-slate-500">
                  {finding.status}
                </span>
              </span>
            </label>
          ))
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-400">
            No hay hallazgos para seleccionar.
          </div>
        )}
      </div>

      <textarea
        value={instructions}
        onChange={(event) => setInstructions(event.target.value)}
        rows={3}
        placeholder="Instrucciones para la regeneración (ej: enfocar en EBITDA y capex, incluir cifras concretas y quick wins 90 días)."
        className="mt-4 w-full rounded-2xl border border-amber-900/40 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none ring-amber-400 focus:ring"
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">Seleccionados: {selected.length}</p>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={loading || !findings.length}
          className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Regenerando…" : "Regenerar seleccionados"}
        </button>
      </div>

      {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
      {result ? <p className="mt-3 text-xs text-emerald-400">{result}</p> : null}
    </div>
  );
}
