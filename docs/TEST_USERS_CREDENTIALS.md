# 🔐 Test Users Credentials

**Created**: March 12, 2026  
**Environment**: Supabase (wgwxllpgfervwpntpwie)  
**Status**: Active - Ready for Testing

⚠️ **WARNING**: These are TEST credentials only. Use only in development/staging environments. Never share publicly.

---

## Test Users

### Consultant 1
```
Email:    consultor1@test.com
Password: Test123!Secure
Role:     Consultant
Access:   /app (Workspace)
Purpose:  Main consultant for testing diagnostic, retainer, chat flows
```

### Consultant 2
```
Email:    consultor2@test.com
Password: Test123!Secure
Role:     Consultant
Access:   /app (Workspace)
Purpose:  Secondary consultant for testing multi-user scenarios
```

### Client 1
```
Email:    cliente1@test.com
Password: Test123!Secure
Role:     Client
Access:   /portal (Client Portal)
Purpose:  Primary test client - has pre-loaded data (Grupo Industrial Omega)
Status:   Portal invite already accepted
```

### Client 2
```
Email:    cliente2@test.com
Password: Test123!Secure
Role:     Client
Access:   /portal (Client Portal)
Purpose:  Secondary test client - empty portal for testing onboarding
Status:   No client assigned yet
```

### Admin
```
Email:    admin@test.com
Password: Test123!Secure
Role:     Super Admin
Access:   /admin (Admin Dashboard)
Purpose:  Platform administration, revenue aggregates, user management
```

---

## Associated Test Data

### Client: Grupo Industrial Omega
- **Client ID**: `eb4d0458-821a-4fcb-8340-c109dc331556`
- **Industry**: Manufacturing & Distribution
- **Size**: Medium (200-500 employees)
- **Primary Contact**: Dr. Juan Carlos Mendoza (jcmendoza@grupoomega.com)
- **Status**: Active
- **Invoice Status**: 135k MXN collected, 165k MXN pipeline

### Diagnostic
- **ID**: `fd93f60a-558b-4a57-93cd-5e2d16d1bd9d`
- **Title**: Análisis de Eficiencia Operativa - MECE
- **Findings**: 5 completed and validated
- **Status**: Complete

### Retainer
- **ID**: `49b08813-06c3-4ea6-b873-f60943b9f738`
- **Name**: Programa de Optimización Operativa 2026
- **Monthly Fee**: 45,000 MXN
- **Status**: Active
- **KPIs**: 3 (Inventory Rotation, Billing Cycle, EBITDA Margin)
- **Sessions**: 2 recorded (Feb 1, Mar 1)

---

## Quick Access URLs

| Role | URL | Email | Password |
|------|-----|-------|----------|
| Consultant | `http://localhost:3000/login` | consultor1@test.com | Test123!Secure |
| Client | `http://localhost:3000/login` | cliente1@test.com | Test123!Secure |
| Admin | `http://localhost:3000/login` | admin@test.com | Test123!Secure |

---

## Testing Scenarios

### ✅ Complete Flow (15 min)
1. Login as **consultor1@test.com** → `/app` dashboard
2. Navigate to Clients → "Grupo Industrial Omega"
3. View Diagnostic (5 MECE findings)
4. Review Retainer + KPI trends
5. Check Chat History
6. View Documents (3 uploaded)
7. Go to Revenue Management
8. Logout → Login as **consultor2@test.com** (verify consultant 2 scope)
9. Logout → Login as **cliente1@test.com** → `/portal` (client view)
10. Logout → Login as **admin@test.com** → `/admin` (admin dashboard)

### ✅ Document Visibility Testing
- Login as **cliente1@test.com** 
- Portal → Documents 
- Should see 2 documents (Estado Financiero, Análisis Cadena Suministro)
- Should NOT see Benchmarking report (internal only)

### ✅ Revenue Management Testing
- Login as **consultor1@test.com**
- Navigate to Clients → Omega → Revenue Management
- Should see 5 revenue events with status updates
- Login as **admin@test.com** → Admin Dashboard
- Should see collected ($135k) vs pipeline ($165k) revenue aggregates

---

## Database IDs (for SQL Queries)

```
Tenant ID:      901ddd4d-6961-44b0-9fa0-2c667b010aab
Client ID:      eb4d0458-821a-4fcb-8340-c109dc331556
Diagnostic ID:  fd93f60a-558b-4a57-93cd-5e2d16d1bd9d
Retainer ID:    49b08813-06c3-4ea6-b873-f60943b9f738

User IDs:
  consultor1:   10000000-0000-0000-0000-000000000001
  consultor2:   10000000-0000-0000-0000-000000000002
  cliente1:     20000000-0000-0000-0000-000000000001
  cliente2:     20000000-0000-0000-0000-000000000002
  admin:        30000000-0000-0000-0000-000000000001
```

---

## Data Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Test Users | 5 | 2 consultants, 2 clients, 1 admin |
| Clients | 1 | Grupo Industrial Omega (full data) |
| Diagnostics | 1 | MECE framework, 5 findings |
| Retainers | 1 | 3 KPIs, 2 sessions with notes |
| Documents | 3 | 2 portal-visible, 1 internal |
| Revenue Events | 5 | 3 collected, 2 projected |
| Chat Messages | 4 | 2 Q&A conversations |
| KPI Readings | 6 | Historical data Feb-Mar 2026 |

---

## Notes for Development Team

- **Password**: All test accounts use `Test123!Secure` for simplicity — change if needed for security review
- **Created By**: All records created by `consultor1@test.com` (user ID: 10000000-0000-0000-0000-000000000001)
- **Tenant**: All data belongs to single test tenant: "SAP - Consulting Partners"
- **Fresh Data**: No production data mixed in — safe for public testing/demo
- **RLS Verified**: Client 1 cannot see data from other clients; portal shows only visible documents

---

## Resetting Test Data

To reset test accounts:
1. Delete users from `auth.users` in Supabase
2. Profiles will cascade delete via RLS
3. Recreate using SQL scripts in Supabase (see `TESTING_GUIDE.md`)

To keep data but reset credentials:
- Use Supabase Auth → Users → Edit password for each user

---

**Last Updated**: March 12, 2026  
**Status**: ✅ Ready for testing
