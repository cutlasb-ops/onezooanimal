import { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, Radio, Calendar } from 'lucide-react';
import type { FaunaAnimal, FaunaEvent } from './faunaData';
import { COMMENTARY_PROMPTS, TYPE_COLORS } from './faunaData';

interface CommentaryLine {
  text: string;
  time: string;
}

interface EventCardProps {
  ev: FaunaEvent;
  animals: FaunaAnimal[];
  expanded?: boolean;
}

export function EventCard({ ev, animals, expanded }: EventCardProps) {
  const [commentary, setCommentary] = useState<CommentaryLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(!!expanded);
  const animal = animals.find(a => a.name === ev.animal);
  const typeKey = ev.type === "migration" && ev.animal?.includes("Tern") ? "migration2" : ev.type;
  const typeColor = TYPE_COLORS[ev.type] || { fg: "#888", bg: "#f5f5f5" };

  async function getCommentary() {
    setLoading(true);
    try {
      const prompt = COMMENTARY_PROMPTS[typeKey] || COMMENTARY_PROMPTS.cam;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/anthropic-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 300, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((c: { text?: string }) => c.text || "").join("").trim();
      if (text) {
        setCommentary(prev => [{
          text,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }, ...prev.slice(0, 4)]);
      }
    } catch {
      setCommentary(prev => [{
        text: "Commentary feed temporarily offline.",
        time: "--:--"
      }, ...prev.slice(0, 3)]);
    }
    setLoading(false);
  }

  return (
    <div
      className="rounded-xl overflow-hidden mb-3 transition-all duration-200 hover:shadow-lg"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: `4px solid ${typeColor.fg}`,
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-2xl flex-shrink-0">{animal?.emoji || "\u{1F30D}"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-semibold text-amber-50 truncate">{ev.title}</p>
            {ev.status === "live" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Radio size={8} className="animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          <p className="text-xs text-amber-200/50 flex items-center gap-2">
            {ev.status === "live" ? (
              <span>{ev.viewers.toLocaleString()} watching</span>
            ) : (
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {ev.date} at {ev.time}
              </span>
            )}
            {ev.aiEnabled && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300/80 border border-amber-500/20">
                <Zap size={8} />
                AI
              </span>
            )}
          </p>
        </div>
        {open ? (
          <ChevronUp size={14} className="text-amber-200/30 flex-shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-amber-200/30 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-white/5">
          {animal && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {Object.entries(animal.stats).slice(0, 4).map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-lg px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-[9px] uppercase tracking-wider text-amber-200/30 font-bold mb-0.5">
                    {k.replace(/([A-Z])/g, " $1")}
                  </p>
                  <p className="text-xs font-semibold text-amber-100">{v}</p>
                </div>
              ))}
            </div>
          )}

          {ev.aiEnabled && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-wider text-amber-200/30 font-bold">
                  AI Live Commentary
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); getCommentary(); }}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50"
                  style={{
                    background: 'rgba(245,166,35,0.1)',
                    color: '#f5a623',
                    border: '1px solid rgba(245,166,35,0.2)',
                  }}
                >
                  {loading ? "Generating..." : commentary.length ? "Refresh" : "Start Feed"}
                </button>
              </div>
              {commentary.length === 0 && !loading && (
                <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-xs text-amber-200/30 italic">
                    Hit "Start Feed" to activate AI commentary for this event
                  </p>
                </div>
              )}
              <div className="space-y-0">
                {commentary.map((c, i) => (
                  <div
                    key={i}
                    className="flex gap-3 py-2.5 border-b border-white/5 last:border-0"
                    style={{ opacity: i === 0 ? 1 : 0.5 }}
                  >
                    <span className="text-[10px] text-amber-200/30 flex-shrink-0 mt-0.5 font-mono">{c.time}</span>
                    <p className={`text-xs text-amber-100/80 leading-relaxed ${i > 0 ? 'italic' : ''}`}>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
