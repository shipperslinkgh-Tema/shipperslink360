import logo from "@/assets/logo.png";

export const EXPENSE_CATEGORIES = [
  { value: "shipping_line", label: "Shipping Line Charges" },
  { value: "customs_duty", label: "Customs / Duty Payment" },
  { value: "port_gpha", label: "Port & GPHA Charges" },
  { value: "office", label: "Office Expenses" },
  { value: "transport", label: "Transport / Haulage" },
  { value: "other", label: "Other (specify below)" },
] as const;

export const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "cash", label: "Cash" },
  { value: "bank_cheque", label: "Bank Cheque" },
] as const;

export interface ExpenseItem { description: string; ref: string; amount: number }

export const itemsTotal = (items: ExpenseItem[]) =>
  Math.round(items.reduce((s, i) => s + Number(i.amount || 0), 0) * 100) / 100;

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const under1000 = (n: number): string => {
  const h = Math.floor(n / 100), r = n % 100;
  const rest = r < 20 ? ONES[r] : `${TENS[Math.floor(r / 10)]}${r % 10 ? "-" + ONES[r % 10] : ""}`;
  return [h ? `${ONES[h]} Hundred` : "", rest].filter(Boolean).join(" and ");
};
/** Converts a GHS amount to words, e.g. 10471.87 -> "Ten Thousand Four Hundred and Seventy-One Cedis, Eighty-Seven Pesewas". */
export function amountInWords(amount: number): string {
  const cedis = Math.floor(amount), pes = Math.round((amount - cedis) * 100);
  if (!cedis && !pes) return "";
  const units = ["", " Thousand", " Million", " Billion"];
  const parts: string[] = [];
  let n = cedis, i = 0;
  while (n > 0) { const c = n % 1000; if (c) parts.unshift(under1000(c) + units[i]); n = Math.floor(n / 1000); i++; }
  const c = parts.length ? `${parts.join(" ")} Cedi${cedis === 1 ? "" : "s"}` : "";
  return [c, pes ? `${under1000(pes)} Pesewa${pes === 1 ? "" : "s"}` : ""].filter(Boolean).join(", ") + " Only";
}

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const money = (n: number) => (n ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");

/** Opens a print-ready SLAC expense voucher matching the company hard copy. */
export function printExpenseVoucher(v: any, names: { preparedBy?: string; checkedBy?: string } = {}) {
  const items: ExpenseItem[] = v.items ?? [];
  const rows = [...items, ...Array(Math.max(0, 6 - items.length)).fill(null)];
  const box = (on: boolean, label: string) => `<span class="cb"><i>${on ? "✓" : ""}</i>${label}</span>`;
  const html = `<!doctype html><html><head><title>${esc(v.voucher_no ?? "Expense Voucher")}</title><style>
@page{size:A4;margin:10mm}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{font-family:Arial,sans-serif;font-size:10.5px;color:#111;margin:0}
.top{background:#1f2f6b;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #c9a24a}
.top .l{display:flex;gap:12px;align-items:center}.top img{height:46px;background:#fff;border-radius:4px;padding:2px}.top h1{margin:0;font-size:15px}.top p{margin:2px 0 0;font-size:9.5px}
.top h2{margin:0;color:#e0b65a;font-size:18px;text-align:right}.top small{display:block;text-align:right;font-size:9px}
.sec{padding:8px 16px;border-bottom:1px solid #ddd}.row{display:flex;gap:20px;align-items:flex-end}.f{display:flex;gap:6px;flex:1}.f b{white-space:nowrap;color:#1f2f6b}.f span{flex:1;border-bottom:1px solid #555;min-height:13px}
.cb{display:inline-flex;align-items:center;gap:4px;margin-right:14px}.cb i{width:12px;height:12px;border:1px solid #333;display:inline-flex;align-items:center;justify-content:center;font-style:normal;font-size:10px}
.cats{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:4px}
table{width:100%;border-collapse:collapse}th{background:#1f2f6b;color:#fff;padding:6px}td{border-bottom:1px solid #ddd;padding:5px 8px;height:22px}td.n{text-align:right}
.tot{display:flex;background:#1f2f6b;color:#fff;font-weight:bold}.tot div{padding:8px 16px;flex:1}.tot .a{background:#c9a24a;color:#111;flex:0 0 160px;text-align:right}
.sig{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:34px 16px 8px}.sig div{border-top:1px solid #333;text-align:center;padding-top:3px;font-weight:bold;color:#1f2f6b}.sig small{display:block;font-weight:normal;color:#555;font-size:8.5px}.sig em{display:block;font-style:normal;color:#111;font-weight:normal;margin-top:-30px;margin-bottom:18px;min-height:12px}
.foot{background:#1f2f6b;color:#fff;font-size:8.5px;text-align:center;padding:5px}
</style></head><body>
<div class="top"><div class="l"><img src="${logo}"/><div><h1>SHIPPERS LINK AGENCIES CO., LTD</h1><p>Consolidation | Clearing | Forwarding | Warehousing | Trucking</p><p>Tema Port, Ghana &nbsp; Tel: 0209116560 | 0245525968</p></div></div>
<div>${v.voucher_type === "petty_cash" ? "<h2>PETTY CASH VOUCHER</h2><small>Petty Cash Disbursement</small>" : "<h2>EXPENSE VOUCHER</h2><small>Operational &amp; Office Expense Disbursement</small>"}</div></div>
<div class="sec row"><div class="f"><b>Voucher No:</b><span>${esc(v.voucher_no)}</span></div><div class="f"><b>Date:</b><span>${esc(v.voucher_date)}</span></div><div class="f"><b>File / Job Ref:</b><span>${esc(v.job_ref)}</span></div></div>
<div class="sec"><div class="row"><div class="f"><b>Paid To:</b><span>${esc(v.paid_to)}</span></div><div><b style="color:#1f2f6b">Payment:</b> ${PAYMENT_METHODS.map((p) => box(v.payment_method === p.value, p.label)).join("")}</div></div>
<div class="row" style="margin-top:6px"><div class="f"><b>Account / Mobile Money No:</b><span>${esc(v.account_no)}</span></div></div></div>
<div class="sec"><b style="color:#1f2f6b">Expense Category:</b><div class="cats">${EXPENSE_CATEGORIES.map((c) => box(v.category === c.value, c.label + (c.value === "other" && v.category_other ? `: ${esc(v.category_other)}` : ""))).join("")}</div>
<div class="f" style="margin-top:6px"><b>Description / Particulars:</b><span>${esc(v.description)}</span></div></div>
<table><thead><tr><th>Item Description</th><th style="width:30%">Invoice / Ref No.</th><th style="width:20%">Amount (GHS)</th></tr></thead><tbody>
${rows.map((r) => `<tr><td>${esc(r?.description)}</td><td>${esc(r?.ref)}</td><td class="n">${r ? money(Number(r.amount)) : ""}</td></tr>`).join("")}</tbody></table>
<div class="tot"><div>TOTAL AMOUNT (GHS)</div><div class="a">${money(Number(v.total_amount))}</div></div>
<div class="sec f"><b>Total in Words (GHS):</b><span>${esc(amountInWords(Number(v.total_amount || 0)))}</span></div>
<div class="sec" style="font-weight:bold;color:#1f2f6b">AUTHORISATION &amp; ACKNOWLEDGEMENT</div>
<div class="sig"><div><em>${esc(names.preparedBy)}</em>Prepared By<small>Name &amp; Signature / Date</small></div><div><em>${esc(names.checkedBy)}</em>Checked By<small>Accounts / Name &amp; Signature</small></div><div><em></em>Approved By<small>Director of Operations / Date</small></div><div><em></em>Received / Paid By<small>Name &amp; Signature / Date</small></div></div>
<div class="foot">SLAC | Tema Port, Ghana | 0209116560 | 0245525968 | All expenses must be supported by valid receipts/invoices. Voucher must be signed before payment.</div>
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(html); w.document.close();
  return true;
}
