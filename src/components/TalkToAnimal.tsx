import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface Props {
  animalName: string;
  animalContext?: string;
  compact?: boolean;
}

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
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
}

async function ensureMicPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

function getSpeechRecognition(): SpeechRecognitionInstance | null {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  return new SR();
}

function speakText(text: string, onDone?: () => void) {
  const clean = text.replace(/\*[^*]+\*/g, '');
  if (!clean.trim()) {
    onDone?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(clean);
  utter.rate = 0.95;
  utter.pitch = 1.1;
  utter.onend = () => onDone?.();
  utter.onerror = () => onDone?.();
  synth.speak(utter);
}

let currentAudio: HTMLAudioElement | null = null;

function playOpenAIAudio(audioBase64: string, onDone?: () => void): boolean {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    window.speechSynthesis?.cancel();
    const bytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      onDone?.();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      onDone?.();
    };
    audio.play().catch(() => onDone?.());
    return true;
  } catch {
    return false;
  }
}

function speakReply(
  text: string,
  audioBase64: string | null | undefined,
  onDone?: () => void
) {
  if (audioBase64 && playOpenAIAudio(audioBase64, onDone)) return;
  speakText(text, onDone);
}

export function TalkToAnimal({ animalName, animalContext, compact }: Props) {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const replyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendToAnimalRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
      if (replyTimeout.current) clearTimeout(replyTimeout.current);
    };
  }, []);

  const startListening = useCallback(async () => {
    setErrorMsg(null);

    try {
      recognitionRef.current?.abort();
    } catch { /* ignore */ }
    recognitionRef.current = null;

    const granted = await ensureMicPermission();
    if (!granted) {
      setErrorMsg('Microphone access blocked. Allow it in your browser settings.');
      return;
    }

    const recognition = getSpeechRecognition();
    if (!recognition) {
      setErrorMsg('Speech recognition not supported in this browser.');
      return;
    }

    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let gotResult = false;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const result = e.results[e.resultIndex]?.[0]?.transcript;
      if (result && result.trim()) {
        gotResult = true;
        sendToAnimalRef.current?.(result);
      }
    };

    recognition.onerror = (e) => {
      setListening(false);
      if (e.error === 'no-speech') {
        setErrorMsg("I didn't hear anything. Try tapping the mic again.");
      } else if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setErrorMsg('Microphone permission denied.');
      } else if (e.error === 'audio-capture') {
        setErrorMsg('No microphone detected.');
      } else if (e.error !== 'aborted') {
        setErrorMsg(`Mic error: ${e.error}`);
      }
    };

    recognition.onend = () => {
      setListening(false);
      if (!gotResult) {
        // give user clearer feedback when nothing was captured
      }
    };

    recognition.onstart = () => {
      setListening(true);
      setErrorMsg(null);
    };

    setTimeout(() => {
      try {
        recognition.start();
      } catch (err) {
        setListening(false);
        setErrorMsg(`Could not start mic: ${String(err)}`);
      }
    }, 150);
  }, []);

  const sendToAnimal = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setProcessing(true);
    setTranscript(text);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/talk-to-animal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          userMessage: text,
          animalName,
          animalContext,
        }),
      });

      const data = await res.json();
      const animalReply = data.reply || `*looks at you curiously*`;
      setReply(animalReply);
      speakReply(animalReply, data.audioBase64);

      if (replyTimeout.current) clearTimeout(replyTimeout.current);
      replyTimeout.current = setTimeout(() => setReply(null), 12000);
    } catch {
      setReply(`*tilts head* Hmm, I can't hear you right now...`);
    } finally {
      setProcessing(false);
    }
  }, [animalName, animalContext]);

  useEffect(() => {
    sendToAnimalRef.current = sendToAnimal;
  }, [sendToAnimal]);

  const greetFromAnimal = useCallback(async () => {
    setGreeting(true);
    setTranscript('');
    setReply(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/talk-to-animal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          userMessage:
            'Greet the child who just walked up to your enclosure. Say hi warmly, introduce yourself by name or species, and invite them to ask you anything. Keep it to 2 short sentences.',
          animalName,
          animalContext,
        }),
      });

      const data = await res.json();
      const intro =
        data.reply ||
        `*ears perk up* Hi there! I'm so glad you stopped by — ask me anything!`;
      setReply(intro);
      speakReply(intro, data.audioBase64, () => {
        setTimeout(() => startListening(), 400);
      });

      if (replyTimeout.current) clearTimeout(replyTimeout.current);
      replyTimeout.current = setTimeout(() => setReply(null), 14000);
    } catch {
      const fallback = `*ears perk up* Hi there! I'm happy you stopped by — ask me anything!`;
      setReply(fallback);
      speakReply(fallback, null, () => {
        setTimeout(() => startListening(), 400);
      });
    } finally {
      setGreeting(false);
      setHasGreeted(true);
    }
  }, [animalName, animalContext, startListening]);

  function toggleListening() {
    if (listening) {
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
      setListening(false);
      return;
    }

    setTranscript('');
    setErrorMsg(null);

    if (!hasGreeted) {
      greetFromAnimal();
      return;
    }

    void startListening();
  }

  if (!supported) return null;

  const busy = processing || greeting;
  const label = listening
    ? 'Listening...'
    : greeting
      ? 'Saying hi...'
      : processing
        ? 'Thinking...'
        : `Talk to ${animalName}`;

  if (compact) {
    return (
      <>
        <button
          onClick={toggleListening}
          disabled={busy}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-60 shrink-0 relative"
          style={{
            background: listening
              ? 'linear-gradient(135deg, #dc2626, #f97316)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
            boxShadow: listening
              ? '0 0 20px rgba(220,38,38,0.5)'
              : '0 4px 14px rgba(245,158,11,0.3)',
          }}
        >
          {listening ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
          {listening && (
            <span className="absolute inset-0 rounded-xl animate-ping" style={{ background: 'rgba(220,38,38,0.3)' }} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm leading-tight">
            {listening ? 'Listening...' : greeting ? 'Saying hi...' : processing ? 'Thinking...' : 'Microphone'}
          </div>
          <div className="text-xs mt-0.5 truncate" style={{ color: errorMsg ? '#fca5a5' : 'rgba(255,255,255,0.55)' }}>
            {errorMsg
              ? errorMsg
              : transcript
                ? `"${transcript.slice(0, 40)}"`
                : reply
                  ? reply.slice(0, 50) + '...'
                  : listening
                    ? 'Listening — speak now'
                    : `Tap to talk to ${animalName}`}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={toggleListening}
        disabled={busy}
        className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
        style={{
          background: listening
            ? 'linear-gradient(135deg, #dc2626, #f97316)'
            : greeting
              ? 'linear-gradient(135deg, #d6a23a, #ffb347)'
              : 'linear-gradient(135deg, #b8720a, #d4a416)',
          boxShadow: listening
            ? '0 0 20px rgba(220,38,38,0.5), 0 2px 8px rgba(0,0,0,0.4)'
            : greeting
              ? '0 0 24px rgba(214,162,58,0.55), 0 2px 8px rgba(0,0,0,0.4)'
              : '0 2px 10px rgba(180,130,10,0.35)',
          border: '2px solid rgba(255,255,255,0.15)',
        }}
        title={listening ? 'Stop talking' : `Talk to ${animalName}`}
      >
        {listening ? (
          <>
            <MicOff size={18} className="text-white relative z-10" />
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: 'rgba(220,38,38,0.3)' }}
            />
          </>
        ) : (
          <>
            <Mic size={18} className="text-white relative z-10" />
            {greeting && (
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: 'rgba(214,162,58,0.35)' }}
              />
            )}
          </>
        )}
      </button>

      <span
        className="text-[10px] font-semibold tracking-wide whitespace-nowrap px-2 py-0.5 rounded-full"
        style={{
          color: '#f0d080',
          background: 'rgba(8,4,2,0.6)',
          border: '1px solid rgba(214,162,58,0.25)',
        }}
      >
        {label}
      </span>

      {(reply || transcript) && (
        <div
          className="absolute bottom-16 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-xs rounded-xl px-3 py-2.5 animate-in slide-in-from-top-2"
          style={{
            background: 'rgba(8,4,2,0.92)',
            border: '1px solid rgba(212,170,80,0.25)',
            backdropFilter: 'blur(12px)',
            zIndex: 10,
          }}
        >
          {transcript && (
            <p className="text-[11px] mb-1.5" style={{ color: 'rgba(200,160,60,0.5)' }}>
              You said: "{transcript}"
            </p>
          )}
          {reply && (
            <div className="flex items-start gap-2">
              <Volume2 size={12} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed" style={{ color: '#f0d080' }}>
                {reply}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
