import { useState, useEffect, useCallback } from 'react';
import { Fish, Bone, Droplets, Bell, Coins, Heart } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import {
  playBellSound,
  playWaterSpraySound,
  playSplashSound,
  playTreatSound,
  playToyDropSound,
} from '../lib/soundEffects';

interface Props {
  feedId: string;
  onNeedAuth: () => void;
  onNeedCoins: () => void;
  onEffect?: (type: 'spray_water' | 'ring_bell' | 'throw_fish' | 'toss_treat' | 'drop_toy') => void;
}

interface InteractionDef {
  type: 'throw_fish' | 'drop_toy' | 'toss_treat' | 'spray_water' | 'ring_bell';
  label: string;
  icon: typeof Fish;
  cost: number;
  color: string;
  emoji: string;
  description: string;
}

const INTERACTIONS: InteractionDef[] = [
  { type: 'throw_fish', label: 'Throw Fish', icon: Fish, cost: 10, color: '#3b82f6', emoji: '🐟', description: 'Toss a fish into the enclosure!' },
  { type: 'drop_toy', label: 'Drop Toy', icon: Heart, cost: 15, color: '#ec4899', emoji: '🧸', description: 'Drop an enrichment toy!' },
  { type: 'toss_treat', label: 'Toss Treat', icon: Bone, cost: 5, color: '#f59e0b', emoji: '🦴', description: 'Throw a tasty treat!' },
  { type: 'spray_water', label: 'Spray Water', icon: Droplets, cost: 8, color: '#06b6d4', emoji: '💦', description: 'Give a refreshing spray!' },
  { type: 'ring_bell', label: 'Ring Bell', icon: Bell, cost: 3, color: '#a855f7', emoji: '🔔', description: 'Ring the dinner bell!' },
];

const SOUND_MAP: Record<string, () => void> = {
  spray_water: playWaterSpraySound,
  ring_bell: playBellSound,
  throw_fish: playSplashSound,
  toss_treat: playTreatSound,
  drop_toy: playToyDropSound,
};

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  startY: number;
  username: string;
}

export function FeedInteractions({ feedId, onNeedAuth, onNeedCoins, onEffect }: Props) {
  const { user, profile, refreshProfile } = useAuth();
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [cooldown, setCooldown] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [recentInteractions, setRecentInteractions] = useState<{ type: string; username: string; created_at: string }[]>([]);

  useEffect(() => {
    const loadRecent = async () => {
      const { data } = await supabase
        .from('feed_interactions')
        .select('interaction_type, user_id, created_at')
        .eq('feed_id', feedId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(d => d.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) ?? []);
        setRecentInteractions(data.map(d => ({
          type: d.interaction_type,
          username: profileMap.get(d.user_id) || 'Someone',
          created_at: d.created_at,
        })));
      }
    };

    loadRecent();

    const channel = supabase
      .channel(`interactions:${feedId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feed_interactions',
        filter: `feed_id=eq.${feedId}`,
      }, async (payload) => {
        const newRow = payload.new as { interaction_type: string; user_id: string };
        const { data: prof } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', newRow.user_id)
          .maybeSingle();

        const username = prof?.display_name || 'Someone';
        const interaction = INTERACTIONS.find(i => i.type === newRow.interaction_type);
        if (interaction) {
          spawnEmoji(interaction.emoji, username);
          triggerEffects(newRow.interaction_type);
        }

        setRecentInteractions(prev => [{
          type: newRow.interaction_type,
          username,
          created_at: new Date().toISOString(),
        }, ...prev].slice(0, 5));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [feedId]);

  const triggerEffects = useCallback((type: string) => {
    const soundFn = SOUND_MAP[type];
    if (soundFn) {
      try { soundFn(); } catch (_) { /* audio not available */ }
    }
    if (onEffect) {
      onEffect(type as Parameters<typeof onEffect>[0]);
    }
  }, [onEffect]);

  const spawnEmoji = useCallback((emoji: string, username: string) => {
    const id = Date.now() + Math.random();
    const x = 20 + Math.random() * 60;
    setFloatingEmojis(prev => [...prev, { id, emoji, x, startY: 80, username }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 3000);
  }, []);

  const handleInteraction = async (interaction: InteractionDef) => {
    if (!user) {
      onNeedAuth();
      return;
    }
    if (!profile || profile.coin_balance < interaction.cost) {
      onNeedCoins();
      return;
    }
    if (cooldown) return;

    setCooldown(interaction.type);

    triggerEffects(interaction.type);

    await supabase.from('coin_transactions').insert({
      user_id: user.id,
      amount: -interaction.cost,
      transaction_type: 'tip',
      description: `${interaction.label} on feed`,
      feed_id: feedId,
    });

    await supabase.from('feed_interactions').insert({
      feed_id: feedId,
      user_id: user.id,
      interaction_type: interaction.type,
      coin_cost: interaction.cost,
    });

    spawnEmoji(interaction.emoji, profile.display_name || 'You');
    await refreshProfile();

    setTimeout(() => setCooldown(null), 1500);
  };

  return (
    <>
      {floatingEmojis.map(fe => (
        <div
          key={fe.id}
          className="absolute pointer-events-none z-50 animate-float-up"
          style={{ left: `${fe.x}%`, bottom: `${fe.startY}px` }}
        >
          <div className="flex flex-col items-center">
            <span className="text-4xl drop-shadow-lg">{fe.emoji}</span>
            <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">
              {fe.username}
            </span>
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 left-4 right-4 z-40">
        {recentInteractions.length > 0 && !expanded && (
          <div className="mb-2 space-y-1">
            {recentInteractions.slice(0, 2).map((ri, i) => {
              const def = INTERACTIONS.find(int => int.type === ri.type);
              return (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mr-1"
                  style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)' }}
                >
                  <span>{def?.emoji}</span>
                  <span className="text-amber-300 font-bold">{ri.username}</span>
                  <span className="text-white/50">{def?.label.toLowerCase()}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0"
            style={{
              background: expanded ? 'rgba(217,119,6,0.9)' : 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              color: 'white',
            }}
            title="Feed the animal"
          >
            <Coins size={18} />
          </button>

          {expanded && (
            <div
              className="flex items-center gap-1.5 p-1.5 rounded-xl overflow-x-auto"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {INTERACTIONS.map(interaction => {
                const Icon = interaction.icon;
                const disabled = cooldown === interaction.type;
                const canAfford = profile ? profile.coin_balance >= interaction.cost : false;

                return (
                  <button
                    key={interaction.type}
                    onClick={() => handleInteraction(interaction)}
                    disabled={disabled}
                    className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-40 shrink-0 group relative"
                    style={{ background: `${interaction.color}15` }}
                    title={`${interaction.label} - ${interaction.cost} coins`}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: 'rgba(0,0,0,0.9)', color: 'white' }}>
                      {interaction.description}
                    </div>
                    <Icon size={18} style={{ color: interaction.color }} />
                    <span className="text-[10px] font-bold text-white/70">{interaction.label}</span>
                    <span className="text-[9px] font-bold flex items-center gap-0.5" style={{ color: canAfford ? '#fbbf24' : '#ef4444' }}>
                      <Coins size={8} /> {interaction.cost}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-120px) scale(1.3); opacity: 0.9; }
          100% { transform: translateY(-250px) scale(0.8); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up 3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
