// Inicio de sesión y recuperación de contraseña del panel (HU-17, HU-19).
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const $ = (id) => document.getElementById(id);

// Cada error dice qué pasó y qué hacer. Por seguridad, Firebase no dice si lo incorrecto
// es el correo o la contraseña, así que ese mensaje da pistas para revisar los dos.
const NO_COINCIDE = ["El correo o la contraseña no coinciden.",
  "Revisa que el correo esté bien escrito y que la contraseña tenga las mayúsculas y minúsculas correctas. Toca «Mostrar» para ver lo que escribiste.", "clave"];
const ERRORES = {
  "auth/invalid-credential": NO_COINCIDE,
  "auth/wrong-password": NO_COINCIDE,
  "auth/user-not-found": NO_COINCIDE,
  "auth/invalid-email": ["El correo no es válido.", "Debe llevar @ y un dominio, por ejemplo: nombre@gmail.com.", "correo"],
  "auth/missing-password": ["Falta la contraseña.", "Escríbela en el recuadro «Contraseña».", "clave"],
  "auth/too-many-requests": ["Se bloqueó por muchos intentos seguidos.", "Espera unos minutos y vuelve a intentarlo, o toca «¿Olvidaste tu contraseña?»."],
  "auth/network-request-failed": ["No hay conexión a internet.", "Revisa el wifi o los datos del celular e inténtalo de nuevo."],
  "auth/user-disabled": ["Esta cuenta está desactivada.", "Habla con la persona encargada del sitio."]
};

function mostrar(texto, tipo = "info", detalle = "") {
  const m = $("mensaje");
  m.textContent = texto;
  if (detalle) {
    const d = document.createElement("small");
    d.textContent = detalle;
    m.appendChild(d);
  }
  m.className = `mensaje mensaje--${tipo}`;
  m.hidden = false;
}

// Marca en rojo el recuadro con el problema y pone el cursor ahí.
function marcar(...ids) {
  ["correo", "clave", "correo-recuperar"].forEach((id) => $(id).removeAttribute("aria-invalid"));
  ids.filter(Boolean).forEach((id) => $(id).setAttribute("aria-invalid", "true"));
  if (ids[0]) $(ids[0]).focus();
}

function error(clave, idCorreo = "correo") {
  const [texto, detalle, campo] = clave;
  mostrar(texto, "error", detalle);
  marcar(campo === "correo" ? idCorreo : campo);
}

const correoValido = (c) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c);

// Revisa el correo antes de enviarlo y explica qué le falta.
function revisarCorreo(correo, id) {
  if (!correo) return ["Falta el correo.", "Escríbelo en el recuadro «Correo».", id];
  if (!correo.includes("@")) return [`El correo «${correo}» está incompleto.`, "Le falta la @ y el final, por ejemplo: nombre@gmail.com.", id];
  if (!correoValido(correo)) return [`El correo «${correo}» está incompleto.`, "Después de la @ debe ir el dominio, por ejemplo: @gmail.com.", id];
  return null;
}

// Aviso de mayúsculas activadas mientras se escribe la contraseña.
const avisoMayus = document.createElement("p");
avisoMayus.className = "aviso-mayus";
avisoMayus.id = "aviso-mayus";
avisoMayus.textContent = "Tienes activadas las mayúsculas (Bloq Mayús).";
avisoMayus.hidden = true;
$("clave").closest(".clave").after(avisoMayus);
$("clave").setAttribute("aria-describedby", "aviso-mayus");
["keydown", "keyup"].forEach((ev) => $("clave").addEventListener(ev, (e) => {
  if (e.getModifierState) avisoMayus.hidden = !e.getModifierState("CapsLock");
}));
["correo", "clave", "correo-recuperar"].forEach((id) =>
  $(id).addEventListener("input", () => $(id).removeAttribute("aria-invalid")));

function cambiarFormulario(recuperar) {
  $("form-entrar").hidden = recuperar;
  $("form-recuperar").hidden = !recuperar;
  $("mensaje").hidden = true;
  if (recuperar) {
    $("correo-recuperar").value = $("correo").value;
    $("correo-recuperar").focus();
  } else {
    $("correo").focus();
  }
}

// Si ya hay una sesión abierta, pasa directo al panel.
onAuthStateChanged(auth, (usuario) => {
  if (usuario) location.replace("index.html");
});

const parametros = new URLSearchParams(location.search);
if (parametros.get("salida") === "1") mostrar("Cerraste sesión correctamente.", "exito");
if (parametros.get("error") === "permiso") mostrar("Esta cuenta no tiene permiso para usar el panel.", "error", "Puede que haya sido desactivada. Pide a un encargado que la reactive en Panel → Usuarios.");

$("ver-clave").addEventListener("click", (e) => {
  const visible = $("clave").type === "text";
  $("clave").type = visible ? "password" : "text";
  e.currentTarget.textContent = visible ? "Mostrar" : "Ocultar";
  e.currentTarget.setAttribute("aria-pressed", String(!visible));
});

$("olvide").addEventListener("click", () => cambiarFormulario(true));
$("volver").addEventListener("click", () => cambiarFormulario(false));

$("form-entrar").addEventListener("submit", async (e) => {
  e.preventDefault();
  const correo = $("correo").value.trim();
  const clave = $("clave").value;
  if (!correo && !clave) {
    mostrar("Faltan el correo y la contraseña.", "error", "Escribe los dos y vuelve a tocar «Entrar al panel».");
    marcar("correo", "clave");
    return;
  }
  const problema = revisarCorreo(correo, "correo");
  if (problema) { error(problema); return; }
  if (!clave) { error(ERRORES["auth/missing-password"]); return; }
  const boton = e.submitter;
  boton.disabled = true;
  mostrar("Entrando…");
  try {
    await signInWithEmailAndPassword(auth, correo, clave);
    location.replace("index.html");
  } catch (e2) {
    error(ERRORES[e2.code] || ["No se pudo iniciar sesión.", `Inténtalo de nuevo. Si sigue pasando, avisa a la persona encargada (código: ${e2.code || "desconocido"}).`]);
    boton.disabled = false;
  }
});

$("form-recuperar").addEventListener("submit", async (e) => {
  e.preventDefault();
  const correo = $("correo-recuperar").value.trim();
  const problema = revisarCorreo(correo, "correo-recuperar");
  if (problema) { error(problema, "correo-recuperar"); return; }
  try {
    await sendPasswordResetEmail(auth, correo);
    mostrar("Listo. Si el correo está registrado, recibirás un enlace para crear una contraseña nueva. Revisa también la carpeta de spam.", "exito");
  } catch (e2) {
    error(ERRORES[e2.code] || ["No se pudo enviar el enlace.", `Inténtalo de nuevo (código: ${e2.code || "desconocido"}).`], "correo-recuperar");
  }
});
