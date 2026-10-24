# A16 · Selección del servicio de alojamiento de imágenes
**Responsable:** Azucena

## Decisión: Cloudinary (plan gratuito)
| Opción evaluada | Resultado |
|---|---|
| Cloud Storage de Firebase | Descartado: desde septiembre de 2024 exige el plan de pago Blaze, lo que rompe RNF-12 (costo $0). |
| Guardar fotos en el repositorio | Descartado: cada foto nueva requeriría un commit; la líder no podría subirlas desde el panel. |
| **Cloudinary** | **Elegido:** plan gratuito sin tarjeta, subida directa desde el navegador y optimización automática de imágenes. |

## Configuración
1. Cuenta creada con el **correo del ministerio** (CC-07).
2. **Settings → Upload → Upload presets → Add upload preset**:
   - Signing mode: **Unsigned** (el panel sube sin servidor propio).
   - Folder: `galeria`.
   - Allowed formats: `jpg, png, webp` (el panel no permite videos, RNF-12).
   - Max file size: 10 MB.
   - Incoming transformation: limitar a 1600 px de ancho, para no guardar fotos enormes.
3. El **cloud name** y el nombre del preset se escriben en `js/config.js`.

## Cómo se usa en el sitio
- Al subir una foto, el panel la envía a Cloudinary y guarda en Firestore (`galeria`) solo su `url`, su `publicId` y la descripción.
- El sitio pide cada foto con `f_auto,q_auto` y un ancho máximo, así llega en el formato más liviano y por debajo de 300 KB (RNF-06).
- **Eliminar una foto** desde el panel la quita de Firestore y deja de verse en el sitio. El archivo queda guardado en Cloudinary (borrarlo requiere una clave secreta que no puede estar en el navegador); si hace falta liberar espacio, se borra desde la consola de Cloudinary.

## Límites del plan gratuito
25 créditos mensuales (almacenamiento, transformaciones y ancho de banda combinados), suficientes para una galería de cientos de fotos con las visitas esperadas.
