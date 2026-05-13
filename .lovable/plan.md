# Client Portal Rebuild

The portal already has Dashboard, Shipments, Documents, Invoices and Messages pages, but only Documents and Invoices are routed and there is no Payments, Statement of Account or Notifications surface. This rebuild wires everything into a clean 4-tab structure (Dashboard / Shipments / Documents / Financials) and fills the missing pieces.

## Scope

### 1. Routing & Layout
- Wire all 4 tabs in `App.tsx`: `/portal` (Dashboard) · `/portal/shipments` · `/portal/documents` · `/portal/financials`.
- Replace `ClientPortalLayout` nav with: Dashboard, Shipments, Documents, Financials, Notifications (bell icon).
- Default redirect changes from `/portal/invoices` → `/portal`.

### 2. Dashboard (`ClientDashboard`)
- Already built — keep stat cards, active shipments, pending invoices, outstanding balance.
- Add: "Track Live" button on shipments currently in `in_transit` (links to `/track/:token`).
- Add unread notifications counter card.

### 3. Shipments (`ClientShipments`)
- Keep existing card grid + status timeline + realtime subscription.
- Add **"Track Shipment Live"** button in the detail dialog when `tracking_link` is present (deep-link to `/track/:token`).
- Map status → label colors: Documents Received, In Clearance, Released, In Transit, Delivered.

### 4. Documents Vault (`ClientDocuments`)
- Already built — keep download-with-signed-URL + category filters + uploads.
- Add **inline preview** dialog (PDF/image) before download using a 5-minute signed URL inside an `<iframe>` / `<img>`.
- Add filter by shipment.

### 5. Financials (new `ClientFinancials` page with sub-tabs)
- **Invoices**: existing `ClientInvoices` content, with PDF download (client-side jsPDF generation).
- **Payments**: new sub-tab listing all `client_invoices` rows with `paid_amount > 0`, sorted by `paid_date`, showing invoice link, amount, method.
- **Statement of Account**: auto-generated summary
  - Total Billed · Total Paid · Outstanding Balance · Aging buckets (0–30 / 31–60 / 60+ days)
  - Line-by-line ledger (Date, Invoice #, Description, Debit, Credit, Balance)
  - "Download PDF" button using jsPDF + autotable.

### 6. Notifications (new `/portal/notifications`)
- Reuse existing `notifications` table filtered by `recipient_id = auth.uid()`.
- Trigger `INSERT` on `notifications` from existing DB triggers when:
  - new `client_invoices` row inserted
  - `client_invoices.paid_amount` updated
  - `client_shipments.status` changes to `in_transit` (delivery start)
- Bell icon in header shows unread count; clicking opens list page; mark-as-read on click.

### 7. Real-time sync
- Add Supabase realtime channels on `client_invoices` and `notifications` (already on `client_shipments`).

### 8. Security (no changes needed — already enforced)
- RLS policies via `get_client_customer_id(auth.uid())` already isolate data.
- Storage downloads use 60–300s signed URLs.
- Read-only: no UPDATE/DELETE policies for clients on financial/shipment tables.

## Out of scope (not implemented this round)
- WhatsApp notifications (mentioned as optional).
- Email notifications via separate edge function (existing notifications system covers in-app; email needs domain setup — can be added in a follow-up).
- Online payment processing (statement notes that clients should "contact accounts").

## Technical notes
- New migration: 3 DB triggers (invoice insert/payment/shipment status) → INSERT into `notifications` with `recipient_id` resolved from `client_profiles.user_id` via `customer_id` lookup. Add `client_invoices` to `supabase_realtime` publication.
- New deps: none — `jspdf` + `jspdf-autotable` likely already present (used in DutyEstimator); will verify and add if missing.
- New files: `src/pages/client/ClientFinancials.tsx`, `src/pages/client/ClientPayments.tsx`, `src/pages/client/ClientStatement.tsx`, `src/pages/client/ClientNotifications.tsx`, `src/components/client/DocumentPreview.tsx`.
- Edited: `src/App.tsx`, `src/components/layout/ClientPortalLayout.tsx`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientShipments.tsx`, `src/pages/client/ClientDocuments.tsx`.