import { ArrowLeft, Mail, MapPin, Clock } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const SOCIALS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/onezooanimals/',
    handle: 'OneZoo',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/onezoozookeeper/',
    handle: '@onezoozookeeper',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@onezoozookeeper',
    handle: '@onezoozookeeper',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.49a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.72a8.19 8.19 0 0 0 4.76 1.52V6.79a4.83 4.83 0 0 1-1-.1z" />
      </svg>
    ),
  },
];

export function ContactPage({ onBack }: Props) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div
        className="min-h-screen"
        style={{
          background: 'linear-gradient(135deg, #1a0f00 0%, #2d1a06 30%, #1a2e10 60%, #0d1f0a 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url('/image%20copy%20copy%20copy%20copy.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px) saturate(0.5)',
          }}
        />

        <div className="relative z-10">
          <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-8 pb-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-amber-300/80 hover:text-amber-200 transition-colors text-sm font-medium group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>
          </div>

          <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-8 pb-20">
            <div className="mb-16">
              <p className="text-amber-400/70 text-sm font-semibold tracking-widest uppercase mb-4">
                Contact Us
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Let's <span className="text-amber-400">Connect</span>
              </h1>
              <p className="text-white/50 text-lg max-w-xl leading-relaxed">
                Have a question, partnership idea, or just want to say hello?
                We'd love to hear from you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                      <Mail size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white/40 text-sm font-medium mb-1">Email</p>
                      <a
                        href="mailto:zookeeper@onezoo.com"
                        className="text-white text-lg font-semibold hover:text-amber-300 transition-colors"
                      >
                        zookeeper@onezoo.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                      <MapPin size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white/40 text-sm font-medium mb-1">Location</p>
                      <p className="text-white text-lg font-semibold">Worldwide</p>
                      <p className="text-white/40 text-sm mt-0.5">Streaming from every continent</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                      <Clock size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white/40 text-sm font-medium mb-1">Availability</p>
                      <p className="text-white text-lg font-semibold">24/7 Live Streams</p>
                      <p className="text-white/40 text-sm mt-0.5">Always something to watch</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white text-lg font-semibold mb-6">Follow Us</h3>
                <div className="space-y-3">
                  {SOCIALS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-200 group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                        {s.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">{s.label}</p>
                        <p className="text-white/40 text-sm">{s.handle}</p>
                      </div>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white/30 group-hover:text-amber-400 transition-colors"
                      >
                        <path d="M7 7h10v10" />
                        <path d="M7 17 17 7" />
                      </svg>
                    </a>
                  ))}
                </div>

                <div className="mt-8 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/15">
                  <p className="text-amber-300/80 text-sm font-medium mb-2">Partnerships & Media</p>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Interested in partnering with OneZoo or have a media inquiry?
                    Reach out to us at{' '}
                    <a href="mailto:zookeeper@onezoo.com" className="text-amber-400 hover:text-amber-300 transition-colors">
                      zookeeper@onezoo.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
