# Client Management System — Unified Rebuild

Replace the separate **Client Data Portal** and **Client Document Management** pages with one integrated **Client Management System** module, and expand the **Client Portal** to surface documents, invoices, payments, and a downloadable Statement of Account.

---

## 1. Admin: Client Management System (single module)

New page: `src/pages/ClientManagement.tsx` (replaces both `ClientDataManagement` and `ClientDocumentManagement` in routing/sidebar).

Layout: master/detail.
- **Left**: searchable client list (Company, Client ID, TIN, Status, Outstanding balance).
- **Right**: tabs for the selected client:
  1. **Profile** — create/edit/deactivate. Fields: Client ID (auto), Company Name, TIN, Contact Person, Phone, Email, Warehouse Destinations (multi), Status. Read-only list of Linked Consignments.
  2. **Documents** — upload + list PDFs. Fields per upload: Document Name, Document Type (Invoice, Receipt, BL, BOE, Delivery Order, IDF, Other), Consignment (optional dropdown of that client's shipments), file. Preview, download, delete. Filter by type/consignment/date.
  3. **Financials** — three sub-tabs:
     - **Invoices**: list/create. Linked to client + consignment. Status (Paid/Unpaid/Overdue auto from `paid_amount` vs `amount` and `due_date`). Download PDF.
     - **Payments**: record payment → auto-applies to selected invoice, updates balance.
     - **Statement of Account**: opening balance, total invoiced, total paid, outstanding, line history. **Download PDF** (jsPDF + autotable).

Old routes `/clients-data` and `/client-documents` redirect to `/client-management`.

## 2. Client Portal (read-only)

Keep existing layout. Confirm sections:
- 📦 **Shipments** (existing).
- 📁 **Documents** — already a vault; no changes beyond ensuring new admin-uploaded docs appear (already wired to `client_documents`).
- 💰 **Financials** — rebuild `ClientFinancials.tsx` with three tabs:
  - **Invoices**: list + status badge + Download PDF.
  - **Payments**: history with linked invoice number.
  - **Statement**: totals (billed / paid / balance) + **Download Statement (PDF)** button.

Sidebar: replace separate `Invoices`/`Financials` entries with one **Financials** entry.

## 3. Data model (no breaking changes)

Existing tables already cover this — reuse:
- `customers` / `client_profiles` — client data.
- `client_documents` (bucket `client-documents`) — PDFs.
- `client_invoices` — invoices.
- New table **`client_payments`** — payment records linked to `client_invoices` (id, customer_id, invoice_id, amount, currency, paid_date, method, reference, notes, created_by). Trigger updates `client_invoices.paid_amount` and `status`.

RLS: admin/accounts staff full access; clients read-only on rows where `customer_id = get_client_customer_id(auth.uid())`.

## 4. Notifications

Reuse existing `notify_client(...)` triggers. Add trigger on `client_payments` insert → notifies client "Payment received".

## 5. PDF generation

Use already-installed `jspdf` + `jspdf-autotable` for Invoice PDF and Statement of Account PDF (client-side).

## 6. Files

**New**
- `src/pages/ClientManagement.tsx`
- `src/components/client-mgmt/ClientList.tsx`
- `src/components/client-mgmt/ClientProfileTab.tsx`
- `src/components/client-mgmt/ClientDocumentsTab.tsx`
- `src/components/client-mgmt/ClientFinancialsTab.tsx`
- `src/lib/clientPdf.ts` (invoice + statement PDF generators)
- Migration: `client_payments` table + trigger + RLS

**Edited**
- `src/App.tsx` — route `/client-management`, redirects from old paths
- Sidebar component — single "Client Management" entry
- `src/pages/client/ClientFinancials.tsx` — Invoices/Payments/Statement tabs + PDF download

**Deleted**
- `src/pages/ClientDataManagement.tsx`
- `src/pages/ClientDocumentManagement.tsx`
- `src/pages/client/ClientInvoices.tsx` (merged into ClientFinancials)

---

Proceed with this plan?
