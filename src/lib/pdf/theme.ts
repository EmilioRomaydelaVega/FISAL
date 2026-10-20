import type * as JsPdf from "jspdf";

import { deliverFile } from "@/lib/download";

/** Paleta RGB de los informes PDF. */
export type Rgb = readonly [number, number, number];

export const PDF_COLORS = {
  headerBackground: [8, 12, 18],
  brand: [245, 184, 0],
  white: [255, 255, 255],
  text: [30, 30, 30],
  textSoft: [60, 60, 60],
  textMuted: [80, 80, 80],
  textFaint: [120, 120, 120],
  textHint: [160, 160, 160],
  tableHeader: [230, 230, 230],
  rowStripe: [248, 248, 248],
  ok: [16, 185, 129],
  danger: [239, 68, 68],
  warning: [245, 158, 11],
  info: [59, 130, 246],
  neutral: [120, 120, 120],
} as const satisfies Record<string, Rgb>;

export const A4 = { width: 210, height: 297 } as const;

let pdfLibrary: Promise<typeof JsPdf> | undefined;

/**
 * Carga jsPDF una sola vez. Llamarlo por adelantado hace que la generación sea
 * inmediata y la descarga no pierda el gesto del usuario en móviles.
 */
export function preloadPdfLibrary(): Promise<typeof JsPdf> {
  pdfLibrary ??= import("jspdf");
  return pdfLibrary;
}

export async function createA4Document() {
  const { jsPDF } = await preloadPdfLibrary();
  return new jsPDF({ unit: "mm", format: "a4" });
}

export type PdfDocument = Awaited<ReturnType<typeof createA4Document>>;

/** Entrega el PDF: descarga automática y, como respaldo, botón "Abrir PDF" en el aviso. */
export function savePdf(doc: PdfDocument, fileName: string): void {
  deliverFile(doc.output("blob"), fileName, "Abrir PDF");
}

export function setFill(doc: PdfDocument, [r, g, b]: Rgb): void {
  doc.setFillColor(r, g, b);
}

export function setText(doc: PdfDocument, [r, g, b]: Rgb): void {
  doc.setTextColor(r, g, b);
}

export function setDraw(doc: PdfDocument, [r, g, b]: Rgb): void {
  doc.setDrawColor(r, g, b);
}
