import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DutyEstimate, GhsConversion, DutyFormData, fmt } from "./types";

export function generateDutyPdf(
  estimate: DutyEstimate,
  ghsConversion: GhsConversion | null,
  form: DutyFormData
) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 15;

  const darkBlue = [30, 58, 95] as [number, number, number];
  const gold = [180, 155, 80] as [number, number, number];
  const white = [255, 255, 255] as [number, number, number];
  const lightGray = [245, 245, 248] as [number, number, number];
  const green = [34, 139, 34] as [number, number, number];
  const red = [200, 50, 50] as [number, number, number];

  const curr = estimate.currency || form.currency;
  const isGhs = curr === "GHS";
  const exchangeRate = ghsConversion?.exchange_rate ?? 1;
  const toGhs = (v: number) => ghsConversion ? v * exchangeRate : v;

  // Helper: section header
  const sectionHeader = (title: string) => {
    if (y > 265) { doc.addPage(); y = 15; }
    doc.setFillColor(...darkBlue);
    doc.rect(margin, y, contentWidth, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...white);
    doc.text(title, margin + 4, y + 5.5);
    y += 12;
  };

  // === HEADER ===
  doc.setFillColor(...darkBlue);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...white);
  doc.text("SHIPPERS LINK AGENCIES CO., LTD", margin, 12);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...gold);
  doc.text("FREIGHT FORWARDING & CUSTOMS CLEARING", pageWidth - margin, 10, { align: "right" });
  doc.text("Tema Port, Ghana", pageWidth - margin, 15, { align: "right" });

  y = 35;

  // === TITLE ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...darkBlue);
  doc.text("ESTIMATED CUSTOMS DUTY ASSESSMENT", pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Pre-Arrival Duty Estimate — For Client Reference Only", pageWidth / 2, y, { align: "center" });
  y += 10;

  // Reference info
  const refNo = `SLAC/DA/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`;
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: lightGray, textColor: darkBlue, fontStyle: "bold" },
    body: [
      [{ content: "Prepared by:", styles: { fontStyle: "bold" } }, "Shippers Link Agencies Co., Ltd", { content: "Date Issued:", styles: { fontStyle: "bold" } }, dateStr],
      [{ content: "Port of Entry:", styles: { fontStyle: "bold" } }, "Tema, Ghana", { content: "Goods:", styles: { fontStyle: "bold" } }, form.goods_description || "—"],
    ],
    columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 55 }, 2: { cellWidth: 25 }, 3: { cellWidth: 55 } },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // === SECTION 1: TARIFF CLASSIFICATION ===
  sectionHeader("1. TARIFF CLASSIFICATION & DUTY RATE");

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: darkBlue, textColor: white, fontStyle: "bold", fontSize: 8 },
    styles: { fontSize: 9, cellPadding: 3 },
    head: [["HS Code", "Description", "Import Duty Rate"]],
    body: [[
      estimate.hs_code,
      estimate.hs_description,
      `${estimate.duty_rate_percent}%${estimate.duty_rate_percent === 0 ? " — ZERO RATED" : ""}`,
    ]],
    columnStyles: {
      0: { cellWidth: 25, fontStyle: "bold" },
      2: {
        cellWidth: 40,
        fontStyle: "bold",
        textColor: estimate.duty_rate_percent === 0 ? green : darkBlue,
      },
    },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // === SECTION 2: VALUATION BASIS ===
  sectionHeader("2. VALUATION BASIS (GRA CIF Methodology)");

  const fob = parseFloat(form.fob_value) || 0;
  const freight = parseFloat(form.freight_value) || 0;
  const insurance = parseFloat(form.insurance_value) || 0;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: darkBlue, textColor: white, fontStyle: "bold", fontSize: 8 },
    styles: { fontSize: 9, cellPadding: 3 },
    head: [["Parameter", "Detail", `Amount (${curr})`]],
    body: [
      ["FOB Value", "Declared FOB value", `$ ${fmt(fob)}`],
      ["Freight", `${form.country_of_origin || "Origin"} → Tema Port`, `$ ${fmt(freight)}`],
      ["Insurance (est.)", "Based on FOB value", `$ ${fmt(insurance)}`],
      [
        { content: "CIF Value (Customs Base)", styles: { fontStyle: "bold", textColor: darkBlue } },
        { content: "Cost + Insurance + Freight", styles: { fontStyle: "bold" } },
        { content: `$ ${fmt(estimate.cif_value)}`, styles: { fontStyle: "bold", textColor: darkBlue } },
      ],
    ],
    columnStyles: { 0: { cellWidth: 45 }, 2: { cellWidth: 35, halign: "right" } },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // === SECTION 3: DUTY BREAKDOWN ===
  if (y > 200) { doc.addPage(); y = 15; }
  sectionHeader("3. ESTIMATED DUTY & LEVY BREAKDOWN (2026 GRA / ICUMS Rates)");

  const vatBase = estimate.cif_value + estimate.import_duty + (estimate.ecowas_levy || 0) + (estimate.au_levy || 0) + estimate.exim_levy + estimate.processing_fee;

  const breakdownBody: any[][] = [
    [`Import Duty (HS ${estimate.hs_code})`, `${estimate.duty_rate_percent}%`, `CIF $${fmt(estimate.cif_value)}`, `$ ${fmt(estimate.import_duty)}`, `GHS ${fmt(ghsConversion?.ghs_import_duty ?? toGhs(estimate.import_duty))}`],
    ["ECOWAS Community Levy", "0.5%", `CIF $${fmt(estimate.cif_value)}`, `$ ${fmt(estimate.ecowas_levy || 0)}`, `GHS ${fmt(ghsConversion?.ghs_ecowas_levy ?? toGhs(estimate.ecowas_levy || 0))}`],
    ["EXIM / AU Levy", "0.75%", `CIF $${fmt(estimate.cif_value)}`, `$ ${fmt(estimate.exim_levy + (estimate.au_levy || 0))}`, `GHS ${fmt((ghsConversion?.ghs_exim_levy ?? toGhs(estimate.exim_levy)) + (ghsConversion?.ghs_au_levy ?? toGhs(estimate.au_levy || 0)))}`],
    ["Examination / Processing Fee", "1%", `CIF $${fmt(estimate.cif_value)}`, `$ ${fmt(estimate.processing_fee)}`, `GHS ${fmt(ghsConversion?.ghs_processing_fee ?? toGhs(estimate.processing_fee))}`],
    [
      { content: "VAT Base", styles: { fontStyle: "bold" } },
      { content: "", styles: {} },
      { content: "CIF + All Levies", styles: { fontStyle: "bold" } },
      { content: `$ ${fmt(vatBase)}`, styles: { fontStyle: "bold" } },
      { content: `GHS ${fmt(toGhs(vatBase))}`, styles: { fontStyle: "bold", textColor: darkBlue } },
    ],
    ["VAT", "15%", `VAT Base $${fmt(vatBase)}`, `$ ${fmt(estimate.vat)}`, `GHS ${fmt(ghsConversion?.ghs_vat ?? toGhs(estimate.vat))}`],
    ["NHIL (National Health Insurance Levy)", "2.5%", `VAT Base $${fmt(vatBase)}`, `$ ${fmt(estimate.nhil)}`, `GHS ${fmt(ghsConversion?.ghs_nhil ?? toGhs(estimate.nhil))}`],
    ["GETFund Levy", "2.5%", `VAT Base $${fmt(vatBase)}`, `$ ${fmt(estimate.getfund)}`, `GHS ${fmt(ghsConversion?.ghs_getfund ?? toGhs(estimate.getfund))}`],
  ];

  const headCols = ["Charge", "Rate", "Base", curr, "GHS"];
  if (isGhs) {
    breakdownBody.forEach(row => row.splice(3, 1));
    headCols.splice(3, 1);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: darkBlue, textColor: white, fontStyle: "bold", fontSize: 7 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    head: [headCols],
    body: breakdownBody,
    columnStyles: isGhs
      ? { 0: { cellWidth: 55 }, 3: { halign: "right" } }
      : { 0: { cellWidth: 50 }, 3: { halign: "right" }, 4: { halign: "right" } },
    didParseCell: (data: any) => {
      // Color zero values green
      if (data.section === "body" && data.cell.text[0]?.includes("$ 0.00")) {
        data.cell.styles.textColor = green;
      }
      if (data.section === "body" && data.cell.text[0]?.includes("GHS 0.00")) {
        data.cell.styles.textColor = green;
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // Total duty box
  const totalDutiesGhs = ghsConversion?.ghs_total_duties ?? toGhs(estimate.total_duties);

  doc.setDrawColor(...darkBlue);
  doc.setLineWidth(0.6);
  doc.rect(margin, y, contentWidth, 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...darkBlue);
  doc.text("ESTIMATED TOTAL CUSTOMS DUTY PAYABLE", margin + 4, y + 6);

  if (!isGhs) {
    doc.setFontSize(11);
    doc.text(`≈ ${curr} ${fmt(estimate.total_duties)}`, pageWidth - margin - 4, y + 6, { align: "right" });
  }

  // GHS total
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  if (ghsConversion && !isGhs) {
    doc.text(`Exchange Rate: GHS ${fmt(exchangeRate)} / ${ghsConversion.from_currency} (${ghsConversion.rate_source === "live" ? "Live" : ghsConversion.rate_source === "manual" ? "Manual" : "Indicative"} Rate)`, margin + 4, y + 14);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 120, 0);
  doc.text(`≈ GHS ${fmt(totalDutiesGhs)}`, pageWidth - margin - 4, y + 14, { align: "right" });

  y += 24;

  // === SECTION 4: KEY FLAGS ===
  if (estimate.recommendations || estimate.notes) {
    if (y > 240) { doc.addPage(); y = 15; }
    sectionHeader("4. KEY FLAGS & NOTES");

    const flagRows: any[][] = [];
    if (estimate.recommendations) {
      flagRows.push([{ content: "COST-SAVING", styles: { fontStyle: "bold", textColor: green } }, estimate.recommendations]);
    }
    if (estimate.notes) {
      flagRows.push([{ content: "AI NOTES", styles: { fontStyle: "bold", textColor: darkBlue } }, estimate.notes]);
    }
    if (estimate.misclassification_warning) {
      flagRows.push([{ content: "CLASSIFICATION ALERT", styles: { fontStyle: "bold", textColor: red } }, estimate.misclassification_warning]);
    }

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3 },
      body: flagRows,
      columnStyles: { 0: { cellWidth: 35 } },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // === SECTION 5: VERIFICATION TOOLS ===
  if (y > 240) { doc.addPage(); y = 15; }
  sectionHeader(`${estimate.recommendations || estimate.notes ? "5" : "4"}. RECOMMENDED VERIFICATION TOOLS`);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2.5 },
    body: [
      [{ content: "ICUMS Official Calculator", styles: { fontStyle: "bold", textColor: darkBlue } }, "https://external.unipassghana.com", "Official GRA duty estimate"],
      [{ content: "AutoDutyChecker", styles: { fontStyle: "bold", textColor: darkBlue } }, "https://autodutychecker.com", "GRA-aligned duty estimates"],
      [{ content: "Kitannex.com", styles: { fontStyle: "bold", textColor: darkBlue } }, "https://kitannex.com", "ICUMS-flow calculator with live rates"],
      [{ content: "GRA Vehicle Importation", styles: { fontStyle: "bold", textColor: darkBlue } }, "https://gra.gov.gh/customs/vehicle-importation", "Official GRA vehicle import guide"],
    ],
    columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 55 } },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // === DISCLAIMER ===
  if (y > 260) { doc.addPage(); y = 15; }
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(120, 120, 120);
  const disclaimer = "DISCLAIMER: This document is a pre-arrival duty estimate prepared for client planning purposes only. All figures are based on publicly available GRA/ICUMS rates and indicative valuations. The final assessed duty is determined solely by the Ghana Revenue Authority (GRA) Customs Division through the ICUMS/Publican AI System. Shippers Link Agencies Co., Ltd assumes no liability for discrepancies between this estimate and the official GRA assessment. Clients are advised to obtain a formal CCVR from ICUMS before making any financial commitments.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(disclaimerLines, margin, y);
  y += disclaimerLines.length * 3 + 6;

  // === FOOTER ===
  if (y > 270) { doc.addPage(); y = 15; }
  doc.setFillColor(...darkBlue);
  doc.rect(0, doc.internal.pageSize.getHeight() - 18, pageWidth, 18, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...white);
  doc.text("Shippers Link Agencies Co., Ltd (SLAC) — Tema Port, Ghana", margin, doc.internal.pageSize.getHeight() - 10);
  doc.text("Customs Clearing & Freight Forwarding", margin, doc.internal.pageSize.getHeight() - 6);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gold);
  doc.text(`Generated: ${dateStr}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: "right" });
  doc.text(`Exchange Rate: GHS ${fmt(exchangeRate)}/${ghsConversion?.from_currency || curr}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 6, { align: "right" });

  // Save
  const filename = `SLAC_Duty_Estimate_${estimate.hs_code.replace(/\./g, "")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
