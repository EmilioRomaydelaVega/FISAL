# IA Fisal · Asistente técnico de taller

Interfaz del chatbot de Grupo Fisal: el mecánico pregunta (con texto o con una foto),
recibe una respuesta corta y debajo el manual y la página donde está, que puede abrir
en el visor sin salir de la app. Tiene también un buscador de texto en todos los manuales.

App independiente de CheckIn Pro: vive en `emilio/ia-fisal-chatbot/` y se despliega por separado.

> **Estado: fase 1, solo la interfaz.** Funciona en **modo demostración** con dos manuales
> inventados (`public/manuales/demo-*.pdf`) y respuestas simuladas. Aún no llama a Claude.

## Qué hace

| Parte           | Qué ofrece                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Asistente**   | Chat. Admite fotos (botón, cámara del móvil, pegar o arrastrar; hasta 4 por mensaje, reducidas en el navegador a 1568 px). Respuesta corta, detalle opcional, aviso de seguridad y fuentes. |
| **Fuentes**     | Cada respuesta muestra manual, página, sección y la frase exacta, con las palabras de la pregunta resaltadas. «Ver página» abre el visor; «Abrir PDF» lo abre en otra pestaña.              |
| **Visor PDF**   | Abre en la página citada y resalta el texto. Buscar dentro del manual con salto a las páginas donde aparece, zoom, paso de página (también con flechas), descargar. Panel lateral en ordenador, pantalla completa en el móvil. |
| **Buscador**    | Busca en todos los manuales sin tener en cuenta tildes ni mayúsculas, da más peso a códigos y referencias (E-203, FH-2030) y lista las páginas con el extracto. Sin texto, muestra la biblioteca de manuales. |
| **Máquina**     | Selector en la cabecera para limitar chat y buscador a una máquina.                                                                                                                         |

## Arrancar en local

```bash
cd emilio/ia-fisal-chatbot
npm install
npm run dev        # http://localhost:5173
npm run build      # comprueba tipos y genera dist/
```

Tecnología: React 19, TypeScript estricto, Vite 7, Tailwind CSS v4 y react-pdf (pdf.js). Colores en `src/styles.css`
(azul de acción con el oro de Grupo Fisal como acento).

## Estructura

```text
public/manuales/          PDF de demostración (se borran al cargar los reales)
scripts/                  generar_manuales_demo.py: crea los PDF y el índice de demo
src/
  types.ts                Contrato de datos entre la interfaz y el servidor
  lib/api.ts              Envío de preguntas: modo demo o servidor real (VITE_API_URL)
  lib/busqueda.ts         Buscador de texto (hoy en el navegador, con el índice de demo)
  lib/imagenes.ts         Reducción de fotos antes de enviarlas
  data/indice-demo.json   Texto por página de los manuales de demo
  components/             Chat, Composer, FuenteCard, Buscador, VisorPdf, Resaltado
```

## Conectar la IA (fase 2, con los manuales reales)

1. **Manuales**: subirlos a Supabase Storage (bucket privado), nunca a este repositorio, que es público.
2. **Índice**: trocear cada PDF por páginas y guardar el texto en una tabla con búsqueda de texto completo
   (y vectores si hace falta). Los escaneados pasan antes por OCR.
3. **Servidor**: una función `/api/chat` en Vercel que recibe `PeticionChat` (ver `src/types.ts`), busca en el índice,
   llama a Claude con la pregunta, las fotos y los trozos encontrados, y devuelve `RespuestaChat`:
   `{ respuesta, detalle, fuentes: [{ manualId, pagina, seccion, extracto }], aviso }`.
4. **Clave de Claude**: solo en las variables de entorno de Vercel (`ANTHROPIC_API_KEY`). Nunca en el código ni en `.env` del repo.
5. **Activar**: poner `VITE_API_URL` con la dirección del servidor. Con eso desaparece el modo demostración.
6. **Buscador**: pasar `buscar()` de `lib/busqueda.ts` a una llamada al servidor, que devuelve los mismos `ResultadoBusqueda`.
7. **Acceso**: login con Supabase Auth (mismos usuarios que el SAM) antes de publicarla para el equipo.
