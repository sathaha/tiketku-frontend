// import { useEffect, useState, useRef } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import api from '../../api/axios';
// import { useAuth } from '../../context/AuthContext';
// import { Loading, StarRating, formatRupiah, formatDate } from '../../components/Ui';
// import { getImageUrl } from '../../utils/image';

// // ===== ICON COMPONENT =====
// function Icon({ name, className = 'w-4 h-4' }) {
//   const paths = {
//     pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
//     mic: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
//     star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
//     calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
//     clock: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
//     share: 'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13',
//     heart: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
//     users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z',
//     check: 'M20 6L9 17l-5-5',
//     chevronDown: 'M6 9l6 6 6-6',
//     chevronLeft: 'M15 19l-7-7 7-7',
//     chevronRight: 'M9 6l6 6-6 6',
//     map: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16',
//     info: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01',
//     ticket: 'M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
//     flame: 'M12 23c-4.97 0-9-3.582-9-8 0-4.418 4.03-8.259 6.5-10.5C10.5 3.5 12 1 12 1s1.5 2.5 2.5 3.5C16.97 6.741 21 10.582 21 15c0 4.418-4.03 8-9 8z',
//     arrow: 'M13 7l5 5-5 5M6 12h12',
//     lock: 'M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zM9 6a3 3 0 016 0v3H9V6z',
//     shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
//     home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z',
//   };
//   return (
//     <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
//     </svg>
//   );
// }

// // ===== TICKET STATUS BADGE (dynamic) =====
// function TicketStatusBadge({ concert }) {
//   const totalRemaining = (concert.ticket_categories || []).reduce(
//     (sum, tc) => sum + (Number(tc.remaining) || 0),
//     0
//   );
//   const isSoldOut = totalRemaining <= 0 && (concert.ticket_categories || []).length > 0;
//   const nearestDate = concert.schedules?.[0]?.event_date;
//   const isPastEvent = nearestDate ? new Date(nearestDate) < new Date() : false;

//   let status = {
//     label: 'Tickets Available',
//     color: 'text-emerald-700',
//     bg: 'bg-emerald-500/10',
//     border: 'border-emerald-500/30',
//     dot: 'bg-emerald-500',
//   };

//   const statusLower = (concert.status || '').toLowerCase();

//   if (statusLower === 'draft') {
//     status = {
//       label: 'Not Published',
//       color: 'text-yellow-700',
//       bg: 'bg-yellow-500/10',
//       border: 'border-yellow-500/30',
//       dot: 'bg-yellow-500',
//     };
//   } else if (statusLower === 'cancelled' || statusLower === 'dibatalkan') {
//     status = {
//       label: 'Event Cancelled',
//       color: 'text-red-700',
//       bg: 'bg-red-500/10',
//       border: 'border-red-500/30',
//       dot: 'bg-red-500',
//     };
//   } else if (statusLower === 'selesai' || statusLower === 'completed' || isPastEvent) {
//     status = {
//       label: 'Event Ended',
//       color: 'text-zinc-600',
//       bg: 'bg-zinc-500/10',
//       border: 'border-zinc-500/30',
//       dot: 'bg-zinc-500',
//     };
//   } else if (isSoldOut) {
//     status = {
//       label: 'Sold Out',
//       color: 'text-red-700',
//       bg: 'bg-red-500/10',
//       border: 'border-red-500/30',
//       dot: 'bg-red-500',
//     };
//   } else if (statusLower === 'published' || statusLower === 'aktif') {
//     if (nearestDate) {
//       const daysUntil = Math.ceil(
//         (new Date(nearestDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
//       );
//       if (daysUntil > 0 && daysUntil <= 7) {
//         status = {
//           label: 'Coming Soon',
//           color: 'text-blue-700',
//           bg: 'bg-blue-500/10',
//           border: 'border-blue-500/30',
//           dot: 'bg-blue-500',
//         };
//       }
//     }
//   }

//   return (
//     <span
//       className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-serif tracking-[0.15em] uppercase shrink-0 ${status.bg} ${status.border} ${status.color}`}
//     >
//       <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
//       {status.label}
//     </span>
//   );
// }

// // ===== COUNTDOWN TIMER =====
// function CountdownTimer({ targetDate }) {
//   const [timeLeft, setTimeLeft] = useState(null);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const distance = new Date(targetDate).getTime() - Date.now();
//       if (distance < 0) { setTimeLeft(null); clearInterval(timer); return; }
//       setTimeLeft({
//         days: Math.floor(distance / (1000 * 60 * 60 * 24)),
//         hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
//         minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
//         seconds: Math.floor((distance % (1000 * 60)) / 1000),
//       });
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [targetDate]);

//   if (!timeLeft) return null;

//   return (
//     <div className="flex gap-2">
//       {[
//         { value: timeLeft.days, label: 'Days' },
//         { value: timeLeft.hours, label: 'Hours' },
//         { value: timeLeft.minutes, label: 'Mins' },
//         { value: timeLeft.seconds, label: 'Secs' },
//       ].map((item, idx) => (
//         <div key={idx} className="text-center">
//           <div className="bg-amber-950/80 backdrop-blur border border-amber-500/30 rounded-lg px-3 py-2 min-w-[50px]">
//             <span className="text-xl font-serif font-bold text-amber-400">
//               {String(item.value).padStart(2, '0')}
//             </span>
//           </div>
//           <span className="text-[10px] font-serif text-amber-300/50 uppercase tracking-wider">{item.label}</span>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ===== SECTION HEADING =====
// function SectionHeading({ id, label, action }) {
//   return (
//     <div className="flex items-center justify-between mb-4 scroll-mt-28" id={id}>
//       <div className="flex items-center gap-2.5">
//         <div className="w-1 h-5 bg-amber-600" />
//         <h2 className="font-serif text-lg text-amber-900 tracking-wide">{label}</h2>
//       </div>
//       {action}
//     </div>
//   );
// }

// // ===== TICKET PANEL =====
// function TicketPanel({ concert, selectedSchedule, setSelectedSchedule, selectedCategory, setSelectedCategory, qty, setQty, total, handleBuy, user, ticketNo, category, remaining }) {
//   return (
//     <div className="bg-white border border-amber-200/60 rounded-2xl overflow-hidden">
//       <div className="bg-amber-900 px-5 py-4 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <Icon name="ticket" className="w-4 h-4 text-amber-400" />
//           <span className="font-serif text-xs tracking-[0.25em] text-amber-200 uppercase">E-Ticket</span>
//         </div>
//         <span className="font-mono text-[10px] tracking-[0.3em] text-amber-400/80 uppercase">{ticketNo}</span>
//       </div>

//       <div className="p-5">
//         {concert.schedules?.length > 0 && (
//           <div className="mb-4">
//             <label className="text-[10px] font-serif tracking-[0.3em] text-amber-600/60 uppercase mb-1.5 block">
//               Schedule
//             </label>
//             <select
//               className="w-full px-4 py-2.5 bg-white border border-amber-200/60 text-amber-950 rounded-lg focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-all font-serif text-sm"
//               value={selectedSchedule}
//               onChange={(e) => setSelectedSchedule(e.target.value)}
//             >
//               {concert.schedules.map((s) => (
//                 <option key={s.id} value={s.id}>
//                   {formatDate(s.event_date)} · {s.start_time?.slice(0, 5)}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         <div className="space-y-2 mb-4">
//           <label className="text-[10px] font-serif tracking-[0.3em] text-amber-600/60 uppercase mb-1.5 block">
//             Ticket Category
//           </label>
//           {concert.ticket_categories.map((tc) => (
//             <button
//               key={tc.id}
//               onClick={() => { setSelectedCategory(tc.id); setQty(1); }}
//               className={`w-full text-left border rounded-lg p-3 transition-all ${
//                 String(selectedCategory) === String(tc.id)
//                   ? 'border-amber-600 bg-amber-50 shadow-sm shadow-amber-900/10'
//                   : 'border-amber-200/60 hover:border-amber-400/60'
//               } ${tc.remaining <= 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
//               disabled={tc.remaining <= 0}
//             >
//               <div className="flex items-center justify-between mb-1">
//                 <div className="flex items-center gap-2">
//                   {String(selectedCategory) === String(tc.id) && (
//                     <Icon name="check" className="w-4 h-4 text-amber-600" />
//                   )}
//                   <p className="font-serif font-medium text-amber-900 text-sm">{tc.name}</p>
//                 </div>
//                 <p className="font-serif font-bold text-sm text-amber-800">{formatRupiah(tc.price)}</p>
//               </div>
//               <p className={`text-xs font-serif ${tc.remaining <= 10 ? 'text-red-600' : 'text-amber-600/60'}`}>
//                 {tc.remaining > 0 ? `${tc.remaining} tickets left` : 'Sold out'}
//               </p>
//             </button>
//           ))}
//         </div>

//         {category && remaining > 0 && (
//           <div className="mb-4">
//             <label className="text-[10px] font-serif tracking-[0.3em] text-amber-600/60 uppercase mb-1.5 block">
//               Quantity
//             </label>
//             <div className="flex items-center justify-between bg-white border border-amber-200/60 rounded-lg p-1">
//               <button
//                 onClick={() => setQty((q) => Math.max(1, q - 1))}
//                 className="w-10 h-10 flex items-center justify-center text-amber-900 hover:bg-amber-100/50 rounded transition-colors text-lg"
//               >
//                 −
//               </button>
//               <span className="text-lg font-serif font-bold text-amber-900">{qty}</span>
//               <button
//                 onClick={() => setQty((q) => Math.min(remaining, q + 1))}
//                 className="w-10 h-10 flex items-center justify-center text-amber-900 hover:bg-amber-100/50 rounded transition-colors text-lg"
//               >
//                 +
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="flex items-center justify-between py-3 border-t border-amber-200/60">
//           <span className="text-[10px] font-serif tracking-[0.3em] text-amber-600/60 uppercase">Total</span>
//           <span className="font-serif text-xl font-bold text-amber-800">{formatRupiah(total)}</span>
//         </div>

//         <button
//           onClick={handleBuy}
//           disabled={!category || remaining <= 0}
//           className="w-full py-3.5 bg-amber-800 hover:bg-amber-700 disabled:bg-amber-200/50 disabled:text-amber-400 text-white font-serif tracking-[0.2em] uppercase text-xs rounded-xl transition-colors mt-2"
//         >
//           {!user ? 'Log in to Buy' : remaining <= 0 ? 'Sold Out' : 'Buy Now'}
//         </button>

//         <p className="text-[10px] font-serif text-amber-400/60 text-center mt-3 flex items-center justify-center gap-1">
//           <Icon name="info" className="w-3 h-3" />
//           Tickets are non-refundable
//         </p>
//       </div>
//     </div>
//   );
// }

// // ===== MAIN COMPONENT =====
// export default function ConcertDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [concert, setConcert] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedSchedule, setSelectedSchedule] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [qty, setQty] = useState(1);
//   const [error, setError] = useState('');
//   const [ticketNo] = useState(generateTicketNo);
//   const [isFavorite, setIsFavorite] = useState(false);
//   const [showShare, setShowShare] = useState(false);
//   const [showAllReviews, setShowAllReviews] = useState(false);
//   const [openFaq, setOpenFaq] = useState(null);

//   useEffect(() => {
//     fetchDetail();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   async function fetchDetail() {
//     setLoading(true);
//     try {
//       const res = await api.get(`/concerts/${id}`);
//       setConcert(res.data);
//       if (res.data.schedules?.length) setSelectedSchedule(res.data.schedules[0].id);
//       if (res.data.ticket_categories?.length) setSelectedCategory(res.data.ticket_categories[0].id);
//     } catch (err) {
//       setError('Failed to load concert details.');
//     } finally {
//       setLoading(false);
//     }
//   }

//   function handleBuy() {
//     if (!user) return navigate('/login');
//     if (!selectedCategory) return;
//     navigate('/checkout', {
//       state: { concert_id: concert.id, schedule_id: selectedSchedule || null, ticket_category_id: selectedCategory, qty },
//     });
//   }

//   function handleShare() {
//     if (navigator.share) {
//       navigator.share({
//         title: concert.name,
//         text: `Check out ${concert.name} by ${concert.artist}!`,
//         url: window.location.href,
//       });
//     } else {
//       setShowShare(true);
//       setTimeout(() => setShowShare(false), 2000);
//       navigator.clipboard.writeText(window.location.href);
//     }
//   }

//   function generateTicketNo() {
//     const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
//     let code = '';
//     for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
//     return `SEAT-${code}`;
//   }

//   if (loading) return <Loading />;
//   if (!concert) return <div className="max-w-3xl mx-auto p-8 text-center text-amber-800/50 font-serif">{error || 'Concert not found.'}</div>;

//   const category = concert.ticket_categories.find((c) => String(c.id) === String(selectedCategory));
//   const remaining = category ? category.remaining : 0;
//   const total = (category?.price || 0) * qty;
//   const nearestSchedule = concert.schedules?.[0];
//   const reviews = showAllReviews ? concert.reviews : concert.reviews?.slice(0, 3);

//   const faqs = [
//     { question: 'How do I get my e-ticket?', answer: 'E-tickets will be sent to your email after payment is successful. You can also view them in your My Tickets page.' },
//     { question: 'Are tickets refundable?', answer: 'Tickets are non-refundable, unless the event is cancelled by the organizer.' },
//     { question: 'Can I bring a professional camera?', answer: 'Professional cameras with interchangeable lenses are not allowed. Compact cameras and smartphones are permitted.' },
//     { question: 'Is there an age limit?', answer: 'Some events have age restrictions. Please check the event description for more information.' },
//   ];

//   return (
//     <div className="min-h-screen bg-[#f5ede4]">

//       {/* ===== HERO BANNER ===== */}
//       <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
//         <motion.div
//           className="absolute inset-0"
//           initial={{ scale: 1.1, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ duration: 0.7, ease: 'easeOut' }}
//         >
//           {concert.poster ? (
//             <img src={getImageUrl(concert.poster)} alt={concert.name} className="w-full h-full object-cover" />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center bg-amber-900/20 text-amber-600/30">
//               <Icon name="mic" className="w-20 h-20" />
//             </div>
//           )}
//         </motion.div>

//         <div className="absolute inset-0 bg-gradient-to-t from-[#f5ede4] via-[#f5ede4]/60 to-transparent" />

//         <div className="absolute top-4 inset-x-4 flex items-center justify-between">
//           <Link
//             to="/"
//             className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/40 backdrop-blur border border-amber-200/40 text-amber-800 hover:border-amber-500/50 transition-colors text-xs font-serif"
//           >
//             <Icon name="chevronLeft" className="w-4 h-4" />
//             Back
//           </Link>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setIsFavorite(!isFavorite)}
//               className={`p-2 rounded-full backdrop-blur border transition-colors ${
//                 isFavorite
//                   ? 'bg-amber-500/20 border-amber-500/50 text-amber-500'
//                   : 'bg-white/40 border-amber-200/40 text-amber-700/50 hover:border-amber-500/50'
//               }`}
//             >
//               <Icon name="heart" className="w-5 h-5" />
//             </button>
//             <button
//               onClick={handleShare}
//               className="p-2 rounded-full bg-white/40 backdrop-blur border border-amber-200/40 text-amber-700/50 hover:border-amber-500/50 transition-colors"
//             >
//               <Icon name="share" className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         {nearestSchedule && (
//           <div className="absolute bottom-6 right-4 hidden md:block">
//             <CountdownTimer targetDate={nearestSchedule.event_date} />
//           </div>
//         )}
//       </div>

//       {/* ===== MAIN CONTENT ===== */}
//       <div className="max-w-7xl mx-auto px-4 py-8">

//         {/* BREADCRUMB */}
//         <div className="flex items-center gap-2 text-xs font-serif text-amber-700/60 mb-4">
//           <Link to="/" className="hover:text-amber-900 transition-colors flex items-center gap-1">
//             <Icon name="home" className="w-3 h-3" />
//             Home
//           </Link>
//           <span>/</span>
//           <span className="text-amber-700/40">{concert.category_name || 'Events'}</span>
//           <span>/</span>
//           <span className="text-amber-900 truncate">{concert.name}</span>
//         </div>

//         {/* TITLE + BADGE */}
//         <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-3 flex-wrap mb-2">
//               <h1 className="font-serif text-3xl md:text-4xl text-amber-950 leading-tight">
//                 {concert.name}
//               </h1>
//               <TicketStatusBadge concert={concert} />
//             </div>
//             <p className="text-lg font-serif text-amber-700/70">
//               {concert.artist}
//             </p>
//           </div>
//         </div>

//         {/* GRID */}
//         <div className="grid lg:grid-cols-3 gap-8 items-start">

//           {/* LEFT */}
//           <motion.div
//             className="lg:col-span-2 space-y-8"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2, duration: 0.4 }}
//           >
//             {concert.description && (
//               <section className="bg-white border border-amber-200/60 rounded-2xl p-6">
//                 <h2 className="font-serif text-base font-semibold text-amber-950 mb-3">
//                   About the Event
//                 </h2>
//                 <p className="font-serif text-sm text-amber-800/70 leading-relaxed">
//                   {concert.description}
//                 </p>

//                 <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 pt-4 border-t border-amber-200/40 text-xs font-serif text-amber-700/60">
//                   <span className="flex items-center gap-1.5">
//                     <Icon name="pin" className="w-3.5 h-3.5 text-amber-600" />
//                     {concert.venue_name || '-'}{concert.city ? `, ${concert.city}` : ''}
//                   </span>
//                   {nearestSchedule && (
//                     <span className="flex items-center gap-1.5">
//                       <Icon name="calendar" className="w-3.5 h-3.5 text-amber-600" />
//                       {formatDate(nearestSchedule.event_date)}
//                     </span>
//                   )}
//                   {concert.sold_count > 0 && (
//                     <span className="flex items-center gap-1.5">
//                       <Icon name="users" className="w-3.5 h-3.5 text-amber-600" />
//                       {concert.sold_count}+ tickets sold
//                     </span>
//                   )}
//                 </div>
//               </section>
//             )}

//             <section className="bg-white border border-amber-200/60 rounded-2xl p-6" id="venue">
//               <SectionHeading label="Venue" />
//               <div className="flex items-start gap-3 mb-4">
//                 <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
//                   <Icon name="pin" className="w-5 h-5 text-amber-700" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-serif font-medium text-amber-900">{concert.venue_name || '-'}</p>
//                   {concert.venue_address && (
//                     <p className="text-sm font-serif text-amber-700/60 mt-1">{concert.venue_address}</p>
//                   )}
//                   {concert.city && (
//                     <p className="text-sm font-serif text-amber-600/50 mt-1">{concert.city}</p>
//                   )}
//                 </div>
//                 <a
//                   href={
//                     concert.venue_latitude && concert.venue_longitude
//                       ? `https://www.google.com/maps?q=${concert.venue_latitude},${concert.venue_longitude}`
//                       : `https://www.google.com/maps/search/${encodeURIComponent(`${concert.venue_name} ${concert.venue_address || ''} ${concert.city || ''}`)}`
//                   }
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center gap-1 text-sm font-serif text-amber-700 hover:text-amber-900 transition-colors flex-shrink-0 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2"
//                 >
//                   <Icon name="map" className="w-4 h-4" />
//                   Open Map
//                 </a>
//               </div>

//               {concert.venue_latitude && concert.venue_longitude && (
//                 <div className="rounded-xl overflow-hidden border border-amber-200/60">
//                   <iframe
//                     title="Venue location"
//                     src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(concert.venue_longitude) - 0.005}%2C${Number(concert.venue_latitude) - 0.005}%2C${Number(concert.venue_longitude) + 0.005}%2C${Number(concert.venue_latitude) + 0.005}&layer=mapnik&marker=${concert.venue_latitude}%2C${concert.venue_longitude}`}
//                     className="w-full h-64 border-0"
//                   />
//                 </div>
//               )}
//             </section>

//             <section className="bg-white border border-amber-200/60 rounded-2xl p-6" id="reviews">
//               <SectionHeading
//                 label="Ratings & Reviews"
//                 action={
//                   concert.reviews?.length > 3 && (
//                     <button
//                       onClick={() => setShowAllReviews(!showAllReviews)}
//                       className="text-sm font-serif text-amber-700 hover:text-amber-900 transition-colors"
//                     >
//                       {showAllReviews ? 'Show less' : 'View all'}
//                     </button>
//                   )
//                 }
//               />

//               {concert.avg_rating > 0 && (
//                 <div className="flex items-center gap-4 mb-5 pb-5 border-b border-amber-200/40">
//                   <div className="text-center">
//                     <div className="text-4xl font-serif font-bold text-amber-800">{concert.avg_rating}</div>
//                     <div className="text-xs font-serif text-amber-600/50">out of 5</div>
//                   </div>
//                   <div className="flex-1">
//                     <StarRating value={concert.avg_rating} size="text-xl" />
//                     <p className="text-xs font-serif text-amber-600/50 mt-1">{concert.review_count} reviews</p>
//                   </div>
//                 </div>
//               )}

//               {concert.reviews?.length === 0 ? (
//                 <p className="font-serif text-amber-600/40 text-sm">No reviews yet for this concert.</p>
//               ) : (
//                 <div className="grid sm:grid-cols-2 gap-3">
//                   {reviews?.map((r) => (
//                     <div
//                       key={r.id}
//                       className="bg-amber-50/40 border border-amber-200/40 rounded-xl p-4"
//                     >
//                       <div className="flex items-center gap-3 mb-2">
//                         <div className="w-9 h-9 rounded-full bg-amber-200/60 flex items-center justify-center">
//                           <span className="font-serif font-semibold text-amber-800 text-sm">
//                             {r.user_name?.charAt(0).toUpperCase()}
//                           </span>
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="font-serif font-medium text-amber-900 text-sm truncate">{r.user_name}</p>
//                           <StarRating value={r.rating} size="text-xs" />
//                         </div>
//                       </div>
//                       {r.comment && (
//                         <p className="font-serif text-amber-700/70 text-xs leading-relaxed">
//                           {r.comment}
//                         </p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </section>

//             <section className="bg-white border border-amber-200/60 rounded-2xl p-6" id="faq">
//               <SectionHeading label="FAQ" />
//               <div className="space-y-2">
//                 {faqs.map((faq, idx) => (
//                   <div key={idx} className="bg-amber-50/40 border border-amber-200/40 rounded-xl overflow-hidden">
//                     <button
//                       onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
//                       className="w-full flex items-center gap-3 p-4 text-left hover:bg-amber-50 transition-colors"
//                     >
//                       <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200/60 text-amber-800 text-[10px] font-serif flex items-center justify-center">
//                         {idx + 1}
//                       </span>
//                       <span className="flex-1 font-serif text-sm text-amber-900">{faq.question}</span>
//                       <motion.div animate={{ rotate: openFaq === idx ? 180 : 0 }} transition={{ duration: 0.2 }}>
//                         <Icon name="chevronDown" className="w-4 h-4 text-amber-400/60" />
//                       </motion.div>
//                     </button>
//                     <AnimatePresence>
//                       {openFaq === idx && (
//                         <motion.div
//                           initial={{ height: 0, opacity: 0 }}
//                           animate={{ height: 'auto', opacity: 1 }}
//                           exit={{ height: 0, opacity: 0 }}
//                           transition={{ duration: 0.2 }}
//                         >
//                           <p className="pl-13 pr-4 pb-4 text-xs font-serif text-amber-700/70 leading-relaxed">
//                             {faq.answer}
//                           </p>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                   </div>
//                 ))}
//               </div>
//             </section>
//           </motion.div>

//           {/* RIGHT: SIDEBAR */}
//           <motion.div
//             className="lg:col-span-1 lg:sticky lg:top-6 space-y-4"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3, duration: 0.4 }}
//           >
//             <div className="bg-white border border-amber-200/60 rounded-2xl p-5">
//               <h3 className="font-serif text-sm font-semibold text-amber-950 mb-4">
//                 Price Summary
//               </h3>

//               <div className="flex items-baseline gap-2 mb-1">
//                 <span className="font-serif text-3xl font-bold text-amber-800">
//                   {category ? formatRupiah(category.price) : 'Not selected'}
//                 </span>
//                 <span className="text-xs font-serif text-amber-700/50">/ ticket</span>
//               </div>
//               {category && (
//                 <p className="text-xs font-serif text-amber-700/60 mb-4">
//                   Category: {category.name}
//                 </p>
//               )}

//               <div className="pt-4 border-t border-amber-200/40 space-y-2 text-sm font-serif">
//                 <div className="flex justify-between text-amber-700/70">
//                   <span>Quantity</span>
//                   <span className="font-mono">{qty} tickets</span>
//                 </div>
//                 <div className="flex justify-between text-amber-700/70">
//                   <span>Subtotal</span>
//                   <span className="font-mono">{formatRupiah(total)}</span>
//                 </div>
//               </div>

//               <div className="pt-4 mt-4 border-t border-amber-200/40 flex items-center justify-between">
//                 <span className="text-[10px] font-serif tracking-[0.25em] text-amber-600/60 uppercase">
//                   Total
//                 </span>
//                 <span className="font-serif text-2xl font-bold text-amber-800">
//                   {formatRupiah(total)}
//                 </span>
//               </div>
//             </div>

//             <TicketPanel
//               concert={concert}
//               selectedSchedule={selectedSchedule}
//               setSelectedSchedule={setSelectedSchedule}
//               selectedCategory={selectedCategory}
//               setSelectedCategory={setSelectedCategory}
//               qty={qty}
//               setQty={setQty}
//               total={total}
//               handleBuy={handleBuy}
//               user={user}
//               ticketNo={ticketNo}
//               category={category}
//               remaining={remaining}
//             />

//             <div className="bg-white border border-amber-200/60 rounded-2xl p-4 grid grid-cols-3 gap-2">
//               {[
//                 { icon: 'lock', label: 'Secure\nPayment' },
//                 { icon: 'shield', label: 'Guaranteed\nTickets' },
//                 { icon: 'check', label: 'Instant\nE-Ticket' },
//               ].map((b) => (
//                 <div key={b.label} className="flex flex-col items-center text-center gap-1.5">
//                   <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200/60">
//                     <Icon name={b.icon} className="w-4 h-4 text-amber-700" />
//                   </div>
//                   <span className="text-[9px] font-serif text-amber-700/70 leading-tight whitespace-pre-line">
//                     {b.label}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       <AnimatePresence>
//         {showShare && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 20 }}
//             className="fixed top-20 right-4 bg-white border border-amber-200/40 rounded-xl px-4 py-2 text-sm text-amber-900 font-serif shadow-lg z-50"
//           >
//             Link copied!
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Loading, StarRating, formatRupiah, formatDate } from '../../components/Ui';
import { getImageUrl } from '../../utils/image';

/* ============ ICONS ============ */
const ICON_PATHS = {
  pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  mic: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  clock: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  share: 'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13',
  heart: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z',
  check: 'M20 6L9 17l-5-5',
  chevronDown: 'M6 9l6 6 6-6',
  chevronLeft: 'M15 19l-7-7 7-7',
  map: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16',
  info: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01',
  ticket: 'M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
  lock: 'M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zM9 6a3 3 0 016 0v3H9V6z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
};

function Icon({ name, className = 'w-4 h-4', fill = 'none' }) {
  return (
    <svg className={className} fill={fill} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');
  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }
`;

/* Ticket panel: notches on the tear line above the total */
const TAIL_H = '10.5rem';
const panelMask = {
  WebkitMask: `radial-gradient(circle 10px at 0 calc(100% - ${TAIL_H}), #0000 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 10px at 100% calc(100% - ${TAIL_H}), #0000 97%, #000) right / 51% 100% no-repeat`,
  mask: `radial-gradient(circle 10px at 0 calc(100% - ${TAIL_H}), #0000 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 10px at 100% calc(100% - ${TAIL_H}), #0000 97%, #000) right / 51% 100% no-repeat`,
};

/* ============ DATE HELPERS ============ */
// "2026-03-14" / "2026-03-14T00:00:00Z" -> local date (avoids day shifting by timezone)
function parseLocalDate(value) {
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function scheduleStart(s) {
  const d = parseLocalDate(s.event_date);
  const [h, m] = String(s.start_time || '00:00').split(':').map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function sortSchedules(list = []) {
  return [...list].sort(
    (a, b) =>
      String(a.event_date).slice(0, 10).localeCompare(String(b.event_date).slice(0, 10)) ||
      String(a.start_time || '').localeCompare(String(b.start_time || ''))
  );
}

function generateTicketNo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `SEAT-${code}`;
}

/* ============ SALE STATE ============ */
function getSaleState(concert, schedules) {
  const categories = concert.ticket_categories || [];
  const totalRemaining = categories.reduce((sum, tc) => sum + (Number(tc.remaining) || 0), 0);
  const isSoldOut = categories.length > 0 && totalRemaining <= 0;

  const today = startOfToday();
  const upcoming = schedules.filter((s) => parseLocalDate(s.event_date) >= today);
  const nearest = upcoming[0] || null;
  const isPast = schedules.length > 0 && upcoming.length === 0;
  const statusLower = (concert.status || '').toLowerCase();

  const base = { nearest, upcoming };

  if (statusLower === 'draft') return { ...base, label: 'Not published', dot: 'bg-yellow-400', canBuy: false, buyLabel: 'Not on sale yet' };
  if (statusLower === 'cancelled' || statusLower === 'dibatalkan')
    return { ...base, label: 'Event cancelled', dot: 'bg-red-400', canBuy: false, buyLabel: 'Event cancelled' };
  if (statusLower === 'selesai' || statusLower === 'completed' || isPast)
    return { ...base, label: 'Event ended', dot: 'bg-stone-400', canBuy: false, buyLabel: 'Event ended' };
  if (isSoldOut) return { ...base, label: 'Sold out', dot: 'bg-red-400', canBuy: false, buyLabel: 'Sold out' };

  if (nearest) {
    const daysUntil = Math.round((parseLocalDate(nearest.event_date) - today) / 86400000);
    if (daysUntil <= 7) return { ...base, label: daysUntil === 0 ? 'Happening today' : 'Coming soon', dot: 'bg-amber-300', canBuy: true, buyLabel: 'Buy now' };
  }
  return { ...base, label: 'Tickets available', dot: 'bg-emerald-400', canBuy: true, buyLabel: 'Buy now' };
}

/* ============ COUNTDOWN ============ */
function CountdownTimer({ target }) {
  const compute = () => {
    const distance = target.getTime() - Date.now();
    if (distance <= 0) return null;
    return {
      days: Math.floor(distance / 86400000),
      hours: Math.floor((distance % 86400000) / 3600000),
      minutes: Math.floor((distance % 3600000) / 60000),
      seconds: Math.floor((distance % 60000) / 1000),
    };
  };
  const [timeLeft, setTimeLeft] = useState(compute);

  useEffect(() => {
    setTimeLeft(compute());
    const timer = setInterval(() => {
      const next = compute();
      setTimeLeft(next);
      if (!next) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.getTime()]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-2" aria-label="Time until the event starts">
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Min' },
        { value: timeLeft.seconds, label: 'Sec' },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="bg-amber-950/70 backdrop-blur rounded-xl px-3 py-2 min-w-[54px]">
            <span className="f-display text-2xl font-bold text-amber-300 tabular-nums">{String(item.value).padStart(2, '0')}</span>
          </div>
          <span className="text-xs text-amber-100/80 mt-1 block">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ label, action, id }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4 scroll-mt-28" id={id}>
      <h2 className="f-display text-xl font-semibold text-amber-950">{label}</h2>
      {action}
    </div>
  );
}

/* ============ TICKET PANEL ============ */
function TicketPanel({
  schedules, selectedSchedule, setSelectedSchedule,
  categories, selectedCategory, setSelectedCategory,
  qty, setQty, total, onBuy, user, category, remaining, sale,
}) {
  const disabled = !sale.canBuy || !category || remaining <= 0;
  const buyText = !sale.canBuy ? sale.buyLabel : !user ? 'Log in to buy' : remaining <= 0 ? 'Sold out' : 'Buy now';

  return (
    <div className="drop-shadow-[0_10px_18px_rgba(69,26,3,0.14)]" id="tickets">
      <div style={panelMask} className="bg-white rounded-2xl overflow-hidden">
        <div className="p-5">
          <h2 className="f-display text-xl font-semibold text-amber-950 mb-4">Get your tickets</h2>

          {schedules.length > 0 && (
            <div className="mb-4">
              <label htmlFor="schedule-select" className="block text-sm font-medium text-amber-900 mb-1.5">Date</label>
              <select
                id="schedule-select"
                className={`w-full px-3.5 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all`}
                value={selectedSchedule}
                onChange={(e) => setSelectedSchedule(e.target.value)}
              >
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatDate(s.event_date)}
                    {s.start_time ? `, ${s.start_time.slice(0, 5)}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <fieldset className="mb-4">
            <legend className="block text-sm font-medium text-amber-900 mb-1.5">Ticket category</legend>
            <div className="space-y-2">
              {categories.map((tc) => {
                const selected = String(selectedCategory) === String(tc.id);
                const soldOut = tc.remaining <= 0;
                return (
                  <button
                    key={tc.id}
                    type="button"
                    aria-pressed={selected}
                    disabled={soldOut}
                    onClick={() => { setSelectedCategory(tc.id); setQty(1); }}
                    className={`w-full text-left rounded-xl p-3 transition-colors border ${focusRing} ${
                      selected ? 'border-amber-700 bg-amber-100/70' : 'border-amber-200 hover:border-amber-400 bg-white'
                    } ${soldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            selected ? 'bg-amber-800 border-amber-800 text-white' : 'border-amber-300'
                          }`}
                        >
                          {selected && <Icon name="check" className="w-3 h-3" />}
                        </span>
                        <span className="text-sm font-semibold text-amber-950 truncate">{tc.name}</span>
                      </span>
                      <span className="f-display text-base font-semibold text-amber-800 tabular-nums shrink-0">{formatRupiah(tc.price)}</span>
                    </span>
                    <span className={`block text-xs mt-1 pl-6 ${soldOut ? 'text-red-600' : tc.remaining <= 10 ? 'text-red-600' : 'text-amber-700/80'}`}>
                      {soldOut ? 'Sold out' : `${tc.remaining} left`}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {category && remaining > 0 && sale.canBuy && (
            <div className="mb-5">
              <span className="block text-sm font-medium text-amber-900 mb-1.5">Quantity</span>
              <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                  className={`w-10 h-10 flex items-center justify-center text-amber-900 hover:bg-amber-100 rounded-lg transition-colors text-lg disabled:opacity-40 ${focusRing}`}
                >
                  −
                </button>
                <span className="f-display text-lg font-bold text-amber-950 tabular-nums" aria-live="polite">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(remaining, q + 1))}
                  disabled={qty >= remaining}
                  aria-label="Increase quantity"
                  className={`w-10 h-10 flex items-center justify-center text-amber-900 hover:bg-amber-100 rounded-lg transition-colors text-lg disabled:opacity-40 ${focusRing}`}
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stub */}
        <div style={{ height: TAIL_H }} className="bg-amber-100 border-t border-dashed border-amber-400/70 px-5 flex flex-col justify-center gap-3">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-amber-900">Total</p>
              {category && <p className="text-xs text-amber-700/80 tabular-nums truncate">{qty} × {formatRupiah(category.price)}</p>}
            </div>
            <p className="f-display text-3xl font-bold text-amber-950 tabular-nums leading-none">{formatRupiah(total)}</p>
          </div>
          <button
            type="button"
            onClick={onBuy}
            disabled={disabled}
            className={`w-full py-3 bg-amber-800 hover:bg-amber-700 disabled:bg-amber-300/60 disabled:text-amber-800/60 disabled:cursor-not-allowed text-amber-50 text-sm font-semibold rounded-xl transition-colors ${focusRing}`}
          >
            {buyText}
          </button>
          <p className="text-xs text-amber-700/80 text-center flex items-center justify-center gap-1">
            <Icon name="info" className="w-3 h-3" />
            Non-refundable unless the organizer cancels
          </p>
        </div>
      </div>
    </div>
  );
}

const FAQS = [
  { question: 'How do I get my e-ticket?', answer: 'E-tickets will be sent to your email after payment is successful. You can also view them in your My Tickets page.' },
  { question: 'Are tickets refundable?', answer: 'Tickets are non-refundable, unless the event is cancelled by the organizer.' },
  { question: 'Can I bring a professional camera?', answer: 'Professional cameras with interchangeable lenses are not allowed. Compact cameras and smartphones are permitted.' },
  { question: 'Is there an age limit?', answer: 'Some events have age restrictions. Please check the event description for more information.' },
];

/* ============ MAIN ============ */
export default function ConcertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState('');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchDetail() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/concerts/${id}`);
      const data = res.data;
      setConcert(data);

      const schedules = sortSchedules(data.schedules);
      const today = startOfToday();
      const firstUpcoming = schedules.find((s) => parseLocalDate(s.event_date) >= today) || schedules[0];
      if (firstUpcoming) setSelectedSchedule(firstUpcoming.id);

      const cats = data.ticket_categories || [];
      const firstAvailable = cats.find((c) => c.remaining > 0) || cats[0];
      if (firstAvailable) setSelectedCategory(firstAvailable.id);
    } catch (err) {
      setError("We couldn't load this concert. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleBuy() {
    if (!user) return navigate('/login', { state: { from: location.pathname } });
    if (!selectedCategory) return;
    navigate('/checkout', {
      state: { concert_id: concert.id, schedule_id: selectedSchedule || null, ticket_category_id: selectedCategory, qty },
    });
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: concert.name, text: `Check out ${concert.name} by ${concert.artist}!`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setToast('Link copied');
      }
    } catch (err) {
      // the user closed the share sheet, or clipboard access was blocked
      if (err?.name !== 'AbortError') setToast("Couldn't copy the link");
    }
  }

  if (loading) return <Loading />;

  if (!concert) {
    return (
      <MotionConfig reducedMotion="user">
        <style>{pageCss}</style>
        <div className="f-body min-h-screen bg-[#f5ede4] flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm shadow-amber-900/5">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Icon name="alert" className="w-5 h-5" />
            </div>
            <h1 className="f-display text-xl font-semibold text-amber-950 mb-2">Concert not found</h1>
            <p className="text-sm text-amber-800/80 mb-6">{error || 'It may have been removed, or the link is wrong.'}</p>
            <div className="flex gap-3 justify-center">
              {error && (
                <button onClick={fetchDetail} className={`px-5 py-2.5 bg-amber-100 hover:bg-amber-200/70 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}>
                  Try again
                </button>
              )}
              <Link to="/" className={`px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}>
                Back home
              </Link>
            </div>
          </div>
        </div>
      </MotionConfig>
    );
  }

  const categories = concert.ticket_categories || [];
  const allSchedules = sortSchedules(concert.schedules);
  const sale = getSaleState(concert, allSchedules);
  const selectableSchedules = sale.upcoming.length > 0 ? sale.upcoming : allSchedules;

  const category = categories.find((c) => String(c.id) === String(selectedCategory));
  const remaining = category ? category.remaining : 0;
  const total = (category?.price || 0) * qty;
  const heroSchedule = sale.nearest || allSchedules[0];
  const countdownTarget = sale.nearest ? scheduleStart(sale.nearest) : null;
  const reviews = showAllReviews ? concert.reviews : concert.reviews?.slice(0, 3);

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4]">
        {/* ===== HERO ===== */}
        <div className="relative min-h-[22rem] h-[56vh] md:h-[62vh] overflow-hidden bg-amber-950">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {concert.poster ? (
              <img src={getImageUrl(concert.poster)} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-700/40">
                <Icon name="mic" className="w-20 h-20" />
              </div>
            )}
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-amber-950 via-amber-950/60 to-amber-950/20" />

          {/* Top actions */}
          <div className="absolute top-4 inset-x-4 max-w-7xl mx-auto flex items-center justify-between">
            <Link
              to="/"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/30 hover:bg-black/45 backdrop-blur text-white text-sm font-medium transition-colors ${focusRing}`}
            >
              <Icon name="chevronLeft" className="w-4 h-4" />
              Back
            </Link>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                className={`p-2.5 rounded-full backdrop-blur transition-colors ${focusRing} ${
                  isFavorite ? 'bg-amber-400 text-amber-950' : 'bg-black/30 hover:bg-black/45 text-white'
                }`}
              >
                <Icon name="heart" className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleShare}
                aria-label="Share this concert"
                className={`p-2.5 rounded-full bg-black/30 hover:bg-black/45 backdrop-blur text-white transition-colors ${focusRing}`}
              >
                <Icon name="share" className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Title block */}
          <div className="absolute bottom-0 inset-x-0">
            <div className="max-w-7xl mx-auto px-4 pb-8 flex items-end justify-between gap-6">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-amber-50 text-sm font-medium mb-3">
                  <span className={`w-2 h-2 rounded-full ${sale.dot}`} />
                  {sale.label}
                </span>
                <h1 className="f-display text-4xl md:text-5xl font-bold text-white leading-tight break-words">{concert.name}</h1>
                {concert.artist && <p className="text-lg text-amber-200 mt-1">{concert.artist}</p>}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-amber-50/90">
                  {heroSchedule && (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="calendar" className="w-4 h-4 text-amber-300" />
                      {formatDate(heroSchedule.event_date)}
                      {heroSchedule.start_time ? `, ${heroSchedule.start_time.slice(0, 5)}` : ''}
                    </span>
                  )}
                  {concert.venue_name && (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="pin" className="w-4 h-4 text-amber-300" />
                      {concert.venue_name}
                      {concert.city ? `, ${concert.city}` : ''}
                    </span>
                  )}
                </div>
              </div>

              {countdownTarget && (
                <div className="hidden md:block shrink-0">
                  <CountdownTimer target={countdownTarget} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-amber-700/80 mb-6 min-w-0">
            <Link to="/" className={`hover:text-amber-950 transition-colors inline-flex items-center gap-1 rounded ${focusRing}`}>
              <Icon name="home" className="w-3.5 h-3.5" />
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span>{concert.category_name || 'Events'}</span>
            <span aria-hidden="true">/</span>
            <span className="text-amber-950 truncate">{concert.name}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Tickets first on small screens */}
            <motion.aside
              className="order-first lg:order-none lg:col-start-3 lg:row-start-1 lg:sticky lg:top-6 space-y-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <TicketPanel
                schedules={selectableSchedules}
                selectedSchedule={selectedSchedule}
                setSelectedSchedule={setSelectedSchedule}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                qty={qty}
                setQty={setQty}
                total={total}
                onBuy={handleBuy}
                user={user}
                category={category}
                remaining={remaining}
                sale={sale}
              />

              <div className="bg-white rounded-2xl p-4 grid grid-cols-3 gap-2 divide-x divide-dashed divide-amber-200">
                {[
                  { icon: 'lock', label: 'Secure payment' },
                  { icon: 'shield', label: 'Guaranteed tickets' },
                  { icon: 'check', label: 'Instant e-ticket' },
                ].map((b) => (
                  <div key={b.label} className="flex flex-col items-center text-center gap-1.5 px-1">
                    <span className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                      <Icon name={b.icon} className="w-4 h-4" />
                    </span>
                    <span className="text-xs text-amber-800 leading-tight">{b.label}</span>
                  </div>
                ))}
              </div>
            </motion.aside>

            {/* Details */}
            <motion.div
              className="lg:col-span-2 lg:col-start-1 lg:row-start-1 space-y-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              {concert.description && (
                <section className="bg-white rounded-2xl p-6">
                  <SectionHeading label="About the event" />
                  <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">{concert.description}</p>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 pt-4 border-t border-dashed border-amber-200 text-sm text-amber-800">
                    <span className="flex items-center gap-1.5">
                      <Icon name="pin" className="w-4 h-4 text-amber-600" />
                      {concert.venue_name || '-'}
                      {concert.city ? `, ${concert.city}` : ''}
                    </span>
                    {heroSchedule && (
                      <span className="flex items-center gap-1.5">
                        <Icon name="calendar" className="w-4 h-4 text-amber-600" />
                        {formatDate(heroSchedule.event_date)}
                      </span>
                    )}
                    {concert.sold_count > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Icon name="users" className="w-4 h-4 text-amber-600" />
                        {concert.sold_count}+ tickets sold
                      </span>
                    )}
                  </div>
                </section>
              )}

              {/* Venue */}
              <section className="bg-white rounded-2xl p-6" id="venue">
                <SectionHeading label="Venue" />
                <div className="flex items-start gap-3 mb-4">
                  <span className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 text-amber-700">
                    <Icon name="pin" className="w-5 h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-950">{concert.venue_name || '-'}</p>
                    {concert.venue_address && <p className="text-sm text-amber-800/80 mt-0.5">{concert.venue_address}</p>}
                    {concert.city && <p className="text-sm text-amber-700/70 mt-0.5">{concert.city}</p>}
                  </div>
                  <a
                    href={
                      concert.venue_latitude && concert.venue_longitude
                        ? `https://www.google.com/maps?q=${concert.venue_latitude},${concert.venue_longitude}`
                        : `https://www.google.com/maps/search/${encodeURIComponent(`${concert.venue_name} ${concert.venue_address || ''} ${concert.city || ''}`)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-sm font-medium text-amber-900 bg-amber-100 hover:bg-amber-200/70 rounded-xl px-3.5 py-2 shrink-0 transition-colors ${focusRing}`}
                  >
                    <Icon name="map" className="w-4 h-4" />
                    Open map
                  </a>
                </div>

                {concert.venue_latitude && concert.venue_longitude && (
                  <div className="rounded-xl overflow-hidden ring-1 ring-amber-200">
                    <iframe
                      title="Venue location"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(concert.venue_longitude) - 0.005}%2C${Number(concert.venue_latitude) - 0.005}%2C${Number(concert.venue_longitude) + 0.005}%2C${Number(concert.venue_latitude) + 0.005}&layer=mapnik&marker=${concert.venue_latitude}%2C${concert.venue_longitude}`}
                      className="w-full h-64 border-0"
                      loading="lazy"
                    />
                  </div>
                )}
              </section>

              {/* Reviews */}
              <section className="bg-white rounded-2xl p-6" id="reviews">
                <SectionHeading
                  label="Ratings and reviews"
                  action={
                    concert.reviews?.length > 3 && (
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className={`text-sm font-medium text-amber-800 hover:text-amber-950 rounded transition-colors ${focusRing}`}
                      >
                        {showAllReviews ? 'Show less' : `View all ${concert.reviews.length}`}
                      </button>
                    )
                  }
                />

                {concert.avg_rating > 0 && (
                  <div className="flex items-center gap-5 mb-5 pb-5 border-b border-dashed border-amber-200">
                    <div className="text-center">
                      <div className="f-display text-5xl font-bold text-amber-800 leading-none">{concert.avg_rating}</div>
                      <div className="text-xs text-amber-700/80 mt-1">out of 5</div>
                    </div>
                    <div className="flex-1">
                      <StarRating value={concert.avg_rating} size="text-xl" />
                      <p className="text-sm text-amber-700/80 mt-1">
                        {concert.review_count} {concert.review_count === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                  </div>
                )}

                {!concert.reviews?.length ? (
                  <p className="text-sm text-amber-700/80">No reviews yet. Be the first after you attend.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {reviews?.map((r) => (
                      <div key={r.id} className="bg-amber-50 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-9 h-9 rounded-full bg-amber-200 text-amber-900 f-display font-semibold text-sm flex items-center justify-center shrink-0">
                            {r.user_name?.charAt(0).toUpperCase()}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-amber-950 truncate">{r.user_name}</p>
                            <StarRating value={r.rating} size="text-xs" />
                          </div>
                        </div>
                        {r.comment && <p className="text-sm text-amber-900 leading-relaxed">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* FAQ */}
              <section className="bg-white rounded-2xl p-6" id="faq">
                <SectionHeading label="Good to know" />
                <div className="divide-y divide-dashed divide-amber-200 -my-1">
                  {FAQS.map((faq, idx) => {
                    const open = openFaq === idx;
                    return (
                      <div key={faq.question}>
                        <button
                          onClick={() => setOpenFaq(open ? null : idx)}
                          aria-expanded={open}
                          aria-controls={`faq-${idx}`}
                          className={`w-full flex items-center gap-3 py-4 text-left rounded ${focusRing}`}
                        >
                          <span className="flex-1 text-sm font-medium text-amber-950">{faq.question}</span>
                          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-amber-500">
                            <Icon name="chevronDown" className="w-4 h-4" />
                          </motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              id={`faq-${idx}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="pb-4 pr-7 text-sm text-amber-800 leading-relaxed">{faq.answer}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </section>
            </motion.div>
          </div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-950 text-amber-50 text-sm shadow-lg shadow-amber-950/30"
            >
              <Icon name="check" className="w-4 h-4 text-emerald-400" />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}