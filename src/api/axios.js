// import axios from 'axios';

// const api = axios.create({
//   baseURL: '/api',
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('tiketku_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem('tiketku_token');
//       localStorage.removeItem('tiketku_user');
//       if (!window.location.pathname.startsWith('/login')) {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 detik
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tiketku_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tiketku_token');
      localStorage.removeItem('tiketku_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;