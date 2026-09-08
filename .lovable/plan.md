# Por qué le pide iniciar sesión a tu cliente

## Qué he comprobado

Tu app publicada está en modo **público**: cualquiera con el enlace puede entrar sin cuenta ni contraseña. Así que el problema no es la configuración de la app.

La causa casi segura es el **enlace que estás enviando**. Hay dos direcciones distintas:

- Enlace de trabajo (vista previa del editor): empieza por `id-preview--...` — este **solo lo puede abrir alguien con cuenta de Lovable**. Por eso a tu cliente le pide iniciar sesión.
- Enlace público de tu app: `https://checkingfisal.lovable.app` — este lo abre cualquiera.

El enlace correcto para tus clientes es:

```text
https://checkingfisal.lovable.app/cliente
```

## Qué propongo hacer

1. Publicar/actualizar la app, para que la versión pública incluya el portal de cliente y el parte diario (los últimos cambios solo están en la vista previa hasta que se pulsa Actualizar).
2. Comprobar desde fuera, sin sesión iniciada, que `https://checkingfisal.lovable.app/cliente` abre directamente la pantalla del código de cliente, sin pedir ningún login.
3. Añadir en la sección Clientes de tu app un botón "Copiar enlace para WhatsApp" que copie ya montado el texto con la dirección pública correcta y el código del cliente, para que nunca se envíe por error el enlace del editor.

## Detalle técnico

- Visibilidad de publicación verificada: `public`.
- Rutas del portal: `/cliente`, `/cliente/maquinas`, `/cliente/parte/$machineId`, todas fuera de cualquier zona protegida.
- El botón de copiado usará `window.location.origin` solo cuando el dominio sea el público; si se está en la vista previa, usará el dominio publicado fijo.
