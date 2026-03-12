import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAppProfile } from "@/lib/auth/profile";

type PortalDocument = {
  id: string;
  name: string;
  bucket_id: string;
  storage_path: string;
  category: string | null;
  mime_type: string | null;
  visible_in_portal: boolean;
  created_at: string;
};

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/portal");
  }

  const profile = await getAppProfile(supabase, user);

  if (!profile || profile.role !== "client" || !profile.client_id) {
    redirect("/app");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, industry, status, strategic_context")
    .eq("id", profile.client_id)
    .single();

  if (!client) {
    redirect("/login");
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("id, name, bucket_id, storage_path, category, mime_type, visible_in_portal, created_at")
    .eq("client_id", profile.client_id)
    .eq("visible_in_portal", true)
    .order("created_at", { ascending: false });

  const typedDocuments = (documents ?? []) as PortalDocument[];

  const signedUrls = typedDocuments.length
    ? await Promise.all(
        typedDocuments.map(async (document) => {
          const { data } = await supabase.storage
            .from(document.bucket_id)
            .createSignedUrl(document.storage_path, 60 * 60);

          return [document.id, data?.signedUrl ?? null] as const;
        })
      )
    : [];

  const signedUrlMap = new Map(signedUrls);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">Portal del cliente</p>
          <h1 className="mt-3 text-3xl font-semibold">{client.name}</h1>
          <p className="mt-2 text-slate-300">Bienvenido{profile.full_name ? `, ${profile.full_name}` : ""}.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estado</p>
              <p className="mt-2 text-lg font-medium text-slate-100">{client.status}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Industria</p>
              <p className="mt-2 text-lg font-medium text-slate-100">{client.industry ?? "Sin industria"}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Documentos visibles</p>
              <p className="mt-2 text-lg font-medium text-slate-100">{typedDocuments.length}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Mis documentos</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Solo se muestran los archivos compartidos por el consultor.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {typedDocuments.length ? (
                typedDocuments.map((document) => {
                  const signedUrl = signedUrlMap.get(document.id);

                  return (
                    <div key={document.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium text-slate-100">{document.name}</p>
                          <p className="mt-1 text-sm text-slate-400">
                            {document.category ?? "Sin categoria"} · {document.mime_type ?? "tipo no detectado"}
                          </p>
                        </div>
                        {signedUrl ? (
                          <a
                            href={signedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl border border-slate-700 px-4 py-2 text-center text-sm transition hover:bg-slate-800"
                          >
                            Abrir
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                  Aun no hay documentos visibles para tu portal.
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Resumen</h2>
              <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
                {client.strategic_context ?? "Tu consultor compartira aqui el contexto relevante del proyecto."}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Acceso</h2>
              <p className="mt-2 text-sm text-slate-400">
                Este portal es de solo lectura y solo muestra la informacion compartida por Consulting Partners.
              </p>
              <Link href="/login" className="mt-4 inline-flex text-sm text-cyan-300 transition hover:text-cyan-200">
                Volver a login
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}