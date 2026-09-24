// src/pages/customer/ContactHistory.jsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Loading, EmptyState, formatDate } from '../../components/Ui';
import { useAuth } from '../../context/AuthContext';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    clock: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    check: 'M5 13l4 4L19 7',
    close: 'M6 18L18 6M6 6l12 12',
    eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    arrow: 'M13 7l5 5-5 5M6 12h12',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

export default function ContactHistory() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    try {
      const res = await api.get('/contact-messages/my');
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }

  const statusConfig = {
    unread: { label: 'Belum Dibaca', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: 'clock' },
    read: { label: 'Sudah Dibaca', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: 'eye' },
    replied: { label: 'Dibalas', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: 'check' },
  };

  return (
    <div className="min-h-screen bg-[#f5ede4]">
      {/* Header */}
      <div className="bg-ink-950 py-16 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-serif text-4xl text-white">Riwayat Pesan</h1>
          <p className="text-amber-300/60 font-serif mt-2">
            Lihat status dan balasan dari pesan yang Anda kirim
          </p>
        </div>
      </div>

      {/* Messages List */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <Loading />
        ) : messages.length === 0 ? (
          <EmptyState text="Belum ada pesan. Kirim pesan pertama Anda!" />
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const config = statusConfig[message.status] || statusConfig.unread;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedMessage(message)}
                  className="bg-white/80 border border-amber-200/40 rounded-sm p-5 cursor-pointer hover:shadow-lg hover:shadow-amber-900/10 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-serif text-lg text-amber-900 truncate">
                          {message.subject}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.color}`}>
                          <Icon name={config.icon} className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                      
                      <p className="text-sm text-amber-700/60 font-serif line-clamp-2 mb-3">
                        {message.message}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-amber-700/40 font-serif">
                        <span className="flex items-center gap-1">
                          <Icon name="clock" className="w-3 h-3" />
                          {formatDate(message.created_at)}
                        </span>
                        {message.reply && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Icon name="check" className="w-3 h-3" />
                            Dibalas
                          </span>
                        )}
                      </div>
                    </div>
                    <Icon name="arrow" className="w-4 h-4 text-amber-400/50 flex-shrink-0" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-sm p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-serif text-xl text-amber-900">{selectedMessage.subject}</h2>
                  <p className="text-xs text-amber-700/50 font-serif mt-1">
                    {formatDate(selectedMessage.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 rounded-sm text-amber-700/50 hover:text-amber-900 hover:bg-amber-100 transition-colors"
                >
                  <Icon name="close" className="w-5 h-5" />
                </button>
              </div>

              {/* Pesan Customer */}
              <div className="bg-amber-50 border border-amber-200/40 rounded-sm p-4 mb-4">
                <p className="text-xs text-amber-700/50 font-serif mb-2">Pesan Anda:</p>
                <p className="text-sm text-amber-900 font-serif whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Balasan Admin */}
              {selectedMessage.reply ? (
                <div className="bg-emerald-50 border border-emerald-200/40 rounded-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="check" className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs text-emerald-700/70 font-serif">
                      Balasan dari {selectedMessage.replied_by_name || 'Admin'}:
                    </p>
                  </div>
                  <p className="text-sm text-emerald-900 font-serif whitespace-pre-wrap">
                    {selectedMessage.reply}
                  </p>
                  {selectedMessage.replied_at && (
                    <p className="text-xs text-emerald-700/50 font-serif mt-2">
                      {formatDate(selectedMessage.replied_at)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200/40 rounded-sm p-4 text-center">
                  <Icon name="clock" className="w-8 h-8 text-amber-400/50 mx-auto mb-2" />
                  <p className="text-sm text-amber-700/60 font-serif">
                    Pesan Anda sedang diproses. Admin akan segera membalas.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}