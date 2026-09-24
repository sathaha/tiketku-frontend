// import { Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import ProtectedRoute from './components/ProtectedRoute';
// import AdminLayout from './components/AdminLayout';
// import { useAuth } from './context/AuthContext';

// import Login from './pages/auth/Login';
// import Register from './pages/auth/Register';

// import Home from './pages/customer/Home';
// import ConcertDetail from './pages/customer/ConcertDetail';
// import Checkout from './pages/customer/Checkout';
// import OrderDetail from './pages/customer/OrderDetail';
// import MyOrders from './pages/customer/MyOrders';
// import Profile from './pages/customer/Profile';
// import About from './pages/About';
// import Contact from './pages/Contact';
// import ContactHistory from './pages/customer/ContactHistory';
// import CustomerPromos from './pages/customer/Promos';        // ← RENAME

// import Dashboard from './pages/admin/Dashboard';
// import Concerts from './pages/admin/Concerts';
// import ConcertManage from './pages/admin/ConcertManage';
// import Venues from './pages/admin/Venues';
// import Categories from './pages/admin/Categories';
// import Users from './pages/admin/Users';
// import Orders from './pages/admin/Orders';
// import AdminPromos from './pages/admin/Promos';             // ← RENAME
// import Reports from './pages/admin/Reports';
// import Approvals from './pages/admin/Approvals';
// import AdminPayouts from './pages/admin/Payouts';
// import ContactMessages from './pages/admin/ContactMessages';

// import Scan from './pages/petugas/Scan';
// import CheckinHistory from './pages/petugas/CheckinHistory';

// import EoDashboard from './pages/eo/Dashboard';
// import EoConcerts from './pages/eo/Concerts';
// import EoPayouts from './pages/eo/Payouts';
// import EoBankAccount from './pages/eo/BankAccount';

// export default function App() {
//   const { user } = useAuth();
//   const isAdminOrEO = user && (user.role === 'admin' || user.role === 'eo');

//   return (
//     <div className="min-h-screen bg-ink-900">
//       {/* Navbar hanya untuk customer dan petugas */}
//       {!isAdminOrEO && <Navbar />}

//       <Routes>
//         {/* Auth */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />

//         {/* Customer */}
//         <Route path="/" element={<Home />} />
//         <Route path="/concerts/:id" element={<ConcertDetail />} />
//         <Route path="/checkout" element={<ProtectedRoute roles={['customer']}><Checkout /></ProtectedRoute>} />
//         <Route path="/my-orders" element={<ProtectedRoute roles={['customer']}><MyOrders /></ProtectedRoute>} />
//         <Route path="/orders/:id" element={<ProtectedRoute roles={['customer']}><OrderDetail /></ProtectedRoute>} />
//         <Route path="/about" element={<About />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route path="/contact-history" element={
//           <ProtectedRoute roles={['customer']}><ContactHistory /></ProtectedRoute>
//         } />
//         <Route path="/promos" element={<CustomerPromos />} />   {/* ← pakai CustomerPromos */}

//         {/* ===== PROFILE ROUTES ===== */}
//         <Route path="/profile" element={
//           <ProtectedRoute>
//             <Profile />
//           </ProtectedRoute>
//         } />

//         <Route path="/profile/:id" element={
//           <ProtectedRoute roles={['admin']}>
//             <Profile />
//           </ProtectedRoute>
//         } />

//         {/* Admin - dengan Sidebar Layout */}
//         <Route path="/admin/dashboard" element={
//           <ProtectedRoute roles={['admin']}>
//             <AdminLayout><Dashboard /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/admin/concerts" element={
//           <ProtectedRoute roles={['admin']}>
//             <AdminLayout><Concerts /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/admin/concerts/:id/manage" element={
//           <ProtectedRoute roles={['admin']}>
//             <AdminLayout><ConcertManage /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/admin/venues" element={
//           <ProtectedRoute roles={['admin']}>
//             <AdminLayout><Venues /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/admin/categories" element={
//           <ProtectedRoute roles={['admin']}>
//             <AdminLayout><Categories /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/admin/users" element={
//           <ProtectedRoute roles={['admin']}>
//             <AdminLayout><Users /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/admin/orders" element={
//           <ProtectedRoute roles={['admin']}>
//             <AdminLayout><Orders /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/admin/promos" element={
//           <ProtectedRoute roles={['admin']}>
//             <AdminLayout><AdminPromos /></AdminLayout>       {/* ← pakai AdminPromos */}
//           </ProtectedRoute>
//         } />
//         <Route path="/admin/reports" element={
//           <ProtectedRoute roles={['admin']}>
//             <AdminLayout><Reports /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/admin/approvals" element={
//           <ProtectedRoute roles={['admin']}>
//             <AdminLayout><Approvals /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/admin/payouts" element={
//           <ProtectedRoute roles={['admin']}>
//             <AdminLayout><AdminPayouts /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/admin/contact-messages" element={
//           <ProtectedRoute roles={['admin']}>
//             <AdminLayout><ContactMessages /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/admin/profile" element={
//           <ProtectedRoute roles={['admin']}>
//             <AdminLayout><Profile /></AdminLayout>
//           </ProtectedRoute>
//         } />

//         {/* Petugas - tanpa sidebar, pakai Navbar biasa */}
//         <Route path="/petugas/scan" element={<ProtectedRoute roles={['petugas']}><Scan /></ProtectedRoute>} />
//         <Route path="/petugas/history" element={<ProtectedRoute roles={['petugas']}><CheckinHistory /></ProtectedRoute>} />
//         <Route path="/petugas/profile" element={<ProtectedRoute roles={['petugas']}><Profile /></ProtectedRoute>} />

//         {/* Event Organizer - dengan Sidebar Layout */}
//         <Route path="/eo/dashboard" element={
//           <ProtectedRoute roles={['eo']}>
//             <AdminLayout><EoDashboard /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/eo/concerts" element={
//           <ProtectedRoute roles={['eo']}>
//             <AdminLayout><EoConcerts /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/eo/concerts/:id/manage" element={
//           <ProtectedRoute roles={['eo']}>
//             <AdminLayout><ConcertManage /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/eo/payouts" element={
//           <ProtectedRoute roles={['eo']}>
//             <AdminLayout><EoPayouts /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/eo/profile" element={
//           <ProtectedRoute roles={['eo']}>
//             <AdminLayout><Profile /></AdminLayout>
//           </ProtectedRoute>
//         } />
//         <Route path="/eo/bank-account" element={
//           <ProtectedRoute roles={['eo']}>
//             <AdminLayout><EoBankAccount /></AdminLayout>
//           </ProtectedRoute>
//         } />

//         {/* 404 */}
//         <Route path="*" element={
//           <div className="text-center py-20">
//             <div className="text-6xl mb-4">🔍</div>
//             <h1 className="text-2xl font-bold text-white mb-2">Halaman tidak ditemukan</h1>
//             <p className="text-ink-300">Halaman yang kamu cari mungkin sudah dihapus atau tidak valid.</p>
//           </div>
//         } />
//       </Routes>
//     </div>
//   );
// }

import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import { useAuth } from './context/AuthContext';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Landing
import LandingPage from './pages/LandingPage';
import Test3D from './pages/Test3D';

// Customer
import Home from './pages/customer/Home';
import ConcertDetail from './pages/customer/ConcertDetail';
import Checkout from './pages/customer/Checkout';
import OrderDetail from './pages/customer/OrderDetail';
import MyOrders from './pages/customer/MyOrders';
import Profile from './pages/customer/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import ContactHistory from './pages/customer/ContactHistory';
import CustomerPromos from './pages/customer/Promos';
import ConcertsPublic from './pages/Concerts';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Admin
import Dashboard from './pages/admin/Dashboard';
import Concerts from './pages/admin/Concerts';
import ConcertManage from './pages/admin/ConcertManage';
import Venues from './pages/admin/Venues';
import Categories from './pages/admin/Categories';
import Users from './pages/admin/Users';
import Orders from './pages/admin/Orders';
import AdminPromos from './pages/admin/Promos';
import Reports from './pages/admin/Reports';
import Approvals from './pages/admin/Approvals';
import AdminPayouts from './pages/admin/Payouts';
import ContactMessages from './pages/admin/ContactMessages';

// Petugas
import Scan from './pages/petugas/Scan';
import CheckinHistory from './pages/petugas/CheckinHistory';

// EO
import EoDashboard from './pages/eo/Dashboard';
import EoConcerts from './pages/eo/Concerts';
import EoPayouts from './pages/eo/Payouts';
import EoBankAccount from './pages/eo/BankAccount';

// ===== ROOT PAGE: Landing atau Home tergantung auth =====
function RootPage() {
  const { user, loading } = useAuth();

  // Tahan render sampai auth selesai dicek biar tidak "flash" landing page
  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Belum login → landing page
  if (!user) return <LandingPage />;

  // Admin / EO → langsung dashboard mereka
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'eo') return <Navigate to="/eo/dashboard" replace />;

  // Customer / Petugas → Home (katalog)
  return <Home />;
}

export default function App() {
  const { user } = useAuth();
  const isAdminOrEO = user && (user.role === 'admin' || user.role === 'eo');

  return (
    <div className="min-h-screen bg-ink-900">
      {/* Navbar hanya untuk customer & petugas */}
      {!isAdminOrEO && <Navbar />}

      <Routes>
        {/* ===== ROOT: Landing atau Home ===== */}
        <Route path="/" element={<RootPage />} />
        <Route path="/test-3d" element={<Test3D />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ===== Customer ===== */}
        <Route path="/home" element={<Home />} />
        <Route path="/concerts/:id" element={<ConcertDetail />} />
        <Route path="/checkout" element={
          <ProtectedRoute roles={['customer']}><Checkout /></ProtectedRoute>
        } />
        <Route path="/my-orders" element={
          <ProtectedRoute roles={['customer']}><MyOrders /></ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute roles={['customer']}><OrderDetail /></ProtectedRoute>
        } />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/contact-history" element={
          <ProtectedRoute roles={['customer']}><ContactHistory /></ProtectedRoute>
        } />
        <Route path="/promos" element={<CustomerPromos />} />
        {/* ===== Customer ===== */}
        <Route path="/concerts" element={<ConcertsPublic />} />   {/* ⬅️ pakai alias */}
        <Route path="/home" element={<Home />} />
        <Route path="/concerts/:id" element={<ConcertDetail />} />

        {/* ===== Profile ===== */}
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute roles={['admin']}><Profile /></ProtectedRoute>
        } />

        {/* ===== Admin ===== */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><Dashboard /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/concerts" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><Concerts /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/concerts/:id/manage" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><ConcertManage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/venues" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><Venues /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/categories" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><Categories /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><Users /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><Orders /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/promos" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><AdminPromos /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><Reports /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/approvals" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><Approvals /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/payouts" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><AdminPayouts /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/contact-messages" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><ContactMessages /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><Profile /></AdminLayout>
          </ProtectedRoute>
        } />

        {/* ===== Petugas ===== */}
        <Route path="/petugas/scan" element={
          <ProtectedRoute roles={['petugas']}><Scan /></ProtectedRoute>
        } />
        <Route path="/petugas/history" element={
          <ProtectedRoute roles={['petugas']}><CheckinHistory /></ProtectedRoute>
        } />
        <Route path="/petugas/profile" element={
          <ProtectedRoute roles={['petugas']}><Profile /></ProtectedRoute>
        } />

        {/* ===== EO ===== */}
        <Route path="/eo/dashboard" element={
          <ProtectedRoute roles={['eo']}>
            <AdminLayout><EoDashboard /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/eo/concerts" element={
          <ProtectedRoute roles={['eo']}>
            <AdminLayout><EoConcerts /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/eo/concerts/:id/manage" element={
          <ProtectedRoute roles={['eo']}>
            <AdminLayout><ConcertManage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/eo/payouts" element={
          <ProtectedRoute roles={['eo']}>
            <AdminLayout><EoPayouts /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/eo/profile" element={
          <ProtectedRoute roles={['eo']}>
            <AdminLayout><Profile /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/eo/bank-account" element={
          <ProtectedRoute roles={['eo']}>
            <AdminLayout><EoBankAccount /></AdminLayout>
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold text-white mb-2">Halaman tidak ditemukan</h1>
            <p className="text-ink-300">Halaman yang kamu cari mungkin sudah dihapus atau tidak valid.</p>
          </div>
        } />
      </Routes>
    </div>
  );
}