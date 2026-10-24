# A18 · Configuración de Firestore y Authentication
**Responsable:** Emerson

## Proyecto
- Nombre: `ministerio-sordos-cojutepeque`, creado con el **correo del ministerio**.
- Plan: **Spark** (gratuito, sin tarjeta). No se activan Storage, Hosting ni Analytics.
- App web registrada; su configuración (`firebaseConfig`) está en `js/config.js`. La clave `apiKey` no es secreta: lo que protege los datos son las reglas.

## Firestore
- Base de datos `(default)`, edición Standard, modo producción.
- Colecciones según `A19-estructura-datos.md`.
- Reglas en `firestore.rules` (raíz del repositorio), publicadas en **Firestore → Rules**:
  - Cualquier visitante puede **leer** el contenido público.
  - Solo la cuenta registrada en `admins` puede **escribir**.
  - Nadie puede modificar `admins` desde el sitio.

## Authentication
- Método: **correo electrónico y contraseña**.
- **Una sola cuenta**: el correo del ministerio (CC-16). Su UID es el ID del documento en `admins`.
- Plantilla de restablecimiento de contraseña en **español**.
- Dominios autorizados: `localhost` (pruebas) y `li21001.github.io` (sitio publicado).

## Límites del plan gratuito (Firestore)
1 GiB guardado · 50 000 lecturas, 20 000 escrituras y 20 000 borrados por día. El sitio hace 9 lecturas por visita, así que alcanza para más de 5 000 visitas diarias.

## Comprobación (RNF-11)
En **Rules → Develop and Test**: leer `sitio/institucional` sin sesión → Permitido; crear `publicaciones/prueba` sin sesión → Denegado.
