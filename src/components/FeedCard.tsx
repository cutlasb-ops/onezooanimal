import { useState, useEffect, useRef } from 'react';
import { Play, MessageCircle, Link2, Radio, RotateCcw } from 'lucide-react';
import { FeedModal } from './FeedModal';
import { isYouTubeUrl, getYouTubeThumbnail } from '../lib/videoUtils';
import type { AnimalFeed } from '../lib/database.types';

interface FeedCardProps {
  feed: AnimalFeed;
  onNeedAuth: () => void;
  onNeedCoins: () => void;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function LiveTimer() {
  const [seconds, setSeconds] = useState(() => Math.floor(Math.random() * 14400 + 3600));
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono tabular-nums" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem' }}>
      {formatDuration(seconds)}
    </span>
  );
}

export function FeedCard({ feed, onNeedAuth, onNeedCoins }: FeedCardProps) {
  const isLive = feed.feed_type === 'live';
  const isYT = feed.video_url ? isYouTubeUrl(feed.video_url) : false;
  const thumbnail = isYT ? getYouTubeThumbnail(feed.video_url) : feed.thumbnail_url;

  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setImgError(false);
  }, [thumbnail]);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(feed.video_url).catch(() => {});
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <article
        className="group relative rounded-2xl overflow-hidden cursor-pointer select-none flex flex-col"
        style={{
          background: 'linear-gradient(160deg, #1c1200 0%, #120c00 100%)',
          border: '1px solid rgba(180,140,60,0.18)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.45)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        }}
        role="button"
        tabIndex={0}
        aria-label={`${feed.title} - ${isLive ? 'Live stream' : 'Video'} - ${feed.view_count.toLocaleString()} viewers`}
        onClick={() => setModalOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setModalOpen(true); } }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,170,80,0.3)';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,170,80,0.35)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 20px rgba(0,0,0,0.45)';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(180,140,60,0.18)';
        }}
      >
        {/* Thumbnail */}
        <div className="relative overflow-hidden shrink-0" style={{ height: '195px', background: '#0d0800' }}>
          {thumbnail && !imgError ? (
            <img
              src={thumbnail}
              alt={feed.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1000 0%, #0d0800 100%)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(180,130,30,0.12)', border: '1px solid rgba(180,130,30,0.2)' }}>
                <Play size={22} style={{ color: 'rgba(212,170,80,0.5)', marginLeft: 3 }} />
              </div>
            </div>
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 35%, rgba(0,0,0,0.55) 100%)' }}
          />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: 'rgba(0,0,0,0.55)',
                border: '2px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Play size={22} fill="white" style={{ color: 'white', marginLeft: 3 }} />
            </div>
          </div>

          {/* Live badge */}
          {isLive && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'rgba(220,38,38,0.85)', backdropFilter: 'blur(4px)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-xs font-bold tracking-wider">LIVE</span>
              <LiveTimer />
            </div>
          )}

          {/* Looped badge */}
          {!isLive && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: '1px solid rgba(180,130,30,0.35)' }}>
              <RotateCcw size={10} style={{ color: 'rgba(212,170,80,0.8)' }} />
              <span className="text-xs font-bold" style={{ color: 'rgba(212,170,80,0.9)', letterSpacing: '0.06em' }}>LOOP</span>
            </div>
          )}

          {/* Viewer count bottom-right */}
          <div className="absolute bottom-2.5 right-3 flex items-center gap-1 pointer-events-none">
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
              {feed.view_count.toLocaleString()} viewers
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 px-4 pt-3 pb-3" style={{ flex: 1 }}>
          <h3
            className="font-bold leading-snug line-clamp-1"
            style={{ fontSize: '0.95rem', color: '#f0d080', letterSpacing: '-0.01em' }}
          >
            {feed.title}
          </h3>
          {feed.description && (
            <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'rgba(200,160,60,0.55)' }}>
              {feed.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-2 px-4 pb-4"
          style={{ borderTop: '1px solid rgba(180,140,60,0.12)', paddingTop: '10px' }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, #b8720a 0%, #d4a416 100%)',
              color: '#fff',
              letterSpacing: '0.04em',
              boxShadow: '0 2px 10px rgba(180,130,10,0.35)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #a36008 0%, #c49012 100%)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(180,130,10,0.5)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #b8720a 0%, #d4a416 100%)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 10px rgba(180,130,10,0.35)';
            }}
            onClick={() => setModalOpen(true)}
            aria-label={isLive ? `Watch ${feed.title} live` : `Play ${feed.title}`}
          >
            {isLive ? <><Radio size={14} aria-hidden="true" /> WATCH LIVE</> : <><Play size={14} fill="white" aria-hidden="true" /> PLAY</>}
          </button>

          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
            style={{
              background: 'rgba(180,130,30,0.07)',
              border: '1px solid rgba(180,130,30,0.18)',
              color: '#8a6615',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(180,130,30,0.15)';
              (e.currentTarget as HTMLButtonElement).style.color = '#c9930a';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(180,130,30,0.07)';
              (e.currentTarget as HTMLButtonElement).style.color = '#8a6615';
            }}
            onClick={() => setModalOpen(true)}
            title="Open chat"
          >
            <MessageCircle size={15} />
          </button>

          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
            style={{
              background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(180,130,30,0.07)',
              border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(180,130,30,0.18)',
              color: copied ? '#16a34a' : '#8a6615',
            }}
            onMouseEnter={e => {
              if (!copied) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(180,130,30,0.15)';
                (e.currentTarget as HTMLButtonElement).style.color = '#c9930a';
              }
            }}
            onMouseLeave={e => {
              if (!copied) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(180,130,30,0.07)';
                (e.currentTarget as HTMLButtonElement).style.color = '#8a6615';
              }
            }}
            onClick={handleCopy}
            title="Copy link"
          >
            <Link2 size={15} />
          </button>
        </div>
      </article>

      {modalOpen && <FeedModal feed={feed} onClose={() => setModalOpen(false)} onNeedAuth={onNeedAuth} onNeedCoins={onNeedCoins} />}
    </>
  );
}

