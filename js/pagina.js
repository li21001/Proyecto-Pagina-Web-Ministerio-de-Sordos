/* Dibuja la página con los datos de window.SITIO (contenido de prueba + lo guardado en el panel).
   Cada bloque solo se dibuja si su contenedor existe en la página actual. */
(function () {
  "use strict";
  if (window.SITIO_DIBUJADO) return;
  window.SITIO_DIBUJADO = true;

  var S = window.SITIO || {};
  var T = S.textos || {};
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Ayudas ---------- */
  function el(etiqueta, clase, texto) {
    var e = document.createElement(etiqueta);
    if (clase) e.className = clase;
    if (texto !== undefined && texto !== null) e.textContent = texto;
    return e;
  }
  function parrafos(contenedor, texto) {
    contenedor.textContent = "";
    String(texto || "").split(/\n\s*\n/).forEach(function (bloque) {
      bloque = bloque.trim();
      if (!bloque) return;
      var p = el("p");
      bloque.split("\n").forEach(function (linea, i) {
        if (i) p.appendChild(document.createElement("br"));
        p.appendChild(document.createTextNode(linea));
      });
      contenedor.appendChild(p);
    });
  }
  function vacio(lista, mensaje) {
    lista.textContent = "";
    lista.appendChild(el("li", "vacio", mensaje));
  }
  function enlaceExterno(a, url) {
    a.href = url;
    /* Los enlaces a otras páginas (redes, publicaciones, PDF) se abren en otra pestaña;
       la navegación dentro del sitio sigue en la misma pestaña. */
    if (/^https?:|\.pdf$/i.test(url)) { a.target = "_blank"; a.rel = "noopener"; }
  }
  var ICONOS = {
    Facebook: '<path d="M7 10v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3h-3a5 5 0 0 0-5 5v2z"/>',
    TikTok: '<path d="M21 7.9v4a10 10 0 0 1-5-1.9v4.5a6.5 6.5 0 1 1-8-6.3v4.3a2.5 2.5 0 1 0 4 2V3h4.1A6 6 0 0 0 21 7.9"/>',
    YouTube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pdf: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>'
  };
  function icono(nombre) {
    return ICONOS[nombre] ? '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[nombre] + "</svg>" : "";
  }
  function fechaLarga(iso) {
    var f = new Date(iso + "T12:00:00");
    return isNaN(f) ? (iso || "") : f.toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" });
  }
  function iniciales(nombre) {
    return String(nombre || "").split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p[0]; }).join("").toUpperCase();
  }

  /* ---------- Menú en celular ---------- */
  var boton = document.querySelector(".menu-boton");
  var menu = $("menu");
  if (boton && menu) {
    var cerrar = function () { menu.classList.remove("menu--abierto"); boton.setAttribute("aria-expanded", "false"); };
    boton.addEventListener("click", function () {
      boton.setAttribute("aria-expanded", String(menu.classList.toggle("menu--abierto")));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("menu--abierto")) { cerrar(); boton.focus(); }
    });
  }

  /* ---------- Textos ---------- */
  [["resena", T.resena], ["mision-texto", T.mision], ["vision-texto", T.vision], ["historia-texto", T.historia]].forEach(function (par) {
    if ($(par[0]) && par[1]) parrafos($(par[0]), par[1]);
  });
  if ($("cultura-texto") && T.culturaSorda) {
    parrafos($("cultura-texto"), T.culturaSorda);
    $("cultura-texto").hidden = false;
  }

  /* ---------- Video de presentación ---------- */
  function montarVideo(caja, url, titulo, poster, subtitulos) {
    if (!caja || !url) return;
    var aviso = caja.querySelector(".video__pronto");
    if (/\.(mp4|webm)$/i.test(url)) {
      var v = document.createElement("video");
      v.controls = true; v.playsInline = true; v.preload = "metadata";
      v.setAttribute("aria-label", titulo);
      if (poster) v.poster = poster;
      v.src = url;
      if (subtitulos) {
        var pista = document.createElement("track");
        pista.kind = "captions"; pista.srclang = "es"; pista.label = "Español"; pista.src = subtitulos; pista.default = true;
        v.appendChild(pista);
      }
      caja.appendChild(v);
    } else {
      var marco = document.createElement("iframe");
      marco.src = url; marco.title = titulo; marco.loading = "lazy";
      marco.allow = "fullscreen; picture-in-picture"; marco.allowFullscreen = true;
      caja.appendChild(marco);
    }
    if (aviso) aviso.hidden = true;
  }
  montarVideo($("video"), S.videoPresentacion, "Video de presentación del Ministerio de Sordos", S.videoPoster, S.videoSubtitulos);
  if ($("video-uso") && S.videoUso) {
    montarVideo($("video-uso"), S.videoUso, "Video en LESSA: cómo usar esta página");
    $("bloque-uso").hidden = false;
  }

  /* ---------- Horarios y ubicación ---------- */
  var listaHorarios = $("lista-horarios");
  if (listaHorarios) {
    listaHorarios.textContent = "";
    (S.horarios || []).forEach(function (h) {
      var li = el("li", "horario");
      li.appendChild(el("p", "horario__dia", h.dia));
      li.appendChild(el("p", "horario__actividad", h.actividad));
      var hora = el("p", "horario__hora");
      hora.innerHTML = icono("reloj");
      hora.appendChild(document.createTextNode(h.hora));
      li.appendChild(hora);
      listaHorarios.appendChild(li);
    });
    if (!listaHorarios.children.length) vacio(listaHorarios, "Pronto publicaremos los horarios de reunión.");
  }
  if ($("direccion") && S.direccion) parrafos($("direccion"), S.direccion);
  if ($("correo-contacto")) {
    if (S.correo) {
      var a = el("a", "", S.correo);
      a.href = "mailto:" + S.correo;
      $("correo-contacto").textContent = "";
      $("correo-contacto").appendChild(a);
    } else {
      $("correo-contacto").hidden = true;
    }
  }
  if ($("como-llegar") && S.mapaEnlace) { enlaceExterno($("como-llegar"), S.mapaEnlace); $("como-llegar").hidden = false; }
  if ($("mapa") && S.mapa) {
    var mapa = document.createElement("iframe");
    mapa.src = S.mapa; mapa.loading = "lazy"; mapa.referrerPolicy = "no-referrer-when-downgrade";
    mapa.title = "Mapa con la ubicación del Tabernáculo Bíblico Bautista «Amigos de Israel»";
    $("mapa").textContent = "";
    $("mapa").appendChild(mapa);
  }

  /* ---------- Portada de las publicaciones ----------
     1) la imagen que se subió en el panel; 2) si es un video de YouTube, su miniatura;
     3) si no hay ninguna, un color y un dibujo según el tipo de publicación. */
  var TIPOS = {
    "Celebración": { emoji: "🎉", clase: "dorado" },
    "Culto": { emoji: "🙏", clase: "aqua" },
    "Estudio bíblico": { emoji: "📖", clase: "verde" },
    "Aviso": { emoji: "📢", clase: "lila" },
    "Video": { emoji: "🎬", clase: "tinta" }
  };
  function tipoDe(p) {
    return TIPOS[p.tipo] ? p.tipo : (p.red === "YouTube" || p.red === "TikTok" ? "Video" : "Aviso");
  }
  function portada(p, chica) {
    var caja = el("span", "portada" + (chica ? " portada--chica" : ""));
    caja.setAttribute("aria-hidden", "true");
    var imagen = p.imagen || p.miniatura;
    if (imagen) {
      var img = el("img"); img.src = imagen; img.alt = ""; img.loading = "lazy";
      /* Si la imagen no carga, se muestra la portada de color. */
      img.onerror = function () { caja.replaceWith(portada({ tipo: p.tipo, red: p.red }, chica)); };
      caja.appendChild(img);
      if (!p.imagen && p.miniatura) caja.appendChild(el("span", "portada__play", "▶"));
      return caja;
    }
    var t = tipoDe(p);
    caja.className += " portada--" + TIPOS[t].clase;
    caja.appendChild(el("span", "portada__emoji", TIPOS[t].emoji));
    if (!chica) caja.appendChild(el("span", "portada__tipo", t));
    return caja;
  }
  function chipRed(red) {
    var c = el("span", "chip chip--" + String(red || "red").toLowerCase(), red || "Publicación");
    return c;
  }
  function esNueva(iso) {
    if (!iso) return false;
    var dias = (Date.now() - new Date(iso + "T12:00:00").getTime()) / 86400000;
    return dias >= -1 && dias <= 7;
  }

  /* ---------- Vistas previas del inicio ---------- */
  var prevPub = $("prev-publicaciones");
  if (prevPub) {
    var pubs = (S.publicaciones || []).slice(0, 2);
    prevPub.textContent = "";
    pubs.forEach(function (p) {
      var d = el("div", "mini mini--pub");
      d.appendChild(portada(p, true));
      var cuerpo = el("div", "mini__cuerpo");
      cuerpo.appendChild(chipRed(p.red));
      cuerpo.appendChild(el("p", "mini__titulo", p.titulo));
      if (p.fecha) cuerpo.appendChild(el("p", "mini__fecha", fechaLarga(p.fecha)));
      d.appendChild(cuerpo);
      prevPub.appendChild(d);
    });
    if (!pubs.length) prevPub.appendChild(el("p", "mini mini--vacio", "Pronto compartiremos aquí las novedades del ministerio."));
  }
  var prevGal = $("prev-galeria");
  if (prevGal) {
    var fotos = S.galeria || [];
    prevGal.textContent = "";
    fotos.slice(0, 3).forEach(function (f) {
      var img = el("img");
      img.src = f.imagen; img.alt = ""; img.loading = "lazy";
      prevGal.appendChild(img);
    });
    if (fotos.length > 3) prevGal.appendChild(el("span", "prev-galeria__mas", "+" + (fotos.length - 3)));
    if ($("cuenta-fotos")) $("cuenta-fotos").textContent = fotos.length ? fotos.length + (fotos.length === 1 ? " foto" : " fotos") : "";
  }
  var prevBib = $("prev-biblioteca");
  if (prevBib) {
    var m = (S.materiales || [])[0];
    prevBib.textContent = "";
    if (m) {
      prevBib.appendChild(el("span", "chip chip--dorado", m.tipo || "Material"));
      prevBib.appendChild(el("p", "mini__titulo", m.titulo));
    } else {
      prevBib.appendChild(el("p", "mini__fecha", "Pronto publicaremos materiales en PDF."));
    }
  }

  /* ---------- Historia: fechas y estructura ---------- */
  var listaFechas = $("lista-fechas");
  if (listaFechas) {
    listaFechas.textContent = "";
    (S.fechas || []).forEach(function (f) {
      var li = el("li", "fecha");
      var cal = el("div", "fecha__cal" + (f.dia ? "" : " fecha__cal--mes"));
      /* Con día: «5 / MAR». Sin día (se celebra todo el mes): «SEP / todo el mes». */
      cal.appendChild(el("span", "fecha__num", f.dia || String(f.mes || "").slice(0, 3)));
      cal.appendChild(el("span", "fecha__mes", f.dia ? String(f.mes || "").slice(0, 3) : "todo el mes"));
      if (!f.dia) cal.setAttribute("aria-label", "Todo el mes de " + f.mes);
      var texto = el("div");
      texto.appendChild(el("p", "fecha__titulo", f.titulo));
      if (f.descripcion) texto.appendChild(el("p", "fecha__desc", f.descripcion));
      li.appendChild(cal); li.appendChild(texto);
      listaFechas.appendChild(li);
    });
    if (!listaFechas.children.length) vacio(listaFechas, "Pronto publicaremos nuestras fechas especiales.");
  }
  var estructura = $("estructura");
  if (estructura) {
    estructura.textContent = "";
    (S.estructura || []).forEach(function (e) {
      var li = el("li", "persona" + (e.nombre ? "" : " persona--equipo"));
      var nombreVisible = e.nombre && S.publicarNombres !== false;
      if (e.foto) {
        var img = el("img", "persona__foto"); img.src = e.foto; img.alt = ""; img.loading = "lazy";
        li.appendChild(img);
      } else {
        var marca = nombreVisible ? iniciales(e.nombre)
          : e.nombre ? iniciales(e.cargo)
          : (String(e.detalle || "").match(/\d+/) || ["+"])[0];
        var circ = el("span", "persona__foto", marca);
        circ.setAttribute("aria-hidden", "true");
        li.appendChild(circ);
      }
      li.appendChild(el("p", "persona__nombre", nombreVisible ? e.nombre : e.cargo));
      var sec = nombreVisible ? e.cargo : (e.detalle || "");
      if (sec) li.appendChild(el("p", "persona__cargo", sec));
      estructura.appendChild(li);
    });
  }

  /* ---------- Galería con foto ampliada ---------- */
  var galeria = $("galeria-lista");
  var visor = $("visor");
  if (galeria) {
    galeria.textContent = "";
    (S.galeria || []).forEach(function (f, i) {
      var li = el("li");
      var b = el("button", "foto");
      b.type = "button";
      b.dataset.indice = i;
      b.setAttribute("aria-label", "Ampliar foto: " + f.descripcion);
      var img = el("img"); img.src = f.imagen; img.alt = ""; img.loading = "lazy";
      b.appendChild(img);
      li.appendChild(b);
      li.appendChild(el("p", "foto__texto", f.descripcion));
      galeria.appendChild(li);
    });
    if (!galeria.children.length) vacio(galeria, "Aún no hay fotos. ¡Pronto compartiremos momentos del ministerio!");
    if (visor) {
      galeria.addEventListener("click", function (e) {
        var b = e.target.closest(".foto");
        if (!b) return;
        var f = S.galeria[Number(b.dataset.indice)];
        $("visor-img").src = f.grande || f.imagen;
        $("visor-img").alt = f.descripcion;
        $("visor-texto").textContent = f.descripcion;
        visor.showModal();
      });
      $("visor-cerrar").addEventListener("click", function () { visor.close(); });
      visor.addEventListener("click", function (e) { if (e.target === visor) visor.close(); });
    }
  }

  /* ---------- Publicaciones ---------- */
  var listaPub = $("lista-publicaciones");
  if (listaPub) {
    listaPub.textContent = "";
    (S.publicaciones || []).forEach(function (p) {
      var li = el("li", "publicacion");
      var a = el("a");
      enlaceExterno(a, p.url || "#");
      a.appendChild(portada(p, false));
      var cuerpo = el("span", "publicacion__cuerpo");
      var chips = el("span", "publicacion__chips");
      chips.appendChild(chipRed(p.red));
      if (esNueva(p.fecha)) chips.appendChild(el("span", "chip chip--nuevo", "Nuevo"));
      cuerpo.appendChild(chips);
      cuerpo.appendChild(el("span", "publicacion__titulo", p.titulo));
      if (p.texto) cuerpo.appendChild(el("span", "publicacion__texto", p.texto));
      if (p.fecha) cuerpo.appendChild(el("span", "publicacion__fecha", fechaLarga(p.fecha)));
      cuerpo.appendChild(el("span", "publicacion__ver", (p.red === "YouTube" ? "Ver el video en YouTube" : "Ver en " + (p.red || "la red social")) + " →"));
      a.appendChild(cuerpo);
      li.appendChild(a);
      listaPub.appendChild(li);
    });
    if (!listaPub.children.length) vacio(listaPub, "Pronto compartiremos aquí las publicaciones del ministerio.");
  }

  /* ---------- Registro ---------- */
  var registro = $("enlace-registro");
  if (registro) {
    if (S.formularioRegistro) enlaceExterno(registro, S.formularioRegistro);
    else registro.hidden = true;
  }

  /* ---------- Biblioteca ---------- */
  var listaMat = $("lista-materiales");
  if (listaMat) {
    listaMat.textContent = "";
    (S.materiales || []).forEach(function (m) {
      var li = el("li", "material");
      li.insertAdjacentHTML("afterbegin", icono("pdf"));
      var cuerpo = el("div");
      if (m.tipo) cuerpo.appendChild(el("span", "chip chip--dorado", m.tipo));
      cuerpo.appendChild(el("p", "material__titulo", m.titulo));
      if (m.descripcion) cuerpo.appendChild(el("p", "material__texto", m.descripcion));
      if (m.archivo) {
        var acciones = el("div", "material__acciones");
        var ver = el("a", "boton", "Ver en línea");
        enlaceExterno(ver, m.archivo);
        ver.setAttribute("aria-label", "Ver en línea: " + m.titulo + " (se abre en otra pestaña)");
        acciones.appendChild(ver);
        if (!/^https?:/i.test(m.archivo)) {
          var bajar = el("a", "boton boton--claro", "Descargar");
          bajar.href = m.archivo; bajar.setAttribute("download", "");
          bajar.setAttribute("aria-label", "Descargar: " + m.titulo);
          acciones.appendChild(bajar);
        }
        cuerpo.appendChild(acciones);
      }
      li.appendChild(cuerpo);
      listaMat.appendChild(li);
    });
    if (!listaMat.children.length) vacio(listaMat, "Pronto publicaremos aquí los materiales en PDF.");
  }

  /* ---------- Redes sociales ---------- */
  var tarjetas = $("redes-tarjetas");
  if (tarjetas) {
    tarjetas.textContent = "";
    (S.redes || []).forEach(function (r) {
      var art = el("article", "red");
      var t = el("h2", "red__titulo");
      t.innerHTML = icono(r.nombre);
      t.appendChild(document.createTextNode(r.nombre));
      art.appendChild(t);
      art.appendChild(el("p", "", r.descripcion || ""));
      if (r.url) {
        var a = el("a", "boton", "Visitar " + r.nombre);
        enlaceExterno(a, r.url);
        art.appendChild(a);
      } else {
        art.appendChild(el("p", "red__pronto", "Próximamente"));
      }
      tarjetas.appendChild(art);
    });
  }
  var pie = $("redes-pie");
  if (pie) {
    pie.textContent = "";
    (S.redes || []).forEach(function (r) {
      if (!r.url) return;
      var li = el("li"), a = el("a");
      enlaceExterno(a, r.url);
      a.innerHTML = icono(r.nombre);
      a.appendChild(document.createTextNode(r.nombre));
      li.appendChild(a);
      pie.appendChild(li);
    });
    if (S.correo) {
      var li2 = el("li"), c = el("a", "", S.correo);
      c.href = "mailto:" + S.correo;
      li2.appendChild(c);
      pie.appendChild(li2);
    }
    pie.hidden = !pie.children.length;
  }
})();
