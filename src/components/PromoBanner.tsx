import { useState, useEffect, useCallback } from 'react';
import { Coins, Zap, Star, Crown, Sparkles, ChevronLeft, ChevronRight, Megaphone, Gift, Tag, Heart, Ticket, type LucideIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PromoBanner as PromoBannerType } from '../lib/database.types';

const ICON_MAP: Record<string, LucideIcon> = {
  coins: Coins,
  zap: Zap,
  star: Star,
  crown: Crown,
  sparkles: Sparkles,
  megaphone: Megaphone,
  gift: Gift,
  tag: Tag,
  heart: Heart,
  ticket: Ticket,
};

interface Slide {
  id: string;
  headline: string;
  subtext: string;
  gradient: string;
  accent: string;
  icon: LucideIcon;
  badgeLabel: string;
  buttonText: string;
  buttonAction: string;
  buttonLink: string;
  imageUrl: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 'intro',
    headline: 'Introducing OneZoo Coins',
    subtext: 'Interact with live animals in real-time -- toss treats, drop toys, and trigger fun moments!',
    gradient: 'linear-gradient(135deg, #1a3c2a 0%, #0f2318 40%, #1a3520 100%)',
    accent: '#f59e0b',
    icon: Coins,
    badgeLabel: 'New',
    buttonText: 'Get Coins',
    buttonAction: 'open_coin_shop',
    buttonLink: '',
    imageUrl: '',
  },
  {
    id: 'starter',
    headline: '50 Coins -- Just $0.99',
    subtext: 'Try it out with the Starter Pack. Enough coins to toss your first treat on a live cam!',
    gradient: 'linear-gradient(135deg, #2a1f0a 0%, #1a1508 40%, #2a1d0e 100%)',
    accent: '#d97706',
    icon: Zap,
    badgeLabel: 'New',
    buttonText: 'Get Coins',
    buttonAction: 'open_coin_shop',
    buttonLink: '',
    imageUrl: '',
  },
  {
    id: 'keeper',
    headline: 'Best Value: 500 Coins',
    subtext: 'The Zookeeper Pack gives you 500 coins for $4.99 -- our most popular choice!',
    gradient: 'linear-gradient(135deg, #0a1a2e 0%, #081422 40%, #0e1f33 100%)',
    accent: '#2563eb',
    icon: Star,
    badgeLabel: 'New',
    buttonText: 'Get Coins',
    buttonAction: 'open_coin_shop',
    buttonLink: '',
    imageUrl: '',
  },
  {
    id: 'champion',
    headline: '1,200 Coins for $9.99',
    subtext: 'The Champion Pack -- keep the fun going with massive coin savings.',
    gradient: 'linear-gradient(135deg, #2e0a0a 0%, #1a0808 40%, #2a0e0e 100%)',
    accent: '#dc2626',
    icon: Crown,
    badgeLabel: 'New',
    buttonText: 'Get Coins',
    buttonAction: 'open_coin_shop',
    buttonLink: '',
    imageUrl: '',
  },
  {
    id: 'ultimate',
    headline: '3,000 Coins -- Go All In',
    subtext: 'The Ultimate Pack. Maximum coins, maximum fun, maximum impact on animal enrichment.',
    gradient: 'linear-gradient(135deg, #1a0a2e 0%, #120822 40%, #1e0e33 100%)',
    accent: '#7c3aed',
    icon: Sparkles,
    badgeLabel: 'New',
    buttonText: 'Get Coins',
    buttonAction: 'open_coin_shop',
    buttonLink: '',
    imageUrl: '',
  },
];

function dbToSlide(banner: PromoBannerType): Slide {
  return {
    id: banner.id,
    headline: banner.headline,
    subtext: banner.subtext,
    gradient: banner.gradient,
    accent: banner.accent_color,
    icon: ICON_MAP[banner.icon_name] || Coins,
    badgeLabel: banner.badge_label,
    buttonText: banner.button_text,
    buttonAction: banner.button_action,
    buttonLink: banner.button_link,
    imageUrl: banner.image_url || '',
  };
}

const SLIDE_INTERVAL = 4500;

interface PromoBannerProps {
  onOpenCoinShop: () => void;
  onOpenGameZone?: () => void;
}

export function PromoBanner({ onOpenCoinShop, onOpenGameZone }: PromoBannerProps) {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('promo_banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (data && data.length > 0) {
        setSlides(data.map(dbToSlide));
        setCurrent(0);
      }
    })();
  }, []);

  const goTo = useCallback((index: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrent(index);
    setTimeout(() => setTransitioning(false), 600);
  }, [transitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, slides.length, goTo]);

  useEffect(() => {
    const timer = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];
  if (!slide) return null;
  const Icon = slide.icon;

  const handleClick = () => {
    if (slide.buttonAction === 'open_game_zone' || slide.buttonLink === '#game-zone') {
      if (onOpenGameZone) onOpenGameZone();
      return;
    }
    if (slide.buttonAction === 'open_link' && slide.buttonLink) {
      window.open(slide.buttonLink, '_blank', 'noopener,noreferrer');
      return;
    }
    onOpenCoinShop();
  };

  return (
    <div className="w-full" style={{ background: '#fdf6e3' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <button
          onClick={handleClick}
          className="relative w-full block rounded-xl overflow-hidden group cursor-pointer border-0 bg-transparent p-0 text-left"
          style={{ minHeight: slide.imageUrl ? 220 : 112 }}
        >
          {slides.map((s, i) => (
            <div
              key={s.id}
              className="absolute inset-0 rounded-xl"
              style={{
                background: s.gradient,
                opacity: i === current ? 1 : 0,
                pointerEvents: i === current ? 'auto' : 'none',
                transition: 'opacity 600ms ease-in-out',
              }}
            />
          ))}

          {slides.map((s, i) =>
            s.imageUrl ? (
              <div
                key={`img-${s.id}`}
                className="absolute inset-0 rounded-xl"
                style={{
                  backgroundImage: `url('${s.imageUrl}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: i === current ? 1 : 0,
                  pointerEvents: i === current ? 'auto' : 'none',
                  transition: 'opacity 600ms ease-in-out',
                }}
              />
            ) : null
          )}

          {slide.imageUrl && (
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.0) 75%)',
              }}
            />
          )}

          <div className="absolute inset-0 rounded-xl opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div
            className="absolute top-0 left-0 h-full w-1 rounded-l-xl"
            style={{ background: slide.accent, transition: 'background 500ms' }}
          />

          <div className="relative flex items-center gap-4 sm:gap-6 p-4 sm:p-5 md:p-6">
            <div
              className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center"
              style={{
                background: `${slide.accent}18`,
                border: `1.5px solid ${slide.accent}30`,
                boxShadow: `0 0 20px ${slide.accent}15`,
                transition: 'all 500ms',
              }}
            >
              <Icon
                size={28}
                className="group-hover:scale-110"
                style={{ color: slide.accent, transition: 'transform 500ms' }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: `${slide.accent}20`, color: slide.accent, transition: 'all 500ms' }}
                >
                  {slide.badgeLabel}
                </span>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight">
                {slide.headline}
              </h3>
              <p className="text-xs sm:text-sm text-white/50 mt-1 leading-relaxed max-w-lg hidden sm:block">
                {slide.subtext}
              </p>
            </div>

            <div className="shrink-0 hidden sm:flex flex-col items-center gap-2">
              <span
                className="px-5 py-2.5 rounded-lg font-bold text-sm text-white group-hover:scale-105 group-hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)`,
                  boxShadow: `0 4px 15px ${slide.accent}30`,
                  transition: 'all 300ms',
                }}
              >
                {slide.buttonText}
              </span>
            </div>
          </div>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, i) => (
              <span
                key={i}
                className="block h-1 rounded-full"
                style={{
                  width: i === current ? 20 : 6,
                  background: i === current ? slide.accent : 'rgba(255,255,255,0.2)',
                  transition: 'all 400ms',
                }}
              />
            ))}
          </div>
        </button>

        <div className="flex items-center justify-end gap-2 mt-2">
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-amber-700/50 hover:text-amber-700 hover:bg-amber-200/50 transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[11px] text-amber-700/40 font-medium tabular-nums">
            {current + 1} / {slides.length}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-amber-700/50 hover:text-amber-700 hover:bg-amber-200/50 transition-all"
            aria-label="Next slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
