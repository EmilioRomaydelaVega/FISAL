import { FileDown, FileSpreadsheet, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { downloadCsv, type ExportRow } from "@/lib/csv";
import { notify } from "@/lib/notify";
import { downloadListPdf } from "@/lib/pdf/list-report";

interface ExportButtonsProps {
  /** Título del informe PDF. */
  title: string;
  /** Nombre del archivo sin extensión. */
  fileName: string;
  csvRows: () => ExportRow[];
  /** Columnas del PDF si difieren de las del CSV. */
  pdfRows?: () => ExportRow[];
}

export function ExportButtons({ title, fileName, csvRows, pdfRows = csvRows }: ExportButtonsProps) {
  const [generating, setGenerating] = useState(false);

  const exportPdf = () => {
    setGenerating(true);
    downloadListPdf(title, pdfRows(), `${fileName}.pdf`)
      .catch((error: unknown) => {
        console.error(error);
        notify.error("Error al generar el PDF");
      })
      .finally(() => {
        setGenerating(false);
      });
  };

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          downloadCsv(csvRows(), `${fileName}.csv`);
        }}
      >
        <FileSpreadsheet aria-hidden="true" />
        CSV
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={exportPdf}
        disabled={generating}
        aria-busy={generating}
      >
        {generating ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <FileDown aria-hidden="true" />
        )}
        PDF
      </Button>
    </>
  );
}
