# 🧪 CONSULTING PARTNERS V1 — TESTING GUIDE

## ✅ Status: READY FOR TESTING

All test data and users have been created in Supabase. You can now log in and test the complete V1 flow.

---

## 📋 Test User Credentials

| Email | Password | Role | Access | Notes |
|-------|----------|------|--------|-------|
| `consultor1@test.com` | `Test123!Secure` | Consultant | `/app` | Main workspace |
| `consultor2@test.com` | `Test123!Secure` | Consultant | `/app` | Secondary consultant |
| `cliente1@test.com` | `Test123!Secure` | Client | `/portal` | Has pre-loaded data |
| `cliente2@test.com` | `Test123!Secure` | Client | `/portal` | Empty client portal |
| `admin@test.com` | `Test123!Secure` | Super Admin | `/admin` | Admin dashboard |

**Login URL**: `http://localhost:3000/login`

---

## 🎯 Pre-Loaded Test Data

### Client: Grupo Industrial Omega
- **Status**: Active
- **Industry**: Manufacturing & Distribution
- **Size**: Medium (200-500 employees)
- **Primary Contact**: Dr. Juan Carlos Mendoza (jcmendoza@grupoomega.com)
- **Context**: Seeking 15% improvement in operational margin over 18 months

### Diagnostic: "Análisis de Eficiencia Operativa - MECE"
- **Framework**: MECE
- **Status**: Completed
- **Findings**: 5 validated findings with detailed impact estimates
- **Models**: Claude Sonnet (primary), GPT-4o (validation)

#### Key Findings:
1. **Inventory Management Inefficiency** (High Impact: 500-800k MXN cash flow improvement)
2. **Billing Automation Opportunity** (High Impact: 8-10 days cash cycle improvement)
3. **EBITDA Control Dashboards** (Medium Impact: Decision-making speed)
4. **Regional Procurement Consolidation** (Medium Impact: 3-5% COGS savings)
5. **HR & Payroll System Modernization** (Medium Impact: Compliance + error reduction)

### Retainer: "Programa de Optimización Operativa 2026"
- **Monthly Fee**: 45,000 MXN
- **Status**: Active
- **Start Date**: January 15, 2026
- **Sessions**: 2 completed sessions with full notes
- **KPIs**: 3 tracked metrics with historical readings

#### KPIs Monitored:
| KPI | Baseline | Target | Direction | Current Progress |
|-----|----------|--------|-----------|------------------|
| Inventory Rotation | 65 days | 45 days | Decrease | 55 days (85% to goal) |
| Billing Cycle | 3 days | 0.25 days | Decrease | 1.5 days (progressing) |
| EBITDA Margin | 15% | 18% | Increase | 16.2% (62% to goal) |

### Documents
- **Financial Statement 2025** (PDF, visible in portal)
- **Supply Chain Analysis** (Excel, visible in portal)
- **Industry Benchmarking** (PDF, internal only)

### Revenue Events
- Diagnostic invoice: 45,000 MXN (collected)
- Jan retainer: 45,000 MXN (collected)
- Feb retainer: 45,000 MXN (collected)
- Implementation project: 120,000 MXN (projected, April)
- Mar retainer: 45,000 MXN (projected)

### Chat History
- 4 pre-loaded Q&A messages demonstrating consultant ↔ assistant interaction

### Portal Invitation
- `cliente1@test.com` received and accepted portal invite
- Can access portal immediately

---

## 🚀 Recommended Testing Flow (15 minutes)

### Phase 1: Consultant Workspace (as `consultor1@test.com`)

1. **Login & Dashboard** (1 min)
   - ✅ Land on `/app` after login
   - ✅ See dashboard with stats

2. **Client Management** (2 min)
   - ✅ Navigate to Clients
   - ✅ Find "Grupo Industrial Omega"
   - ✅ Click to open full expedient
   - ✅ Review all client details and quick actions

3. **Diagnostics** (3 min)
   - ✅ Go to Apps → Diagnostics
   - ✅ Open "Análisis de Eficiencia Operativa"
   - ✅ See 5 completed findings with titles, bodies, impact
   - ✅ Verify QC validation status
   - ✅ (Optional) Download PDF report

4. **Retainer with KPIs** (2 min)
   - ✅ From client detail, click "Iniciar retainer"
   - ✅ See active retainer "Programa de Optimización..."
   - ✅ View 3 KPIs with baseline/target/direction
   - ✅ See KPI trend graph with 2 readings
   - ✅ Review 2 session notes (Feb 1 and Mar 1)

5. **Chat IA** (2 min)
   - ✅ Click "Chat IA" tab in client detail
   - ✅ See 4 pre-loaded messages
   - ✅ Verify context is loaded (mentions specific findings)
   - ✅ (Optional) Ask a new question to test streaming

6. **Documents** (1 min)
   - ✅ See 3 documents in library
   - ✅ Verify 2 are marked "visible in portal"
   - ✅ 1 is internal-only

7. **Revenue** (1 min)
   - ✅ From Quick Actions, click "Gestionar revenue"
   - ✅ See collected revenue: 135,000 MXN
   - ✅ See pipeline revenue: 165,000 MXN
   - ✅ View 5 revenue events by stream

8. **Admin Dashboard** (1 min)
   - ✅ Logout and login as `admin@test.com`
   - ✅ Navigate to `/admin`
   - ✅ See aggregated stats: 5 users, 1 client, 1 diagnostic, 3 documents
   - ✅ See revenue KPIs: 135k collected, 165k pipeline
   - ✅ See revenue by stream breakdown
   - ✅ See "Grupo Industrial Omega" in top clients by revenue
   - ✅ See recent diagnostics

### Phase 2: Client Portal (as `cliente1@test.com`)

1. **Login** (1 min)
   - ✅ Navigate to `/login`
   - ✅ Login as `cliente1@test.com`
   - ✅ Land on `/portal`

2. **Portal Dashboard** (1 min)
   - ✅ See personalized greeting
   - ✅ See "Mis reportes" section
   - ✅ See retainer KPI semaphore
   - ✅ See document library (2 docs visible)

3. **My Reports** (1 min)
   - ✅ Click into report preview
   - ✅ Download PDF

4. **Retainer View** (1 min)
   - ✅ See KPIs with traffic light status
   - ✅ See next session info
   - ✅ See action items

5. **Documents** (1 min)
   - ✅ View only 2 documents (not the confidential one)
   - ✅ Verify filtration is working

---

## 🔍 Feature Verification Checklist

### Core V1 Modules
- [ ] **Auth & Roles**: Login, password recovery, role routing working
- [ ] **Client Management**: CRUD, expedient, status changes
- [ ] **Diagnostics**: Show findings, validation status, editable content
- [ ] **Documents**: Upload, categorize, portal visibility toggle
- [ ] **Chat IA**: Streaming responses, context loaded
- [ ] **Retainers**: Create, KPIs with baselines/targets, sessions with notes
- [ ] **KPI Readings**: Graph shows baseline → current → target trajectory
- [ ] **Portal**: Magic link, isolated client view, documents filtered
- [ ] **PDF Export**: Download works, formatting correct
- [ ] **Super Admin**: Tenant overview, revenue aggregates

### V1+ Features (Delivered)
- [ ] **Revenue Streams**: Create events, update status, view by stream
- [ ] **Admin Revenue Dashboard**: Collected vs. pipeline, top clients by revenue

---

## 🧩 Data Structure Summary

| Entity | Test Data |
|--------|-----------|
| **Tenants** | 1 (SAP - Consulting Partners) |
| **Users** | 5 (2 consultants, 2 clients, 1 admin) |
| **Clients** | 1 (Grupo Industrial Omega) |
| **Diagnostics** | 1 (MECE, 5 validated findings) |
| **Retainers** | 1 (3 KPIs, 2 sessions) |
| **Documents** | 3 (2 portal-visible) |
| **Revenue Events** | 5 (3 collected, 2 projected) |
| **Chat Messages** | 4 (2 Q&A pairs) |

---

## 🐛 Known Issues & Workarounds

(None identified at this stage — report any issues with steps to reproduce)

---

## 📞 Testing Support

- **Build Status**: ✅ Passing (latest: 7be2c95)
- **Database**: ✅ Connected, migrations applied
- **APIs**: ✅ Diagnostics, chat, revenue endpoints active

---

## 📝 Notes for Demo

- 모든 데이터는 **실제 개선 시나리오**를 기반으로 함
- Grupo Industrial Omega는 **realistic factory optimization case study**
- 5개 findings는 **3-5% COGS, 500-800k cash flow 개선** potential을 보여줌
- KPI trajectory는 **2개월 실제 진행률** 반영
- Revenue events는 **6개월 engagement cycle** 보여줨 (diagnostic + retainer + implementation)

---

**Ready to test? Login at http://localhost:3000/login** 🚀
