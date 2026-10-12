// Sitio público: lee el contenido de Firestore y lo muestra en cada sección.
import { db } from "./firebase.js";
import {
  doc, getDoc, collection, getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { escapar, aParrafos, idYouTube, fotoOptimizada, fechaLegible } from "./util.js";

const $ = (id) => document.getElementById(id);

const ICONO = {
  calendario: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  reloj: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  correo: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  enlace: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  libro: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/></svg>',
  estrella: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>'
};

async function leerDocumento(ruta) {
  const snap = await getDoc(doc(db, ...ruta.split("/")));
  return snap.exists() ? snap.data() : {};
}

async function leerColeccion(nombre, campoOrden, direccion = "asc") {
  const snap = await getDocs(query(collection(db, nombre), orderBy(campoOrden, direccion)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function vacio(mensaje) {
  return `<li class="vacio">${escapar(mensaje)}</li>`;
}

// --- Textos institucionales (HU-01, 02, 06, 08) ---
function mostrarTextos(t) {
  $("resena").innerHTML = aParrafos(t.resena) || "<p>Pronto compartiremos nuestra reseña.</p>";
  $("resena").removeAttribute("data-cargando");
  $("mision").innerHTML = aParrafos(t.mision);
  $("vision").innerHTML = aParrafos(t.vision);
  $("historia-texto").innerHTML = aParrafos(t.historia);
  $("cultura-texto").innerHTML = aParrafos(t.culturaSorda);
}

// --- Contacto, mapa, grupo de Facebook, redes y formulario (HU-04, 05, 13, 14, 27) ---
function mostrarContacto(c) {
  const direccion = c.direccion || "Tabernáculo Bíblico Bautista Amigos de Israel, Cojutepeque, El Salvador";
  $("direccion").textContent = direccion;
  $("mapa").src = `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`;
  $("enlace-ruta").href = c.mapaUrl ||
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccion)}`;

  const redes = [
    ["Facebook", c.facebook],
    ["TikTok", c.tiktok],
    ["YouTube", c.youtube]
  ].filter(([, url]) => url);

  const contacto = [];
  if (c.correo) {
    contacto.push(`<li>${ICONO.correo}<a href="mailto:${escapar(c.correo)}">${escapar(c.correo)}</a></li>`);
  }
  redes.forEach(([nombre, url]) => {
    contacto.push(`<li>${ICONO.enlace}<a href="${escapar(url)}" target="_blank" rel="noopener">${nombre} del ministerio</a></li>`);
  });
  $("lista-contacto").innerHTML = contacto.join("") || vacio("Pronto publicaremos nuestros medios de contacto.");

  $("lista-redes").innerHTML = redes
    .map(([nombre, url]) => `<li><a href="${escapar(url)}" target="_blank" rel="noopener">${ICONO.enlace}${nombre}</a></li>`)
    .join("");

  if (c.facebook) {
    $("enlace-grupo").href = c.facebook;
    $("enlace-grupo").hidden = false;
  }
  if (c.formularioQR) {
    $("enlace-formulario").href = c.formularioQR;
    $("enlace-formulario").hidden = false;
  }
}

// --- Videos en LESSA (HU-15, 16) ---
function insertarVideo(contenedor, enlace) {
  const id = idYouTube(enlace);
  if (!id) {
    contenedor.innerHTML = '<p class="video__pronto">Video en preparación.</p>';
    return;
  }
  const titulo = escapar(contenedor.dataset.titulo || "Video en LESSA");
  contenedor.innerHTML =
    `<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${titulo}" loading="lazy"
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
}

function mostrarVideos(v) {
  insertarVideo($("video-presentacion"), v.presentacion);
  insertarVideo($("video-presentacion-2"), v.presentacion);
  insertarVideo($("video-uso"), v.usoSitio);
}

// --- Horarios (HU-03) ---
function mostrarHorarios(lista) {
  $("lista-horarios").innerHTML = lista.length
    ? lista.map((h) => `
      <li class="horario">
        <p class="horario__dia">${ICONO.calendario}${escapar(h.dia)}</p>
        <p class="horario__actividad">${escapar(h.actividad)}</p>
        <p class="horario__hora">${ICONO.reloj}${escapar(h.hora)}</p>
      </li>`).join("")
    : vacio("Pronto publicaremos los horarios de reunión.");
}

// --- Fechas conmemorativas (HU-07) ---
function mostrarFechas(lista) {
  $("lista-fechas").innerHTML = lista.length
    ? lista.map((f) => `
      <li class="fecha">
        ${ICONO.estrella}
        <div>
          <p class="fecha__titulo">${escapar(f.titulo)}</p>
          <p class="fecha__dia">${escapar(fechaLegible(f.fecha, { day: "numeric", month: "long" }))}</p>
          <p>${escapar(f.descripcion)}</p>
        </div>
      </li>`).join("")
    : vacio("Pronto publicaremos nuestras fechas especiales.");
}

// --- Líderes (HU-09, opcional: la sección solo aparece si hay datos) ---
function mostrarLideres(lista) {
  if (!lista.length) return;
  $("lista-lideres").innerHTML = lista.map((l) => `
    <li class="lider">
      ${l.fotoUrl ? `<img src="${escapar(fotoOptimizada(l.fotoUrl, 240))}" alt="Foto de ${escapar(l.nombre)}" loading="lazy">` : ""}
      <p class="lider__nombre">${escapar(l.nombre)}</p>
      <p>${escapar(l.cargo)}</p>
    </li>`).join("");
  $("bloque-lideres").hidden = false;
}

// --- Galería y visor (HU-10, 11) ---
function mostrarGaleria(lista) {
  const contenedor = $("lista-galeria");
  if (!lista.length) {
    contenedor.innerHTML = vacio("Aún no hay fotos. ¡Pronto compartiremos momentos del ministerio!");
    return;
  }
  contenedor.innerHTML = lista.map((f, i) => `
    <li>
      <button type="button" class="galeria__foto" data-indice="${i}" aria-label="Ampliar foto: ${escapar(f.descripcion)}">
        <img src="${escapar(fotoOptimizada(f.url, 600))}" alt="${escapar(f.descripcion)}" loading="lazy">
      </button>
    </li>`).join("");

  const visor = $("visor");
  contenedor.addEventListener("click", (e) => {
    const boton = e.target.closest("[data-indice]");
    if (!boton) return;
    const foto = lista[Number(boton.dataset.indice)];
    $("visor-imagen").src = fotoOptimizada(foto.url, 1600);
    $("visor-imagen").alt = foto.descripcion || "";
    $("visor-texto").textContent = foto.descripcion || "";
    visor.showModal();
  });
  visor.querySelector("[data-cerrar]").addEventListener("click", () => visor.close());
  visor.addEventListener("click", (e) => { if (e.target === visor) visor.close(); });
}

// --- Publicaciones (HU-12) ---
function mostrarPublicaciones(lista) {
  $("lista-publicaciones").innerHTML = lista.length
    ? lista.map((p) => `
      <li class="publicacion">
        <a href="${escapar(p.enlace)}" target="_blank" rel="noopener">
          <span class="publicacion__red">${escapar(p.red)}</span>
          <span class="publicacion__titulo">${escapar(p.titulo)}</span>
          ${p.texto ? `<span class="publicacion__texto">${escapar(p.texto)}</span>` : ""}
          <span class="publicacion__fecha">${escapar(fechaLegible(p.fecha))}</span>
        </a>
      </li>`).join("")
    : vacio("Aún no hay publicaciones.");
}

// --- Biblioteca (HU-28) ---
function mostrarBiblioteca(lista) {
  $("lista-biblioteca").innerHTML = lista.length
    ? lista.map((m) => `
      <li class="material">
        ${ICONO.libro}
        <div>
          <p class="material__tipo">${escapar(m.tipo || "Material")}</p>
          <p class="material__titulo">${escapar(m.titulo)}</p>
          <p>${escapar(m.descripcion)}</p>
          <a class="boton boton--claro" href="${escapar(m.enlaceDrive)}" target="_blank" rel="noopener">
            Abrir PDF<span class="solo-lectores"> de ${escapar(m.titulo)} (se abre en una pestaña nueva)</span>
          </a>
        </div>
      </li>`).join("")
    : vacio("Pronto compartiremos materiales en PDF.");
}

// --- Menú en celular ---
function activarMenu() {
  const boton = document.querySelector(".menu-boton");
  const menu = $("menu");
  boton.addEventListener("click", () => {
    const abierto = boton.getAttribute("aria-expanded") === "true";
    boton.setAttribute("aria-expanded", String(!abierto));
    menu.classList.toggle("menu--abierto", !abierto);
  });
  menu.addEventListener("click", (e) => {
    if (e.target.matches("a")) {
      boton.setAttribute("aria-expanded", "false");
      menu.classList.remove("menu--abierto");
    }
  });
}

async function iniciar() {
  activarMenu();
  try {
    const [textos, contacto, videos, horarios, fechas, lideres, galeria, publicaciones, biblioteca] =
      await Promise.all([
        leerDocumento("sitio/institucional"),
        leerDocumento("sitio/contacto"),
        leerDocumento("sitio/videos"),
        leerColeccion("horarios", "orden"),
        leerColeccion("fechas", "fecha"),
        leerColeccion("lideres", "orden"),
        leerColeccion("galeria", "fecha", "desc"),
        leerColeccion("publicaciones", "fecha", "desc"),
        leerColeccion("biblioteca", "titulo")
      ]);
    mostrarTextos(textos);
    mostrarContacto(contacto);
    mostrarVideos(videos);
    mostrarHorarios(horarios);
    mostrarFechas(fechas);
    mostrarLideres(lideres);
    mostrarGaleria(galeria);
    mostrarPublicaciones(publicaciones);
    mostrarBiblioteca(biblioteca);
  } catch (error) {
    console.error(error);
    const aviso = $("aviso-error");
    aviso.textContent = "No pudimos cargar el contenido en este momento. Revisa tu conexión e inténtalo de nuevo.";
    aviso.hidden = false;
    $("resena").textContent = "";
  }
}

iniciar();
