import indice from "../data/indice-demo.json";
import type { Manual, ResultadoBusqueda } from "../types";

/**
 * Buscador de texto sobre los manuales.
 * Hoy busca en el índice de demostración, dentro del navegador.
 * Con los manuales reales, esta búsqueda pasará al servidor (Supabase, texto completo).
 */

interface PaginaIndice {
  manualId: string;
  pagina: number;
  seccion: string;
  texto: string;
}

export const MANUALES: Manual[] = indice.manuales;
const PAGINAS: PaginaIndice[] = indice.paginas;

const PALABRAS_VACIAS = new Set(
  "a al algo como con cual cuales cuando de del donde el en es esta este hay la las le lo los me mi para pero por que se sin su sus un una uno y o cada cuanto cuanta cuantos cuantas debo tengo hacer hace puedo".split(
    " ",
  ),
);

/** Minúsculas y sin tildes, para que "presión" y "presion" coincidan. */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function terminos(consulta: string): string[] {
  return normalizar(consulta)
    .split(/[^a-z0-9ñ-]+/)
    .map((t) => t.replace(/^-+|-+$/g, ""))
    .filter((t) => t.length >= 2 && !PALABRAS_VACIAS.has(t));
}

export function manualPorId(id: string): Manual | undefined {
  return MANUALES.find((m) => m.id === id);
}

export function textoPagina(manualId: string, pagina: number): string {
  return PAGINAS.find((p) => p.manualId === manualId && p.pagina === pagina)?.texto ?? "";
}

/** Frases de una página ordenadas por cuántos términos de la consulta contienen. */
export function frasesRelevantes(texto: string, consulta: string): { frase: string; aciertos: number }[] {
  const terms = terminos(consulta);
  return texto
    .split(/(?<=\.)\s+/)
    .map((frase, orden) => {
      const n = normalizar(frase);
      return { frase, orden, aciertos: terms.reduce((s, t) => s + (n.includes(t) ? 1 : 0), 0) };
    })
    .filter((f) => f.aciertos > 0)
    .sort((a, b) => b.aciertos - a.aciertos || a.orden - b.orden)
    .map(({ frase, aciertos }) => ({ frase, aciertos }));
}

/** La frase de la página que mejor responde a la consulta. */
function extracto(texto: string, consulta: string): string {
  return frasesRelevantes(texto, consulta)[0]?.frase ?? texto.slice(0, 200);
}

const TEXTOS_NORMALIZADOS = PAGINAS.map((p) => normalizar(`${p.seccion} ${p.texto}`));

/** Peso de un término según en cuántas páginas aparece (IDF); los códigos con números pesan el triple. */
function pesoTermino(t: string): number {
  const df = TEXTOS_NORMALIZADOS.filter((x) => x.includes(t)).length;
  const idf = Math.log((PAGINAS.length + 1) / (df + 1)) + 0.2;
  return /\d/.test(t) ? idf * 3 : idf;
}

export function buscar(consulta: string, maquina?: string, limite = 20): ResultadoBusqueda[] {
  const terms = terminos(consulta);
  if (terms.length === 0) return [];
  const frase = normalizar(consulta.trim());
  const pesos = new Map(terms.map((t) => [t, pesoTermino(t)]));

  const resultados: ResultadoBusqueda[] = [];
  for (const p of PAGINAS) {
    const manual = manualPorId(p.manualId);
    if (!manual) continue;
    if (maquina && manual.maquina !== maquina) continue;

    const texto = normalizar(`${p.seccion} ${p.texto}`);
    let puntuacion = 0;
    let encontrados = 0;
    for (const t of terms) {
      const veces = texto.split(t).length - 1;
      if (veces === 0) continue;
      encontrados += 1;
      // Las palabras raras (códigos, referencias) pesan más que las que salen en todas partes
      puntuacion += (1 + Math.log(veces)) * (pesos.get(t) ?? 1);
    }
    if (encontrados === 0) continue;
    // Premia que aparezcan todos los términos y la frase exacta.
    puntuacion += encontrados === terms.length ? 5 : 0;
    if (frase.length > 3 && texto.includes(frase)) puntuacion += 10;

    resultados.push({
      manualId: p.manualId,
      pagina: p.pagina,
      seccion: p.seccion,
      extracto: extracto(p.texto, consulta),
      puntuacion,
    });
  }
  return resultados.sort((a, b) => b.puntuacion - a.puntuacion).slice(0, limite);
}

/** Trocea un texto en partes, marcando las que coinciden con algún término. */
export function trocearResaltado(texto: string, consulta: string): { texto: string; marca: boolean }[] {
  const terms = terminos(consulta).filter((t) => t.length >= 3 || /\d/.test(t));
  if (terms.length === 0) return [{ texto, marca: false }];
  const norm = normalizar(texto);
  const marcas = new Array<boolean>(texto.length).fill(false);
  for (const t of terms) {
    let i = norm.indexOf(t);
    while (i !== -1) {
      for (let k = i; k < i + t.length; k++) marcas[k] = true;
      i = norm.indexOf(t, i + t.length);
    }
  }
  const partes: { texto: string; marca: boolean }[] = [];
  for (let i = 0; i < texto.length; i++) {
    const marca = marcas[i] ?? false;
    const ultima = partes[partes.length - 1];
    if (ultima && ultima.marca === marca) ultima.texto += texto[i];
    else partes.push({ texto: texto[i] ?? "", marca });
  }
  return partes;
}
