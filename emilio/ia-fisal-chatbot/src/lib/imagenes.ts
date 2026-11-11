import type { ImagenAdjunta } from "../types";

/** Claude trabaja mejor con imágenes de hasta 1568 px en el lado largo; más grandes solo gastan más. */
const LADO_MAXIMO = 1568;
const CALIDAD_JPEG = 0.85;
export const MAX_IMAGENES = 4;
export const TIPOS_ACEPTADOS = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

function cargarImagen(archivo: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`No se pudo leer la imagen ${archivo.name}`));
    };
    img.src = url;
  });
}

/** Reduce la foto en el navegador (las del móvil pesan mucho) y la deja en JPEG. */
export async function prepararImagen(archivo: File): Promise<ImagenAdjunta> {
  const img = await cargarImagen(archivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(img.naturalWidth, img.naturalHeight));
  const ancho = Math.round(img.naturalWidth * escala);
  const alto = Math.round(img.naturalHeight * escala);

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new Error("El navegador no permite procesar imágenes");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ancho, alto);
  ctx.drawImage(img, 0, 0, ancho, alto);

  return {
    id: crypto.randomUUID(),
    nombre: archivo.name || "foto.jpg",
    dataUrl: lienzo.toDataURL("image/jpeg", CALIDAD_JPEG),
    ancho,
    alto,
  };
}

export function esImagen(archivo: File): boolean {
  return archivo.type.startsWith("image/");
}
