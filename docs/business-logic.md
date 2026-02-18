# SLAC FreightLink 360 — Business Logic & Developer Handoff

> This document describes all business rules, status transitions, validations,
> automations, and access control rules currently implemented.
> Use this as the authoritative specification for the Laravel backend rewrite.

---

## 1. Authentication & Security

### Staff Authentication
- **No public registration** — all staff accounts created by admin/super_admin only.
- Login endpoint verifies email + password.
- On **successful** login:
  - Reset `failed_login_attempts` to 0.
  - Set `last_login_at = NOW()`.
  - Insert row into `login_history` with `success = true`.
- On **failed** login:
  - Increment `failed_login_attempts`.
  - If `failed_login_attempts >= 5` → set `is_locked = true`, record `locked_at`.
  - Insert row into `login_history` with `success = false`.
- **Locked accounts** cannot log in regardless of credentials. Admin must manually unlock.
- **Unlocking** an account resets `failed_login_attempts = 0` and clears `locked_at`.
- On first login (or when `must_change_password = true`) → force redirect to change-password page before accessing any other page.
- **Inactivity timeout**: Auto sign-out after **15 minutes** of inactivity (no mouse, keyboard, scroll, or touch events).
- Token type: Laravel Sanctum personal access tokens (`Authorization: Bearer <token>`).

### Client Authentication
- Separate guard (`client`). Client accounts verified by presence in `client_profiles`.
- Login: same email+password flow, but verifies `client_profiles.is_active = true`.
- If user has no `client_profiles` record → reject with "not a client account" error.
- **Inactivity timeout**: Auto sign-out after **30 minutes** (clients get longer session).

### Password Rules
- Minimum 8 characters.
- New users must change password on first login (`must_change_password = true`).
- Admin-created users always start with `must_change_password = true`.
- Super-admin bootstrap account starts with `must_change_password = false`.

---

## 2. Role & Department Access Control

### Roles (hierarchical)
| Role | Permissions |
|------|-------------|
| `super_admin` | Full access to everything including destructive actions |
| `admin` | Full access, cannot manage other admins |
| `manager` | View + limited write, approve actions |
| `staff` | Department-scoped read + write |

### Departments
`operations`, `documentation`, `accounts`, `marketing`, `customer_service`, `warehouse`, `management`, `super_admin`

### Access Rules by Module
| Module | Access |
|--------|--------|
| Finance | `accounts`, `management`, `super_admin`, `admin` |
| Banking | `accounts`, `management`, `super_admin`, `admin` |
| Admin Users | `super_admin`, `admin` only |
| Notifications | All staff (own department + global) |
| Client Messages | `customer_service`, `management`, `admin`, `super_admin` |
| AI Assistant | All staff (department-scoped prompt) |
| Audit Logs | `super_admin`, `admin` only |

---

## 3. Status Transitions

### Shipment Status
```
pending → in_transit → arrived → customs → cleared → delivered
```
- Any status can be manually set by staff (no enforced one-way flow in UI).
- Status changes should trigger notifications to the client.

### Finance Invoice Status
```
draft → sent → partially_paid → paid
draft → cancelled
sent → disputed
```
- `overdue`: System-set when `due_date < today` and `status != paid`.
- `paid_amount` is tracked separately from `total_amount` to support partial payments.
- When `paid_amount >= total_amount` → status auto-set to `paid`.
- When `paid_amount > 0 && paid_amount < total_amount` → status = `partially_paid`.

### Expense Status
```
pending → approved → paid
pending → rejected
```
- Only managers/admins can approve or reject.
- `paid` can only be set after `approved`.

### Job Cost Approval
```
approval_status: pending → approved | rejected
payment_status: unpaid → partial → paid
```
- `approval_status` and `payment_status` are independent fields.
- Cost cannot be marked paid without being approved.

### Bank Transaction Match Status
```
unmatched → matched | partial | manual
```
- `matched`: Auto-matched with confidence >= 80%.
- `partial`: Partial match found, needs manual review.
- `manual`: Staff manually linked to an invoice.
- Once reconciled (`is_reconciled = true`), cannot be changed.

### Bank Reconciliation Status
```
draft → in_progress → completed → approved
```
- Only admins can approve a completed reconciliation.

---

## 4. Invoice Numbering

Finance invoice numbers must be unique and follow a sequence format.
Recommended: `INV-YYYY-NNNNNN` (e.g. `INV-2025-000042`).

```sql
-- Example MySQL sequence via trigger or application logic
-- Store in a sequences table and increment on each create
```

Expense refs: `EXP-YYYY-NNNNNN`
Job cost refs: `JOB-YYYY-NNNNNN`

---

## 5. Multi-Currency Logic

- Supported currencies: `GHS`, `USD`, `EUR`, `GBP`, `CNY`.
- All finance records store both:
  - Native amount (`amount`) + `currency` + `exchange_rate`
  - GHS equivalent (`ghs_equivalent = amount * exchange_rate`)
- Exchange rate is captured at time of record creation — not live.
- Reports aggregate `ghs_equivalent` for cross-currency totals.
- Conversion formula: `ghs_equivalent = amount * exchange_rate`

---

## 6. Audit Logging

Every mutation on these tables must produce an `audit_log` entry:
- `profiles` (create, update, lock/unlock)
- `user_roles` (assign, revoke)
- `client_profiles` (create, deactivate)
- `finance_invoices` (create, approve, mark-paid, delete)
- `finance_job_costs` (create, approve, reject, mark-paid)
- `finance_expenses` (create, approve, reject, pay)
- `bank_connections` (add, edit, deactivate)
- `bank_transactions` (reconcile, manual match)
- `bank_reconciliations` (complete, approve)

Audit log fields:
```json
{
  "user_id": "<id of staff performing action>",
  "action": "create_user | update_invoice | approve_expense | ...",
  "resource_type": "user | invoice | expense | ...",
  "resource_id": "<uuid of affected record>",
  "details": { "...before/after state or context..." },
  "ip_address": "<from request>"
}
```

---

## 7. Notification Rules

### Trigger: Invoice Overdue
- **Condition**: `finance_invoices.due_date < TODAY` AND `status NOT IN ('paid', 'cancelled')`
- **When**: Daily background job
- **Recipient**: `accounts` department
- **Priority**: `high`
- **Escalation**: After 7 days overdue → also notify `management`

### Trigger: Shipment Status Changed
- **Condition**: `client_shipments.status` changes
- **When**: On update
- **Recipient**: Client portal user for that `customer_id`
- **Priority**: `medium`
- **Channel**: In-app + email

### Trigger: Bank Sync Failed
- **Condition**: `bank_connections.sync_status = 'error'`
- **When**: After sync attempt
- **Recipient**: `accounts` + `management`
- **Priority**: `high`

### Trigger: Low Bank Balance
- **Condition**: `bank_connections.balance < threshold` (configurable, default GHS 10,000)
- **When**: After balance sync
- **Recipient**: `accounts` + `management`
- **Priority**: `critical`

### Trigger: Large Transaction Credit/Debit
- **Condition**: `bank_transactions.amount > threshold` (configurable, default GHS 50,000)
- **When**: On transaction insert
- **Recipient**: `management`, `accounts`
- **Priority**: `high`

### Trigger: New Client Message
- **Condition**: `client_messages` INSERT with `sender_type = 'client'`
- **When**: On insert
- **Recipient**: `customer_service` department
- **Priority**: `medium`

### Trigger: Finance Expense Submitted
- **Condition**: New expense with `status = 'pending'`
- **When**: On insert
- **Recipient**: `management` department
- **Priority**: `medium`

### Trigger: Account Locked
- **Condition**: `profiles.is_locked` changes to `true`
- **When**: On update
- **Recipient**: `super_admin`, `admin`
- **Priority**: `high`

---

## 8. Background Jobs (Queue Schedule)

| Job | Frequency | Description |
|-----|-----------|-------------|
| `CheckOverdueInvoicesJob` | Daily 09:00 | Scan `finance_invoices` for overdue, create notifications |
| `EscalateUnpaidInvoicesJob` | Daily 09:30 | 7+ days overdue → notify management |
| `SendDailyDigestJob` | Daily 08:00 | Summary email to department heads |
| `BankAutoSyncJob` | Every 30 min | Sync balances for all active `bank_connections` |
| `AutoMatchTransactionsJob` | After each bank sync | Match `bank_transactions` to `finance_invoices` |
| `CheckRegistrarRenewalJob` | Weekly Monday | Check company registration renewal dates |
| `SendWeeklyReportJob` | Weekly Friday | Finance summary to management |

---

## 9. File Storage

- **Provider**: S3 or MinIO (configurable in `.env`)
- **Buckets**:
  - `client-documents` → private, access via signed URL (15-minute expiry)
  - `finance-receipts` → private
  - `company-assets` → public
- **Signed URL generation**: `Storage::temporaryUrl($path, now()->addMinutes(15))`
- **Upload validation**: PDF, JPG, PNG, DOCX, XLSX only. Max 10MB per file.
- **Path structure**: `{bucket}/{customer_id}/{document_id}/{filename}`

---

## 10. Real-Time Broadcasting

Using Laravel Echo + Pusher (or Soketi for self-hosted).

| Channel | Event | Payload |
|---------|-------|---------|
| `private-user.{user_id}` | `NotificationCreated` | Notification object |
| `private-dept.{department}` | `NotificationCreated` | Notification object |
| `private-client.{customer_id}` | `ShipmentStatusChanged` | Shipment object |
| `private-client.{customer_id}` | `NewMessage` | Message object |
| `private-user.{user_id}` | `NewMessage` | Message object (staff) |
| `private-banking` | `BankSynced` | Connection + new balance |
| `private-banking` | `BankAlertCreated` | Alert object |

---

## 11. AI Assistant

- Department-aware: system prompt changes based on logged-in user's department.
- Departments → prompts:
  - `operations`: Focused on shipment tracking, container status, ETAs, customs
  - `documentation`: Focused on document requirements, customs procedures
  - `accounts`: Focused on invoices, payments, cash flow, outstanding balances
  - `management`: Executive dashboard view, summaries, KPIs
  - `warehouse`: Inventory, cargo storage, space management
  - `default`: General SLAC assistant
- All interactions logged to `ai_interactions` table.
- Rate limit: 10 requests per minute per user.
- Streaming response: SSE (`text/event-stream`).

---

## 12. Client Portal Rules

- Client users can ONLY see data scoped to their `customer_id`.
- `customer_id` is resolved from `client_profiles.customer_id` on every request — never accepted from the client in the request body.
- Clients cannot modify shipments, invoices, or documents — read-only.
- Clients CAN send messages (`sender_type = 'client'`).
- Document download returns a signed URL — never a direct file path.
- If `client_profiles.is_active = false` → login rejected with "account suspended" message.

---

## 13. Super Admin Bootstrap

The very first super admin account cannot be created through the normal UI (chicken-and-egg problem). Implement as an **Artisan command**:

```bash
php artisan admin:bootstrap --name="John Doe" --email="admin@shipperslink.com" --password="ChangeMe123!"
```

This command must:
1. Check that no `super_admin` exists (safety guard).
2. Create `users` record.
3. Create `profiles` record with `must_change_password = false`.
4. Assign `super_admin` role.
5. Output credentials to terminal only.

---

## 14. API Response Conventions

All responses follow this envelope:

```json
// Success (single)
{ "data": { ...resource... } }

// Success (list)
{ "data": [...], "meta": { "current_page": 1, "last_page": 5, "per_page": 20, "total": 87 } }

// Error
{ "message": "Validation failed", "errors": { "email": ["The email field is required."] } }

// Unauthorized
{ "message": "Unauthenticated." }

// Forbidden
{ "message": "This action is unauthorized." }
```

HTTP Status codes:
- `200` OK
- `201` Created
- `204` No Content (delete)
- `400` Bad Request
- `401` Unauthenticated
- `403` Forbidden
- `404` Not Found
- `422` Validation Error
- `429` Too Many Requests
- `500` Server Error

---

## 15. Environment Variables (.env)

```env
APP_NAME="SLAC FreightLink 360"
APP_ENV=production
APP_KEY=
APP_URL=https://api.shipperslink.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=slac_freightlink
DB_USERNAME=
DB_PASSWORD=

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Sanctum
SANCTUM_STATEFUL_DOMAINS=app.shipperslink.com

# File Storage
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
AWS_BUCKET=slac-documents
AWS_URL=

# Broadcasting
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https

# AI
OPENAI_API_KEY=       # or Gemini API key
AI_MODEL=google/gemini-2.5-flash
AI_RATE_LIMIT=10      # requests per minute per user

# Banking webhook secret (same across all banks)
BANK_WEBHOOK_SECRET=

# Mail
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@shipperslink.com
MAIL_FROM_NAME="SLAC FreightLink 360"

# Low balance threshold (GHS)
BANK_LOW_BALANCE_THRESHOLD=10000

# Large transaction threshold (GHS)
BANK_LARGE_TRANSACTION_THRESHOLD=50000
```

---

## 16. Frontend Migration Notes

When switching the React frontend from the current stack to Laravel API:

1. **Replace** all database/auth hooks with Axios HTTP calls.
2. **Token storage**: Store Sanctum token in `localStorage` as `slac_token`.
3. **Axios base config**:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api/v1',
  headers: { 'Accept': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('slac_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('slac_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

4. **Realtime**: Replace Supabase Realtime subscriptions with Laravel Echo:
```typescript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;
const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,
  authEndpoint: `${import.meta.env.VITE_API_URL}/api/v1/broadcasting/auth`,
  auth: {
    headers: { Authorization: `Bearer ${localStorage.getItem('slac_token')}` }
  }
});

// Subscribe to personal notifications
echo.private(`user.${userId}`).listen('NotificationCreated', (e) => {
  // handle notification
});
```

5. **File downloads**: Request signed URL from `/client/documents/{id}/download`, then open in new tab.

---

*Document generated from SLAC FreightLink 360 v1.0 codebase. Last updated: 2026-02-18.*
