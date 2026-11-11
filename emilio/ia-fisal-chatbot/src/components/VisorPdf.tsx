import { ChevronLeft, ChevronRight, Download, ExternalLink, Loader2, Minus, Plus, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { buscar, manualPorId, trocearResaltado } from "../lib/busqueda";
import type { PaginaAbierta } from "../types";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

interface Props {
  abierta: PaginaAbierta;
  onCambiar: (p: PaginaAbierta) => void;
  onCerrar: () => void;
}

function escaparHtml(t: string) {
  return t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

/** Visor del manual: abre el PDF en la página de la fuente y resalta el texto buscado. */
export default function VisorPdf({ abierta, onCambiar, onCerrar }: Props) {
  const manual = manualPorId(abierta.manualId);
  const [totalPaginas, setTotalPaginas] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [ancho, setAncho] = useState(600);
  const [termino, setTermino] = useState(abierta.resaltar ?? "");
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => setTermino(abierta.resaltar ?? ""), [abierta.resaltar, abierta.manualId]);

  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      if (e) setAncho(Math.max(280, Math.floor(e.contentRect.width) - 32));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    contenedor.current?.scrollTo({ top: 0 });
  }, [abierta.pagina, abierta.manualId]);

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowRight") irA(abierta.pagina + 1);
      if (e.key === "ArrowLeft") irA(abierta.pagina - 1);
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  });

  const coincidencias = useMemo(
    () =>
      termino.trim()
        ? buscar(termino, undefined, 100)
            .filter((r) => r.manualId === abierta.manualId)
            .map((r) => r.pagina)
            .sort((a, b) => a - b)
        : [],
    [termino, abierta.manualId],
  );

  const renderizarTexto = useCallback(
    ({ str }: { str: string }) =>
      trocearResaltado(str, termino)
        .map((p) => (p.marca ? `<mark>${escaparHtml(p.texto)}</mark>` : escaparHtml(p.texto)))
        .join(""),
    [termino],
  );

  if (!manual) return null;

  function irA(pagina: number) {
    const max = totalPaginas ?? manual?.paginas ?? 1;
    if (pagina < 1 || pagina > max) return;
    onCambiar({ ...abierta, pagina, resaltar: termino });
  }

  const urlPagina = `${manual.url}#page=${abierta.pagina}`;

  return (
    <aside
      className="fixed inset-0 z-40 flex flex-col bg-surface lg:static lg:z-auto lg:w-[46%] lg:max-w-3xl lg:border-l lg:border-border"
      aria-label={`Manual: ${manual.titulo}`}
    >
      {/* Cabecera */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{manual.titulo}</p>
          <p className="text-xs text-ink-muted">{manual.maquina}</p>
        </div>
        <a
          href={urlPagina}
          target="_blank"
          rel="noreferrer"
          className="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted"
          aria-label="Abrir el PDF en otra pestaña"
          title="Abrir en otra pestaña"
        >
          <ExternalLink className="size-4.5" aria-hidden />
        </a>
        <a
          href={manual.url}
          download
          className="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted"
          aria-label="Descargar el PDF"
          title="Descargar"
        >
          <Download className="size-4.5" aria-hidden />
        </a>
        <button
          type="button"
          onClick={onCerrar}
          className="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted"
          aria-label="Cerrar el visor"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      {/* Buscar dentro del PDF */}
      <div className="border-b border-border bg-surface-muted/60 px-3 py-2">
        <label className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 focus-within:border-brand">
          <Search className="size-4 text-ink-subtle" aria-hidden />
          <input
            type="search"
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            placeholder="Buscar en este manual"
            className="h-9 flex-1 bg-transparent text-sm outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            aria-label="Buscar en este manual"
          />
        </label>
        {termino.trim() && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
            {coincidencias.length === 0 ? (
              <span>No aparece en este manual</span>
            ) : (
              <>
                <span>Aparece en:</span>
                {coincidencias.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onCambiar({ ...abierta, pagina: p, resaltar: termino })}
                    className={`rounded-full px-2 py-0.5 font-semibold ${
                      p === abierta.pagina ? "bg-brand text-white" : "bg-brand-soft text-brand hover:bg-brand/15"
                    }`}
                  >
                    pág. {p}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Página */}
      <div ref={contenedor} className="min-h-0 flex-1 overflow-auto bg-[#e6e9ee] p-4">
        <Document
          file={manual.url}
          onLoadSuccess={({ numPages }) => setTotalPaginas(numPages)}
          loading={<Cargando />}
          error={<p className="p-6 text-center text-sm text-danger">No se pudo abrir el PDF.</p>}
          className="flex justify-center"
        >
          <Page
            pageNumber={abierta.pagina}
            width={ancho * zoom}
            customTextRenderer={renderizarTexto}
            renderAnnotationLayer={false}
            loading={<Cargando />}
            className="overflow-hidden rounded-sm shadow-raised"
          />
        </Document>
      </div>

      {/* Navegación */}
      <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))}
            className="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted"
            aria-label="Alejar"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <span className="w-12 text-center text-xs font-medium text-ink-muted tabular-nums">{Math.round(zoom * 100)} %</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.2).toFixed(1)))}
            className="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted"
            aria-label="Acercar"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => irA(abierta.pagina - 1)}
            disabled={abierta.pagina <= 1}
            className="grid size-9 place-items-center rounded-lg text-ink hover:bg-surface-muted disabled:text-ink-subtle disabled:hover:bg-transparent"
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <span className="min-w-20 text-center text-sm font-medium text-ink tabular-nums">
            {abierta.pagina} / {totalPaginas ?? manual.paginas}
          </span>
          <button
            type="button"
            onClick={() => irA(abierta.pagina + 1)}
            disabled={abierta.pagina >= (totalPaginas ?? manual.paginas)}
            className="grid size-9 place-items-center rounded-lg text-ink hover:bg-surface-muted disabled:text-ink-subtle disabled:hover:bg-transparent"
            aria-label="Página siguiente"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  );
}

function Cargando() {
  return (
    <div className="grid h-64 place-items-center">
      <Loader2 className="size-6 animate-spin text-ink-subtle" aria-label="Cargando PDF" />
    </div>
  );
}
