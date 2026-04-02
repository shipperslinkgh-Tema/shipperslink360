import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fmt } from "./types";

export function generateGoodsDutyPdf(estimate: any, ghsConversion: any, currency: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = 210;
  const mx = 15;
  const cw = pw - 2 * mx;
  let y = 8;

  const DARK_BLUE: [number, number, number] = [26, 58, 92];
  const MID_BLUE: [number, number, number] = [46, 109, 164];
  const LIGHT_BLUE: [number, number, number] = [220, 232, 245];
  const LIGHT_GRAY: [number, number, number] = [245, 245, 245];
  const YELLOW_BG: [number, number, number] = [255, 243, 205];
  const GREEN_BG: [number, number, number] = [212, 237, 218];
  const WHITE: [number, number, number] = [255, 255, 255];

  const today = new Date();
  const refNo = `SLAC-GD-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 9000 + 1000)}`;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...DARK_BLUE);
  doc.text("SHIPPERS LINK AGENCIES CO., LTD", pw / 2, y + 5, { align: "center" });
  doc.setFontSize(9.5);
  doc.setTextColor(...MID_BLUE);
  doc.text("GENERAL GOODS DUTY ESTIMATE REPORT", pw / 2, y + 11, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Freight Forwarding & Customs Clearance Specialists | Tema Port, Ghana", pw / 2, y + 16, { align: "center" });
  y += 19;
  doc.setDrawColor(...DARK_BLUE);
  doc.setLineWidth(0.7);
  doc.line(mx, y, pw - mx, y);
  y += 3;

  // Ref
  autoTable(doc, {
    startY: y,
    margin: { left: mx, right: mx },
    theme: "plain",
    styles: { fontSize: 7, cellPadding: 1.5, textColor: [60, 60, 60] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 25 }, 1: { cellWidth: cw / 2 - 25 }, 2: { fontStyle: "bold", cellWidth: 22 }, 3: { cellWidth: cw / 2 - 22 } },
    body: [
      ["Report Ref:", refNo, "Prepared by:", "SLAC Duty Desk"],
      ["Date:", today.toLocaleDateString("en-GB"), "Validity:", "24 hours"],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // Classification
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK_BLUE);
  doc.text("TARIFF CLASSIFICATION", mx, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    margin: { left: mx, right: mx },
    theme: "plain",
    styles: { fontSize: 7.5, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 } },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: cw * 0.3 },
      1: { cellWidth: cw * 0.7 },
    },
    body: [
      ["HS Code", estimate.hs_code],
      ["Description", estimate.hs_description],
      ["Duty Rate", `${estimate.duty_rate_percent}%`],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // Duty Breakdown
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK_BLUE);
  doc.text("DUTY & LEVY BREAKDOWN", mx, y);
  y += 3;

  const hasGhs = !!ghsConversion;
  const head = hasGhs
    ? [["#", "Component", `Amount (${currency})`, "Amount (GHS)"]]
    : [["#", "Component", `Amount (${currency})`]];

  const items = [
    ["1", "CIF Value", estimate.cif_value, ghsConversion?.ghs_cif_value],
    ["2", "Import Duty", estimate.import_duty, ghsConversion?.ghs_import_duty],
    ["3", "VAT", estimate.vat, ghsConversion?.ghs_vat],
    ["4", "NHIL", estimate.nhil, ghsConversion?.ghs_nhil],
    ["5", "GETFund", estimate.getfund, ghsConversion?.ghs_getfund],
    ["6", "ECOWAS Levy", estimate.ecowas_levy, ghsConversion?.ghs_ecowas_levy],
    ["7", "AU Levy", estimate.au_levy, ghsConversion?.ghs_au_levy],
    ["8", "EXIM Levy", estimate.exim_levy, ghsConversion?.ghs_exim_levy],
    ["9", "Processing Fee", estimate.processing_fee, ghsConversion?.ghs_processing_fee],
  ];

  const bodyRows = items.map(([n, label, usd, ghs]) =>
    hasGhs ? [n, label, fmt(usd as number), fmt((ghs as number) || 0)] : [n, label, fmt(usd as number)]
  );

  autoTable(doc, {
    startY: y,
    margin: { left: mx, right: mx },
    head,
    body: bodyRows,
    theme: "grid",
    headStyles: { fillColor: DARK_BLUE, textColor: WHITE, fontStyle: "bold", fontSize: 7, cellPadding: 2 },
    styles: { fontSize: 7, cellPadding: { top: 1.8, bottom: 1.8, left: 3, right: 3 } },
    columnStyles: hasGhs
      ? { 0: { cellWidth: 8, halign: "center" }, 2: { halign: "right" }, 3: { halign: "right" } }
      : { 0: { cellWidth: 8, halign: "center" }, 2: { halign: "right" } },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
  });
  y = (doc as any).lastAutoTable.finalY;

  // Totals
  const totalBody: any[][] = hasGhs
    ? [
        [
          { content: "", styles: { cellWidth: 8 } },
          { content: "TOTAL DUTIES", styles: { fontStyle: "bold", fillColor: YELLOW_BG, textColor: [92, 61, 0] as [number, number, number] } },
          { content: fmt(estimate.total_duties), styles: { halign: "right" as const, fontStyle: "bold", fillColor: YELLOW_BG, textColor: [92, 61, 0] as [number, number, number] } },
          { content: fmt(ghsConversion.ghs_total_duties), styles: { halign: "right" as const, fontStyle: "bold", fillColor: YELLOW_BG, textColor: [92, 61, 0] as [number, number, number] } },
        ],
        [
          { content: "", styles: { cellWidth: 8 } },
          { content: "TOTAL LANDED COST", styles: { fontStyle: "bold", fillColor: GREEN_BG, textColor: [21, 87, 36] as [number, number, number] } },
          { content: fmt(estimate.total_landed_cost), styles: { halign: "right" as const, fontStyle: "bold", fillColor: GREEN_BG, textColor: [21, 87, 36] as [number, number, number] } },
          { content: fmt(ghsConversion.ghs_total_landed_cost), styles: { halign: "right" as const, fontStyle: "bold", fillColor: GREEN_BG, textColor: [21, 87, 36] as [number, number, number] } },
        ],
      ]
    : [
        [
          { content: "", styles: { cellWidth: 8 } },
          { content: "TOTAL DUTIES", styles: { fontStyle: "bold", fillColor: YELLOW_BG, textColor: [92, 61, 0] as [number, number, number] } },
          { content: fmt(estimate.total_duties), styles: { halign: "right" as const, fontStyle: "bold", fillColor: YELLOW_BG, textColor: [92, 61, 0] as [number, number, number] } },
        ],
        [
          { content: "", styles: { cellWidth: 8 } },
          { content: "TOTAL LANDED COST", styles: { fontStyle: "bold", fillColor: GREEN_BG, textColor: [21, 87, 36] as [number, number, number] } },
          { content: fmt(estimate.total_landed_cost), styles: { halign: "right" as const, fontStyle: "bold", fillColor: GREEN_BG, textColor: [21, 87, 36] as [number, number, number] } },
        ],
      ];

  autoTable(doc, {
    startY: y,
    margin: { left: mx, right: mx },
    theme: "grid",
    styles: { fontSize: 8, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 }, lineColor: DARK_BLUE, lineWidth: 0.4 },
    body: totalBody,
  });
  y = (doc as any).lastAutoTable.finalY + 5;

  // Footer
  y = Math.max(y, 268);
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(mx, y, pw - mx, y);
  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...DARK_BLUE);
  doc.text("SHIPPERS LINK AGENCIES CO., LTD", pw / 2, y, { align: "center" });
  y += 3;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text("GIFF Secretariat Ext. Room 4, Meridian Rd, Tema Harbour", pw / 2, y, { align: "center" });
  y += 2.5;
  doc.text("Tel: 0209116560 | 0245525968", pw / 2, y, { align: "center" });
  y += 2.5;
  doc.text("www.shipperslinkgh.com | info@shipperslinkgh.com", pw / 2, y, { align: "center" });
  y += 3;
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  doc.text("This document is confidential and intended for the named recipient only. Estimates only — verify with GRA.", pw / 2, y, { align: "center" });

  doc.save(`SLAC_Goods_Duty_Estimate_${today.toISOString().slice(0, 10)}.pdf`);
}
