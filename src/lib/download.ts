import { notify } from "./notify";

/** Margen antes de liberar la URL temporal; revocarla en el acto cancela la descarga en Safari y Firefox. */
const DOWNLOAD_URL_TTL_MS = 1000;
/** Tiempo durante el que se puede abrir el archivo desde el aviso. */
const OPEN_URL_TTL_MS = 2 * 60 * 1000;

/** Descarga un contenido generado en el navegador como archivo. */
export function downloadFile(content: BlobPart, fileName: string, mimeType: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, DOWNLOAD_URL_TTL_MS);
}

/**
 * Descarga un archivo generado tras una espera (carga de datos o de librerías).
 * Algunos navegadores, sobre todo Safari en iPhone, bloquean en ese caso la
 * descarga automática; el aviso ofrece un botón para abrirlo con un toque.
 */
export function deliverFile(file: Blob, fileName: string, actionLabel: string): void {
  downloadFile(file, fileName, file.type);
  const url = URL.createObjectURL(file);
  notify.withAction(`${fileName} generado`, {
    label: actionLabel,
    onClick: () => {
      // Sin "noopener": la pestaña nueva debe poder cargar la URL blob creada por esta página.
      window.open(url, "_blank");
    },
  });
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, OPEN_URL_TTL_MS);
}
