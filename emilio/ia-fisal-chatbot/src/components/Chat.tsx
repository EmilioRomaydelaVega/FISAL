import { BookOpenText, Camera, ImageIcon, ShieldAlert, Sparkles } from "lucide-react";
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

const SUGERENCIAS = [
  "¿Qué filtros se cambian en la revisión de 500 horas?",
  "Código de error E-203",
  "Presión de trabajo del sistema hidráulico",
  "¿Cuánto tarda la carga rápida de la CE-5?",
];

export function Chat({ mensajes, ocupado, visor, onEnviar, onAbrir }: Props) {
  const final = useRef<HTMLDivElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [soltados, setSoltados] = useState<File[]>([]);
  const [ampliada, setAmpliada] = useState<ImagenAdjunta | null>(null);

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
          {mensajes.length === 0 && <Bienvenida onElegir={(t) => onEnviar(t, [])} />}

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

      <Composer
        ocupado={ocupado}
        onEnviar={onEnviar}
        archivosExternos={soltados}
        onArchivosExternosLeidos={() => setSoltados([])}
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

function Bienvenida({ onElegir }: { onElegir: (t: string) => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-6 text-center sm:py-12">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand text-white shadow-raised">
        <Sparkles className="size-7" aria-hidden />
      </span>
      <h2 className="mt-4 text-xl font-bold text-ink sm:text-2xl">¿En qué te ayudo con la máquina?</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Te doy una respuesta corta y debajo el manual y la página donde está, para que lo compruebes.
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
        <Camera className="size-4" aria-hidden /> También puedes mandar una foto de la pieza o de la pantalla de error.
      </p>
      <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
        {SUGERENCIAS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onElegir(s)}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm font-medium text-ink-soft shadow-card transition hover:border-brand hover:text-brand"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
