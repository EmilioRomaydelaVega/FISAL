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

export async function createA4Document() {
  const { jsPDF } = await import("jspdf");
  return new jsPDF({ unit: "mm", format: "a4" });
}

export type PdfDocument = Awaited<ReturnType<typeof createA4Document>>;

export function setFill(doc: PdfDocument, [r, g, b]: Rgb): void {
  doc.setFillColor(r, g, b);
}

export function setText(doc: PdfDocument, [r, g, b]: Rgb): void {
  doc.setTextColor(r, g, b);
}

export function setDraw(doc: PdfDocument, [r, g, b]: Rgb): void {
  doc.setDrawColor(r, g, b);
}
