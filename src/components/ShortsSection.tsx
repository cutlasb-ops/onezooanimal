import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Film, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isYouTubeUrl, getYouTubeVideoId, getYouTubeThumbnail } from '../lib/videoUtils';

interface Short {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category: string;
  created_at: string;
}

function getEmbedUrl(url: string): string {
  const id = getYouTubeVideoId(url);
  if (!id) return '';
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${id}`;
}

function getThumbnail(short: Short): string {
  if (short.thumbnail_url) return short.thumbnail_url;
  if (isYouTubeUrl(short.video_url)) {
    return getYouTubeThumbnail(short.video_url) || '';
  }
  return '';
}

export function ShortsSection() {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadShorts(); }, []);

  async function loadShorts() {
    const { data } = await supabase
      .from('shorts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(50);
    setShorts((data as Short[]) || []);
  }

  function scrollCards(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  }

  if (shorts.length === 0) return null;

  return (
    <section className="relative py-14 px-4 sm:px-6 lg:px-8">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(10,14,11,0.8) 20%, rgba(10,14,11,0.8) 80%, rgba(5,5,5,0) 100%)',
        }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-600/30">
              <Film size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#f8f6f2]">Shorts</h2>
              <p className="text-xs text-amber-300/50 mt-0.5">Quick clips from our animals</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollCards('left')}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all hover:border-amber-500/30"
            >
              <ChevronLeft size={16} className="text-white/70" />
            </button>
            <button
              onClick={() => scrollCards('right')}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all hover:border-amber-500/30"
            >
              <ChevronRight size={16} className="text-white/70" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll of cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' }}
        >
          {shorts.map((short, idx) => (
            <ShortCard
              key={short.id}
              short={short}
              isPlaying={playingIndex === idx}
              onPlay={() => setPlayingIndex(playingIndex === idx ? null : idx)}
              onClose={() => setPlayingIndex(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShortCard({ short, isPlaying, onPlay, onClose }: {
  short: Short;
  isPlaying: boolean;
  onPlay: () => void;
  onClose: () => void;
}) {
  const thumb = getThumbnail(short);
  const isYT = isYouTubeUrl(short.video_url);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (isPlaying && videoRef.current && !isYT) {
      videoRef.current.play().catch(() => {});
      setPaused(false);
    }
  }, [isPlaying, isYT]);

  function togglePause() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPaused(false);
    } else {
      videoRef.current.pause();
      setPaused(true);
    }
  }

  function toggleMute() {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
    }
    setMuted(!muted);
  }

  return (
    <div
      className={`relative shrink-0 rounded-2xl overflow-hidden snap-start transition-all duration-500 ease-out ${
        isPlaying
          ? 'w-72 sm:w-80 shadow-2xl shadow-amber-900/40 ring-2 ring-amber-500/50'
          : 'w-44 sm:w-52 hover:scale-[1.03] hover:shadow-2xl hover:shadow-amber-900/20'
      }`}
      style={{ aspectRatio: '9/16' }}
    >
      {isPlaying ? (
        <>
          {/* Active player */}
          {isYT ? (
            <iframe
              src={getEmbedUrl(short.video_url)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            />
          ) : (
            <video
              ref={videoRef}
              src={short.video_url}
              className="w-full h-full object-cover bg-black"
              autoPlay
              loop
              playsInline
              muted={muted}
              onClick={togglePause}
            />
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition border border-white/20"
          >
            <X size={12} className="text-white" />
          </button>

          {/* Controls (non-YouTube only) */}
          {!isYT && (
            <div className="absolute bottom-14 right-3 flex flex-col gap-2 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); togglePause(); }}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition border border-white/15"
              >
                {paused ? <Play size={12} className="text-white ml-0.5" fill="white" /> : <Pause size={12} className="text-white" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition border border-white/15"
              >
                {muted ? <VolumeX size={12} className="text-white" /> : <Volume2 size={12} className="text-white" />}
              </button>
            </div>
          )}

          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
            <p className="text-white text-sm font-bold truncate">{short.title || 'Untitled'}</p>
            {short.description && (
              <p className="text-white/60 text-[11px] mt-0.5 line-clamp-2">{short.description}</p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Thumbnail state */}
          <button
            onClick={onPlay}
            className="w-full h-full relative group focus:outline-none"
          >
            {thumb ? (
              <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-stone-800 to-stone-900 flex items-center justify-center">
                <Film size={32} className="text-amber-500/40" />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-lg transition-transform group-hover:scale-110 group-hover:bg-white/25">
                <Play size={18} className="text-white ml-0.5" fill="white" />
              </div>
            </div>

            {/* Category badge */}
            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-semibold text-amber-300 border border-amber-500/20">
              {short.category}
            </span>

            {/* Title at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">
                {short.title || 'Untitled'}
              </p>
              {short.description && (
                <p className="text-white/50 text-[10px] mt-1 line-clamp-1">{short.description}</p>
              )}
            </div>

            {/* Inner ring */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-white/10" />
          </button>
        </>
      )}
    </div>
  );
}
