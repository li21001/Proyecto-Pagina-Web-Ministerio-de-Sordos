/* Contenido de prueba del sitio. Lo que se guarde desde el panel de administración
   reemplaza estos valores; si el panel no tiene datos, se usa lo que está aquí.
   Deja en blanco ("") lo que todavía no esté listo: el sitio mostrará un aviso. */
window.SITIO = {
  // Video de presentación: un archivo .mp4 de la carpeta video/ o un enlace de inserción de YouTube
  videoPresentacion: "video/presentacion.mp4",
  videoPoster: "video/presentacion.jpg",

  // Subtítulos en español (archivo .vtt). Déjalo en blanco hasta tenerlos.
  videoSubtitulos: "",

  // Fotos de la galería: ruta, descripción accesible y dimensiones originales
  galeria: [
    { imagen: "img/galeria/galeria-01.jpg", descripcion: "Actividad al aire libre: un grupo comparte papeles de colores en un sendero entre árboles.", ancho: 206, alto: 206 },
    { imagen: "img/galeria/galeria-02.jpg", descripcion: "Estudio bíblico con globos de colores: participantes representan el segundo viaje misionero de Pablo (Hechos 16:6-10).", ancho: 1400, alto: 790 },
    { imagen: "img/galeria/galeria-03.jpg", descripcion: "Convivio: un grupo de hermanos comparte alimentos y se toma una foto en un corredor al aire libre.", ancho: 1400, alto: 1051 },
    { imagen: "img/galeria/galeria-04.jpg", descripcion: "Collage de dos fotografías de cultos, con el logo de Taber Ministerio de Sordos.", ancho: 206, alto: 206 },
    { imagen: "img/galeria/galeria-05.jpg", descripcion: "Integrante del ministerio haciendo señas durante un servicio de adoración.", ancho: 1120, alto: 1400 },
    { imagen: "img/galeria/galeria-06.jpg", descripcion: "Interpretación en lengua de señas durante un culto, con la bandera de El Salvador al fondo.", ancho: 206, alto: 206 },
    { imagen: "img/galeria/galeria-07.jpg", descripcion: "Afiche del Día Internacional de la Persona Sorda, domingo 13 de septiembre de 2026.", ancho: 206, alto: 206 },
    { imagen: "img/galeria/galeria-08.jpg", descripcion: "Culto con decoración de globos amarillos y negros.", ancho: 206, alto: 206 },
    { imagen: "img/galeria/galeria-09.jpg", descripcion: "Dos personas posan en una celebración de cumpleaños.", ancho: 206, alto: 206 }
  ],

  // Formulario de Google para el registro (el QR está en img/qr-registro.png)
  formularioRegistro: "https://docs.google.com/forms/d/e/1FAIpQLScRnoaiLq2urfZlhhoFAvkXeWjewNflINpdFmkROFseEbQW_Q/viewform",

  // Correo del ministerio (se publica cuando el equipo lo entregue). No se publica teléfono.
  correo: "",

  // Mapa: enlace de inserción de Google Maps (Compartir > Insertar un mapa > copiar el src del iframe)
  mapa: "https://www.google.com/maps?q=13.7269574,-88.9514887&z=17&output=embed",

  // Enlace para abrir la ruta en la app de Google Maps (botón «Cómo llegar»)
  mapaEnlace: "https://maps.app.goo.gl/9NdSd7oknoDCuCjFA",

  // Estructura del ministerio. Si publicarNombres es false, solo se muestran los cargos.
  publicarNombres: true,
  estructura: [
    { cargo: "Pastor coordinador", nombre: "Ulises Martínez" },
    { cargo: "Líder oyente y coordinación evangelística", nombre: "Lourdes Sánchez" },
    { cargo: "Coordinación social", nombre: "Saida Grande" },
    { cargo: "Coordinación bíblica", nombre: "Sintia Díaz de Velásquez" },
    { cargo: "Intérpretes de lengua de señas", detalle: "Un equipo de 6 personas" }
  ],

  // Publicaciones de la sección «Publicaciones». Ejemplo de cada una:
  // { red: "Facebook", titulo: "Título", texto: "Resumen corto", fecha: "2026-10-04", url: "https://..." }
  publicaciones: [],

  // Biblioteca de materiales en PDF. Los archivos van en la carpeta materiales/. Ejemplo de cada uno:
  // { titulo: "Nombre", tipo: "Libro", descripcion: "Descripción breve.", archivo: "materiales/nombre.pdf" }
  materiales: [],

  // Redes sociales: se muestran siempre en la sección «Redes sociales»; el botón aparece cuando tienen enlace
  redes: [
    { nombre: "Facebook", descripcion: "Grupo de Facebook del ministerio.", url: "" },
    { nombre: "TikTok", descripcion: "Cuenta de TikTok del ministerio.", url: "" },
    { nombre: "YouTube", descripcion: "Canal con videos en LESSA: la presentación del ministerio y cómo usar la página.", url: "" }
  ]
};
