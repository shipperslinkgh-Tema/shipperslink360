import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { VinDecodedVehicle, DutyCalculation, fmt } from "./types";

export function generateVinDutyPdf(vehicle: VinDecodedVehicle, calc: DutyCalculation) {
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
  const refNo = `SLAC-DE-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 9000 + 1000)}`;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...DARK_BLUE);
  doc.text("SHIPPERS LINK AGENCIES CO., LTD", pw / 2, y + 5, { align: "center" });
  doc.setFontSize(9.5);
  doc.setTextColor(...MID_BLUE);
  doc.text("CUSTOMS DUTY ESTIMATE REPORT", pw / 2, y + 11, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Freight Forwarding & Customs Clearance Specialists | Tema Port, Ghana", pw / 2, y + 16, { align: "center" });
  y += 19;
  doc.setDrawColor(...DARK_BLUE);
  doc.setLineWidth(0.7);
  doc.line(mx, y, pw - mx, y);
  y += 3;

  // Ref Table
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
  y = (doc as any).lastAutoTable.finalY + 3;

  const sectionLabel = (text: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...DARK_BLUE);
    doc.text(text, mx, y);
    y += 3;
  };

  // Vehicle Details
  sectionLabel("VEHICLE DETAILS");
  autoTable(doc, {
    startY: y,
    margin: { left: mx, right: mx },
    theme: "plain",
    styles: { fontSize: 7, cellPadding: { top: 1.5, bottom: 1.5, left: 3, right: 3 } },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: cw * 0.15 },
      1: { cellWidth: cw * 0.35 },
      2: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: cw * 0.15 },
      3: { cellWidth: cw * 0.35 },
    },
    body: [
      ["Make", vehicle.make, "Model", vehicle.model],
      ["Year", String(vehicle.modelYear), "Engine", vehicle.displacementL !== "—" ? `${vehicle.displacementL}L` : "—"],
      ["Fuel", vehicle.fuelType, "Transmission", vehicle.transmissionStyle],
      ["Drive Type", vehicle.driveType, "Body Class", vehicle.bodyClass],
      ["VIN", vehicle.vin, "Vehicle Age", `${calc.vehicle_age} years${calc.is_over_10_years ? " (PENALTY)" : ""}`],
    ],
    alternateRowStyles: { fillColor: LIGHT_GRAY },
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // Valuation Basis
  sectionLabel("VALUATION BASIS");
  autoTable(doc, {
    startY: y,
    margin: { left: mx, right: mx },
    theme: "plain",
    styles: { fontSize: 7.5, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 } },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: LIGHT_BLUE, cellWidth: cw * 0.5 },
      1: { halign: "right", cellWidth: cw * 0.5 },
    },
    body: [
      ["CIF Value (USD)", `$ ${fmt(calc.cif_usd)}`],
      [
        { content: "Exchange Rate (GHS/USD)", styles: { fillColor: YELLOW_BG, fontStyle: "bold", textColor: [122, 92, 0] as [number, number, number] } },
        { content: `1 USD = ${fmt(calc.exchange_rate)} GHS`, styles: { fillColor: YELLOW_BG, fontStyle: "bold", textColor: [122, 92, 0] as [number, number, number], halign: "right" as const } },
      ],
      ["GHS Equivalent Value", `GHS ${fmt(calc.cif_ghs)}`],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // Duty Breakdown
  sectionLabel("ESTIMATED DUTY BREAKDOWN");
  autoTable(doc, {
    startY: y,
    margin: { left: mx, right: mx },
    head: [["#", "Charge Component", "Basis / Notes", "Amount (GHS)"]],
    body: [
      ["1", "Import Duty", "20% on CIF Value", `GHS ${fmt(calc.import_duty)}`],
      ["2", "Value Added Tax (VAT)", "15% VAT-inclusive formula", `GHS ${fmt(calc.vat)}`],
      ["3", "NHIL + GETFund Levy", "2.5% + 2.5% on CIF", `GHS ${fmt(calc.nhil_getfund)}`],
      ["4", "Other Statutory Charges", "ECOWAS Levy, EXIM, SRIC etc.", `GHS ${fmt(calc.statutory_charges)}`],
      ["5", "Age/Depreciation Penalty", calc.is_over_10_years ? `Vehicle ${calc.vehicle_age} yrs old` : "N/A", `GHS ${fmt(calc.age_penalty)}`],
    ],
    theme: "grid",
    headStyles: { fillColor: DARK_BLUE, textColor: WHITE, fontStyle: "bold", fontSize: 7.5, cellPadding: 2 },
    styles: { fontSize: 7, cellPadding: { top: 1.8, bottom: 1.8, left: 3, right: 3 } },
    columnStyles: { 0: { cellWidth: 8, halign: "center" }, 3: { halign: "right", fontStyle: "bold" } },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
  });
  y = (doc as any).lastAutoTable.finalY;

  // Total + Range rows
  autoTable(doc, {
    startY: y,
    margin: { left: mx, right: mx },
    theme: "grid",
    styles: { fontSize: 8, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 }, lineColor: DARK_BLUE, lineWidth: 0.4 },
    body: [
      [
        { content: "", styles: { cellWidth: 8 } },
        { content: "TOTAL ESTIMATED DUTY", colSpan: 2, styles: { fontStyle: "bold", fillColor: YELLOW_BG, textColor: [92, 61, 0] as [number, number, number] } },
        { content: `GHS ${fmt(calc.total_duty)}`, styles: { halign: "right" as const, fontStyle: "bold", fillColor: YELLOW_BG, textColor: [92, 61, 0] as [number, number, number] } },
      ],
      [
        { content: "", styles: { cellWidth: 8 } },
        { content: "ESTIMATED NEGOTIABLE RANGE", colSpan: 2, styles: { fontStyle: "bold", fillColor: GREEN_BG, textColor: [21, 87, 36] as [number, number, number] } },
        { content: `GHS ${fmt(calc.negotiable_min)} – ${fmt(calc.negotiable_max)}`, styles: { halign: "right" as const, fontStyle: "bold", fillColor: GREEN_BG, textColor: [21, 87, 36] as [number, number, number] } },
      ],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 3;

  // Notes
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(mx, y, pw - mx, y);
  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...DARK_BLUE);
  doc.text("IMPORTANT NOTES", mx, y);
  y += 3;

  const notes = [
    `1. Exchange rate used: 1 USD = ${fmt(calc.exchange_rate)} GHS. Final duty is determined by ICUMS/Publican AI at time of declaration.`,
    "2. GRA applies additional penalties for vehicles over 10 years old under the depreciation and age assessment policy.",
    "3. Negotiable range is estimated at 56.5%–75.8% of total duty based on historical settlement patterns.",
    "4. Percentage-based charges are computed on GHS CIF value; flat charges are scaled to CIF bracket.",
    "5. This estimate is for planning purposes only. SLAC is not liable for differences from GRA final assessment.",
    "6. As of March 2026, all customs declarations must be processed through the Publican AI System (ICUMS replacement).",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(80, 80, 80);
  notes.forEach((note) => {
    const lines = doc.splitTextToSize(note, cw);
    doc.text(lines, mx, y);
    y += lines.length * 3 + 1.5;
  });

  // Footer
  y = 280;
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
  doc.text("This document is confidential and intended for the named recipient only.", pw / 2, y, { align: "center" });

  doc.save(`SLAC_Duty_Estimate_${vehicle.make}_${vehicle.model}_${vehicle.modelYear}.pdf`);
}
