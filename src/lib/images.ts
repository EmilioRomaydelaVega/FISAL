export interface CompressOptions {
  /** Lado mayor máximo en píxeles. */
  maxSize: number;
  /** Calidad JPEG entre 0 y 1. */
  quality: number;
}

/**
 * Reduce una imagen y la devuelve como data URL JPEG.
 * Se decodifica desde una object URL para no duplicar en memoria el original en base64.
 */
export function compressImage(file: Blob, { maxSize, quality }: CompressOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    const cleanUp = () => {
      URL.revokeObjectURL(url);
      image.src = "";
    };

    image.onload = () => {
      try {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("El navegador no permite procesar imágenes");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        canvas.width = 0;
        canvas.height = 0;
        resolve(dataUrl);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      } finally {
        cleanUp();
      }
    };
    image.onerror = () => {
      cleanUp();
      reject(new Error("No se pudo leer la imagen"));
    };
    image.src = url;
  });
}

/** Lee un archivo como data URL sin modificarlo. */
export function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error("No se pudo leer el archivo"));
    };
    reader.readAsDataURL(file);
  });
}
