import { useState, useEffect } from 'react';
import { Play, Eye, ThumbsUp, ExternalLink, RefreshCw, Hash } from 'lucide-react';

interface TopYappersVideo {
  id: string;
  title?: string;
  description?: string;
  url?: string;
  thumbnail?: string;
  views?: number;
  likes?: number;
  hashtags?: string[];
  author?: {
    username?: string;
    displayName?: string;
    avatar?: string;
  };
  [key: string]: unknown;
}

interface TopYappersResponse {
  videos?: TopYappersVideo[];
  data?: TopYappersVideo[];
  results?: TopYappersVideo[];
  error?: string;
}

const HASHTAG_PRESETS = [
  { label: 'Basketball', value: 'basketball,sports' },
  { label: 'NFL', value: 'nfl,football' },
  { label: 'Soccer', value: 'soccer,football' },
  { label: 'Animals', value: 'animals,wildlife' },
  { label: 'Trending', value: 'trending,viral' },
];

function formatCount(n?: number): string {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function TopYappersSection() {
  const [videos, setVideos] = useState<TopYappersVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    fetchVideos();
  }, [activePreset, page]);

  async function fetchVideos() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        hashtags: HASHTAG_PRESETS[activePreset].value,
        sortBy: 'views',
        sortOrder: 'desc',
        page: String(page),
        perPage: '12',
      });

      const res = await fetch(
        `${supabaseUrl}/functions/v1/topyappers-proxy?${params}`,
        { headers: { Authorization: `Bearer ${supabaseAnonKey}` } }
      );
      const data: TopYappersResponse = await res.json();

      const apiError = (data as Record<string, unknown>).detail ?? data.error;
      if (apiError) {
        setError(typeof apiError === 'string' ? apiError : JSON.stringify(apiError));
        setVideos([]);
      } else {
        const list = data.videos ?? data.data ?? data.results ?? [];
        setVideos(list);
      }
    } catch {
      setError('Failed to load videos. Please try again.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: '#0d0a00' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(180,120,10,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(212,160,20,0.12)', border: '1px solid rgba(212,160,20,0.3)', color: '#d4a014' }}
              >
                <Hash size={11} />
                TopYappers
              </div>
            </div>
            <h3
              className="text-3xl sm:text-4xl font-black"
              style={{
                background: 'linear-gradient(to right, #d4a014, #f0c040, #d4a014)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Trending Videos
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'rgba(200,160,60,0.6)' }}>
              Top sports &amp; animal content from across the web
            </p>
          </div>

          <button
            onClick={() => fetchVideos()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all self-start sm:self-auto"
            style={{
              background: 'rgba(180,130,20,0.1)',
              border: '1px solid rgba(180,130,20,0.25)',
              color: '#c9930a',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Hashtag filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {HASHTAG_PRESETS.map((preset, i) => (
            <button
              key={preset.value}
              onClick={() => { setActivePreset(i); setPage(1); setVideos([]); }}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={activePreset === i ? {
                background: 'linear-gradient(135deg, #b8720a, #d4a416)',
                color: '#fff',
                boxShadow: '0 2px 12px rgba(180,130,10,0.4)',
              } : {
                background: 'rgba(180,130,20,0.08)',
                border: '1px solid rgba(180,130,20,0.2)',
                color: 'rgba(200,160,60,0.7)',
              }}
            >
              #{preset.label}
            </button>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <div
            className="rounded-2xl p-8 text-center mb-8"
            style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}
          >
            <p className="text-red-400 font-semibold mb-2">Could not load videos</p>
            <p className="text-sm mb-4" style={{ color: 'rgba(200,100,80,0.7)' }}>{error}</p>
            <button
              onClick={fetchVideos}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'rgba(220,38,38,0.3)', border: '1px solid rgba(220,38,38,0.4)' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden animate-pulse"
                style={{ background: 'rgba(180,130,20,0.06)', border: '1px solid rgba(180,130,20,0.1)' }}
              >
                <div style={{ aspectRatio: '9/16', maxHeight: 280, background: 'rgba(180,130,20,0.1)' }} />
                <div className="p-3 space-y-2">
                  <div className="h-3 rounded" style={{ background: 'rgba(180,130,20,0.15)', width: '80%' }} />
                  <div className="h-3 rounded" style={{ background: 'rgba(180,130,20,0.1)', width: '55%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video grid */}
        {!loading && !error && videos.length === 0 && (
          <div className="text-center py-20">
            <Play size={48} className="mx-auto mb-4 opacity-20" style={{ color: '#d4a014' }} />
            <p style={{ color: 'rgba(200,160,60,0.5)' }}>No videos found for this category.</p>
          </div>
        )}

        {!loading && videos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isPlaying={playingId === video.id}
                  onPlay={() => setPlayingId(playingId === video.id ? null : video.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => { setPage(p => Math.max(1, p - 1)); setVideos([]); }}
                disabled={page === 1 || loading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: 'rgba(180,130,20,0.1)', border: '1px solid rgba(180,130,20,0.2)', color: '#c9930a' }}
              >
                Previous
              </button>
              <span className="text-sm font-semibold px-4" style={{ color: 'rgba(200,160,60,0.6)' }}>
                Page {page}
              </span>
              <button
                onClick={() => { setPage(p => p + 1); setVideos([]); }}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: 'rgba(180,130,20,0.1)', border: '1px solid rgba(180,130,20,0.2)', color: '#c9930a' }}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

interface VideoCardProps {
  video: TopYappersVideo;
  isPlaying: boolean;
  onPlay: () => void;
}

function VideoCard({ video, isPlaying, onPlay }: VideoCardProps) {
  const [imgError, setImgError] = useState(false);
  const thumbnail = video.thumbnail as string | undefined;
  const videoUrl = video.url as string | undefined;

  return (
    <article
      className="group rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #1c1200 0%, #120c00 100%)',
        border: '1px solid rgba(180,140,60,0.15)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.45)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,170,80,0.25)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 20px rgba(0,0,0,0.45)';
      }}
    >
      {/* Video / Thumbnail */}
      <div
        className="relative overflow-hidden shrink-0"
        style={{ aspectRatio: '9/16', maxHeight: 300, background: '#0d0800', cursor: 'pointer' }}
        onClick={onPlay}
      >
        {isPlaying && videoUrl ? (
          <video
            className="w-full h-full object-cover"
            src={videoUrl}
            poster={thumbnail}
            autoPlay
            loop
            playsInline
            controls
          />
        ) : (
          <>
            {thumbnail && !imgError ? (
              <img
                src={thumbnail}
                alt={video.title as string || 'Video thumbnail'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1a1000, #0d0800)' }}
              >
                <Play size={32} style={{ color: 'rgba(212,170,80,0.3)' }} />
              </div>
            )}

            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)' }}
            />

            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  border: '2px solid rgba(212,170,80,0.6)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <Play size={22} fill="white" style={{ color: 'white', marginLeft: 3 }} />
              </div>
            </div>

            {/* Author */}
            {video.author?.username && (
              <div className="absolute bottom-2 left-3 right-3 flex items-center gap-2 pointer-events-none">
                {video.author.avatar && (
                  <img
                    src={video.author.avatar}
                    alt={video.author.username}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                    style={{ border: '1px solid rgba(212,170,80,0.4)' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <span
                  className="text-xs font-semibold truncate"
                  style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
                >
                  @{video.author.username}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3" style={{ flex: 1 }}>
        {video.title && typeof video.title === 'string' && (
          <p
            className="text-sm font-bold line-clamp-2 leading-snug"
            style={{ color: '#f0d080' }}
          >
            {video.title}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-auto">
          {video.views != null && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(200,160,60,0.6)' }}>
              <Eye size={11} />
              {formatCount(video.views as number)}
            </span>
          )}
          {video.likes != null && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(200,160,60,0.6)' }}>
              <ThumbsUp size={11} />
              {formatCount(video.likes as number)}
            </span>
          )}
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-xs font-semibold transition-all"
              style={{ color: 'rgba(180,130,30,0.6)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#d4a014'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(180,130,30,0.6)'; }}
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink size={11} />
              Open
            </a>
          )}
        </div>

        {/* Hashtags */}
        {Array.isArray(video.hashtags) && video.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {(video.hashtags as string[]).slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ background: 'rgba(180,130,20,0.1)', color: 'rgba(200,160,60,0.5)', fontSize: '0.6rem' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
