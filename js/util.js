// Funciones de apoyo compartidas por el sitio público y el panel.

// Escapa texto para insertarlo en HTML sin riesgo.
export function escapar(texto = "") {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Convierte un texto con líneas en blanco en párrafos cortos.
export function aParrafos(texto = "") {
  return String(texto)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapar(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

// Obtiene el ID de un video de YouTube a partir de cualquier enlace (watch, youtu.be, shorts o embed).
export function idYouTube(enlace = "") {
  const m = String(enlace).match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  return m ? m[1] : "";
}

// Devuelve la foto de Cloudinary optimizada (formato y calidad automáticos, ancho máximo).
export function fotoOptimizada(url = "", ancho = 800) {
  if (!url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${ancho}/`);
}

// Fecha legible en español (acepta Timestamp de Firestore, Date o texto).
export function fechaLegible(valor, opciones = { day: "numeric", month: "long", year: "numeric" }) {
  if (!valor) return "";
  const fecha = typeof valor.toDate === "function" ? valor.toDate() : new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("es-SV", opciones);
}

// Comprueba que un texto sea una dirección web válida (http o https).
export function esEnlaceValido(texto = "") {
  try {
    const u = new URL(texto);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
