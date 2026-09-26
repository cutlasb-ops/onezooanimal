import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { getAudioSettings, type AudioSettings } from './AdminAudioTab';

function isYouTubeUrl(url: string) {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/|\/v\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function AmbientAudioPlayer() {
  const [settings, setSettings] = useState<AudioSettings>(getAudioSettings);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(settings.volume);
  const [showToast, setShowToast] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const isYT = isYouTubeUrl(settings.audioUrl);

  const refreshSettings = useCallback(() => {
    const s = getAudioSettings();
    setSettings(s);
    setVolume(s.volume);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as AudioSettings;
      setSettings(detail);
      setVolume(detail.volume);
    };
    window.addEventListener('onezoo-audio-settings-changed', handler);
    return () => window.removeEventListener('onezoo-audio-settings-changed', handler);
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    if (!settings.audioUrl || !settings.autoplay) return;
    if (userInteracted) return;

    setShowToast(true);
    const t = setTimeout(() => setShowToast(false), 4000);

    const handleFirstClick = () => {
      setUserInteracted(true);
      setShowToast(false);
      startPlayback();
      document.removeEventListener('click', handleFirstClick);
      document.removeEventListener('touchstart', handleFirstClick);
    };

    document.addEventListener('click', handleFirstClick, { once: true });
    document.addEventListener('touchstart', handleFirstClick, { once: true });

    return () => {
      clearTimeout(t);
      document.removeEventListener('click', handleFirstClick);
      document.removeEventListener('touchstart', handleFirstClick);
    };
  }, [settings.audioUrl, settings.autoplay, userInteracted]);

  function startPlayback() {
    if (!settings.audioUrl) return;

    if (isYouTubeUrl(settings.audioUrl)) {
      const videoId = extractYouTubeId(settings.audioUrl);
      if (videoId && iframeRef.current) {
        iframeRef.current.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&mute=0`;
        setPlaying(true);
      }
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = settings.audioUrl;
      audioRef.current.volume = volume / 100;
      audioRef.current.loop = settings.loop;
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  function togglePlay() {
    if (playing) {
      if (isYT) {
        if (iframeRef.current) iframeRef.current.src = '';
      } else {
        audioRef.current?.pause();
      }
      setPlaying(false);
    } else {
      setUserInteracted(true);
      startPlayback();
    }
  }

  function toggleMute() {
    setMuted(m => {
      const next = !m;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }

  function handleVolumeChange(v: number) {
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v / 100;
    }
  }

  if (!settings.audioUrl) return null;

  return (
    <>
      {showToast && (
        <div
          className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[999] px-4 py-2 rounded-lg text-sm animate-fade-toast"
          style={{
            background: 'rgba(10,21,32,0.92)',
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(29,158,117,0.25)',
            backdropFilter: 'blur(12px)',
          }}
        >
          Tap anywhere to start ambient audio
        </div>
      )}

      <div
        className="fixed bottom-0 left-0 right-0 z-[998] flex items-center gap-3 px-4 sm:px-6"
        style={{
          height: '48px',
          background: 'rgba(10,21,32,0.92)',
          borderTop: '1px solid rgba(29,158,117,0.15)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {settings.label || 'Ambient Audio'}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)' }}
          >
            {playing ? (
              <Pause size={14} className="text-emerald-400" />
            ) : (
              <Play size={14} className="text-emerald-400" style={{ marginLeft: 1 }} />
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={e => handleVolumeChange(parseInt(e.target.value, 10))}
              className="w-20 accent-emerald-500"
              style={{ height: '4px' }}
            />
          </div>

          <button
            onClick={toggleMute}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors"
            style={{ color: muted ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.4)' }}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          <div className="flex items-center h-4" style={{ gap: '2px' }}>
            <span className={`eq-bar ${!playing ? 'eq-paused' : ''}`} />
            <span className={`eq-bar ${!playing ? 'eq-paused' : ''}`} />
            <span className={`eq-bar ${!playing ? 'eq-paused' : ''}`} />
          </div>
        </div>
      </div>

      <iframe
        ref={iframeRef}
        className="hidden"
        allow="autoplay"
        title="Ambient YouTube audio"
      />
    </>
  );
}
