// // import { Navigate } from 'react-router-dom';
// // import { useAuth } from '../context/AuthContext';

// // export default function ProtectedRoute({ children, roles }) {
// //   const { user, loading } = useAuth();

// //   if (loading) {
// //     return (
// //       <div className="flex items-center justify-center min-h-screen text-ink-muted">
// //         Memuat...
// //       </div>
// //     );
// //   }

// //   if (!user) return <Navigate to="/login" replace />;

// //   if (roles && !roles.includes(user.role)) {
// //     return <Navigate to="/" replace />;
// //   }

// //   return children;
// // }

// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function ProtectedRoute({ children, roles }) {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen text-ink-muted">
//         Memuat...
//       </div>
//     );
//   }

//   if (!user) return <Navigate to="/login" replace />;

//   if (roles && !roles.includes(user.role)) {
//     // Redirect ke dashboard sesuai role masing-masing
//     if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
//     if (user.role === 'eo') return <Navigate to="/eo/dashboard" replace />;
//     if (user.role === 'petugas') return <Navigate to="/petugas/scan" replace />;
//     return <Navigate to="/" replace />;
//   }

//   return children;
// }

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ink-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="font-serif text-amber-400/60 text-xs tracking-[0.3em] uppercase">
            Memuat...
          </p>
        </div>
      </div>
    );
  }

  // Belum login → arahkan ke landing page dengan "from" state
  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // Role tidak sesuai → arahkan ke dashboard role masing-masing
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'eo') return <Navigate to="/eo/dashboard" replace />;
    if (user.role === 'petugas') return <Navigate to="/petugas/scan" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}