import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role === "client") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { data: diagnostic } = await supabase
    .from("diagnostics")
    .select(
      "id, status, processing_started_at, processed_at, processing_step, processing_step_label, input_tokens, output_tokens, estimated_cost_usd, primary_model, validation_model, processing_error, tenant_id"
    )
    .eq("id", id)
    .single();

  if (!diagnostic || diagnostic.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: "Diagnóstico no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, diagnostic });
}
