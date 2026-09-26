import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Lock, Video, Copy, Trophy, ChevronDown } from 'lucide-react';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { AnimalBattle } from './AnimalBattle';

interface MarchMadnessProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BtlStream {
  id: string;
  title: string;
  yt_id: string;
  stream_type: 'live' | 'video';
  display_order: number;
  created_at: string;
}

const ADMIN_PASSWORD = 'marchmadness';

function embedUrl(ytId: string) {
  return `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
}

function thumbUrl(ytId: string) {
  return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
}

function getYtId(url: string): string | null {
  const s = (url || '').trim();
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|live\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  return null;
}

export function MarchMadness({ isOpen, onClose }: MarchMadnessProps) {
  const [tab, setTab] = useState<'streams' | 'brackets'>('streams');
  const [streams, setStreams] = useState<BtlStream[]>([]);
  const [selected, setSelected] = useState<BtlStream | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const [addTitle, setAddTitle] = useState('');
  const [addUrl, setAddUrl] = useState('');
  const [addType, setAddType] = useState<'video' | 'live'>('video');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  const [toast, setToast] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadStreams();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    setPlaying(false);
  }, [selected?.id]);

  async function loadStreams() {
    setLoading(true);
    const { data } = await supabase
      .from('btl_streams')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (data && data.length > 0) {
      const list = data as BtlStream[];
      setStreams(list);
      if (!selected) {
        setSelected(list[0]);
        setPlaying(true);
      }
    } else {
      setStreams([]);
    }
    setLoading(false);
  }

  function openAdminPrompt() {
    setPw('');
    setPwError(false);
    setPwOpen(true);
  }

  function checkPw(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      setPwOpen(false);
      setAdminOpen(true);
    } else {
      setPwError(true);
      setPw('');
    }
  }

  async function addStream(e: React.FormEvent) {
    e.preventDefault();
    const ytId = getYtId(addUrl);
    if (!addTitle.trim() || !ytId) {
      setAddError('Please enter a title and a valid YouTube URL.');
      return;
    }
    setAddError('');
    setAdding(true);
    const { error } = await supabaseAdmin.from('btl_streams').insert([{
      title: addTitle.trim(),
      yt_id: ytId,
      stream_type: addType,
      display_order: streams.length,
    }]);
    if (!error) {
      setAddTitle('');
      setAddUrl('');
      setAddType('video');
      await loadStreams();
    }
    setAdding(false);
  }

  async function deleteStream(id: string) {
    if (!confirm('Remove this broadcast?')) return;
    if (selected?.id === id) { setSelected(null); setPlaying(false); }
    await supabaseAdmin.from('btl_streams').delete().eq('id', id);
    await loadStreams();
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  function copyLink(ytId: string) {
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${ytId}`).catch(() => {});
    showToast('Link copied!');
  }

  function selectStream(s: BtlStream) {
    setSelected(s);
    setPlaying(true);
    setListOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.97)' }}
    >
      <div
        className="w-full flex flex-col"
        style={{ height: '100%', maxHeight: '100dvh', background: '#0a0a0f' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ background: '#12121a', borderBottom: '1px solid #2a2a3e' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse"
              style={{ boxShadow: '0 0 8px rgba(239,68,68,0.9)' }}
            />
            <span className="font-bold text-white text-xs tracking-wider uppercase truncate">
              The OneZoo Cage
            </span>
            <span className="hidden sm:inline text-gray-500 text-xs">— March Madness</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid #2a2a3e' }}>
              <button
                onClick={() => setTab('streams')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold transition-all"
                style={{
                  background: tab === 'streams' ? 'rgba(239,68,68,0.15)' : 'transparent',
                  color: tab === 'streams' ? '#f87171' : '#a0a0c0',
                  borderRight: '1px solid #2a2a3e',
                }}
              >
                <Video size={11} />
                <span className="hidden sm:inline">Streams</span>
              </button>
              <button
                onClick={() => setTab('brackets')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold transition-all"
                style={{
                  background: tab === 'brackets' ? 'rgba(245,166,35,0.15)' : 'transparent',
                  color: tab === 'brackets' ? '#fbbf24' : '#a0a0c0',
                }}
              >
                <Trophy size={11} />
                <span className="hidden sm:inline">Brackets</span>
              </button>
            </div>
            <button
              onClick={openAdminPrompt}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'transparent', border: '1px solid #2a2a3e', color: '#a0a0c0' }}
            >
              <Lock size={12} />
              <span className="hidden sm:inline">Admin</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors rounded-lg p-1.5 hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Brackets tab */}
        {tab === 'brackets' && (
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: '#0a1628' }}>
            <AnimalBattle />
          </div>
        )}

        {/* Streams tab */}
        {tab === 'streams' && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden lg:flex-row">
            {/* Video player area */}
            <div className="flex flex-col min-h-0 lg:flex-1">
              {selected ? (
                <div className="flex flex-col" style={{ flex: '0 0 auto' }}>
                  {/* Video container - 16:9 ratio on mobile */}
                  <div
                    style={{ position: 'relative', width: '100%', paddingBottom: playing ? '56.25%' : '56.25%', background: '#000' }}
                  >
                    {playing ? (
                      <iframe
                        ref={iframeRef}
                        key={selected.yt_id}
                        src={embedUrl(selected.yt_id)}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          display: 'block',
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title={selected.title}
                        loading="eager"
                      />
                    ) : (
                      <div
                        style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}
                        onClick={() => setPlaying(true)}
                        className="group"
                      >
                        <img
                          src={thumbUrl(selected.yt_id)}
                          alt={selected.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        <div
                          style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 50%)' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{ background: 'rgba(239,68,68,0.9)', boxShadow: '0 0 50px rgba(239,68,68,0.5)' }}
                          >
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><polygon points="6 3 20 12 6 21 6 3" /></svg>
                          </div>
                        </div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-bold mb-1"
                            style={selected.stream_type === 'live' ? { background: '#ff4444', color: '#fff' } : { background: '#22c55e', color: '#fff' }}
                          >
                            {selected.stream_type === 'live' ? 'LIVE' : 'VIDEO'}
                          </span>
                          <h2 className="text-white font-extrabold text-base sm:text-xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>{selected.title}</h2>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Controls bar */}
                  <div
                    className="flex items-center justify-between px-3 py-2 shrink-0"
                    style={{ background: '#12121a', borderTop: '1px solid #2a2a3e' }}
                  >
                    <div className="min-w-0 mr-3">
                      <div className="text-white font-bold text-sm truncate">{selected.title}</div>
                      <div style={{ color: '#6b6b8a', fontSize: '0.7rem' }}>{selected.stream_type === 'live' ? 'Live Stream' : 'On Demand'}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setPlaying(p => !p)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{ background: playing ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', border: `1px solid ${playing ? '#dc2626' : '#22c55e'}`, color: playing ? '#f87171' : '#86efac' }}
                      >
                        {playing ? 'Stop' : 'Play'}
                      </button>
                      <button
                        onClick={() => copyLink(selected.yt_id)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ background: '#1a1a26', border: '1px solid #2a2a3e', color: '#6b6b8a' }}
                        title="Copy link"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center text-center px-6 py-10"
                  style={{ background: '#0a0a0f' }}
                >
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4"
                    style={{ background: 'rgba(255,68,68,0.12)', border: '1px solid #ff4444', color: '#ff4444', letterSpacing: '1px' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    BROADCASTING
                  </div>
                  <h1 className="font-black mb-2 text-2xl sm:text-3xl" style={{ color: '#e8e8f0' }}>
                    The OneZoo <span style={{ color: '#22c55e' }}>Cage</span>
                  </h1>
                  <p style={{ color: '#6b6b8a', fontSize: '0.88rem' }}>March Madness games, highlights &amp; live events</p>
                  {streams.length > 0 && (
                    <p className="mt-3 text-sm" style={{ color: '#4b4b6b' }}>Select a broadcast below</p>
                  )}
                </div>
              )}

              {/* Mobile: collapsible broadcast list */}
              <div className="lg:hidden flex flex-col flex-1 min-h-0" style={{ borderTop: '1px solid #2a2a3e' }}>
                <button
                  onClick={() => setListOpen(v => !v)}
                  className="flex items-center justify-between px-4 py-3 w-full shrink-0"
                  style={{ background: '#12121a', borderBottom: listOpen ? '1px solid #2a2a3e' : 'none' }}
                >
                  <div className="flex items-center gap-2">
                    <Video size={13} style={{ color: '#6b6b8a' }} />
                    <span className="text-white font-bold text-xs uppercase tracking-wider">Broadcasts</span>
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#86efac' }}
                    >
                      {streams.length}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ color: '#6b6b8a', transform: listOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  />
                </button>

                {listOpen && (
                  <div style={{ overflowY: 'auto', maxHeight: '260px', background: '#0a0a0f' }}>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }} />
                      </div>
                    ) : streams.length === 0 ? (
                      <div className="text-center py-8 px-4">
                        <p className="text-xs" style={{ color: '#6b6b8a' }}>No broadcasts yet. Use Admin to add streams.</p>
                      </div>
                    ) : (
                      streams.map(s => (
                        <div
                          key={s.id}
                          onClick={() => selectStream(s)}
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                          style={{
                            background: selected?.id === s.id ? 'rgba(34,197,94,0.08)' : 'transparent',
                            borderLeft: selected?.id === s.id ? '2px solid #22c55e' : '2px solid transparent',
                            borderBottom: '1px solid #1a1a26',
                          }}
                        >
                          <div className="shrink-0 relative rounded overflow-hidden" style={{ width: 56, height: 36 }}>
                            <img src={thumbUrl(s.yt_id)} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {s.stream_type === 'live' && (
                              <div className="absolute top-0.5 left-0.5">
                                <span className="text-xs font-black px-1 rounded" style={{ background: '#ff4444', color: '#fff', fontSize: '0.55rem', lineHeight: 1.5 }}>LIVE</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold text-xs truncate">{s.title}</div>
                            <div style={{ color: '#6b6b8a', fontSize: '0.65rem' }}>{s.stream_type === 'live' ? 'Live' : 'On Demand'}</div>
                          </div>
                          {selected?.id === s.id && playing && (
                            <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: sidebar broadcast list */}
            <div
              className="hidden lg:flex flex-col"
              style={{ width: 280, minWidth: 280, borderLeft: '1px solid #2a2a3e', overflowY: 'auto' }}
            >
              <div
                className="flex items-center gap-2 px-4 py-3 shrink-0"
                style={{ background: '#12121a', borderBottom: '1px solid #2a2a3e' }}
              >
                <Video size={14} style={{ color: '#6b6b8a' }} />
                <span className="font-bold text-white text-xs uppercase tracking-wider">Broadcasts</span>
                <span
                  className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#86efac' }}
                >
                  {streams.length}
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }} />
                </div>
              ) : streams.length === 0 ? (
                <div className="flex items-center justify-center py-10 px-4 text-center">
                  <div>
                    <Video size={32} className="mx-auto mb-2 opacity-20" style={{ color: '#6b6b8a' }} />
                    <p className="text-xs" style={{ color: '#6b6b8a' }}>No broadcasts yet.<br />Use Admin to add streams.</p>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {streams.map(s => (
                    <div
                      key={s.id}
                      onClick={() => selectStream(s)}
                      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all"
                      style={{
                        background: selected?.id === s.id ? 'rgba(34,197,94,0.08)' : 'transparent',
                        borderLeft: selected?.id === s.id ? '2px solid #22c55e' : '2px solid transparent',
                        borderBottom: '1px solid #1a1a26',
                      }}
                    >
                      <div className="shrink-0 relative rounded overflow-hidden" style={{ width: 56, height: 36 }}>
                        <img src={thumbUrl(s.yt_id)} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {s.stream_type === 'live' && (
                          <div className="absolute top-0.5 left-0.5">
                            <span className="text-xs font-black px-1 rounded" style={{ background: '#ff4444', color: '#fff', fontSize: '0.55rem', lineHeight: 1.5 }}>LIVE</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-xs truncate">{s.title}</div>
                        <div style={{ color: '#6b6b8a', fontSize: '0.65rem' }}>{s.stream_type === 'live' ? 'Live' : 'On Demand'}</div>
                      </div>
                      {selected?.id === s.id && playing && (
                        <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-sm font-semibold z-[60] pointer-events-none"
          style={{ background: '#1e1e2e', border: '1px solid #2a2a3e', color: '#e8e8f0' }}
        >
          {toast}
        </div>
      )}

      {/* Password modal */}
      {pwOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-7 relative" style={{ background: '#1a1a26', border: '1px solid #2a2a3e' }}>
            <button onClick={() => setPwOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={18} /></button>
            <Lock size={24} className="mb-3" style={{ color: '#22c55e' }} />
            <h2 className="text-white font-extrabold text-lg mb-1">Admin</h2>
            <p style={{ color: '#6b6b8a', fontSize: '0.82rem', marginBottom: '18px' }}>Enter the password to manage broadcasts.</p>
            <form onSubmit={checkPw} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#6b6b8a' }}>Password</label>
                <input
                  type="password"
                  value={pw}
                  onChange={e => { setPw(e.target.value); setPwError(false); }}
                  autoFocus
                  placeholder="Enter password..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white"
                  style={{ background: '#0a0a0f', border: pwError ? '1px solid #ff4444' : '1px solid #2a2a3e', outline: 'none' }}
                />
                {pwError && <p className="text-red-400 text-xs mt-1">Incorrect password.</p>}
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-white font-bold text-sm transition-all"
                style={{ background: '#22c55e' }}
              >
                Unlock
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin modal */}
      {adminOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden relative flex flex-col" style={{ background: '#1a1a26', border: '1px solid #2a2a3e', maxHeight: '90dvh' }}>
            <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid #2a2a3e' }}>
              <div>
                <h2 className="text-white font-extrabold text-lg">Manage Broadcasts</h2>
                <p style={{ color: '#6b6b8a', fontSize: '0.78rem' }}>Add YouTube links to The OneZoo Cage.</p>
              </div>
              <button onClick={() => setAdminOpen(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <form onSubmit={addStream} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#6b6b8a' }}>Stream Title</label>
                  <input
                    type="text"
                    value={addTitle}
                    onChange={e => setAddTitle(e.target.value)}
                    placeholder="e.g. NCAA Tournament - Elite Eight"
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white"
                    style={{ background: '#0a0a0f', border: '1px solid #2a2a3e', outline: 'none' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#6b6b8a' }}>YouTube URL</label>
                  <input
                    type="text"
                    value={addUrl}
                    onChange={e => setAddUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white"
                    style={{ background: '#0a0a0f', border: '1px solid #2a2a3e', outline: 'none' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#6b6b8a' }}>Type</label>
                  <div className="flex gap-2">
                    {(['video', 'live'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAddType(t)}
                        className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                        style={addType === t
                          ? { background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', color: '#86efac' }
                          : { background: '#0a0a0f', border: '1px solid #2a2a3e', color: '#6b6b8a' }}
                      >
                        {t === 'video' ? 'Video' : 'Livestream'}
                      </button>
                    ))}
                  </div>
                </div>
                {addError && <p className="text-red-400 text-xs">{addError}</p>}
                <button
                  type="submit"
                  disabled={adding}
                  className="w-full py-2.5 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ background: '#22c55e' }}
                >
                  <Plus size={16} />
                  {adding ? 'Adding...' : 'Add Broadcast'}
                </button>
              </form>

              <div style={{ borderTop: '1px solid #2a2a3e', paddingTop: '16px' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#6b6b8a' }}>Current Broadcasts</div>
                {streams.length === 0 ? (
                  <div className="text-center py-4 text-xs" style={{ color: '#6b6b8a' }}>No broadcasts yet</div>
                ) : (
                  <div className="space-y-2">
                    {streams.map(s => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg gap-3"
                        style={{ background: '#0a0a0f', border: '1px solid #2a2a3e' }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="shrink-0 px-1.5 py-0.5 rounded text-xs font-bold"
                            style={s.stream_type === 'live'
                              ? { background: 'rgba(255,68,68,0.2)', color: '#ff4444' }
                              : { background: 'rgba(34,197,94,0.15)', color: '#86efac' }}
                          >
                            {s.stream_type === 'live' ? 'LIVE' : 'VID'}
                          </span>
                          <span className="text-white text-sm font-semibold truncate">{s.title}</span>
                        </div>
                        <button
                          onClick={() => deleteStream(s.id)}
                          className="shrink-0 text-gray-500 hover:text-red-400 transition-colors p-1 rounded"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
