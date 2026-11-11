import { FileText, Search, X } from "lucide-react";
import { useDeferredValue, useMemo } from "react";
import { buscar, MANUALES, manualPorId } from "../lib/busqueda";
import type { PaginaAbierta } from "../types";
import { Resaltado } from "./Resaltado";

interface Props {
  consulta: string;
  onConsulta: (q: string) => void;
  maquina: string;
  visor: PaginaAbierta | null;
  onAbrir: (p: PaginaAbierta) => void;
}

/** Buscador de texto en todos los manuales: escribe y salen las páginas donde aparece. */
export function Buscador({ consulta, onConsulta, maquina, visor, onAbrir }: Props) {
  const diferida = useDeferredValue(consulta);
  const resultados = useMemo(() => buscar(diferida, maquina || undefined, 50), [diferida, maquina]);
  const manuales = MANUALES.filter((m) => !maquina || m.maquina === maquina);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border bg-surface px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-3xl">
          <label className="flex items-center gap-2 rounded-xl border border-border-strong bg-surface px-3 shadow-card focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
            <Search className="size-5 shrink-0 text-ink-subtle" aria-hidden />
            <input
              type="search"
              value={consulta}
              onChange={(e) => onConsulta(e.target.value)}
              placeholder="Busca en los manuales: filtro, E-203, presión, engrase..."
              className="h-11 flex-1 bg-transparent text-[15px] focus-visible:outline-none text-ink outline-none placeholder:text-ink-subtle [&::-webkit-search-cancel-button]:hidden"
              aria-label="Buscar texto en los manuales"
              autoFocus
            />
            {consulta && (
              <button
                type="button"
                onClick={() => onConsulta("")}
                className="grid size-7 place-items-center rounded-md text-ink-subtle hover:bg-surface-muted"
                aria-label="Borrar búsqueda"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </label>
          {diferida.trim() && (
            <p className="mt-2 text-xs text-ink-muted" aria-live="polite">
              {resultados.length === 0
                ? "Sin resultados"
                : `${resultados.length} ${resultados.length === 1 ? "página encontrada" : "páginas encontradas"}`}
              {maquina ? ` en ${maquina}` : " en todos los manuales"}
            </p>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-3 py-4 sm:px-4">
          {!diferida.trim() ? (
            <>
              <h2 className="mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
                Manuales cargados ({manuales.length})
              </h2>
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
                {manuales.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => onAbrir({ manualId: m.id, pagina: 1 })}
                      className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left shadow-card transition hover:border-gold"
                    >
                      <span className="grid size-9 place-items-center rounded-md bg-danger/10 text-danger">
                        <FileText className="size-5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{m.titulo}</span>
                        <span className="block text-xs text-ink-muted">
                          {m.maquina} · {m.paginas} páginas
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : resultados.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-muted">
              No aparece en los manuales. Prueba con otra palabra o con la referencia exacta.
            </p>
          ) : (
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
              {resultados.map((r) => {
                const manual = manualPorId(r.manualId);
                const activa = visor?.manualId === r.manualId && visor.pagina === r.pagina;
                return (
                  <li key={`${r.manualId}-${r.pagina}`}>
                    <button
                      type="button"
                      onClick={() => onAbrir({ manualId: r.manualId, pagina: r.pagina, resaltar: diferida })}
                      className={`w-full rounded-lg border bg-surface p-3 text-left shadow-card transition ${
                        activa ? "border-gold ring-2 ring-gold/25" : "border-border hover:border-border-strong"
                      }`}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-ink">{manual?.titulo}</span>
                        <span className="shrink-0 rounded-full bg-gold-soft px-2 py-0.5 text-xs font-semibold text-gold-ink">
                          pág. {r.pagina}
                        </span>
                      </span>
                      {r.seccion && <span className="mt-0.5 block text-xs text-ink-muted">{r.seccion}</span>}
                      <span className="mt-1.5 block text-sm leading-relaxed text-ink-soft">
                        <Resaltado texto={r.extracto} consulta={diferida} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
