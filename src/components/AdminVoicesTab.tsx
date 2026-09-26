import { useEffect, useState } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Volume2, Loader2 } from 'lucide-react';
import { supabase, supabaseAdmin } from '../lib/supabase';

interface AnimalVoice {
  id: string;
  animal_name: string;
  voice: string;
  gender_label: string;
  persona_notes: string;
}

const OPENAI_VOICES: Array<{ id: string; gender: string; description: string }> = [
  { id: 'alloy', gender: 'Neutral', description: 'Balanced, clear, friendly' },
  { id: 'ash', gender: 'Male', description: 'Warm, grounded male' },
  { id: 'ballad', gender: 'Male', description: 'Soft, melodic male' },
  { id: 'coral', gender: 'Female', description: 'Bright, expressive female' },
  { id: 'echo', gender: 'Male', description: 'Smooth, calm male' },
  { id: 'fable', gender: 'Neutral', description: 'Storyteller, British' },
  { id: 'nova', gender: 'Female', description: 'Energetic, youthful female (Jasmine-like)' },
  { id: 'onyx', gender: 'Male', description: 'Deep, resonant male' },
  { id: 'sage', gender: 'Female', description: 'Gentle, wise female' },
  { id: 'shimmer', gender: 'Female', description: 'Light, airy female' },
  { id: 'verse', gender: 'Neutral', description: 'Poetic, flexible' },
];

function voiceMeta(voiceId: string) {
  return OPENAI_VOICES.find((v) => v.id === voiceId) || OPENAI_VOICES[0];
}

export function AdminVoicesTab() {
  const [voices, setVoices] = useState<AnimalVoice[]>([]);
  const [editing, setEditing] = useState<AnimalVoice | null>(null);
  const [form, setForm] = useState({
    animal_name: '',
    voice: 'alloy',
    gender_label: '',
    persona_notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    loadVoices();
  }, []);

  async function loadVoices() {
    const { data } = await supabase
      .from('animal_voices')
      .select('*')
      .order('animal_name', { ascending: true });
    if (data) setVoices(data as AnimalVoice[]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = form.animal_name.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      const payload = {
        animal_name: trimmed,
        voice: form.voice,
        gender_label: form.gender_label.trim(),
        persona_notes: form.persona_notes.trim(),
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        const { error } = await supabaseAdmin
          .from('animal_voices')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin
          .from('animal_voices')
          .insert([payload]);
        if (error) throw error;
      }

      resetForm();
      await loadVoices();
      setStatus('Voice saved');
      setTimeout(() => setStatus(null), 2500);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Error saving voice: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setEditing(null);
    setForm({ animal_name: '', voice: 'alloy', gender_label: '', persona_notes: '' });
  }

  function handleEdit(v: AnimalVoice) {
    setEditing(v);
    setForm({
      animal_name: v.animal_name,
      voice: v.voice,
      gender_label: v.gender_label,
      persona_notes: v.persona_notes,
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this voice assignment?')) return;
    const { error } = await supabaseAdmin.from('animal_voices').delete().eq('id', id);
    if (error) {
      alert('Failed to delete voice.');
      return;
    }
    loadVoices();
  }

  async function previewVoice(v: AnimalVoice) {
    setPreviewing(v.id);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/openai-animal-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          message: `Say hi as ${v.animal_name} in one short friendly sentence.`,
          animal: v.animal_name,
          voice: v.voice,
        }),
      });

      const data = await res.json();
      if (data.audioBase64) {
        const bytes = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        await audio.play();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewing(null);
    }
  }

  const meta = voiceMeta(form.voice);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          {editing ? 'Edit Animal Voice' : 'Assign Voice to Animal'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Animal name
            </label>
            <input
              type="text"
              required
              value={form.animal_name}
              onChange={(e) => setForm({ ...form, animal_name: e.target.value })}
              placeholder="e.g., Jasmine the Lioness"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Must match the animal name used in feeds or chat (case-insensitive).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              OpenAI voice
            </label>
            <select
              value={form.voice}
              onChange={(e) => setForm({ ...form, voice: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {OPENAI_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id} — {v.gender} — {v.description}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              {meta.gender} voice. {meta.description}.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Gender / identity label (optional)
            </label>
            <input
              type="text"
              value={form.gender_label}
              onChange={(e) => setForm({ ...form, gender_label: e.target.value })}
              placeholder="e.g., Female — Jasmine, bright and warm"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Passed to the AI so it speaks with this identity (e.g., "Jasmine", male, female).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Persona notes (optional)
            </label>
            <textarea
              rows={3}
              value={form.persona_notes}
              onChange={(e) => setForm({ ...form, persona_notes: e.target.value })}
              placeholder="e.g., Playful, loves mangoes, curious about visitors."
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {status && (
            <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm text-emerald-200">
              {status}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {editing ? <Edit2 size={18} /> : <Plus size={18} />}
              {saving ? 'Saving...' : editing ? 'Update Voice' : 'Save Voice'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Configured Animal Voices</h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {voices.map((v) => {
            const vm = voiceMeta(v.voice);
            return (
              <div
                key={v.id}
                className="bg-slate-700 rounded-lg p-4 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">{v.animal_name}</h4>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
                      {v.voice}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-600/40 text-slate-200 border border-slate-500/30">
                      {vm.gender}
                    </span>
                    {v.gender_label && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-amber-600/20 text-amber-300 border border-amber-500/30">
                        {v.gender_label}
                      </span>
                    )}
                  </div>
                  {v.persona_notes && (
                    <p className="text-xs text-slate-400 mt-2">{v.persona_notes}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => previewVoice(v)}
                    disabled={previewing === v.id}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                    title="Preview voice"
                  >
                    {previewing === v.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Volume2 size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(v)}
                    className="text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
          {voices.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              No animal voices configured yet. Add one to make animals sound unique.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
