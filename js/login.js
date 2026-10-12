// Inicio de sesión y recuperación de contraseña del panel (HU-17, HU-19).
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const $ = (id) => document.getElementById(id);

const ERRORES = {
  "auth/invalid-credential": "El correo o la contraseña no son correctos.",
  "auth/wrong-password": "El correo o la contraseña no son correctos.",
  "auth/user-not-found": "El correo o la contraseña no son correctos.",
  "auth/invalid-email": "Escribe un correo válido, por ejemplo: nombre@gmail.com.",
  "auth/missing-password": "Escribe la contraseña.",
  "auth/too-many-requests": "Hubo muchos intentos. Espera unos minutos y vuelve a intentarlo.",
  "auth/network-request-failed": "No hay conexión a internet. Revisa tu conexión e inténtalo de nuevo.",
  "auth/user-disabled": "Esta cuenta está desactivada."
};

function mostrar(texto, tipo = "info") {
  const m = $("mensaje");
  m.textContent = texto;
  m.className = `mensaje mensaje--${tipo}`;
  m.hidden = false;
}

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
if (parametros.get("error") === "permiso") mostrar("Esta cuenta no tiene permiso para usar el panel.", "error");

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
  if (!correo || !clave) {
    mostrar("Escribe el correo y la contraseña.", "error");
    return;
  }
  const boton = e.submitter;
  boton.disabled = true;
  mostrar("Entrando…");
  try {
    await signInWithEmailAndPassword(auth, correo, clave);
    location.replace("index.html");
  } catch (error) {
    mostrar(ERRORES[error.code] || "No se pudo iniciar sesión. Inténtalo de nuevo.", "error");
    boton.disabled = false;
  }
});

$("form-recuperar").addEventListener("submit", async (e) => {
  e.preventDefault();
  const correo = $("correo-recuperar").value.trim();
  if (!correo) {
    mostrar("Escribe el correo del panel.", "error");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, correo);
    mostrar("Listo. Si el correo está registrado, recibirás un enlace para crear una contraseña nueva. Revisa también la carpeta de spam.", "exito");
  } catch (error) {
    mostrar(ERRORES[error.code] || "No se pudo enviar el enlace. Inténtalo de nuevo.", "error");
  }
});
