# Unified System Integration Plan

Make the **`consignment_workflows`** record the single source of truth that every portal reads from and writes to, and add an event layer so a change in one department automatically updates the others in real-time.

---

## 1. Central Object: Consignment

Already exists as `consignment_workflows` with `consignment_ref`. We will:

- Treat `consignment_id` as the foreign reference used by Documentation, Customs/ICUMS, Accounts, Fleet, Warehouse, and Client Portal.
- Add missing link columns where they don't exist yet:
  - `finance_invoices.consignment_id`
  - `finance_expenses.consignment_id`
  - `trucking_jobs.consignment_id`
  - `cargo_receipts.consignment_id` (warehouse in/out)
  - `client_shipments.consignment_id` (client portal mirror)
- Add a `consignment_events` table (audit + event bus) — every state change writes a row here.

## 2. Automated Workflow (DB triggers + Edge Function dispatcher)

A new Postgres trigger on `consignment_workflows` and related tables will:

| Trigger source | Effect |
|---|---|
| `consignment_documents` insert | set workflow stage → `documents_received`, insert event, notify Operations |
| `consignment_workflows.current_stage = 'documentation_completed'` | auto-create draft `finance_invoices` row, notify Accounts |
| `finance_invoices.status = 'paid'` | set workflow stage → `cargo_released` (cleared for release), notify Operations |
| `consignment_workflows.cargo_released_at` set | auto-create `trucking_jobs` row in `pending` status, notify Fleet |
| `trucking_jobs.status = 'in_transit'` | generate tracking link `/track/{ref}`, write to `client_shipments`, insert notification (channel: in-app + email/WhatsApp queued) |
| `cargo_receipts` insert/update | update workflow warehouse fields, notify Accounts + Operations |

All triggers also INSERT into `consignment_events` and `notifications`.

## 3. Notification Engine

- New `notifications` table (user_id, consignment_id, type, channel, title, body, read_at).
- Edge function `dispatch-notification` consumes new events (called from trigger via `pg_net` or polled) and:
  - writes in-app row,
  - sends email via existing infra,
  - queues WhatsApp/SMS (stub provider — flagged TODO until provider keys added).
- Frontend: global `useNotifications()` hook subscribed to Supabase Realtime on `notifications` table; bell badge in `TopBar`.

## 4. Shared Dashboard Cross-Visibility

Update each department dashboard to surface cross-department signals from the same consignment:

- **Operations**: add "Payment status" column (joins `finance_invoices`).
- **Accounts**: add "Shipment stage" column (joins `consignment_workflows.current_stage`).
- **Fleet**: add "Cleared for release" filter (workflow stage = `cargo_released`).
- **Warehouse**: add active consignments awaiting receipt.
- **Client Portal**: live stage timeline + tracking link.

## 5. Realtime Sync

Enable Supabase Realtime on:
`consignment_workflows`, `consignment_events`, `notifications`, `finance_invoices`, `trucking_jobs`, `cargo_receipts`.

Add a single `useConsignmentRealtime(consignmentId)` hook used by all detail panels so any user sees changes instantly.

## 6. AI Assistant Integration

Extend `supabase/functions/ai-assistant` with new tool functions:
- `list_delayed_shipments` (workflow stages stuck > SLA),
- `list_unpaid_invoices`,
- `get_consignment_status(ref)`,
- `suggest_next_action(consignment_id)` — uses current_stage + outstanding items.

Expose in the existing AIChatPanel; no UI rewrite needed.

## 7. RBAC, Audit, Consistency

- All new tables ship with RLS reusing `is_admin`, `is_accounts`, `is_client`, `get_user_department`.
- `consignment_events` is append-only (no update/delete policy) → audit trail.
- All writes go through existing tables — no duplicate stores.

---

## Technical Section

**Migrations**
1. `ALTER TABLE` add `consignment_id uuid` to `finance_invoices`, `finance_expenses`, `trucking_jobs`, `cargo_receipts`, `client_shipments` (nullable, indexed).
2. `CREATE TABLE consignment_events (id, consignment_id, event_type, source_department, payload jsonb, actor_id, created_at)` + RLS (staff read, system insert).
3. `CREATE TABLE notifications (id, user_id, consignment_id nullable, type, channel, title, body, link, read_at, created_at)` + RLS (own rows + admin).
4. Trigger functions:
   - `fn_on_workflow_stage_change()` — creates invoice draft / trucking job / events.
   - `fn_on_invoice_paid()` — advances workflow + event.
   - `fn_on_trucking_status_change()` — emits tracking-ready event.
   - `fn_on_document_uploaded()` — sets stage if first doc.
5. `ALTER PUBLICATION supabase_realtime ADD TABLE` for the six tables above.

**Edge functions**
- `dispatch-notification` (new): reads `consignment_events` for unprocessed rows → fans out to channels.
- `ai-assistant` (extend): add tool handlers listed in §6.

**Frontend**
- `src/hooks/useNotifications.ts` (new) — realtime subscription + mark-as-read.
- `src/hooks/useConsignmentRealtime.ts` (new).
- `src/components/layout/TopBar.tsx` — bell badge wired to hook.
- Dashboard widgets: small cross-link columns added to existing tables (Operations, Accounts, Fleet, Warehouse).
- Client portal `ClientShipments.tsx` — live stage timeline + copy tracking link.
- `AIChatPanel` — no structural change; new tool calls flow through existing channel.

**Out of scope of this plan** (call out, not implementing now)
- Real WhatsApp/SMS provider wiring (we'll stub queue + leave TODO until you choose a provider, e.g. Twilio).
- Replacing existing per-department CRUD UIs — they keep working; we only add cross-links and triggers.

---

## Rollout Order

1. Migrations (link columns + `consignment_events` + `notifications` + RLS + realtime publication).
2. Trigger functions for workflow ↔ invoice ↔ trucking ↔ documents.
3. `dispatch-notification` edge function + `useNotifications` hook + TopBar badge.
4. Cross-department columns on each dashboard.
5. AI assistant new tools.
6. Client portal live timeline + tracking link share.

Approve and I'll execute step by step (each migration shown for confirmation before code changes).
