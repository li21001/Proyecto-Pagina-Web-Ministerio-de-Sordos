// Junta el contenido de prueba (contenido.js) con lo que el ministerio guarda desde el panel
// (Firestore) y después dibuja la página con principal.js.
// Regla: si el panel tiene datos de una sección, se usan esos; si no, se queda lo de prueba.
// Si Firestore no responde, la página se dibuja igual con el contenido de prueba.

window.SITIO_CARGANDO = true;
const S = window.SITIO = window.SITIO || {};
const $ = (id) => document.getElementById(id);
const ESPERA_MAXIMA = 6000; // milisegundos

function escapar(t = "") {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function parrafos(t = "") {
  return String(t).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${escapar(p).replace(/\n/g, "<br>")}</p>`).join("");
}
function idYouTube(enlace = "") {
  const m = String(enlace).match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : "";
}
function videoYouTube(enlace) {
  const id = idYouTube(enlace);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
}
function fotoOptimizada(url = "", ancho = 800) {
  return url.includes("/upload/") ? url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${ancho}/`) : url;
}
function aFecha(v) {
  if (!v) return null;
  const f = typeof v.toDate === "function" ? v.toDate() : new Date(v);
  return Number.isNaN(f.getTime()) ? null : f;
}
const aISO = (v) => { const f = aFecha(v); return f ? f.toLocaleDateString("en-CA") : ""; };

const ICONO_RELOJ = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const ICONO_CALENDARIO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';

// ---------- Leer Firestore ----------
async function leerTodo() {
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

  const [textos, contacto, videos, horarios, fechas, lideres, galeria, publicaciones, biblioteca] =
    await Promise.all([
      seguro(documento("sitio/institucional"), {}),
      seguro(documento("sitio/contacto"), {}),
      seguro(documento("sitio/videos"), {}),
      seguro(lista("horarios", "orden"), []),
      seguro(lista("fechas", "fecha"), []),
      seguro(lista("lideres", "orden"), []),
      seguro(lista("galeria", "fecha", "desc"), []),
      seguro(lista("publicaciones", "fecha", "desc"), []),
      seguro(lista("biblioteca", "titulo"), [])
    ]);
  // Se ignoran los documentos incompletos (por ejemplo, el documento vacío que Firebase
  // pide al crear una colección), para que no aparezcan tarjetas en blanco.
  const lleno = (v) => v !== undefined && v !== null && String(v).trim() !== "";
  const conCampos = (l, ...campos) => l.filter((x) => campos.every((c) => lleno(x[c])));
  return {
    textos, contacto, videos,
    horarios: conCampos(horarios, "dia", "actividad", "hora"),
    fechas: conCampos(fechas, "titulo", "fecha"),
    lideres: conCampos(lideres, "nombre", "cargo"),
    galeria: conCampos(galeria, "url"),
    publicaciones: conCampos(publicaciones, "titulo", "enlace"),
    biblioteca: conCampos(biblioteca, "titulo", "enlaceDrive")
  };
}

// ---------- Aplicar lo del panel ----------
function aplicar(d) {
  // Textos institucionales: reemplazan el texto escrito en index.html
  const t = d.textos;
  if (t.resena) $("resena").innerHTML = parrafos(t.resena);
  if (t.mision) $("mision-texto").innerHTML = parrafos(t.mision);
  if (t.vision) $("vision-texto").innerHTML = parrafos(t.vision);
  if (t.historia) $("historia-texto").innerHTML = parrafos(t.historia);
  if (t.culturaSorda) {
    $("cultura-texto").innerHTML = parrafos(t.culturaSorda);
    $("cultura-texto").hidden = false;
  }

  // Contacto, redes y formulario
  const c = d.contacto;
  if (c.direccion) $("direccion").innerHTML = escapar(c.direccion).replace(/\n/g, "<br>");
  if (c.mapaUrl) S.mapaEnlace = c.mapaUrl;
  if (c.correo) S.correo = c.correo;
  if (c.formularioQR) S.formularioRegistro = c.formularioQR;
  const redesPanel = { Facebook: c.facebook, TikTok: c.tiktok, YouTube: c.youtube };
  (S.redes || []).forEach((r) => { if (redesPanel[r.nombre]) r.url = redesPanel[r.nombre]; });

  // Videos (YouTube)
  const v = d.videos;
  if (videoYouTube(v.presentacion)) {
    S.videoPresentacion = videoYouTube(v.presentacion);
    S.videoPoster = "";
    S.videoSubtitulos = "";
  }
  if (videoYouTube(v.usoSitio)) {
    $("video-uso").innerHTML = `<iframe src="${videoYouTube(v.usoSitio)}" title="Video en LESSA: cómo usar esta página" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    $("bloque-uso").hidden = false;
  }

  // Horarios
  if (d.horarios.length) {
    $("lista-horarios").innerHTML = d.horarios.map((h) => `
      <li class="horario">
        <p class="horario__dia">${escapar(h.dia)}</p>
        <p class="horario__actividad">${escapar(h.actividad)}</p>
        <p class="horario__hora">${ICONO_RELOJ}${escapar(h.hora)}</p>
      </li>`).join("");
  }

  // Fechas especiales (solo día y mes)
  if (d.fechas.length) {
    $("lista-fechas").innerHTML = d.fechas.map((f) => {
      const fecha = aFecha(f.fecha);
      const dia = fecha ? fecha.toLocaleDateString("es-SV", { day: "numeric", month: "long" }) : "";
      return `<li class="fecha">${ICONO_CALENDARIO}<div>
        <p class="fecha__titulo">${escapar(f.titulo)}</p>
        <p class="fecha__dia">${escapar(dia)}</p>
        ${f.descripcion ? `<p>${escapar(f.descripcion)}</p>` : ""}
      </div></li>`;
    }).join("");
  }

  // Estructura del ministerio (líderes)
  if (d.lideres.length) {
    S.estructura = d.lideres.map((l) => ({
      cargo: l.cargo, nombre: l.nombre, foto: l.fotoUrl ? fotoOptimizada(l.fotoUrl, 240) : ""
    }));
  }

  // Galería (fotos subidas a Cloudinary desde el panel)
  if (d.galeria.length) {
    S.galeria = d.galeria.map((f) => ({
      imagen: fotoOptimizada(f.url, 800),
      grande: fotoOptimizada(f.url, 1600),
      descripcion: f.descripcion || ""
    }));
  }

  // Publicaciones
  if (d.publicaciones.length) {
    S.publicaciones = d.publicaciones.map((p) => ({
      red: p.red, titulo: p.titulo, texto: p.texto, fecha: aISO(p.fecha), url: p.enlace
    }));
  }

  // Biblioteca (PDF en Google Drive)
  if (d.biblioteca.length) {
    S.materiales = d.biblioteca.map((m) => ({
      titulo: m.titulo, tipo: m.tipo, descripcion: m.descripcion, archivo: m.enlaceDrive
    }));
  }
}

function dibujar() {
  if (window.SITIO_DIBUJADO) return;
  const s = document.createElement("script");
  s.src = "js/principal.js";
  document.body.appendChild(s);
}

async function iniciar() {
  try {
    const tiempo = new Promise((_, no) => setTimeout(() => no(new Error("Firestore tardó demasiado")), ESPERA_MAXIMA));
    const datos = await Promise.race([leerTodo(), tiempo]);
    aplicar(datos);
  } catch (error) {
    console.warn("Se muestra el contenido de prueba:", error);
  } finally {
    dibujar();
  }
}

iniciar();
