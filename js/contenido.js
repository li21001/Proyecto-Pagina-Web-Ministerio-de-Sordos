/* Contenido de prueba del sitio.
   Lo que se guarde desde el panel de administración reemplaza estos valores;
   si el panel no tiene datos de una sección, se muestra lo que está aquí.
   Deja en blanco ("") lo que todavía no esté listo: el sitio mostrará un aviso. */
window.SITIO = {
  // Textos institucionales. Deja una línea en blanco (\n\n) para separar párrafos.
  textos: {
    resena: "El Ministerio de Sordos del Tabernáculo Bíblico Bautista «Amigos de Israel» es un espacio donde las personas sordas pueden disfrutar de la Palabra de Dios, alabar y adorar. Acompañamos a la comunidad sorda con estudios bíblicos, cultos con interpretación en Lengua de Señas Salvadoreña (LESSA) y actividades de convivencia.",
    mision: "Tener un espacio donde todas las personas sordas tengan la oportunidad de disfrutar de la Palabra de Dios, alabar y adorar.",
    vision: "Alcanzar a cada persona sorda que visita nuestra iglesia o nos sigue en redes sociales, y llegar a ser un referente para la comunidad sorda en la ciudad de Cojutepeque.",
    historia: "El Ministerio de Sordos nació el 5 de marzo de 2008 en el corazón de la Licda. Gloria Orellana, maestra de la escuela de sordos de Cojutepeque, quien junto a los hermanos Miguel Rivera, Yesica Sánchez y otros servidores asumió el compromiso de romper las barreras de la comunicación.\n\nSu primer alumno fue un estudiante de la escuela de sordos de la ciudad y, con el tiempo, se fueron sumando más personas. Desde 2021 el ministerio cuenta con una estructura organizada, con coordinaciones social, evangelística y bíblica, y un equipo de seis intérpretes de lengua de señas.",
    culturaSorda: ""
  },

  // Video de presentación: un archivo .mp4 de la carpeta video/ o un enlace de YouTube
  videoPresentacion: "video/presentacion.mp4",
  videoPoster: "video/presentacion.jpg",
  videoSubtitulos: "",
  // Video «Cómo usar esta página» (YouTube). Aparece en Redes cuando tenga enlace.
  videoUso: "",

  // Horarios de reunión
  horarios: [
    { dia: "Miércoles", actividad: "Estudio Bíblico", hora: "6:30 p. m." },
    { dia: "Viernes", actividad: "Adoración y Milagros", hora: "6:00 p. m." },
    { dia: "Domingo", actividad: "Cultos", hora: "7:00 a. m., 9:00 a. m. y 5:00 p. m." }
  ],

  // Dirección y mapa
  direccion: "Tabernáculo Bíblico Bautista «Amigos de Israel»\nCojutepeque",
  mapa: "https://www.google.com/maps?q=13.7269574,-88.9514887&z=17&output=embed",
  mapaEnlace: "https://maps.app.goo.gl/9NdSd7oknoDCuCjFA",

  // Correo del ministerio. No se publica teléfono.
  correo: "",

  // Formulario de Google para el registro (el QR está en img/qr-registro.png)
  formularioRegistro: "https://docs.google.com/forms/d/e/1FAIpQLScRnoaiLq2urfZlhhoFAvkXeWjewNflINpdFmkROFseEbQW_Q/viewform",

  // Fechas especiales: día (número o vacío) y mes
  fechas: [
    { titulo: "Aniversario del ministerio", dia: "5", mes: "marzo", descripcion: "Fundado en 2008." },
    { titulo: "Día Internacional de las Personas Sordas", dia: "", mes: "septiembre", descripcion: "Se celebra durante la Semana Internacional de las Personas Sordas." }
  ],

  // Estructura del ministerio. Si publicarNombres es false, solo se muestran los cargos.
  publicarNombres: true,
  estructura: [
    { cargo: "Pastor coordinador", nombre: "Ulises Martínez" },
    { cargo: "Líder oyente y coordinación evangelística", nombre: "Lourdes Sánchez" },
    { cargo: "Coordinación social", nombre: "Saida Grande" },
    { cargo: "Coordinación bíblica", nombre: "Sintia Díaz de Velásquez" },
    { cargo: "Intérpretes de lengua de señas", detalle: "Un equipo de 6 personas" }
  ],

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

  // Publicaciones. Ejemplo de cada una:
  // { red: "Facebook", titulo: "Título", texto: "Resumen corto", fecha: "2026-10-04", url: "https://..." }
  publicaciones: [],

  // Biblioteca de materiales en PDF. Ejemplo de cada uno:
  // { titulo: "Nombre", tipo: "Libro", descripcion: "Descripción breve.", archivo: "materiales/nombre.pdf" }
  materiales: [],

  // Redes sociales: el botón aparece cuando tienen enlace
  redes: [
    { nombre: "Facebook", descripcion: "Grupo de Facebook del ministerio.", url: "" },
    { nombre: "TikTok", descripcion: "Cuenta de TikTok del ministerio.", url: "" },
    { nombre: "YouTube", descripcion: "Canal con videos en LESSA: la presentación del ministerio y cómo usar la página.", url: "" }
  ]
};
