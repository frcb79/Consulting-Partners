"use client";

import { useMemo, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  clientId: string;
  initialMessages: ChatMessage[];
  hasApiKey: boolean;
};

export default function ChatPanel({ clientId, initialMessages, hasApiKey }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastAssistantMessage = useMemo(() => {
    const reversed = [...messages].reverse();
    return reversed.find((m) => m.role === "assistant")?.content ?? null;
  }, [messages]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();

    if (!trimmed || pending) {
      return;
    }

    setPending(true);
    setError(null);

    const baseMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }, { role: "assistant", content: "" }];
    setMessages(baseMessages);
    setInput("");

    try {
      const response = await fetch(`/api/clients/${clientId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok || !response.body) {
        const json = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? "No se pudo obtener respuesta del asistente.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantAccumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantAccumulated += decoder.decode(value, { stream: true });

        setMessages((current) => {
          const next = [...current];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            next[next.length - 1] = { role: "assistant", content: assistantAccumulated };
          }
          return next;
        });
      }

      const tail = decoder.decode();
      if (tail) {
        assistantAccumulated += tail;
      }

      setMessages((current) => {
        const next = [...current];
        const last = next[next.length - 1];
        if (last?.role === "assistant") {
          next[next.length - 1] = { role: "assistant", content: assistantAccumulated };
        }
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setMessages((current) => current.slice(0, -1));
    } finally {
      setPending(false);
    }
  }

  if (!hasApiKey) {
    return (
      <div className="rounded-2xl border border-amber-800/60 bg-amber-950/30 p-4 text-sm">
        <p className="font-medium text-amber-300">ANTHROPIC_API_KEY no configurada</p>
        <p className="mt-1 text-xs text-amber-400/80">
          Define la variable en .env.local y reinicia el servidor para habilitar el chat IA.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="max-h-[58vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="space-y-3">
          {messages.length ? (
            messages.map((message, idx) => (
              <div
                key={`${idx}-${message.role}`}
                className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-8 border-cyan-900/60 bg-cyan-950/25 text-cyan-50"
                    : "mr-8 border-slate-800 bg-slate-900/60 text-slate-200"
                }`}
              >
                <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  {message.role === "user" ? "Consultor" : "Copiloto IA"}
                </p>
                <p className="whitespace-pre-wrap">{message.content || (pending ? "…" : "")}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">
              Inicia la conversación con una pregunta estratégica sobre este cliente.
            </div>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <textarea
          rows={4}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ejemplo: dame 3 hipótesis de mejora de margen para los próximos 90 días"
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
          disabled={pending}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {pending
              ? "Generando respuesta en streaming..."
              : "El asistente usa contexto del expediente, diagnósticos, hallazgos y documentos."}
          </p>
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Pensando…" : "Enviar"}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-red-800/60 bg-red-950/30 px-3 py-2 text-xs text-red-400">{error}</div>
      )}

      {lastAssistantMessage && !pending ? (
        <p className="text-xs text-slate-500">Última respuesta actualizada.</p>
      ) : null}
    </div>
  );
}
