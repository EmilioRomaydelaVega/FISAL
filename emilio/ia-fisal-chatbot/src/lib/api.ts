import type { PeticionChat, RespuestaChat } from "../types";
import { buscar, frasesRelevantes, normalizar, terminos, textoPagina } from "./busqueda";

/**
 * Conexión con el servidor del chatbot.
 *
 * - Si VITE_API_URL está vacío: MODO DEMOSTRACIÓN. Las respuestas se simulan
 *   buscando en los manuales de prueba, sin llamar a Claude.
 * - Si tiene valor: se envía la pregunta (con las fotos) a `${VITE_API_URL}/chat`,
 *   que es quien llama a Claude con la clave guardada en el servidor.
 */
const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export const MODO_DEMO = API_URL === "";

export async function enviarPregunta(peticion: PeticionChat): Promise<RespuestaChat> {
  if (MODO_DEMO) return respuestaSimulada(peticion);

  const r = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(peticion),
  });
  if (!r.ok) throw new Error(`El servidor respondió ${r.status}`);
  return (await r.json()) as RespuestaChat;
}

const TEMAS_SEGURIDAD = ["presion", "hidraulic", "tension", "voltio", "bateria", "electric", "latiguillo", "fuga"];

async function respuestaSimulada({ pregunta, imagenes, maquina }: PeticionChat): Promise<RespuestaChat> {
  await new Promise((r) => setTimeout(r, 650 + Math.random() * 500));

  const notaFoto =
    imagenes.length > 0
      ? `${imagenes.length === 1 ? "Foto recibida" : `${imagenes.length} fotos recibidas`}. En modo demostración no se analizan; con Claude conectado identificará la pieza, la avería o el código que aparezca en la imagen.`
      : null;

  if (!pregunta.trim()) {
    return {
      respuesta: notaFoto ?? "Escribe tu pregunta o adjunta una foto.",
      detalle: ["Añade una frase con lo que necesitas, por ejemplo: «¿qué filtro es este?» o «qué significa este código»."],
      fuentes: [],
    };
  }

  const hits = buscar(pregunta, maquina, 3);
  if (hits.length === 0) {
    return {
      respuesta: "No lo encuentro en los manuales cargados.",
      detalle: [
        "Prueba con otras palabras, con el código de error (por ejemplo E-203) o con la referencia del filtro.",
        ...(notaFoto ? [notaFoto] : []),
      ],
      fuentes: [],
    };
  }

  // Solo se citan las páginas que de verdad responden (no las que tocan el tema de pasada)
  const mejor = hits[0]?.puntuacion ?? 0;
  const fuentes = hits.filter((h) => h.puntuacion >= mejor * 0.5);
  const principal = fuentes[0];

  // Respuesta corta: la frase que mejor responde; detalle: la siguiente si también encaja
  const minimo = Math.max(1, Math.ceil(terminos(pregunta).length / 2));
  const frases = principal ? frasesRelevantes(textoPagina(principal.manualId, principal.pagina), pregunta) : [];
  const respuesta = frases[0]?.frase ?? principal?.extracto ?? "";
  const detalle = frases
    .slice(1, 3)
    .filter((f) => f.aciertos >= minimo)
    .map((f) => f.frase);
  if (notaFoto) detalle.push(notaFoto);

  const q = normalizar(pregunta);
  const aviso = TEMAS_SEGURIDAD.some((t) => q.includes(t))
    ? "Antes de intervenir, sigue el procedimiento de seguridad del manual."
    : undefined;

  return {
    respuesta,
    detalle,
    fuentes: fuentes.map(({ manualId, pagina, seccion, extracto }) => ({ manualId, pagina, seccion, extracto })),
    aviso,
  };
}
