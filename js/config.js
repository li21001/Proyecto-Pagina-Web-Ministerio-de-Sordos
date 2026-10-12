// Datos de conexión con Firebase y Cloudinary (los usa el panel y el sitio).
// Estos valores son públicos por diseño: la seguridad está en las reglas de Firestore.
export const firebaseConfig = {
  apiKey: "AIzaSyD9m4BOvKT0K4tJxETEccwVC-sLEJBlc_A",
  authDomain: "ministerio-sordos-cojutepeque.firebaseapp.com",
  projectId: "ministerio-sordos-cojutepeque",
  storageBucket: "ministerio-sordos-cojutepeque.firebasestorage.app",
  messagingSenderId: "1076547162007",
  appId: "1:1076547162007:web:9978854b3f046094c67ed2"
};

export const cloudinaryConfig = {
  cloudName: "mekj13zy",
  uploadPreset: "galeria_sitio"
};
