// Junta el contenido de prueba (contenido.js) con lo que el ministerio guarda desde el panel
// (Firestore) y después dibuja la página con pagina.js.
// Regla: si el panel tiene datos de una sección, se usan esos; si no, se queda lo de prueba.
// Cada página lee solo lo que necesita. Si Firestore no responde, se muestra lo de prueba.

window.SITIO_CARGANDO = true;
const S = window.SITIO = window.SITIO || {};
const ESPERA_MAXIMA = 6000; // milisegundos

// Qué datos necesita cada página (atributo data-pagina del <body>)
const NECESITA = {
  inicio: ["textos", "videos", "horarios", "galeria", "publicaciones", "biblioteca"],
  publicaciones: ["publicaciones"],
  historia: ["textos", "fechas", "lideres"],
  cultura: ["textos"],
  galeria: ["galeria"],
  registro: [],
  biblioteca: ["biblioteca"],
  redes: ["videos"]
};

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function idYouTube(enlace = "") {
  const m = String(enlace).match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : "";
}
const videoYouTube = (enlace) => (idYouTube(enlace) ? `https://www.youtube-nocookie.com/embed/${idYouTube(enlace)}` : "");
const fotoOptimizada = (url = "", ancho = 800) =>
  url.includes("/upload/") ? url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${ancho}/`) : url;
function aFecha(v) {
  if (!v) return null;
  const f = typeof v.toDate === "function" ? v.toDate() : new Date(v);
  return Number.isNaN(f.getTime()) ? null : f;
}
const lleno = (v) => v !== undefined && v !== null && String(v).trim() !== "";
// Se ignoran los documentos incompletos (por ejemplo, el documento vacío que Firebase
// pide al crear una colección), para que no aparezcan tarjetas en blanco.
const conCampos = (lista, ...campos) => lista.filter((x) => campos.every((c) => lleno(x[c])));

async function leer(necesita) {
  const { db } = await import("./firebase.js");
  const { doc, getDoc, collection, getDocs, query, orderBy } =
    await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js");

  const documento = async (ruta) => {
    const snap = await getDoc(doc(db, ...ruta.split("/")));
    return snap.exists() ? snap.data() : {};
  };
  const lista = async (nombre, campo, dir = "asc") => {
    const snap = await getDocs(query(collection(db, nombre), orderBy(campo, dir)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  };
  // Cada lectura falla por separado: si una sección da error, las demás se muestran igual.
  const seguro = (promesa, vacio) => promesa.catch((e) => { console.warn(e); return vacio; });

  const tareas = {
    contacto: () => seguro(documento("sitio/contacto"), {}),
    textos: () => seguro(documento("sitio/institucional"), {}),
    videos: () => seguro(documento("sitio/videos"), {}),
    horarios: () => seguro(lista("horarios", "orden"), []),
    fechas: () => seguro(lista("fechas", "fecha"), []),
    lideres: () => seguro(lista("lideres", "orden"), []),
    galeria: () => seguro(lista("galeria", "fecha", "desc"), []),
    publicaciones: () => seguro(lista("publicaciones", "fecha", "desc"), []),
    biblioteca: () => seguro(lista("biblioteca", "titulo"), [])
  };
  const nombres = ["contacto", ...necesita];
  const valores = await Promise.all(nombres.map((n) => tareas[n]()));
  return Object.fromEntries(nombres.map((n, i) => [n, valores[i]]));
}

function aplicar(d) {
  if (d.textos) {
    S.textos = S.textos || {};
    ["resena", "mision", "vision", "historia", "culturaSorda"].forEach((k) => {
      if (lleno(d.textos[k])) S.textos[k] = d.textos[k];
    });
  }
  if (d.contacto) {
    const c = d.contacto;
    if (lleno(c.direccion)) S.direccion = c.direccion;
    if (lleno(c.mapaUrl)) S.mapaEnlace = c.mapaUrl;
    if (lleno(c.correo)) S.correo = c.correo;
    if (lleno(c.formularioQR)) S.formularioRegistro = c.formularioQR;
    const redes = { Facebook: c.facebook, TikTok: c.tiktok, YouTube: c.youtube };
    (S.redes || []).forEach((r) => { if (lleno(redes[r.nombre])) r.url = redes[r.nombre]; });
  }
  if (d.videos) {
    if (videoYouTube(d.videos.presentacion)) {
      S.videoPresentacion = videoYouTube(d.videos.presentacion);
      S.videoPoster = "";
      S.videoSubtitulos = "";
    }
    if (videoYouTube(d.videos.usoSitio)) S.videoUso = videoYouTube(d.videos.usoSitio);
  }
  const horarios = conCampos(d.horarios || [], "dia", "actividad", "hora");
  if (horarios.length) S.horarios = horarios.map(({ dia, actividad, hora }) => ({ dia, actividad, hora }));

  const fechas = conCampos(d.fechas || [], "titulo", "fecha");
  if (fechas.length) {
    S.fechas = fechas.map((f) => {
      const fecha = aFecha(f.fecha);
      return { titulo: f.titulo, descripcion: f.descripcion || "",
        dia: fecha ? String(fecha.getDate()) : "", mes: fecha ? MESES[fecha.getMonth()] : "" };
    });
  }
  const lideres = conCampos(d.lideres || [], "nombre", "cargo");
  if (lideres.length) {
    S.estructura = lideres.map((l) => ({ nombre: l.nombre, cargo: l.cargo, foto: l.fotoUrl ? fotoOptimizada(l.fotoUrl, 240) : "" }));
  }
  const galeria = conCampos(d.galeria || [], "url");
  if (galeria.length) {
    S.galeria = galeria.map((f) => ({ imagen: fotoOptimizada(f.url, 800), grande: fotoOptimizada(f.url, 1600), descripcion: f.descripcion || "" }));
  }
  const publicaciones = conCampos(d.publicaciones || [], "titulo", "enlace");
  if (publicaciones.length) {
    S.publicaciones = publicaciones.map((p) => {
      const f = aFecha(p.fecha);
      return { red: p.red, titulo: p.titulo, texto: p.texto, fecha: f ? f.toLocaleDateString("en-CA") : "", url: p.enlace };
    });
  }
  const biblioteca = conCampos(d.biblioteca || [], "titulo", "enlaceDrive");
  if (biblioteca.length) {
    S.materiales = biblioteca.map((m) => ({ titulo: m.titulo, tipo: m.tipo, descripcion: m.descripcion, archivo: m.enlaceDrive }));
  }
}

function dibujar() {
  if (window.SITIO_DIBUJADO) return;
  const s = document.createElement("script");
  s.src = (document.body.dataset.raiz || "") + "js/pagina.js";
  document.body.appendChild(s);
}

async function iniciar() {
  try {
    const necesita = NECESITA[document.body.dataset.pagina] || [];
    const tiempo = new Promise((_, no) => setTimeout(() => no(new Error("Firestore tardó demasiado")), ESPERA_MAXIMA));
    aplicar(await Promise.race([leer(necesita), tiempo]));
  } catch (error) {
    console.warn("Se muestra el contenido de prueba:", error);
  } finally {
    dibujar();
  }
}

iniciar();
