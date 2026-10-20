# Inventario de funcionalidades

Inventario de todo lo que hace la versión original generada con Lovable (etiqueta
`original-lovable`, commit `beb3682`). Es la checklist de verificación de la
reescritura: cada punto debe comportarse igual en la nueva versión.

Leyenda: `[ ]` pendiente · `[x]` verificado en la nueva versión.

---

## 1. Rutas

| Ruta | Pantalla | Título de la página |
| --- | --- | --- |
| `/` | Backoffice de inspecciones (CheckIn Pro) | CheckIn Pro — Inspección de Maquinaria |
| `/cliente` | Portal de cliente: acceso con código | Portal de cliente — FISALRENT |
| `/cliente/maquinas` | Portal: máquinas alquiladas del cliente | Mis máquinas alquiladas — FISALRENT |
| `/cliente/parte/:machineId` | Portal: parte diario de una máquina | Parte diario de máquina — FISALRENT |
| cualquier otra | Página 404 con enlace a inicio | — |

- [ ] R1. Las cuatro rutas existen y cargan su pantalla, también al entrar directamente por URL o recargar.
- [ ] R2. Cada ruta establece su título y descripción.
- [ ] R3. Página 404 para rutas desconocidas y página de error con "Reintentar" e "Ir a inicio" si algo falla al renderizar.

## 2. Backoffice (`/`)

Una sola página con navegación interna por secciones: Inicio, Nueva inspección,
Máquinas, Flota, Clientes, Partes diarios e Historial.

### 2.1 Navegación y comunes
- [ ] B1. Cabecera con logo FISALRENT, subtítulo "Inspección de maquinaria Komatsu" y botones de las 7 secciones; la activa se resalta.
- [ ] B2. Al cambiar a cualquier sección que no sea "Nueva inspección" se reinicia el formulario de inspección en curso (y se borra el borrador). Al pulsar "Nueva inspección" se va al paso 0 sin borrar datos.
- [ ] B3. Notificaciones flotantes (éxito/error) que desaparecen a los 3 s.
- [ ] B4. Carga inicial en paralelo desde Supabase: `inspections.summary` (orden `created_at` desc), `fleet` (`machine_id, data`), `custom_machines.data` (orden `created_at` asc), `clients.*` (orden `created_at` asc), `daily_checks.summary, check_date` (orden `check_date` desc, límite 500).
- [ ] B5. Sincronización en tiempo real (canal `fisalrent-sync`) con las tablas `inspections` (INSERT/DELETE), `fleet` (upsert/DELETE), `custom_machines` (INSERT/DELETE), `clients` (INSERT/UPDATE/DELETE) y `daily_checks` (INSERT/UPDATE/DELETE), sin duplicar elementos.

### 2.2 Inicio
- [ ] H1. Titular, descripción y botón "+ Nueva Inspección".
- [ ] H2. Tres tarjetas informativas: Inspección de salida, Inspección de entrada, Historial completo.
- [ ] H3. "Últimas inspecciones": las 3 más recientes con icono, máquina, cliente, fecha y etiqueta SALIDA / ENTRADA / ALQUILER.

### 2.3 Nueva inspección (asistente de 5 pasos)
- [ ] N1. Elección de tipo: SALIDA o ENTRADA. "Atrás" en el paso 0 vuelve a esta elección.
- [ ] N2. Indicador de pasos: Datos, Checklist, Fotos, Desperfectos, Firma & Envío, con barra de progreso y pasos completados marcados.
- [ ] N3. Etiqueta del tipo y máquina seleccionada sobre el formulario.
- [ ] N4. Paso Datos: selección de máquina (lista de `custom_machines`), cliente*, operario*, horómetro/km, nivel de combustible (Vacío, 1/4, 1/2, 3/4 —por defecto—, Lleno) y notas generales.
- [ ] N5. No se puede avanzar del paso 0 sin máquina, cliente y operario ("Completa los campos obligatorios"); el botón Siguiente se ve atenuado mientras tanto.
- [ ] N6. Paso Checklist: 22 puntos agrupados (Motor, Hidráulica, Ruedas, Orugas, Rodadura, Eléctrico, Cabina, Seguridad, Cazo, Caja, Escalera, Documentación); estados OK (por defecto), Defecto y N/A; contadores por estado; campo de descripción cuando el estado es Defecto.
- [ ] N7. Paso Fotos: añadir varias fotos (cámara trasera en móvil), compresión a máx. 1024 px JPEG calidad 0,6, miniatura con hora y botón de borrar; aviso si no hay fotos ("al menos 4") y contador si las hay.
- [ ] N8. Paso Desperfectos: mapa con 8 zonas (Frontal, Trasera, Lateral izq., Lateral der., Superior, Cabina, Brazo/Pluma, Tren rodaje) sobre el icono y nombre de la máquina; zonas con daño marcadas; formulario con tipo (Arañazo, Abolladura, Rotura, Corrosión, Deformación, Otro), gravedad (leve, moderado, grave) y descripción; mensaje "Desperfecto registrado correctamente"; lista de desperfectos con borrado; aviso "Sin desperfectos registrados".
- [ ] N9. Si el mapa de desperfectos falla, se muestra un aviso con "Reintentar" dentro del paso sin perder la inspección.
- [ ] N10. Paso Firma: resumen (máquina, cliente, operario, combustible, horómetro, fotos), estado global (sin incidencias / leves / graves: grave si hay algún desperfecto grave o más de 2 defectos de checklist), contadores, nombre del firmante* y fecha y hora actuales.
- [ ] N11. Al finalizar sin firmante: error "Introduce el nombre para la firma".
- [ ] N12. Al finalizar: se crea la inspección (`id` = timestamp, fecha en formato es-ES, `defectCount`, `failCount`), se añade al historial, se descarga el PDF, se reinicia el formulario, se va al Historial y se guarda en `inspections` (`id`, `data`). Si falla el guardado se retira del historial y se muestra el error; si no, "Inspección de salida/entrada registrada · PDF descargado".
- [ ] N13. Borrador automático en IndexedDB (`fisalrent-draft` / `draft` / `current`) 400 ms después de cada cambio, con fotos incluidas. Al abrir la app se recupera ("Se ha recuperado la inspección que tenías a medias") en el paso donde se dejó.

### 2.4 Máquinas
- [ ] M1. Alta de máquina: nombre*, número de serie*, categoría* e icono (8 emojis, 🚜 por defecto). Validación "Completa nombre, serie y categoría". Se guarda en `custom_machines` (`id` numérico basado en timestamp).
- [ ] M2. Listado "Todas las máquinas (n)" con icono, nombre, serie y categoría, y estado vacío.
- [ ] M3. Eliminar máquina (sin confirmación, igual que el original).
- [ ] M4. Exportar listado a CSV y PDF (Nombre, Serie, Categoría, Icono).

### 2.5 Flota
- [ ] F1. Cuatro indicadores: Alquiladas, Disponibles, Extintor a menos de 30 días y Extintor caducado. Los dos primeros filtran el listado (al volver a pulsar se quita el filtro).
- [ ] F2. Cada máquina muestra icono, nombre, serie, categoría, ALQUILADA/DISPONIBLE (alquilada = tiene texto en `client`), cliente, ubicación, con/sin extintor, estado del extintor (caducado / en N días / OK) y aviso de fin de alquiler (vencido hace N días / finaliza HOY / finaliza en ≤5 días).
- [ ] F3. Al desplegar una máquina se editan: cliente (lista de clientes; guarda `clientId` y `client`), ayuda contextual sobre el portal, ubicación, fecha inicio, fecha fin, lleva extintor, fecha de revisión del extintor (solo si lleva) y notas. Cada cambio se guarda al momento en `fleet` (upsert de `machine_id`, `data`, `updated_at`).
- [ ] F4. Documentación de la máquina: subir archivo (máx. 20 MB) al bucket `machine-docs` en `<machineId>/<timestamp>_<nombre saneado>`, ver con URL firmada de 1 hora y eliminar con confirmación.
- [ ] F5. "Liberar máquina": exige cliente asignado; con confirmación crea un registro `alquiler` en `inspections` (máquina, cliente, ubicación, fechas, notas, documentos e inspecciones relacionadas de esa máquina y cliente no asignadas antes a otro alquiler) y vacía cliente, ubicación, fechas, notas y documentos de la ficha (se mantiene `clientId`, como en el original).
- [ ] F6. "Guardar" pliega la ficha y muestra "Datos guardados".
- [ ] F7. Exportar flota a CSV y PDF (Máquina, Serie, Categoría, Estado, Cliente, Ubicación, Inicio, Fin, Extintor).

### 2.6 Clientes
- [ ] C1. Alta de cliente: nombre/empresa*, CIF, contacto, teléfono, email y obra. Se genera `id` = `c<timestamp>` y código de acceso `FISAL-<4 cifras>`, activo. Mensaje "Cliente creado · código …".
- [ ] C2. Edición de cliente reutilizando el formulario (botones "Guardar cambios" y "Cancelar") con desplazamiento al inicio.
- [ ] C3. Ficha de cliente: nombre, datos de contacto (o "Sin datos de contacto"), número de máquinas asignadas (por `clientId` en flota), código y estado del acceso.
- [ ] C4. Copiar enlace del portal (`<origen>/cliente`) y código al portapapeles.
- [ ] C5. Enviar enlace y código por WhatsApp (`wa.me`).
- [ ] C6. Activar / desactivar acceso.
- [ ] C7. Eliminar cliente con confirmación.
- [ ] C8. Exportar a CSV (Cliente, CIF, Contacto, Teléfono, Email, Obra, Código, Activo) y PDF (Cliente, Contacto, Teléfono, Código, Activo).

### 2.7 Partes diarios
- [ ] P1. Aviso "Sin parte de hoy (n)" con las máquinas con `clientId` en flota sin parte del día (fecha UTC, como en el original), que se puede ocultar.
- [ ] P2. Filtros por cliente, máquina y fecha.
- [ ] P3. Tarjeta de parte: máquina, serie, fecha, cliente, operador, horas, incidencia, puntos del checklist que no están OK (fallo/atención), estado CORRECTO / CON INCIDENCIA y número de fotos.
- [ ] P4. Eliminar parte con confirmación (por `id`, o por máquina y fecha si no tiene `id`).
- [ ] P5. Exportar lo filtrado a CSV y PDF (Fecha, Cliente, Máquina, Serie, Operador, Horas, Estado, Incidencia, Fotos).

### 2.8 Historial
- [ ] I1. Cabecera con número de inspecciones, exportación CSV/PDF (ID, Fecha, Tipo, Máquina, Serie, Cliente, Ubicación, Inicio/Fin alquiler, Notas) y botón "+ Nueva".
- [ ] I2. Estado vacío con "Crear primera inspección".
- [ ] I3. Las inspecciones asociadas a un alquiler se muestran dentro de su tarjeta de alquiler y no sueltas.
- [ ] I4. Tarjeta de alquiler: máquina, cliente, ubicación, periodo, notas, documentos, inspecciones asociadas (tipo, fecha, operario, nº incidencias y PDF) y eliminación con confirmación.
- [ ] I5. Tarjeta de inspección: máquina, tipo, cliente, operario, fecha, combustible, horómetro, nº fotos, defectos de checklist, desperfectos, firmante, estado (sin/con incidencias), descargar PDF, eliminar con confirmación y miniaturas (máx. 6 + contador).
- [ ] I6. Descargar PDF: si el listado no trae fotos, se recupera la inspección completa (`inspections.data`) antes de generarlo.

### 2.9 Informes PDF y CSV
- [ ] X1. PDF de inspección (A4): cabecera FISALRENT, tipo, bloque de máquina, datos, checklist con estados de color y notas, desperfectos por gravedad, notas generales, páginas de fotos en 2 columnas y pie con número de página. Nombre `Inspeccion_<máquina>-<tipo>-<id>.pdf`.
- [ ] X2. PDF de listado (A4): cabecera, fecha, total, tabla con filas alternas y salto de página.
- [ ] X3. CSV con separador `;`, BOM UTF‑8, comillas cuando hace falta y saltos de línea convertidos a espacios. Nombres de archivo con la fecha del día.

## 3. Portal de cliente

### 3.1 Acceso (`/cliente`)
- [ ] L1. Si ya hay sesión guardada se redirige a `/cliente/maquinas`.
- [ ] L2. Código en mayúsculas (Enter o botón "Entrar"); consulta `clients` por `access_code`.
- [ ] L3. Errores: "No se pudo conectar…", "Código no válido…", "Este acceso está desactivado…".
- [ ] L4. Sesión guardada en `localStorage` (`fisalrent_client_session`: `id`, `name`, `code`).

### 3.2 Mis máquinas (`/cliente/maquinas`)
- [ ] K1. Sin sesión se redirige a `/cliente`.
- [ ] K2. Saludo "Hola, <cliente>" y botón "Salir" que borra la sesión.
- [ ] K3. Máquinas cuya ficha de flota tiene `clientId` del cliente, con nombre, serie y ubicación, y estado "PARTE ENVIADO ✓" / "PENDIENTE HOY" según los partes de hoy (fecha local).
- [ ] K4. Estados "Cargando…" y "No tienes máquinas alquiladas ahora mismo".
- [ ] K5. Al pulsar una máquina se abre su parte diario.

### 3.3 Parte diario (`/cliente/parte/:machineId`)
- [ ] D1. Sin sesión se redirige a `/cliente`; "Salir" vuelve a `/cliente/maquinas`.
- [ ] D2. Cabecera con icono, nombre, serie y fecha de hoy.
- [ ] D3. Si ya existe el parte de hoy se precargan checklist, horas, operador e incidencia.
- [ ] D4. Checklist rápido de 7 puntos con OK / Atención / Fallo.
- [ ] D5. Horómetro y operador.
- [ ] D6. Incidencia (casilla y descripción).
- [ ] D7. Fotos: hasta 6 por selección y 8 en total, comprimidas a 1280 px JPEG 0,6, con borrado.
- [ ] D8. Firma del operador en lienzo (ratón y táctil) con "Borrar firma".
- [ ] D9. Validaciones: "Indica el nombre del operador" y "Describe la incidencia".
- [ ] D10. Envío: upsert en `daily_checks` (`id` = `<machineId>_<fecha>`, `client_id`, `machine_id`, `check_date`, `data`) con conflicto en `machine_id,check_date`; "Parte diario enviado ✓" y vuelta a `/cliente/maquinas` a los 1,2 s.
- [ ] D11. "Mis partes anteriores": últimos 15 partes de la máquina y el cliente con fecha, operador y estado.

## 4. Datos y servicios externos

### 4.1 Supabase (proyecto `vrciihdzujyyzwaemnln`)
| Tabla / recurso | Uso |
| --- | --- |
| `inspections` (`id`, `data`, `summary`, `created_at`) | Inspecciones y alquileres archivados. `summary` = `data` sin fotos + `photoCount` (trigger). |
| `fleet` (`machine_id`, `data`, `updated_at`) | Estado de alquiler y documentación por máquina. |
| `custom_machines` (`id`, `data`, `created_at`) | Catálogo de máquinas (13 Komatsu precargadas). |
| `clients` | Fichas de cliente y código de acceso al portal. |
| `daily_checks` (`id`, `client_id`, `machine_id`, `check_date`, `data`, `summary`) | Partes diarios; único por máquina y día. |
| Storage `machine-docs` | Documentos de cada máquina. |
| Realtime | Publicación `supabase_realtime` de las tablas anteriores. |

- [ ] S1. Las migraciones de `supabase/migrations` se conservan sin cambios.
- [ ] S2. La nueva versión lee y escribe exactamente las mismas tablas, columnas y formatos JSON, de modo que comparte datos con la original.

### 4.2 Otros
- WhatsApp (`https://wa.me/?text=…`) para compartir el acceso del cliente.
- Portapapeles del navegador.
- Fuentes de Google Fonts (en el original DM Mono y Syne).

## 5. Variables de entorno

| Variable | Uso | Original |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase (navegador) | Sí |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública (anon/publishable) | Sí |
| `VITE_SUPABASE_PROJECT_ID` | Id del proyecto | Definida, no usada por el código |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Fallback de SSR | Solo SSR |
| `SUPABASE_SERVICE_ROLE_KEY` | Cliente de servidor | Definido pero nunca importado |

## 6. Código generado por Lovable sin uso funcional

No forma parte de las funcionalidades y no se traslada a la reescritura:
`src/lib/api/example.functions.ts` (función de servidor de ejemplo), `client.server.ts`,
`auth-middleware.ts`, `auth-attacher.ts` (no hay inicio de sesión de Supabase),
`previewAuthStorage.ts` (solo para la vista previa de Lovable), los informes de
error de Lovable, el envoltorio SSR (`server.ts`, `start.ts`), 46 componentes de
`components/ui` sin usar, `use-mobile.tsx`, `.lovable/` y las ~40 dependencias
sin importar (Radix, recharts, react-query, react-hook-form, etc.).
