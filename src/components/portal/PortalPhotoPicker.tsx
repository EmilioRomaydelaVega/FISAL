import { Camera, X } from "lucide-react";
import { useId, type ChangeEvent } from "react";

import {
  PORTAL_MAX_PHOTOS,
  PORTAL_PHOTO_OPTIONS,
  PORTAL_PHOTOS_PER_PICK,
} from "@/constants/portal";
import { compressImage, readAsDataUrl } from "@/lib/images";

interface PortalPhotoPickerProps {
  photos: readonly string[];
  onChange: (update: (photos: string[]) => string[]) => void;
}

async function preparePhoto(file: File): Promise<string> {
  try {
    return await compressImage(file, PORTAL_PHOTO_OPTIONS);
  } catch {
    // Si el navegador no puede procesarla, se envía tal cual.
    return readAsDataUrl(file);
  }
}

export function PortalPhotoPicker({ photos, onChange }: PortalPhotoPickerProps) {
  const inputId = useId();

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, PORTAL_PHOTOS_PER_PICK);
    event.target.value = "";
    const prepared: string[] = [];
    for (const file of files) prepared.push(await preparePhoto(file));
    onChange((current) => [...current, ...prepared].slice(0, PORTAL_MAX_PHOTOS));
  };

  return (
    <div>
      <label
        htmlFor={inputId}
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-dashed border-brand bg-brand-soft px-4 text-sm font-semibold text-brand-strong transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus hover:bg-brand/20"
      >
        <Camera className="size-4" aria-hidden="true" />
        Añadir fotos
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          className="sr-only"
          onChange={(event) => void handleFiles(event)}
        />
      </label>
      {photos.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <li key={`${index}-${photo.slice(-16)}`} className="relative">
              <img
                src={photo}
                alt={`Foto ${index + 1}`}
                className="h-20 w-full rounded-md border border-border object-cover"
              />
              <button
                type="button"
                aria-label={`Quitar foto ${index + 1}`}
                onClick={() => {
                  onChange((current) => current.filter((_, position) => position !== index));
                }}
                className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-white/90 text-danger shadow-card"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
