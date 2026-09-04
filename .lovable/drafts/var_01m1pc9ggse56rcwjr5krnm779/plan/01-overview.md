# Portal de Clientes — Parte Diario de Máquina

Un portal para tus clientes donde cada operario entra con su email y contraseña y rellena un parte diario de la máquina que tiene alquilada, con fotos. Tú lo ves todo desde FISALRENT.

## Nota importante sobre "app separada"

Un proyecto Lovable nuevo tendría su propia base de datos y no vería tus máquinas, tu flota ni tus clientes. Para que el parte diario esté ligado a las máquinas y alquileres reales, el portal se construye como una **aplicación aparte dentro de este mismo proyecto**: rutas propias (`/portal`), su propio diseño de acceso y su propio login, totalmente separada de tu panel interno, pero compartiendo los datos.

Resultado: tú entras en la app de siempre; tus clientes entran en `tudominio/portal` y solo ven sus máquinas.

## Qué se construye

1. **Clientes (ficha completa)** — nueva sección en tu app: nombre, CIF, contacto, teléfono, email, obra/dirección, notas. Los alquileres de Flota pasan a elegir cliente de esta lista.
2. **Acceso de cliente** — cada persona de un cliente se registra/entra con email y contraseña. Tú autorizas qué emails pertenecen a qué cliente (invitación desde la ficha).
3. **Portal del cliente** — al entrar ve solo las máquinas que tiene alquiladas ahora mismo. Por cada una: botón "Parte diario de hoy".
4. **Parte diario (básico + fotos)** — horómetro, niveles (aceite motor, hidráulico, refrigerante), fugas, estado general, incidencia sí/no, observaciones y fotos. Un parte por máquina y día.
5. **Vista para ti** — sección "Partes diarios" en tu app: filtro por máquina, cliente y fecha, aviso de incidencias, y exportación CSV/PDF como en el resto.
