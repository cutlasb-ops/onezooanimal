import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Radio, Globe, Video, PawPrint, Eye, Heart } from 'lucide-react';
import { UnderwaterCanvas } from './UnderwaterCanvas';

const WILDLIFE_IMAGES = [
  'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&q=90&w=1920',
  'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&q=90&w=1920',
  'https://images.unsplash.com/photo-1474511320723-9a56873571b7?auto=format&fit=crop&q=90&w=1920',
];

const FEATURES = [
  { icon: Radio, title: '24/7 Live Feeds', desc: 'Stream uninterrupted from cameras planted deep in the wild — lions on the prowl at dawn, elephants at the watering hole, and dolphins beneath the surface.', color: '#fbbf24' },
  { icon: Globe, title: 'Global Habitats', desc: 'Explore over 40 unique ecosystems — African savannah, Arctic tundra, Amazon rainforest, coral reefs, and everything in between.', color: '#34d399' },
  { icon: Video, title: 'Curated Highlights', desc: 'Miss a breathtaking moment? Our editors curate the best wildlife clips and loop them so you never miss the magic.', color: '#60a5fa' },
  { icon: PawPrint, title: '200+ Species', desc: 'From the tiniest poison dart frog to the largest blue whale, OneZoo covers an astounding diversity of life on Earth.', color: '#f87171' },
  { icon: Eye, title: 'HD Clarity', desc: 'Every stream is delivered in crisp high definition. Watch feathers ruffle, eyes blink, and whiskers twitch in stunning detail.', color: '#a3e635' },
  { icon: Heart, title: 'Conservation First', desc: 'Every view contributes to our partner conservation programs. Watching animals on OneZoo helps protect them in the real world.', color: '#fb923c' },
];

interface Props {
  onBack: () => void;
}

export function AboutSection({ onBack }: Props) {
  const stickyRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [featureVisibility, setFeatureVisibility] = useState<boolean[]>(new Array(FEATURES.length).fill(false));
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const quoteRef = useRef<HTMLDivElement>(null);
  const [quoteVisible, setQuoteVisible] = useState(false);

  const handleScroll = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const wrapperHeight = wrapperRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrolled = -rect.top;
    const totalScrollable = wrapperHeight - viewportHeight;
    const progress = Math.min(1, Math.max(0, scrolled / totalScrollable));
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    const el = document.querySelector('.about-scroll-container');
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const container = document.querySelector('.about-scroll-container');
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = featureRefs.current.indexOf(entry.target as HTMLDivElement);
          if (idx !== -1 && entry.isIntersecting) {
            setFeatureVisibility((prev) => {
              const next = [...prev];
              next[idx] = true;
              return next;
            });
          }
        });
      },
      { root: container, threshold: 0.2 }
    );

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    const quoteObs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setQuoteVisible(true);
      },
      { root: container, threshold: 0.3 }
    );
    if (quoteRef.current) quoteObs.observe(quoteRef.current);

    return () => {
      observer.disconnect();
      quoteObs.disconnect();
    };
  }, []);

  const layer1Opacity = scrollProgress < 0.15 ? 1 : Math.max(0, 1 - (scrollProgress - 0.15) / 0.1);
  const layer2Opacity = scrollProgress < 0.15 ? 0 : scrollProgress < 0.35 ? Math.min(1, (scrollProgress - 0.15) / 0.1) : Math.max(0, 1 - (scrollProgress - 0.35) / 0.1);
  const layer3Opacity = scrollProgress < 0.35 ? 0 : Math.min(1, (scrollProgress - 0.35) / 0.1);

  const bgImageIndex = scrollProgress < 0.25 ? 0 : scrollProgress < 0.45 ? 1 : 2;

  return (
    <div className="fixed inset-0 about-scroll-container overflow-y-auto" style={{ zIndex: 100, background: '#0a0a0a' }}>
      <div className="sticky top-0 flex items-center justify-between px-6 py-4" style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(251,191,36,0.1)', zIndex: 50 }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-medium transition-all duration-200 hover:gap-3 text-amber-400/80 hover:text-amber-300"
        >
          <ArrowLeft size={18} />
          Back to Feeds
        </button>
        <div className="flex items-center gap-3">
          <img src="/image%20copy%20copy%20copy.png" alt="OneZoo Logo" className="h-10 w-10 rounded-lg object-cover" style={{ boxShadow: '0 0 12px rgba(251,191,36,0.25)' }} />
          <span className="font-bold text-xl" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            OneZoo
          </span>
        </div>
      </div>

      <div ref={wrapperRef} style={{ height: '400vh' }} className="relative">
        <div ref={stickyRef} className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">

          {WILDLIFE_IMAGES.map((src, i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                backgroundImage: `url('${src}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: bgImageIndex === i ? 0.4 : 0,
                transition: 'opacity 1.5s ease-in-out',
              }}
            />
          ))}

          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.85) 70%)' }} />

          <UnderwaterCanvas scrollProgress={scrollProgress} />

          <div
            className="relative z-20 flex flex-col items-center justify-center text-center px-6 w-full max-w-5xl mx-auto transition-opacity duration-700"
            style={{ opacity: layer1Opacity, pointerEvents: layer1Opacity < 0.3 ? 'none' : 'auto' }}
          >
            <span className="text-amber-400/70 text-lg md:text-xl font-semibold mb-4 tracking-widest uppercase">About OneZoo</span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[1.05]" style={{ background: 'linear-gradient(90deg, #fef3c7, #fbbf24 30%, #d97706 65%, #92400e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Experience. Connect. Protect.
            </h1>
          </div>

          <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6 w-full max-w-4xl mx-auto transition-opacity duration-700"
            style={{ opacity: layer2Opacity, pointerEvents: layer2Opacity < 0.3 ? 'none' : 'auto' }}
          >
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-8" style={{ background: 'linear-gradient(90deg, #fef3c7, #fbbf24 30%, #d97706 65%, #92400e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              The wild, unfiltered.
            </h2>
            <p className="text-stone-400 text-lg md:text-2xl font-medium leading-relaxed">
              The world's premier wildlife streaming platform -- bringing the wild directly to your screen, 24 hours a day, 7 days a week. From vast savannahs to deep ocean trenches,{' '}
              <span className="text-stone-100">OneZoo connects millions of nature lovers with real animals in their natural habitats.</span>
            </p>
          </div>

          <div
            className="absolute inset-0 z-40 flex flex-col items-center justify-center text-center px-6 w-full max-w-4xl mx-auto transition-opacity duration-700"
            style={{ opacity: layer3Opacity, pointerEvents: layer3Opacity < 0.3 ? 'none' : 'auto' }}
          >
            <div className="mb-10">
              <p className="text-3xl md:text-5xl font-black tracking-tight mb-2" style={{ background: 'linear-gradient(90deg, #fef3c7, #fbbf24 30%, #d97706 65%, #92400e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                40+ ecosystems. 200+ species. One platform.
              </p>
            </div>
            <p className="text-stone-400 text-lg md:text-2xl font-medium leading-relaxed">
              No filters, no staging -- just raw, beautiful wildlife, live. Every stream powers{' '}
              <span className="text-stone-100">real conservation efforts</span>{' '}
              around the globe, making every viewer a part of the mission to protect these incredible creatures.
            </p>
          </div>

        </div>
      </div>

      <div style={{ background: '#0a0a0a' }}>
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-amber-500/60 text-sm font-semibold tracking-widest uppercase">What We Offer</span>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight mt-3 text-stone-100">
              Built for wildlife lovers
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  ref={(el) => { featureRefs.current[i] = el; }}
                  className="group relative rounded-2xl p-7 transition-all duration-500"
                  style={{
                    background: 'rgba(20,20,20,0.8)',
                    border: `1px solid ${card.color}20`,
                    backdropFilter: 'blur(12px)',
                    boxShadow: `0 4px 30px rgba(0,0,0,0.4)`,
                    opacity: featureVisibility[i] ? 1 : 0,
                    transform: featureVisibility[i] ? 'translateY(0)' : 'translateY(30px)',
                    transitionDelay: `${i * 80}ms`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 50px rgba(0,0,0,0.5), 0 0 25px ${card.color}20`;
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${card.color}50`;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 30px rgba(0,0,0,0.4)`;
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${card.color}20`;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div className="mb-5 transition-transform duration-300 group-hover:scale-110" style={{ color: card.color }}>
                    <Icon size={36} />
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-stone-100">{card.title}</h4>
                  <p className="text-sm leading-relaxed text-stone-400">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8" ref={quoteRef}>
          <div
            className="max-w-3xl mx-auto rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden transition-all duration-1000"
            style={{
              background: 'rgba(15,15,15,0.9)',
              border: '1px solid rgba(251,191,36,0.15)',
              boxShadow: '0 0 80px rgba(251,191,36,0.05)',
              opacity: quoteVisible ? 1 : 0,
              transform: quoteVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.06) 0%, transparent 70%)' }} />
            <p className="text-2xl sm:text-3xl font-black leading-tight mb-5 relative z-10 text-amber-100/90">
              "Nature is not a place to visit. It is home."
            </p>
            <p className="text-sm font-medium relative z-10 text-amber-500/50">
              -- Gary Snyder &nbsp;|&nbsp; The ethos behind everything we build at OneZoo
            </p>
          </div>
        </section>

        <section className="py-20 px-4 text-center">
          <p className="text-sm font-medium tracking-widest uppercase mb-5 text-amber-500/40">Ready to explore?</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 text-stone-900"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', boxShadow: '0 0 40px rgba(251,191,36,0.25)' }}
          >
            Explore Live Feeds
          </button>
        </section>

        <div className="h-16" />
      </div>
    </div>
  );
}
