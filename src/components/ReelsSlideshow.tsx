import { useState, useEffect, useRef } from 'react';
import { Youtube, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getYouTubeVideoId, getYouTubeThumbnail } from '../lib/videoUtils';

interface ShortItem {
  id: string;
  videoId: string;
  url: string;
}

const CYCLE_MS = 12000;

export function ReelsSlideshow() {
  const [items, setItems] = useState<ShortItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const cycleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('social_media_posts')
        .select('*')
        .eq('platform', 'youtube')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data) {
        const shorts: ShortItem[] = data
          .map((p) => {
            const videoId = getYouTubeVideoId(p.post_url);
            return videoId ? { id: p.id, videoId, url: p.post_url } : null;
          })
          .filter((p): p is ShortItem => p !== null);
        setItems(shorts);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    if (cycleRef.current) clearTimeout(cycleRef.current);
    cycleRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, CYCLE_MS);
    return () => {
      if (cycleRef.current) clearTimeout(cycleRef.current);
    };
  }, [activeIndex, items.length]);

  if (loading || items.length === 0) return null;

  const active = items[activeIndex];
  const prevIndex = (activeIndex - 1 + items.length) % items.length;
  const nextIndex = (activeIndex + 1) % items.length;

  const handlePrev = () => setActiveIndex(prevIndex);
  const handleNext = () => setActiveIndex(nextIndex);

  return (
    <section className="w-full relative overflow-hidden" style={{ background: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}
            >
              <Youtube size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                From Our Shorts
              </h2>
              <p className="text-sm text-white/40">Cycling YouTube Shorts</p>
            </div>
          </div>
          <a
            href="https://www.youtube.com/@onezoozookeeper"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.03] active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            Subscribe
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center gap-4 sm:gap-6 justify-center">
          {items.length > 1 && (
            <button
              onClick={handlePrev}
              aria-label="Previous short"
              className="hidden sm:flex shrink-0 w-11 h-11 rounded-full items-center justify-center transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
              }}
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {items.length > 2 && (
            <button
              onClick={handlePrev}
              className="hidden md:block shrink-0 w-[170px] aspect-[9/16] rounded-2xl overflow-hidden relative group cursor-pointer"
              style={{ opacity: 0.4, transition: 'opacity 0.3s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.7')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.4')}
              aria-label="Previous short"
            >
              <img
                src={getYouTubeThumbnail(items[prevIndex].url) || ''}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
            </button>
          )}

          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl shrink-0"
            style={{
              width: 'min(320px, 85vw)',
              aspectRatio: '9 / 16',
              background: '#000',
              boxShadow: '0 20px 60px rgba(220,38,38,0.25), 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            <iframe
              key={active.videoId}
              src={`https://www.youtube-nocookie.com/embed/${active.videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${active.videoId}`}
              title="YouTube Short"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: 0 }}
            />
          </div>

          {items.length > 2 && (
            <button
              onClick={handleNext}
              className="hidden md:block shrink-0 w-[170px] aspect-[9/16] rounded-2xl overflow-hidden relative group cursor-pointer"
              style={{ opacity: 0.4, transition: 'opacity 0.3s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.7')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.4')}
              aria-label="Next short"
            >
              <img
                src={getYouTubeThumbnail(items[nextIndex].url) || ''}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
            </button>
          )}

          {items.length > 1 && (
            <button
              onClick={handleNext}
              aria-label="Next short"
              className="hidden sm:flex shrink-0 w-11 h-11 rounded-full items-center justify-center transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
              }}
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {items.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to short ${i + 1}`}
                className="transition-all rounded-full"
                style={{
                  width: i === activeIndex ? 28 : 8,
                  height: 8,
                  background: i === activeIndex ? '#dc2626' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-center sm:hidden gap-4 mt-5">
          <button
            onClick={handlePrev}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
            aria-label="Previous short"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={handleNext}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
            aria-label="Next short"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}
