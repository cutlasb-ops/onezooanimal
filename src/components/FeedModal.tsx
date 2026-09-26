import { useEffect, useState } from 'react';
import { X, Eye, Radio, RotateCcw, MapPin, Heart, Share2, Sparkles, ChevronRight, Copy, Check, Twitter, Facebook, MessageCircle as MessageIcon } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { ChatPanel } from './ChatPanel';
import { FeedInteractions } from './FeedInteractions';
import { InteractionEffectsCanvas, useInteractionEffects } from './InteractionEffects';
import { TalkToAnimal } from './TalkToAnimal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { AnimalFeed } from '../lib/database.types';

function makeShareSlug() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz';
  let out = '';
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function getDisplayName(): string {
  const stored = localStorage.getItem('onezoo_chat_username');
  if (stored) return stored;
  return 'A wildlife fan';
}

interface Props {
  feed: AnimalFeed;
  onClose: () => void;
  onNeedAuth: () => void;
  onNeedCoins: () => void;
}

export function FeedModal({ feed, onClose, onNeedAuth, onNeedCoins }: Props) {
  const isLive = feed.feed_type === 'live';
  const { effects, triggerEffect } = useInteractionEffects();
  const [following, setFollowing] = useState(false);
  const [showHighlight, setShowHighlight] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const { user, profile } = useAuth();

  async function ensureShareUrl(): Promise<string> {
    if (shareUrl) return shareUrl;
    setShareLoading(true);
    try {
      const referrerName =
        profile?.display_name?.trim() ||
        user?.email?.split('@')[0] ||
        getDisplayName();

      let slug = makeShareSlug();
      const { error } = await supabase
        .from('feed_shares' as never)
        .insert({ id: slug, feed_id: feed.id, referrer_name: referrerName } as never);

      if (error) {
        slug = makeShareSlug() + makeShareSlug().slice(0, 2);
        await supabase
          .from('feed_shares' as never)
          .insert({ id: slug, feed_id: feed.id, referrer_name: referrerName } as never);
      }

      const url = `${window.location.origin}/?s=${slug}`;
      setShareUrl(url);
      return url;
    } finally {
      setShareLoading(false);
    }
  }

  async function handleOpenShare() {
    setShareOpen(true);
    if (!shareUrl) {
      try { await ensureShareUrl(); } catch { /* ignore */ }
    }
  }

  async function handleCopyShare() {
    const url = await ensureShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function handleNativeShare() {
    const url = await ensureShareUrl();
    const referrerName =
      profile?.display_name?.trim() ||
      user?.email?.split('@')[0] ||
      getDisplayName();
    const text = `${referrerName} is watching ${feed.title} live on OneZoo. Come watch!`;
    if (navigator.share) {
      navigator.share({ title: feed.title, text, url }).catch(() => {});
    } else {
      handleCopyShare();
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    const t = setTimeout(() => setShowHighlight(false), 12000);
    return () => clearTimeout(t);
  }, []);

  const location = feed.description?.split('.')[0]?.slice(0, 60) || 'Live Wildlife Cam';
  const viewers = feed.view_count.toLocaleString();
  const animalName = feed.title.split(' ')[0];

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        zIndex: 200,
        background: 'radial-gradient(ellipse at top, #0a0e1a 0%, #050709 60%, #000 100%)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 shrink-0"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(8,10,16,0.65)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-2.5 group"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
            }}
          >
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-black text-white text-base tracking-tight hidden sm:block">OneZoo</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFollowing(f => !f)}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02]"
            style={{
              background: following ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
              color: following ? '#fbbf24' : 'rgba(255,255,255,0.85)',
              border: `1px solid ${following ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <Heart size={13} fill={following ? '#fbbf24' : 'none'} />
            {following ? 'Following' : 'Follow'}
          </button>
          <button
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onClick={handleOpenShare}
          >
            <Share2 size={13} />
            Share
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 ml-1"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(220,38,38,0.2)';
              e.currentTarget.style.borderColor = 'rgba(220,38,38,0.35)';
              e.currentTarget.style.color = '#fca5a5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-4 p-4 sm:p-5 overflow-y-auto lg:overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0 flex-wrap">
              {isLive ? (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider uppercase"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    boxShadow: '0 4px 14px rgba(220,38,38,0.4)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <Radio size={10} />
                  LIVE
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider uppercase"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#fff',
                  }}
                >
                  <RotateCcw size={10} />
                  REPLAY
                </span>
              )}
              <h2 className="font-bold text-white text-lg sm:text-xl tracking-tight truncate">
                {feed.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <div className="flex items-center gap-1.5">
              <MapPin size={13} />
              <span className="truncate max-w-[200px] sm:max-w-none">{location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye size={13} />
              <span className="tabular-nums">{viewers} watching</span>
            </div>
          </div>

          <div
            className="relative bg-black overflow-hidden rounded-2xl flex-1"
            style={{
              minHeight: '50vh',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            <div className="absolute inset-0">
              <VideoPlayer
                videoUrl={feed.video_url}
                thumbnailUrl={feed.thumbnail_url}
                title={feed.title}
                feedType={feed.feed_type}
                autoPlay={true}
              />
            </div>

            <InteractionEffectsCanvas effects={effects} />

            {showHighlight && feed.description && (
              <div
                className="absolute bottom-4 left-4 max-w-xs sm:max-w-sm rounded-xl p-3.5 z-10 transition-all"
                style={{
                  background: 'rgba(8,12,18,0.85)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                  animation: 'highlightSlide 600ms cubic-bezier(0.2, 0.9, 0.3, 1.2)',
                }}
              >
                <button
                  onClick={() => setShowHighlight(false)}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  <X size={11} />
                </button>
                <div
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mb-2"
                  style={{
                    background: 'rgba(245,158,11,0.18)',
                    color: '#fbbf24',
                  }}
                >
                  <Sparkles size={9} />
                  Highlight
                </div>
                <h4 className="text-white font-bold text-sm mb-1 leading-tight">
                  {feed.title}
                </h4>
                <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {feed.description}
                </p>
              </div>
            )}

            <FeedInteractions
              feedId={feed.id}
              onNeedAuth={onNeedAuth}
              onNeedCoins={onNeedCoins}
              onEffect={triggerEffect}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
            <div
              className="rounded-2xl p-3.5 flex items-center gap-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <TalkToAnimal animalName={animalName} animalContext={feed.description} compact />
            </div>

            <button
              className="rounded-2xl p-3.5 flex items-center gap-3 transition-all hover:scale-[1.01] text-left group"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.08))',
                border: '1px solid rgba(245,158,11,0.2)',
              }}
              onClick={() => onNeedCoins()}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  boxShadow: '0 4px 14px rgba(245,158,11,0.3)',
                }}
              >
                <Heart size={20} className="text-white" fill="#fff" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm leading-tight">Feed the Animals</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Help support their care
                </div>
              </div>
              <ChevronRight size={18} className="text-amber-300/60 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>
        </div>

        <div
          className="shrink-0 w-full lg:w-[360px] xl:w-[400px] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'rgba(12,14,20,0.85)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            minHeight: '320px',
            maxHeight: '100%',
          }}
        >
          <ChatPanel feedId={feed.id} viewerCount={feed.view_count} />
        </div>
      </div>

      {shareOpen && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShareOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 relative"
            style={{
              background: 'linear-gradient(180deg, #0e1320 0%, #080b14 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShareOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                }}
              >
                <Share2 size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-bold text-base leading-tight">Share this broadcast</h3>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Your personalized link to {feed.title}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-2 rounded-xl p-1 pl-3 mb-4"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <input
                readOnly
                value={shareLoading ? 'Generating your link...' : (shareUrl || 'Generating your link...')}
                className="flex-1 bg-transparent text-sm outline-none truncate"
                style={{ color: shareUrl ? '#fff' : 'rgba(255,255,255,0.5)' }}
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                onClick={handleCopyShare}
                disabled={shareLoading}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: shareCopied
                    ? 'linear-gradient(135deg, #16a34a, #15803d)'
                    : 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff',
                  boxShadow: shareCopied
                    ? '0 4px 14px rgba(22,163,74,0.4)'
                    : '0 4px 14px rgba(245,158,11,0.4)',
                }}
              >
                {shareCopied ? <Check size={13} /> : <Copy size={13} />}
                {shareCopied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={handleNativeShare}
                disabled={shareLoading}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all hover:scale-[1.03] disabled:opacity-50"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Share2 size={16} className="text-amber-400" />
                <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>More</span>
              </button>
              <button
                onClick={async () => {
                  const url = await ensureShareUrl();
                  const text = encodeURIComponent(`Watching ${feed.title} live on OneZoo`);
                  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank', 'noopener');
                }}
                disabled={shareLoading}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all hover:scale-[1.03] disabled:opacity-50"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Twitter size={16} className="text-sky-400" />
                <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>X</span>
              </button>
              <button
                onClick={async () => {
                  const url = await ensureShareUrl();
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener');
                }}
                disabled={shareLoading}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all hover:scale-[1.03] disabled:opacity-50"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Facebook size={16} className="text-blue-400" />
                <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>Facebook</span>
              </button>
              <button
                onClick={async () => {
                  const url = await ensureShareUrl();
                  const referrerName =
                    profile?.display_name?.trim() ||
                    user?.email?.split('@')[0] ||
                    getDisplayName();
                  const text = encodeURIComponent(`${referrerName} is watching ${feed.title} live on OneZoo. Come watch! ${url}`);
                  window.open(`sms:?&body=${text}`, '_blank');
                }}
                disabled={shareLoading}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all hover:scale-[1.03] disabled:opacity-50"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <MessageIcon size={16} className="text-emerald-400" />
                <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>Message</span>
              </button>
            </div>

            <p className="text-[11px] mt-4 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Friends will see this broadcast tagged with your name when they open the link.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes highlightSlide {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
