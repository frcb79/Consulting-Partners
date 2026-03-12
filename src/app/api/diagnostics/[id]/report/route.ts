import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ id: string }> };

type DiagnosticClient = {
  id: string;
  name: string;
};

type Finding = {
  title: string;
  body: string;
  so_what: string | null;
  impact_estimate: string | null;
  status: string;
};

function wrapText(text: string, maxChars = 95) {
  const safeText = text.replace(/\s+/g, " ").trim();
  if (!safeText) return [""];

  const words = safeText.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function normalizeFileName(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id: diagnosticId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role, client_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.tenant_id) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { data: diagnostic } = await supabase
    .from("diagnostics")
    .select("id, title, framework, areas, status, client_id, created_at, processed_at, tenant_id, clients(id, name)")
    .eq("id", diagnosticId)
    .single();

  if (!diagnostic) {
    return NextResponse.json({ error: "Diagnóstico no encontrado" }, { status: 404 });
  }

  if (diagnostic.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  if (profile.role === "client" && profile.client_id !== diagnostic.client_id) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  if (profile.role === "client") {
    await supabase.from("client_report_views").upsert({
      tenant_id: profile.tenant_id,
      diagnostic_id: diagnostic.id,
      client_user_id: user.id,
      viewed_at: new Date().toISOString(),
    });
  }

  const { data: findings } = await supabase
    .from("findings")
    .select("title, body, so_what, impact_estimate, status")
    .eq("diagnostic_id", diagnosticId)
    .order("display_order", { ascending: true });

  const typedFindings = (findings ?? []) as Finding[];
  const client = Array.isArray(diagnostic.clients)
    ? (diagnostic.clients[0] as DiagnosticClient | undefined)
    : (diagnostic.clients as DiagnosticClient | undefined);

  const pdf = await PDFDocument.create();
  const pageSize = { width: 595, height: 842 };
  let page = pdf.addPage([pageSize.width, pageSize.height]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const marginX = 48;
  const topY = 800;
  const lineHeight = 14;
  let y = topY;

  function ensurePage(requiredSpace = 28) {
    if (y < 70 + requiredSpace) {
      page = pdf.addPage([pageSize.width, pageSize.height]);
      y = topY;
    }
  }

  function drawTitle(text: string) {
    ensurePage(40);
    page.drawText(text, { x: marginX, y, size: 20, font: fontBold, color: rgb(0.1, 0.15, 0.25) });
    y -= 30;
  }

  function drawSubtitle(text: string) {
    ensurePage(24);
    page.drawText(text, { x: marginX, y, size: 11, font, color: rgb(0.3, 0.35, 0.45) });
    y -= 18;
  }

  function drawSectionHeading(text: string) {
    ensurePage(24);
    page.drawText(text, { x: marginX, y, size: 13, font: fontBold, color: rgb(0.15, 0.2, 0.35) });
    y -= 18;
  }

  function drawParagraph(text: string, indent = 0) {
    const lines = wrapText(text, 98 - Math.floor(indent / 3));
    for (const line of lines) {
      ensurePage(lineHeight);
      page.drawText(line, { x: marginX + indent, y, size: 10.5, font, color: rgb(0.1, 0.1, 0.1) });
      y -= lineHeight;
    }
    y -= 4;
  }

  const areaText = Array.isArray(diagnostic.areas) && diagnostic.areas.length
    ? diagnostic.areas.join(", ")
    : "Sin áreas definidas";

  drawTitle("Consulting Partners - Reporte de Diagnóstico");
  drawSubtitle(`Cliente: ${client?.name ?? "Sin cliente"}`);
  drawSubtitle(`Diagnóstico: ${diagnostic.title}`);
  drawSubtitle(`Framework: ${diagnostic.framework} · Estado: ${diagnostic.status}`);
  drawSubtitle(`Fecha de creación: ${new Date(diagnostic.created_at).toLocaleString("es-MX")}`);
  if (diagnostic.processed_at) {
    drawSubtitle(`Fecha de procesamiento: ${new Date(diagnostic.processed_at).toLocaleString("es-MX")}`);
  }
  y -= 8;

  drawSectionHeading("Áreas Analizadas");
  drawParagraph(areaText);

  drawSectionHeading(`Hallazgos (${typedFindings.length})`);

  if (!typedFindings.length) {
    drawParagraph("No hay hallazgos registrados para este diagnóstico.");
  }

  typedFindings.forEach((finding, index) => {
    ensurePage(86);
    page.drawText(`${index + 1}. ${finding.title}`, {
      x: marginX,
      y,
      size: 12,
      font: fontBold,
      color: rgb(0.08, 0.12, 0.2),
    });
    y -= 18;

    drawParagraph(`Estado: ${finding.status}`, 8);
    drawParagraph(finding.body, 8);

    if (finding.so_what) {
      drawParagraph(`So what: ${finding.so_what}`, 8);
    }

    if (finding.impact_estimate) {
      drawParagraph(`Impacto estimado: ${finding.impact_estimate}`, 8);
    }

    y -= 6;
  });

  const bytes = await pdf.save();
  const body = Buffer.from(bytes);
  const safeName = normalizeFileName(`${client?.name ?? "cliente"}-${diagnostic.title}`) || "diagnostico";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="reporte-${safeName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
