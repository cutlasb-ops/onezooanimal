import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, MapPin, Calendar, Users, Tag, MessageCircle, Send, Plus,
  Image, Lock, X, UserPlus, Check, Filter
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { AuthModal } from './AuthModal';

interface Props {
  onBack: () => void;
}

const C = {
  forest: '#1a3d2b',
  forestMid: '#2a5a3e',
  cream: '#f5f0e8',
  creamDark: '#ede5d6',
  coral: '#e07c5e',
  coralLight: '#f09a82',
  text: '#1c2e22',
  textMuted: '#5a7062',
  white: '#ffffff',
};

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  free: { bg: '#dcfce7', text: '#166534' },
  basic: { bg: '#dbeafe', text: '#1e40af' },
  plus: { bg: '#fef3c7', text: '#92400e' },
  premium: { bg: '#fce7f3', text: '#9d174d' },
};

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

interface ChatMessage {
  id: string;
  experience_id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

interface JoinRecord {
  id: string;
  experience_id: string;
  user_id: string;
  user_name: string;
}

export function OneMeetExperiences({ onBack }: Props) {
  const { user, profile } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'official' | 'community'>('official');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [openChat, setOpenChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [joins, setJoins] = useState<Record<string, JoinRecord[]>>({});
  const [showCommunityForm, setShowCommunityForm] = useState(false);

  // Community form
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cImage, setCImage] = useState('');
  const [cLocation, setCLocation] = useState('');
  const [cDateTime, setCDateTime] = useState('');
  const [cCategory, setCCategory] = useState('general');
  const [cMatches, setCMatches] = useState(10);

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchExperiences();
  }, [tab]);

  async function fetchExperiences() {
    setLoading(true);
    const { data } = await supabase
      .from('onemeet_experiences')
      .select('*')
      .eq('is_community', tab === 'community')
      .order('created_at', { ascending: false });
    setExperiences((data as Experience[]) || []);
    setLoading(false);

    if (data && data.length > 0) {
      const ids = data.map((e: Experience) => e.id);
      const { data: joinData } = await supabase
        .from('onemeet_experience_joins')
        .select('*')
        .in('experience_id', ids);
      const grouped: Record<string, JoinRecord[]> = {};
      (joinData || []).forEach((j: JoinRecord) => {
        if (!grouped[j.experience_id]) grouped[j.experience_id] = [];
        grouped[j.experience_id].push(j);
      });
      setJoins(grouped);
    }
  }

  async function openChatForExperience(expId: string) {
    if (!user) { setAuthOpen(true); return; }
    setOpenChat(expId);
    const { data } = await supabase
      .from('onemeet_experience_chat')
      .select('*')
      .eq('experience_id', expId)
      .order('created_at', { ascending: true });
    setChatMessages((data as ChatMessage[]) || []);
    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 100);
  }

  async function sendChat() {
    if (!chatInput.trim() || !openChat || !user) return;
    const msg = chatInput.trim();
    setChatInput('');
    const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';
    const { data } = await supabase
      .from('onemeet_experience_chat')
      .insert({ experience_id: openChat, user_id: user.id, user_name: displayName, message: msg })
      .select()
      .maybeSingle();
    if (data) {
      setChatMessages(prev => [...prev, data as ChatMessage]);
      setTimeout(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }, 50);
    }
  }

  async function handleJoin(expId: string) {
    if (!user) { setAuthOpen(true); return; }
    const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';
    await supabase
      .from('onemeet_experience_joins')
      .insert({ experience_id: expId, user_id: user.id, user_name: displayName });
    fetchExperiences();
  }

  async function handleLeave(expId: string) {
    if (!user) return;
    await supabase
      .from('onemeet_experience_joins')
      .delete()
      .eq('experience_id', expId)
      .eq('user_id', user.id);
    fetchExperiences();
  }

  async function submitCommunityPost(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !cTitle.trim()) return;
    const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';
    await supabase.from('onemeet_experiences').insert({
      title: cTitle.trim(),
      description: cDesc.trim(),
      image_url: cImage.trim(),
      tier: 'free',
      matches_available: cMatches,
      location: cLocation.trim(),
      date_time: cDateTime || null,
      category: cCategory,
      is_community: true,
      author_id: user.id,
      author_name: displayName,
    });
    setCTitle(''); setCDesc(''); setCImage(''); setCLocation(''); setCDateTime(''); setCCategory('general'); setCMatches(10);
    setShowCommunityForm(false);
    fetchExperiences();
  }

  function isJoined(expId: string) {
    return user && joins[expId]?.some(j => j.user_id === user.id);
  }

  const filtered = experiences.filter(exp => {
    if (filterTier !== 'all' && exp.tier !== filterTier) return false;
    if (filterCategory !== 'all' && exp.category !== filterCategory) return false;
    return true;
  });

  const categories = [...new Set(experiences.map(e => e.category))];

  return (
    <div className="min-h-screen" style={{ background: C.cream, color: C.text, fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

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
        <h1 className="text-sm font-bold" style={{ color: C.forest }}>Experiences</h1>
        <div className="w-20" />
      </nav>

      <div className="max-w-6xl mx-auto px-5 sm:px-10 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-2xl w-fit" style={{ background: C.creamDark }}>
          {(['official', 'community'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === t ? C.white : 'transparent',
                color: tab === t ? C.forest : C.textMuted,
                boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {t === 'official' ? 'Official' : 'Community'}
            </button>
          ))}
        </div>

        {/* Filters + Community Post button */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5">
            <Filter size={14} style={{ color: C.textMuted }} />
            <select
              value={filterTier}
              onChange={e => setFilterTier(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg outline-none appearance-none"
              style={{ background: C.white, border: `1px solid ${C.forest}12`, color: C.text }}
            >
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="plus">Plus</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          {categories.length > 1 && (
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg outline-none appearance-none"
              style={{ background: C.white, border: `1px solid ${C.forest}12`, color: C.text }}
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          )}
          {tab === 'community' && (
            <button
              onClick={() => { if (!user) { setAuthOpen(true); return; } setShowCommunityForm(true); }}
              className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
              style={{ background: C.forest, color: C.cream }}
            >
              <Plus size={13} />
              Post Activity
            </button>
          )}
        </div>

        {/* Community Form Modal */}
        {showCommunityForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <form
              onSubmit={submitCommunityPost}
              className="w-full max-w-lg rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
              style={{ background: C.white }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold" style={{ color: C.forest }}>Post a Community Activity</h2>
                <button type="button" onClick={() => setShowCommunityForm(false)}>
                  <X size={20} style={{ color: C.textMuted }} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: C.textMuted }}>Title</label>
                  <input
                    value={cTitle}
                    onChange={e => setCTitle(e.target.value)}
                    required
                    placeholder="What's the activity?"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: C.textMuted }}>Description</label>
                  <textarea
                    value={cDesc}
                    onChange={e => setCDesc(e.target.value)}
                    rows={3}
                    placeholder="Tell people what to expect..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: C.textMuted }}>Location</label>
                    <input
                      value={cLocation}
                      onChange={e => setCLocation(e.target.value)}
                      placeholder="Where?"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: C.textMuted }}>When</label>
                    <input
                      type="datetime-local"
                      value={cDateTime}
                      onChange={e => setCDateTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: C.textMuted }}>Category</label>
                    <select
                      value={cCategory}
                      onChange={e => setCCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none"
                      style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
                    >
                      {['general', 'coffee', 'outdoor', 'fitness', 'arts', 'food', 'nightlife', 'wellness', 'adventure'].map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: C.textMuted }}>Spots</label>
                    <input
                      type="number"
                      min={1}
                      value={cMatches}
                      onChange={e => setCMatches(parseInt(e.target.value) || 1)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: C.textMuted }}>Image URL (optional)</label>
                  <input
                    value={cImage}
                    onChange={e => setCImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: C.creamDark, border: `1px solid ${C.forest}10`, color: C.text }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.01]"
                style={{ background: C.forest, color: C.cream }}
              >
                Post Activity
              </button>
            </form>
          </div>
        )}

        {/* Chat Modal */}
        {openChat && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div
              className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
              style={{ background: C.white, height: '70vh', maxHeight: '600px' }}
            >
              {/* Chat header */}
              <div className="px-5 py-4 flex items-center justify-between shrink-0" style={{ borderBottom: `1px solid ${C.forest}08` }}>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: C.forest }}>
                    {experiences.find(e => e.id === openChat)?.title || 'Chat'}
                  </h3>
                  <p className="text-[11px]" style={{ color: C.textMuted }}>Plan together</p>
                </div>
                <button onClick={() => { setOpenChat(null); setChatMessages([]); }}>
                  <X size={20} style={{ color: C.textMuted }} />
                </button>
              </div>

              {/* Messages */}
              <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {chatMessages.length === 0 && (
                  <p className="text-center text-xs py-8" style={{ color: C.textMuted }}>
                    No messages yet. Start the conversation!
                  </p>
                )}
                {chatMessages.map(msg => {
                  const isMe = msg.user_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[80%]">
                        {!isMe && (
                          <p className="text-[10px] font-semibold mb-0.5 ml-3" style={{ color: C.textMuted }}>{msg.user_name}</p>
                        )}
                        <div
                          className="px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                          style={isMe
                            ? { background: C.forest, color: C.cream, borderBottomRightRadius: '4px' }
                            : { background: C.creamDark, color: C.text, borderBottomLeftRadius: '4px' }
                          }
                        >
                          {msg.message}
                        </div>
                        <p className="text-[9px] mt-0.5 mx-3" style={{ color: `${C.textMuted}80` }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="px-4 pb-4 pt-2 shrink-0" style={{ borderTop: `1px solid ${C.forest}06` }}>
                <form
                  onSubmit={e => { e.preventDefault(); sendChat(); }}
                  className="flex items-center gap-2 rounded-2xl px-4 py-3"
                  style={{ background: C.creamDark, border: `1px solid ${C.forest}08` }}
                >
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: C.text }}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30"
                    style={{ background: C.forest }}
                  >
                    <Send size={13} style={{ color: C.cream }} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Cards grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: `${C.forest}30`, borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-bold mb-2" style={{ color: C.forest }}>
              {tab === 'community' ? 'No community activities yet' : 'No experiences available'}
            </p>
            <p className="text-sm" style={{ color: C.textMuted }}>
              {tab === 'community' ? 'Be the first to post one!' : 'Check back soon for new experiences.'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(exp => {
              const tierStyle = TIER_COLORS[exp.tier] || TIER_COLORS.free;
              const joined = isJoined(exp.id);
              const joinCount = joins[exp.id]?.length || 0;
              const spotsLeft = exp.matches_available - joinCount;

              return (
                <div
                  key={exp.id}
                  className="rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{ background: C.white, border: `1px solid ${C.forest}08` }}
                >
                  {/* Image */}
                  {exp.image_url ? (
                    <div className="h-40 bg-black/5 relative overflow-hidden">
                      <img src={exp.image_url} alt="" className="w-full h-full object-cover" />
                      <div
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                        style={{ background: tierStyle.bg, color: tierStyle.text }}
                      >
                        {exp.tier}
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 relative flex items-center justify-center" style={{ background: C.creamDark }}>
                      <Image size={24} style={{ color: `${C.textMuted}40` }} />
                      <div
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                        style={{ background: tierStyle.bg, color: tierStyle.text }}
                      >
                        {exp.tier}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1" style={{ color: C.forest }}>{exp.title}</h3>
                    {exp.description && (
                      <p className="text-xs line-clamp-2 mb-3" style={{ color: C.textMuted }}>{exp.description}</p>
                    )}

                    <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4">
                      {exp.location && (
                        <span className="text-[11px] flex items-center gap-1" style={{ color: C.textMuted }}>
                          <MapPin size={10} /> {exp.location}
                        </span>
                      )}
                      {exp.date_time && (
                        <span className="text-[11px] flex items-center gap-1" style={{ color: C.textMuted }}>
                          <Calendar size={10} /> {new Date(exp.date_time).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-[11px] flex items-center gap-1" style={{ color: C.textMuted }}>
                        <Users size={10} /> {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
                      </span>
                      {exp.is_community && (
                        <span className="text-[11px] flex items-center gap-1" style={{ color: C.coral }}>
                          by {exp.author_name}
                        </span>
                      )}
                    </div>

                    {/* Joined avatars */}
                    {joinCount > 0 && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex -space-x-1.5">
                          {(joins[exp.id] || []).slice(0, 4).map(j => (
                            <div
                              key={j.id}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border-2"
                              style={{ background: C.coral, color: C.cream, borderColor: C.white }}
                              title={j.user_name}
                            >
                              {j.user_name[0]?.toUpperCase()}
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px]" style={{ color: C.textMuted }}>
                          {joinCount} {joinCount === 1 ? 'person' : 'people'} going
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {joined ? (
                        <button
                          onClick={() => handleLeave(exp.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                          style={{ background: `${C.forest}08`, color: C.forest }}
                        >
                          <Check size={12} /> Joined
                        </button>
                      ) : spotsLeft > 0 ? (
                        <button
                          onClick={() => handleJoin(exp.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                          style={{ background: C.forest, color: C.cream }}
                        >
                          <UserPlus size={12} /> Join
                        </button>
                      ) : (
                        <div
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
                          style={{ background: C.creamDark, color: C.textMuted }}
                        >
                          <Lock size={12} /> Full
                        </div>
                      )}
                      <button
                        onClick={() => openChatForExperience(exp.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: C.creamDark }}
                      >
                        <MessageCircle size={14} style={{ color: C.forest }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
