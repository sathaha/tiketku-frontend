// import { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import api from '../../api/axios';
// import { useAuth } from '../../context/AuthContext';
// import { getUserWithStats } from '../../api/userApi';

// function Icon({ name, className = 'w-4 h-4' }) {
//   const paths = {
//     camera: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z',
//     user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
//     lock: 'M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zM9 6a3 3 0 016 0v3H9V6z',
//     edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
//     logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
//     x: 'M18 6L6 18M6 6l12 12',
//     mail: 'M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 6l-10 7L2 6',
//     phone: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z',
//     arrowLeft: 'M10 19l-7-7m0 0l7-7m-7 7h18',
//     package: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10',
//     check: 'M5 13l4 4L19 7',
//     ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
//     eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
//   };
//   return (
//     <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
//     </svg>
//   );
// }

// const roleLabel = {
//   customer: 'Customer',
//   admin: 'Admin',
//   petugas: 'Petugas Check-in',
//   eo: 'Event Organizer'
// };

// export default function Profile() {
//   const { id } = useParams();
//   const { user, updateUser, logout } = useAuth();
//   const navigate = useNavigate();
  
//   // State untuk profile yang sedang dilihat
//   const [profileUser, setProfileUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
  
//   // State untuk edit profile (hanya untuk diri sendiri)
//   const [form, setForm] = useState({ name: '', phone: '' });
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState('');
//   const [message, setMessage] = useState('');
//   const [saving, setSaving] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const fileInputRef = useRef(null);

//   const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
//   const [pwMessage, setPwMessage] = useState('');
//   const [pwLoading, setPwLoading] = useState(false);

//   const isOwnProfile = !id || user?.id === parseInt(id);
//   const targetId = id || user?.id;

//   // ===== FETCH PROFILE =====
//   useEffect(() => {
//     const fetchProfile = async () => {
//       if (!user) {
//         navigate('/login');
//         return;
//       }

//       try {
//         setLoading(true);
//         setError('');
        
//         // Pake API baru dengan statistik
//         const res = await getUserWithStats(targetId);
//         setProfileUser(res.data.data);
        
//         // Set form untuk edit (kalo profile sendiri)
//         if (isOwnProfile) {
//           setForm({ 
//             name: res.data.data.name || '', 
//             phone: res.data.data.phone || '' 
//           });
//           setPreview(res.data.data.profile_picture || '');
//         }
//       } catch (err) {
//         console.error('Error fetching profile:', err);
//         if (err.response?.status === 403) {
//           setError('⛔ Anda tidak memiliki akses untuk melihat profile ini');
//         } else if (err.response?.status === 404) {
//           setError('👤 User tidak ditemukan');
//         } else {
//           setError('⚠️ Gagal memuat profile');
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [id, user, navigate]);

//   // ===== HANDLE EDIT PROFILE (untuk diri sendiri) =====
//   async function handleSubmit(e) {
//     e.preventDefault();
//     setSaving(true);
//     setMessage('');
//     try {
//       const formData = new FormData();
//       formData.append('name', form.name);
//       formData.append('phone', form.phone);
//       if (file) formData.append('profile_picture', file);

//       const res = await api.put('/auth/profile', formData, { 
//         headers: { 'Content-Type': 'multipart/form-data' } 
//       });
//       updateUser(res.data.user);
//       setMessage('✅ Profil berhasil diperbarui.');
//       setShowEditModal(false);
//       // Refresh profile
//       const refreshRes = await getUserWithStats(targetId);
//       setProfileUser(refreshRes.data.data);
//     } catch (err) {
//       setMessage(err.response?.data?.message || 'Gagal memperbarui profil.');
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function handleChangePassword(e) {
//     e.preventDefault();
//     setPwMessage('');
//     if (pwForm.new_password !== pwForm.confirm) {
//       setPwMessage('Konfirmasi password tidak cocok.');
//       return;
//     }
//     setPwLoading(true);
//     try {
//       await api.put('/auth/change-password', { 
//         old_password: pwForm.old_password, 
//         new_password: pwForm.new_password 
//       });
//       setPwMessage('✅ Password berhasil diubah.');
//       setPwForm({ old_password: '', new_password: '', confirm: '' });
//       setShowPasswordModal(false);
//     } catch (err) {
//       setPwMessage(err.response?.data?.message || 'Gagal mengubah password.');
//     } finally {
//       setPwLoading(false);
//     }
//   }

//   function handleFileChange(e) {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       setFile(selectedFile);
//       const reader = new FileReader();
//       reader.onloadend = () => setPreview(reader.result);
//       reader.readAsDataURL(selectedFile);
//     }
//   }

//   // ===== LOADING STATE =====
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#f5ede4] flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-800 mx-auto"></div>
//           <p className="mt-3 text-amber-600/50 font-serif text-sm">Memuat profile...</p>
//         </div>
//       </div>
//     );
//   }

//   // ===== ERROR STATE =====
//   if (error) {
//     return (
//       <div className="min-h-screen bg-[#f5ede4] flex items-center justify-center px-5">
//         <div className="bg-white/80 border border-amber-200/40 p-8 max-w-sm w-full text-center">
//           <div className="text-4xl mb-3">😅</div>
//           <p className="text-amber-800/70 font-serif text-sm">{error}</p>
//           <button 
//             onClick={() => navigate(-1)} 
//             className="mt-4 px-6 py-2 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-xs tracking-[0.3em] uppercase transition-colors"
//             style={{ borderRadius: '4px' }}
//           >
//             Kembali
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!profileUser) {
//     return (
//       <div className="min-h-screen bg-[#f5ede4] flex items-center justify-center px-5">
//         <div className="bg-white/80 border border-amber-200/40 p-8 max-w-sm w-full text-center">
//           <p className="text-amber-800/70 font-serif text-sm">User tidak ditemukan</p>
//           <button 
//             onClick={() => navigate(-1)} 
//             className="mt-4 px-6 py-2 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-xs tracking-[0.3em] uppercase transition-colors"
//             style={{ borderRadius: '4px' }}
//           >
//             Kembali
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const role = roleLabel[profileUser.role] || 'User';
//   const canEdit = isOwnProfile;
//   const isAdminView = !isOwnProfile && user?.role === 'admin';

//   return (
//     <div className="min-h-screen bg-[#f5ede4]">
//       {/* Texture overlay */}
//       <div 
//         className="fixed inset-0 opacity-[0.03] pointer-events-none"
//         style={{
//           backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
//           backgroundSize: '200px 200px'
//         }}
//       />

//       <div className="max-w-lg mx-auto px-5 py-8 relative">

//         {/* ===== BACK BUTTON (kalo lagi liat profile orang lain) ===== */}
//         {!isOwnProfile && (
//           <button
//             onClick={() => navigate(-1)}
//             className="flex items-center gap-2 text-amber-600/50 hover:text-amber-700 transition-colors mb-4 font-serif text-sm"
//           >
//             <Icon name="arrowLeft" className="w-4 h-4" />
//             Kembali
//           </button>
//         )}

//         {/* ===== ADMIN BADGE ===== */}
//         {isAdminView && (
//           <div className="mb-4 p-3 bg-amber-100/80 border border-amber-200/50 rounded text-sm text-amber-800/70 font-serif">
//             ⚡ <strong>Admin Mode:</strong> Anda sedang melihat profile <strong>{profileUser.name}</strong>
//           </div>
//         )}

//         {/* ===== PROFILE CARD ===== */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//           className="bg-white/80 border border-amber-200/40 p-6"
//           style={{ borderRadius: '6px' }}
//         >
//           {/* Avatar + Edit button */}
//           <div className="flex items-start justify-between mb-5">
//             <div 
//               onClick={() => canEdit && fileInputRef.current?.click()}
//               className={`relative w-16 h-16 bg-amber-100/80 border-2 border-amber-300/30 overflow-hidden ${canEdit ? 'cursor-pointer group' : ''}`}
//               style={{ borderRadius: '50%' }}
//             >
//               {preview || profileUser.profile_picture ? (
//                 <img 
//                   src={preview || profileUser.profile_picture} 
//                   className="w-full h-full object-cover" 
//                   alt="Profile" 
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center">
//                   <Icon name="user" className="w-7 h-7 text-amber-400/50" />
//                 </div>
//               )}
//               {canEdit && (
//                 <div className="absolute inset-0 bg-amber-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                   <Icon name="camera" className="w-4 h-4 text-white" />
//                 </div>
//               )}
//             </div>

//             {canEdit && (
//               <button
//                 onClick={() => setShowEditModal(true)}
//                 className="p-2 bg-white border border-amber-200/40 hover:border-amber-400/50 hover:bg-amber-50 transition-colors"
//                 style={{ borderRadius: '4px' }}
//                 title="Edit profil"
//               >
//                 <Icon name="edit" className="w-4 h-4 text-amber-700" />
//               </button>
//             )}
//           </div>

//           {/* Info */}
//           <div className="space-y-1.5">
//             <h1 className="font-serif text-lg text-amber-950">{profileUser.name}</h1>
            
//             <div className="flex items-center gap-2 text-[11px] text-amber-600/50">
//               <Icon name="mail" className="w-3.5 h-3.5" />
//               <span>{profileUser.email}</span>
//             </div>

//             {profileUser.phone && (
//               <div className="flex items-center gap-2 text-[11px] text-amber-600/50">
//                 <Icon name="phone" className="w-3.5 h-3.5" />
//                 <span>{profileUser.phone}</span>
//               </div>
//             )}

//             <div className="flex flex-wrap items-center gap-2 mt-2">
//               <span className="inline-block text-[10px] font-serif text-amber-700 bg-amber-100/60 border border-amber-200/50 px-2 py-0.5">
//                 {role}
//               </span>
//               <span className={`inline-block text-[10px] font-serif px-2 py-0.5 border ${
//                 profileUser.is_active 
//                   ? 'text-emerald-700 bg-emerald-100/60 border-emerald-200/50' 
//                   : 'text-red-600 bg-red-100/60 border-red-200/50'
//               }`}>
//                 {profileUser.is_active ? '✓ Aktif' : '✗ Nonaktif'}
//               </span>
//             </div>
//           </div>
//         </motion.div>

//         {/* ===== STATS CARD ===== */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.05, duration: 0.4 }}
//           className="mt-4 grid grid-cols-3 gap-2"
//         >
//           <div className="bg-white/80 border border-amber-200/40 p-4 text-center">
//             <Icon name="package" className="w-5 h-5 text-amber-600/40 mx-auto mb-1.5" />
//             <p className="text-lg font-serif text-amber-950">{profileUser.total_orders || 0}</p>
//             <p className="text-[9px] font-serif text-amber-600/40 uppercase tracking-[0.2em]">Orders</p>
//           </div>
//           <div className="bg-white/80 border border-amber-200/40 p-4 text-center">
//             <Icon name="check" className="w-5 h-5 text-emerald-600/40 mx-auto mb-1.5" />
//             <p className="text-lg font-serif text-amber-950">{profileUser.total_orders_paid || 0}</p>
//             <p className="text-[9px] font-serif text-amber-600/40 uppercase tracking-[0.2em]">Paid</p>
//           </div>
//           <div className="bg-white/80 border border-amber-200/40 p-4 text-center">
//             <Icon name="ticket" className="w-5 h-5 text-purple-600/40 mx-auto mb-1.5" />
//             <p className="text-lg font-serif text-amber-950">{profileUser.total_checkins || 0}</p>
//             <p className="text-[9px] font-serif text-amber-600/40 uppercase tracking-[0.2em]">Check-in</p>
//           </div>
//         </motion.div>

//         {/* ===== TOTAL SPENT ===== */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.08, duration: 0.4 }}
//           className="mt-3 bg-white/80 border border-amber-200/40 p-4 text-center"
//           style={{ borderRadius: '6px' }}
//         >
//           <p className="text-[9px] font-serif text-amber-600/40 uppercase tracking-[0.2em]">Total Belanja</p>
//           <p className="text-xl font-serif text-amber-950">
//             Rp {(profileUser.total_spent || 0).toLocaleString('id-ID')}
//           </p>
//         </motion.div>

//         {/* ===== SETTINGS (hanya untuk diri sendiri) ===== */}
//         {canEdit && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1, duration: 0.4 }}
//             className="mt-4 space-y-2"
//           >
//             <button
//               onClick={() => setShowPasswordModal(true)}
//               className="w-full flex items-center gap-3 px-5 py-3.5 bg-white/80 border border-amber-200/40 hover:border-amber-400/50 transition-colors group"
//               style={{ borderRadius: '6px' }}
//             >
//               <Icon name="lock" className="w-4 h-4 text-amber-600/50 group-hover:text-amber-700 transition-colors" />
//               <span className="font-serif text-[13px] text-amber-950">Ubah Password</span>
//             </button>

//             <button
//               onClick={logout}
//               className="w-full flex items-center gap-3 px-5 py-3.5 bg-white/80 border border-amber-200/40 hover:border-red-200/50 hover:bg-red-50/50 transition-colors group"
//               style={{ borderRadius: '6px' }}
//             >
//               <Icon name="logout" className="w-4 h-4 text-red-500/70" />
//               <span className="font-serif text-[13px] text-red-700/80">Keluar</span>
//             </button>
//           </motion.div>
//         )}

//         {/* Hidden file input */}
//         <input
//           ref={fileInputRef}
//           type="file"
//           accept="image/*"
//           className="hidden"
//           onChange={handleFileChange}
//         />

//         {/* ===== EDIT PROFILE MODAL ===== */}
//         <AnimatePresence>
//           {showEditModal && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
//               onClick={() => setShowEditModal(false)}
//             >
//               <motion.div
//                 initial={{ y: 30, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 exit={{ y: 30, opacity: 0 }}
//                 transition={{ type: 'spring', damping: 25, stiffness: 300 }}
//                 className="bg-white/95 border border-amber-200/50 w-full max-w-sm p-6"
//                 style={{ borderRadius: '8px 8px 0 0' }}
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <div className="flex items-center justify-between mb-5">
//                   <h2 className="font-serif text-lg text-amber-950">Edit Profil</h2>
//                   <button
//                     onClick={() => setShowEditModal(false)}
//                     className="p-1.5 hover:bg-amber-100 transition-colors"
//                     style={{ borderRadius: '4px' }}
//                   >
//                     <Icon name="x" className="w-5 h-5 text-amber-400" />
//                   </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div>
//                     <label className="block text-[10px] font-serif tracking-[0.25em] text-amber-600/50 uppercase mb-1.5">
//                       Nama
//                     </label>
//                     <input
//                       className="w-full px-4 py-2.5 bg-white border border-amber-200/40 text-amber-950 placeholder-amber-400/40 focus:outline-none focus:border-amber-500/60 transition-all font-serif text-sm"
//                       style={{ borderRadius: '4px' }}
//                       value={form.name}
//                       onChange={(e) => setForm({ ...form, name: e.target.value })}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] font-serif tracking-[0.25em] text-amber-600/50 uppercase mb-1.5">
//                       No. HP
//                     </label>
//                     <input
//                       className="w-full px-4 py-2.5 bg-white border border-amber-200/40 text-amber-950 placeholder-amber-400/40 focus:outline-none focus:border-amber-500/60 transition-all font-serif text-sm"
//                       style={{ borderRadius: '4px' }}
//                       value={form.phone}
//                       onChange={(e) => setForm({ ...form, phone: e.target.value })}
//                     />
//                   </div>
//                   <button 
//                     type="submit" 
//                     disabled={saving} 
//                     className="w-full py-3 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif tracking-[0.3em] uppercase text-xs transition-colors disabled:opacity-50"
//                     style={{ borderRadius: '4px' }}
//                   >
//                     {saving ? 'Menyimpan...' : 'Simpan'}
//                   </button>
//                   {message && <p className="text-xs font-serif text-amber-700/60 text-center">{message}</p>}
//                 </form>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* ===== CHANGE PASSWORD MODAL ===== */}
//         <AnimatePresence>
//           {showPasswordModal && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
//               onClick={() => setShowPasswordModal(false)}
//             >
//               <motion.div
//                 initial={{ y: 30, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 exit={{ y: 30, opacity: 0 }}
//                 transition={{ type: 'spring', damping: 25, stiffness: 300 }}
//                 className="bg-white/95 border border-amber-200/50 w-full max-w-sm p-6"
//                 style={{ borderRadius: '8px 8px 0 0' }}
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <div className="flex items-center justify-between mb-5">
//                   <h2 className="font-serif text-lg text-amber-950">Ubah Password</h2>
//                   <button
//                     onClick={() => setShowPasswordModal(false)}
//                     className="p-1.5 hover:bg-amber-100 transition-colors"
//                     style={{ borderRadius: '4px' }}
//                   >
//                     <Icon name="x" className="w-5 h-5 text-amber-400" />
//                   </button>
//                 </div>

//                 <form onSubmit={handleChangePassword} className="space-y-4">
//                   <div>
//                     <label className="block text-[10px] font-serif tracking-[0.25em] text-amber-600/50 uppercase mb-1.5">
//                       Password Lama
//                     </label>
//                     <input
//                       type="password"
//                       required
//                       className="w-full px-4 py-2.5 bg-white border border-amber-200/40 text-amber-950 placeholder-amber-400/40 focus:outline-none focus:border-amber-500/60 transition-all font-serif text-sm"
//                       style={{ borderRadius: '4px' }}
//                       value={pwForm.old_password}
//                       onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] font-serif tracking-[0.25em] text-amber-600/50 uppercase mb-1.5">
//                       Password Baru
//                     </label>
//                     <input
//                       type="password"
//                       required
//                       className="w-full px-4 py-2.5 bg-white border border-amber-200/40 text-amber-950 placeholder-amber-400/40 focus:outline-none focus:border-amber-500/60 transition-all font-serif text-sm"
//                       style={{ borderRadius: '4px' }}
//                       value={pwForm.new_password}
//                       onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] font-serif tracking-[0.25em] text-amber-600/50 uppercase mb-1.5">
//                       Konfirmasi Password Baru
//                     </label>
//                     <input
//                       type="password"
//                       required
//                       className="w-full px-4 py-2.5 bg-white border border-amber-200/40 text-amber-950 placeholder-amber-400/40 focus:outline-none focus:border-amber-500/60 transition-all font-serif text-sm"
//                       style={{ borderRadius: '4px' }}
//                       value={pwForm.confirm}
//                       onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
//                     />
//                   </div>
//                   <button 
//                     type="submit" 
//                     disabled={pwLoading} 
//                     className="w-full py-3 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif tracking-[0.3em] uppercase text-xs transition-colors disabled:opacity-50"
//                     style={{ borderRadius: '4px' }}
//                   >
//                     {pwLoading ? 'Menyimpan...' : 'Ubah Password'}
//                   </button>
//                   {pwMessage && <p className="text-xs font-serif text-amber-700/60 text-center">{pwMessage}</p>}
//                 </form>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { getUserWithStats } from '../../api/userApi';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    camera: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z',
    user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
    lock: 'M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zM9 6a3 3 0 016 0v3H9V6z',
    edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
    x: 'M18 6L6 18M6 6l12 12',
    mail: 'M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 6l-10 7L2 6',
    phone: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z',
    arrowLeft: 'M10 19l-7-7m0 0l7-7m-7 7h18',
    package: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10',
    check: 'M5 13l4 4L19 7',
    ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    event: 'M9 19V6l12-2v13M9 19a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
    qr: 'M12 4v1m0 4v1m4-6h1m-6 0H6M6 5h1M4 4v1m0 4v1M4 12v6m8-6v6m4-6v6m0-10v1m0 4v1',
    scan: 'M4 4h16v16H4V4z M8 8h8v8H8V8z',
    star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

const roleLabel = {
  customer: 'Customer',
  admin: 'Admin',
  petugas: 'Check-in Staff',
  eo: 'Event Organizer'
};

function formatRupiah(amount) {
  if (!amount || amount === 0) return 'Rp 0';
  const rounded = Math.round(amount);
  return `Rp ${rounded.toLocaleString('id-ID')}`;
}

function getStatsConfig(role, profileUser) {
  const baseStats = {
    total_orders: profileUser.total_orders || 0,
    total_orders_paid: profileUser.total_orders_paid || 0,
    total_checkins: profileUser.total_checkins || 0,
    total_spent: profileUser.total_spent || 0,
  };

  if (role === 'admin') {
    return {
      stats: [
        { icon: 'users', label: 'Total Users', value: profileUser.total_users || 0 },
        { icon: 'package', label: 'Total Orders', value: baseStats.total_orders },
        { icon: 'chart', label: 'Revenue', value: formatRupiah(baseStats.total_spent) },
        { icon: 'scan', label: 'Check-ins', value: baseStats.total_checkins },
      ],
    };
  }

  if (role === 'eo') {
    return {
      stats: [
        { icon: 'event', label: 'Total Events', value: profileUser.total_events || 0 },
        { icon: 'ticket', label: 'Tickets Sold', value: profileUser.total_tickets_sold || 0 },
        { icon: 'chart', label: 'Revenue', value: formatRupiah(profileUser.eo_revenue || 0) },
        { icon: 'calendar', label: 'Active Events', value: profileUser.active_events || 0 },
      ],
    };
  }

  if (role === 'petugas') {
    return {
      stats: [
        { icon: 'scan', label: 'Today\'s Scans', value: profileUser.today_scans || 0 },
        { icon: 'calendar', label: 'Weekly Scans', value: profileUser.weekly_scans || 0 },
        { icon: 'check', label: 'Total Check-ins', value: baseStats.total_checkins },
        { icon: 'event', label: 'Active Events', value: profileUser.active_events || 0 },
      ],
    };
  }

  return {
    stats: [
      { icon: 'package', label: 'Total Orders', value: baseStats.total_orders },
      { icon: 'check', label: 'Completed', value: baseStats.total_orders_paid },
      { icon: 'ticket', label: 'Active Tickets', value: profileUser.active_tickets || 0 },
      { icon: 'star', label: 'Reviews', value: profileUser.total_ratings || 0 },
    ],
  };
}

const getStyle = (role) => {
  if (role === 'admin' || role === 'eo') {
    return {
      bg: 'bg-ink-950',
      card: 'bg-ink-800/60 border-ink-700',
      cardHover: 'hover:border-ink-600',
      text: 'text-white',
      textMuted: 'text-ink-400',
      textSecondary: 'text-ink-300',
      accent: role === 'admin' ? 'from-blue-500 to-indigo-600' : 'from-purple-500 to-pink-600',
      badge: role === 'admin' 
        ? 'bg-blue-500/20 text-blue-400' 
        : 'bg-purple-500/20 text-purple-400',
      statBg: 'bg-ink-800/40 border-ink-700',
      statIcon: role === 'admin' ? 'text-blue-400' : 'text-purple-400',
      input: 'bg-ink-800 border-ink-700 text-white placeholder-ink-500 focus:border-ink-500',
      button: role === 'admin' 
        ? 'bg-blue-600 hover:bg-blue-700' 
        : 'bg-purple-600 hover:bg-purple-700',
      modal: 'bg-ink-900 border-ink-700',
      avatarBg: role === 'admin' 
        ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
        : 'bg-gradient-to-br from-purple-500 to-pink-600',
      divider: 'border-ink-700',
      adminBadge: role === 'admin' 
        ? 'bg-blue-500/20 text-blue-300' 
        : 'bg-purple-500/20 text-purple-300',
      roleChip: role === 'admin' 
        ? 'bg-blue-500/10 text-blue-400' 
        : 'bg-purple-500/10 text-purple-400',
    };
  }

  if (role === 'petugas') {
    return {
      bg: 'bg-slate-100',
      card: 'bg-white border-blue-200/50',
      cardHover: 'hover:border-blue-400/50',
      text: 'text-slate-800',
      textMuted: 'text-slate-500',
      textSecondary: 'text-slate-600',
      accent: 'from-blue-500 to-cyan-600',
      badge: 'bg-blue-100/60 text-blue-700',
      statBg: 'bg-white border-blue-200/50',
      statIcon: 'text-blue-500',
      input: 'bg-white border-blue-200/50 text-slate-800 placeholder-slate-400 focus:border-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      modal: 'bg-white border-blue-200/50',
      avatarBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      divider: 'border-blue-200/30',
      adminBadge: 'bg-blue-100/60 text-blue-700',
      roleChip: 'bg-blue-100/60 text-blue-700',
    };
  }

  return {
    bg: 'bg-[#f5ede4]',
    card: 'bg-white border-amber-200/40',
    cardHover: 'hover:border-amber-400/50',
    text: 'text-amber-950',
    textMuted: 'text-amber-600/50',
    textSecondary: 'text-amber-800/70',
    accent: 'from-amber-600 to-amber-800',
    badge: 'bg-amber-100/60 text-amber-700',
    statBg: 'bg-white border-amber-200/40',
    statIcon: 'text-amber-600/40',
    input: 'bg-white border-amber-200/40 text-amber-950 placeholder-amber-400/40 focus:border-amber-500/60',
    button: 'bg-amber-800 hover:bg-amber-700 text-amber-50',
    modal: 'bg-white/95 border-amber-200/50',
    avatarBg: 'bg-amber-800',
    divider: 'border-amber-200/30',
    adminBadge: 'bg-amber-100/80 text-amber-800/70',
    roleChip: 'bg-amber-100/60 text-amber-700',
  };
};

export default function Profile() {
  const { id } = useParams();
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({ name: '', phone: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const fileInputRef = useRef(null);

  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [pwMessage, setPwMessage] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const isOwnProfile = !id || user?.id === parseInt(id);
  const targetId = id || user?.id;
  const profileRole = profileUser?.role || user?.role || 'customer';
  const style = getStyle(profileRole);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const res = await getUserWithStats(targetId);
        setProfileUser(res.data.data);
        if (isOwnProfile) {
          setForm({ name: res.data.data.name || '', phone: res.data.data.phone || '' });
          setPreview(res.data.data.profile_picture || '');
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You don\'t have permission to view this profile');
        } else if (err.response?.status === 404) {
          setError('User not found');
        } else {
          setError('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      if (file) formData.append('profile_picture', file);

      const res = await api.put('/auth/profile', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      updateUser(res.data.user);
      setMessage('Profile updated successfully.');
      setShowEditModal(false);
      const refreshRes = await getUserWithStats(targetId);
      setProfileUser(refreshRes.data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwMessage('');
    if (pwForm.new_password !== pwForm.confirm) {
      setPwMessage('Password confirmation does not match.');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { 
        old_password: pwForm.old_password, 
        new_password: pwForm.new_password 
      });
      setPwMessage('Password changed successfully.');
      setPwForm({ old_password: '', new_password: '', confirm: '' });
      setShowPasswordModal(false);
    } catch (err) {
      setPwMessage(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  }

  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${style.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-800/30 mx-auto"></div>
          <p className="mt-3 text-sm text-ink-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${style.bg} flex items-center justify-center px-5`}>
        <div className={`${style.card} border p-8 max-w-sm w-full text-center rounded-xl`}>
          <p className={style.textSecondary}>{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className={`mt-4 px-6 py-2 ${style.button} rounded-xl transition-colors text-sm`}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profileUser) return null;

  const role = roleLabel[profileUser.role] || 'User';
  const canEdit = isOwnProfile;
  const isAdminView = !isOwnProfile && user?.role === 'admin';
  const statsConfig = getStatsConfig(profileRole, profileUser);

  return (
    <div className={`min-h-screen ${style.bg} py-6`}>
      <div className="max-w-lg mx-auto px-4">
        {/* Back button */}
        {!isOwnProfile && (
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 ${style.textMuted} hover:${style.text} transition-colors mb-4 text-sm`}
          >
            <Icon name="arrowLeft" className="w-4 h-4" />
            Back
          </button>
        )}

        {isAdminView && (
          <div className={`mb-4 p-3 ${style.adminBadge} border rounded-xl text-sm`}>
            ⚡ <strong>Admin Mode:</strong> Viewing <strong>{profileUser.name}</strong>'s profile
          </div>
        )}

        {/* ===== HEADER CARD ===== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`${style.card} border rounded-2xl p-6 ${style.cardHover} transition-all relative`}
        >
          {/* Edit button */}
          {canEdit && (
            <button
              onClick={() => setShowEditModal(true)}
              className={`absolute top-4 right-4 p-2 ${style.card} border ${style.divider} hover:${style.cardHover} transition-colors rounded-xl`}
            >
              <Icon name="edit" className={`w-4 h-4 ${style.textMuted}`} />
            </button>
          )}

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => canEdit && fileInputRef.current?.click()}
              className={`relative w-20 h-20 ${style.avatarBg} border-2 ${style.divider} overflow-hidden rounded-full ${canEdit ? 'cursor-pointer group' : ''}`}
            >
              {preview || profileUser.profile_picture ? (
                <img 
                  src={preview || profileUser.profile_picture} 
                  className="w-full h-full object-cover" 
                  alt="Profile" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/60">
                  <Icon name="user" className="w-8 h-8" />
                </div>
              )}
              {canEdit && (
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Icon name="camera" className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            <h1 className={`mt-3 font-serif text-xl ${style.text}`}>{profileUser.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-3 py-1 ${style.badge} border rounded-full`}>
                {role}
              </span>
              <span className={`text-xs px-3 py-1 border rounded-full ${
                profileUser.is_active 
                  ? 'text-emerald-700 bg-emerald-100/60 border-emerald-200/50' 
                  : 'text-red-600 bg-red-100/60 border-red-200/50'
              }`}>
                {profileUser.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ===== STATS CARD ===== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className={`mt-4 ${style.card} border rounded-2xl p-4 ${style.cardHover} transition-all`}
        >
          <div className="grid grid-cols-4 gap-2">
            {statsConfig.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <Icon name={stat.icon} className={`w-4 h-4 ${style.statIcon} mx-auto mb-1`} />
                <p className={`text-sm font-medium ${style.text}`}>{stat.value}</p>
                <p className={`text-[9px] ${style.textMuted} uppercase tracking-wider`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ===== INFORMATION CARD ===== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
          className={`mt-4 ${style.card} border rounded-2xl p-4 ${style.cardHover} transition-all`}
        >
          <h2 className={`text-xs font-medium ${style.textMuted} uppercase tracking-wider mb-3`}>Information</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Icon name="mail" className={`w-4 h-4 ${style.textMuted}`} />
              <div>
                <p className={`text-[10px] ${style.textMuted} uppercase tracking-wider`}>Email</p>
                <p className={`text-sm ${style.text}`}>{profileUser.email}</p>
              </div>
            </div>
            
            {profileUser.phone && (
              <div className="flex items-center gap-3">
                <Icon name="phone" className={`w-4 h-4 ${style.textMuted}`} />
                <div>
                  <p className={`text-[10px] ${style.textMuted} uppercase tracking-wider`}>Phone</p>
                  <p className={`text-sm ${style.text}`}>{profileUser.phone}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Icon name="calendar" className={`w-4 h-4 ${style.textMuted}`} />
              <div>
                <p className={`text-[10px] ${style.textMuted} uppercase tracking-wider`}>Joined</p>
                <p className={`text-sm ${style.text}`}>
                  {new Date(profileUser.created_at).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ===== SETTINGS ===== */}
        {canEdit && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mt-4 space-y-2"
          >
            <button
              onClick={() => setShowPasswordModal(true)}
              className={`w-full flex items-center justify-between px-4 py-3 ${style.card} border ${style.divider} hover:${style.cardHover} transition-colors rounded-xl`}
            >
              <div className="flex items-center gap-3">
                <Icon name="lock" className={`w-4 h-4 ${style.textMuted}`} />
                <span className={`text-sm ${style.text}`}>Change Password</span>
              </div>
              <Icon name="arrowLeft" className={`w-4 h-4 ${style.textMuted} rotate-180`} />
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/80 border border-red-200/40 hover:border-red-200/50 hover:bg-red-50/50 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Icon name="logout" className="w-4 h-4 text-red-500/70" />
                <span className="text-sm text-red-700/80">Logout</span>
              </div>
              <Icon name="arrowLeft" className="w-4 h-4 text-red-500/70 rotate-180" />
            </button>
          </motion.div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ===== EDIT MODAL ===== */}
        <AnimatePresence>
          {showEditModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`${style.modal} border w-full max-w-sm p-6 rounded-t-2xl md:rounded-2xl`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`flex items-center justify-between mb-5 ${style.divider} pb-4`}>
                  <h2 className={`font-serif text-lg ${style.text}`}>Edit Profile</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-1.5 rounded-lg hover:bg-ink-700/50 transition-colors"
                  >
                    <Icon name="x" className={`w-5 h-5 ${style.textMuted}`} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-xs ${style.textMuted} uppercase tracking-wider mb-1.5`}>
                      Name
                    </label>
                    <input
                      className={`w-full px-4 py-2.5 ${style.input} rounded-xl transition-all text-sm`}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${style.textMuted} uppercase tracking-wider mb-1.5`}>
                      Phone Number
                    </label>
                    <input
                      className={`w-full px-4 py-2.5 ${style.input} rounded-xl transition-all text-sm`}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={saving} 
                    className={`w-full py-3 ${style.button} font-medium rounded-xl transition-colors disabled:opacity-50 text-sm`}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {message && <p className={`text-xs ${style.textMuted} text-center`}>{message}</p>}
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== PASSWORD MODAL ===== */}
        <AnimatePresence>
          {showPasswordModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
              onClick={() => setShowPasswordModal(false)}
            >
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`${style.modal} border w-full max-w-sm p-6 rounded-t-2xl md:rounded-2xl`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`flex items-center justify-between mb-5 ${style.divider} pb-4`}>
                  <h2 className={`font-serif text-lg ${style.text}`}>Change Password</h2>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="p-1.5 rounded-lg hover:bg-ink-700/50 transition-colors"
                  >
                    <Icon name="x" className={`w-5 h-5 ${style.textMuted}`} />
                  </button>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className={`block text-xs ${style.textMuted} uppercase tracking-wider mb-1.5`}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      className={`w-full px-4 py-2.5 ${style.input} rounded-xl transition-all text-sm`}
                      value={pwForm.old_password}
                      onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${style.textMuted} uppercase tracking-wider mb-1.5`}>
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      className={`w-full px-4 py-2.5 ${style.input} rounded-xl transition-all text-sm`}
                      value={pwForm.new_password}
                      onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${style.textMuted} uppercase tracking-wider mb-1.5`}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      className={`w-full px-4 py-2.5 ${style.input} rounded-xl transition-all text-sm`}
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={pwLoading} 
                    className={`w-full py-3 ${style.button} font-medium rounded-xl transition-colors disabled:opacity-50 text-sm`}
                  >
                    {pwLoading ? 'Saving...' : 'Change Password'}
                  </button>
                  {pwMessage && <p className={`text-xs ${style.textMuted} text-center`}>{pwMessage}</p>}
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}