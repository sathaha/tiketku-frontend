// src/pages/Contact.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    clock: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    send: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
    check: 'M5 13l4 4L19 7',
    alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
    chevron: 'M9 5l7 7-7 7',
    facebook: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
    twitter: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
    instagram: 'M16 3H8a5 5 0 00-5 5v8a5 5 0 005 5h8a5 5 0 005-5V8a5 5 0 00-5-5zM12 16a4 4 0 110-8 4 4 0 010 8zM17.5 6.5h.01',
    ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    arrow: 'M13 7l5 5-5 5M6 12h12',
    music: 'M12 2v8M12 10a3 3 0 100 6 3 3 0 000-6z M12 2l4 1v3l-4-1',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

// ===== ZIGZAG DECOR (amber) =====
function Zigzag({ className = '', direction = 'right' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ transform: direction === 'left' ? 'scaleX(-1)' : 'none' }}
    >
      <path d="M5 5 L25 25 L45 5 L65 25 L85 5" />
      <path d="M5 25 L25 45 L45 25 L65 45 L85 25" />
      <path d="M5 45 L25 60 L45 45 L65 60 L85 45" opacity="0.4" />
    </svg>
  );
}

// ===== WAVY UNDERLINE =====
function WavyLine({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 220 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 8 Q 15 1, 28 8 T 54 8 T 80 8 T 106 8 T 132 8 T 158 8 T 184 8 T 210 8" />
    </svg>
  );
}

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const contactInfo = [
    {
      icon: 'phone',
      title: 'Call Us',
      value: '+62 812-3456-7890',
      description: 'Mon-Fri, 9AM-6PM WIB',
    },
    {
      icon: 'mail',
      title: 'Email Us',
      value: 'support@tiketku.id',
      description: 'We usually reply within 24 hours',
    },
    {
      icon: 'pin',
      title: 'Visit Us',
      value: 'Jakarta, Indonesia',
      description: 'Jl. Sudirman No. 123',
    },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSending(true);

    try {
      await api.post('/contact-messages', {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });

      setForm({ name: '', email: '', subject: '', message: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setSending(false);
    }
  }

  function handleNewsletter(e) {
    e.preventDefault();
    setNewsletterEmail('');
  }

  return (
    <div className="min-h-screen bg-[#f5ede4]">

      {/* ===== HERO — dark ink + amber (tema asli) ===== */}
      <div className="relative bg-ink-950 py-20 md:py-28 overflow-hidden">
        {/* Noise */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: '200px 200px',
          }}
        />

        {/* Blobs */}
        <div className="absolute -right-32 -top-24 w-[32rem] h-[32rem] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 w-72 h-72 rounded-full bg-amber-400/5 blur-3xl" />

        {/* Zigzag decor kiri (amber) */}
        <div className="absolute left-4 md:left-16 top-1/2 -translate-y-1/2 text-amber-500/15 pointer-events-none hidden sm:block">
          <Zigzag className="w-24 md:w-32 h-16" direction="right" />
        </div>

        {/* Zigzag decor kanan (amber) */}
        <div className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 text-amber-500/15 pointer-events-none hidden sm:block">
          <Zigzag className="w-24 md:w-32 h-16" direction="left" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight tracking-tight">
              Contact Us
            </h1>

            <WavyLine className="w-40 md:w-56 h-3 mx-auto mt-4 text-amber-500/70" />

            <p className="text-amber-300/60 font-serif text-sm md:text-base mt-6 max-w-xl mx-auto leading-relaxed">
              Questions, feedback, or just want to say hello?
              Reach out to us and we'll get back to you as soon as possible.
            </p>
          </motion.div>
        </div>

        {/* Fade to parchment */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f5ede4] to-transparent" />
      </div>

      {/* ===== LOGO STRIP (partner) ===== */}
      <div className="bg-[#f5ede4] py-8 border-b border-amber-900/10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-center gap-6 md:gap-14 flex-wrap opacity-60">
            {['logoipsum', 'LOGOIPSUM', 'LOGO IPSUM', 'LOGOIPSUM'].map((brand, i) => (
              <div key={i} className="flex items-center gap-2 text-amber-900">
                {i === 0 && (
                  <span className="w-6 h-6 rounded-full bg-amber-800 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-amber-100" />
                  </span>
                )}
                {i === 1 && (
                  <span className="w-6 h-6 border-2 border-amber-800 rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-800" />
                  </span>
                )}
                {i === 2 && (
                  <span className="w-6 h-6 border-2 border-amber-800 rounded-sm" />
                )}
                {i === 3 && (
                  <span className="w-6 h-6 border-l-4 border-amber-800" />
                )}
                <span className="font-serif font-bold text-sm md:text-base tracking-tight">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ===== LEFT — Contact Form (2 cols) ===== */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 border border-amber-200/40 rounded-2xl p-6 md:p-8">
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 mb-4 bg-emerald-100/70 border border-emerald-300/50 text-emerald-800 text-sm font-serif rounded-xl"
                >
                  <Icon name="check" className="w-4 h-4" />
                  Pesan berhasil dikirim! Kami akan segera menghubungi Anda.
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-3 mb-4 bg-red-100/70 border border-red-300/50 text-red-700 text-sm font-serif rounded-xl"
                >
                  <Icon name="alert" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1: Email + Subject */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    required
                    type="email"
                    className="w-full px-5 py-3 bg-white border border-amber-200/40 text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all font-serif text-sm rounded-full"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  <input
                    required
                    type="text"
                    className="w-full px-5 py-3 bg-white border border-amber-200/40 text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all font-serif text-sm rounded-full"
                    placeholder="Subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>

                {/* Row 2: Name */}
                <input
                  required
                  type="text"
                  className="w-full px-5 py-3 bg-white border border-amber-200/40 text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all font-serif text-sm rounded-full"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                {/* Message */}
                <textarea
                  required
                  rows={6}
                  className="w-full px-5 py-4 bg-white border border-amber-200/40 text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all font-serif text-sm rounded-2xl resize-none"
                  placeholder="Message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-amber-800 hover:bg-amber-700 text-amber-100 font-serif text-sm rounded-full border border-amber-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Submit Button'
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* ===== RIGHT — Newsletter Card (dark ink) ===== */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className="bg-ink-950 border border-amber-500/20 rounded-2xl p-6 md:p-8 h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Icon name="mail" className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="font-serif text-lg text-amber-200">Our Newsletters</h3>
              </div>
              <p className="text-sm text-amber-300/60 font-serif leading-relaxed mb-6">
                Get the latest events, exclusive offers, and announcements
                directly to your inbox.
              </p>

              <form onSubmit={handleNewsletter} className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full px-5 py-3 bg-white/95 text-amber-950 placeholder-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all font-serif text-sm rounded-full"
                />
                <button
                  type="submit"
                  className="w-full px-5 py-3 bg-amber-800 hover:bg-amber-700 text-amber-100 font-serif text-sm rounded-full transition-colors"
                >
                  Subscribe
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-amber-500/10">
                <div className="flex items-center gap-2 text-xs text-amber-300/50 font-serif">
                  <Icon name="check" className="w-3 h-3 text-amber-500" />
                  No spam, unsubscribe anytime
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ===== 3 INFO CARDS ===== */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {contactInfo.map((info, index) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.08 }}
              className="bg-white/80 border border-amber-200/40 rounded-2xl p-6 hover:shadow-lg hover:shadow-amber-900/5 transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100/80 flex items-center justify-center flex-shrink-0">
                  <Icon name={info.icon} className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h3 className="font-serif text-sm text-amber-900 font-semibold mb-1">
                    {info.title}
                  </h3>
                  <p className="text-base text-amber-950 font-serif">{info.value}</p>
                  <p className="text-xs text-amber-700/50 font-serif mt-1">
                    {info.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ===== MAP ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 relative rounded-2xl overflow-hidden border border-amber-200/40 shadow-lg shadow-amber-900/5"
        >
          {/* Info overlay card */}
          <div className="absolute top-4 left-4 z-10 bg-white rounded-xl shadow-xl shadow-amber-900/10 p-4 max-w-xs hidden md:block border border-amber-200/40">
            <h4 className="font-serif font-bold text-sm text-amber-900 mb-1">
              TiketKu Headquarters
            </h4>
            <p className="text-xs text-amber-700/70 font-serif leading-relaxed mb-2">
              Building Indonesia Tower, Jl. Sudirman No. 123
              <br />
              Jakarta Pusat, 10220
            </p>
            <div className="flex items-center gap-1 text-xs font-serif text-amber-800">
              <span className="text-amber-500">★</span>
              <span className="font-semibold">4.5</span>
              <span className="text-amber-700/60">(1,234 reviews)</span>
            </div>
            <a
              href="https://maps.google.com/?q=Jakarta"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-serif text-amber-700 font-semibold mt-2 hover:text-amber-900 hover:underline"
            >
              View larger map
              <Icon name="arrow" className="w-3 h-3" />
            </a>
          </div>

          {/* Map iframe */}
          <iframe
            title="TiketKu Location"
            src="https://www.openstreetmap.org/export/embed.html?bbox=106.7%2C-6.3%2C106.9%2C-6.1&layer=mapnik&marker=-6.2088%2C106.8456"
            className="w-full h-72 md:h-80 border-0"
            loading="lazy"
          />
        </motion.div>
      </div>

      {/* ===== FOOTER (dark ink + amber) ===== */}
      <footer className="bg-ink-950 border-t border-amber-900/20 mt-8">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-800/30 border border-amber-500/20 flex items-center justify-center">
                  <Icon name="ticket" className="w-4 h-4 text-amber-400" />
                </div>
                <span className="font-serif text-lg text-amber-200 tracking-wide">TiketKu</span>
              </div>
              <p className="text-xs text-amber-300/50 font-serif leading-relaxed">
                Your gateway to unforgettable experiences. From intimate concerts to grand festivals.
              </p>
              <div className="flex gap-2 mt-4">
                {['facebook', 'twitter', 'instagram'].map((social) => (
                  <button
                    key={social}
                    className="w-8 h-8 rounded-full border border-amber-500/20 bg-amber-800/20 flex items-center justify-center text-amber-400 hover:bg-amber-700/30 hover:border-amber-500/40 transition-all"
                    aria-label={`Follow us on ${social}`}
                  >
                    <Icon name={social} className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-serif text-xs tracking-[0.3em] text-amber-400/80 uppercase mb-3">
                Navigation
              </h4>
              <ul className="space-y-2">
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Promo & Diskon', href: '/promos' },
                  { label: 'About Us', href: '/about' },
                  { label: 'Contact', href: '/contact' },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-amber-300/60 font-serif hover:text-amber-300 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-serif text-xs tracking-[0.3em] text-amber-400/80 uppercase mb-3">
                Services
              </h4>
              <ul className="space-y-2">
                {[
                  { label: 'Browse Events', href: '/' },
                  { label: 'My Tickets', href: '/my-orders' },
                  { label: 'Order History', href: '/contact-history' },
                  { label: 'Support', href: '/contact' },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-amber-300/60 font-serif hover:text-amber-300 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-serif text-xs tracking-[0.3em] text-amber-400/80 uppercase mb-3">
                Contact
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-xs text-amber-300/60 font-serif">
                  <Icon name="pin" className="w-3.5 h-3.5 text-amber-500/70" />
                  Jakarta, Indonesia
                </li>
                <li className="flex items-center gap-2 text-xs text-amber-300/60 font-serif">
                  <Icon name="phone" className="w-3.5 h-3.5 text-amber-500/70" />
                  +62 812-3456-7890
                </li>
                <li className="flex items-center gap-2 text-xs text-amber-300/60 font-serif">
                  <Icon name="mail" className="w-3.5 h-3.5 text-amber-500/70" />
                  support@tiketku.id
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-amber-900/20 mt-8 pt-6">
            <p className="text-[10px] text-amber-300/40 font-serif text-center">
              © 2026 TiketKu. All rights reserved.
            </p>
          </div>
        </div>

        <div className="h-8 bg-gradient-to-r from-amber-900/20 via-amber-800/10 to-amber-900/20 flex items-center justify-center gap-3">
          <div className="w-16 h-px bg-amber-500/20" />
          <Icon name="music" className="w-3 h-3 text-amber-500/30" />
          <div className="w-16 h-px bg-amber-500/20" />
        </div>
      </footer>
    </div>
  );
}