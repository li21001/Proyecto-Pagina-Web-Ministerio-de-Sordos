// Panel de administración: protege el acceso y permite gestionar el contenido del sitio.
// HU-17 a HU-26 y HU-28 (registro de materiales).
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, collection, getDocs,
  query, orderBy, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { cloudinaryConfig } from "./config.js";
import { escapar, idYouTube, fotoOptimizada, fechaLegible, esEnlaceValido } from "./util.js";

const $ = (id) => document.getElementById(id);
let cambiosSinGuardar = false;

// ---------- Mensajes ----------
let temporizador;
function avisar(texto, tipo = "exito") {
  const m = $("mensaje");
  m.textContent = texto;
  m.className = `mensaje mensaje--${tipo}`;
  m.hidden = false;
  m.scrollIntoView({ block: "nearest", behavior: "smooth" });
  clearTimeout(temporizador);
  if (tipo === "exito") temporizador = setTimeout(() => { m.hidden = true; }, 6000);
}

function errorAmigable(error) {
  console.error(error);
  if (error?.code === "permission-denied") return "No tienes permiso para hacer este cambio. Vuelve a iniciar sesión.";
  if (error?.code === "unavailable") return "No hay conexión a internet. Revisa tu conexión e inténtalo de nuevo.";
  return "No se pudo guardar. Inténtalo de nuevo en un momento.";
}

// ---------- Ventana de confirmación ----------
function confirmar({ titulo, texto, aceptar = "Sí, continuar", peligro = false, imagen = "" }) {
  return new Promise((resolver) => {
    const d = $("confirmar");
    d.querySelector("[data-titulo]").textContent = titulo;
    d.querySelector("[data-texto]").textContent = texto;
    const img = d.querySelector("[data-imagen]");
    img.hidden = !imagen;
    if (imagen) img.src = imagen;
    const ok = d.querySelector("[data-aceptar]");
    ok.textContent = aceptar;
    ok.classList.toggle("boton--rojo", peligro);
    d.classList.toggle("confirmar--peligro", peligro);
    d.returnValue = "";
    d.addEventListener("close", () => resolver(d.returnValue === "si"), { once: true });
    d.showModal();
    d.querySelector("[data-cancelar]").focus();
  });
}
// Clic fuera de la ventana = cancelar
$("confirmar").addEventListener("click", (e) => { if (e.target.id === "confirmar") e.target.close("no"); });

const SALIR_SIN_GUARDAR = {
  titulo: "Tienes cambios sin guardar",
  texto: "Si sales ahora, se perderá lo que escribiste.",
  aceptar: "Salir sin guardar"
};

// ---------- Acceso (HU-17, HU-18) ----------
onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    location.replace("login.html");
    return;
  }
  try {
    const registro = await getDoc(doc(db, "admins", usuario.uid));
    if (!registro.exists()) {
      await signOut(auth);
      location.replace("login.html?error=permiso");
      return;
    }
  } catch (error) {
    await signOut(auth);
    location.replace("login.html?error=permiso");
    return;
  }
  $("usuario").textContent = usuario.email;
  $("usuario").title = usuario.email;
  if (usuario.displayName) $("usuario-nombre").textContent = usuario.displayName;
  document.body.classList.remove("verificando");
  iniciarPanel();
});

$("cerrar-sesion").addEventListener("click", async () => {
  if (cambiosSinGuardar && !(await confirmar({ ...SALIR_SIN_GUARDAR, aceptar: "Cerrar sesión sin guardar" }))) return;
  cambiosSinGuardar = false;
  await signOut(auth);
  location.replace("login.html?salida=1");
});

// Aviso al salir de la página con cambios sin guardar (HU-20).
window.addEventListener("beforeunload", (e) => {
  if (cambiosSinGuardar) {
    e.preventDefault();
    e.returnValue = "";
  }
});

// ---------- Pestañas ----------
function activarPestanas() {
  const pestanas = [...document.querySelectorAll('[role="tab"]')];
  const mostrarPestana = async (pestana) => {
    if (cambiosSinGuardar && !(await confirmar(SALIR_SIN_GUARDAR))) return false;
    cambiosSinGuardar = false;
    pestanas.forEach((p) => {
      const activa = p === pestana;
      p.setAttribute("aria-selected", String(activa));
      p.tabIndex = activa ? 0 : -1;
      $(p.getAttribute("aria-controls")).hidden = !activa;
    });
    $("mensaje").hidden = true;
    history.replaceState(null, "", `#${pestana.getAttribute("aria-controls")}`);
    if (pestana.getAttribute("aria-controls") === "resumen") cargarResumen();
    window.scrollTo(0, 0);
    return true;
  };
  pestanas.forEach((p, i) => {
    p.addEventListener("click", () => mostrarPestana(p));
    p.addEventListener("keydown", async (e) => {
      const paso = ["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(e.key) ? -1 : 0;
      if (!paso) return;
      const siguiente = pestanas[(i + paso + pestanas.length) % pestanas.length];
      if (await mostrarPestana(siguiente)) siguiente.focus();
    });
  });
  // Botones de «Acciones rápidas» del resumen
  document.querySelectorAll("[data-ir]").forEach((b) => {
    b.addEventListener("click", () => {
      const destino = $(`tab-${b.dataset.ir}`);
      mostrarPestana(destino).then((ok) => { if (ok) destino.focus(); });
    });
  });
  const inicial = pestanas.find((p) => `#${p.getAttribute("aria-controls")}` === location.hash) || pestanas[0];
  mostrarPestana(inicial);
}

function vigilarCambios(formulario) {
  formulario.addEventListener("input", () => { cambiosSinGuardar = true; });
}

// ---------- Lo que el sitio muestra ahora (para no empezar con campos vacíos) ----------
// Se toma de js/contenido.js (window.SITIO), el contenido de prueba del sitio.
let valoresSitio;
function leerValoresSitio() {
  if (valoresSitio) return valoresSitio;
  const s = window.SITIO || {};
  const t = s.textos || {};
  const red = (nombre) => (s.redes || []).find((r) => r.nombre === nombre)?.url || "";
  valoresSitio = {
    resena: t.resena || "", mision: t.mision || "", vision: t.vision || "",
    historia: t.historia || "", culturaSorda: t.culturaSorda || "", direccion: s.direccion || "",
    correo: s.correo || "", formularioQR: s.formularioRegistro || "", mapaUrl: s.mapaEnlace || "",
    facebook: red("Facebook"), tiktok: red("TikTok"), youtube: red("YouTube")
  };
  return valoresSitio;
}

// ---------- Documentos únicos: textos, contacto y videos ----------
async function cargarFormulario(formulario, ruta) {
  const snap = await getDoc(doc(db, ...ruta.split("/")));
  const actuales = leerValoresSitio();
  const datos = snap.exists() ? snap.data() : {};
  [...formulario.elements].forEach((campo) => {
    if (!campo.name) return;
    // Si el panel aún no guardó ese dato, se muestra lo que el sitio tiene ahora.
    campo.value = datos[campo.name] || actuales[campo.name] || "";
  });
}

function datosDe(formulario) {
  const datos = {};
  [...formulario.elements].forEach((campo) => {
    if (campo.name) datos[campo.name] = campo.value.trim();
  });
  return datos;
}

function camposUrlInvalidos(formulario) {
  return [...formulario.querySelectorAll('input[type="url"]')]
    .filter((c) => c.value.trim() && !esEnlaceValido(c.value.trim()));
}

function prepararDocumento(formulario, ruta, mensajeOk, validar) {
  vigilarCambios(formulario);
  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    const malos = camposUrlInvalidos(formulario);
    if (malos.length) {
      avisar(`Revisa el enlace de «${formulario.querySelector(`label[for="${malos[0].id}"]`).textContent}»: debe empezar con https://`, "error");
      malos[0].focus();
      return;
    }
    const datos = datosDe(formulario);
    const problema = validar?.(datos);
    if (problema) { avisar(problema, "error"); return; }
    const boton = e.submitter;
    boton.disabled = true;
    try {
      await setDoc(doc(db, ...ruta.split("/")), { ...datos, actualizado: serverTimestamp() }, { merge: true });
      cambiosSinGuardar = false;
      avisar(mensajeOk);
    } catch (error) {
      avisar(errorAmigable(error), "error");
    } finally {
      boton.disabled = false;
    }
  });
  return cargarFormulario(formulario, ruta);
}

// ---------- Listas: horarios, publicaciones, biblioteca, fechas y líderes ----------
const LISTAS = {
  horarios: {
    titulo: "Horarios de reunión",
    ayuda: "Agrega una fila por reunión. El número de orden decide en qué posición aparece (1 = primero).",
    orden: ["orden", "asc"],
    campos: [
      { id: "dia", etiqueta: "Día", tipo: "select", opciones: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"], requerido: true },
      { id: "actividad", etiqueta: "Actividad", tipo: "text", requerido: true, ejemplo: "Estudio Bíblico" },
      { id: "hora", etiqueta: "Hora", tipo: "text", requerido: true, ejemplo: "6:30 p. m." },
      { id: "orden", etiqueta: "Orden", tipo: "number", requerido: true }
    ],
    resumen: (d) => `<strong>${escapar(d.dia)}</strong> · ${escapar(d.actividad)} · ${escapar(d.hora)}`,
    nombre: "el horario"
  },
  publicaciones: {
    titulo: "Publicaciones",
    ayuda: "Pega el enlace de la publicación en Facebook, TikTok o YouTube. Las más recientes aparecen primero.",
    orden: ["fecha", "desc"],
    campos: [
      { id: "titulo", etiqueta: "Título", tipo: "text", requerido: true, ejemplo: "Culto de aniversario" },
      { id: "red", etiqueta: "Red social", tipo: "select", opciones: ["Facebook", "TikTok", "YouTube"], requerido: true },
      { id: "enlace", etiqueta: "Enlace de la publicación", tipo: "url", requerido: true, ancho: true },
      { id: "texto", etiqueta: "Descripción breve (opcional)", tipo: "textarea" },
      { id: "fecha", etiqueta: "Fecha", tipo: "date", requerido: true, hoy: true }
    ],
    resumen: (d) => `<strong>${escapar(d.titulo)}</strong> · ${escapar(d.red)} · ${escapar(fechaLegible(d.fecha))}`,
    nombre: "la publicación"
  },
  biblioteca: {
    titulo: "Biblioteca de materiales (PDF)",
    ayuda: "Sube el PDF al Google Drive del ministerio, compártelo como «Cualquier persona con el enlace» y pega aquí el enlace.",
    orden: ["titulo", "asc"],
    campos: [
      { id: "titulo", etiqueta: "Título", tipo: "text", requerido: true },
      { id: "tipo", etiqueta: "Tipo", tipo: "select", opciones: ["Libro", "Diccionario", "Otro"], requerido: true },
      { id: "descripcion", etiqueta: "Descripción breve", tipo: "textarea", requerido: true },
      { id: "enlaceDrive", etiqueta: "Enlace del PDF en Google Drive", tipo: "url", requerido: true, ancho: true }
    ],
    resumen: (d) => `<strong>${escapar(d.titulo)}</strong> · ${escapar(d.tipo)}`,
    nombre: "el material"
  },
  fechas: {
    titulo: "Fechas especiales",
    ayuda: "Solo se muestran el día y el mes. Ejemplo: Aniversario del ministerio, 5 de marzo.",
    orden: ["fecha", "asc"],
    campos: [
      { id: "titulo", etiqueta: "Nombre de la fecha", tipo: "text", requerido: true },
      { id: "fecha", etiqueta: "Fecha", tipo: "date", requerido: true },
      { id: "descripcion", etiqueta: "Explicación breve", tipo: "textarea", requerido: true }
    ],
    resumen: (d) => `<strong>${escapar(d.titulo)}</strong> · ${escapar(fechaLegible(d.fecha, { day: "numeric", month: "long" }))}`,
    nombre: "la fecha"
  },
  lideres: {
    titulo: "Estructura del ministerio",
    ayuda: "Esta sección aparece en el sitio solo si hay al menos una persona registrada. No publiques teléfonos ni correos personales.",
    orden: ["orden", "asc"],
    campos: [
      { id: "nombre", etiqueta: "Nombre", tipo: "text", requerido: true },
      { id: "cargo", etiqueta: "Cargo", tipo: "text", requerido: true, ejemplo: "Coordinación bíblica" },
      { id: "fotoUrl", etiqueta: "Enlace de la foto (opcional)", tipo: "url", ancho: true },
      { id: "orden", etiqueta: "Orden", tipo: "number", requerido: true }
    ],
    resumen: (d) => `<strong>${escapar(d.nombre)}</strong> · ${escapar(d.cargo)}`,
    nombre: "la persona"
  }
};

const textoPlano = (html) => { const t = document.createElement("div"); t.innerHTML = html; return t.textContent; };
const hoyISO = () => new Date().toLocaleDateString("en-CA");
const aISO = (v) => (v && typeof v.toDate === "function" ? v.toDate().toLocaleDateString("en-CA") : "");

function campoHTML(nombreLista, c) {
  const id = `${nombreLista}-${c.id}`;
  const req = c.requerido ? " required" : "";
  const ph = c.ejemplo ? ` placeholder="Ejemplo: ${escapar(c.ejemplo)}"` : "";
  let control;
  if (c.tipo === "select") {
    control = `<select id="${id}" name="${c.id}"${req}><option value="">Elige una opción</option>${c.opciones.map((o) => `<option>${escapar(o)}</option>`).join("")}</select>`;
  } else if (c.tipo === "textarea") {
    control = `<textarea id="${id}" name="${c.id}" rows="3"${req}${ph}></textarea>`;
  } else {
    const extra = c.tipo === "number" ? ' min="1" step="1"' : "";
    control = `<input id="${id}" name="${c.id}" type="${c.tipo}"${req}${ph}${extra}>`;
  }
  const ancho = c.tipo === "textarea" || c.ancho ? " campo--ancho" : "";
  return `<div class="campo${ancho}"><label for="${id}">${escapar(c.etiqueta)}</label>${control}</div>`;
}

function crearLista(nombre) {
  const cfg = LISTAS[nombre];
  const seccion = $(nombre);
  seccion.innerHTML = `
    <h1>${escapar(cfg.titulo)}</h1>
    <p class="ayuda">${escapar(cfg.ayuda)}</p>
    <div class="panel__dos">
    <form class="grupo" novalidate>
      <h2 class="grupo__titulo" data-titulo-form>Agregar</h2>
      <div class="campos">
        ${cfg.campos.map((c) => campoHTML(nombre, c)).join("")}
      </div>
      <div class="formulario__botones">
        <button type="submit" class="boton">Guardar</button>
        <button type="button" class="boton boton--claro" data-cancelar hidden>Cancelar edición</button>
      </div>
    </form>
    <div>
      <h2 class="grupo__titulo">Registrados</h2>
      <ul class="panel__lista"></ul>
    </div>
    </div>`;

  const form = seccion.querySelector("form");
  const lista = seccion.querySelector(".panel__lista");
  const cancelar = seccion.querySelector("[data-cancelar]");
  let editando = null;
  let registros = [];
  // Los documentos vacíos (los que Firebase pide al crear la colección) se señalan para borrarlos.
  const resumenDe = (r) => cfg.campos.some((c) => c.id !== "orden" && r[c.id])
    ? cfg.resumen(r)
    : '<em class="panel__vacio-registro">Registro vacío (no se muestra en el sitio). Puedes eliminarlo.</em>';

  const limpiar = () => {
    form.reset();
    editando = null;
    cancelar.hidden = true;
    seccion.querySelector("[data-titulo-form]").textContent = "Agregar";
    cfg.campos.filter((c) => c.hoy).forEach((c) => { form.elements[c.id].value = hoyISO(); });
    cambiosSinGuardar = false;
  };

  const cargar = async () => {
    const snap = await getDocs(query(collection(db, nombre), orderBy(...cfg.orden)));
    registros = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    lista.innerHTML = registros.length
      ? registros.map((r) => `
        <li>
          <span>${resumenDe(r)}</span>
          <span class="panel__botones">
            <button type="button" class="boton boton--claro boton--chico" data-editar="${r.id}">Editar</button>
            <button type="button" class="boton boton--peligro boton--chico" data-eliminar="${r.id}">Eliminar</button>
          </span>
        </li>`).join("")
      : '<li class="vacio">Todavía no hay registros.</li>';
  };

  vigilarCambios(form);
  cancelar.addEventListener("click", limpiar);

  lista.addEventListener("click", async (e) => {
    const idEditar = e.target.dataset.editar;
    const idEliminar = e.target.dataset.eliminar;
    if (idEditar) {
      const r = registros.find((x) => x.id === idEditar);
      cfg.campos.forEach((c) => {
        form.elements[c.id].value = c.tipo === "date" ? aISO(r[c.id]) : (r[c.id] ?? "");
      });
      editando = idEditar;
      cancelar.hidden = false;
      seccion.querySelector("[data-titulo-form]").textContent = "Editar";
      form.scrollIntoView({ behavior: "smooth" });
      form.elements[cfg.campos[0].id].focus();
    }
    if (idEliminar) {
      const r = registros.find((x) => x.id === idEliminar);
      const ok = await confirmar({
        titulo: `¿Eliminar ${cfg.nombre}?`,
        texto: `«${r ? textoPlano(resumenDe(r)) : ""}» dejará de aparecer en el sitio. Esto no se puede deshacer.`,
        aceptar: "Sí, eliminar",
        peligro: true
      });
      if (!ok) return;
      try {
        await deleteDoc(doc(db, nombre, idEliminar));
        if (editando === idEliminar) limpiar();
        await cargar();
        avisar("Eliminado. Ya no aparece en el sitio.");
      } catch (error) {
        avisar(errorAmigable(error), "error");
      }
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const faltante = cfg.campos.find((c) => c.requerido && !form.elements[c.id].value.trim());
    if (faltante) {
      avisar(`Completa el campo «${faltante.etiqueta}».`, "error");
      form.elements[faltante.id].focus();
      return;
    }
    const enlaceMalo = cfg.campos.find((c) => c.tipo === "url" && form.elements[c.id].value.trim() && !esEnlaceValido(form.elements[c.id].value.trim()));
    if (enlaceMalo) {
      avisar(`El «${enlaceMalo.etiqueta}» no es una dirección web válida. Debe empezar con https://`, "error");
      form.elements[enlaceMalo.id].focus();
      return;
    }
    const datos = {};
    cfg.campos.forEach((c) => {
      const v = form.elements[c.id].value.trim();
      if (c.tipo === "number") datos[c.id] = Number(v);
      else if (c.tipo === "date") datos[c.id] = Timestamp.fromDate(new Date(`${v}T12:00:00`));
      else datos[c.id] = v;
    });
    const boton = e.submitter;
    boton.disabled = true;
    try {
      if (editando) await updateDoc(doc(db, nombre, editando), datos);
      else await addDoc(collection(db, nombre), datos);
      const accion = editando ? "Cambios guardados" : "Guardado";
      limpiar();
      await cargar();
      avisar(`${accion}. Ya se ve en el sitio.`);
    } catch (error) {
      avisar(errorAmigable(error), "error");
    } finally {
      boton.disabled = false;
    }
  });

  limpiar();
  return cargar();
}

// ---------- Galería con Cloudinary (HU-22, HU-23) ----------
const TAMANO_MAXIMO = 10 * 1024 * 1024;
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

async function subirACloudinary(archivo) {
  const { cloudName, uploadPreset } = cloudinaryConfig;
  const datos = new FormData();
  datos.append("file", archivo);
  datos.append("upload_preset", uploadPreset);
  datos.append("folder", "galeria");
  const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: datos });
  if (!respuesta.ok) throw new Error(`Cloudinary respondió ${respuesta.status}`);
  return respuesta.json();
}

async function cargarGaleria() {
  const snap = await getDocs(query(collection(db, "galeria"), orderBy("fecha", "desc")));
  const fotos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  $("lista-galeria").innerHTML = fotos.length
    ? fotos.map((f) => `
      <li>
        ${f.url ? `<img src="${escapar(fotoOptimizada(f.url, 300))}" alt="${escapar(f.descripcion)}" loading="lazy">`
          : '<p class="panel__sin-foto">Registro vacío (sin foto). Puedes eliminarlo.</p>'}
        <p>${escapar(f.descripcion || "")}</p>
        <button type="button" class="boton boton--peligro boton--chico" data-eliminar="${f.id}">Eliminar</button>
      </li>`).join("")
    : '<li class="vacio">Todavía no hay fotos.</li>';
}

function prepararGaleria() {
  const form = $("form-galeria");
  vigilarCambios(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const archivo = $("foto").files[0];
    const descripcion = $("descripcion-foto").value.trim();
    if (!archivo) { avisar("Elige una foto.", "error"); return; }
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      avisar("Ese archivo no es una foto. Solo se permiten imágenes JPG, PNG o WEBP (no videos).", "error");
      return;
    }
    if (archivo.size > TAMANO_MAXIMO) {
      avisar(`La foto pesa ${(archivo.size / 1048576).toFixed(1)} MB. El máximo es 10 MB.`, "error");
      return;
    }
    if (!descripcion) { avisar("Escribe una descripción de la foto (ayuda a las personas que no pueden verla).", "error"); return; }
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
      avisar("Falta configurar el servicio de imágenes. Avisa al equipo técnico.", "error");
      return;
    }
    const boton = e.submitter;
    boton.disabled = true;
    avisar("Subiendo la foto…", "info");
    try {
      const subida = await subirACloudinary(archivo);
      await addDoc(collection(db, "galeria"), {
        url: subida.secure_url,
        publicId: subida.public_id,
        descripcion,
        fecha: serverTimestamp()
      });
      form.reset();
      cambiosSinGuardar = false;
      await cargarGaleria();
      avisar("Foto publicada. Ya aparece en la galería.");
    } catch (error) {
      avisar("No se pudo subir la foto. Revisa tu conexión e inténtalo de nuevo.", "error");
      console.error(error);
    } finally {
      boton.disabled = false;
    }
  });

  $("lista-galeria").addEventListener("click", async (e) => {
    const id = e.target.dataset.eliminar;
    if (!id) return;
    const foto = e.target.closest("li").querySelector("img");
    const ok = await confirmar({
      titulo: "¿Eliminar esta foto?",
      texto: "La foto dejará de aparecer en la galería del sitio. Esto no se puede deshacer.",
      aceptar: "Sí, eliminar",
      peligro: true,
      imagen: foto && foto.getAttribute("src") ? foto.src : ""
    });
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "galeria", id));
      await cargarGaleria();
      avisar("Foto eliminada. Ya no aparece en la galería.");
    } catch (error) {
      avisar(errorAmigable(error), "error");
    }
  });

  return cargarGaleria();
}

// ---------- Resumen ----------
async function cargarResumen() {
  $("hoy").textContent = new Date().toLocaleDateString("es-SV", { weekday: "long", day: "numeric", month: "long" })
    .replace(/^./, (l) => l.toUpperCase());
  const contar = async (nombre, campo) => {
    try {
      const snap = await getDocs(collection(db, nombre));
      return snap.docs.map((d) => d.data()).filter((d) => d[campo]);
    } catch (error) {
      console.warn(error);
      return null;
    }
  };
  const [fotos, pubs, mats, horas] = await Promise.all([
    contar("galeria", "url"), contar("publicaciones", "titulo"), contar("biblioteca", "titulo"), contar("horarios", "dia")
  ]);
  [["cifra-galeria", fotos], ["cifra-publicaciones", pubs], ["cifra-biblioteca", mats], ["cifra-horarios", horas]]
    .forEach(([id, lista]) => { $(id).textContent = lista ? lista.length : "–"; });
  const recientes = (fotos || [])
    .sort((a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0))
    .slice(0, 5);
  $("resumen-fotos").innerHTML = recientes.length
    ? recientes.map((f) => `<li><img src="${escapar(fotoOptimizada(f.url, 300))}" alt="${escapar(f.descripcion || "")}" loading="lazy"></li>`).join("")
    : '<li class="vacio">Todavía no hay fotos subidas desde el panel. El sitio muestra las fotos de prueba.</li>';
}

// ---------- Inicio ----------
let iniciado = false;
async function iniciarPanel() {
  if (iniciado) return;
  iniciado = true;
  activarPestanas();
  try {
    await Promise.all([
      prepararDocumento($("form-textos"), "sitio/institucional", "Cambios guardados. Ya se ven en el sitio."),
      prepararDocumento($("form-contacto"), "sitio/contacto", "Contacto guardado. Ya se ve en el sitio."),
      prepararDocumento($("form-videos"), "sitio/videos", "Videos guardados. Ya se ven en el sitio.", (d) => {
        const malo = ["presentacion", "usoSitio"].find((k) => d[k] && !idYouTube(d[k]));
        return malo ? "Ese enlace no es de un video de YouTube. Cópialo desde el botón «Compartir» del video." : "";
      }),
      prepararGaleria(),
      ...Object.keys(LISTAS).map(crearLista)
    ]);
  } catch (error) {
    avisar("No se pudo cargar el contenido. Revisa tu conexión y recarga la página.", "error");
    console.error(error);
  }
}
