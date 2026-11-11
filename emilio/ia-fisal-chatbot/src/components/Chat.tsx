import {
  BatteryCharging,
  BookOpenText,
  Camera,
  Filter,
  Gauge,
  ImageIcon,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type DragEvent } from "react";
import type { ImagenAdjunta, Mensaje, MensajeUsuario, PaginaAbierta } from "../types";
import { Composer } from "./Composer";
import { FuenteCard } from "./FuenteCard";

interface Props {
  mensajes: Mensaje[];
  ocupado: boolean;
  visor: PaginaAbierta | null;
  onEnviar: (texto: string, imagenes: ImagenAdjunta[]) => void;
  onAbrir: (p: PaginaAbierta) => void;
}

/** Las 4 preguntas más frecuentes. Con los manuales reales se cambian por las que más haga el taller. */
const FRECUENTES: { pregunta: string; corto: string; icono: LucideIcon }[] = [
  { pregunta: "¿Qué filtros se cambian en la revisión de 500 horas?", corto: "Filtros", icono: Filter },
  { pregunta: "Código de error E-203", corto: "Errores", icono: TriangleAlert },
  { pregunta: "Presión de trabajo del sistema hidráulico", corto: "Presión", icono: Gauge },
  { pregunta: "¿Cuánto tarda la carga rápida de la CE-5?", corto: "Batería", icono: BatteryCharging },
];

export function Chat({ mensajes, ocupado, visor, onEnviar, onAbrir }: Props) {
  const final = useRef<HTMLDivElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [soltados, setSoltados] = useState<File[]>([]);
  const [ampliada, setAmpliada] = useState<ImagenAdjunta | null>(null);
  const inputCamara = useRef<HTMLInputElement>(null);

  useEffect(() => {
    final.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes.length, ocupado]);

  function alSoltar(e: DragEvent) {
    e.preventDefault();
    setArrastrando(false);
    setSoltados(Array.from(e.dataTransfer.files));
  }

  // Pregunta del usuario que dio lugar a cada respuesta, para resaltar sus palabras en las fuentes
  const preguntaDe = (indice: number) => {
    for (let i = indice - 1; i >= 0; i--) {
      const m = mensajes[i];
      if (m?.rol === "usuario") return (m as MensajeUsuario).texto;
    }
    return "";
  };

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setArrastrando(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setArrastrando(false);
      }}
      onDrop={alSoltar}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-5 px-3 py-5 sm:px-4">
          {mensajes.length === 0 && (
            <Bienvenida onElegir={(t) => onEnviar(t, [])} onCamara={() => inputCamara.current?.click()} />
          )}

          {mensajes.map((m, i) =>
            m.rol === "usuario" ? (
              <div key={m.id} className="aparecer flex flex-col items-end gap-1.5">
                {m.imagenes.length > 0 && (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {m.imagenes.map((img) => (
                      <button key={img.id} type="button" onClick={() => setAmpliada(img)} aria-label="Ampliar foto">
                        <img
                          src={img.dataUrl}
                          alt={img.nombre}
                          className="max-h-40 max-w-[11rem] rounded-xl border border-border object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
                {m.texto && (
                  <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-white">
                    {m.texto}
                  </p>
                )}
              </div>
            ) : (
              <article key={m.id} className="aparecer flex gap-3">
                <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                  <Sparkles className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3 shadow-card">
                    <p className="text-[15px] leading-relaxed font-medium text-ink">{m.respuesta}</p>
                    {m.detalle.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-soft">
                        {m.detalle.map((d, k) => (
                          <li key={k}>{d}</li>
                        ))}
                      </ul>
                    )}
                    {m.aviso && (
                      <p className="mt-3 flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning-ink">
                        <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                        {m.aviso}
                      </p>
                    )}
                  </div>

                  {m.fuentes.length > 0 && (
                    <section aria-label="Dónde está en los manuales">
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
                        <BookOpenText className="size-3.5" aria-hidden /> Dónde está en los manuales
                      </h3>
                      <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
                        {m.fuentes.map((f) => (
                          <FuenteCard
                            key={`${f.manualId}-${f.pagina}`}
                            fuente={f}
                            consulta={preguntaDe(i)}
                            activa={visor?.manualId === f.manualId && visor.pagina === f.pagina}
                            onAbrir={onAbrir}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </article>
            ),
          )}

          {ocupado && (
            <div className="flex items-center gap-3" aria-live="polite">
              <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-brand">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <span className="flex gap-1 rounded-2xl border border-border bg-surface px-4 py-3">
                <span className="punto size-2 rounded-full bg-ink-subtle" />
                <span className="punto size-2 rounded-full bg-ink-subtle [animation-delay:150ms]" />
                <span className="punto size-2 rounded-full bg-ink-subtle [animation-delay:300ms]" />
                <span className="sr-only">Buscando en los manuales</span>
              </span>
            </div>
          )}
          <div ref={final} />
        </div>
      </div>

      {mensajes.length > 0 && (
        <div className="border-t border-border bg-surface px-3 pt-2.5 sm:px-4">
          <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2">
            {FRECUENTES.map(({ pregunta, corto, icono: Icono }) => (
              <button
                key={pregunta}
                type="button"
                disabled={ocupado}
                onClick={() => onEnviar(pregunta, [])}
                title={pregunta}
                className="flex min-w-0 flex-col items-center gap-1 rounded-lg border border-border bg-surface px-1 py-1.5 text-[11px] leading-tight font-medium text-ink-soft transition hover:border-brand hover:text-brand disabled:opacity-50 sm:flex-row sm:justify-center sm:gap-1.5 sm:text-xs"
              >
                <Icono className="size-5 shrink-0 text-brand sm:size-4" aria-hidden />
                <span className="max-w-full truncate">{corto}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Composer
        ocupado={ocupado}
        onEnviar={onEnviar}
        archivosExternos={soltados}
        onArchivosExternosLeidos={() => setSoltados([])}
      />

      <input
        ref={inputCamara}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          setSoltados(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {arrastrando && (
        <div className="pointer-events-none absolute inset-2 z-20 grid place-items-center rounded-2xl border-2 border-dashed border-brand bg-brand-soft/90">
          <p className="flex items-center gap-2 text-base font-semibold text-brand">
            <ImageIcon className="size-5" aria-hidden /> Suelta la foto para adjuntarla
          </p>
        </div>
      )}

      {ampliada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4"
          onClick={() => setAmpliada(null)}
        >
          <img src={ampliada.dataUrl} alt={ampliada.nombre} className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}

function Bienvenida({ onElegir, onCamara }: { onElegir: (t: string) => void; onCamara: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center py-4 text-center sm:py-10">
      <span className="hidden size-14 place-items-center rounded-2xl bg-brand text-white shadow-raised sm:grid">
        <Sparkles className="size-7" aria-hidden />
      </span>
      <h2 className="text-xl font-bold text-ink sm:mt-4 sm:text-2xl">¿En qué te ayudo con la máquina?</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Te doy una respuesta corta y debajo el manual y la página donde está, para que lo compruebes.
      </p>

      <button
        type="button"
        onClick={onCamara}
        className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-brand px-5 py-4 text-base font-semibold text-white shadow-raised transition hover:bg-brand-hover"
      >
        <Camera className="size-6" aria-hidden />
        Hacer foto a la pieza o al error
      </button>

      <h3 className="mt-7 mb-3 self-start text-xs font-semibold tracking-wide text-ink-muted uppercase">
        Preguntas frecuentes
      </h3>
      <div className="grid w-full grid-cols-2 gap-2.5">
        {FRECUENTES.map(({ pregunta, corto, icono: Icono }) => (
          <button
            key={pregunta}
            type="button"
            onClick={() => onElegir(pregunta)}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-3 py-4 text-center shadow-card transition hover:border-brand"
          >
            <span className="grid size-12 place-items-center rounded-xl bg-brand-soft text-brand">
              <Icono className="size-6" aria-hidden />
            </span>
            <span className="text-sm font-semibold text-ink">{corto}</span>
            <span className="text-xs leading-snug text-ink-muted">{pregunta}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
