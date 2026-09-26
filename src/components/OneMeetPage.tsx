import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Check, MapPin, Star, Clock, Users, Shield, MessageCircle,
  ChevronRight, Sparkles, Coffee, Waves, Music, Dumbbell, TreePine,
  CreditCard, Heart, Zap, Lock, Flag, X, ChevronDown, LogOut, Send, Mic
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { AuthModal } from './AuthModal';

interface Props {
  onBack: () => void;
}

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  forest: '#1a3d2b',
  forestMid: '#2a5a3e',
  forestLight: '#3d7a55',
  cream: '#f5f0e8',
  creamDark: '#ede5d6',
  coral: '#e07c5e',
  coralLight: '#f09a82',
  text: '#1c2e22',
  textMuted: '#5a7062',
  white: '#ffffff',
};

// ── Mock data ──────────────────────────────────────────────────────────────
const EXPERIENCES = [
  {
    tier: 'Chill',
    icon: Coffee,
    color: C.forestLight,
    bg: '#eaf3ed',
    items: [
      { name: 'Coffee & Conversation', location: 'Local Café', savings: '$8', tag: 'Most Popular' },
      { name: 'Artisan Dessert Bar', location: 'City Centre', savings: '$10', tag: null },
      { name: 'Bookstore Afternoon', location: 'Indie Books', savings: '$5', tag: null },
      { name: 'Scenic Park Walk', location: 'Nature Trail', savings: 'Free', tag: 'No Cost' },
    ],
  },
  {
    tier: 'Explore',
    icon: Waves,
    color: '#2e6b8a',
    bg: '#e6f2f8',
    items: [
      { name: 'Aquarium Visit', location: 'Downtown', savings: '$18', tag: 'Match Ready' },
      { name: 'City Zoo Day', location: 'OneZoo Partner', savings: '$22', tag: 'OneZoo Deal' },
      { name: 'Art Museum', location: 'Cultural District', savings: '$15', tag: null },
      { name: 'Mini Golf', location: 'Eastside', savings: '$12', tag: null },
    ],
  },
  {
    tier: 'Wellness',
    icon: Dumbbell,
    color: '#7a5c3d',
    bg: '#f5ede4',
    items: [
      { name: 'Couples Massage', location: 'Serenity Spa', savings: '$40', tag: 'Best Value' },
      { name: 'Yoga Class for Two', location: 'Studio Sol', savings: '$20', tag: null },
      { name: 'Meditation Session', location: 'Mindful Space', savings: '$15', tag: null },
      { name: 'Spa Day Pass', location: 'Urban Retreat', savings: '$55', tag: null },
    ],
  },
  {
    tier: 'Premium',
    icon: Music,
    color: C.coral,
    bg: '#faf0ec',
    items: [
      { name: 'Live Concert', location: 'City Arena', savings: '$60', tag: 'Hot' },
      { name: 'Sports Game', location: 'Stadium', savings: '$80', tag: null },
      { name: 'Weekend Trip', location: 'Nearby City', savings: '$120', tag: null },
      { name: 'Private Chef Dinner', location: 'Exclusive', savings: '$95', tag: 'Premium' },
    ],
  },
];

const MATCH = {
  name: 'Jordan M.',
  initial: 'J',
  score: 94,
  interests: ['Hiking', 'Jazz', 'Art Museums', 'Coffee'],
  time: 'Weekend afternoons',
  activity: 'City Zoo Day',
  distance: '2.4 mi away',
  verified: true,
};

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9,
    desc: 'Start exploring local deals with limited matches.',
    features: [
      'Access to Chill & Explore deals',
      '2 matches per month',
      'Basic profile',
      'Public venue recommendations',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 24,
    desc: 'One included experience + unlimited matching.',
    features: [
      '1 included experience per month',
      'Unlimited matches',
      'All experience tiers',
      'Verified profile badge',
      'Temporary chat rooms',
    ],
    cta: 'Join Plus',
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49,
    desc: 'Priority access to premium events and exclusive deals.',
    features: [
      'Everything in Plus',
      '2 included experiences/month',
      'Premium & travel experiences',
      'Priority matching',
      'Dedicated support',
    ],
    cta: 'Go Premium',
    highlight: false,
  },
];

const TRUST = [
  { icon: Shield, title: 'Verified Profiles', body: 'Every member goes through ID verification before matching.' },
  { icon: MapPin, title: 'Public Venues Only', body: 'We only suggest well-known, public venues for your first meetup.' },
  { icon: MessageCircle, title: 'Temporary Chat', body: 'Chat rooms expire 48 hrs after your experience — no lingering data.' },
  { icon: Flag, title: 'Report & Block', body: 'One tap to report or block. Our team reviews every report within 24 hrs.' },
  { icon: Heart, title: 'Activity-First', body: 'OneMeet is about shared experiences, not dating. No pressure, ever.' },
  { icon: Lock, title: 'Private by Default', body: 'Your contact info is never shared. You decide what to reveal and when.' },
];

// ── Sub-components ─────────────────────────────────────────────────────────

function OneMeetLogo({ size = 32 }: { size?: number }) {
  const r = size / 2;
  const offset = size * 0.22;
  return (
    <svg width={size * 1.5} height={size} viewBox={`0 0 ${size * 1.5} ${size}`} fill="none">
      <circle cx={r} cy={r} r={r - 2} stroke={C.forest} strokeWidth={size * 0.07} fill="none" />
      <circle cx={r * 2.5 - offset} cy={r} r={r - 2} stroke={C.forest} strokeWidth={size * 0.07} fill="none" />
      {/* Intersection fill */}
      <clipPath id={`c1-${size}`}><circle cx={r} cy={r} r={r - 2} /></clipPath>
      <clipPath id={`c2-${size}`}><circle cx={r * 2.5 - offset} cy={r} r={r - 2} /></clipPath>
      <rect x={r * 2.5 - offset - r} y={0} width={r * 2} height={size} clipPath={`url(#c1-${size})`} fill={C.forest} opacity="0.85" />
      <rect x={0} y={0} width={r * 2} height={size} clipPath={`url(#c2-${size})`} fill={C.forest} opacity="0.85" />
    </svg>
  );
}

function Pill({ children, coral }: { children: React.ReactNode; coral?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold tracking-wide"
      style={{
        background: coral ? `${C.coral}18` : `${C.forest}12`,
        color: coral ? C.coral : C.forest,
        border: `1px solid ${coral ? C.coral + '30' : C.forest + '20'}`,
      }}
    >
      {children}
    </span>
  );
}

// ── Hero Chat Widget ──────────────────────────────────────────────────────
interface ChatMsg {
  from: 'bot' | 'user';
  text: string;
}

const BOT_RESPONSES: { keywords: string[]; reply: string }[] = [
  { keywords: ['deal', 'discount', 'save', 'offer', 'promo'], reply: "This week: 30% off escape rooms in Boston, $15 coffee crawls, and 2-for-1 pottery nights. Plus members get first dibs." },
  { keywords: ['price', 'cost', 'plan', 'membership', 'subscribe'], reply: "Basic is $9/mo (browse + 1 match/week), Plus is $24/mo (unlimited matches + 1 free experience), Premium is $49/mo (everything + VIP priority). No contracts." },
  { keywords: ['match', 'how', 'work'], reply: "Pick an experience you want to try. We find someone nearby who picked the same thing. You see a quick profile card, then decide yes/no. Both say yes? You're in." },
  { keywords: ['safe', 'security', 'trust', 'verify'], reply: "Every member is ID-verified. Meetups happen at vetted public venues. You can share your live location with a friend, and our safety team monitors flagged accounts 24/7." },
  { keywords: ['boston', 'city', 'location', 'where'], reply: "Live in 80+ cities! Boston has 400+ active members right now. Top experiences: harbor sunset kayak, Seaport food tours, and Fenway rooftop mixers." },
  { keywords: ['cancel', 'refund', 'pause'], reply: "Cancel or pause anytime from your account settings. No fees, no questions. If you pause, your deals stay saved for when you come back." },
  { keywords: ['experience', 'activity', 'event', 'do'], reply: "Coffee meetups, rock climbing, cooking classes, sunset hikes, museum tours, live music shows, pottery, escape rooms... new stuff drops every Monday." },
  { keywords: ['hello', 'hi', 'hey', 'sup', 'yo'], reply: "Hey! I'm the OneMeet concierge. Ask me about deals, how matching works, membership plans, or what's happening in your city." },
];

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  for (const { keywords, reply } of BOT_RESPONSES) {
    if (keywords.some(k => lower.includes(k))) return reply;
  }
  return "Good question! I can help with deals, membership plans, how matching works, or what's happening near you. What are you curious about?";
}

function HeroChatWidget() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { from: 'bot', text: "Hey! I'm your OneMeet concierge. Ask me anything -- deals, plans, how it works, you name it." },
  ]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function send(text?: string) {
    const trimmed = (text || input).trim();
    if (!trimmed) return;
    const userMsg: ChatMsg = { from: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    if (!text) setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: getBotReply(trimmed) }]);
    }, 400 + Math.random() * 400);
  }

  const toggleMic = useCallback(() => {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { from: 'bot', text: "Voice isn't supported in this browser. Try Chrome or Edge." }]);
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);
      recognition.onerror = () => setListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          send(transcript.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    }).catch(() => {
      setMessages(prev => [...prev, { from: 'bot', text: "Mic access was denied. Check your browser permissions and try again." }]);
    });
  }, [listening, input]);

  return (
    <div className="relative">
      <div
        className="absolute inset-0 rounded-3xl translate-x-3 translate-y-3"
        style={{ background: C.coral, opacity: 0.15 }}
      />
      <div
        className="relative rounded-3xl w-80 sm:w-[340px] shadow-2xl overflow-hidden flex flex-col"
        style={{
          background: `linear-gradient(145deg, ${C.forest}, ${C.forestMid})`,
          boxShadow: `0 24px 64px ${C.forest}40`,
          height: '420px',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.cream}12` }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: `${C.cream}15` }}
          >
            <MessageCircle size={16} style={{ color: C.coralLight }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: C.cream }}>OneMeet Concierge</p>
            <p className="text-[11px]" style={{ color: `${C.cream}60` }}>Always online</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          style={{ scrollbarWidth: 'thin', scrollbarColor: `${C.cream}20 transparent` }}
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                style={msg.from === 'bot'
                  ? { background: `${C.cream}12`, color: `${C.cream}DD`, borderBottomLeftRadius: '4px' }
                  : { background: C.coral, color: C.cream, borderBottomRightRadius: '4px' }
                }
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
            {['Deals', 'How it works', 'Plans'].map(q => (
              <button
                key={q}
                onClick={() => {
                  setMessages(prev => [...prev, { from: 'user', text: q }]);
                  setTimeout(() => {
                    setMessages(prev => [...prev, { from: 'bot', text: getBotReply(q) }]);
                  }, 500);
                }}
                className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]"
                style={{ background: `${C.cream}10`, color: `${C.cream}90`, border: `1px solid ${C.cream}18` }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-3 pb-3 pt-1">
          <form
            onSubmit={e => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5"
            style={{ background: `${C.cream}08`, border: `1px solid ${C.cream}12` }}
          >
            <button
              type="button"
              onClick={toggleMic}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 ${listening ? 'animate-pulse' : ''}`}
              style={{ background: listening ? '#ef4444' : `${C.cream}15` }}
              title={listening ? 'Listening... tap to stop' : 'Tap to speak'}
            >
              <Mic size={12} style={{ color: C.cream }} />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={listening ? 'Listening...' : 'Ask about deals, plans...'}
              className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
              style={{ color: C.cream }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30"
              style={{ background: C.coral }}
            >
              <Send size={12} style={{ color: C.cream }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export function OneMeetPage({ onBack }: Props) {
  const { user, profile, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTier, setActiveTier] = useState(0);
  const [matchDecision, setMatchDecision] = useState<'accepted' | 'passed' | null>(null);
  const [activePlan, setActivePlan] = useState('plus');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  async function handleSubscribe(plan: typeof PLANS[number]) {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setSubscribingPlan(plan.id);
    setSubscribeError(null);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/onemeet-subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          origin: window.location.origin,
          email: user.email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank', 'noopener');
      } else {
        setSubscribeError(data.error || 'Could not start checkout. Please try again.');
      }
    } catch {
      setSubscribeError('Network error. Please try again.');
    } finally {
      setSubscribingPlan(null);
    }
  }

  const FAQS = [
    { q: 'Is this a dating app?', a: 'No. OneMeet is activity-first. We match you with someone who wants to do the same thing at the same time. Romance is never implied or expected.' },
    { q: 'How does the matching work?', a: 'We look at your chosen experience, availability, and shared interests. You review a match card before deciding — no surprise connections.' },
    { q: 'What if I don\'t vibe with my match?', a: 'Easy pass. You can decline any match with no explanation. You\'re always in control.' },
    { q: 'Are deals actually good?', a: 'We partner directly with local businesses. Most deals are 20–50% off retail. Availability varies by city and changes monthly.' },
  ];

  return (
    <div className="min-h-screen" style={{ background: C.cream, color: C.text, fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-5 sm:px-10 lg:px-16 h-16"
        style={{ background: 'rgba(245,240,232,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.forest}18` }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70"
            style={{ color: C.textMuted }}
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">OneZoo</span>
          </button>
          <div className="w-px h-5 bg-black/10" />
          <div className="flex items-center gap-2.5">
            <OneMeetLogo size={26} />
            <span className="text-lg font-bold tracking-tight" style={{ color: C.forest }}>OneMeet</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {['Experiences', 'How It Works', 'Pricing', 'Safety'].map(link => (
            <a
              key={link}
              href={`#onem-${link.toLowerCase().replace(/\s/g, '-')}`}
              className="text-sm font-semibold transition-colors hover:opacity-70"
              style={{ color: C.textMuted }}
            >
              {link}
            </a>
          ))}
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: C.coral, color: C.cream }}
              >
                {(profile?.display_name || user.email || '?')[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold hidden sm:inline" style={{ color: C.forest }}>
                {profile?.display_name || user.email?.split('@')[0]}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 rounded-lg transition-colors hover:bg-black/5"
              title="Sign out"
            >
              <LogOut size={16} style={{ color: C.textMuted }} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAuthOpen(true)}
            className="px-5 py-2 rounded-full text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.97] shadow-sm"
            style={{ background: C.forest, color: C.cream }}
          >
            Join OneMeet
          </button>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-5 sm:px-10 lg:px-16 pt-20 pb-24 sm:pt-28 sm:pb-32">
        {/* Boston skyline background */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/image%20copy%20copy%20copy%20copy%20copy%20copy%20copy%20copy%20copy%20copy%20copy%20copy%20copy%20copy%20copy%20copy%20copy%20copy%20copy%20copy.png"
            alt=""
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, ${C.cream}F0 0%, ${C.cream}E6 35%, ${C.cream}CC 60%, ${C.cream}F5 100%)` }}
          />
        </div>
        {/* Decorative shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.05]"
            style={{ background: C.forest }}
          />
          <div
            className="absolute bottom-0 -left-20 w-80 h-80 rounded-full opacity-[0.04]"
            style={{ background: C.coral }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="mb-6">
                <Pill><TreePine size={11} /> Powered by OneZoo</Pill>
              </div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.07] tracking-tight mb-6"
                style={{ color: C.forest }}
              >
                Meet people through shared<br />
                <span style={{ color: C.coral }}>experiences.</span>
              </h1>
              <p className="text-lg leading-relaxed mb-10 max-w-lg" style={{ color: C.textMuted }}>
                OneMeet helps members unlock discounted local activities and get matched with people who want to go too.
                No pressure. Just good experiences with good people.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => !user && setAuthOpen(true)}
                  className="px-7 py-3.5 rounded-full font-bold text-sm tracking-wide shadow-lg transition-all hover:scale-[1.03] active:scale-[0.97]"
                  style={{ background: C.forest, color: C.cream, boxShadow: `0 8px 24px ${C.forest}35` }}
                >
                  {user ? 'Welcome Back!' : 'Join OneMeet'}
                </button>
                <button
                  onClick={() => { window.history.pushState(null, '', '/OneMeet/experiences'); window.location.reload(); }}
                  className="px-7 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all hover:scale-[1.03] active:scale-[0.97] inline-flex items-center"
                  style={{ background: 'transparent', color: C.forest, border: `1.5px solid ${C.forest}30` }}
                >
                  Explore Experiences
                </button>
              </div>
              <p className="text-xs mt-5" style={{ color: C.textMuted }}>No credit card required to browse</p>
            </div>

            {/* Interactive Chat Widget */}
            <div className="flex justify-center lg:justify-end">
              <HeroChatWidget />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="max-w-6xl mx-auto mt-20">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
            style={{ background: `${C.forest}12` }}
          >
            {[
              { n: '12,000+', label: 'Active Members' },
              { n: '80+', label: 'Cities' },
              { n: '94%', label: 'Match Satisfaction' },
              { n: '$42', label: 'Avg. Savings / Month' },
            ].map(({ n, label }) => (
              <div key={label} className="px-6 py-5 text-center" style={{ background: C.cream }}>
                <p className="text-2xl font-bold mb-0.5" style={{ color: C.forest }}>{n}</p>
                <p className="text-xs font-semibold" style={{ color: C.textMuted }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="onem-how-it-works" className="px-5 sm:px-10 lg:px-16 py-24" style={{ background: C.white }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Pill>Simple Process</Pill>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4" style={{ color: C.forest }}>
              Four steps to a great afternoon
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: C.textMuted }}>
              No algorithms to game. No endless swiping. Just pick something you want to do and we handle the rest.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Choose your membership',
                body: 'Pick a plan that matches how often you want to get out and explore.',
                icon: CreditCard,
              },
              {
                step: '02',
                title: 'Pick an experience',
                body: 'Browse deals in your city. Filter by type, budget, or vibe.',
                icon: MapPin,
              },
              {
                step: '03',
                title: 'Get matched',
                body: 'We surface one compatible person also interested in the same thing, same week.',
                icon: Users,
              },
              {
                step: '04',
                title: 'Go together',
                body: 'Meet at the venue. Enjoy the experience. See where it leads — no expectations.',
                icon: Heart,
              },
            ].map(({ step, title, body, icon: Icon }) => (
              <div
                key={step}
                className="rounded-2xl p-7 relative group transition-all hover:-translate-y-1"
                style={{
                  background: C.cream,
                  border: `1px solid ${C.forest}10`,
                }}
              >
                <div
                  className="text-5xl font-black mb-6 select-none"
                  style={{ color: `${C.forest}10`, lineHeight: 1 }}
                >
                  {step}
                </div>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${C.forest}12` }}
                >
                  <Icon size={20} style={{ color: C.forest }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: C.forest }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Experience Marketplace ── */}
      <section id="onem-experiences" className="px-5 sm:px-10 lg:px-16 py-24" style={{ background: C.cream }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Pill coral>Live Deals</Pill>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4" style={{ color: C.forest }}>
              Experience Marketplace
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: C.textMuted }}>
              From casual coffee to premium concerts — every experience is negotiated at member rates.
            </p>
          </div>

          {/* Tier tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {EXPERIENCES.map((tier, i) => (
              <button
                key={tier.tier}
                onClick={() => setActiveTier(i)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
                style={{
                  background: activeTier === i ? C.forest : C.white,
                  color: activeTier === i ? C.cream : C.textMuted,
                  border: `1.5px solid ${activeTier === i ? C.forest : `${C.forest}15`}`,
                  boxShadow: activeTier === i ? `0 4px 16px ${C.forest}25` : 'none',
                }}
              >
                <tier.icon size={14} />
                {tier.tier}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {EXPERIENCES[activeTier].items.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg group cursor-pointer"
                style={{ background: C.white, border: `1px solid ${C.forest}0f` }}
              >
                <div
                  className="h-28 flex items-center justify-center relative"
                  style={{ background: EXPERIENCES[activeTier].bg }}
                >
                  {item.tag && (
                    <span
                      className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: item.tag === 'OneZoo Deal' ? C.coral : C.forest,
                        color: C.cream,
                      }}
                    >
                      {item.tag}
                    </span>
                  )}
                  {(() => { const TierIcon = EXPERIENCES[activeTier].icon; return <TierIcon size={36} style={{ color: EXPERIENCES[activeTier].color, opacity: 0.6 }} />; })()}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm mb-0.5" style={{ color: C.forest }}>{item.name}</h4>
                  <p className="text-xs mb-3" style={{ color: C.textMuted }}>{item.location}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-bold mb-0.5" style={{ color: C.textMuted }}>Member saves</p>
                      <p className="text-lg font-black" style={{ color: C.forest }}>{item.savings}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: EXPERIENCES[activeTier].color }}>
                      <Users size={12} />
                      Match available
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Matching UI ── */}
      <section id="onem-how-it-works" className="px-5 sm:px-10 lg:px-16 py-24" style={{ background: C.white }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Pill>Match Preview</Pill>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-5" style={{ color: C.forest }}>
                You're in control, always.
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: C.textMuted }}>
                Before any meetup happens, you see a compatibility summary. You decide who you go with.
                No surprise connections. No hidden pressure.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Shield, text: 'Both people must accept before any details are shared.' },
                  { icon: MessageCircle, text: 'Temporary chat opens only after mutual acceptance.' },
                  { icon: Heart, text: 'Activity-first — the experience is the point, not the match.' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${C.forest}10` }}
                    >
                      <Icon size={14} style={{ color: C.forest }} />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Match card */}
            <div>
              {matchDecision === null ? (
                <div
                  className="rounded-3xl p-6 max-w-sm mx-auto shadow-xl"
                  style={{
                    background: C.cream,
                    border: `1px solid ${C.forest}12`,
                    boxShadow: `0 16px 48px ${C.forest}14`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: C.coral }}
                    />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.coral }}>
                      New Match
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
                      style={{ background: `${C.forestLight}20`, color: C.forest }}
                    >
                      {MATCH.initial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold" style={{ color: C.forest }}>{MATCH.name}</h3>
                        {MATCH.verified && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: C.forest }}
                          >
                            <Check size={11} style={{ color: C.cream }} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: C.textMuted }}>{MATCH.distance}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-3xl font-black" style={{ color: C.forest }}>{MATCH.score}%</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.textMuted }}>compat.</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: C.white }}>
                      <Star size={14} style={{ color: C.coral, marginTop: 2 }} />
                      <div>
                        <p className="text-[10px] uppercase tracking-wide font-bold mb-1" style={{ color: C.textMuted }}>Shared interests</p>
                        <div className="flex flex-wrap gap-1.5">
                          {MATCH.interests.map(i => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{ background: `${C.forest}10`, color: C.forest }}
                            >
                              {i}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl p-3" style={{ background: C.white }}>
                        <p className="text-[10px] uppercase tracking-wide font-bold mb-1" style={{ color: C.textMuted }}>Preferred time</p>
                        <p className="text-xs font-bold" style={{ color: C.forest }}>{MATCH.time}</p>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: C.white }}>
                        <p className="text-[10px] uppercase tracking-wide font-bold mb-1" style={{ color: C.textMuted }}>Activity</p>
                        <p className="text-xs font-bold" style={{ color: C.forest }}>{MATCH.activity}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMatchDecision('passed')}
                      className="py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: C.white, color: C.textMuted, border: `1.5px solid ${C.forest}15` }}
                    >
                      Pass
                    </button>
                    <button
                      onClick={() => setMatchDecision('accepted')}
                      className="py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                      style={{ background: C.forest, color: C.cream, boxShadow: `0 6px 18px ${C.forest}30` }}
                    >
                      Accept Match
                    </button>
                  </div>
                  <p className="text-[10px] text-center mt-3" style={{ color: C.textMuted }}>
                    Jordan won't be notified unless you both accept.
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-3xl p-8 max-w-sm mx-auto text-center"
                  style={{ background: C.cream, border: `1px solid ${C.forest}12` }}
                >
                  {matchDecision === 'accepted' ? (
                    <>
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                        style={{ background: `${C.forest}12` }}
                      >
                        <Check size={28} style={{ color: C.forest }} />
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: C.forest }}>Match accepted!</h3>
                      <p className="text-sm mb-6" style={{ color: C.textMuted }}>
                        Jordan will be notified. Once they accept, you'll get access to a temporary chat.
                      </p>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                        style={{ background: `${C.forest}08` }}
                      >
                        <X size={28} style={{ color: C.textMuted }} />
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: C.forest }}>No worries.</h3>
                      <p className="text-sm mb-6" style={{ color: C.textMuted }}>
                        Jordan won't be notified. We'll surface a new match when one is available.
                      </p>
                    </>
                  )}
                  <button
                    onClick={() => setMatchDecision(null)}
                    className="text-sm font-bold px-6 py-2.5 rounded-full transition-all hover:scale-[1.02]"
                    style={{ background: C.forest, color: C.cream }}
                  >
                    View demo again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Membership Pricing ── */}
      <section id="onem-pricing" className="px-5 sm:px-10 lg:px-16 py-24" style={{ background: C.creamDark }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Pill>Membership</Pill>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4" style={{ color: C.forest }}>
              Simple, honest pricing
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: C.textMuted }}>
              No hidden fees, no surprise charges. Pause or cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                onClick={() => setActivePlan(plan.id)}
                className="rounded-3xl p-7 cursor-pointer transition-all hover:-translate-y-1 relative"
                style={{
                  background: plan.highlight ? C.forest : C.white,
                  border: `1.5px solid ${plan.id === activePlan ? C.forest : `${C.forest}10`}`,
                  boxShadow: plan.highlight ? `0 20px 60px ${C.forest}30` : 'none',
                }}
              >
                {plan.highlight && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                    style={{ background: C.coral, color: C.cream }}
                  >
                    Most Popular
                  </div>
                )}
                <h3
                  className="text-xl font-bold mb-1"
                  style={{ color: plan.highlight ? C.cream : C.forest }}
                >
                  {plan.name}
                </h3>
                <p className="text-xs mb-5" style={{ color: plan.highlight ? `${C.cream}80` : C.textMuted }}>
                  {plan.desc}
                </p>
                <div className="flex items-end gap-1 mb-7">
                  <span className="text-4xl font-black" style={{ color: plan.highlight ? C.cream : C.forest }}>
                    ${plan.price}
                  </span>
                  <span className="text-sm mb-1.5 font-medium" style={{ color: plan.highlight ? `${C.cream}70` : C.textMuted }}>
                    /month
                  </span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: plan.highlight ? `${C.cream}20` : `${C.forest}10` }}
                      >
                        <Check size={11} style={{ color: plan.highlight ? C.cream : C.forest }} />
                      </div>
                      <span style={{ color: plan.highlight ? `${C.cream}CC` : C.textMuted }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSubscribe(plan); }}
                  disabled={subscribingPlan === plan.id}
                  className="w-full py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait"
                  style={{
                    background: plan.highlight ? C.cream : C.forest,
                    color: plan.highlight ? C.forest : C.cream,
                    boxShadow: plan.highlight ? `0 6px 18px ${C.forest}20` : 'none',
                  }}
                >
                  {subscribingPlan === plan.id ? 'Redirecting...' : plan.cta}
                </button>
              </div>
            ))}
          </div>

          {subscribeError && (
            <p className="text-center text-sm font-medium mb-4" style={{ color: '#b91c1c' }}>{subscribeError}</p>
          )}
          <p className="text-center text-xs" style={{ color: C.textMuted }}>
            Deals are curated and inventory may vary by city. Member prices are subject to partner availability.
          </p>
        </div>
      </section>

      {/* ── Safety & Trust ── */}
      <section id="onem-safety" className="px-5 sm:px-10 lg:px-16 py-24" style={{ background: C.white }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Pill><Shield size={11} /> Trust & Safety</Pill>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4" style={{ color: C.forest }}>
              Built with your comfort in mind
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: C.textMuted }}>
              OneMeet treats safety as infrastructure, not an afterthought.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TRUST.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl p-6 transition-all hover:-translate-y-0.5"
                style={{ background: C.cream, border: `1px solid ${C.forest}0c` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${C.forest}10` }}
                >
                  <Icon size={20} style={{ color: C.forest }} />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: C.forest }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-5 sm:px-10 lg:px-16 py-20" style={{ background: C.cream }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: C.forest }}>
            Common questions
          </h2>
          <div className="space-y-2">
            {FAQS.map(({ q, a }, i) => (
              <div
                key={q}
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${C.forest}12`, background: C.white }}
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="font-semibold text-sm" style={{ color: C.forest }}>{q}</span>
                  <ChevronDown
                    size={16}
                    style={{ color: C.textMuted, transform: activeFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-5 sm:px-10 lg:px-16 py-28" style={{ background: C.forest }}>
        <div className="max-w-3xl mx-auto text-center">
          <OneMeetLogo size={40} />
          <h2
            className="text-3xl sm:text-5xl font-bold mt-8 mb-5 leading-tight"
            style={{ color: C.cream }}
          >
            Start with one experience.<br />
            <span style={{ color: C.coralLight }}>Leave with a connection.</span>
          </h2>
          <p className="text-base mb-10" style={{ color: `${C.cream}80` }}>
            Experiences are better shared. Join thousands of members who've stopped waiting to do things alone.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => !user && setAuthOpen(true)}
              className="px-8 py-4 rounded-full font-bold text-base tracking-wide transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl"
              style={{ background: C.cream, color: C.forest, boxShadow: `0 12px 32px rgba(0,0,0,0.25)` }}
            >
              {user ? 'You\'re In — Explore Experiences' : 'Join OneMeet — It\'s Free to Browse'}
            </button>
            <button
              className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base tracking-wide transition-all hover:opacity-80"
              style={{ background: 'transparent', color: C.cream, border: `1.5px solid ${C.cream}30` }}
            >
              See Experiences <ChevronRight size={16} />
            </button>
          </div>
          <p className="text-xs mt-6" style={{ color: `${C.cream}40` }}>
            Powered by OneZoo · No credit card to browse · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-5 sm:px-10 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: C.forestMid, borderTop: `1px solid ${C.cream}10` }}>
        <div className="flex items-center gap-3">
          <OneMeetLogo size={22} />
          <span className="text-sm font-bold" style={{ color: `${C.cream}80` }}>OneMeet</span>
          <span className="text-xs" style={{ color: `${C.cream}40` }}>by OneZoo</span>
        </div>
        <div className="flex items-center gap-5">
          {['Privacy', 'Terms', 'Safety', 'Contact'].map(link => (
            <a key={link} href="#" className="text-xs font-semibold transition-opacity hover:opacity-60" style={{ color: `${C.cream}60` }}>
              {link}
            </a>
          ))}
        </div>
        <p className="text-xs" style={{ color: `${C.cream}30` }}>&copy; 2026 OneMeet / OneZoo</p>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}