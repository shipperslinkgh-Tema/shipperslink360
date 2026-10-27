import logo from "@/assets/logo.png";

export const INVOICE_CHARGES = ["CUSTOMS DUTY", "HANDLING CHARGES", "VALUATION", "DOCUMENTATION", "PORT EXP/MISC", "SERVICE CHARGE"] as const;

export interface ProformaData {
  date: string;
  invoiceNo: string;
  customer: string;
  address1: string;
  address2: string;
  phone: string;
  billOfLading: string;
  vehicle: string;
  chassis: string;
  charges: Record<string, number>;
  deposit: number;
}

export const proformaTotals = (d: ProformaData) => {
  const subtotal = INVOICE_CHARGES.reduce((s, c) => s + Number(d.charges[c] || 0), 0);
  return { subtotal, balance: subtotal - Number(d.deposit || 0) };
};

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const money = (n: number) => (n ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");

/** Opens a print-ready SLAC pro-forma invoice matching the company hard-copy template. */
export function printProforma(d: ProformaData) {
  const { subtotal, balance } = proformaTotals(d);
  const line = (v: string) => `<div class="ln">${esc(v) || "&nbsp;"}</div>`;
  const html = `<!doctype html><html><head><title>${esc(d.invoiceNo || "Pro-forma Invoice")}</title>
<style>
@page{size:letter;margin:16mm 18mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;margin:0}
.head{display:flex;align-items:center;gap:16px;margin-bottom:20px}.head img{height:54px}
.head h1{font-size:17px;margin:0}.head p{margin:3px 0 0;font-size:10px;color:#444}
h2{text-align:center;font-size:13px;margin:18px 0 20px}
.row{display:flex;justify-content:space-between;gap:30px;margin-bottom:14px}
.f{display:flex;gap:6px;flex:1;font-weight:bold}.f span{flex:1;border-bottom:1px solid #333;font-weight:normal;min-height:14px}
.ln{border-bottom:1px solid #333;width:55%;min-height:16px;margin-bottom:4px}
table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #999;padding:6px 8px;height:25px}
th{background:#e6e6e6;text-align:left}td.n{text-align:right;width:38%}tr:nth-child(odd) td:first-child{background:#f3f3f3}
tr.b td{font-weight:bold}
.bank{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:26px;font-size:10px}.bank p{margin:2px 0}
</style></head><body>
<div class="head"><img src="${logo}" alt="SLAC"/><div><h1>Shippers Link Agencies Company Limited.</h1>
<p>Clearing | Forwarding | Warehousing | Trucking | Consolidation</p></div></div>
<h2>PRO-FORMA INVOICE</h2>
<div class="row"><div class="f">Date:<span>${esc(d.date)}</span></div><div class="f">INVOICE NO;<span>${esc(d.invoiceNo)}</span></div></div>
${line(d.customer)}${line(d.address1)}${line(d.address2)}
<div class="ln" style="width:35%">( ${esc(d.phone) || "&nbsp;"} )</div>
<div class="row" style="margin-top:14px"><div class="f">BILL OF LADING:<span>${esc(d.billOfLading)}</span></div><div class="f"><span>${esc(d.vehicle)}</span></div></div>
<div class="row"><div style="flex:1"></div><div class="f"><i>CHASIS:</i><span>${esc(d.chassis)}</span></div></div>
<table><thead><tr><th>DESCRIPTION</th><th>AMOUNT (GHS)</th></tr></thead><tbody>
${INVOICE_CHARGES.map((c) => `<tr><td>${c}</td><td class="n">${money(Number(d.charges[c] || 0))}</td></tr>`).join("")}
<tr class="b"><td>SUBTOTAL</td><td class="n">${money(subtotal)}</td></tr>
<tr class="b"><td>DEPOSIT</td><td class="n">${money(Number(d.deposit || 0))}</td></tr>
<tr class="b"><td>BALANCE</td><td class="n">${subtotal ? money(balance) || "0.00" : ""}</td></tr>
</tbody></table>
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
