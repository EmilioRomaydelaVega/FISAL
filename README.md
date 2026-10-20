# CheckIn Pro · FISALRENT

Aplicación web para gestionar el alquiler de maquinaria Komatsu de FISALRENT.

- **Backoffice** (`/`): inspecciones de salida y entrada con checklist técnico,
  fotos, mapa de desperfectos, firma e informe PDF; catálogo de máquinas;
  gestión de flota (cliente, ubicación, fechas, extintor y documentación);
  fichas de cliente con código de acceso; partes diarios recibidos e historial,
  con exportación a CSV y PDF. Los datos se sincronizan en tiempo real entre
  dispositivos.
- **Portal de cliente** (`/cliente`): el cliente entra con su código, ve sus
  máquinas alquiladas y envía el parte diario de cada una (checklist rápido,
  horómetro, incidencias, fotos y firma).

El inventario completo de funcionalidades está en [`FUNCIONALIDADES.md`](./FUNCIONALIDADES.md).

## Tecnología

| Área       | Herramienta                                                 |
| ---------- | ----------------------------------------------------------- |
| Interfaz   | React 19 + TypeScript (modo estricto)                       |
| Build      | Vite 7                                                      |
| Rutas      | TanStack Router                                             |
| Estilos    | Tailwind CSS v4 con tokens de diseño                        |
| Datos      | Supabase (Postgres, Storage y Realtime)                     |
| Validación | Zod                                                         |
| Informes   | jsPDF (se carga solo al exportar)                           |
| Calidad    | ESLint (reglas con tipos y accesibilidad), Prettier, Vitest |

## Estructura

```text
public/assets/           Logo y recursos estáticos
src/
  main.tsx               Punto de entrada
  router.tsx             Rutas, títulos y guardas de sesión del portal
  styles/globals.css     Tokens de diseño (colores, tipografía, radios, sombras)
  types/
    database.ts          Tipos generados del esquema de Supabase
    domain.ts            Modelo de dominio y esquemas Zod de los documentos JSON
  constants/             Catálogos: checklist, zonas de daño, iconos, marca…
  lib/
    domain/              Lógica de negocio pura (flota, inspecciones, partes, clientes, exportaciones)
    pdf/                 Informes PDF de inspección y de listados
    validation.ts        Esquemas de los formularios
    supabase.ts, env.ts  Cliente de Supabase y variables de entorno validadas
    csv.ts, images.ts…   Utilidades
  services/              Acceso a datos: Supabase, Storage, Realtime, IndexedDB y localStorage
  hooks/
    backoffice/          Estado del backoffice, acciones y asistente de inspección
    portal/              Acceso, máquinas y parte diario del portal
  components/
    ui/                  Componentes base (Button, Card, Field, Badge, ConfirmDialog…)
    layout/              Cabeceras y estructura de página
    shared/              Piezas compartidas entre secciones
    inspection/, fleet/, clients/, machines/, daily-checks/, history/, home/, portal/
  pages/                 Páginas que componen cada ruta
supabase/migrations/     Esquema de la base de datos (sin cambios respecto al original)
```

Las capas tienen una dirección única: **componentes → hooks → services → Supabase**.
La lógica de negocio vive en `lib/domain` como funciones puras y tiene pruebas
unitarias.

## Puesta en marcha

Requisitos: Node.js 20.19 o superior (se recomienda 22, ver `.nvmrc`).

```bash
npm install
cp .env.example .env    # y rellena los valores
npm run dev             # http://localhost:5173
```

### Variables de entorno

| Variable                        | Descripción                                               |
| ------------------------------- | --------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | URL del proyecto de Supabase (`https://<id>.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública (publishable / anon) del proyecto           |

Ambas se incluyen en el código que se envía al navegador, así que solo deben
usarse claves públicas. La aplicación comprueba al arrancar que existen y son
válidas.

### Scripts

| Comando             | Qué hace                                               |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Servidor de desarrollo                                 |
| `npm run build`     | Comprobación de tipos y build de producción en `dist/` |
| `npm run preview`   | Sirve el build de producción                           |
| `npm run lint`      | ESLint sin avisos permitidos                           |
| `npm run typecheck` | Solo comprobación de tipos                             |
| `npm test`          | Pruebas unitarias de la lógica de negocio              |
| `npm run format`    | Formatea el código con Prettier                        |

## Diseño

Los colores, tipografías, radios y sombras están centralizados en el bloque
`@theme` de `src/styles/globals.css`. Cambiar un token actualiza toda la
aplicación (por ejemplo, `--color-brand` para el color de marca).

- Fondo gris muy claro (`#f6f7f9`) con superficies blancas y bordes suaves.
- Texto casi negro (`#111827`) y textos secundarios con contraste AA.
- Acento: amarillo FISALRENT (`#f5b800`) en botones principales y elementos activos,
  con una variante oscura (`#8a6100`) para texto sobre fondo claro.
- Tipografías: Plus Jakarta Sans en títulos e Inter en el texto.
- Foco visible en todos los controles y diálogos accesibles.

## Despliegue

El proyecto está preparado para Vercel (`vercel.json`): framework Vite, salida
`dist/` y reescritura de todas las rutas a `index.html` para que funcionen las
URL del portal al recargar. Basta con configurar las dos variables de entorno
en el proyecto de Vercel.

## Base de datos

`supabase/migrations` contiene el esquema: tablas `inspections`, `fleet`,
`custom_machines`, `clients` y `daily_checks`, el bucket `machine-docs` y los
triggers que generan la columna `summary` (documento sin fotos) usada para
listar rápido. La aplicación lee y escribe exactamente el mismo formato que la
versión original, por lo que ambas pueden compartir la misma base de datos.
