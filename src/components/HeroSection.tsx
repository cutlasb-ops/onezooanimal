import { useState, useEffect, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';

const SLIDESHOW_IMAGES = [
  'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&q=90&w=2560',
  'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=90&w=2560',
  'https://images.unsplash.com/photo-1474511320723-9a56873571b7?auto=format&fit=crop&q=90&w=2560',
  'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&q=90&w=2560',
  'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&q=90&w=2560',
  'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&q=90&w=2560',
];

const SLIDE_INTERVAL = 5000;

interface HeroSectionProps {
  onAbout: () => void;
}

export function HeroSection({ onAbout }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [isTransitioning]);

  useEffect(() => {
    const timer = setInterval(() => {
      goToSlide((currentSlide + 1) % SLIDESHOW_IMAGES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [currentSlide, goToSlide]);

  return (
    <section className="w-full">
      <div className="relative w-full h-[85vh] min-h-[500px] max-h-[800px] overflow-hidden">
        {SLIDESHOW_IMAGES.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${src}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === currentSlide ? 1 : 0,
              transform: i === currentSlide ? 'scale(1.03) translateZ(0)' : 'scale(1.08) translateZ(0)',
              transition: 'opacity 1.4s ease-in-out, transform 1.4s ease-in-out',
              willChange: i === currentSlide ? 'opacity, transform' : 'auto',
            }}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(700px 350px at 20% 70%, rgba(214,162,58,0.18), transparent 60%),' +
              'radial-gradient(900px 400px at 80% 20%, rgba(255,179,71,0.10), transparent 60%)',
          }}
        />

        <div className="relative h-full flex flex-col justify-between p-6 sm:p-10 md:p-16 lg:p-20 text-white max-w-7xl mx-auto">
          <div className="max-w-2xl mt-auto mb-auto">
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.02] mb-6 tracking-tight"
              style={{ textShadow: '0 4px 40px rgba(0,0,0,0.75)' }}
            >
              Enter <br />
              the <span className="text-[#d6a23a]">Wild</span>
            </h1>
            <p
              className="text-base sm:text-lg text-white/70 max-w-md mb-8 leading-relaxed"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
            >
              Real-time wildlife broadcasts from across the planet.
              Cinematic, immersive, and always live.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm font-semibold">
              <a
                href="#feeds"
                className="flex items-center gap-2 px-7 py-3.5 bg-[#d6a23a] hover:bg-[#ffb347] text-black rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(214,162,58,0.45)] font-semibold tracking-wide uppercase text-xs"
              >
                Watch Live
                <ArrowRight size={16} />
              </a>
              <button
                onClick={onAbout}
                className="flex items-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/15 rounded-full transition-all duration-300 font-semibold tracking-wide uppercase text-xs"
              >
                Explore Streams
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="flex gap-2.5 pb-2 md:hidden">
            {SLIDESHOW_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  background: i === currentSlide ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                  width: i === currentSlide ? 32 : 10,
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>


        <div
          className="absolute bottom-0 right-0 rounded-tl-[2.5rem] p-6 md:p-8 lg:p-10 hidden md:flex gap-6 lg:gap-8 items-center z-20"
          style={{
            background: 'linear-gradient(135deg, rgba(11,18,13,0.85), rgba(5,5,5,0.75))',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(214,162,58,0.18)',
            boxShadow: '-8px -8px 40px rgba(214,162,58,0.08)',
          }}
        >
          <div className="text-left">
            <h3 className="text-3xl lg:text-4xl font-bold text-[#d6a23a] mb-1 tracking-tight">24/7</h3>
            <p className="text-xs lg:text-sm font-medium text-[#b8b4aa] max-w-[110px] leading-snug">Live streams from around the globe</p>
          </div>
          <div className="w-px h-12" style={{ background: 'rgba(214,162,58,0.2)' }} />
          <div className="text-left">
            <h3 className="text-3xl lg:text-4xl font-bold text-[#d6a23a] mb-1 tracking-tight">100+</h3>
            <p className="text-xs lg:text-sm font-medium text-[#b8b4aa] max-w-[110px] leading-snug">Species featured on the platform</p>
          </div>
          <div className="w-px h-12" style={{ background: 'rgba(214,162,58,0.2)' }} />
          <div className="text-left">
            <h3 className="text-3xl lg:text-4xl font-bold text-[#d6a23a] mb-1 tracking-tight">HD</h3>
            <p className="text-xs lg:text-sm font-medium text-[#b8b4aa] max-w-[110px] leading-snug">Crystal clear quality streaming</p>
          </div>

          <div className="hidden md:flex gap-2 ml-3">
            {SLIDESHOW_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  background: i === currentSlide ? '#d6a23a' : 'rgba(248,246,242,0.2)',
                  width: i === currentSlide ? 28 : 8,
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
