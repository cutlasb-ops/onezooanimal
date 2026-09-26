import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, CreditCard as Edit3, Image, MapPin, Calendar, Users, Tag, Lock } from 'lucide-react';
import { supabaseAdmin, supabase } from '../lib/supabase';

interface Props {
  onBack: () => void;
}

const C = {
  forest: '#1a3d2b',
  forestMid: '#2a5a3e',
  cream: '#f5f0e8',
  creamDark: '#ede5d6',
  coral: '#e07c5e',
  text: '#1c2e22',
  textMuted: '#5a7062',
  white: '#ffffff',
};

const TIERS = ['free', 'basic', 'plus', 'premium'] as const;
const CATEGORIES = ['coffee', 'outdoor', 'fitness', 'arts', 'food', 'nightlife', 'wellness', 'adventure', 'general'] as const;

interface Experience {
  id: string;
  title: string;
  description: string;
  image_url: string;
  tier: string;
  matches_available: number;
  location: string;
  date_time: string | null;
  category: string;
  is_community: boolean;
  author_name: string;
  created_at: string;
}

export function OneMeetAdmin({ onBack }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tier, setTier] = useState<string>('free');
  const [matchesAvailable, setMatchesAvailable] = useState(10);
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [category, setCategory] = useState<string>('general');

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (password === 'goldenhire') {
      setUnlocked(true);
      fetchExperiences();
    }
  }

  async function fetchExperiences() {
    setLoading(true);
    const { data } = await supabase
      .from('onemeet_experiences')
      .select('*')
      .eq('is_community', false)
      .order('created_at', { ascending: false });
    setExperiences((data as Experience[]) || []);
    setLoading(false);
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setTier('free');
    setMatchesAvailable(10);
    setLocation('');
    setDateTime('');
    setCategory('general');
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(exp: Experience) {
    setTitle(exp.title);
    setDescription(exp.description);
    setImageUrl(exp.image_url);
    setTier(exp.tier);
    setMatchesAvailable(exp.matches_available);
    setLocation(exp.location);
    setDateTime(exp.date_time || '');
    setCategory(exp.category);
    setEditingId(exp.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      image_url: imageUrl.trim(),
      tier,
      matches_available: matchesAvailable,
      location: location.trim(),
      date_time: dateTime || null,
      category,
      is_community: false,
      author_name: 'OneMeet Team',
    };

    if (editingId) {
      await supabaseAdmin
        .from('onemeet_experiences')
        .update(payload)
        .eq('id', editingId);
    } else {
      await supabaseAdmin
        .from('onemeet_experiences')
        .insert(payload);
    }

    resetForm();
    fetchExperiences();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this experience?')) return;
    await supabaseAdmin
      .from('onemeet_experiences')
      .delete()
      .eq('id', id);
    fetchExperiences();
  }

  useEffect(() => {
    if (unlocked) fetchExperiences();
  }, [unlocked]);

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.cream }}>
        <form onSubmit={handleUnlock} className="w-full max-w-sm mx-4">
          <div className="rounded-3xl p-8 shadow-xl" style={{ background: C.white, border: `1px solid ${C.forest}10` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: `${C.forest}10` }}>
              <Lock size={24} style={{ color: C.forest }} />
            </div>
            <h1 className="text-xl font-bold text-center mb-1" style={{ color: C.forest }}>OneMeet Admin</h1>
            <p className="text-sm text-center mb-6" style={{ color: C.textMuted }}>Enter password to manage experiences</p>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 mb-4"
              style={{ background: C.creamDark, border: `1px solid ${C.forest}15`, color: C.text }}
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: C.forest, color: C.cream }}
            >
              Unlock
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full mt-3 py-2 text-sm font-medium"
              style={{ color: C.textMuted }}
            >
              Back to OneMeet
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.cream, color: C.text }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-5 sm:px-10 h-16"
        style={{ background: 'rgba(245,240,232,0.95)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.forest}12` }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-colors"
          style={{ color: C.textMuted }}
        >
          <ArrowLeft size={16} />
          OneMeet
        </button>
        <h1 className="text-sm font-bold" style={{ color: C.forest }}>Experience Admin</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
          style={{ background: C.forest, color: C.cream }}
        >
          <Plus size={14} />
          New
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-5 sm:px-10 py-8">
        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-6 mb-8 shadow-sm"
            style={{ background: C.white, border: `1px solid ${C.forest}10` }}
          >
            <h2 className="text-lg font-bold mb-5" style={{ color: C.forest }}>
              {editingId ? 'Edit Experience' : 'Create Experience'}
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: C.textMuted }}>Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Sunset Kayak Tour"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2"
                  style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: C.textMuted }}>Location</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
                  <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Boston Harbor"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2"
                    style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: C.textMuted }}>Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="What's this experience about?"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2 resize-none"
                style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: C.textMuted }}>Image URL</label>
                <div className="relative">
                  <Image size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
                  <input
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2"
                    style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: C.textMuted }}>Date & Time</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={e => setDateTime(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2"
                    style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: C.textMuted }}>Tier</label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
                  <select
                    value={tier}
                    onChange={e => setTier(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2 appearance-none"
                    style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
                  >
                    {TIERS.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: C.textMuted }}>Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2 appearance-none"
                  style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: C.textMuted }}>Matches Available</label>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
                  <input
                    type="number"
                    min={1}
                    value={matchesAvailable}
                    onChange={e => setMatchesAvailable(parseInt(e.target.value) || 1)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2"
                    style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
                  />
                </div>
              </div>
            </div>

            {imageUrl && (
              <div className="mb-5 rounded-xl overflow-hidden h-40 bg-black/5">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                style={{ background: C.forest, color: C.cream }}
              >
                {editingId ? 'Save Changes' : 'Create Experience'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                style={{ background: C.creamDark, color: C.textMuted }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Experience List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: `${C.forest}30`, borderTopColor: 'transparent' }} />
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-bold mb-2" style={{ color: C.forest }}>No experiences yet</p>
            <p className="text-sm" style={{ color: C.textMuted }}>Create your first experience above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.map(exp => (
              <div
                key={exp.id}
                className="rounded-2xl p-5 flex gap-4 items-start transition-all hover:shadow-md"
                style={{ background: C.white, border: `1px solid ${C.forest}08` }}
              >
                {exp.image_url && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-black/5">
                    <img src={exp.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: C.forest }}>{exp.title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>{exp.location}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                        style={{
                          background: exp.tier === 'free' ? '#dcfce7' : exp.tier === 'basic' ? '#dbeafe' : exp.tier === 'plus' ? '#fef3c7' : '#fce7f3',
                          color: exp.tier === 'free' ? '#166534' : exp.tier === 'basic' ? '#1e40af' : exp.tier === 'plus' ? '#92400e' : '#9d174d',
                        }}
                      >
                        {exp.tier}
                      </span>
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-xs mt-1.5 line-clamp-2" style={{ color: C.textMuted }}>{exp.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2.5">
                    <span className="text-[11px] flex items-center gap-1" style={{ color: C.textMuted }}>
                      <Users size={11} /> {exp.matches_available} spots
                    </span>
                    <span className="text-[11px] flex items-center gap-1" style={{ color: C.textMuted }}>
                      <Tag size={11} /> {exp.category}
                    </span>
                    {exp.date_time && (
                      <span className="text-[11px] flex items-center gap-1" style={{ color: C.textMuted }}>
                        <Calendar size={11} /> {new Date(exp.date_time).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(exp)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: `${C.forest}08` }}
                  >
                    <Edit3 size={14} style={{ color: C.forest }} />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: '#fef2f2' }}
                  >
                    <Trash2 size={14} style={{ color: '#dc2626' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
