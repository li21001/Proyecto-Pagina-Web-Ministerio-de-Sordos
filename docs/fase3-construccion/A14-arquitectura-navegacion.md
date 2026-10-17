# A14 · Diseño de la arquitectura de navegación
**Responsable:** Azucena
**Versión 2 (12 oct 2026):** el sitio pasa de una sola página a varias páginas con un inicio tipo menú. Cambio registrado como **CC-17**.

## Decisión
El sitio público tiene **una página de inicio que funciona como menú** y **una página por sección**. Todas comparten el mismo encabezado (logo, menú y botón **Usuario**) y el mismo pie de página. El panel de administración está aparte, en la carpeta `panel/`.

**Por qué varias páginas:** una sola página larga resultaba pesada de recorrer, sobre todo en el celular. Con páginas separadas, cada tema tiene su lugar, cada página carga solo los datos que necesita (RNF-05) y el inicio muestra lo que más busca una persona nueva: horarios y ubicación (HU-03, HU-04, HU-05).

**Versión 1 (línea base):** una sola página (`index.html`) con siete secciones y el acceso al panel en el pie de página.

## Mapa del sitio

```
index.html · Inicio (menú) .......... Bienvenida, video de presentación, «Visítanos»       HU-01, 03, 04, 05, 15
                                       (horarios, dirección, mapa) y tarjetas con
                                       vista previa de cada sección
├── publicaciones.html ............... Publicaciones recientes con enlace a la red social      HU-12
├── historia.html .................... Misión y visión, historia, fechas especiales          HU-02, 06, 07, 09
│                                      y estructura del ministerio
├── cultura.html ..................... Cifras, qué es, LESSA en El Salvador, rasgos          HU-08
│                                      de la cultura Sorda y referencias
├── galeria.html ..................... Cuadrícula de fotos con visor ampliado                 HU-10, 11
├── registro.html .................... Código QR y botón del formulario de Google            HU-27
├── biblioteca.html .................. Libros con señas y diccionarios en PDF                 HU-28
└── redes.html ....................... Facebook, TikTok y YouTube; video «Cómo usar         HU-13, 16
                                       esta página»
Pie de página (todas) ................ Redes sociales y correo del ministerio                 HU-14

panel/
├── login.html ....................... Iniciar sesión y recuperar contraseña                  HU-17, 19
└── index.html ....................... Menú lateral: Resumen · Textos · Horarios ·           HU-18, 20 a 26, 28
                                       Contacto y redes · Videos · Galería · Publicaciones ·
                                       Biblioteca · Fechas especiales · Estructura
```

## Orden de las secciones
Inicio → Publicaciones → Historia → Cultura Sorda → Galería → Registro → Biblioteca → Redes.
Es el orden del menú, de las tarjetas del inicio y del recuadro **«Sigue leyendo»** al final de cada página.

## Reglas de navegación
- El encabezado con el menú está en todas las páginas y marca la página actual. En celular se abre con el botón **Menú**.
- El botón **Usuario** (arriba a la derecha, en todas las páginas) lleva al inicio de sesión del panel.
- Cada página interna tiene **«← Volver al inicio»** arriba y **«Sigue leyendo»** al final.
- En el inicio, toda la tarjeta de una sección se puede tocar; no hay botones de «Ver más».
- El primer elemento de cada página es el enlace **Saltar al contenido**, para navegar con teclado.
- **Pestañas:** la navegación dentro del sitio se abre en la misma pestaña. Los enlaces que llevan a otra página (redes sociales, publicaciones, PDF de la biblioteca, formulario de registro y Google Maps) se abren en una pestaña nueva.
- Dentro del panel, cada opción del menú lateral es una tarea; si hay cambios sin guardar, el panel avisa antes de cambiar de sección o cerrar sesión.

## Identidad
- La ovejita es el logo del sitio: aparece en el encabezado, el pie de página, el panel y la pestaña del navegador (CC-19).
- Colores y tipografías según A15 (aqua institucional; Atkinson Hyperlegible y Nunito).
