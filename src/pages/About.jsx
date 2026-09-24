// src/pages/About.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    ticket: 'M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    arrow: 'M13 7l5 5-5 5M6 12h12',
    music: 'M9 18V5l12-2v13',
    flame: 'M12 23c-4.97 0-9-3.582-9-8 0-4.418 4.03-8.259 6.5-10.5C10.5 3.5 12 1 12 1s1.5 2.5 2.5 3.5C16.97 6.741 21 10.582 21 15c0 4.418-4.03 8-9 8z',
    globe: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    check: 'M5 13l4 4L19 7',
    chevron: 'M9 5l7 7-7 7',
    bolt: 'M13 2L3 14h7v8l10-12h-7V2z',
    trophy: 'M8 21h8M12 17v4M7 4h10v6a5 5 0 01-10 0V4zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3',
    sparkle: 'M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

export default function About() {
  // ===== KONTEN ASLI KAMU =====
  const values = [
    {
      icon: 'heart',
      title: 'Passion for Events',
      description: 'We believe in the power of live experiences to bring people together and create lasting memories.',
    },
    {
      icon: 'users',
      title: 'Community First',
      description: 'Building a community where event-goers and organizers connect seamlessly and meaningfully.',
    },
    {
      icon: 'shield',
      title: 'Trust & Security',
      description: 'Your transactions are protected with enterprise-grade security and transparent policies.',
    },
    {
      icon: 'globe',
      title: 'Accessibility',
      description: 'Making events accessible to everyone, everywhere, with just a few clicks.',
    },
  ];

  const stats = [
    { value: '500K+', label: 'Happy Customers' },
    { value: '10K+', label: 'Events Hosted' },
    { value: '50+', label: 'Cities Covered' },
    { value: '4.8★', label: 'Average Rating' },
  ];

  const whyChooseUs = [
    'Curated events from trusted organizers',
    'Secure and hassle-free transactions',
    'Instant ticket delivery to your device',
    'Dedicated customer support team',
  ];

  // ===== STATS TAMPILAN BARU (icon di strip dark) =====
  const statsWithIcons = [
    { icon: 'star', value: '500K+', label: 'Happy Customers' },
    { icon: 'ticket', value: '10K+', label: 'Events Hosted' },
    { icon: 'globe', value: '50+', label: 'Cities Covered' },
    { icon: 'trophy', value: '4.8★', label: 'Average Rating' },
  ];

  return (
    <div className="min-h-screen bg-[#f5ede4]">

      {/* ===== HERO ===== */}
      <div className="relative bg-ink-950 py-20 md:py-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/60" />

        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: '200px 200px',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="font-serif text-5xl md:text-6xl text-white leading-tight">
              About Us
            </h1>
            <div className="flex items-center justify-center gap-2 mt-3 text-sm font-serif">
              <Link to="/" className="text-amber-400 hover:text-amber-300 transition-colors">
                TiketKu
              </Link>
              <Icon name="chevron" className="w-3 h-3 text-amber-400/60" />
              <span className="text-amber-300/60">About Us</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ===== SECTION 1 — Gambar + Brand Story ===== */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* KIRI — Gambar dengan badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-amber-950/20 aspect-[4/5] max-w-md mx-auto">
              <img
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80"
                alt="TiketKu team"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute -bottom-4 -right-2 md:right-4 w-40 h-40 md:w-52 md:h-52 rounded-2xl overflow-hidden shadow-2xl shadow-amber-950/30 border-4 border-[#f5ede4] hidden sm:block">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80"
                alt="Team collaboration"
                className="w-full h-full object-cover"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute top-6 -left-2 md:left-4 bg-ink-950 border border-amber-500/30 rounded-2xl px-5 py-4 shadow-2xl shadow-amber-950/40"
            >
              <div className="font-serif text-3xl md:text-4xl text-amber-400 font-bold leading-none">
                25+
              </div>
              <div className="text-[10px] font-serif tracking-[0.2em] text-amber-300/60 uppercase mt-1 leading-tight">
                Years
                <br />
                of Experience
              </div>
            </motion.div>
          </motion.div>

          {/* KANAN — Brand story (ambil dari konten asli) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <span className="font-serif text-[10px] tracking-[0.3em] text-amber-600 uppercase">
              Our Story
            </span>

            <h2 className="font-serif text-3xl md:text-4xl text-amber-900 leading-tight mt-3">
              Your Gateway to{' '}
              <span className="italic text-amber-700">Unforgettable Moments</span>
            </h2>

            <p className="text-sm text-amber-800/70 font-serif leading-relaxed mt-5">
              Since 2020, TiketKu has been connecting people with the events they love.
              From intimate acoustic sessions to massive music festivals, we make
              discovering and attending events effortless.
            </p>

            <div className="mt-6">
              <p className="font-serif text-sm font-semibold text-amber-900 mb-3">
                Why Choose Us?
              </p>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {whyChooseUs.map((s) => (
                  <div key={s} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name="check" className="w-2.5 h-2.5 text-amber-700" />
                    </div>
                    <span className="text-xs font-serif text-amber-800/80 leading-relaxed">
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-7 px-6 py-3 bg-amber-800 hover:bg-amber-700 text-amber-100 font-serif text-sm rounded-full transition-colors"
            >
              Explore Events
              <Icon name="arrow" className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ===== STRIP STATS (dark ink full-width) ===== */}
      <div className="bg-ink-950 relative overflow-hidden">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {statsWithIcons.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 md:justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <Icon name={stat.icon} className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="font-serif text-2xl md:text-3xl text-amber-400 font-bold leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-serif text-amber-300/60 mt-1">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      </div>

      {/* ===== SECTION 2 — Mission + Values (pakai konten asli) ===== */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* KIRI — Mission text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-serif text-[10px] tracking-[0.3em] text-amber-600 uppercase">
              About Mission
            </span>

            <h2 className="font-serif text-3xl md:text-4xl text-amber-900 leading-tight mt-3">
              Our Main Goal to Satisfied{' '}
              <span className="italic text-amber-700">local & global clients</span>
            </h2>

            <div className="mt-6">
              <h3 className="font-serif text-lg text-amber-900 font-semibold mb-2">
                Our Mission
              </h3>
              <p className="text-sm text-amber-800/70 font-serif leading-relaxed">
                We're on a mission to democratize access to live events. Whether you're a
                first-time concert-goer or a seasoned festival veteran, we want to make
                sure you never miss out on the experiences that matter to you.
              </p>
              <p className="text-sm text-amber-800/70 font-serif leading-relaxed mt-3">
                By partnering with event organizers across the country, we provide a
                seamless platform that handles everything from discovery to ticket delivery,
                so you can focus on what really matters – enjoying the moment.
              </p>
            </div>
          </motion.div>

          {/* KANAN — Gambar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl shadow-amber-950/20 aspect-[4/3]"
          >
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80"
              alt="Team collaboration"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>

      {/* ===== SECTION 3 — Values (pakai 4 values asli kamu) ===== */}
      <div className="bg-[#ede2d4] py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-3">
              <Icon name="flame" className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-serif tracking-[0.3em] text-amber-600 uppercase">
                Our Values
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-amber-900">
              What Drives Us
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="bg-white/90 border border-amber-200/40 rounded-2xl p-6 text-center hover:shadow-xl hover:shadow-amber-900/10 transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-full bg-amber-100/70 flex items-center justify-center mx-auto mb-4">
                  <Icon name={value.icon} className="w-6 h-6 text-amber-800" />
                </div>
                <h3 className="font-serif text-lg text-amber-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-xs text-amber-700/60 font-serif leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CTA ===== */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-ink-950 rounded-3xl p-10 md:p-12 text-center border border-amber-500/20 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
              backgroundSize: '200px 200px',
            }}
          />

          <div className="relative">
            <h2 className="font-serif text-2xl md:text-3xl text-amber-200 mb-3">
              Ready to Experience Something Amazing?
            </h2>
            <p className="text-amber-300/60 font-serif text-sm mb-6 max-w-md mx-auto">
              Browse our curated events and find your next adventure.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-amber-800 hover:bg-amber-700 text-amber-100 font-serif text-sm rounded-full transition-colors border border-amber-500/30"
            >
              Explore Events
              <Icon name="arrow" className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}