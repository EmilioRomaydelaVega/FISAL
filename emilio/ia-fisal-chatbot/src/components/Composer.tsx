import { Camera, ImagePlus, Loader2, SendHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { esImagen, MAX_IMAGENES, prepararImagen } from "../lib/imagenes";
import type { ImagenAdjunta } from "../types";

interface Props {
  ocupado: boolean;
  onEnviar: (texto: string, imagenes: ImagenAdjunta[]) => void;
  /** Archivos soltados sobre el chat (arrastrar y soltar), los recibe el padre. */
  archivosExternos: File[];
  onArchivosExternosLeidos: () => void;
}

export function Composer({ ocupado, onEnviar, archivosExternos, onArchivosExternosLeidos }: Props) {
  const [texto, setTexto] = useState("");
  const [imagenes, setImagenes] = useState<ImagenAdjunta[]>([]);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputGaleria = useRef<HTMLInputElement>(null);
  const inputCamara = useRef<HTMLInputElement>(null);
  const areaTexto = useRef<HTMLTextAreaElement>(null);

  async function anadir(archivos: File[]) {
    const fotos = archivos.filter(esImagen);
    if (fotos.length === 0) return;
    const hueco = MAX_IMAGENES - imagenes.length;
    if (hueco <= 0) {
      setError(`Máximo ${MAX_IMAGENES} fotos por mensaje.`);
      return;
    }
    setError(fotos.length > hueco ? `Solo se han añadido ${hueco}: máximo ${MAX_IMAGENES} fotos por mensaje.` : null);
    setProcesando(true);
    try {
      const listas = await Promise.all(fotos.slice(0, hueco).map(prepararImagen));
      setImagenes((prev) => [...prev, ...listas]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer la imagen.");
    } finally {
      setProcesando(false);
    }
  }

  // Fotos arrastradas sobre la zona del chat
  useEffect(() => {
    if (archivosExternos.length === 0) return;
    const pendientes = archivosExternos;
    onArchivosExternosLeidos();
    void anadir(pendientes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archivosExternos]);

  function enviar() {
    if (ocupado || procesando) return;
    if (!texto.trim() && imagenes.length === 0) return;
    onEnviar(texto.trim(), imagenes);
    setTexto("");
    setImagenes([]);
    setError(null);
    requestAnimationFrame(() => ajustarAltura());
  }

  function alPulsarTecla(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      enviar();
    }
  }

  function alPegar(e: ClipboardEvent<HTMLTextAreaElement>) {
    const archivos = Array.from(e.clipboardData.files).filter(esImagen);
    if (archivos.length > 0) {
      e.preventDefault();
      void anadir(archivos);
    }
  }

  function ajustarAltura() {
    const el = areaTexto.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }

  const puedeEnviar = !ocupado && !procesando && (texto.trim() !== "" || imagenes.length > 0);

  return (
    <div className="border-t border-border bg-surface/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-4">
      <div className="mx-auto max-w-3xl">
        {(imagenes.length > 0 || procesando) && (
          <div className="mb-2 flex flex-wrap gap-2">
            {imagenes.map((img) => (
              <div key={img.id} className="relative">
                <img
                  src={img.dataUrl}
                  alt={img.nombre}
                  className="size-16 rounded-lg border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImagenes((prev) => prev.filter((i) => i.id !== img.id))}
                  className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-ink text-white shadow"
                  aria-label={`Quitar ${img.nombre}`}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </div>
            ))}
            {procesando && (
              <div className="grid size-16 place-items-center rounded-lg border border-dashed border-border-strong">
                <Loader2 className="size-5 animate-spin text-ink-subtle" aria-label="Preparando foto" />
              </div>
            )}
          </div>
        )}

        {error && <p className="mb-2 text-xs font-medium text-danger">{error}</p>}

        <div className="flex items-end gap-2 rounded-xl border border-border-strong bg-surface p-1.5 shadow-card focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
          {/* Cámara: el botón principal para el taller, siempre a la vista */}
          <button
            type="button"
            onClick={() => inputCamara.current?.click()}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-gold-soft px-3 text-sm font-semibold text-gold-ink ring-1 ring-gold/40 hover:bg-gold/25"
            aria-label="Hacer foto con la cámara"
            title="Hacer foto"
          >
            <Camera className="size-5" aria-hidden />
            <span>Foto</span>
          </button>
          <button
            type="button"
            onClick={() => inputGaleria.current?.click()}
            className="grid size-10 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink"
            aria-label="Elegir foto de la galería"
            title="Elegir foto de la galería (también puedes pegarla o arrastrarla)"
          >
            <ImagePlus className="size-5" aria-hidden />
          </button>

          <textarea
            ref={areaTexto}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              ajustarAltura();
            }}
            onKeyDown={alPulsarTecla}
            onPaste={alPegar}
            rows={1}
            placeholder="Escribe tu pregunta..."
            className="max-h-44 min-h-10 flex-1 resize-none bg-transparent px-1 py-2 focus-visible:outline-none text-[15px] leading-6 text-ink outline-none placeholder:text-ink-subtle"
            aria-label="Escribe tu pregunta"
          />

          <button
            type="button"
            onClick={enviar}
            disabled={!puedeEnviar}
            className="grid size-10 shrink-0 place-items-center rounded-lg bg-gold text-ink transition hover:bg-gold-hover disabled:bg-border disabled:text-ink-subtle"
            aria-label="Enviar"
          >
            {ocupado ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <SendHorizontal className="size-5" aria-hidden />}
          </button>
        </div>

        <p className="mt-1.5 hidden text-center text-[11px] text-ink-subtle sm:block">
          Intro para enviar · Mayús + Intro para salto de línea · Pega o arrastra fotos
        </p>

        <input
          ref={inputGaleria}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            void anadir(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <input
          ref={inputCamara}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            void anadir(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
