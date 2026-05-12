# Sage-Style Accounts Portal Rebuild

Rebuild the Finance area as a Sage-like double-entry accounting portal where every transaction flows through a voucher, posts to the ledger, and links back to a consignment + customer.

## Scope

Replace the current Finance pages with a dedicated **Accounts Portal** at `/accounts` (kept alongside existing pages so nothing breaks for Operations). Accounts/Admin/Super Admin can edit; other staff are read-only; clients have no access.

## Database (new tables)

All with RLS: only `accounts`/`admin`/`super_admin` (via `has_role` / `profiles.department`) can write; staff can read; clients blocked. Posted vouchers are locked via trigger.

- **chart_of_accounts** — code, name, type (asset/liability/equity/income/expense), parent_id, currency, is_active
- **vouchers** — voucher_no (auto: PV/RV/JV/CV-YYYY-####), type (payment/receipt/journal/contra), date, status (draft/posted/cancelled), reference, narration, currency, exchange_rate, total_amount, ghs_equivalent, consignment_id (FK to `consignment_workflows`), customer_id, party_name, payment_method, bank_account_id, invoice_id (for receipts), posted_at, posted_by, created_by
- **voucher_lines** — voucher_id, account_id, debit, credit, description, line_no (double-entry; trigger enforces sum(debit)=sum(credit) on post)
- **ledger_entries** — voucher_id, voucher_line_id, account_id, date, debit, credit, balance_after, consignment_id, customer_id, currency, ghs_equivalent (auto-populated when voucher is posted)
- **audit_logs_finance** — voucher_id, action, before, after, user_id, timestamp

Triggers/functions:
- `generate_voucher_number()` BEFORE INSERT
- `post_voucher(voucher_id)` SECURITY DEFINER → validates balance, inserts ledger_entries, sets status=posted, locks edits
- `prevent_posted_edit()` BEFORE UPDATE/DELETE on vouchers/voucher_lines
- `update_invoice_on_receipt()` after receipt voucher posts → updates `finance_invoices.paid_amount` + status
- Seed default Chart of Accounts (Cash, Bank GHS/USD, AR, AP, Sales-Clearance, Sales-Freight, Sales-Trucking, Port Charges, Duty, Fuel, Terminal Charges, FX Gain/Loss, Retained Earnings, etc.)

## Frontend

New route group `/accounts/*` with sidebar (Accounts dept only, plus admins):

```text
Accounts Portal
├── Dashboard          /accounts
├── Invoices           /accounts/invoices
├── Vouchers           /accounts/vouchers
│   ├── Payment        /accounts/vouchers/payment
│   ├── Receipt        /accounts/vouchers/receipt
│   ├── Journal        /accounts/vouchers/journal
│   └── Contra         /accounts/vouchers/contra
├── Expenses           /accounts/expenses
├── Ledgers            /accounts/ledgers (General / Customer / Supplier tabs)
└── Reports            /accounts/reports (P&L, Cash Flow, AR Aging, Voucher Register, Job Profitability)
```

### Dashboard
Cards: Total Revenue, Total Expenses, Outstanding Invoices, Cash Balance, Profit per Consignment table (top 10).

### Invoices
Reuse existing `finance_invoices`. Add: link-to-consignment selector, line items (services), PDF export (jspdf + autoTable already common — install if missing), status badges, "Record Receipt" CTA → opens prefilled Receipt Voucher.

### Vouchers
- List view with filters (type, date, status, consignment, customer) and color status (Draft=grey, Posted=green, Cancelled=red, Overdue=red on invoices)
- Create dialog per type with double-entry line grid (account, debit, credit, running balance check)
- "Post" action calls `post_voucher` RPC. After posted, form is read-only.
- Auto-link: opening from Expense pre-creates a Payment Voucher draft; from Invoice → Receipt Voucher.

### Expenses
Existing `finance_expenses` list + "Approve & Post" button that auto-generates a Payment Voucher (Dr Expense, Cr Cash/Bank).

### Ledgers
Query `ledger_entries` grouped by account / customer / supplier with date range and running balance.

### Reports
Built from `ledger_entries` + `finance_invoices`:
- P&L (income vs expense accounts in date range)
- Cash Flow (movements on cash/bank accounts)
- AR Aging (current / 30 / 60 / 90+ buckets)
- Voucher Register (filterable list)
- Job Profitability (revenue − costs per `consignment_id`)
All exportable to CSV (UTF-8 BOM, per project memory).

### Multi-currency
Currency + exchange_rate fields on every voucher; `ghs_equivalent` auto-computed; reports run in GHS by default with currency toggle.

## Security & Access
- New `useAccountsAccess` hook checking `profiles.department='accounts'` OR admin role
- Route guard redirects unauthorized staff
- RLS policies enforce write restriction to accounts/admin
- Audit log entry on every create/post/cancel

## Files to create
- `supabase/migrations/<ts>_accounts_portal.sql` (tables, functions, triggers, RLS, COA seed)
- `src/pages/accounts/AccountsLayout.tsx`
- `src/pages/accounts/AccountsDashboard.tsx`
- `src/pages/accounts/AccountsInvoices.tsx`
- `src/pages/accounts/AccountsVouchers.tsx`
- `src/pages/accounts/VoucherForm.tsx` (handles all 4 types)
- `src/pages/accounts/AccountsExpenses.tsx`
- `src/pages/accounts/AccountsLedgers.tsx`
- `src/pages/accounts/AccountsReports.tsx`
- `src/hooks/useVouchers.ts`, `useLedger.ts`, `useChartOfAccounts.ts`, `useAccountsReports.ts`
- `src/lib/voucherPdf.ts`, `src/lib/invoicePdf.ts`
- `src/types/accounts.ts`
- Sidebar entry in `AppSidebar.tsx` (visible to accounts/admin)
- Route registration in `App.tsx`

## Files to keep / leave alone
- Existing `Finance.tsx`, `Invoicing.tsx`, `Payments.tsx` stay — they continue to feed data the new portal reads. Old `AccountsDashboard.tsx` becomes a redirect to `/accounts`.

## Out of scope (this round)
- Tax/VAT handling
- Bank statement import (existing bank module already covers this; Contra vouchers can reference bank accounts)
- Year-end closing entries
- Approval workflow beyond single "Post" action

This is a sizable build (~15-20 files + a substantial migration). After your approval I'll create the migration first (you'll approve it), then ship the UI.
