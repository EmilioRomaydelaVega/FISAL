import { ExternalLink, FileText } from "lucide-react";
import { manualPorId } from "../lib/busqueda";
import type { Fuente, PaginaAbierta } from "../types";
import { Resaltado } from "./Resaltado";

interface Props {
  fuente: Fuente;
  consulta: string;
  activa: boolean;
  onAbrir: (p: PaginaAbierta) => void;
}

/** Tarjeta de "dónde está": manual, página y el trozo de texto. Al pulsarla se abre el PDF en esa página. */
export function FuenteCard({ fuente, consulta, activa, onAbrir }: Props) {
  const manual = manualPorId(fuente.manualId);
  if (!manual) return null;
  const abrir = () => onAbrir({ manualId: fuente.manualId, pagina: fuente.pagina, resaltar: consulta });

  return (
    <div
      className={`group min-w-0 rounded-lg border bg-surface transition ${
        activa ? "border-brand ring-2 ring-brand/15" : "border-border hover:border-border-strong"
      }`}
    >
      <button
        type="button"
        onClick={abrir}
        className="flex w-full items-start gap-3 rounded-lg p-3 text-left"
        aria-label={`Ver ${manual.titulo}, página ${fuente.pagina}`}
      >
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-danger/10 text-danger">
          <FileText className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{manual.titulo}</span>
          <span className="mt-0.5 block text-xs font-medium text-brand">
            Página {fuente.pagina}
            {fuente.seccion ? ` · ${fuente.seccion}` : ""}
          </span>
          <span className="mt-1.5 line-clamp-3 block text-sm leading-relaxed text-ink-soft">
            <Resaltado texto={fuente.extracto} consulta={consulta} />
          </span>
        </span>
      </button>
      <div className="flex items-center justify-end gap-1 border-t border-border px-2 py-1.5">
        <button
          type="button"
          onClick={abrir}
          className="rounded-md px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand-soft"
        >
          Ver página
        </button>
        <a
          href={`${manual.url}#page=${fuente.pagina}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-ink-muted hover:bg-surface-muted"
        >
          Abrir PDF <ExternalLink className="size-3" aria-hidden />
        </a>
      </div>
    </div>
  );
}
