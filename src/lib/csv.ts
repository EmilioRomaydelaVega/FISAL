import { downloadFile } from "./download";

export type ExportRow = Record<string, string | number | null | undefined>;

const SEPARATOR = ";";
const UTF8_BOM = "﻿";

function escapeCell(value: ExportRow[string]): string {
  if (value == null) return "";
  const text = String(value).replace(/\r?\n/g, " ");
  return /[",;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** CSV con separador `;` (formato que abre Excel en español). */
export function toCsv(rows: readonly ExportRow[]): string {
  const [first] = rows;
  if (!first) return "";
  const headers = Object.keys(first);
  const lines = rows.map((row) => headers.map((header) => escapeCell(row[header])).join(SEPARATOR));
  return [headers.join(SEPARATOR), ...lines].join("\n");
}

export function downloadCsv(rows: readonly ExportRow[], fileName: string): void {
  downloadFile(UTF8_BOM + toCsv(rows), fileName, "text/csv;charset=utf-8;");
}
