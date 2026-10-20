import { BRAND_NAME } from "@/constants/brand";
import type { ExportRow } from "@/lib/csv";
import { formatDateTime } from "@/lib/dates";

import { A4, createA4Document, PDF_COLORS, setFill, setText } from "./theme";

const MARGIN = 12;
const ROW_HEIGHT = 5;

/** Listado tabular en A4 con cabecera de marca y filas alternas. */
export async function downloadListPdf(
  title: string,
  rows: readonly ExportRow[],
  fileName: string,
): Promise<void> {
  const doc = await createA4Document();
  const contentWidth = A4.width - MARGIN * 2;

  setFill(doc, PDF_COLORS.headerBackground);
  doc.rect(0, 0, A4.width, 22, "F");
  setFill(doc, PDF_COLORS.brand);
  doc.rect(0, 22, A4.width, 1.2, "F");
  setText(doc, PDF_COLORS.brand);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(BRAND_NAME, MARGIN, 12);
  setText(doc, PDF_COLORS.white);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(title, MARGIN, 18);
  doc.setFontSize(9);
  doc.text(formatDateTime(), A4.width - MARGIN, 12, { align: "right" });
  doc.text(`Total: ${rows.length}`, A4.width - MARGIN, 18, { align: "right" });

  let y = 30;
  setText(doc, PDF_COLORS.text);
  doc.setFontSize(9);

  const [first] = rows;
  if (!first) {
    doc.text("Sin datos.", MARGIN, y);
    doc.save(fileName);
    return;
  }

  const headers = Object.keys(first);
  const columnWidth = contentWidth / headers.length;

  doc.setFont("helvetica", "bold");
  setFill(doc, PDF_COLORS.tableHeader);
  doc.rect(MARGIN, y - 4, contentWidth, 6, "F");
  headers.forEach((header, index) => doc.text(header, MARGIN + index * columnWidth + 1, y));
  y += ROW_HEIGHT;

  doc.setFont("helvetica", "normal");
  rows.forEach((row, rowIndex) => {
    if (y > A4.height - 15) {
      doc.addPage();
      y = 20;
    }
    if (rowIndex % 2 === 0) {
      setFill(doc, PDF_COLORS.rowStripe);
      doc.rect(MARGIN, y - 4, contentWidth, 6, "F");
    }
    headers.forEach((header, index) => {
      const value = row[header];
      const raw = value == null ? "" : String(value).replace(/\r?\n/g, " ");
      const [firstLine = ""] = doc.splitTextToSize(raw, columnWidth - 2) as string[];
      doc.text(firstLine, MARGIN + index * columnWidth + 1, y);
    });
    y += ROW_HEIGHT;
  });

  doc.save(fileName);
}
