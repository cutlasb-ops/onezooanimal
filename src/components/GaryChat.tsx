import { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown, Mic, MicOff, Volume2, VolumeX, Heart } from 'lucide-react';

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
  resultIndex: number;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

function getRecognition(): SpeechRecognitionInstance | null {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  return new SR();
}

let currentGaryAudio: HTMLAudioElement | null = null;

function stopGaryAudio() {
  if (currentGaryAudio) {
    currentGaryAudio.pause();
    currentGaryAudio = null;
  }
  window.speechSynthesis?.cancel();
}

async function speakAsGary(text: string): Promise<void> {
  stopGaryAudio();
  const clean = text.replace(/[#_*`]/g, '').trim();
  if (!clean) return;

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const res = await fetch(`${supabaseUrl}/functions/v1/openai-animal-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ ttsOnly: true, ttsText: clean, voice: 'onyx' }),
    });
    const data = await res.json();
    if (data.audioBase64) {
      const bytes = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentGaryAudio = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      audio.onerror = () => URL.revokeObjectURL(url);
      await audio.play();
      return;
    }
  } catch {
    // fall through to browser TTS
  }

  const utter = new SpeechSynthesisUtterance(clean);
  utter.rate = 0.95;
  utter.pitch = 0.95;
  window.speechSynthesis.speak(utter);
}

interface Message {
  id: number;
  role: 'user' | 'gary';
  text: string;
  loading?: boolean;
}

const GARY_INTRO = `Hey there! I'm Gary, your personal zookeeper! 🐾 Ask me anything about animals — their habitats, diet, fun facts, conservation status, or anything wildlife-related. I'm here to help!`;

const BLOCKED_KEYWORDS = [
  'politics','election','president','government','stock','crypto','bitcoin','code','program',
  'javascript','python','recipe','cook','movie','music','song','sport','football','basketball',
  'weather','news','celebrity','gossip','math','history','war','weapon','drug',
];

function isAnimalRelated(text: string): boolean {
  const lower = text.toLowerCase();
  return !BLOCKED_KEYWORDS.some(kw => lower.includes(kw));
}

async function askGary(userMessage: string): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!isAnimalRelated(userMessage)) {
    return "Heh, I'm just a zookeeper — I only know about animals and wildlife! Try asking me about a specific animal, its habitat, diet, or conservation status. 🦁";
  }

  const systemPrompt = `You are Gary, an enthusiastic and friendly zookeeper at OneZoo Wildlife Streaming Network. You have deep expertise in all animals, wildlife, ecosystems, and conservation. Your personality is warm, educational, and fun — you love sharing fascinating animal facts.

Rules:
- Only answer questions about animals, wildlife, nature, ecosystems, conservation, and zookeeping
- If asked about anything unrelated to animals/wildlife, politely redirect to animal topics
- Keep answers concise (2-4 sentences for simple questions, up to 6 for complex ones)
- Use occasional wildlife-themed expressions naturally
- Include one surprising or little-known fact when relevant
- Never use bullet lists — keep it conversational
- Sign off responses with a short, enthusiastic closing line`;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
    return "Configuration error — missing Supabase environment variables.";
  }

  const endpoint = `${supabaseUrl}/functions/v1/anthropic-proxy`;
  console.log('Calling endpoint:', endpoint);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    const data = await response.json();
    console.log('Response status:', response.status, 'data:', JSON.stringify(data).slice(0, 200));

    if (!response.ok) {
      console.error('Anthropic API error:', response.status, JSON.stringify(data));
      throw new Error(`API error ${response.status}: ${data?.error?.message ?? JSON.stringify(data)}`);
    }
    const textBlock = Array.isArray(data.content)
      ? data.content.find((b: { type: string; text?: string }) => b.type === 'text')
      : null;
    return textBlock?.text ?? "Hmm, something went wrong at the zoo. Try again!";
  } catch (err) {
    console.error('Gary chat error:', err);
    return `Error: ${String(err)}`;
  }
}

export default function GaryChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'gary', text: GARY_INTRO },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(1);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const voiceOnRef = useRef(voiceOn);

  useEffect(() => { voiceOnRef.current = voiceOn; }, [voiceOn]);

  useEffect(() => {
    return () => {
      stopGaryAudio();
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSendText(text: string) {
    if (!text || loading) return;

    const userId = idRef.current++;
    const garyId = idRef.current++;

    setMessages(prev => [
      ...prev,
      { id: userId, role: 'user', text },
      { id: garyId, role: 'gary', text: '', loading: true },
    ]);
    setInput('');
    setLoading(true);

    const reply = await askGary(text);

    setMessages(prev =>
      prev.map(m => m.id === garyId ? { ...m, text: reply, loading: false } : m)
    );
    setLoading(false);

    if (!open) setUnread(n => n + 1);
    if (voiceOnRef.current) {
      speakAsGary(reply).catch(() => {});
    }
  }

  async function toggleMic() {
    if (listening) {
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
      setListening(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      alert('Microphone access blocked. Please allow it in your browser settings.');
      return;
    }
    const rec = getRecognition();
    if (!rec) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    stopGaryAudio();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript?.trim() || '';
      if (transcript) handleSendText(transcript);
    };
    rec.onerror = (ev) => {
      setListening(false);
      if (ev.error === 'not-allowed') {
        alert('Microphone permission denied.');
      } else if (ev.error === 'no-speech') {
        // silent — user can tap again
      }
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setTimeout(() => {
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }, 150);
  }

  function toggleVoice() {
    if (voiceOn) stopGaryAudio();
    setVoiceOn(v => !v);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    await handleSendText(text);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const [donateOpen, setDonateOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState<number | null>(null);
  const [donateLoading, setDonateLoading] = useState(false);
  const [donateError, setDonateError] = useState<string | null>(null);

  async function handleDonate(amount: number) {
    setDonateLoading(true);
    setDonateError(null);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/stripe-donation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ amount, origin: window.location.origin }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank', 'noopener');
        setDonateOpen(false);
      } else {
        setDonateError(data.error || 'Could not start donation. Please try again.');
      }
    } catch {
      setDonateError('Network error. Please try again.');
    } finally {
      setDonateLoading(false);
    }
  }

  const QUICK = ['Tell me about lions', 'What do pandas eat?', 'Most endangered animals?', 'Fastest animal?'];

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
        style={{
          background: 'linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)',
          color: '#bbf7d0',
          boxShadow: '0 8px 32px rgba(21,128,61,0.5), 0 2px 8px rgba(0,0,0,0.4)',
          border: '1px solid rgba(74,222,128,0.25)',
        }}
      >
        <span className="text-lg">🐾</span>
        <span>Ask Gary</span>
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-black">
            {unread}
          </span>
        )}
      </button>

      <div
        className={`fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 origin-bottom-right ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
        }`}
        style={{
          width: 'min(380px, calc(100vw - 24px))',
          height: 'min(520px, calc(100vh - 120px))',
          background: '#0d1f0f',
          border: '1px solid rgba(74,222,128,0.2)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,222,128,0.1)',
        }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)',
            borderBottom: '1px solid rgba(74,222,128,0.2)',
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 shadow-lg"
            style={{ background: 'rgba(0,0,0,0.3)', border: '2px solid rgba(74,222,128,0.4)' }}
          >
            🧑‍🌾
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-green-200 text-sm leading-tight">Gary the Zookeeper</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400/80 text-xs">Online · Wildlife Expert</span>
            </div>
          </div>
          <button
            onClick={toggleVoice}
            title={voiceOn ? 'Voice on' : 'Voice off'}
            className="text-green-300/70 hover:text-green-200 transition-colors p-1"
          >
            {voiceOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            onClick={() => { stopGaryAudio(); setOpen(false); }}
            className="text-green-300/60 hover:text-green-200 transition-colors p-1"
          >
            <ChevronDown size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-thin">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
              {msg.role === 'gary' && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5"
                  style={{ background: 'rgba(21,128,61,0.4)', border: '1px solid rgba(74,222,128,0.3)' }}
                >
                  🧑‍🌾
                </div>
              )}
              <div
                className="max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                style={
                  msg.role === 'gary'
                    ? {
                        background: 'rgba(21,128,61,0.2)',
                        border: '1px solid rgba(74,222,128,0.2)',
                        color: '#bbf7d0',
                        borderRadius: '4px 16px 16px 16px',
                      }
                    : {
                        background: 'linear-gradient(135deg, #166534, #15803d)',
                        color: '#f0fdf4',
                        borderRadius: '16px 4px 16px 16px',
                      }
                }
              >
                {msg.loading ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {donateOpen && (
          <div
            className="mx-3 mb-2 rounded-xl p-3.5 shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(21,128,61,0.2), rgba(6,78,59,0.3))',
              border: '1px solid rgba(74,222,128,0.25)',
            }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Heart size={14} className="text-green-300" fill="#86efac" />
              <span className="text-green-200 text-xs font-bold">Donate to OneZoo</span>
              <button
                onClick={() => setDonateOpen(false)}
                className="ml-auto text-green-400/60 hover:text-green-200 transition-colors text-xs"
              >
                Cancel
              </button>
            </div>
            <p className="text-[11px] mb-3 leading-relaxed" style={{ color: 'rgba(187,247,208,0.7)' }}>
              Your donation helps feed and care for the animals. Every dollar counts!
            </p>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[5, 10, 25, 50].map(amt => (
                <button
                  key={amt}
                  onClick={() => setDonateAmount(amt)}
                  className="py-2 rounded-lg text-xs font-bold transition-all hover:scale-105"
                  style={{
                    background: donateAmount === amt
                      ? 'linear-gradient(135deg, #16a34a, #15803d)'
                      : 'rgba(255,255,255,0.06)',
                    color: donateAmount === amt ? '#fff' : '#86efac',
                    border: `1px solid ${donateAmount === amt ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.15)'}`,
                    boxShadow: donateAmount === amt ? '0 4px 14px rgba(22,163,74,0.4)' : 'none',
                  }}
                >
                  ${amt}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="flex-1 flex items-center gap-1 rounded-lg px-2.5 py-1.5"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}
              >
                <span className="text-green-300 text-xs font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={donateAmount ?? ''}
                  onChange={e => setDonateAmount(Number(e.target.value) || null)}
                  placeholder="Other"
                  className="flex-1 bg-transparent outline-none text-xs text-green-100 w-full"
                  style={{ minWidth: 0 }}
                />
              </div>
            </div>
            {donateError && (
              <p className="text-[11px] text-red-300 mb-2">{donateError}</p>
            )}
            <button
              onClick={() => donateAmount && handleDonate(donateAmount)}
              disabled={!donateAmount || donateAmount < 1 || donateLoading}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(22,163,74,0.4)',
                border: '1px solid rgba(74,222,128,0.3)',
              }}
            >
              <Heart size={14} fill="#fff" />
              {donateLoading ? 'Processing...' : `Donate${donateAmount ? ` $${donateAmount}` : ''}`}
            </button>
            <p className="text-[10px] text-center mt-2" style={{ color: 'rgba(187,247,208,0.4)' }}>
              Secure payment via Stripe
            </p>
          </div>
        )}

        {!donateOpen && !donateLoading && (
          <div className="px-3 pb-2 shrink-0">
            <button
              onClick={() => setDonateOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.01]"
              style={{
                background: 'linear-gradient(135deg, rgba(21,128,61,0.25), rgba(6,78,59,0.3))',
                border: '1px solid rgba(74,222,128,0.2)',
                color: '#86efac',
              }}
            >
              <Heart size={13} fill="#86efac" />
              Donate to help the animals
            </button>
          </div>
        )}

        {messages.length <= 1 && !donateOpen && (
          <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {QUICK.map(q => (
              <button
                key={q}
                onClick={() => handleSendText(q)}
                className="text-xs px-2.5 py-1 rounded-full transition-all hover:scale-105"
                style={{
                  background: 'rgba(21,128,61,0.25)',
                  border: '1px solid rgba(74,222,128,0.25)',
                  color: '#86efac',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div
          className="px-3 py-3 shrink-0 flex gap-2"
          style={{ borderTop: '1px solid rgba(74,222,128,0.15)', background: 'rgba(0,0,0,0.3)' }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Gary about any animal..."
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(74,222,128,0.2)',
              color: '#d1fae5',
            }}
          />
          <button
            onClick={toggleMic}
            disabled={loading}
            title={listening ? 'Stop listening' : 'Talk to Gary'}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            style={{
              background: listening
                ? 'linear-gradient(135deg, #b91c1c, #dc2626)'
                : 'rgba(21,128,61,0.3)',
              border: '1px solid rgba(74,222,128,0.25)',
            }}
          >
            {listening ? <MicOff size={15} className="text-white" /> : <Mic size={15} className="text-green-200" />}
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            style={{ background: 'linear-gradient(135deg, #166534, #15803d)' }}
          >
            <Send size={15} className="text-green-200" />
          </button>
        </div>
      </div>
    </>
  );
}
