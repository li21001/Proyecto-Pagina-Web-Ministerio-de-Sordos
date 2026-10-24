# A19 · Modelado de la estructura de datos
**Responsable:** Azucena

Base de datos: **Cloud Firestore** del proyecto `ministerio-sordos-cojutepeque` (plan Spark, sin costo), creada con el correo del ministerio.
Los nombres de colecciones y campos van sin tildes ni espacios.

## Colecciones

| Colección / documento | Campos (tipo) | Historias |
|---|---|---|
| `sitio` / `institucional` | `resena`, `mision`, `vision`, `historia`, `culturaSorda` (string) | HU-01, 02, 06, 08, 20 |
| `sitio` / `contacto` | `direccion`, `mapaUrl`, `correo`, `facebook`, `tiktok`, `youtube`, `formularioQR` (string) | HU-04, 05, 13, 14, 21, 27 |
| `sitio` / `videos` | `presentacion`, `usoSitio` (string: enlace de YouTube) | HU-15, 16 |
| `horarios` (un documento por reunión) | `dia`, `hora`, `actividad` (string), `orden` (number) | HU-03, 21 |
| `fechas` | `titulo`, `descripcion`, `mostrar` («Día y mes» o «Solo el mes») (string), `fecha` (timestamp) | HU-07 |
| `lideres` | `nombre`, `cargo`, `fotoUrl` (string), `orden` (number) | HU-09 |
| `galeria` | `url`, `publicId`, `descripcion` (string), `fecha` (timestamp) | HU-10, 11, 22, 23 |
| `publicaciones` | `titulo`, `texto`, `enlace`, `red`, `tipo`, `imagenUrl`, `imagenId` (string), `fecha` (timestamp) | HU-12, 24, 25 |
| `biblioteca` | `titulo`, `tipo` (Libro, Diccionario u Otro), `descripcion`, `enlaceDrive` (string) | HU-28 |
| `admins` (ID del documento = UID de Authentication) | `correo` (string), `desde` (timestamp). Si existe, la persona puede usar el panel. | HU-17, 26 |
| `usuarios` (ID = UID de Authentication) — CC-24 | `nombre`, `cargo`, `correo`, `creadoPor` (string), `activo`, `eliminado`, `aceptoTerminos` (boolean), `creado` (timestamp) | HU-26 |

## Decisiones
- **Sin teléfono:** `contacto` no tiene campo de teléfono; la dirección es la del Tabernáculo Bíblico Bautista Amigos de Israel (CC-10).
- **Fotos:** se guardan en Cloudinary; Firestore solo guarda `url` y `publicId` (para poder borrarlas desde el panel).
- **PDF de la biblioteca:** se guardan en el Google Drive del ministerio; Firestore solo guarda el enlace.
- **Encargados:** al inicio, una sola cuenta con el correo del ministerio (CC-16). Desde CC-24 el panel tiene la sección **Usuarios**: se agregan, editan, desactivan, reactivan y eliminan usuarios, todos con los mismos permisos. La cuenta (correo y contraseña cifrada) vive en Firebase Authentication; el permiso, en `admins`; los datos visibles, en `usuarios`. Cada persona crea su propia contraseña con el enlace que le llega por correo. Nadie puede quitarse el permiso a sí mismo, así el panel nunca se queda sin encargados (ver `firestore.rules`).
- **Videos:** se guardan en el canal de YouTube del ministerio; Firestore solo guarda el enlace.
- **Lectura pública:** cualquier visitante puede leer el contenido; `admins` y `usuarios` solo los ven y modifican los encargados con sesión iniciada.
