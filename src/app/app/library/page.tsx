import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("id, name, category, visible_in_portal, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">Inteligencia</p>
          <h1 className="mt-3 text-3xl font-semibold">Biblioteca de inteligencia</h1>
          <p className="mt-2 text-sm text-slate-400">
            Repositorio transversal de evidencia para diagnosticos y entregables de consultoria.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="grid grid-cols-[1.3fr_1fr_0.7fr_0.8fr] gap-3 border-b border-slate-800 pb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
            <span>Documento</span>
            <span>Categoria</span>
            <span>Portal</span>
            <span>Fecha</span>
          </div>
          <div className="divide-y divide-slate-800">
            {documents?.length ? (
              documents.map((document) => (
                <div key={document.id} className="grid grid-cols-[1.3fr_1fr_0.7fr_0.8fr] gap-3 py-3 text-sm">
                  <span className="text-slate-200">{document.name}</span>
                  <span className="text-slate-400">{document.category ?? "Sin categoria"}</span>
                  <span className="text-slate-400">{document.visible_in_portal ? "Visible" : "Interno"}</span>
                  <span className="text-slate-500">{new Date(document.created_at).toLocaleDateString("es-MX")}</span>
                </div>
              ))
            ) : (
              <div className="py-6 text-sm text-slate-400">Aun no hay documentos en la biblioteca.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
