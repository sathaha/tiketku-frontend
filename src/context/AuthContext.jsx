// import { createContext, useContext, useEffect, useState } from 'react';
// import api from '../api/axios';

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(() => {
//     const saved = localStorage.getItem('tiketku_user');
//     return saved ? JSON.parse(saved) : null;
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('tiketku_token');
//     if (!token) {
//       setLoading(false);
//       return;
//     }
//     api
//       .get('/auth/me')
//       .then((res) => {
//         setUser(res.data);
//         localStorage.setItem('tiketku_user', JSON.stringify(res.data));
//       })
//       .catch(() => {
//         localStorage.removeItem('tiketku_token');
//         localStorage.removeItem('tiketku_user');
//         setUser(null);
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   function login(token, userData) {
//     localStorage.setItem('tiketku_token', token);
//     localStorage.setItem('tiketku_user', JSON.stringify(userData));
//     setUser(userData);
//   }

//   function logout() {
//     localStorage.removeItem('tiketku_token');
//     localStorage.removeItem('tiketku_user');
//     setUser(null);
//   }

//   function updateUser(userData) {
//     setUser(userData);
//     localStorage.setItem('tiketku_user', JSON.stringify(userData));
//   }

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }

import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tiketku_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tiketku_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('tiketku_user', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('tiketku_token');
        localStorage.removeItem('tiketku_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData) {
    localStorage.setItem('tiketku_token', token);
    localStorage.setItem('tiketku_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('tiketku_token');
    localStorage.removeItem('tiketku_user');
    setUser(null);
  }

  function updateUser(userData) {
    setUser(userData);
    localStorage.setItem('tiketku_user', JSON.stringify(userData));
  }

  // ===== ROLE HELPERS =====
  const isAdmin = user?.role === 'admin';
  const isEO = user?.role === 'eo';
  const isPetugas = user?.role === 'petugas';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        logout, 
        updateUser,
        isAdmin,
        isEO,
        isPetugas,
        isCustomer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}