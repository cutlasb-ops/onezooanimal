import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, Smile, ChevronDown, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ChatMessage } from '../lib/database.types';

interface Props {
  feedId: string;
  viewerCount?: number;
}

const ADJECTIVES = ['Swift', 'Wild', 'Brave', 'Clever', 'Fierce', 'Gentle', 'Bold', 'Wise', 'Keen', 'Noble'];
const ANIMALS = ['Lion', 'Eagle', 'Wolf', 'Fox', 'Bear', 'Hawk', 'Deer', 'Lynx', 'Owl', 'Tiger'];

function randomUsername() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}${animal}${num}`;
}

function getStoredUsername(): string {
  const stored = localStorage.getItem('onezoo_chat_username');
  if (stored) return stored;
  const generated = randomUsername();
  localStorage.setItem('onezoo_chat_username', generated);
  return generated;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const AVATAR_COLORS = [
  ['#fb7185', '#e11d48'],
  ['#f97316', '#ea580c'],
  ['#facc15', '#ca8a04'],
  ['#4ade80', '#16a34a'],
  ['#22d3ee', '#0891b2'],
  ['#60a5fa', '#2563eb'],
  ['#f472b6', '#db2777'],
  ['#34d399', '#059669'],
];

function userAvatar(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  const colors = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  return {
    gradient: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
    initials: username.slice(0, 2).toUpperCase(),
  };
}

const QUICK_REACTIONS = ['Wow', 'So cute', 'Beautiful', 'Amazing', 'Love this'];

export function ChatPanel({ feedId, viewerCount }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [username] = useState(getStoredUsername);
  const [sending, setSending] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('feed_id', feedId)
        .order('created_at', { ascending: true })
        .limit(100);
      if (data) setMessages(data);
    };
    load();

    const channel = supabase
      .channel(`chat:${feedId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `feed_id=eq.${feedId}` },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          setMessages(prev => {
            if (prev.some(m => m.id === incoming.id)) return prev;
            const withoutOptimistic = prev.filter(
              m => !(m.id.startsWith('optimistic-') && m.username === incoming.username && m.message === incoming.message)
            );
            return [...withoutOptimistic, incoming];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [feedId]);

  useEffect(() => {
    if (autoScroll) scrollToBottom();
  }, [messages, autoScroll, scrollToBottom]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAutoScroll(nearBottom);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    setInput('');

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      feed_id: feedId,
      username,
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    const { data } = await supabase.from('chat_messages').insert({
      feed_id: feedId,
      username,
      message: text,
    }).select().maybeSingle();

    if (data) {
      setMessages(prev => prev.map(m => m.id === optimisticId ? data : m));
    }

    setSending(false);
    inputRef.current?.focus();
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input.trim());
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <MessageCircle size={15} className="text-amber-400" />
        <span className="text-white text-sm font-bold tracking-tight">Live Chat</span>
        {typeof viewerCount === 'number' && (
          <span
            className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(245,158,11,0.12)',
              color: '#fbbf24',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <Users size={10} />
            {viewerCount.toLocaleString()}
          </span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="lg:hidden ml-auto w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <ChevronDown size={15} className={collapsed ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
      </div>

      {!collapsed && (
        <>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-0 scrollbar-thin"
            style={{ scrollbarWidth: 'thin' }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  <MessageCircle size={22} className="text-amber-400/60" />
                </div>
                <p className="text-white text-sm font-semibold mb-1">No messages yet</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Be the first to say hi!</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isOwn = msg.username === username;
              const prev = messages[i - 1];
              const showHeader = !prev || prev.username !== msg.username || (new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() > 60000);
              const { gradient, initials } = userAvatar(msg.username);

              return (
                <div key={msg.id} className="flex gap-2.5">
                  {showHeader ? (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 mt-0.5"
                      style={{ background: gradient, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                    >
                      {initials}
                    </div>
                  ) : (
                    <div className="w-8 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    {showHeader && (
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-xs font-bold" style={{ color: isOwn ? '#fbbf24' : '#fff' }}>
                          {isOwn ? 'You' : msg.username}
                        </span>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    )}
                    <div
                      className="text-sm leading-relaxed break-words"
                      style={{
                        color: isOwn ? '#fef3c7' : 'rgba(255,255,255,0.85)',
                      }}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {!autoScroll && (
            <button
              onClick={() => { setAutoScroll(true); scrollToBottom(); }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
              style={{
                background: 'rgba(245,158,11,0.9)',
                color: '#000',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              }}
            >
              <ChevronDown size={12} />
              New messages
            </button>
          )}

          <div
            className="px-3 pt-2 pb-1 shrink-0 flex gap-1.5 overflow-x-auto scrollbar-none"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            {QUICK_REACTIONS.map(r => (
              <button
                key={r}
                onClick={() => sendMessage(r)}
                className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-all hover:scale-105 shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {r}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSend}
            className="shrink-0 flex items-center gap-2 px-3 py-3"
          >
            <div
              className="flex-1 flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Say something..."
                maxLength={500}
                className="flex-1 text-sm bg-transparent outline-none"
                style={{ color: '#fff' }}
              />
              <Smile size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
              style={{
                background: input.trim() && !sending
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : 'rgba(255,255,255,0.06)',
                color: input.trim() && !sending ? '#fff' : 'rgba(255,255,255,0.4)',
                boxShadow: input.trim() && !sending ? '0 4px 14px rgba(245,158,11,0.4)' : 'none',
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
