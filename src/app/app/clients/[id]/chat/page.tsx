import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatPanel from "./ChatPanel";

type PageProps = {
  params: Promise<{ id: string }>;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default async function ClientChatPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role === "client") {
    redirect("/app");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, industry, status")
    .eq("id", id)
    .single();

  if (!client) {
    notFound();
  }

  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("client_id", id)
    .order("created_at", { ascending: true })
    .limit(30);

  const initialMessages = ((history ?? []) as ChatMessage[]).filter(
    (message) => message.role === "user" || message.role === "assistant"
  );

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <Link href={`/app/clients/${client.id}`} className="text-sm text-cyan-300 transition hover:text-cyan-200">
            ← Volver al expediente
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-cyan-400">Chat IA del cliente</p>
          <h1 className="mt-3 text-3xl font-semibold">{client.name}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {client.industry ?? "Sin industria"} · estado {client.status}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <ChatPanel clientId={client.id} initialMessages={initialMessages} hasApiKey={Boolean(process.env.ANTHROPIC_API_KEY)} />
        </div>
      </section>
    </main>
  );
}
