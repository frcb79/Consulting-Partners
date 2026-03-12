"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getDefaultRouteForRole } from "@/lib/auth/profile";

const VALID_CLIENT_STATUSES = new Set(["prospect", "active", "retainer", "inactive"]);
const DOCUMENT_BUCKET = "client-documents";

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function parseTags(rawValue: FormDataEntryValue | null) {
  if (typeof rawValue !== "string") {
    return [] as string[];
  }

  return rawValue
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseMultiValue(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
}

async function getSiteUrl() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin;
  }

  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";

  return `${protocol}://${host}`;
}

async function getAuthenticatedContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("user_id", user.id)
    .single();

  return { supabase, user, profile };
}

export async function createClientRecord(formData: FormData) {
  const { supabase, user, profile } = await getAuthenticatedContext();

  const rawName = formData.get("name");
  const rawIndustry = formData.get("industry");
  const rawCompanySize = formData.get("companySize");
  const rawPrimaryContactName = formData.get("primaryContactName");
  const rawPrimaryContactEmail = formData.get("primaryContactEmail");
  const rawPrimaryContactPhone = formData.get("primaryContactPhone");
  const rawStrategicContext = formData.get("strategicContext");
  const rawCommercialContext = formData.get("commercialContext");
  const rawInternalNotes = formData.get("internalNotes");
  const rawStatus = formData.get("status");

  const name = typeof rawName === "string" ? rawName.trim() : "";
  const industry = typeof rawIndustry === "string" ? rawIndustry.trim() : "";
  const companySize = typeof rawCompanySize === "string" ? rawCompanySize.trim() : "";
  const primaryContactName =
    typeof rawPrimaryContactName === "string" ? rawPrimaryContactName.trim() : "";
  const primaryContactEmail =
    typeof rawPrimaryContactEmail === "string" ? rawPrimaryContactEmail.trim() : "";
  const primaryContactPhone =
    typeof rawPrimaryContactPhone === "string" ? rawPrimaryContactPhone.trim() : "";
  const strategicContext =
    typeof rawStrategicContext === "string" ? rawStrategicContext.trim() : "";
  const commercialContext =
    typeof rawCommercialContext === "string" ? rawCommercialContext.trim() : "";
  const internalNotes = typeof rawInternalNotes === "string" ? rawInternalNotes.trim() : "";
  const status = typeof rawStatus === "string" && VALID_CLIENT_STATUSES.has(rawStatus) ? rawStatus : "prospect";

  if (!name) {
    return;
  }

  if (!profile?.tenant_id) {
    return;
  }

  await supabase.from("clients").insert({
    tenant_id: profile.tenant_id,
    name,
    industry: industry || null,
    company_size: companySize || null,
    primary_contact_name: primaryContactName || null,
    primary_contact_email: primaryContactEmail || null,
    primary_contact_phone: primaryContactPhone || null,
    strategic_context: strategicContext || null,
    commercial_context: commercialContext || null,
    internal_notes: internalNotes || null,
    status,
    created_by: user.id,
  });

  revalidatePath("/app");
}

export async function updateClientStatus(formData: FormData) {
  const { supabase } = await getAuthenticatedContext();
  const rawClientId = formData.get("clientId");
  const rawStatus = formData.get("status");

  const clientId = typeof rawClientId === "string" ? rawClientId : "";
  const status = typeof rawStatus === "string" && VALID_CLIENT_STATUSES.has(rawStatus) ? rawStatus : "";

  if (!clientId || !status) {
    return;
  }

  await supabase.from("clients").update({ status }).eq("id", clientId);

  revalidatePath("/app");
  revalidatePath(`/app/clients/${clientId}`);
}

export async function saveClientNotes(formData: FormData) {
  const { supabase } = await getAuthenticatedContext();
  const rawClientId = formData.get("clientId");
  const rawInternalNotes = formData.get("internalNotes");

  const clientId = typeof rawClientId === "string" ? rawClientId : "";
  const internalNotes = typeof rawInternalNotes === "string" ? rawInternalNotes.trim() : "";

  if (!clientId) {
    return;
  }

  await supabase.from("clients").update({ internal_notes: internalNotes || null }).eq("id", clientId);

  revalidatePath("/app");
  revalidatePath(`/app/clients/${clientId}`);
}

export async function uploadClientDocument(formData: FormData) {
  const { supabase, user, profile } = await getAuthenticatedContext();
  const rawClientId = formData.get("clientId");
  const rawCategory = formData.get("category");
  const rawTags = formData.get("tags");
  const rawVisibleInPortal = formData.get("visibleInPortal");
  const document = formData.get("document");

  const clientId = typeof rawClientId === "string" ? rawClientId : "";
  const category = typeof rawCategory === "string" ? rawCategory.trim() : "";
  const tags = parseTags(rawTags);
  const visibleInPortal = rawVisibleInPortal === "on";

  if (!profile?.tenant_id || !clientId || !(document instanceof File) || document.size === 0) {
    return;
  }

  const maxFileSize = 50 * 1024 * 1024;

  if (document.size > maxFileSize) {
    return;
  }

  const safeName = sanitizeFileName(document.name || "documento");
  const storagePath = `${profile.tenant_id}/${clientId}/${randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(storagePath, document, {
      cacheControl: "3600",
      contentType: document.type || undefined,
      upsert: false,
    });

  if (uploadError) {
    return;
  }

  await supabase.from("documents").insert({
    tenant_id: profile.tenant_id,
    client_id: clientId,
    name: document.name,
    bucket_id: DOCUMENT_BUCKET,
    storage_path: storagePath,
    mime_type: document.type || null,
    size_bytes: document.size,
    category: category || null,
    tags,
    ai_summary: null,
    visible_in_portal: visibleInPortal,
    uploaded_by: user.id,
  });

  revalidatePath(`/app/clients/${clientId}`);
}

export async function toggleDocumentPortalVisibility(formData: FormData) {
  const { supabase } = await getAuthenticatedContext();
  const rawDocumentId = formData.get("documentId");
  const rawClientId = formData.get("clientId");
  const rawVisible = formData.get("visibleInPortal");

  const documentId = typeof rawDocumentId === "string" ? rawDocumentId : "";
  const clientId = typeof rawClientId === "string" ? rawClientId : "";
  const visibleInPortal = rawVisible === "true";

  if (!documentId || !clientId) {
    return;
  }

  await supabase
    .from("documents")
    .update({ visible_in_portal: visibleInPortal })
    .eq("id", documentId);

  revalidatePath(`/app/clients/${clientId}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function inviteClientToPortal(formData: FormData) {
  const { supabase, user, profile } = await getAuthenticatedContext();
  const rawClientId = formData.get("clientId");
  const rawEmail = formData.get("email");

  const clientId = typeof rawClientId === "string" ? rawClientId : "";
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

  if (!profile?.tenant_id || !clientId || !email) {
    return;
  }

  await supabase.from("client_portal_invites").upsert(
    {
      tenant_id: profile.tenant_id,
      client_id: clientId,
      email,
      status: "pending",
      invited_by: user.id,
      accepted_at: null,
    },
    {
      onConflict: "email",
    }
  );

  const siteUrl = await getSiteUrl();

  await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/portal")}`,
      data: {
        role: "client",
      },
    },
  });

  revalidatePath(`/app/clients/${clientId}`);
}

export async function completeRoleRedirect() {
  const { supabase, user } = await getAuthenticatedContext();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  redirect(getDefaultRouteForRole(profile?.role ?? null));
}

export async function createDiagnosticRun(formData: FormData) {
  const { supabase, user, profile } = await getAuthenticatedContext();
  const rawClientId = formData.get("clientId");
  const rawTitle = formData.get("title");
  const rawAnalysisType = formData.get("analysisType");
  const rawFramework = formData.get("framework");
  const rawAdditionalContext = formData.get("additionalContext");
  const rawValidationMode = formData.get("validationMode");
  const rawTurboMode = formData.get("turboMode");
  const rawWebResearch = formData.get("webResearch");
  const rawDetailLevel = formData.get("detailLevel");
  const selectedAreas = parseMultiValue(formData, "areas");
  const selectedDocumentIds = parseMultiValue(formData, "documentIds");

  const clientId = typeof rawClientId === "string" ? rawClientId : "";
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const analysisType = typeof rawAnalysisType === "string" ? rawAnalysisType.trim() : "";
  const framework = typeof rawFramework === "string" ? rawFramework.trim() : "";
  const additionalContext = typeof rawAdditionalContext === "string" ? rawAdditionalContext.trim() : "";
  const validationMode = rawValidationMode === "on";
  const turboMode = rawTurboMode === "on";
  const webResearch = rawWebResearch === "on";
  const detailLevelNumber = Number(rawDetailLevel);
  const detailLevel = Number.isInteger(detailLevelNumber)
    ? Math.max(1, Math.min(5, detailLevelNumber))
    : 3;

  if (!profile?.tenant_id || !clientId || !title || !framework) {
    return;
  }

  const { data: diagnostic } = await supabase
    .from("diagnostics")
    .insert({
      tenant_id: profile.tenant_id,
      client_id: clientId,
      title,
      analysis_type: analysisType || null,
      framework,
      areas: selectedAreas,
      additional_context: additionalContext || null,
      validation_mode: validationMode,
      turbo_mode: turboMode,
      web_research: webResearch,
      detail_level: detailLevel,
      status: "pending",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (!diagnostic?.id) {
    return;
  }

  if (selectedDocumentIds.length) {
    await supabase.from("diagnostic_documents").insert(
      selectedDocumentIds.map((documentId) => ({
        diagnostic_id: diagnostic.id,
        document_id: documentId,
      }))
    );
  }

  redirect(`/app/diagnostics/${diagnostic.id}`);
}

export async function saveFinding(formData: FormData) {
  const { supabase } = await getAuthenticatedContext();
  const rawFindingId = formData.get("findingId");
  const rawDiagnosticId = formData.get("diagnosticId");
  const rawTitle = formData.get("title");
  const rawBody = formData.get("body");
  const rawSoWhat = formData.get("soWhat");
  const rawImpactEstimate = formData.get("impactEstimate");
  const rawStatus = formData.get("status");

  const findingId = typeof rawFindingId === "string" ? rawFindingId : "";
  const diagnosticId = typeof rawDiagnosticId === "string" ? rawDiagnosticId : "";
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const body = typeof rawBody === "string" ? rawBody.trim() : "";
  const soWhat = typeof rawSoWhat === "string" ? rawSoWhat.trim() : "";
  const impactEstimate = typeof rawImpactEstimate === "string" ? rawImpactEstimate.trim() : "";
  const status = typeof rawStatus === "string" ? rawStatus.trim() : "draft";

  if (!findingId || !diagnosticId || !title || !body) {
    return;
  }

  await supabase
    .from("findings")
    .update({
      title,
      body,
      so_what: soWhat || null,
      impact_estimate: impactEstimate || null,
      status,
      updated_at: nowIsoString(),
    })
    .eq("id", findingId);

  revalidatePath(`/app/diagnostics/${diagnosticId}`);
}

export async function addManualFinding(formData: FormData) {
  const { supabase } = await getAuthenticatedContext();
  const rawDiagnosticId = formData.get("diagnosticId");

  const diagnosticId = typeof rawDiagnosticId === "string" ? rawDiagnosticId : "";

  if (!diagnosticId) {
    return;
  }

  const { count } = await supabase
    .from("findings")
    .select("id", { count: "exact", head: true })
    .eq("diagnostic_id", diagnosticId);

  await supabase.from("findings").insert({
    diagnostic_id: diagnosticId,
    title: "Nuevo hallazgo manual",
    body: "Describe aqui el hallazgo.",
    so_what: "Implica que...",
    impact_estimate: "Pendiente",
    status: "manual",
    display_order: count ?? 0,
  });

  revalidatePath(`/app/diagnostics/${diagnosticId}`);
}

export async function updateDiagnosticStatus(formData: FormData) {
  const { supabase } = await getAuthenticatedContext();
  const rawDiagnosticId = formData.get("diagnosticId");
  const rawStatus = formData.get("status");

  const diagnosticId = typeof rawDiagnosticId === "string" ? rawDiagnosticId : "";
  const status = typeof rawStatus === "string" ? rawStatus : "";

  if (!diagnosticId || !status) {
    return;
  }

  await supabase
    .from("diagnostics")
    .update({
      status,
      updated_at: nowIsoString(),
      processed_at: status === "completed" ? nowIsoString() : undefined,
    })
    .eq("id", diagnosticId);

  revalidatePath(`/app/diagnostics/${diagnosticId}`);
}

export async function createRetainer(formData: FormData) {
  const { supabase, user, profile } = await getAuthenticatedContext();
  const rawClientId = formData.get("clientId");
  const rawName = formData.get("name");
  const rawStatus = formData.get("status");
  const rawMonthlyFee = formData.get("monthlyFee");
  const rawStartDate = formData.get("startDate");
  const rawEndDate = formData.get("endDate");
  const rawScopeSummary = formData.get("scopeSummary");

  const clientId = typeof rawClientId === "string" ? rawClientId : "";
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const status = typeof rawStatus === "string" ? rawStatus : "active";
  const monthlyFee = typeof rawMonthlyFee === "string" && rawMonthlyFee.trim() ? Number(rawMonthlyFee) : null;
  const startDate = typeof rawStartDate === "string" && rawStartDate ? rawStartDate : null;
  const endDate = typeof rawEndDate === "string" && rawEndDate ? rawEndDate : null;
  const scopeSummary = typeof rawScopeSummary === "string" && rawScopeSummary.trim() ? rawScopeSummary.trim() : null;

  if (!profile?.tenant_id || !clientId || !name) {
    return;
  }

  await supabase.from("retainers").insert({
    tenant_id: profile.tenant_id,
    client_id: clientId,
    name,
    status,
    monthly_fee: Number.isFinite(monthlyFee) ? monthlyFee : null,
    start_date: startDate,
    end_date: endDate,
    scope_summary: scopeSummary,
    owner_user_id: user.id,
    created_by: user.id,
  });

  revalidatePath(`/app/clients/${clientId}/retainer`);
}

export async function createKpi(formData: FormData) {
  const { supabase, user, profile } = await getAuthenticatedContext();
  const rawClientId = formData.get("clientId");
  const rawRetainerId = formData.get("retainerId");
  const rawName = formData.get("name");
  const rawUnit = formData.get("unit");
  const rawBaseline = formData.get("baselineValue");
  const rawTarget = formData.get("targetValue");
  const rawDirection = formData.get("direction");
  const rawNotes = formData.get("notes");

  const clientId = typeof rawClientId === "string" ? rawClientId : "";
  const retainerId = typeof rawRetainerId === "string" && rawRetainerId ? rawRetainerId : null;
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const unit = typeof rawUnit === "string" && rawUnit.trim() ? rawUnit.trim() : null;
  const baselineValue = typeof rawBaseline === "string" && rawBaseline.trim() ? Number(rawBaseline) : null;
  const targetValue = typeof rawTarget === "string" && rawTarget.trim() ? Number(rawTarget) : null;
  const direction = typeof rawDirection === "string" ? rawDirection : "increase";
  const notes = typeof rawNotes === "string" && rawNotes.trim() ? rawNotes.trim() : null;

  if (!profile?.tenant_id || !clientId || !name) {
    return;
  }

  await supabase.from("kpis").insert({
    tenant_id: profile.tenant_id,
    client_id: clientId,
    retainer_id: retainerId,
    name,
    unit,
    baseline_value: Number.isFinite(baselineValue) ? baselineValue : null,
    target_value: Number.isFinite(targetValue) ? targetValue : null,
    direction,
    notes,
    created_by: user.id,
  });

  revalidatePath(`/app/clients/${clientId}/retainer`);
}

export async function addKpiReading(formData: FormData) {
  const { supabase, user, profile } = await getAuthenticatedContext();
  const rawClientId = formData.get("clientId");
  const rawKpiId = formData.get("kpiId");
  const rawReadingDate = formData.get("readingDate");
  const rawValue = formData.get("value");
  const rawNote = formData.get("note");

  const clientId = typeof rawClientId === "string" ? rawClientId : "";
  const kpiId = typeof rawKpiId === "string" ? rawKpiId : "";
  const readingDate = typeof rawReadingDate === "string" && rawReadingDate ? rawReadingDate : null;
  const value = typeof rawValue === "string" && rawValue.trim() ? Number(rawValue) : NaN;
  const note = typeof rawNote === "string" && rawNote.trim() ? rawNote.trim() : null;

  if (!profile?.tenant_id || !clientId || !kpiId || !readingDate || Number.isNaN(value)) {
    return;
  }

  await supabase.from("kpi_readings").insert({
    tenant_id: profile.tenant_id,
    client_id: clientId,
    kpi_id: kpiId,
    reading_date: readingDate,
    value,
    note,
    created_by: user.id,
  });

  revalidatePath(`/app/clients/${clientId}/retainer`);
}

export async function createRetainerSession(formData: FormData) {
  const { supabase, user, profile } = await getAuthenticatedContext();
  const rawClientId = formData.get("clientId");
  const rawRetainerId = formData.get("retainerId");
  const rawSessionDate = formData.get("sessionDate");
  const rawTitle = formData.get("title");
  const rawSummary = formData.get("summary");
  const rawOutcomes = formData.get("outcomes");
  const rawRisks = formData.get("risks");
  const rawNextSteps = formData.get("nextSteps");

  const clientId = typeof rawClientId === "string" ? rawClientId : "";
  const retainerId = typeof rawRetainerId === "string" && rawRetainerId ? rawRetainerId : null;
  const sessionDate = typeof rawSessionDate === "string" && rawSessionDate ? rawSessionDate : null;
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const summary = typeof rawSummary === "string" && rawSummary.trim() ? rawSummary.trim() : null;
  const outcomes = typeof rawOutcomes === "string" && rawOutcomes.trim() ? rawOutcomes.trim() : null;
  const risks = typeof rawRisks === "string" && rawRisks.trim() ? rawRisks.trim() : null;
  const nextSteps = typeof rawNextSteps === "string" && rawNextSteps.trim() ? rawNextSteps.trim() : null;

  if (!profile?.tenant_id || !clientId || !sessionDate || !title) {
    return;
  }

  await supabase.from("retainer_sessions").insert({
    tenant_id: profile.tenant_id,
    client_id: clientId,
    retainer_id: retainerId,
    session_date: sessionDate,
    title,
    summary,
    outcomes,
    risks,
    next_steps: nextSteps,
    created_by: user.id,
  });

  revalidatePath(`/app/clients/${clientId}/retainer`);
}

function nowIsoString() {
  return new Date().toISOString();
}
