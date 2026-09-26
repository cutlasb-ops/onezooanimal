import { useState } from 'react';
import { X, Radio, Users, PawPrint, Lock, Eye, EyeOff, Zap, Camera } from 'lucide-react';
import { LiveTab } from './LiveTab';
import { DraftTab } from './DraftTab';
import { AnimalsTab } from './AnimalsTab';
import { AdminTab } from './AdminTab';
import { CommentaryTab } from './CommentaryTab';
import { VisionTab } from './VisionTab';
import { INITIAL_ANIMALS, INITIAL_SCHEDULE, INITIAL_DRAFT } from './faunaData';
import type { FaunaAnimal, FaunaEvent, FaunaDraft } from './faunaData';

interface FaunaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { label: "Live Events", icon: Radio },
  { label: "AI Commentary", icon: Zap },
  { label: "Vision", icon: Camera },
  { label: "Draft Room", icon: Users },
  { label: "Animals", icon: PawPrint },
  { label: "Admin", icon: Lock },
];

export function FaunaModal({ isOpen, onClose }: FaunaModalProps) {
  const [tab, setTab] = useState(0);
  const [animals, setAnimals] = useState<FaunaAnimal[]>(INITIAL_ANIMALS);
  const [schedule, setSchedule] = useState<FaunaEvent[]>(INITIAL_SCHEDULE);
  const [draft, setDraft] = useState<FaunaDraft>(INITIAL_DRAFT);
  const [adminPass, setAdminPass] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminErr, setAdminErr] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [storedPassword] = useState(() => localStorage.getItem('fauna_admin_pass') || 'animal');

  if (!isOpen) return null;

  const liveCount = schedule.filter(e => e.status === "live").length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div
        className="relative w-full max-w-3xl mx-4 my-6 sm:my-10 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0a1628 0%, #0d2e14 50%, #1a1a0f 100%)',
          border: '1px solid rgba(245,166,35,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-white/10"
          style={{ border: '1px solid rgba(245,166,35,0.3)', color: '#f5a623' }}
        >
          <X size={14} />
        </button>

        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-bold text-amber-50 tracking-tight">Fauna</h2>
            {liveCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                <Radio size={8} className="animate-pulse" />
                {liveCount} LIVE
              </span>
            )}
          </div>
          <p className="text-xs text-amber-200/35">Live wildlife events, fantasy drafts & AI commentary</p>
        </div>

        <div className="px-6 py-3 flex gap-1.5 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {TABS.map((t, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
              style={{
                background: tab === i ? 'rgba(245,166,35,0.12)' : 'transparent',
                color: tab === i ? '#f5a623' : 'rgba(255,255,255,0.35)',
                border: tab === i ? '1px solid rgba(245,166,35,0.2)' : '1px solid transparent',
              }}
            >
              <t.icon size={12} />
              {t.label}
              {i === 5 && !adminUnlocked && <Lock size={8} className="ml-0.5 opacity-50" />}
            </button>
          ))}
        </div>

        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {tab === 0 && <LiveTab schedule={schedule} animals={animals} />}
          {tab === 1 && <CommentaryTab />}
          {tab === 2 && <VisionTab />}
          {tab === 3 && <DraftTab draft={draft} animals={animals} setDraft={setDraft} />}
          {tab === 4 && <AnimalsTab animals={animals} />}
          {tab === 5 && (
            adminUnlocked
              ? <AdminTab animals={animals} setAnimals={setAnimals} schedule={schedule} setSchedule={setSchedule} draft={draft} setDraft={setDraft} />
              : (
                <div className="max-w-xs mx-auto text-center py-8">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
                    <Lock size={20} className="text-amber-400" />
                  </div>
                  <p className="text-sm font-semibold text-amber-50 mb-1">Admin access</p>
                  <p className="text-xs text-amber-200/35 mb-5">Enter your admin password to manage events, animals, drafts, and scoring.</p>
                  <div className="relative mb-3">
                    <input
                      type={showPass ? "text" : "password"}
                      value={adminPass}
                      onChange={e => { setAdminPass(e.target.value); setAdminErr(false); }}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          if (adminPass === storedPassword) {
                            setAdminUnlocked(true);
                            setAdminErr(false);
                          } else {
                            setAdminErr(true);
                          }
                        }
                      }}
                      placeholder="Password"
                      className="w-full px-4 py-2.5 rounded-lg text-sm text-amber-50 placeholder-amber-200/20 outline-none focus:ring-1 focus:ring-amber-500/40 pr-10"
                      style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${adminErr ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }}
                    />
                    <button
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-200/30 hover:text-amber-200/60 transition-colors"
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {adminErr && <p className="text-xs text-red-400 mb-3">Incorrect password</p>}
                  <button
                    onClick={() => {
                      if (adminPass === storedPassword) {
                        setAdminUnlocked(true);
                        setAdminErr(false);
                      } else {
                        setAdminErr(true);
                      }
                    }}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: 'rgba(245,166,35,0.12)', color: '#f5a623', border: '1px solid rgba(245,166,35,0.25)' }}
                  >
                    Unlock admin
                  </button>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}
