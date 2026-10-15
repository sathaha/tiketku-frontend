// src/pages/Contact.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../api/axios';

/* ============ ICONS ============ */
const ICON_PATHS = {
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  send: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  check: 'M5 13l4 4L19 7',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  facebook: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
  twitter: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
  instagram: 'M16 3H8a5 5 0 00-5 5v8a5 5 0 005 5h8a5 5 0 005-5V8a5 5 0 00-5-5zM12 16a4 4 0 110-8 4 4 0 010 8zM17.5 6.5h.01',
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  arrow: 'M13 7l5 5-5 5M6 12h12',
};

function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin motion-reduce:animate-none ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

/* ============ STYLES ============ */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';
// Fokus di atas latar gelap (footer, kartu newsletter)
const focusRingDark =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70';

const panel = 'bg-white rounded-2xl shadow-sm shadow-amber-950/5';

const inputCls =
  'w-full px-3.5 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';
const labelCls = 'block text-sm font-medium text-amber-900 mb-1.5';

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }
`;

/* ============ CONTENT ============ */
const CONTACT_INFO = [
  {
    icon: 'phone',
    title: 'Call us',
    value: '+62 812-3456-7890',
    href: 'tel:+6281234567890',
    description: 'Mon-Fri, 9AM-6PM WIB',
  },
  {
    icon: 'mail',
    title: 'Email us',
    value: 'support@tiketku.id',
    href: 'mailto:support@tiketku.id',
    description: 'We usually reply within 24 hours',
  },
  {
    icon: 'pin',
    title: 'Visit us',
    value: 'Jakarta, Indonesia',
    description: 'Jl. Sudirman No. 123',
  },
];

const FOOTER_NAV = [
  { label: 'Home', to: '/' },
  { label: 'Promos & vouchers', to: '/promos' },
  { label: 'About us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const FOOTER_SERVICES = [
  { label: 'Browse events', to: '/' },
  { label: 'My tickets', to: '/my-orders' },
  { label: 'Order history', to: '/contact-history' },
  { label: 'Support', to: '/contact' },
];

const SOCIALS = ['facebook', 'twitter', 'instagram'];

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-amber-400/90 mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className={`text-sm text-amber-300/70 hover:text-amber-200 rounded transition-colors ${focusRingDark}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============ MAIN ============ */
export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const successTimer = useRef(null);

  useEffect(() => () => clearTimeout(successTimer.current), []);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
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
      clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  // TODO: belum terhubung ke endpoint newsletter, saat ini hanya mengosongkan kolom.
  function handleNewsletter(e) {
    e.preventDefault();
    setNewsletterEmail('');
  }

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4]">
        {/* ===== HERO ===== */}
        <div className="relative bg-ink-950 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }}
            aria-hidden="true"
          />
          <div className="absolute -right-32 -top-24 w-[32rem] h-[32rem] rounded-full bg-amber-500/10 blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f5ede4] to-transparent" aria-hidden="true" />

          <div className="relative max-w-4xl mx-auto px-4 py-20 md:py-28 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <h1 className="f-display text-4xl md:text-6xl font-semibold text-white leading-tight tracking-tight">
                Contact <span className="text-amber-400 italic">us.</span>
              </h1>
              <div className="w-16 h-[2px] bg-amber-500/60 mx-auto mt-5" aria-hidden="true" />
              <p className="text-amber-200/70 text-sm md:text-base mt-6 max-w-xl mx-auto leading-relaxed">
                Questions, feedback, or just want to say hello? Reach out to us and we'll get back to you as soon as
                possible.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ===== MAIN ===== */}
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            {/* ----- Form ----- */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={`${panel} lg:col-span-2 overflow-hidden flex flex-col`}
              aria-labelledby="contact-form-title"
            >
              <div className="px-6 py-4 bg-amber-950 text-amber-50">
                <h2 id="contact-form-title" className="f-display text-xl font-semibold">
                  Send us a message
                </h2>
                <p className="text-xs text-amber-200/70 mt-0.5">We usually reply within 24 hours</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                <div className="p-6 md:p-8 space-y-4 flex-1">
                  <AnimatePresence>
                    {success && (
                      <motion.div
                        role="status"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-sm rounded-xl"
                      >
                        <Icon name="check" className="w-4 h-4 shrink-0" />
                        Message sent! We'll get back to you soon.
                      </motion.div>
                    )}
                    {error && (
                      <motion.div
                        role="alert"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-start gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-xl"
                      >
                        <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className={labelCls}>
                        Name
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        required
                        type="text"
                        autoComplete="name"
                        className={inputCls}
                        placeholder="John Doe"
                        value={form.name}
                        onChange={setField('name')}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className={labelCls}>
                        Email
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        required
                        type="email"
                        autoComplete="email"
                        className={inputCls}
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={setField('email')}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className={labelCls}>
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      required
                      type="text"
                      className={inputCls}
                      placeholder="How can we help?"
                      value={form.subject}
                      onChange={setField('subject')}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className={labelCls}>
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={6}
                      className={`${inputCls} resize-none`}
                      placeholder="Tell us a bit more"
                      value={form.message}
                      onChange={setField('message')}
                    />
                  </div>
                </div>

                {/* Stub */}
                <div className="px-6 md:px-8 py-4 bg-amber-50 border-t border-dashed border-amber-300/80 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-amber-700/80">We'll reply to the email address above.</p>
                  <button
                    type="submit"
                    disabled={sending}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`}
                  >
                    {sending ? (
                      <>
                        <Spinner />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Icon name="send" className="w-4 h-4" />
                        Send message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.section>

            {/* ----- Newsletter ----- */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-ink-950 border border-amber-500/20 rounded-2xl p-6 md:p-8 flex flex-col"
              aria-labelledby="newsletter-title"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Icon name="mail" className="w-[18px] h-[18px]" />
                </span>
                <h3 id="newsletter-title" className="f-display text-xl font-semibold text-amber-200">
                  Our newsletter
                </h3>
              </div>
              <p className="text-sm text-amber-300/70 leading-relaxed mb-6">
                Get the latest events, exclusive offers, and announcements directly to your inbox.
              </p>

              <form onSubmit={handleNewsletter} className="space-y-3">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white/95 text-amber-950 placeholder-amber-700/40 rounded-xl text-sm transition-all ${focusRingDark}`}
                />
                <button
                  type="submit"
                  className={`w-full px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-100 text-sm font-medium rounded-xl transition-colors ${focusRingDark}`}
                >
                  Subscribe
                </button>
              </form>

              <div className="mt-auto pt-6">
                <div className="pt-5 border-t border-dashed border-amber-500/20 flex items-center gap-2 text-xs text-amber-300/60">
                  <Icon name="check" className="w-3.5 h-3.5 text-amber-500" />
                  No spam, unsubscribe anytime
                </div>
              </div>
            </motion.section>
          </div>

          {/* ===== INFO ===== */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className={`${panel} mt-6 grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-dashed divide-amber-200 overflow-hidden`}
            aria-label="Contact details"
          >
            {CONTACT_INFO.map((info) => (
              <div key={info.title} className="p-6 flex items-start gap-3 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
                  <Icon name={info.icon} className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-amber-700/80">{info.title}</p>
                  {info.href ? (
                    <a
                      href={info.href}
                      className={`f-display text-base font-semibold text-amber-950 hover:text-amber-700 break-words rounded transition-colors ${focusRing}`}
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="f-display text-base font-semibold text-amber-950">{info.value}</p>
                  )}
                  <p className="text-xs text-amber-700/80 mt-1">{info.description}</p>
                </div>
              </div>
            ))}
          </motion.section>

          {/* ===== MAP ===== */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-6 relative rounded-2xl overflow-hidden shadow-sm shadow-amber-950/5 bg-white"
          >
            <div className="absolute top-4 left-4 z-10 bg-white rounded-xl shadow-xl shadow-amber-950/10 p-4 max-w-xs hidden md:block">
              <h4 className="f-display font-semibold text-amber-950 mb-1">TiketKu Headquarters</h4>
              <p className="text-xs text-amber-700/80 leading-relaxed mb-2">
                Building Indonesia Tower, Jl. Sudirman No. 123
                <br />
                Jakarta Pusat, 10220
              </p>
              <div className="flex items-center gap-1 text-xs text-amber-800">
                <span className="text-amber-500" aria-hidden="true">★</span>
                <span className="font-semibold">4.5</span>
                <span className="text-amber-700/70">(1,234 reviews)</span>
              </div>
              <a
                href="https://maps.google.com/?q=Jakarta"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 text-xs text-amber-700 font-semibold mt-2 hover:text-amber-900 rounded ${focusRing}`}
              >
                View larger map
                <Icon name="arrow" className="w-3 h-3" />
              </a>
            </div>

            <iframe
              title="TiketKu location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=106.7%2C-6.3%2C106.9%2C-6.1&layer=mapnik&marker=-6.2088%2C106.8456"
              className="w-full h-72 md:h-80 border-0 block"
              loading="lazy"
            />
          </motion.div>
        </div>

        {/* ===== FOOTER ===== */}
        <footer className="bg-ink-950 border-t border-amber-500/20 mt-8">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-9 h-9 rounded-full bg-amber-800/30 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Icon name="ticket" className="w-4 h-4" />
                  </span>
                  <span className="f-display text-xl font-semibold text-amber-200">TiketKu</span>
                </div>
                <p className="text-sm text-amber-300/70 leading-relaxed">
                  Your gateway to unforgettable experiences. From intimate concerts to grand festivals.
                </p>
                <div className="flex gap-2 mt-4">
                  {SOCIALS.map((social) => (
                    <button
                      key={social}
                      type="button"
                      className={`w-9 h-9 rounded-full border border-amber-500/20 bg-amber-800/20 flex items-center justify-center text-amber-400 hover:bg-amber-700/30 hover:border-amber-500/40 transition-all ${focusRingDark}`}
                      aria-label={`Follow us on ${social}`}
                    >
                      <Icon name={social} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <FooterColumn title="Navigation" links={FOOTER_NAV} />
              <FooterColumn title="Services" links={FOOTER_SERVICES} />

              <div>
                <h4 className="text-sm font-semibold text-amber-400/90 mb-3">Contact</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-amber-300/70">
                    <Icon name="pin" className="w-4 h-4 text-amber-500/70 shrink-0" />
                    Jakarta, Indonesia
                  </li>
                  <li className="flex items-center gap-2 text-sm text-amber-300/70">
                    <Icon name="phone" className="w-4 h-4 text-amber-500/70 shrink-0" />
                    +62 812-3456-7890
                  </li>
                  <li className="flex items-center gap-2 text-sm text-amber-300/70">
                    <Icon name="mail" className="w-4 h-4 text-amber-500/70 shrink-0" />
                    support@tiketku.id
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-dashed border-amber-500/20 mt-10 pt-6">
              <p className="text-xs text-amber-300/60 text-center">
                © {new Date().getFullYear()} TiketKu. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}