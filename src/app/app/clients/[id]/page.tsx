import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  inviteClientToPortal,
  saveClientNotes,
  signOut,
  toggleDocumentPortalVisibility,
  updateClientStatus,
  uploadClientDocument,
} from "../../actions";
import { createClient } from "@/lib/supabase/server";

type ClientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ClientDocument = {
  id: string;
  name: string;
  bucket_id: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  category: string | null;
  tags: string[];
  ai_summary: string | null;
  visible_in_portal: boolean;
  created_at: string;
};

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: client } = await supabase
    .from("clients")
    .select(
      "id, name, industry, company_size, status, primary_contact_name, primary_contact_email, primary_contact_phone, strategic_context, commercial_context, internal_notes, created_at, updated_at"
    )
    .eq("id", id)
    .single();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, name, bucket_id, storage_path, mime_type, size_bytes, category, tags, ai_summary, visible_in_portal, created_at")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const { data: pendingInvite } = await supabase
    .from("client_portal_invites")
    .select("email, status, created_at")
    .eq("client_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const typedDocuments = (documents ?? []) as ClientDocument[];

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

  if (!client) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/app" className="text-sm text-cyan-300 transition hover:text-cyan-200">
              ← Volver al workspace
            </Link>
            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-cyan-400">Expediente de cliente</p>
            <h1 className="mt-3 text-3xl font-semibold">{client.name}</h1>
            <p className="mt-2 text-sm text-slate-400">
              {client.industry ?? "Sin industria"} · {client.company_size ?? "Tamano no definido"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
              {client.status}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <section className="space-y-6">
            <div id="documentos" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Overview</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estado</p>
                  <p className="mt-2 text-lg font-medium text-slate-100">{client.status}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Ultima actualizacion</p>
                  <p className="mt-2 text-lg font-medium text-slate-100">
                    {new Date(client.updated_at).toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>
            </div>

            <div id="portal" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Contacto principal</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Nombre</p>
                  <p className="mt-2">{client.primary_contact_name ?? "Sin definir"}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</p>
                  <p className="mt-2 break-all">{client.primary_contact_email ?? "Sin definir"}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Telefono</p>
                  <p className="mt-2">{client.primary_contact_phone ?? "Sin definir"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Contexto estrategico</h2>
              <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
                {client.strategic_context ?? "Aun no se ha capturado contexto estrategico para este cliente."}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Contexto comercial</h2>
              <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
                {client.commercial_context ?? "Aun no se ha capturado contexto comercial para este cliente."}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Documentos</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Repositorio del cliente sobre Supabase Storage.
                  </p>
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {documents?.length ?? 0} archivos
                </p>
              </div>

              <form action={uploadClientDocument} className="mt-6 grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <input type="hidden" name="clientId" value={client.id} />
                <input
                  type="file"
                  name="document"
                  required
                  className="rounded-xl border border-dashed border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-950"
                />
                <div className="grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
                  <input
                    name="category"
                    placeholder="Categoria"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                  />
                  <input
                    name="tags"
                    placeholder="Tags separadas por coma"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" name="visibleInPortal" className="size-4 rounded border-slate-700 bg-slate-950" />
                  Visible en portal del cliente
                </label>
                <button
                  type="submit"
                  className="w-fit rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                >
                  Subir documento
                </button>
              </form>

              <div className="mt-6 space-y-3">
                {documents?.length ? (
                  typedDocuments.map((document) => {
                    const signedUrl = signedUrlMap.get(document.id);
                    const sizeInKb = Math.max(1, Math.round((document.size_bytes ?? 0) / 1024));

                    return (
                      <div
                        key={document.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-medium text-slate-100">{document.name}</p>
                              <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                {document.category ?? "sin categoria"}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-400">
                              {sizeInKb} KB · {document.mime_type ?? "tipo no detectado"}
                            </p>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                              {document.ai_summary ?? "Resumen IA pendiente."}
                            </p>
                            {document.tags.length ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {document.tags.map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex min-w-[220px] flex-col gap-3">
                            {signedUrl ? (
                              <a
                                href={signedUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl border border-slate-700 px-4 py-2 text-center text-sm transition hover:bg-slate-800"
                              >
                                Abrir documento
                              </a>
                            ) : null}
                            <form action={toggleDocumentPortalVisibility} className="grid gap-2">
                              <input type="hidden" name="documentId" value={document.id} />
                              <input type="hidden" name="clientId" value={client.id} />
                              <input
                                type="hidden"
                                name="visibleInPortal"
                                value={document.visible_in_portal ? "false" : "true"}
                              />
                              <button
                                type="submit"
                                className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
                              >
                                {document.visible_in_portal ? "Ocultar del portal" : "Mostrar en portal"}
                              </button>
                            </form>
                            <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              {document.visible_in_portal ? "Visible en portal" : "Solo interno"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                    Aun no hay documentos cargados para este cliente.
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Cambiar estado</h2>
              <form action={updateClientStatus} className="mt-4 grid gap-3">
                <input type="hidden" name="clientId" value={client.id} />
                <select
                  name="status"
                  defaultValue={client.status}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                >
                  <option value="prospect">Prospect</option>
                  <option value="active">Active</option>
                  <option value="retainer">Retainer</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                >
                  Guardar estado
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Portal del cliente</h2>
              <p className="mt-2 text-sm text-slate-400">
                Genera o reenvia magic link para acceso al portal de solo lectura.
              </p>
              <form action={inviteClientToPortal} className="mt-4 grid gap-3">
                <input type="hidden" name="clientId" value={client.id} />
                <input
                  type="email"
                  name="email"
                  defaultValue={pendingInvite?.email ?? client.primary_contact_email ?? ""}
                  placeholder="correo@cliente.com"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
                >
                  {pendingInvite?.email ? "Reenviar acceso" : "Invitar al portal"}
                </button>
              </form>
              {pendingInvite?.email ? (
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  Invitacion {pendingInvite.status} para {pendingInvite.email}
                </p>
              ) : null}
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Notas internas</h2>
              <p className="mt-2 text-sm text-slate-400">Solo visibles para el consultor.</p>
              <form action={saveClientNotes} className="mt-4 grid gap-3">
                <input type="hidden" name="clientId" value={client.id} />
                <textarea
                  name="internalNotes"
                  defaultValue={client.internal_notes ?? ""}
                  rows={10}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
                >
                  Guardar notas
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Acciones rapidas</h2>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <Link
                  href={`/app/diagnostics/new?clientId=${client.id}`}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:bg-slate-900"
                >
                  Nuevo diagnostico
                </Link>
                <Link
                  href={`/app/clients/${client.id}/chat`}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:bg-slate-900"
                >
                  Abrir chat IA
                </Link>
                <a href="#portal" className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:bg-slate-900">
                  Invitar al portal
                </a>
                <a href="#documentos" className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:bg-slate-900">
                  Subir documento
                </a>
                <Link
                  href={`/app/clients/${client.id}/retainer`}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:bg-slate-900"
                >
                  Iniciar retainer
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}