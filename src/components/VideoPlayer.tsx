import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Maximize2, Volume2, VolumeX, Radio, RotateCcw, ExternalLink } from 'lucide-react';
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnail, getYouTubeVideoId } from '../lib/videoUtils';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  feedType: 'live' | 'looped';
  autoPlay?: boolean;
}

export function VideoPlayer({ videoUrl, thumbnailUrl, title, feedType, autoPlay = true }: VideoPlayerProps) {
  const hasVideo = !!videoUrl;
  const isYouTube = hasVideo && isYouTubeUrl(videoUrl);
  const ytThumbnail = isYouTube ? getYouTubeThumbnail(videoUrl) : null;
  const displayThumbnail = ytThumbnail || thumbnailUrl;
  const ytVideoId = isYouTube ? getYouTubeVideoId(videoUrl) : null;

  const [started, setStarted] = useState(autoPlay);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const embedUrl = isYouTube
    ? (() => {
        const base = getYouTubeEmbedUrl(videoUrl);
        if (!base) return null;
        return base.replace('autoplay=1', started ? 'autoplay=1' : 'autoplay=0');
      })()
    : null;

  const watchUrl = ytVideoId
    ? `https://www.youtube.com/watch?v=${ytVideoId}`
    : videoUrl;

  const showControlsBriefly = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, []);

  function handleStart() {
    setStarted(true);
    setIsPlaying(true);
    if (!isYouTube && videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.load();
      const p = videoRef.current.play();
      if (p !== undefined) p.catch(() => setIsPlaying(false));
    }
  }

  function togglePlay() {
    if (!started) { handleStart(); return; }
    if (!isYouTube && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const p = videoRef.current.play();
        if (p !== undefined) p.catch(() => {});
        setIsPlaying(true);
      }
    }
  }

  function toggleMute() {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    const doc = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
    const vid = videoRef.current as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      if (doc.exitFullscreen) doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
    } else if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (vid && vid.webkitEnterFullscreen) {
      vid.webkitEnterFullscreen();
    }
  }

  function handleIframeLoad() {
    try {
      const iframe = iframeRef.current;
      if (iframe) {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc || doc.title === '') {
          setIframeBlocked(true);
        }
      }
    } catch {
      // cross-origin means it loaded fine
    }
  }

  function handleIframeError() {
    setIframeBlocked(true);
  }

  const Badge = () => feedType === 'live' ? (
    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(220,38,38,0.9)', backdropFilter: 'blur(4px)' }}>
      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
      <Radio size={10} className="text-white" />
      <span className="text-white tracking-wide">LIVE</span>
    </div>
  ) : (
    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', border: '1px solid rgba(212,170,80,0.3)' }}>
      <RotateCcw size={10} style={{ color: 'rgba(212,170,80,0.85)' }} />
      <span style={{ color: 'rgba(212,170,80,0.9)', letterSpacing: '0.06em' }}>LOOP</span>
    </div>
  );

  if (!hasVideo) {
    return (
      <div
        ref={containerRef}
        className="relative w-full h-full rounded-lg overflow-hidden"
        style={{ background: '#050300' }}
      >
        {displayThumbnail && !imgError ? (
          <img
            src={displayThumbnail}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a1000, #050300)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <Badge />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <p className="text-sm font-medium" style={{ color: 'rgba(212,170,80,0.7)' }}>Stream coming soon</p>
        </div>
      </div>
    );
  }

  if (isYouTube && embedUrl && started && !iframeBlocked) {
    return (
      <div ref={containerRef} className="relative w-full h-full rounded-lg overflow-hidden bg-black">
        <Badge />
        <iframe
          ref={iframeRef}
          key={`yt-${videoUrl}`}
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
        <div className="absolute bottom-3 right-3 z-20">
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
            style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <ExternalLink size={11} />
            Watch on YouTube
          </a>
        </div>
      </div>
    );
  }

  if (isYouTube && (iframeBlocked || (started && !embedUrl))) {
    return (
      <div
        ref={containerRef}
        className="relative w-full h-full rounded-lg overflow-hidden"
        style={{ background: '#050300' }}
      >
        {displayThumbnail && !imgError ? (
          <img
            src={displayThumbnail}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a1000, #050300)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)' }} />
        <Badge />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <p className="text-white text-sm font-medium opacity-80">Video playback restricted in preview</p>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: '#FF0000', color: 'white', boxShadow: '0 4px 20px rgba(255,0,0,0.4)' }}
          >
            <ExternalLink size={15} />
            Watch on YouTube
          </a>
        </div>
      </div>
    );
  }

  if (!started || (isYouTube && !embedUrl)) {
    return (
      <div
        ref={containerRef}
        className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer group"
        style={{ background: '#050300' }}
        onClick={handleStart}
      >
        {displayThumbnail && !imgError ? (
          <img
            src={displayThumbnail}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1000, #050300)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.35) 100%)' }} />
        <Badge />

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center rounded-full transition-all duration-200 group-hover:scale-110"
            style={{
              width: 72,
              height: 72,
              background: 'rgba(0,0,0,0.65)',
              border: '2.5px solid rgba(255,255,255,0.35)',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 0 40px rgba(0,0,0,0.5)',
            }}
          >
            <Play size={28} fill="white" style={{ color: 'white', marginLeft: 4 }} />
          </div>
        </div>

        <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
          <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}>
            Click to play
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-lg overflow-hidden group bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={showControlsBriefly}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;
        showControlsBriefly();
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        poster={displayThumbnail}
        loop={feedType === 'looped'}
        muted={isMuted}
        autoPlay
        playsInline
        preload="auto"
        webkit-playsinline="true"
        x-webkit-airplay="allow"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <Badge />

      <div
        className={`absolute inset-0 transition-opacity duration-200 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)' }}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-200 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={togglePlay}
            className="text-white hover:text-amber-300 transition-colors p-1"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <div className="flex-1 h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-white hover:text-amber-300 transition-colors p-1">
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button onClick={toggleFullscreen} className="text-white hover:text-amber-300 transition-colors p-1">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
