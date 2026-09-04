## En tu app (FISALRENT)

- **Sección Clientes**: alta de cliente (nombre, contacto, código de acceso generado automáticamente), copiar el enlace/código para enviárselo por WhatsApp, y activar/desactivar el acceso.
- **En Flota**, el campo "cliente" pasa a poder enlazarse a un cliente de la lista, para que ese cliente vea la máquina en su portal.
- **Sección Partes diarios**: listado por máquina y cliente, con filtros por fecha y avisos destacados:
  - Rojo: parte con incidencia o fallo en el checklist.
  - Amarillo: máquina alquilada sin parte del día de hoy.
  - Verde: parte recibido y sin incidencias.
- Exportación CSV y PDF de los partes, con el mismo estilo negro/amarillo del resto de informes.

## Detalles técnicos

- **Acceso sin login**: el código de cliente identifica al cliente; el portal solo puede leer y escribir datos de ese cliente, y el código se puede desactivar en cualquier momento.
- **Datos nuevos** (se aplican al aceptar el borrador):
  - `clients` — ficha de cliente: nombre, CIF, contacto, teléfono, email, obra, código de acceso, activo.
  - `daily_checks` — parte diario: cliente, máquina, fecha, datos + fotos en jsonb, columna `summary` sin fotos (igual que en inspecciones) e índice por fecha. Un parte por máquina y día; si se reenvía, se actualiza.
  - `fleet.data` guarda además `client_id` al asignar el alquiler, manteniendo el nombre actual.
- **Rutas**: `/cliente` (código), `/cliente/maquinas`, `/cliente/parte/$machineId`. Tu app sigue en `/`.
- **Rendimiento**: los listados cargan solo el resumen; las fotos se descargan al abrir el parte o el PDF.

## Orden de trabajo

1. Sección Clientes con código de acceso + enlace con Flota.
2. Tablas y reglas de acceso del portal.
3. Portal `/cliente`: entrada por código y "mis máquinas".
4. Parte diario con checklist, horómetro, fotos, incidencias y firma.
5. Sección "Partes diarios" en tu app con semáforo de avisos y exportación CSV/PDF.
