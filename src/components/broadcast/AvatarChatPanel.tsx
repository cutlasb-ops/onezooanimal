import { useState, useEffect, useRef } from 'react';
import { Send, Lightbulb, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AvatarChatPanelProps {
  animalId: string;
  sessionId: string;
  isLive: boolean;
  animalName: string;
  avatarName: string;
  avatarEmoji: string;
}

interface Message {
  id: string;
  text: string;
  type: 'avatar' | 'user' | 'system';
  timestamp: Date;
}

export function AvatarChatPanel({
  animalId,
  sessionId,
  isLive,
  animalName,
  avatarName,
  avatarEmoji,
}: AvatarChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<'live' | 'watching' | 'away'>('live');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateAvatarResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/avatar-commentary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            animalId,
            animalName,
            avatarName,
            userMessage,
            messageType: 'response',
          }),
        }
      );

      const data = await response.json();
      return data.message || "That's a great question! Let me think about that...";
    } catch (error) {
      console.error('Error generating response:', error);
      return "I'm thinking about that - check back in a moment!";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue('');
    setLoading(true);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text: userMessage,
      type: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const avatarResponse = await generateAvatarResponse(userMessage);

      const avatarMsg: Message = {
        id: `avatar-${Date.now()}`,
        text: avatarResponse,
        type: 'avatar',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, avatarMsg]);

      await supabase
        .from('onezoo_avatar_messages')
        .insert({
          animal_id: animalId,
          session_id: sessionId,
          message_type: 'response',
          trigger: 'user_question',
          message: avatarResponse,
          viewer_username: 'viewer',
        });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-500';
      case 'watching':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="w-80 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col h-96">
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{avatarEmoji}</span>
            <div>
              <h3 className="font-bold text-white text-sm">{avatarName}</h3>
              <p className="text-xs text-slate-400">{animalName}'s Guide</p>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${getStatusColor(avatarStatus)} animate-pulse`} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
            <Lightbulb size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Ask {avatarName} anything about {animalName}!</p>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.type === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-700 text-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.type === 'avatar' && (
                    <p className="text-xs font-semibold text-emerald-300 mb-1">{avatarName}</p>
                  )}
                  <p className="text-xs leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-3 border-t border-slate-700 space-y-2">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
            }}
            onKeyPress={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Ask ${avatarName}...`}
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none max-h-20"
            rows={1}
            disabled={loading || !isLive}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !isLive || !inputValue.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white px-3 py-2 rounded transition-colors flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </div>

        {!isLive && (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-950 p-2 rounded text-xs">
            <AlertCircle size={14} />
            <span>Stream offline - ask when live</span>
          </div>
        )}
      </div>
    </div>
  );
}
