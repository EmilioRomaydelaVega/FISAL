import { trocearResaltado } from "../lib/busqueda";

/** Muestra un texto con las palabras de la consulta resaltadas. */
export function Resaltado({ texto, consulta }: { texto: string; consulta: string }) {
  return (
    <>
      {trocearResaltado(texto, consulta).map((p, i) =>
        p.marca ? (
          <mark key={i} className="resaltado">
            {p.texto}
          </mark>
        ) : (
          <span key={i}>{p.texto}</span>
        ),
      )}
    </>
  );
}
