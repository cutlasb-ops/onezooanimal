import { useState } from 'react';
import { Plus, X as XIcon, ArrowLeft, Trash2 } from 'lucide-react';
import type { FaunaAnimal, FaunaEvent, FaunaDraft } from './faunaData';
import { TYPE_COLORS } from './faunaData';
import { FaunaPasswordAdmin } from './FaunaPasswordAdmin';

interface AdminTabProps {
  animals: FaunaAnimal[];
  setAnimals: React.Dispatch<React.SetStateAction<FaunaAnimal[]>>;
  schedule: FaunaEvent[];
  setSchedule: React.Dispatch<React.SetStateAction<FaunaEvent[]>>;
  draft: FaunaDraft;
  setDraft: React.Dispatch<React.SetStateAction<FaunaDraft>>;
}

const ADMIN_TABS = ["Events", "Draft Settings", "Animals", "Scoring", "Security"];
const STATUS_OPTS = ["live", "upcoming", "ended"];
const TYPE_OPTS = ["rivalry", "migration", "hunt", "birth", "cam"];

const inputClass = "w-full px-3 py-2 rounded-lg text-xs text-amber-50 placeholder-amber-200/20 outline-none focus:ring-1 focus:ring-amber-500/40 transition-all";
const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };
const labelClass = "text-[10px] uppercase tracking-wider text-amber-200/30 font-bold mb-1.5 block";

export function AdminTab({ animals, setAnimals, schedule, setSchedule, draft, setDraft }: AdminTabProps) {
  const [adminTab, setAdminTab] = useState(0);

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-sm font-semibold text-amber-50">Admin Panel</span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(245,166,35,0.15)', color: '#f5a623', border: '1px solid rgba(245,166,35,0.25)' }}
        >
          Full access
        </span>
      </div>
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {ADMIN_TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => setAdminTab(i)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
            style={{
              background: adminTab === i ? 'rgba(245,166,35,0.15)' : 'transparent',
              color: adminTab === i ? '#f5a623' : 'rgba(255,255,255,0.35)',
              border: adminTab === i ? '1px solid rgba(245,166,35,0.25)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {adminTab === 0 && <AdminEvents schedule={schedule} setSchedule={setSchedule} animals={animals} />}
      {adminTab === 1 && <AdminDraft draft={draft} setDraft={setDraft} />}
      {adminTab === 2 && <AdminAnimals animals={animals} setAnimals={setAnimals} />}
      {adminTab === 3 && <AdminScoring draft={draft} setDraft={setDraft} />}
      {adminTab === 4 && <FaunaPasswordAdmin />}
    </div>
  );
}

function AdminEvents({ schedule, setSchedule, animals }: { schedule: FaunaEvent[]; setSchedule: React.Dispatch<React.SetStateAction<FaunaEvent[]>>; animals: FaunaAnimal[] }) {
  const [form, setForm] = useState({ title: "", type: "rivalry", animal: animals[0]?.name || "", date: "", time: "08:00", aiEnabled: true });
  const [adding, setAdding] = useState(false);

  function addEvent() {
    if (!form.title || !form.date) return;
    setSchedule(s => [...s, { ...form, id: Date.now(), status: "upcoming", viewers: 0 }]);
    setAdding(false);
    setForm({ title: "", type: "rivalry", animal: animals[0]?.name || "", date: "", time: "08:00", aiEnabled: true });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-semibold text-amber-100">Scheduled events ({schedule.length})</p>
        <button
          onClick={() => setAdding(a => !a)}
          className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Plus size={10} /> New event
        </button>
      </div>

      {adding && (
        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-[10px] uppercase tracking-wider text-amber-200/30 font-bold mb-3">New event</p>
          <input
            placeholder="Event title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className={inputClass + " mb-2"}
            style={inputStyle}
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className={inputClass}
              style={inputStyle}
            >
              {TYPE_OPTS.map(t => <option key={t} value={t} className="bg-stone-900">{t}</option>)}
            </select>
            <select
              value={form.animal}
              onChange={e => setForm(f => ({ ...f, animal: e.target.value }))}
              className={inputClass}
              style={inputStyle}
            >
              {animals.map(a => <option key={a.id} value={a.name} className="bg-stone-900">{a.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputClass} style={inputStyle} />
            <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className={inputClass} style={inputStyle} />
          </div>
          <label className="flex items-center gap-2 text-xs text-amber-100/70 cursor-pointer mb-3">
            <input type="checkbox" checked={form.aiEnabled} onChange={e => setForm(f => ({ ...f, aiEnabled: e.target.checked }))} className="rounded border-amber-500/30" />
            Enable AI commentary
          </label>
          <div className="flex gap-2">
            <button
              onClick={addEvent}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'rgba(29,158,117,0.15)', color: '#34d399', border: '1px solid rgba(29,158,117,0.3)' }}
            >
              Add event
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {schedule.map(ev => {
          const tc = TYPE_COLORS[ev.type] || { fg: "#888", bg: "#f5f5f5" };
          return (
            <div
              key={ev.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tc.fg }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-50 truncate">{ev.title}</p>
                <p className="text-[10px] text-amber-200/30 truncate">{ev.date} {ev.time} &middot; {ev.animal}</p>
              </div>
              <select
                value={ev.status}
                onChange={e => setSchedule(s => s.map(x => x.id === ev.id ? { ...x, status: e.target.value, viewers: e.target.value === "live" ? Math.floor(Math.random() * 10000 + 1000) : x.viewers } : x))}
                className="text-[10px] px-2 py-1 rounded-md bg-transparent text-amber-200/60 outline-none"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {STATUS_OPTS.map(s => <option key={s} value={s} className="bg-stone-900">{s}</option>)}
              </select>
              <button
                onClick={() => setSchedule(s => s.filter(x => x.id !== ev.id))}
                className="p-1 rounded hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={11} className="text-red-400/60" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminDraft({ draft, setDraft }: { draft: FaunaDraft; setDraft: React.Dispatch<React.SetStateAction<FaunaDraft>> }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-200/30 mb-4">Draft settings</p>
      <label className={labelClass}>Draft name</label>
      <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} className={inputClass + " mb-3"} style={inputStyle} />
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className={labelClass}>Time</label>
          <input type="time" value={draft.time} onChange={e => setDraft(d => ({ ...d, time: e.target.value }))} className={inputClass} style={inputStyle} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={labelClass}>Rounds</label>
          <input type="number" min={1} max={10} value={draft.rounds} onChange={e => setDraft(d => ({ ...d, rounds: +e.target.value }))} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className={labelClass}>Max teams</label>
          <input type="number" min={2} max={256} value={draft.teamsMax} onChange={e => setDraft(d => ({ ...d, teamsMax: +e.target.value }))} className={inputClass} style={inputStyle} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs text-amber-100/70 cursor-pointer">
        <input type="checkbox" checked={draft.open} onChange={e => setDraft(d => ({ ...d, open: e.target.checked }))} className="rounded border-amber-500/30" />
        Registration open
      </label>
    </div>
  );
}

function AdminAnimals({ animals, setAnimals }: { animals: FaunaAnimal[]; setAnimals: React.Dispatch<React.SetStateAction<FaunaAnimal[]>> }) {
  const [editId, setEditId] = useState<number | null>(null);
  const editing = animals.find(a => a.id === editId);

  function update(id: number, field: string, val: string) {
    setAnimals(a => a.map(x => x.id === id ? { ...x, [field]: field === "viewers" || field === "pts" ? +val : val } : x));
  }

  if (editing) return (
    <div>
      <button onClick={() => setEditId(null)} className="flex items-center gap-1.5 text-xs text-amber-200/50 hover:text-amber-200/80 transition-colors mb-4">
        <ArrowLeft size={12} /> All animals
      </button>
      <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{editing.emoji}</span>
          <p className="text-sm font-semibold text-amber-50">{editing.name}</p>
        </div>
        {([
          ["name", "Name"], ["species", "Species"], ["location", "Location"],
          ["color", "Accent color"], ["rival", "Rival (optional)"], ["record", "Record"],
          ["viewers", "Live viewers"], ["pts", "Season points"]
        ] as [string, string][]).map(([f, l]) => (
          <div key={f} className="mb-3">
            <label className={labelClass}>{l}</label>
            <input
              type={["viewers", "pts"].includes(f) ? "number" : f === "color" ? "color" : "text"}
              value={String((editing as unknown as Record<string, unknown>)[f] || "")}
              onChange={e => update(editing.id, f, e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        ))}
        <div className="mb-3">
          <label className={labelClass}>Bio</label>
          <textarea
            value={editing.bio || ""}
            onChange={e => update(editing.id, "bio", e.target.value)}
            rows={3}
            className={inputClass + " resize-y"}
            style={inputStyle}
          />
        </div>
        <button
          onClick={() => setEditId(null)}
          className="py-2 px-5 rounded-lg text-xs font-semibold transition-all"
          style={{ background: 'rgba(29,158,117,0.15)', color: '#34d399', border: '1px solid rgba(29,158,117,0.3)' }}
        >
          Save changes
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <p className="text-xs text-amber-200/40 mb-3">Edit any animal profile -- changes reflect instantly.</p>
      <div className="space-y-2">
        {animals.map(a => (
          <div
            key={a.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-lg">{a.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-50 truncate">{a.name}</p>
              <p className="text-[10px] text-amber-200/30">{a.species} &middot; {a.viewers.toLocaleString()} viewers</p>
            </div>
            <button
              onClick={() => setEditId(a.id)}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminScoring({ draft, setDraft }: { draft: FaunaDraft; setDraft: React.Dispatch<React.SetStateAction<FaunaDraft>> }) {
  const [newLabel, setNewLabel] = useState("");
  const [newPts, setNewPts] = useState(5);

  function addEvent() {
    if (!newLabel) return;
    setDraft(d => ({ ...d, scoringEvents: [...d.scoringEvents, { id: Date.now(), label: newLabel, pts: newPts }] }));
    setNewLabel("");
    setNewPts(5);
  }

  return (
    <div>
      <p className="text-xs text-amber-200/40 mb-4">Customize the fantasy scoring system. Changes apply to the active draft season.</p>
      <div className="space-y-2 mb-4">
        {draft.scoringEvents.map(s => (
          <div
            key={s.id}
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <input
              value={s.label}
              onChange={e => setDraft(d => ({ ...d, scoringEvents: d.scoringEvents.map(x => x.id === s.id ? { ...x, label: e.target.value } : x) }))}
              className="flex-1 bg-transparent text-xs text-amber-100 outline-none"
            />
            <input
              type="number"
              min={1}
              max={100}
              value={s.pts}
              onChange={e => setDraft(d => ({ ...d, scoringEvents: d.scoringEvents.map(x => x.id === s.id ? { ...x, pts: +e.target.value } : x) }))}
              className="w-14 text-center bg-transparent text-xs text-emerald-400 font-bold outline-none"
              style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px' }}
            />
            <span className="text-[10px] text-amber-200/30">pts</span>
            <button
              onClick={() => setDraft(d => ({ ...d, scoringEvents: d.scoringEvents.filter(x => x.id !== s.id) }))}
              className="p-1 rounded hover:bg-red-500/10 transition-colors"
            >
              <XIcon size={10} className="text-red-400/60" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          placeholder="New scoring event"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          className={inputClass + " flex-1"}
          style={inputStyle}
        />
        <input
          type="number"
          min={1}
          max={100}
          value={newPts}
          onChange={e => setNewPts(+e.target.value)}
          className="w-16 text-center rounded-lg text-xs text-amber-50 outline-none"
          style={inputStyle}
        />
        <button
          onClick={addEvent}
          className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: 'rgba(29,158,117,0.15)', color: '#34d399', border: '1px solid rgba(29,158,117,0.3)' }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
