import { useState, useEffect, useRef, useCallback } from 'react';
import { Radio, Zap, Timer, Loader2, Eye, Link, Mic, RefreshCw } from 'lucide-react';
import { STREAM_CHANNELS } from './streamData';
import type { StreamChannel } from './streamData';

interface CommentaryLine {
  text: string;
  time: string;
  stream: string;
  visionActive?: boolean;
}

interface TranscriptEntry {
  text: string;
  time: string;
  stream: string;
}

export function CommentaryTab() {
  const [activeStream, setActiveStream] = useState<StreamChannel>(STREAM_CHANNELS[0]);
  const [commentary, setCommentary] = useState<CommentaryLine[]>([]);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [streamUrls, setStreamUrls] = useState<Record<string, string>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const currentUrl = streamUrls[activeStream.id] || '';

  const generateCommentary = useCallback(async (stream: StreamChannel) => {
    setLoading(true);
    try {
      const url = streamUrls[stream.id] || '';
      const res = await fetch(`${supabaseUrl}/functions/v1/gemini-proxy/commentary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          streamUrl: url || undefined,
          context: stream.context,
          prompt: stream.prompt,
        }),
      });
      const data = await res.json();
      if (data.commentary) {
        setCommentary(prev => [{
          text: data.commentary,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          stream: stream.name,
          visionActive: data.visionActive,
        }, ...prev.slice(0, 19)]);

        try {
          const synth = window.speechSynthesis;
          if (synth) {
            synth.cancel();
            const utter = new SpeechSynthesisUtterance(String(data.commentary));
            utter.rate = 1;
            utter.pitch = 1;
            synth.speak(utter);
          }
        } catch {
          // ignore speech synthesis issues
        }
      }
    } catch {
      setCommentary(prev => [{
        text: 'Commentary feed temporarily offline. Retrying...',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        stream: stream.name,
      }, ...prev.slice(0, 19)]);
    }
    setLoading(false);
  }, [supabaseUrl, supabaseKey, streamUrls]);

  const transcribeStream = useCallback(async (stream: StreamChannel) => {
    setTranscribing(true);
    try {
      const url = streamUrls[stream.id] || '';
      if (!url) {
        setTranscripts(prev => [{
          text: 'Please paste a stream URL first. Transcription requires a valid stream source.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          stream: stream.name,
        }, ...prev.slice(0, 9)]);
        setTranscribing(false);
        return;
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/gemini-proxy/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          streamUrl: url,
          context: stream.context,
        }),
      });
      const data = await res.json();
      if (data.transcript) {
        setTranscripts(prev => [{
          text: data.transcript,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          stream: stream.name,
        }, ...prev.slice(0, 9)]);
      } else if (data.error) {
        setTranscripts(prev => [{
          text: `Transcription error: ${data.error}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          stream: stream.name,
        }, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      setTranscripts(prev => [{
        text: `Connection error: ${String(error)}. Check your stream URL and try again.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        stream: stream.name,
      }, ...prev.slice(0, 9)]);
    }
    setTranscribing(false);
  }, [supabaseUrl, supabaseKey, streamUrls]);

  useEffect(() => {
    if (autoMode) {
      generateCommentary(activeStream);
      intervalRef.current = setInterval(() => {
        generateCommentary(activeStream);
      }, 30000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoMode, activeStream, generateCommentary]);

  function handleStreamSelect(stream: StreamChannel) {
    setActiveStream(stream);
    setAutoMode(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {STREAM_CHANNELS.map(ch => (
          <button
            key={ch.id}
            onClick={() => handleStreamSelect(ch)}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeStream.id === ch.id ? `${ch.color}20` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeStream.id === ch.id ? `${ch.color}50` : 'rgba(255,255,255,0.06)'}`,
              color: activeStream.id === ch.id ? ch.color : 'rgba(255,255,255,0.4)',
            }}
          >
            <span className="text-sm">{ch.emoji}</span>
            <span className="hidden sm:inline">{ch.name.split(' ').slice(0, 2).join(' ')}</span>
          </button>
        ))}
      </div>

      <div
        className="rounded-xl overflow-hidden relative"
        style={{ background: '#0a1520', border: `2px solid ${activeStream.color}30` }}
      >
        <div className="px-3 py-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <Link size={11} className="text-white/25 flex-shrink-0" />
          <input
            type="text"
            value={currentUrl}
            onChange={e => setStreamUrls(prev => ({ ...prev, [activeStream.id]: e.target.value }))}
            placeholder="Paste stream URL (YouTube, Twitch, HLS, RTMP, MP4)"
            className="flex-1 bg-transparent text-[11px] text-white/70 placeholder-white/20 outline-none"
          />
          {currentUrl && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex-shrink-0">
              <Radio size={7} />
              Connected
            </span>
          )}
        </div>

        <div className="aspect-video flex flex-col items-center justify-center relative">
          <div
            className="absolute inset-0 opacity-10"
            style={{ background: `radial-gradient(ellipse at center, ${activeStream.color}40 0%, transparent 70%)` }}
          />
          <span className="text-6xl mb-3 relative z-10">{activeStream.emoji}</span>
          <p className="text-sm font-bold text-white/80 relative z-10">{activeStream.name}</p>
          <p className="text-[10px] text-white/30 mt-1 relative z-10 max-w-xs text-center px-4">{activeStream.context}</p>

          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Radio size={8} className="animate-pulse" />
              LIVE
            </span>
            <span className="text-[10px] text-white/40 font-medium">
              <Eye size={9} className="inline mr-0.5" />
              {activeStream.viewers.toLocaleString()}
            </span>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {autoMode && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Zap size={8} />
                AI Active
              </span>
            )}
            <StreamModeBadge hasUrl={!!currentUrl} latestEntry={commentary[0]} />
          </div>
        </div>

        <div
          className="px-4 py-3 flex items-center gap-2 flex-wrap"
          style={{ borderTop: `1px solid ${activeStream.color}20`, background: 'rgba(255,255,255,0.02)' }}
        >
          <button
            onClick={() => generateCommentary(activeStream)}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
            style={{
              background: `${activeStream.color}18`,
              color: activeStream.color,
              border: `1px solid ${activeStream.color}35`,
            }}
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            Generate Commentary
          </button>

          <button
            onClick={() => setAutoMode(a => !a)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: autoMode ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.04)',
              color: autoMode ? '#f5a623' : 'rgba(255,255,255,0.4)',
              border: `1px solid ${autoMode ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <Timer size={12} />
            Auto (30s)
          </button>

          <button
            onClick={() => transcribeStream(activeStream)}
            disabled={transcribing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
            style={{
              background: 'rgba(167,139,250,0.1)',
              color: '#a78bfa',
              border: '1px solid rgba(167,139,250,0.25)',
            }}
          >
            {transcribing ? <Loader2 size={12} className="animate-spin" /> : <Mic size={12} />}
            Transcribe
          </button>
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-200/30 mb-2">
          Commentary Feed
        </p>
        {commentary.length === 0 ? (
          <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs text-amber-200/25 italic">
              Select a stream and generate commentary to see the live feed
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {commentary.map((c, i) => {
              const ch = STREAM_CHANNELS.find(s => s.name === c.stream);
              return (
                <div
                  key={`${c.time}-${i}`}
                  className="flex gap-3 py-2.5 border-b border-white/5 last:border-0 transition-opacity"
                  style={{ opacity: i === 0 ? 1 : Math.max(0.3, 1 - i * 0.15) }}
                >
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 mt-0.5">
                    <span className="text-xs">{ch?.emoji || '\u{1F30D}'}</span>
                    <span className="text-[9px] font-mono text-amber-200/25">{c.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-[10px] font-bold" style={{ color: ch?.color || '#888' }}>
                        {c.stream}
                      </p>
                      {c.visionActive !== undefined && (
                        <span className={`text-[8px] font-bold px-1.5 py-px rounded-full ${c.visionActive ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'}`}>
                          {c.visionActive ? 'Vision ON' : 'Context mode'}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${i === 0 ? 'text-amber-100/80' : 'text-amber-100/50 italic'}`}>
                      {c.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {transcripts.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}
        >
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(167,139,250,0.1)' }}>
            <div className="flex items-center gap-2">
              <Mic size={12} className="text-violet-400" />
              <p className="text-xs font-bold text-violet-300">Live Transcription</p>
              <span className="text-[9px] text-violet-400/40">Gemini Audio</span>
            </div>
            <button
              onClick={() => transcribeStream(activeStream)}
              disabled={transcribing}
              className="flex items-center gap-1 text-[10px] font-semibold text-violet-300/60 hover:text-violet-300 transition-colors disabled:opacity-40"
            >
              {transcribing ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
              Transcribe again
            </button>
          </div>
          <div className="px-4 py-3 space-y-3">
            {transcripts.map((t, i) => {
              const ch = STREAM_CHANNELS.find(s => s.name === t.stream);
              return (
                <div
                  key={`tr-${t.time}-${i}`}
                  className="transition-opacity"
                  style={{ opacity: i === 0 ? 1 : Math.max(0.3, 1 - i * 0.2) }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs">{ch?.emoji || '\u{1F30D}'}</span>
                    <span className="text-[10px] font-bold" style={{ color: ch?.color || '#888' }}>{t.stream}</span>
                    <span className="text-[9px] font-mono text-violet-400/30">{t.time}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-violet-200/60 pl-5 whitespace-pre-wrap">{t.text}</p>
                </div>
              );
            })}
            <p className="text-[9px] text-violet-400/25 text-center pt-1">
              Captures 15 seconds of live audio from the stream
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StreamModeBadge({ hasUrl, latestEntry }: { hasUrl: boolean; latestEntry?: CommentaryLine }) {
  if (!latestEntry) return null;

  if (latestEntry.visionActive) {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
        <Eye size={7} />
        Vision ON
      </span>
    );
  }

  if (hasUrl) {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
        Context mode
      </span>
    );
  }

  return null;
}
