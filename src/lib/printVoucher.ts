import logo from "@/assets/logo.png";
import { VOUCHER_TYPE_LABEL, type ChartAccount, type Voucher, type VoucherLine } from "@/types/accounts";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const money = (n: number) => (n ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");
const blank = (v: unknown) => (v ? esc(v) : "&nbsp;");

/** Opens a printable hard-copy voucher in the SLAC letterhead layout. */
export function printVoucher(form: Partial<Voucher>, lines: VoucherLine[], accounts: ChartAccount[]) {
  const type = form.voucher_type ?? "payment";
  const cur = form.currency ?? "GHS";
  const used = lines.filter((l) => l.account_id || l.debit || l.credit);
  const rows = [...used, ...Array(Math.max(0, 8 - used.length)).fill(null)];
  const acc = (id: string) => accounts.find((a) => a.id === id);
  const dr = used.reduce((s, l) => s + Number(l.debit || 0), 0);
  const cr = used.reduce((s, l) => s + Number(l.credit || 0), 0);
  const method = (form.payment_method ?? "").replace(/_/g, " ");

  const html = `<!doctype html><html><head><title>${esc(form.voucher_no ?? VOUCHER_TYPE_LABEL[type])}</title>
<style>
@page{size:letter;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;margin:0}
.head{display:flex;align-items:center;gap:16px;margin-bottom:14px}.head img{height:54px}
.head h1{font-size:17px;margin:0}.head p{margin:3px 0 0;font-size:10px;color:#444}
h2{text-align:center;font-size:13px;margin:16px 0}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 28px;margin-bottom:14px}
.f{display:flex;gap:6px}.f b{white-space:nowrap}.f span{flex:1;border-bottom:1px solid #333;min-height:14px;text-transform:capitalize}
.full{grid-column:1/3}
table{width:100%;border-collapse:collapse}th,td{border:1px solid #999;padding:6px 8px;height:24px}
th{background:#e6e6e6;text-align:left}td.n{text-align:right;width:110px}tr:nth-child(even) td{background:#f5f5f5}
tfoot td{font-weight:bold}
.sig{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:46px}.sig div{border-top:1px solid #333;padding-top:4px;text-align:center}
.bank{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:26px;font-size:10px}.bank p{margin:2px 0}
</style></head><body>
<div class="head"><img src="${logo}" alt="SLAC"/><div><h1>Shippers Link Agencies Company Limited.</h1>
<p>Clearing | Forwarding | Warehousing | Trucking | Consolidation</p></div></div>
<h2>${esc(VOUCHER_TYPE_LABEL[type]).toUpperCase()}</h2>
<div class="grid">
<div class="f"><b>Date:</b><span>${blank(form.voucher_date)}</span></div>
<div class="f"><b>VOUCHER NO:</b><span>${blank(form.voucher_no)}</span></div>
<div class="f"><b>${type === "receipt" ? "RECEIVED FROM" : "PAYEE"}:</b><span>${blank(form.party_name)}</span></div>
<div class="f"><b>REFERENCE:</b><span>${blank(form.reference)}</span></div>
<div class="f"><b>PAYMENT METHOD:</b><span>${blank(method)}</span></div>
<div class="f"><b>CURRENCY / RATE:</b><span>${esc(cur)}${cur !== "GHS" ? ` @ ${esc(form.exchange_rate)}` : ""}</span></div>
<div class="f full"><b>NARRATION:</b><span>${blank(form.narration)}</span></div>
</div>
<table><thead><tr><th>ACCOUNT</th><th>DESCRIPTION</th><th>DEBIT (${esc(cur)})</th><th>CREDIT (${esc(cur)})</th></tr></thead><tbody>
${rows.map((l) => { const a = l && acc(l.account_id); return `<tr><td>${a ? esc(`${a.code} — ${a.name}`) : "&nbsp;"}</td><td>${esc(l?.description)}</td><td class="n">${l ? money(Number(l.debit)) : ""}</td><td class="n">${l ? money(Number(l.credit)) : ""}</td></tr>`; }).join("")}
</tbody><tfoot><tr><td colspan="2">TOTAL</td><td class="n">${money(dr)}</td><td class="n">${money(cr)}</td></tr></tfoot></table>
<div class="sig"><div>Prepared By</div><div>Checked By</div><div>Approved By</div><div>${type === "receipt" ? "Paid By" : "Received By"}</div></div>
<div class="bank"><div><p><b>PAYMENT ACCOUNT DETAILS;</b></p><p><b>GHANA CEDIS ACCOUNT;</b></p><p>A/C NAME; SHIPPERS LINK AGENCIES CO, LTD</p><p>A/C NUMBER; 0290063569221</p><p>ACCESS BANK TEMA INDUSTRIAL AREA</p></div>
<div><p><b>USD ACCOUNT;</b></p><p>A/C NAME: SHIPPERS LINK AGENCIES CO, LTD</p><p>A/C NUMBER: 1029000002505</p><p>ACCESS BANK TEMA INDUSTRIAL AREA</p></div></div>
<script>window.onload=()=>{setTimeout(()=>window.print(),300)}</script>
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
}
