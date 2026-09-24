export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const backendUrl = apiUrl.replace(/\/api\/?$/, '');
  return `${backendUrl}${path}`;
}