import { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Save } from 'lucide-react';

export interface AudioSettings {
  audioUrl: string;
  volume: number;
  autoplay: boolean;
  loop: boolean;
  label: string;
}

const DEFAULT_SETTINGS: AudioSettings = {
  audioUrl: '',
  volume: 30,
  autoplay: false,
  loop: true,
  label: 'Serengeti Soundscape',
};

export function getAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem('onezoo_audio_settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function AdminAudioTab() {
  const [settings, setSettings] = useState<AudioSettings>(getAudioSettings);
  const [saved, setSaved] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    return () => {
      previewRef.current?.pause();
      if (iframeRef.current) iframeRef.current.src = '';
    };
  }, []);

  function isYouTubeUrl(url: string) {
    return /(?:youtube\.com|youtu\.be)/.test(url);
  }

  function extractYouTubeId(url: string): string | null {
    const match = url.match(/(?:v=|\/embed\/|youtu\.be\/|\/v\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  function handleSave() {
    localStorage.setItem('onezoo_audio_settings', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('onezoo-audio-settings-changed', { detail: settings }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handlePreview() {
    if (previewing) {
      previewRef.current?.pause();
      if (iframeRef.current) iframeRef.current.src = '';
      setPreviewing(false);
      return;
    }

    if (!settings.audioUrl) return;

    if (isYouTubeUrl(settings.audioUrl)) {
      const videoId = extractYouTubeId(settings.audioUrl);
      if (videoId && iframeRef.current) {
        iframeRef.current.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0`;
        setPreviewing(true);
      }
    } else {
      if (!previewRef.current) {
        previewRef.current = new Audio();
      }
      previewRef.current.src = settings.audioUrl;
      previewRef.current.volume = settings.volume / 100;
      previewRef.current.loop = settings.loop;
      previewRef.current.play().catch(() => {});
      setPreviewing(true);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)' }}>
          <Volume2 size={20} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Ambient Audio</h3>
          <p className="text-sm text-slate-400">Configure site-wide background audio</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Ambient Audio URL</label>
          <input
            type="text"
            value={settings.audioUrl}
            onChange={e => setSettings(s => ({ ...s, audioUrl: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="https://example.com/ambience.mp3 or YouTube URL"
          />
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Direct MP3 works best for seamless looping.<br />
            Free sources: freesound.org / pixabay.com/music<br />
            To use your own file: drop MP3 into /public folder and paste /filename.mp3 as the URL<br />
            YouTube supported but requires user click before audio starts due to browser policy
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Audio Label</label>
          <input
            type="text"
            value={settings.label}
            onChange={e => setSettings(s => ({ ...s, label: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. Serengeti Soundscape"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Volume: {settings.volume}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={e => {
              const vol = parseInt(e.target.value, 10);
              setSettings(s => ({ ...s, volume: vol }));
              if (previewRef.current) previewRef.current.volume = vol / 100;
            }}
            className="w-full accent-emerald-500"
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoplay}
              onChange={e => setSettings(s => ({ ...s, autoplay: e.target.checked }))}
              className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 bg-slate-700 border-slate-600"
            />
            <span className="text-sm text-slate-300">Autoplay on site load</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.loop}
              onChange={e => setSettings(s => ({ ...s, loop: e.target.checked }))}
              className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 bg-slate-700 border-slate-600"
            />
            <span className="text-sm text-slate-300">Loop</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all"
            style={{
              background: saved ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, #059669, #10b981)',
              color: saved ? '#4ade80' : '#fff',
              border: saved ? '1px solid rgba(34,197,94,0.4)' : '1px solid transparent',
            }}
          >
            <Save size={16} />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>

          <button
            onClick={handlePreview}
            disabled={!settings.audioUrl}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: previewing ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
              color: previewing ? '#fca5a5' : '#94a3b8',
              border: previewing ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {previewing ? <><Pause size={16} /> Stop Preview</> : <><Play size={16} /> Preview</>}
          </button>
        </div>
      </div>

      <iframe
        ref={iframeRef}
        className="hidden"
        allow="autoplay"
        title="YouTube audio preview"
      />
    </div>
  );
}
