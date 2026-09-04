## Parte diario — campos

- Fecha (automática) y máquina
- Horómetro / horas de la máquina
- Niveles: aceite motor, hidráulico, refrigerante (OK / bajo / crítico)
- Fugas: sí / no
- Estado general: OK / atención / avería
- Incidencia: sí/no + descripción
- Fotos (comprimidas como en las inspecciones)
- Firma del operario (nombre) — se guarda el usuario que lo envía

Un parte por máquina y día: si se reenvía, se actualiza el del día.

## Detalles técnicos

- **Auth**: email + contraseña de Lovable Cloud, sin registro abierto. Se crea la cuenta por invitación desde la ficha de cliente; la app interna sigue sin login.
- **Datos nuevos** (se aplican al aceptar el borrador):
  - `clients` — ficha de cliente.
  - `client_users` — enlaza cada cuenta de acceso con su cliente.
  - `daily_checks` — parte diario (cliente, máquina, fecha, datos + fotos en jsonb, columna `summary` sin fotos igual que en inspecciones, índice por fecha).
  - `fleet.data` guarda además `client_id` al asignar alquiler (se mantiene el nombre actual).
  - Seguridad: el cliente solo lee/escribe filas de su propio `client_id`; el portal interno mantiene el acceso abierto actual.
- **Rutas**: `/portal` (login), `/portal/maquinas`, `/portal/parte/$machineId`. Tu app sigue en `/`.
- **Rendimiento**: la lista de partes carga solo el resumen; las fotos se descargan al abrir el parte o el PDF.
- **Exportación**: CSV y PDF de partes diarios, con el mismo estilo FISALRENT.

## Orden de trabajo

1. Sección Clientes + enlace con Flota.
2. Tablas y seguridad del portal.
3. Login del cliente e invitaciones.
4. Portal: mis máquinas + parte diario con fotos.
5. Sección "Partes diarios" en tu app, con avisos de incidencia y exportación.
