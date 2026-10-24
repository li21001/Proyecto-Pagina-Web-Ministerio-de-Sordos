# A46 · Formulario de Google y código QR de registro (HU-27)
**Responsable:** Azucena

## Formulario
- Creado en Google Forms con el **correo del ministerio** (CC-07); las respuestas quedan en su cuenta, no en el sitio.
- Título: *Registro de la comunidad sorda · Ministerio de Sordos, Cojutepeque*.
- Preguntas:
  1. Nombre completo
  2. ¿Eres persona sorda u oyente?
  3. ¿Usas LESSA?
  4. Municipio
  5. Reuniones a las que asistes (miércoles, viernes, domingo)

## Código QR
- Generado a partir del enlace corto del formulario (`forms.gle/…`).
- Archivo: `img/qr-registro.png`. Se muestra en Inicio y se puede descargar para imprimir.
- El enlace del formulario se guarda en Firestore (`sitio/contacto` → `formularioQR`) desde el panel, pestaña **Contacto y videos**.

## Criterios de aceptación cumplidos
- El QR es visible en Inicio y está disponible en formato imprimible.
- Al escanearlo se abre el formulario en el celular.
- El sitio no almacena los datos del formulario.
