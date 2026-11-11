/**
 * Contrato de datos entre la interfaz y el servidor del chatbot.
 * El servidor (que llamará a Claude) tendrá que devolver exactamente estas formas.
 */

/** Un manual de taller disponible para consultar. */
export interface Manual {
  id: string;
  titulo: string;
  maquina: string;
  /** Dirección del PDF (relativa o absoluta). */
  url: string;
  paginas: number;
}

/** Lugar concreto de un manual que respalda una respuesta o un resultado de búsqueda. */
export interface Fuente {
  manualId: string;
  pagina: number;
  seccion?: string;
  /** Trozo de texto de esa página donde está la información. */
  extracto: string;
}

/** Imagen adjunta, ya reducida en el navegador y lista para enviar a Claude. */
export interface ImagenAdjunta {
  id: string;
  nombre: string;
  /** data:image/jpeg;base64,... */
  dataUrl: string;
  ancho: number;
  alto: number;
}

export interface MensajeUsuario {
  id: string;
  rol: "usuario";
  texto: string;
  imagenes: ImagenAdjunta[];
  fecha: string;
}

export interface MensajeAsistente {
  id: string;
  rol: "asistente";
  /** Respuesta corta y sencilla, lo primero que se lee. */
  respuesta: string;
  /** Pasos o detalles opcionales, en lista. */
  detalle: string[];
  /** Dónde está en los manuales. */
  fuentes: Fuente[];
  /** Avisos de seguridad o advertencias (opcional). */
  aviso?: string;
  fecha: string;
}

export type Mensaje = MensajeUsuario | MensajeAsistente;

/** Lo que la interfaz envía al servidor en cada pregunta. */
export interface PeticionChat {
  pregunta: string;
  imagenes: ImagenAdjunta[];
  maquina?: string;
  historial: Mensaje[];
}

/** Lo que el servidor devuelve. */
export interface RespuestaChat {
  respuesta: string;
  detalle: string[];
  fuentes: Fuente[];
  aviso?: string;
}

export interface ResultadoBusqueda extends Fuente {
  puntuacion: number;
}

/** Página que se abre en el visor, con el texto a resaltar. */
export interface PaginaAbierta {
  manualId: string;
  pagina: number;
  resaltar?: string;
}
