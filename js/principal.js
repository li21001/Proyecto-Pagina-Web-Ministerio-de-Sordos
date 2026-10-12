(function () {
  "use strict";
  /* Se ejecuta una sola vez, después de que datos.js junta el contenido de prueba
     con lo guardado desde el panel. */
  if (window.SITIO_DIBUJADO) return;
  window.SITIO_DIBUJADO = true;
  var cfg = window.SITIO || {};

  /* Íconos de las redes (trazo, como el resto de íconos del sitio) */
  var ICONOS = {
    Facebook: '<path d="M7 10v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3h-3a5 5 0 0 0-5 5v2z"/>',
    WhatsApp: '<path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5 .5 0 0 0 1 0V9a.5 .5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0-1h-1a.5 .5 0 0 0 0 1"/>',
    TikTok: '<path d="M21 7.917v4.034a9.948 9.948 0 0 1-5-1.951v4.5a6.5 6.5 0 1 1-8-6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917"/>',
    YouTube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z"/>'
  };
  function icono(nombre) {
    return ICONOS[nombre] ? '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[nombre] + "</svg>" : "";
  }

  /* Menú en celular */
  var boton = document.querySelector(".menu-boton");
  var menu = document.getElementById("menu");

  function cerrarMenu() {
    menu.classList.remove("menu--abierto");
    boton.setAttribute("aria-expanded", "false");
  }

  boton.addEventListener("click", function () {
    var abierto = menu.classList.toggle("menu--abierto");
    boton.setAttribute("aria-expanded", String(abierto));
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) cerrarMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("menu--abierto")) {
      cerrarMenu();
      boton.focus();
    }
  });

  /* Video: archivo .mp4/.webm propio o enlace de inserción (YouTube) */
  function montarVideo(caja, url, poster, titulo, subtitulos) {
    var aviso = caja.querySelector(".video__pronto");
    if (!url) return;
    if (/\.(mp4|webm)$/i.test(url)) {
      var v = document.createElement("video");
      v.controls = true;
      v.playsInline = true;
      v.preload = "metadata";
      v.title = titulo;
      v.setAttribute("aria-label", titulo);
      if (poster) v.poster = poster;
      v.src = url;
      v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:contain";
      if (subtitulos) {
        var pista = document.createElement("track");
        pista.kind = "captions";
        pista.srclang = "es";
        pista.label = "Español";
        pista.src = subtitulos;
        pista.default = true;
        v.appendChild(pista);
      }
      /* Si el video es vertical, la caja toma su forma en lugar de la de 16:9 */
      v.addEventListener("loadedmetadata", function () {
        if (v.videoHeight > v.videoWidth) {
          var razon = v.videoWidth / v.videoHeight;
          caja.style.aspectRatio = v.videoWidth + " / " + v.videoHeight;
          caja.style.width = "min(100%, " + (75 * razon).toFixed(1) + "vh)";
          caja.style.marginInline = "auto";
        }
      });
      caja.appendChild(v);
    } else {
      var marco = document.createElement("iframe");
      marco.src = url;
      marco.title = titulo;
      marco.allow = "fullscreen; picture-in-picture";
      marco.allowFullscreen = true;
      marco.loading = "lazy";
      caja.appendChild(marco);
    }
    if (aviso) aviso.hidden = true;
  }
  montarVideo(document.getElementById("video"), cfg.videoPresentacion, cfg.videoPoster,
    "Video de presentación del Ministerio de Sordos", cfg.videoSubtitulos);

  /* Registro: botón con el enlace del formulario (el QR es una imagen fija) */
  var enlace = document.getElementById("enlace-registro");
  if (cfg.formularioRegistro) {
    enlace.href = cfg.formularioRegistro;
  } else {
    enlace.hidden = true;
  }

  /* Mapa de la iglesia */
  var mapa = document.getElementById("mapa");
  if (cfg.mapa) {
    var mapaMarco = document.createElement("iframe");
    mapaMarco.src = cfg.mapa;
    mapaMarco.title = "Mapa con la ubicación del Tabernáculo Bíblico Bautista «Amigos de Israel»";
    mapaMarco.loading = "lazy";
    mapaMarco.referrerPolicy = "no-referrer-when-downgrade";
    mapa.appendChild(mapaMarco);
    document.getElementById("mapa-pronto").hidden = true;
  }

  var comoLlegar = document.getElementById("como-llegar");
  if (cfg.mapaEnlace) {
    comoLlegar.href = cfg.mapaEnlace;
    comoLlegar.hidden = false;
  }

  /* Contacto: correo y redes (solo lo que ya tiene enlace) */
  var contacto = document.getElementById("contacto");
  function itemContacto(texto, url) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = url;
    a.textContent = texto;
    a.insertAdjacentHTML("afterbegin", icono(texto));
    if (url.indexOf("mailto:") !== 0) { a.target = "_blank"; a.rel = "noopener"; }
    li.appendChild(a);
    contacto.appendChild(li);
  }
  if (cfg.correo) itemContacto(cfg.correo, "mailto:" + cfg.correo);
  (cfg.redes || []).forEach(function (red) {
    if (red.url) itemContacto(red.nombre, red.url);
  });
  if (!contacto.children.length) {
    var vacio = document.createElement("li");
    vacio.textContent = "El correo y las redes sociales del ministerio se publicarán pronto.";
    contacto.appendChild(vacio);
  }

  /* Redes sociales (solo las que tienen enlace) */
  var lista = document.getElementById("redes");
  (cfg.redes || []).forEach(function (red) {
    if (!red.url) return;
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = red.url;
    a.textContent = red.nombre;
    a.insertAdjacentHTML("afterbegin", icono(red.nombre));
    a.target = "_blank";
    a.rel = "noopener";
    li.appendChild(a);
    lista.appendChild(li);
  });
  lista.hidden = !lista.children.length;

  /* Estructura del ministerio */
  var estructura = document.getElementById("estructura");
  (cfg.estructura || []).forEach(function (e) {
    var li = document.createElement("li");
    li.className = "lider";
    if (e.foto) {
      var foto = document.createElement("img");
      foto.className = "lider__foto";
      foto.src = e.foto;
      foto.alt = "";
      foto.loading = "lazy";
      li.appendChild(foto);
    }
    var principal = document.createElement("p");
    principal.className = "lider__nombre";
    var secundario = document.createElement("p");
    if (e.nombre && cfg.publicarNombres) {
      principal.textContent = e.nombre;
      secundario.textContent = e.cargo;
    } else {
      principal.textContent = e.cargo;
      secundario.textContent = e.detalle || "";
    }
    li.appendChild(principal);
    if (secundario.textContent) li.appendChild(secundario);
    estructura.appendChild(li);
  });

  /* Publicaciones */
  var listaPub = document.getElementById("lista-publicaciones");
  function fechaLarga(iso) {
    var f = new Date(iso + "T00:00:00");
    return isNaN(f) ? iso : f.toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" });
  }
  if ((cfg.publicaciones || []).length) {
    listaPub.innerHTML = "";
    cfg.publicaciones.forEach(function (p) {
      var li = document.createElement("li");
      li.className = "publicacion";
      var a = document.createElement("a");
      a.href = p.url || "#";
      a.target = "_blank";
      a.rel = "noopener";
      [["publicacion__red", p.red], ["publicacion__titulo", p.titulo], ["publicacion__texto", p.texto]].forEach(function (par) {
        if (!par[1]) return;
        var s = document.createElement("span");
        s.className = par[0];
        s.textContent = par[1];
        a.appendChild(s);
      });
      if (p.fecha) {
        var t = document.createElement("time");
        t.className = "publicacion__fecha";
        t.dateTime = p.fecha;
        t.textContent = fechaLarga(p.fecha);
        a.appendChild(t);
      }
      li.appendChild(a);
      listaPub.appendChild(li);
    });
  }

  /* Galería: carrusel y foto ampliada */
  var pista = document.getElementById("carrusel-pista");
  (cfg.galeria || []).forEach(function (foto) {
    var diapositiva = document.createElement("li");
    diapositiva.className = "carrusel__diapo";

    var figura = document.createElement("figure");
    var botonFoto = document.createElement("button");
    botonFoto.className = "carrusel__foto";
    botonFoto.type = "button";
    botonFoto.dataset.grande = foto.grande || foto.imagen;
    botonFoto.setAttribute("aria-label", "Ampliar foto: " + foto.descripcion);

    var imagen = document.createElement("img");
    imagen.src = foto.imagen;
    if (foto.ancho && foto.alto) {
      imagen.width = foto.ancho;
      imagen.height = foto.alto;
    }
    imagen.alt = "";
    imagen.loading = "lazy";
    botonFoto.appendChild(imagen);

    var descripcion = document.createElement("figcaption");
    descripcion.textContent = foto.descripcion;
    figura.appendChild(botonFoto);
    figura.appendChild(descripcion);
    diapositiva.appendChild(figura);
    pista.appendChild(diapositiva);
  });

  var controles = document.getElementById("carrusel-controles");
  var anterior = document.getElementById("carrusel-anterior");
  var siguiente = document.getElementById("carrusel-siguiente");
  var sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function actualizarCarrusel() {
    var cabe = pista.scrollWidth <= pista.clientWidth + 2;
    controles.hidden = cabe;
    anterior.disabled = pista.scrollLeft <= 2;
    siguiente.disabled = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 2;
  }
  function mover(direccion) {
    pista.scrollBy({ left: direccion * Math.max(pista.clientWidth * 0.8, 240), behavior: sinMovimiento ? "auto" : "smooth" });
  }
  anterior.addEventListener("click", function () { mover(-1); });
  siguiente.addEventListener("click", function () { mover(1); });
  pista.addEventListener("scroll", actualizarCarrusel, { passive: true });
  window.addEventListener("resize", actualizarCarrusel);
  window.addEventListener("load", actualizarCarrusel);
  actualizarCarrusel();

  var visor = document.getElementById("visor");
  var visorImg = document.getElementById("visor-img");
  var visorTexto = document.getElementById("visor-texto");
  visorImg.addEventListener("load", function () {
    /* Las fotos pequeñas no se estiran demasiado para que no se vean borrosas */
    visorImg.style.width = visorImg.naturalWidth < 700 ? Math.min(visorImg.naturalWidth * 2, 480) + "px" : "";
  });
  pista.addEventListener("click", function (e) {
    var foto = e.target.closest(".carrusel__foto");
    if (!foto) return;
    var texto = foto.closest("figure").querySelector("figcaption").textContent;
    visorImg.style.width = "";
    visorImg.src = foto.dataset.grande;
    visorImg.alt = texto;
    visorTexto.textContent = texto;
    visor.showModal();
  });
  document.getElementById("visor-cerrar").addEventListener("click", function () { visor.close(); });
  visor.addEventListener("click", function (e) { if (e.target === visor) visor.close(); });

  /* Redes sociales: tarjetas con logo; el botón aparece cuando hay enlace */
  var tarjetasRedes = document.getElementById("redes-tarjetas");
  (cfg.redes || []).forEach(function (red) {
    var art = document.createElement("article");
    art.className = "tarjeta";
    var t = document.createElement("h3");
    t.insertAdjacentHTML("afterbegin", icono(red.nombre));
    t.appendChild(document.createTextNode(red.nombre));
    var d = document.createElement("p");
    d.textContent = red.descripcion || "";
    art.appendChild(t);
    art.appendChild(d);
    if (red.url) {
      var a = document.createElement("a");
      a.className = "boton";
      a.href = red.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Visitar " + red.nombre;
      art.appendChild(a);
    } else {
      var p = document.createElement("p");
      p.className = "redes-aviso";
      p.textContent = "Próximamente";
      art.appendChild(p);
    }
    tarjetasRedes.appendChild(art);
  });

  /* Biblioteca de materiales en PDF */
  var listaMateriales = document.getElementById("lista-materiales");
  if ((cfg.materiales || []).length) {
    listaMateriales.innerHTML = "";
    cfg.materiales.forEach(function (m) {
      var li = document.createElement("li");
      li.className = "material";
      li.insertAdjacentHTML("afterbegin",
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>');
      var cuerpo = document.createElement("div");
      if (m.tipo) {
        var pt = document.createElement("p");
        var tipo = document.createElement("span");
        tipo.className = "material__tipo";
        tipo.textContent = m.tipo;
        pt.appendChild(tipo);
        cuerpo.appendChild(pt);
      }
      var titulo = document.createElement("p");
      titulo.className = "material__titulo";
      titulo.textContent = m.titulo;
      cuerpo.appendChild(titulo);
      if (m.descripcion) {
        var pd = document.createElement("p");
        pd.textContent = m.descripcion;
        cuerpo.appendChild(pd);
      }
      if (m.archivo) {
        var acciones = document.createElement("div");
        acciones.className = "material__acciones";
        var ver = document.createElement("a");
        ver.className = "boton";
        ver.href = m.archivo;
        ver.target = "_blank";
        ver.rel = "noopener";
        ver.textContent = "Ver en línea";
        ver.setAttribute("aria-label", "Ver en línea: " + m.titulo);
        acciones.appendChild(ver);
        if (!/^https?:/i.test(m.archivo)) {
          var bajar = document.createElement("a");
          bajar.className = "boton boton--claro";
          bajar.href = m.archivo;
          bajar.setAttribute("download", "");
          bajar.textContent = "Descargar";
          bajar.setAttribute("aria-label", "Descargar: " + m.titulo);
          acciones.appendChild(bajar);
        }
        cuerpo.appendChild(acciones);
      }
      li.appendChild(cuerpo);
      listaMateriales.appendChild(li);
    });
  }
})();
