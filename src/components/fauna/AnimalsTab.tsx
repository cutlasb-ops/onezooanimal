import { useState } from 'react';
import { ArrowLeft, Eye, Check, Shield } from 'lucide-react';
import type { FaunaAnimal } from './faunaData';

interface AnimalsTabProps {
  animals: FaunaAnimal[];
}

export function AnimalsTab({ animals }: AnimalsTabProps) {
  const [sel, setSel] = useState<FaunaAnimal | null>(null);

  if (sel) return (
    <div>
      <button
        onClick={() => setSel(null)}
        className="flex items-center gap-1.5 text-xs text-amber-200/50 hover:text-amber-200/80 transition-colors mb-4"
      >
        <ArrowLeft size={12} />
        All athletes
      </button>
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="p-6"
          style={{
            background: `linear-gradient(135deg, ${sel.color}15, ${sel.color}08)`,
            borderBottom: `2px solid ${sel.color}40`,
          }}
        >
          <span className="text-4xl">{sel.emoji}</span>
          <h3 className="text-xl font-bold text-amber-50 mt-2 mb-0.5">{sel.name}</h3>
          <p className="text-xs text-amber-200/50 mb-0.5">{sel.species}</p>
          <p className="text-[10px] text-amber-200/30">{sel.location}</p>
        </div>
        <div className="p-5">
          <p className="text-xs text-amber-100/60 leading-relaxed mb-4">{sel.bio}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {Object.entries(sel.stats).map(([k, v]) => (
              <div
                key={k}
                className="rounded-lg px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <p className="text-[9px] uppercase tracking-wider text-amber-200/25 font-bold mb-0.5">
                  {k.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="text-xs font-semibold text-amber-100">{v}</p>
              </div>
            ))}
          </div>

          <div className="space-y-0 mb-4">
            {sel.facts.map((f, i) => (
              <div
                key={i}
                className="flex gap-2.5 py-2 border-b border-white/5 last:border-0"
              >
                <Check size={12} className="flex-shrink-0 mt-0.5" style={{ color: sel.color }} />
                <p className="text-xs text-amber-100/70">{f}</p>
              </div>
            ))}
          </div>

          {sel.rival && (
            <div
              className="rounded-lg px-4 py-3 flex items-center gap-2.5"
              style={{ background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.15)' }}
            >
              <Shield size={14} className="text-red-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-red-400 mb-0.5">Active rivalry</p>
                <p className="text-xs text-amber-100">vs {sel.rival}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {animals.map(a => (
        <button
          key={a.id}
          onClick={() => setSel(a)}
          className="text-left rounded-xl p-4 transition-all hover:scale-[1.02] hover:bg-white/[0.06] group"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderTop: `3px solid ${a.color}`,
          }}
        >
          <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform inline-block">{a.emoji}</span>
          <p className="text-sm font-semibold text-amber-50 mb-0.5 truncate">{a.name}</p>
          <p className="text-[10px] text-amber-200/40 mb-2 truncate">{a.species}</p>
          <div className="flex items-center justify-between gap-1">
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full truncate"
              style={{ background: `${a.color}18`, color: a.color }}
            >
              {a.tags?.[0]}
            </span>
            <span className="text-[10px] text-amber-200/30 flex items-center gap-0.5 flex-shrink-0">
              <Eye size={8} />
              {(a.viewers / 1000).toFixed(1)}k
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
