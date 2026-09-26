import { useState, useRef } from 'react';
import { Upload, Camera, Loader2, Image as ImageIcon, X, Link } from 'lucide-react';
import { STREAM_CHANNELS, VISION_PROMPT_TEMPLATE } from './streamData';

interface VisionResult {
  text: string;
  time: string;
  stream: string;
  visionActive?: boolean;
}

export function VisionTab() {
  const [selectedStream, setSelectedStream] = useState(STREAM_CHANNELS[0]);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageName, setImageName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VisionResult[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageData(null);
    setImageName('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function analyzeImage() {
    if (!imageData) return;
    setLoading(true);
    try {
      const base64Part = imageData.split(',')[1];
      const mimeMatch = imageData.match(/data:(.*?);/);
      const mimeType = mimeMatch?.[1] || 'image/jpeg';

      const res = await fetch(`${supabaseUrl}/functions/v1/gemini-proxy/commentary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          streamUrl: streamUrl || undefined,
          context: selectedStream.context,
          prompt: VISION_PROMPT_TEMPLATE(selectedStream.context),
          imageBase64: base64Part,
          imageMimeType: mimeType,
        }),
      });

      const data = await res.json();
      if (data.commentary) {
        setResults(prev => [{
          text: data.commentary,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          stream: selectedStream.name,
          visionActive: data.visionActive,
        }, ...prev.slice(0, 9)]);
      }
    } catch {
      setResults(prev => [{
        text: 'Vision analysis temporarily unavailable.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        stream: selectedStream.name,
      }, ...prev.slice(0, 9)]);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <Camera size={14} className="text-amber-400" />
        <p className="text-xs font-semibold text-amber-100">Vision Mode</p>
        <span className="text-[10px] text-amber-200/30">Upload a stream screenshot for AI analysis</span>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-amber-200/30 font-bold mb-2 block">
          Stream context
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {STREAM_CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => setSelectedStream(ch)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: selectedStream.id === ch.id ? `${ch.color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedStream.id === ch.id ? `${ch.color}40` : 'rgba(255,255,255,0.06)'}`,
                color: selectedStream.id === ch.id ? ch.color : 'rgba(255,255,255,0.35)',
              }}
            >
              <span>{ch.emoji}</span>
              {ch.name.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden relative"
        style={{ background: '#0a1520', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="px-3 py-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <Link size={11} className="text-white/25 flex-shrink-0" />
          <input
            type="text"
            value={streamUrl}
            onChange={e => setStreamUrl(e.target.value)}
            placeholder="Stream URL (optional, adds context to analysis)"
            className="flex-1 bg-transparent text-[11px] text-white/70 placeholder-white/20 outline-none"
          />
          {streamUrl && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex-shrink-0">
              Linked
            </span>
          )}
        </div>

        {imageData ? (
          <div className="relative">
            <img
              src={imageData}
              alt="Uploaded stream frame"
              className="w-full max-h-[300px] object-contain"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X size={12} className="text-white/80" />
            </button>
            <div className="absolute bottom-2 left-2">
              <span className="text-[10px] bg-black/60 text-white/60 px-2 py-0.5 rounded-full">
                {imageName}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-video flex flex-col items-center justify-center hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
              style={{ background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.15)' }}
            >
              <ImageIcon size={24} className="text-white/20" />
            </div>
            <p className="text-xs text-white/40 font-medium">Click to upload a stream screenshot</p>
            <p className="text-[10px] text-white/20 mt-1">JPG, PNG, or WebP</p>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      <div className="flex gap-2">
        {!imageData && (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Upload size={12} />
            Upload Image
          </button>
        )}
        {imageData && (
          <button
            onClick={analyzeImage}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
            style={{
              background: `${selectedStream.color}18`,
              color: selectedStream.color,
              border: `1px solid ${selectedStream.color}35`,
            }}
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            Analyze with AI
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-200/30 mb-2">
            Vision Analysis Feed
          </p>
          <div className="space-y-0">
            {results.map((r, i) => {
              const ch = STREAM_CHANNELS.find(s => s.name === r.stream);
              return (
                <div
                  key={`${r.time}-${i}`}
                  className="flex gap-3 py-2.5 border-b border-white/5 last:border-0 transition-opacity"
                  style={{ opacity: i === 0 ? 1 : Math.max(0.3, 1 - i * 0.15) }}
                >
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 mt-0.5">
                    <span className="text-xs">{ch?.emoji || '\u{1F30D}'}</span>
                    <span className="text-[9px] font-mono text-amber-200/25">{r.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-[10px] font-bold" style={{ color: ch?.color || '#888' }}>
                        {r.stream} &middot; Vision
                      </p>
                      {r.visionActive && (
                        <span className="text-[8px] font-bold px-1.5 py-px rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                          Vision ON
                        </span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${i === 0 ? 'text-amber-100/80' : 'text-amber-100/50 italic'}`}>
                      {r.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
