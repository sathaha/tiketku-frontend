import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 detik
});

// ===== REQUEST INTERCEPTOR =====
// Otomatis tambah Authorization header kalau ada token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tiketku_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== RESPONSE INTERCEPTOR =====
// Handle 401 (token expired / invalid) — redirect ke login
// TAPI hanya kalau memang user sebelumnya login (ada token)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const status = err.response?.status;

    // Jangan redirect kalau request ke endpoint login/register
    // (biar user bisa lihat pesan error "email/password salah")
    const isAuthRoute =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/google');

    // Cek apakah user sebelumnya login (punya token)
    const hasToken = !!localStorage.getItem('tiketku_token');

    // Redirect hanya kalau:
    // - Status 401 (unauthorized)
    // - Bukan request ke endpoint auth
    // - User sebelumnya login (ada token, artinya expired)
    // - Belum di halaman login
    if (
      status === 401 &&
      !isAuthRoute &&
      hasToken &&
      !window.location.pathname.startsWith('/login')
    ) {
      localStorage.removeItem('tiketku_token');
      localStorage.removeItem('tiketku_user');

      // Simpan halaman asal biar bisa balik setelah login
      const from = window.location.pathname + window.location.search;
      window.location.href = `/login?from=${encodeURIComponent(from)}`;
    }

    return Promise.reject(err);
  }
);

export default api;