import { Camera, X } from "lucide-react";
import { useRef, type ChangeEvent } from "react";

import { INSPECTION_PHOTO_OPTIONS } from "@/constants/inspection";
import { formatTime } from "@/lib/dates";
import { createId } from "@/lib/ids";
import { compressImage } from "@/lib/images";
import type { Photo } from "@/types/domain";

interface PhotoCaptureProps {
  photos: readonly Photo[];
  onAdd: (photo: Photo) => void;
  onRemove: (id: Photo["id"]) => void;
}

/** Captura de fotos con la cámara o la galería, comprimidas en el navegador. */
export function PhotoCapture({ photos, onAdd, onRemove }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    for (const file of files) {
      try {
        onAdd({
          id: createId.photo(),
          src: await compressImage(file, INSPECTION_PHOTO_OPTIONS),
          name: file.name,
          size: `${(file.size / 1024).toFixed(0)}KB`,
          ts: formatTime(),
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => void handleFiles(event)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border-strong bg-surface text-ink-muted transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-strong"
      >
        <Camera className="size-7" aria-hidden="true" />
        <span className="text-xs font-semibold tracking-wide uppercase">Añadir foto</span>
      </button>
      {photos.map((photo) => (
        <figure
          key={photo.id}
          className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-muted"
        >
          <img src={photo.src} alt={photo.name} className="size-full object-cover" />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pt-6 pb-1.5 text-xs text-white">
            {photo.ts}
          </figcaption>
          <button
            type="button"
            aria-label={`Quitar foto ${photo.name}`}
            onClick={() => {
              onRemove(photo.id);
            }}
            className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-white/90 text-danger shadow-card hover:bg-white"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </figure>
      ))}
    </div>
  );
}
