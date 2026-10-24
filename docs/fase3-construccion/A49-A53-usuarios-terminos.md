# A49 – A53 · Usuarios del panel, recuperación de contraseña y Términos y condiciones
Cambios: CC-24 (usuarios), CC-25 (validación de la recuperación de contraseña), CC-26 (términos y condiciones).

## Usuarios del panel (CC-24)
- Nueva sección **Usuarios** en el panel. Todos los usuarios tienen los mismos permisos.
- **Crear:** nombre, cargo, correo y casilla de aceptación de los Términos. Se crea la cuenta en Firebase Authentication con una conexión secundaria (no cierra la sesión de quien la agrega) y una contraseña temporal que nadie conoce; enseguida se envía al correo el enlace para que la persona cree su propia contraseña.
- **Ver:** lista con nombre, cargo, correo y estado (Tú, Activo o Desactivado).
- **Editar:** nombre y cargo. El correo no se cambia.
- **Desactivar / Reactivar:** quita o devuelve el permiso (`admins`) sin perder la ficha.
- **Eliminar:** quita el permiso y saca a la persona de la lista. Si se vuelve a agregar con el mismo correo, se reactiva.
- **Enviar enlace de contraseña:** manda el correo de recuperación a cualquier usuario.
- Límite del plan gratuito: la cuenta de Authentication solo se borra del todo desde la consola de Firebase.
- Protecciones: nadie puede desactivarse ni eliminarse a sí mismo (en el panel y en `firestore.rules`).

## Recuperación de contraseña (CC-25)
- Ya existía en el inicio de sesión («¿Olvidaste tu contraseña?»). Se valida con una prueba real: llegada del correo, carpeta en que llega, funcionamiento del enlace y cambio de contraseña. El idioma del correo se configura en Firebase (Authentication → Plantillas → Idioma: español).

## Términos y condiciones (CC-26)
- Página `terminos.html`, enlazada en el pie de todas las páginas, en el inicio de sesión y al crear usuarios.
- Contenido: quién administra el sitio, uso permitido, derechos sobre el contenido, datos personales (Ley para la Protección de Datos Personales), servicios de terceros, reglas del panel, responsabilidades del ministerio y del equipo de desarrollo tras la entrega, y ley aplicable (El Salvador).
