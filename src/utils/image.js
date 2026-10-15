// export function getImageUrl(path) {
//   if (!path) return null;
//   if (path.startsWith('http')) return path;

//   const apiUrl = import.meta.env.VITE_API_URL || '';
//   const backendUrl = apiUrl.replace(/\/api\/?$/, '');
//   return `${backendUrl}${path}`;
// }

const API_URL = import.meta.env.VITE_API_URL || '';

export function getImageUrl(path) {
  if (!path) return null;

  // URL lengkap (Cloudinary / http / https) → pakai langsung
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Path lama (/uploads/...) → fallback ke backend (walau file mungkin sudah tidak ada)
  return `${API_URL}${path}`;
}