import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface BracketGameProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Team {
  seed: number;
  emoji: string;
  name: string;
}

interface Matchup {
  top: Team | null;
  bot: Team | null;
  winner: Team | null;
}

interface RegionBracketState {
  [regionId: string]: Matchup[][];
}

interface FFState {
  semi: [Matchup, Matchup];
  final: Matchup;
  champion: Team | null;
}

interface BracketData {
  id: string;
  name: string;
  bState: RegionBracketState;
  ffState: FFState;
  created: number;
  updated: number;
}

interface UserRecord {
  password: string;
  email: string;
  created: number;
}

const regionData: Record<string, { label: string; teams: Team[] }> = {
  savanna: {
    label: '🌍 Savanna',
    teams: [
      { seed:1, emoji:'😈', name:'Tasmanian Devil' }, { seed:16, emoji:'🕊️', name:'Dove' },
      { seed:8, emoji:'🦌', name:'White-tailed Deer' }, { seed:9, emoji:'🦎', name:'Horned Lizard' },
      { seed:5, emoji:'🦅', name:'Red Hawk' }, { seed:12, emoji:'🐆', name:'Panther' },
      { seed:4, emoji:'🐦', name:'Jayhawk' }, { seed:13, emoji:'🐴', name:'Horse' },
      { seed:6, emoji:'🐦', name:'Cardinal' }, { seed:11, emoji:'🐂', name:'Bull' },
      { seed:3, emoji:'🦁', name:'Lion' }, { seed:14, emoji:'🦬', name:'Bison' },
      { seed:7, emoji:'🐻', name:'Bear' }, { seed:10, emoji:'🐴', name:'Stallion' },
      { seed:2, emoji:'🐺', name:'Husky' }, { seed:15, emoji:'🐴', name:'Warhorse' },
    ],
  },
  ocean: {
    label: '🌊 Ocean',
    teams: [
      { seed:1, emoji:'🐊', name:'Alligator' }, { seed:16, emoji:'🦅', name:'Hawk' },
      { seed:8, emoji:'🐯', name:'Tiger' }, { seed:9, emoji:'🦅', name:'Hawk' },
      { seed:5, emoji:'🦭', name:'Sea Lion' }, { seed:12, emoji:'🐂', name:'Longhorn' },
      { seed:4, emoji:'🐕', name:'Prairie Dog' }, { seed:13, emoji:'🐴', name:'Horse' },
      { seed:6, emoji:'🐏', name:'Ram' }, { seed:11, emoji:'🐏', name:'Ram' },
      { seed:3, emoji:'🦬', name:'Bison' }, { seed:14, emoji:'🦆', name:'Duck' },
      { seed:7, emoji:'🐕', name:'Irish Wolfhound' }, { seed:10, emoji:'🐕', name:'Collie' },
      { seed:2, emoji:'🦁', name:'Cougar' }, { seed:15, emoji:'🦡', name:'Wolverine' },
    ],
  },
  forest: {
    label: '🌲 Forest',
    teams: [
      { seed:1, emoji:'🐱', name:'Wildcat' }, { seed:16, emoji:'🦈', name:'Shark' },
      { seed:8, emoji:'🐱', name:'Wildcat' }, { seed:9, emoji:'🐂', name:'Bull' },
      { seed:5, emoji:'🦡', name:'Badger' }, { seed:12, emoji:'🐆', name:'Panther' },
      { seed:4, emoji:'🐗', name:'Wild Boar' }, { seed:13, emoji:'🦅', name:'Hawk' },
      { seed:6, emoji:'🦁', name:'Cougar' }, { seed:11, emoji:'🐂', name:'Longhorn' },
      { seed:3, emoji:'🐕', name:'Bulldog' }, { seed:14, emoji:'🦉', name:'Owl' },
      { seed:7, emoji:'🐦', name:'Ibis' }, { seed:10, emoji:'🐯', name:'Tiger' },
      { seed:2, emoji:'🦡', name:'Badger' }, { seed:15, emoji:'🦁', name:'Lion' },
    ],
  },
  apex: {
    label: '🏔️ Apex',
    teams: [
      { seed:1, emoji:'🦡', name:'Wolverine' }, { seed:16, emoji:'🐕', name:'Retriever' },
      { seed:8, emoji:'🐕', name:'Bulldog' }, { seed:9, emoji:'🦈', name:'Goblin Shark' },
      { seed:5, emoji:'🦊', name:'Red Fox' }, { seed:12, emoji:'🦘', name:'Kangaroo' },
      { seed:4, emoji:'🐘', name:'Elephant' }, { seed:13, emoji:'🦁', name:'Lion' },
      { seed:6, emoji:'🐕', name:'Hound Dog' }, { seed:11, emoji:'🐴', name:'Mustang' },
      { seed:3, emoji:'🐴', name:'Horse' }, { seed:14, emoji:'🐺', name:'Wolf' },
      { seed:7, emoji:'🐱', name:'Wildcat' }, { seed:10, emoji:'🐴', name:'Horse' },
      { seed:2, emoji:'🦅', name:'Eagle' }, { seed:15, emoji:'🐯', name:'Tiger' },
    ],
  },
};

const regionIds = ['savanna', 'ocean', 'forest', 'apex'] as const;
type RegionId = typeof regionIds[number];
const roundNames = ['Round of 64', 'Round of 32', 'Sweet 16', 'Elite 8'];

const PLAY_IN_GAMES = [
  { label: 'Play-In 1', region: 'Savanna', e1:'🕊️', n1:'Dove', e2:'🐴', n2:'Warhorse', note:'→ faces #1 Tasmanian Devil' },
  { label: 'Play-In 2', region: 'Ocean', e1:'🦡', n1:'Wolverine', e2:'🦆', n2:'Duck', note:'→ faces #1 Alligator' },
  { label: 'Play-In 3', region: 'Forest', e1:'🦁', n1:'Lion', e2:'🐆', n2:'Panther', note:'→ faces #6 Cougar' },
  { label: 'Play-In 4', region: 'Apex', e1:'🐴', n1:'Horse', e2:'🐯', n2:'Tiger', note:'→ faces #6 Hound Dog' },
];

function freshBracketState(): RegionBracketState {
  const bs: RegionBracketState = {};
  regionIds.forEach(rid => {
    const teams = regionData[rid].teams;
    bs[rid] = [
      Array.from({ length: 8 }, (_, i) => ({ top: { ...teams[i * 2] }, bot: { ...teams[i * 2 + 1] }, winner: null })),
      Array.from({ length: 4 }, () => ({ top: null, bot: null, winner: null })),
      Array.from({ length: 2 }, () => ({ top: null, bot: null, winner: null })),
      [{ top: null, bot: null, winner: null }],
    ];
  });
  return bs;
}

function freshFFState(): FFState {
  return {
    semi: [{ top: null, bot: null, winner: null }, { top: null, bot: null, winner: null }],
    final: { top: null, bot: null, winner: null },
    champion: null,
  };
}

function deepClone<T>(o: T): T { return JSON.parse(JSON.stringify(o)); }

const USERS_KEY = 'onezoo:users';
const bracketsKey = (u: string) => `onezoo:brackets:${u}`;

function getUsers(): Record<string, UserRecord> {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch { return {}; }
}
function saveUsers(u: Record<string, UserRecord>) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function getBrackets(username: string): BracketData[] {
  try { return JSON.parse(localStorage.getItem(bracketsKey(username)) || '[]'); } catch { return []; }
}
function saveBrackets(username: string, brackets: BracketData[]) {
  localStorage.setItem(bracketsKey(username), JSON.stringify(brackets));
}

function TeamRow({ team, winner, onClick }: { team: Team | null; winner: Team | null; onClick?: () => void }) {
  const isEmpty = !team;
  const isWinner = team && winner && winner.name === team.name;
  const isElim = team && winner && winner.name !== team.name;

  return (
    <div
      onClick={!isEmpty && !winner && onClick ? onClick : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        background: isWinner ? '#1a3a20' : '#1a2e4a',
        border: `1px solid ${isWinner ? '#4caf50' : '#2a4a6a'}`,
        borderRadius: 4, padding: '4px 7px', margin: '1px 0',
        fontSize: '0.66em', cursor: (!isEmpty && !winner && onClick) ? 'pointer' : 'default',
        opacity: isElim ? 0.32 : 1, minHeight: 26,
        fontWeight: isWinner ? 'bold' : 'normal',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!isEmpty && !winner && onClick) (e.currentTarget as HTMLDivElement).style.borderColor = '#f5a623'; }}
      onMouseLeave={e => { if (!isEmpty && !winner && onClick) (e.currentTarget as HTMLDivElement).style.borderColor = isWinner ? '#4caf50' : '#2a4a6a'; }}
    >
      {isEmpty ? (
        <span style={{ color: '#445', flex: 1 }}>TBD</span>
      ) : (
        <>
          <span style={{ fontSize: '0.75em', color: '#778', minWidth: 16, marginRight: 4, fontWeight: 'bold' }}>{team.seed}</span>
          <span style={{ marginRight: 4, fontSize: '1.1em' }}>{team.emoji}</span>
          <span style={{ flex: 1, color: '#dde', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</span>
        </>
      )}
    </div>
  );
}

export function BracketGame({ isOpen, onClose }: BracketGameProps) {
  const [screen, setScreen] = useState<'dash' | 'editor'>('dash');
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    try { return sessionStorage.getItem('onezoo_user'); } catch { return null; }
  });
  const [brackets, setBrackets] = useState<BracketData[]>([]);
  const [bState, setBState] = useState<RegionBracketState>(freshBracketState());
  const [ffState, setFFState] = useState<FFState>(freshFFState());
  const [activeBracket, setActiveBracket] = useState<BracketData | null>(null);
  const [activeTab, setActiveTab] = useState<RegionId | 'finalfour'>('savanna');

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [signupUser, setSignupUser] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupErr, setSignupErr] = useState('');
  const [newBracketName, setNewBracketName] = useState('');
  const [modal, setModal] = useState<'login' | 'signup' | 'new' | null>(null);
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }, []);

  useEffect(() => {
    if (currentUser) setBrackets(getBrackets(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (!isOpen) { setModal(null); setScreen('dash'); }
  }, [isOpen]);

  function doLogin() {
    const users = getUsers();
    if (!loginUser.trim() || !loginPass) { setLoginErr('Please fill all fields.'); return; }
    if (!users[loginUser] || users[loginUser].password !== btoa(loginPass)) { setLoginErr('Invalid username or password.'); return; }
    sessionStorage.setItem('onezoo_user', loginUser);
    setCurrentUser(loginUser);
    setBrackets(getBrackets(loginUser));
    setModal(null); setLoginErr(''); setLoginUser(''); setLoginPass('');
    showToast('Welcome back, ' + loginUser + '! 🦁');
  }

  function doSignup() {
    const users = getUsers();
    if (!signupUser.trim() || !signupEmail.trim() || !signupPass) { setSignupErr('Please fill all fields.'); return; }
    if (signupPass.length < 6) { setSignupErr('Password must be at least 6 characters.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(signupUser)) { setSignupErr('Username: letters, numbers, underscores only.'); return; }
    if (users[signupUser]) { setSignupErr('Username already taken.'); return; }
    users[signupUser] = { email: signupEmail, password: btoa(signupPass), created: Date.now() };
    saveUsers(users);
    sessionStorage.setItem('onezoo_user', signupUser);
    setCurrentUser(signupUser);
    setBrackets([]);
    setModal(null); setSignupErr(''); setSignupUser(''); setSignupEmail(''); setSignupPass('');
    showToast('Account created! Welcome, ' + signupUser + ' 🎉');
  }

  function doLogout() {
    sessionStorage.removeItem('onezoo_user');
    setCurrentUser(null); setBrackets([]); setScreen('dash');
    showToast('Logged out.');
  }

  function createNewBracket() {
    if (!currentUser) return;
    const name = newBracketName.trim() || 'My Bracket';
    const id = 'bkt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const bs = freshBracketState();
    const ffs = freshFFState();
    const nb: BracketData = { id, name, bState: bs, ffState: ffs, created: Date.now(), updated: Date.now() };
    const updated = [nb, ...brackets];
    saveBrackets(currentUser, updated);
    setBrackets(updated);
    setActiveBracket(nb);
    setBState(deepClone(bs));
    setFFState(deepClone(ffs));
    setActiveTab('savanna');
    setModal(null); setNewBracketName('');
    setScreen('editor');
    showToast('Bracket created! 🏀');
  }

  function openBracket(b: BracketData) {
    setActiveBracket(b);
    setBState(deepClone(b.bState));
    setFFState(deepClone(b.ffState));
    setActiveTab('savanna');
    setScreen('editor');
  }

  function deleteBracket(id: string) {
    if (!currentUser) return;
    const updated = brackets.filter(b => b.id !== id);
    saveBrackets(currentUser, updated);
    setBrackets(updated);
    showToast('Bracket deleted.');
  }

  function saveBracket() {
    if (!currentUser || !activeBracket) return;
    const updated = brackets.map(b => b.id === activeBracket.id ? { ...b, bState, ffState, updated: Date.now() } : b);
    saveBrackets(currentUser, updated);
    setBrackets(updated);
    showToast('Saved! 💾');
  }

  function pickWinner(rid: string, round: number, mi: number, slot: 'top' | 'bot') {
    const newBState = deepClone(bState);
    const mu = newBState[rid][round][mi];
    if (!mu.top || !mu.bot) return;
    const w = { ...(slot === 'top' ? mu.top : mu.bot) };
    mu.winner = w;

    if (round < 3) {
      const nmi = Math.floor(mi / 2);
      const ns: 'top' | 'bot' = mi % 2 === 0 ? 'top' : 'bot';
      newBState[rid][round + 1][nmi][ns] = w;
      for (let rr = round + 1; rr < 4; rr++) {
        const mmii = Math.floor(nmi / Math.pow(2, rr - round - 1));
        if (newBState[rid][rr][mmii]) {
          const prevW = newBState[rid][rr][mmii].winner;
          if (prevW && prevW.name !== w.name) { newBState[rid][rr][mmii].winner = null; }
        }
      }
    }

    const newFFState = deepClone(ffState);
    if (round === 3) {
      const fi = regionIds.indexOf(rid as RegionId);
      const slot2: 'top' | 'bot' = fi === 0 || fi === 2 ? 'top' : 'bot';
      const semiIdx = fi < 2 ? 0 : 1;
      newFFState.semi[semiIdx][slot2] = w;
      if (newFFState.semi[semiIdx].winner) {
        newFFState.semi[semiIdx].winner = null;
        newFFState.final.top = null; newFFState.final.bot = null;
        newFFState.final.winner = null; newFFState.champion = null;
      }
    }
    setBState(newBState);
    setFFState(newFFState);
  }

  function pickFFWinner(type: 'semi' | 'final', slot: 'top' | 'bot', idx: number) {
    const newFF = deepClone(ffState);
    if (type === 'semi') {
      const mu = newFF.semi[idx];
      if (!mu.top || !mu.bot) return;
      const w = { ...(slot === 'top' ? mu.top : mu.bot) };
      mu.winner = w;
      if (idx === 0) newFF.final.top = w;
      else newFF.final.bot = w;
      newFF.final.winner = null; newFF.champion = null;
    } else {
      const mu = newFF.final;
      if (!mu.top || !mu.bot) return;
      const w = { ...(slot === 'top' ? mu.top : mu.bot) };
      mu.winner = w; newFF.champion = w;
    }
    setFFState(newFF);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', margin: '4px 0 10px',
    background: '#0d1e34', border: '1px solid #2a4a6a', borderRadius: 7,
    color: '#fff', fontSize: '16px', outline: 'none',
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-stretch"
      style={{ zIndex: 200, background: 'rgba(0,0,0,0.97)' }}
    >
      <div className="relative w-full flex flex-col" style={{ background: '#0a1628', height: '100vh', overflow: 'hidden' }}>
        <div
          className="absolute top-0 left-0 right-0 h-px z-10"
          style={{ background: 'linear-gradient(90deg, transparent 0%, #f5a623 30%, #fbbf24 50%, #f5a623 70%, transparent 100%)' }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0 flex-wrap gap-2"
          style={{ background: 'linear-gradient(135deg, #1a3a5c, #0a1628)', borderBottom: '2px solid rgba(245,166,35,0.3)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🏆</span>
            <span className="font-black text-sm tracking-widest uppercase" style={{ color: '#f5a623' }}>OneZoo March Madness</span>
          </div>
          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', color: '#fbbf24' }}>
                  👤 {currentUser}
                </span>
                <button onClick={doLogout} className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all" style={{ background: 'transparent', border: '1px solid #2a4a6a', color: '#a0a0c0' }}>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setModal('login')} className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all" style={{ background: 'transparent', border: '1px solid rgba(245,166,35,0.35)', color: '#f5a623' }}>
                  Log In
                </button>
                <button onClick={() => setModal('signup')} className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all" style={{ background: '#f5a623', border: 'none', color: '#000' }}>
                  Sign Up
                </button>
              </>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-lg p-1.5 hover:bg-white/10">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Dashboard */}
        {screen === 'dash' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-bold text-base" style={{ color: '#f5a623' }}>
                {currentUser ? `${currentUser}'s Brackets` : 'My Brackets'}
              </h2>
              {currentUser && (
                <button
                  onClick={() => setModal('new')}
                  className="text-sm px-4 py-2 rounded-xl font-bold transition-all"
                  style={{ background: '#f5a623', color: '#000', border: 'none' }}
                >
                  + New Bracket
                </button>
              )}
            </div>

            {!currentUser ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏆</div>
                <p className="mb-5 text-sm" style={{ color: '#778' }}>Sign in to create and save your brackets!</p>
                <button onClick={() => setModal('login')} className="px-6 py-2.5 rounded-xl font-bold text-sm" style={{ background: '#f5a623', color: '#000' }}>
                  Get Started
                </button>
              </div>
            ) : brackets.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏀</div>
                <p className="text-sm" style={{ color: '#778' }}>No brackets yet. Create your first!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {brackets.map((b, i) => (
                  <div
                    key={b.id}
                    onClick={() => openBracket(b)}
                    className="rounded-xl p-4 cursor-pointer transition-all"
                    style={{ background: '#112240', border: '2px solid #1e3a5c' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#f5a623'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1e3a5c'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                  >
                    <h3 className="font-bold text-white text-sm mb-1">📋 {b.name}</h3>
                    <p className="text-xs mb-2" style={{ color: '#556' }}>Updated {new Date(b.updated).toLocaleDateString()}</p>
                    <p className="text-sm mb-3" style={{ color: '#f5a623' }}>
                      🏆 {b.ffState?.champion ? `${b.ffState.champion.emoji} ${b.ffState.champion.name}` : 'No champion yet'}
                    </p>
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openBracket(b)} className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all" style={{ background: 'transparent', border: '1px solid rgba(245,166,35,0.4)', color: '#f5a623' }}>
                        Open
                      </button>
                      <button onClick={() => deleteBracket(b.id)} className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all" style={{ background: 'transparent', border: '1px solid #c0392b', color: '#e74c3c' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Editor */}
        {screen === 'editor' && (
          <div className="flex flex-col" style={{ flex: 1, minHeight: 0 }}>
            {/* Editor header */}
            <div className="flex items-center gap-3 px-4 py-2.5 shrink-0 flex-wrap gap-y-2" style={{ background: '#0d1e34', borderBottom: '1px solid #1e3a5c' }}>
              <button onClick={() => setScreen('dash')} className="text-xs px-3 py-1.5 rounded-lg font-bold" style={{ background: 'transparent', border: '1px solid rgba(245,166,35,0.4)', color: '#f5a623' }}>
                ← Dashboard
              </button>
              <span className="font-bold text-white text-sm flex-1 truncate">{activeBracket?.name}</span>
              <button onClick={saveBracket} className="text-xs px-3 py-1.5 rounded-lg font-bold" style={{ background: '#27ae60', color: '#fff', border: 'none' }}>
                💾 Save
              </button>
            </div>

            {/* Play-in */}
            <div className="shrink-0 px-4 py-2.5" style={{ background: '#0e1f35', borderBottom: '2px solid rgba(245,166,35,0.35)' }}>
              <div className="text-center text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#f5a623' }}>
                🎟️ First Four — Play-In Games
              </div>
              <div className="flex justify-center gap-3 flex-wrap">
                {PLAY_IN_GAMES.map(g => (
                  <div key={g.label} className="rounded-lg p-2.5 text-xs" style={{ background: '#1a2e4a', border: '1px solid #2a4a6a', minWidth: 160 }}>
                    <div className="font-bold mb-1" style={{ color: '#f5a623', fontSize: '0.7em', letterSpacing: '1px' }}>{g.label} · {g.region}</div>
                    <div className="flex items-center gap-1">{g.e1} {g.n1}</div>
                    <div className="text-center text-xs my-0.5" style={{ color: '#445' }}>VS</div>
                    <div className="flex items-center gap-1">{g.e2} {g.n2}</div>
                    <div className="mt-1" style={{ color: '#556', fontSize: '0.68em' }}>{g.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-4 py-2 shrink-0 flex-wrap" style={{ background: '#0d1e34', borderBottom: '1px solid #1e3a5c' }}>
              {(regionIds as readonly string[]).map(rid => (
                <button
                  key={rid}
                  onClick={() => setActiveTab(rid as RegionId)}
                  className="text-xs px-3 py-1.5 rounded-2xl font-bold transition-all"
                  style={{
                    background: activeTab === rid ? '#f5a623' : '#1a2e4a',
                    color: activeTab === rid ? '#000' : '#aac',
                    border: activeTab === rid ? 'none' : '1px solid #2a4a6a',
                  }}
                >
                  {regionData[rid].label}
                </button>
              ))}
              <button
                onClick={() => setActiveTab('finalfour')}
                className="text-xs px-3 py-1.5 rounded-2xl font-bold transition-all"
                style={{
                  background: activeTab === 'finalfour' ? '#f5a623' : '#1a2e4a',
                  color: activeTab === 'finalfour' ? '#000' : '#aac',
                  border: activeTab === 'finalfour' ? 'none' : '1px solid #2a4a6a',
                }}
              >
                🏆 Final Four
              </button>
            </div>

            {/* Bracket area */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {activeTab !== 'finalfour' && (
                <div style={{ padding: 14, overflowX: 'auto' }}>
                  <div className="font-bold text-center text-xs tracking-widest uppercase mb-3 py-2 rounded-lg" style={{ color: '#f5a623', background: 'rgba(245,166,35,0.1)' }}>
                    {regionData[activeTab as RegionId].label} Region
                  </div>
                  <div style={{ display: 'flex', gap: 5, minWidth: 700 }}>
                    {(bState[activeTab] || []).map((roundMatchups, round) => (
                      <div key={round} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                        <div className="text-center text-xs mb-1.5" style={{ color: '#556', letterSpacing: '0.08em', fontSize: '0.58em', textTransform: 'uppercase' }}>
                          {roundNames[round]}
                        </div>
                        {roundMatchups.map((mu, mi) => (
                          <div key={mi} style={{ margin: '4px 0' }}>
                            <TeamRow team={mu.top} winner={mu.winner} onClick={() => pickWinner(activeTab, round, mi, 'top')} />
                            <TeamRow team={mu.bot} winner={mu.winner} onClick={() => pickWinner(activeTab, round, mi, 'bot')} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'finalfour' && (
                <div style={{ padding: 20, overflowX: 'auto' }}>
                  <div className="font-bold text-center text-base tracking-widest uppercase mb-5" style={{ color: '#f5a623' }}>
                    🏆 Final Four + Championship
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 24, minWidth: 700, flexWrap: 'wrap' }}>
                    {/* Left semi */}
                    <div>
                      <div className="text-xs text-center mb-2" style={{ color: '#556', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Final Four — Savanna vs Ocean</div>
                      <div>
                        <TeamRow team={ffState.semi[0].top} winner={ffState.semi[0].winner} onClick={() => pickFFWinner('semi', 'top', 0)} />
                        <TeamRow team={ffState.semi[0].bot} winner={ffState.semi[0].winner} onClick={() => pickFFWinner('semi', 'bot', 0)} />
                      </div>
                    </div>

                    {/* Center championship */}
                    <div className="text-center">
                      <div className="text-xs mb-2" style={{ color: '#556', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Championship</div>
                      <div>
                        <TeamRow team={ffState.final.top} winner={ffState.final.winner} onClick={() => pickFFWinner('final', 'top', -1)} />
                        <TeamRow team={ffState.final.bot} winner={ffState.final.winner} onClick={() => pickFFWinner('final', 'bot', -1)} />
                      </div>
                      <div className="rounded-xl p-4 mt-4 text-center" style={{ background: 'linear-gradient(135deg, #4a3000, #2a1a00)', border: '2px solid #f5a623' }}>
                        <div className="text-2xl mb-1">🏆</div>
                        <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#f5a623' }}>OneZoo Champion</div>
                        <div className="font-bold text-base" style={{ color: '#fbbf24' }}>
                          {ffState.champion ? `${ffState.champion.emoji} ${ffState.champion.name}` : '?'}
                        </div>
                      </div>
                    </div>

                    {/* Right semi */}
                    <div>
                      <div className="text-xs text-center mb-2" style={{ color: '#556', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Final Four — Forest vs Apex</div>
                      <div>
                        <TeamRow team={ffState.semi[1].top} winner={ffState.semi[1].winner} onClick={() => pickFFWinner('semi', 'top', 1)} />
                        <TeamRow team={ffState.semi[1].bot} winner={ffState.semi[1].winner} onClick={() => pickFFWinner('semi', 'bot', 1)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-5 right-5 px-4 py-2.5 rounded-xl text-sm font-semibold z-50 pointer-events-none" style={{ background: '#1a3a20', border: '1px solid #4caf50', color: '#fff' }}>
            {toast}
          </div>
        )}

        {/* Login modal */}
        {modal === 'login' && (
          <div className="absolute inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
            <div className="w-full max-w-sm rounded-2xl p-7 relative" style={{ background: '#112240', border: '2px solid #2a4a6a' }}>
              <button type="button" onClick={() => setModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={18} /></button>
              <div className="text-3xl mb-3">🔐</div>
              <h2 className="font-extrabold text-lg mb-1 text-white">Log In</h2>
              <p className="text-xs mb-4" style={{ color: '#778' }}>Welcome back to OneZoo Brackets</p>
              <form onSubmit={e => { e.preventDefault(); doLogin(); }}>
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#778' }}>Username</label>
                <input style={inputStyle} type="text" value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Your username" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="next" />
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#778' }}>Password</label>
                <input style={inputStyle} type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Enter password" autoComplete="current-password" enterKeyHint="go" />
                {loginErr && <p className="text-red-400 text-xs mb-2">{loginErr}</p>}
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ background: 'transparent', border: '1px solid #2a4a6a', color: '#aac' }}>Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ background: '#f5a623', color: '#000', border: 'none' }}>Log In</button>
                </div>
              </form>
              <p className="text-center mt-3 text-xs" style={{ color: '#aac' }}>
                No account? <span className="cursor-pointer" style={{ color: '#f5a623' }} onClick={() => setModal('signup')}>Sign Up</span>
              </p>
            </div>
          </div>
        )}

        {/* Signup modal */}
        {modal === 'signup' && (
          <div className="absolute inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
            <div className="w-full max-w-sm rounded-2xl p-7 relative" style={{ background: '#112240', border: '2px solid #2a4a6a' }}>
              <button type="button" onClick={() => setModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={18} /></button>
              <div className="text-3xl mb-3">🦁</div>
              <h2 className="font-extrabold text-lg mb-1 text-white">Create Account</h2>
              <form onSubmit={e => { e.preventDefault(); doSignup(); }}>
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#778' }}>Username</label>
                <input style={inputStyle} type="text" value={signupUser} onChange={e => setSignupUser(e.target.value)} placeholder="Choose a username" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="next" />
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#778' }}>Email</label>
                <input style={inputStyle} type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" autoCapitalize="none" enterKeyHint="next" />
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#778' }}>Password</label>
                <input style={inputStyle} type="password" value={signupPass} onChange={e => setSignupPass(e.target.value)} placeholder="Min 6 characters" autoComplete="new-password" enterKeyHint="go" />
                {signupErr && <p className="text-red-400 text-xs mb-2">{signupErr}</p>}
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ background: 'transparent', border: '1px solid #2a4a6a', color: '#aac' }}>Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ background: '#f5a623', color: '#000', border: 'none' }}>Create Account</button>
                </div>
              </form>
              <p className="text-center mt-3 text-xs" style={{ color: '#aac' }}>
                Have an account? <span className="cursor-pointer" style={{ color: '#f5a623' }} onClick={() => setModal('login')}>Log In</span>
              </p>
            </div>
          </div>
        )}

        {/* New bracket modal */}
        {modal === 'new' && (
          <div className="absolute inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
            <div className="w-full max-w-sm rounded-2xl p-7 relative" style={{ background: '#112240', border: '2px solid #2a4a6a' }}>
              <button type="button" onClick={() => setModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={18} /></button>
              <div className="text-3xl mb-3">+</div>
              <h2 className="font-extrabold text-lg mb-1 text-white">New Bracket</h2>
              <form onSubmit={e => { e.preventDefault(); createNewBracket(); }}>
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#778' }}>Bracket Name</label>
                <input
                  style={inputStyle} type="text" value={newBracketName}
                  onChange={e => setNewBracketName(e.target.value)}
                  placeholder="e.g. My Championship Pick"
                  maxLength={40}
                  autoComplete="off"
                  enterKeyHint="done"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ background: 'transparent', border: '1px solid #2a4a6a', color: '#aac' }}>Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ background: '#f5a623', color: '#000', border: 'none' }}>Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
