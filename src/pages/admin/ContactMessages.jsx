// src/pages/admin/ContactMessages.jsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Loading, EmptyState, formatDate } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    check: 'M5 13l4 4L19 7',
    close: 'M6 18L18 6M6 6l12 12',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    clock: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    inbox: 'M5 13l4 4L19 7 M3 3h18v18H3V3z',
    reply: 'M3 10h10a4 4 0 014 4v6m0 0l-4-4m4 4l4-4',
    archive: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8',
    alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unread', 'read', 'replied'
  const [processingId, setProcessingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    try {
      const res = await api.get('/contact-messages');
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch contact messages:', err);
    } finally {
      setLoading(false);
    }
  }

  async function viewMessage(message) {
    setSelectedMessage(message);
    setReplyText('');

    // Mark as read if unread
    if (message.status === 'unread') {
      try {
        await api.put(`/contact-messages/${message.id}/read`);
        fetchMessages();
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this message?')) return;
    try {
      await api.delete(`/contact-messages/${id}`);
      setSelectedMessage(null);
      fetchMessages();
      setSuccessMsg('Message deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to delete message.');
    }
  }

  async function handleSendReply() {
    if (!replyText.trim() || !selectedMessage) return;

    setSendingReply(true);
    try {
      await api.post(`/contact-messages/${selectedMessage.id}/reply`, {
        reply: replyText
      });
      setReplyText('');
      setSelectedMessage(null);
      setSuccessMsg('Reply sent successfully');
      fetchMessages();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  }

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && msg.status === statusFilter;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  const statusTabs = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'replied', label: 'Replied' },
  ];

  const statusConfig = {
    unread: { label: 'Unread', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200/60', dot: 'bg-amber-500' },
    read: { label: 'Read', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200/60', dot: 'bg-blue-500' },
    replied: { label: 'Replied', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200/60', dot: 'bg-emerald-500' },
  };

  return (
    <div className="min-h-screen bg-[#f5ede4] px-4 py-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="relative mb-6">
          <div className="absolute -top-8 -left-4 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200/60 flex items-center justify-center relative">
                <Icon name="inbox" className="w-5 h-5 text-amber-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-amber-50 text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="font-serif text-2xl text-amber-950 tracking-tight">Inbox</h1>
                <p className="font-serif text-sm text-amber-700/60 mt-0.5">
                  {messages.length} total messages • {unreadCount} unread
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 px-4 py-2.5 mb-4 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-sm rounded-lg font-serif"
            >
              <Icon name="check" className="w-4 h-4" />
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1 p-1 bg-white border border-amber-200/60 rounded-xl shrink-0">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3.5 py-1.5 rounded-lg font-serif text-xs transition-all ${
                  statusFilter === tab.value
                    ? 'bg-amber-800 text-amber-50 shadow-sm'
                    : 'text-amber-700/70 hover:text-amber-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages List */}
        {loading ? (
          <Loading />
        ) : filteredMessages.length === 0 ? (
          <EmptyState
            text={
              searchQuery || statusFilter !== 'all'
                ? "No messages match the filter."
                : "No incoming messages yet."
            }
          />
        ) : (
          <div className="space-y-2">
            {filteredMessages.map((message, index) => {
              const config = statusConfig[message.status] || statusConfig.unread;
              const isUnread = message.status === 'unread';

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => viewMessage(message)}
                  className={`group bg-white/90 border rounded-2xl p-4 cursor-pointer transition-all ${
                    isUnread
                      ? 'border-amber-300 bg-amber-50/80 hover:bg-amber-50'
                      : 'border-amber-200/60 hover:border-amber-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}>
                      <Icon name="user" className={`w-4 h-4 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-serif font-semibold text-sm ${
                          isUnread ? 'text-amber-950' : 'text-amber-900/80'
                        }`}>
                          {message.name}
                        </span>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border} font-serif`}>
                          {config.label}
                        </span>
                      </div>

                      <p className={`font-serif text-sm truncate ${
                        isUnread ? 'text-amber-950 font-medium' : 'text-amber-800/80'
                      }`}>
                        {message.subject}
                      </p>

                      <div className="flex items-center gap-3 mt-1 font-serif text-xs text-amber-700/60">
                        <span className="flex items-center gap-1">
                          <Icon name="mail" className="w-3 h-3" />
                          {message.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="clock" className="w-3 h-3" />
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewMessage(message);
                        }}
                        className="p-2 rounded-lg text-amber-500 hover:text-amber-900 hover:bg-amber-100 transition-colors"
                        title="View message"
                      >
                        <Icon name="eye" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(message.id);
                        }}
                        className="p-2 rounded-lg text-amber-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete message"
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-amber-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedMessage(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white border border-amber-200/60 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-amber-200/60 mb-4 shrink-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-serif font-bold text-amber-950">{selectedMessage.subject}</h2>
                    </div>
                    <div className="flex items-center gap-2 font-serif text-xs text-amber-700/70">
                      <span>From:</span>
                      <span className="text-amber-950 font-medium">{selectedMessage.name}</span>
                      <span>•</span>
                      <span>{selectedMessage.email}</span>
                    </div>
                    <p className="font-serif text-xs text-amber-700/60 mt-1 flex items-center gap-1">
                      <Icon name="clock" className="w-3 h-3" />
                      {formatDate(selectedMessage.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 rounded-lg text-amber-500 hover:text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    <Icon name="close" className="w-5 h-5" />
                  </button>
                </div>

                {/* Message Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4 mb-4">
                    <p className="font-serif text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>

                  {/* Reply Section */}
                  {selectedMessage.reply && (
                    <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-4">
                      <p className="font-serif text-xs text-emerald-700 font-medium mb-2">Your Reply:</p>
                      <p className="font-serif text-sm text-emerald-900 leading-relaxed">
                        {selectedMessage.reply}
                      </p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {!selectedMessage.reply && (
                    <div className="mt-4">
                      <label className="block font-serif text-xs font-semibold text-amber-800/70 uppercase tracking-wider mb-2">
                        Reply to Message
                      </label>
                      <textarea
                        rows={4}
                        className="w-full bg-white border border-amber-200/60 rounded-xl p-3.5 font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all resize-none"
                        placeholder="Write your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-amber-200/60 mt-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="flex-1 py-2.5 px-4 rounded-xl font-serif text-xs font-semibold bg-white hover:bg-amber-50 text-amber-900 border border-amber-200/60 transition-colors"
                    >
                      Close
                    </button>

                    {!selectedMessage.reply && (
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || sendingReply}
                        className="flex-1 py-2.5 px-4 rounded-xl font-serif text-xs font-bold bg-amber-800 hover:bg-amber-700 text-amber-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                      >
                        {sendingReply ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Icon name="reply" className="w-4 h-4" />
                            Send Reply
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}