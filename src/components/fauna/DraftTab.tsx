import { useState } from 'react';
import { Users, Clock, Trophy, Plus, Minus, CheckCircle } from 'lucide-react';
import type { FaunaAnimal, FaunaDraft } from './faunaData';

interface DraftTabProps {
  draft: FaunaDraft;
  animals: FaunaAnimal[];
  setDraft: React.Dispatch<React.SetStateAction<FaunaDraft>>;
}

export function DraftTab({ draft, animals, setDraft }: DraftTabProps) {
  const [myTeam, setMyTeam] = useState<FaunaAnimal[]>([animals[0], animals[2]]);
  const [joined, setJoined] = useState(false);
  const available = animals.filter(a => !myTeam.find(t => t.id === a.id));
  const totalPts = myTeam.reduce((s, a) => s + (a.pts || 0), 0);
  const draftDate = new Date(draft.date + "T" + draft.time);
  const now = new Date();
  const msUntil = draftDate.getTime() - now.getTime();
  const daysUntil = Math.max(0, Math.floor(msUntil / 86400000));
  const hrsUntil = Math.max(0, Math.floor((msUntil % 86400000) / 3600000));

  return (
    <div>
      <div
        className="rounded-xl p-5 mb-5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
          <div>
            <p className="text-base font-semibold text-amber-50 mb-0.5">{draft.name}</p>
            <p className="text-xs text-amber-200/40">{draft.date} &middot; {draft.time} &middot; {draft.rounds} rounds</p>
          </div>
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: draft.open ? 'rgba(29,158,117,0.15)' : 'rgba(226,75,74,0.15)',
              color: draft.open ? '#34d399' : '#f87171',
              border: `1px solid ${draft.open ? 'rgba(29,158,117,0.3)' : 'rgba(226,75,74,0.3)'}`,
            }}
          >
            {draft.open ? "Registration open" : "Closed"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Teams joined", value: `${draft.teamsJoined}/${draft.teamsMax}`, icon: Users, color: "#f5a623" },
            { label: "Starts in", value: `${daysUntil}d ${hrsUntil}h`, icon: Clock, color: "#f5a623" },
            { label: "My pts", value: totalPts.toString(), icon: Trophy, color: "#34d399" },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-lg p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <item.icon size={14} className="mx-auto mb-1.5" style={{ color: item.color, opacity: 0.6 }} />
              <p className="text-[9px] uppercase tracking-wider text-amber-200/30 font-bold mb-0.5">{item.label}</p>
              <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>

        {!joined && draft.open && (
          <button
            onClick={() => { setJoined(true); setDraft(d => ({ ...d, teamsJoined: d.teamsJoined + 1 })); }}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
            style={{
              background: 'rgba(29,158,117,0.15)',
              color: '#34d399',
              border: '1px solid rgba(29,158,117,0.3)',
            }}
          >
            Join this draft
          </button>
        )}
        {joined && (
          <p className="text-center text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
            <CheckCircle size={14} /> You're in -- build your roster below
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-200/40 mb-3">
            My roster ({myTeam.length})
          </p>
          <div className="space-y-2">
            {myTeam.map(a => (
              <div
                key={a.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-lg">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-50 truncate">{a.name}</p>
                  <p className="text-[10px] text-amber-200/40">{a.pts} pts this season</p>
                </div>
                <button
                  onClick={() => setMyTeam(t => t.filter(x => x.id !== a.id))}
                  className="p-1 rounded hover:bg-red-500/10 transition-colors"
                >
                  <Minus size={12} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-200/40 mb-3">
            Available
          </p>
          <div className="space-y-2">
            {available.map(a => (
              <button
                key={a.id}
                onClick={() => setMyTeam(t => [...t, a])}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-white/[0.04] text-left"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span className="text-lg">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-50 truncate">{a.name}</p>
                  <p className="text-[10px] text-amber-200/40">{a.pts} pts</p>
                </div>
                <Plus size={12} className="text-emerald-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-200/40 mb-3">
          Scoring system
        </p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {draft.scoringEvents.map((s, i) => (
            <div
              key={s.id}
              className="flex justify-between px-4 py-2.5"
              style={{ borderBottom: i < draft.scoringEvents.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
            >
              <span className="text-xs text-amber-100/70">{s.label}</span>
              <span className="text-xs font-bold text-emerald-400">+{s.pts} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
