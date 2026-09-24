import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Loading, EmptyState, formatRupiah, formatDate } from '../../components/Ui';

// ===== ICON COMPONENT =====
function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    mic: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
    search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
    ticket: 'M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
    qr: 'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z',
    chevronRight: 'M9 6l6 6-6 6',
    chevronDown: 'M6 9l6 6 6-6',
    calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    clock: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    arrowRight: 'M5 12h14M12 5l7 7-7 7',
    x: 'M6 18L18 6M6 6l12 12',
    sparkle: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
    info: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

// ===== STATUS BADGE =====
function StatusBadge({ status }) {
  const configs = {
    menunggu_pembayaran: { label: 'Pending', class: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
    lunas: { label: 'Confirmed', class: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
    dibatalkan: { label: 'Cancelled', class: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
    kadaluarsa: { label: 'Expired', class: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
    selesai: { label: 'Completed', class: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  };
  const config = configs[status] || { label: status || 'Unknown', class: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-serif tracking-wide border ${config.class}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

// ===== ORDER CARD (layout referensi — wide horizontal) =====
function OrderCard({ order }) {
  const isPending = order.status === 'menunggu_pembayaran';
  const isPaid = order.status === 'lunas';

  return (
    <Link
      to={`/orders/${order.id}`}
      className="group block bg-white/90 hover:bg-white border border-amber-200/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(120,72,20,0.15)] hover:border-amber-300/60"
    >
      {/* ===== TOP BAR: Info order (Order Date, Total, Venue, Order #) ===== */}
      <div className="px-5 md:px-6 py-4 border-b border-amber-200/30 bg-amber-50/30">
        <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
          {/* Order Date */}
          <div className="min-w-[100px]">
            <div className="text-[10px] font-serif tracking-[0.15em] text-amber-700/50 uppercase mb-0.5">
              Order Date
            </div>
            <div className="font-serif text-sm text-amber-950 font-medium">
              {formatDate(order.created_at)}
            </div>
          </div>

          {/* Total Amount */}
          <div className="min-w-[100px]">
            <div className="text-[10px] font-serif tracking-[0.15em] text-amber-700/50 uppercase mb-0.5">
              Total Amount
            </div>
            <div className="font-serif text-sm text-amber-950 font-medium tabular-nums">
              {formatRupiah(order.total_price)}
            </div>
          </div>

          {/* Venue */}
          <div className="min-w-[120px] flex-1">
            <div className="text-[10px] font-serif tracking-[0.15em] text-amber-700/50 uppercase mb-0.5">
              Venue
            </div>
            <div className="font-serif text-sm text-amber-950 font-medium truncate">
              {order.venue_name || order.city || 'Indonesia'}
            </div>
          </div>

          {/* Order # + View Order (kanan) */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-serif tracking-[0.15em] text-amber-700/50 uppercase mb-0.5">
                Order #
              </div>
              <div className="font-mono text-xs text-amber-950">
                {order.order_code}
              </div>
            </div>

            <span className="px-3 py-1.5 text-[10px] font-serif uppercase tracking-wider text-white bg-amber-700 group-hover:bg-amber-600 rounded-md transition-colors flex items-center gap-1.5">
              View Order
              <Icon name="chevronRight" className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* ===== REVIEW BANNER (pending state) ===== */}
      {isPending && (
        <div className="px-5 md:px-6 py-2 bg-amber-100/50 border-b border-amber-200/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="info" className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-serif text-amber-800">
              Selesaikan pembayaran sebelum tiket dilepas kembali
            </span>
          </div>
          <button className="text-amber-600 hover:text-amber-900 transition-colors">
            <Icon name="x" className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ===== STATUS LINE ===== */}
      <div className="px-5 md:px-6 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-serif font-semibold text-amber-950">
            {isPaid
              ? 'Tiket Aktif'
              : isPending
              ? 'Menunggu Pembayaran'
              : order.status === 'kadaluarsa'
              ? 'Kedaluwarsa'
              : 'Dibatalkan'}
          </span>
          <span className="text-amber-400/50">·</span>
          <span className="text-xs font-serif text-amber-700/50">
            {formatDate(order.created_at)}
          </span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* ===== PRODUCT ROW: poster + info ===== */}
      <div className="px-5 md:px-6 pb-5 flex gap-4">
        {/* Poster */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-amber-100 border border-amber-200/50">
          {order.poster ? (
            <img
              src={order.poster}
              alt={order.concert_name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-amber-400/40 bg-gradient-to-br from-amber-100 to-amber-200/60">
              <Icon name="mic" className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h4 className="font-serif text-base text-amber-950 group-hover:text-amber-800 transition-colors leading-snug">
              {order.concert_name}
            </h4>
            <p className="text-sm font-serif text-amber-700/60 mt-1">
              {order.ticket_category_name} · {order.qty}× tiket
            </p>
            <p className="text-[11px] font-serif text-amber-600/50 mt-1.5">
              {isPaid
                ? 'Tiket elektronik tersedia'
                : isPending
                ? 'Bayar dalam 15 menit'
                : order.status === 'kadaluarsa'
                ? 'Melewati batas waktu pembayaran'
                : 'Pesanan dibatalkan'}
            </p>
          </div>

          {/* Action row — cuma Lihat E-Tiket / Bayar Sekarang */}
          {(isPaid || isPending) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-3 border-t border-dashed border-amber-200/50">
              {isPaid && (
                <span className="flex items-center gap-1.5 text-xs font-serif text-amber-800">
                  <Icon name="qr" className="w-3.5 h-3.5" />
                  Lihat E-Tiket
                </span>
              )}
              {isPending && (
                <span className="flex items-center gap-1.5 text-xs font-serif text-amber-800">
                  <Icon name="clock" className="w-3.5 h-3.5" />
                  Bayar Sekarang
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ===== MAIN COMPONENT =====
export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/orders/my')
      .then((res) => setOrders(res.data))
      .catch((err) => console.error('Failed to fetch orders:', err))
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'menunggu_pembayaran', label: 'Pending' },
    { id: 'lunas', label: 'Confirmed' },
    { id: 'kadaluarsa', label: 'Expired' },
    { id: 'dibatalkan', label: 'Cancelled' },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch =
      order.concert_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Group orders by date
  const groupedOrders = filteredOrders.reduce((groups, order) => {
    const date = new Date(order.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupKey;
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
      groupKey = 'This Month';
    } else {
      groupKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(order);
    return groups;
  }, {});

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#f5ede4]">

      {/* Texture overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Soft radial glow behind header */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(ellipse at center, rgba(180,120,40,0.08), transparent 70%)' }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8 relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 text-amber-700/40 mb-1">
                <Icon name="sparkle" className="w-3.5 h-3.5" />
                <span className="text-[10px] font-serif uppercase tracking-[0.3em]">Riwayat Pembelian</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-amber-950 tracking-wide">
                Your Orders
              </h1>
              <p className="font-serif text-amber-700/50 text-sm mt-1">
                Kelola semua tiket konser kamu di sini
              </p>
            </div>

            {orders.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-serif text-[10px] tracking-[0.25em] text-amber-700/70 bg-white/60 border border-amber-200/50 rounded-full px-4 py-2 uppercase shadow-sm">
                  {orders.length} order
                </span>
              </div>
            )}
          </div>

          {/* Tab row + Sort */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Tabs kiri */}
            <div className="flex gap-1 bg-white/60 border border-amber-200/40 rounded-full p-1 shadow-sm overflow-x-auto">
              {tabs.map((tab) => {
                const count = orders.filter((o) => tab.id === 'all' || o.status === tab.id).length;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-1.5 px-4 py-1.5 text-sm font-serif rounded-full whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-amber-800 text-amber-50'
                        : 'text-amber-700/60 hover:text-amber-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] ${isActive ? 'text-amber-200' : 'text-amber-400/60'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort dropdown kanan */}
            <button className="flex items-center gap-2 px-4 py-2 bg-white/60 border border-amber-200/40 rounded-lg text-sm font-serif text-amber-800 hover:border-amber-400/60 transition-colors shadow-sm">
              Past 1 Years
              <Icon name="chevronDown" className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/40" />
            <input
              className="w-full pl-10 pr-10 py-2.5 bg-white/60 border border-amber-200/40 text-amber-950 placeholder-amber-400/50 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-all font-serif text-sm rounded-xl shadow-sm focus:shadow-md"
              placeholder="Cari nama konser atau kode pesanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-400/50 hover:text-amber-700 transition-colors"
                aria-label="Clear search"
              >
                <Icon name="x" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Content */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-amber-100/70 border border-amber-200/50 flex items-center justify-center mb-4">
              <Icon name="ticket" className="w-6 h-6 text-amber-400/60" />
            </div>
            <EmptyState
              text={
                searchQuery
                  ? 'Tidak ada pesanan yang ditemukan.'
                  : 'Kamu belum membeli tiket apapun.'
              }
            />
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="space-y-8"
            >
              {Object.entries(groupedOrders).map(([group, groupOrders]) => (
                <div key={group}>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-sm font-serif text-amber-800/60 uppercase tracking-wider">
                      {group}
                    </h3>
                    <div className="flex-1 h-px bg-amber-200/30" />
                    <span className="text-[10px] font-serif text-amber-400/50">
                      {groupOrders.length} transaksi
                    </span>
                  </div>

                  <div className="space-y-4">
                    {groupOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      >
                        <OrderCard order={order} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}