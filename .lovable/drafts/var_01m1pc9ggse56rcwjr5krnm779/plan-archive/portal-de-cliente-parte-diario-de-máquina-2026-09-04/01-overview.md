# Portal de cliente: parte diario de máquina

Una segunda app para tus clientes, con su propia dirección (`/cliente`), su propio diseño simplificado y acceso mediante **código de cliente** (sin registro ni contraseñas). Comparte la misma base de datos que FISALRENT, así que las máquinas, los alquileres y los partes están siempre sincronizados.

Nota práctica: se construye dentro de este mismo proyecto pero como app independiente en la ruta `/cliente`. Es la única forma de que comparta tu base de datos de máquinas y flota; un proyecto totalmente aparte no vería tus datos.

## Cómo lo vive el cliente

1. Entra en `tuapp.com/cliente` e introduce su código (ej. `FISAL-4821`).
2. Ve solo las máquinas que tiene alquiladas ahora mismo.
3. Pulsa una máquina y rellena el parte diario:
   - Checklist rápido: niveles, fugas, luces, neumáticos/orugas, cazo/caja, escalera, seguridad.
   - Horómetro (horas de máquina) del día.
   - Fotos e incidencias (descripción + fotos comprimidas).
   - Nombre del operador y firma dibujada en pantalla.
4. Guarda y ve el histórico de sus propios partes de esa máquina.

Si ya envió el parte de hoy, la máquina aparece marcada como "Parte enviado ✓".
