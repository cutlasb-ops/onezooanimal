import { useState, useEffect } from 'react';
import { X, Coins, Sparkles, Zap, Crown, Star, Check } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

async function getAuthToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNeedAuth: () => void;
}

const COIN_PACKS = [
  { id: 'starter', name: 'Starter Pack', coins: 50, price: 0.99, priceDisplay: '$0.99', icon: Coins, color: '#d97706', popular: false },
  { id: 'explorer', name: 'Explorer Pack', coins: 200, price: 2.99, priceDisplay: '$2.99', icon: Zap, color: '#16a34a', popular: false },
  { id: 'keeper', name: 'Zookeeper Pack', coins: 500, price: 4.99, priceDisplay: '$4.99', icon: Star, color: '#2563eb', popular: true },
  { id: 'champion', name: 'Champion Pack', coins: 1200, price: 9.99, priceDisplay: '$9.99', icon: Crown, color: '#dc2626', popular: false },
  { id: 'ultimate', name: 'Ultimate Pack', coins: 3000, price: 19.99, priceDisplay: '$19.99', icon: Sparkles, color: '#7c3aed', popular: false },
];

export function CoinShop({ isOpen, onClose, onNeedAuth }: Props) {
  const { user, profile, refreshProfile } = useAuth();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [justPurchased, setJustPurchased] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePurchase = async (pack: typeof COIN_PACKS[0]) => {
    if (!user) {
      onNeedAuth();
      return;
    }

    setPurchasing(pack.id);

    try {
      const token = await getAuthToken();
      if (!token) {
        console.error('No auth token available');
        setPurchasing(null);
        onNeedAuth();
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      console.log('Initiating checkout for:', pack.name);

      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packId: pack.id,
          packName: pack.name,
          coins: pack.coins,
          price: pack.price,
          origin: window.location.origin,
        }),
      });

      const data = await response.json();
      console.log('Checkout response:', data);

      if (!response.ok) {
        console.error('Checkout failed:', data.error);
        alert(`Checkout failed: ${data.error || 'Unknown error'}`);
        setPurchasing(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else if (data.sessionId) {
        console.log('Got session ID but no URL:', data.sessionId);
        alert('Session created but redirect URL missing');
        setPurchasing(null);
      } else {
        console.error('No checkout URL returned:', data);
        alert('Failed to create checkout session');
        setPurchasing(null);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPurchasing(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: 'linear-gradient(180deg, #0d2e14, #112a16)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #d97706, #f59e0b, #d97706)' }} />

        <div className="flex items-center justify-between p-6 pb-4 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Coins size={22} className="text-amber-400" />
              Coin Shop
            </h2>
            {profile && (
              <p className="text-sm text-white/40 mt-1">
                Current balance: <span className="text-amber-400 font-bold">{profile.coin_balance.toLocaleString()}</span> coins
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
          <p className="text-xs text-white/30 mb-4">
            Use coins to trigger fun interactions on live animal cams -- toss treats, drop toys, and more!
          </p>

          {COIN_PACKS.map(pack => {
            const Icon = pack.icon;
            const isPurchasing = purchasing === pack.id;
            const wasPurchased = justPurchased === pack.id;

            return (
              <div
                key={pack.id}
                className="relative rounded-xl overflow-hidden transition-all hover:scale-[1.01]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: pack.popular ? `1px solid ${pack.color}40` : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {pack.popular && (
                  <div
                    className="absolute top-0 right-0 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg"
                    style={{ background: pack.color, color: 'white' }}
                  >
                    Best Value
                  </div>
                )}

                <div className="flex items-center gap-4 p-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${pack.color}20`, border: `1px solid ${pack.color}30` }}
                  >
                    <Icon size={22} style={{ color: pack.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white">{pack.name}</h3>
                    <p className="text-xs text-amber-400/70 mt-0.5">
                      <span className="font-bold text-amber-400">{pack.coins.toLocaleString()}</span> coins
                    </p>
                  </div>

                  <button
                    onClick={() => handlePurchase(pack)}
                    disabled={isPurchasing}
                    className="px-5 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
                    style={{
                      background: wasPurchased ? '#16a34a' : `linear-gradient(135deg, ${pack.color}, ${pack.color}cc)`,
                      color: 'white',
                    }}
                  >
                    {wasPurchased ? (
                      <span className="flex items-center gap-1"><Check size={14} /> Added!</span>
                    ) : isPurchasing ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      pack.priceDisplay
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-3">
            <p className="text-[11px] text-white/20 text-center leading-relaxed">
              Powered by Stripe. Your payment info is secure and encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
