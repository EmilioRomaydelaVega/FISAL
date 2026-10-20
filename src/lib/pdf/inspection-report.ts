import { BRAND_NAME } from "@/constants/brand";
import { toSafeFileName } from "@/lib/text";
import type { CheckStatus, DamageSeverity, Inspection } from "@/types/domain";

import {
  A4,
  createA4Document,
  PDF_COLORS,
  setDraw,
  setFill,
  setText,
  type PdfDocument,
  type Rgb,
} from "./theme";

const MARGIN = 14;
const CONTENT_WIDTH = A4.width - MARGIN * 2;
const PAGE_TOP = 20;

const STATUS_STYLE: Record<CheckStatus, { color: Rgb; label: string }> = {
  ok: { color: PDF_COLORS.ok, label: "OK" },
  defecto: { color: PDF_COLORS.danger, label: "DEFECTO" },
  "n/a": { color: PDF_COLORS.neutral, label: "N/A" },
};

const SEVERITY_COLOR: Record<DamageSeverity, Rgb> = {
  grave: PDF_COLORS.danger,
  moderado: PDF_COLORS.warning,
  leve: PDF_COLORS.neutral,
};

/** Escribe sobre el documento llevando la posición vertical y los saltos de página. */
class ReportWriter {
  y = 14;

  constructor(readonly doc: PdfDocument) {}

  ensureSpace(limit: number): void {
    if (this.y > limit) {
      this.doc.addPage();
      this.y = PAGE_TOP;
    }
  }

  sectionTitle(title: string, fontSize = 11): void {
    const { doc } = this;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize);
    setText(doc, PDF_COLORS.text);
    doc.text(title, MARGIN, this.y);
    this.y += 5;
    setDraw(doc, PDF_COLORS.brand);
    doc.line(MARGIN, this.y, A4.width - MARGIN, this.y);
    this.y += 5;
  }

  pill(label: string, color: Rgb): void {
    const { doc } = this;
    setFill(doc, color);
    doc.roundedRect(MARGIN, this.y - 3.5, 22, 5, 1, 1, "F");
    setText(doc, PDF_COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.text(label, MARGIN + 11, this.y, { align: "center" });
  }
}

function drawHeader(writer: ReportWriter, inspection: Inspection): void {
  const { doc } = writer;
  setFill(doc, PDF_COLORS.headerBackground);
  doc.rect(0, 0, A4.width, 26, "F");
  setFill(doc, PDF_COLORS.brand);
  doc.rect(0, 26, A4.width, 1.5, "F");
  setText(doc, PDF_COLORS.brand);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(BRAND_NAME, MARGIN, 13);
  setText(doc, PDF_COLORS.white);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Informe de inspeccion de maquinaria Komatsu", MARGIN, 20);
  doc.setFontSize(9);
  doc.text(inspection.date, A4.width - MARGIN, 13, { align: "right" });
  doc.text(`ID: ${String(inspection.id)}`, A4.width - MARGIN, 20, { align: "right" });
  writer.y = 36;

  const isExit = inspection.type === "salida";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setText(doc, isExit ? PDF_COLORS.info : PDF_COLORS.warning);
  doc.text(isExit ? "INSPECCION DE SALIDA" : "INSPECCION DE ENTRADA", MARGIN, writer.y);
  writer.y += 8;
}

function drawMachine(writer: ReportWriter, inspection: Inspection): void {
  const { doc } = writer;
  const { machine } = inspection;
  setFill(doc, PDF_COLORS.rowStripe);
  doc.roundedRect(MARGIN, writer.y, CONTENT_WIDTH, 22, 2, 2, "F");
  setText(doc, PDF_COLORS.text);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(machine.name, MARGIN + 4, writer.y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setText(doc, PDF_COLORS.textMuted);
  doc.text(`${machine.serial}  -  ${machine.category}`, MARGIN + 4, writer.y + 14);
  doc.text(
    `Combustible: ${inspection.fuelLevel}    Horas/Km: ${inspection.km || "-"}`,
    MARGIN + 4,
    writer.y + 19,
  );
  writer.y += 28;
}

function drawDetails(writer: ReportWriter, inspection: Inspection): void {
  const { doc } = writer;
  writer.sectionTitle("Datos de la inspeccion");
  doc.setFontSize(10);
  setText(doc, PDF_COLORS.textSoft);
  const rows: [string, string][] = [
    ["Cliente", inspection.client],
    ["Operario", inspection.operator],
    ["Firma", inspection.signName],
  ];
  for (const [label, value] of rows) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, MARGIN, writer.y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "-", MARGIN + 28, writer.y);
    writer.y += 5.5;
  }
  writer.y += 3;
}

function drawChecklist(writer: ReportWriter, inspection: Inspection): void {
  const { doc } = writer;
  writer.sectionTitle("Checklist tecnico");
  doc.setFontSize(9);
  for (const [itemId, status] of Object.entries(inspection.checklist)) {
    writer.ensureSpace(270);
    const style = STATUS_STYLE[status];
    writer.pill(style.label, style.color);
    setText(doc, PDF_COLORS.text);
    doc.setFont("helvetica", "normal");
    doc.text(itemId, MARGIN + 26, writer.y);
    const note = inspection.checkNotes[itemId];
    if (note) {
      setText(doc, PDF_COLORS.textFaint);
      doc.text(`- ${note}`, MARGIN + 70, writer.y);
    }
    writer.y += 6;
  }
  writer.y += 3;
}

function drawDamages(writer: ReportWriter, inspection: Inspection): void {
  const { doc } = writer;
  if (inspection.damages.length === 0) return;
  writer.ensureSpace(250);
  writer.sectionTitle(`Desperfectos registrados (${inspection.damages.length})`);
  doc.setFontSize(9);
  for (const damage of inspection.damages) {
    writer.ensureSpace(275);
    writer.pill(damage.severity.toUpperCase(), SEVERITY_COLOR[damage.severity]);
    setText(doc, PDF_COLORS.text);
    doc.setFont("helvetica", "normal");
    doc.text(`${damage.zone} - ${damage.type}`, MARGIN + 26, writer.y);
    writer.y += 5;
    if (damage.desc) {
      setText(doc, PDF_COLORS.textFaint);
      const lines = doc.splitTextToSize(damage.desc, CONTENT_WIDTH - 26) as string[];
      doc.text(lines, MARGIN + 26, writer.y);
      writer.y += lines.length * 4.5;
    }
    writer.y += 2;
  }
}

function drawNotes(writer: ReportWriter, inspection: Inspection): void {
  const { doc } = writer;
  if (!inspection.notes) return;
  writer.ensureSpace(250);
  writer.y += 3;
  writer.sectionTitle("Notas generales");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setText(doc, PDF_COLORS.textSoft);
  const lines = doc.splitTextToSize(inspection.notes, CONTENT_WIDTH) as string[];
  doc.text(lines, MARGIN, writer.y);
  writer.y += lines.length * 5;
}

function drawPhotos(writer: ReportWriter, inspection: Inspection): void {
  const { doc } = writer;
  const photos = inspection.photos ?? [];
  if (photos.length === 0) return;

  doc.addPage();
  writer.y = PAGE_TOP;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setText(doc, PDF_COLORS.text);
  doc.text(`Fotografias (${photos.length})`, MARGIN, writer.y);
  writer.y += 4;
  setDraw(doc, PDF_COLORS.brand);
  doc.line(MARGIN, writer.y, A4.width - MARGIN, writer.y);
  writer.y += 6;

  const gap = 6;
  const columnWidth = (CONTENT_WIDTH - gap) / 2;
  const rowHeight = 60;
  let column = 0;
  for (const photo of photos) {
    if (writer.y + rowHeight > 285) {
      doc.addPage();
      writer.y = PAGE_TOP;
      column = 0;
    }
    const x = MARGIN + column * (columnWidth + gap);
    try {
      doc.addImage(photo.src, "JPEG", x, writer.y, columnWidth, rowHeight, undefined, "FAST");
    } catch {
      doc.setFontSize(8);
      setText(doc, PDF_COLORS.textHint);
      doc.text("(imagen no disponible)", x + 2, writer.y + 8);
    }
    column++;
    if (column >= 2) {
      column = 0;
      writer.y += rowHeight + gap;
    }
  }
}

function drawFooters(doc: PdfDocument, inspection: Inspection): void {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFontSize(8);
    setText(doc, PDF_COLORS.textHint);
    doc.text(`${BRAND_NAME} - Informe de inspeccion - ${inspection.machine.name}`, MARGIN, 292);
    doc.text(`Pagina ${page} / ${pages}`, A4.width - MARGIN, 292, { align: "right" });
  }
}

export function inspectionReportFileName(inspection: Inspection): string {
  const base = `${inspection.machine.name}-${inspection.type}-${String(inspection.id)}`;
  return `Inspeccion_${toSafeFileName(base, /[^a-z0-9-]/gi)}.pdf`;
}

/** Genera y descarga el informe PDF completo de una inspección. */
export async function downloadInspectionReport(inspection: Inspection): Promise<void> {
  const doc = await createA4Document();
  const writer = new ReportWriter(doc);
  drawHeader(writer, inspection);
  drawMachine(writer, inspection);
  drawDetails(writer, inspection);
  drawChecklist(writer, inspection);
  drawDamages(writer, inspection);
  drawNotes(writer, inspection);
  drawPhotos(writer, inspection);
  drawFooters(doc, inspection);
  doc.save(inspectionReportFileName(inspection));
}
