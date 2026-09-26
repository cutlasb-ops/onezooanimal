import { useState } from 'react';
import { AlertCircle, Heart, Lightbulb, Zap, Gift } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface KeeperMomentTriggerProps {
  animalId: string;
  sessionId: string;
  animalName: string;
  onMomentTriggered: (moment: RareMomentData) => void;
}

interface RareMomentData {
  type: 'rare' | 'cute' | 'feeding' | 'playful' | 'surprise';
  name: string;
  description: string;
}

const momentTypes: Record<string, { icon: React.ReactNode; label: string; color: string; description: string }> = {
  rare: {
    icon: <AlertCircle size={20} />,
    label: 'Rare Moment',
    color: 'from-red-600 to-red-700',
    description: 'This only happens occasionally',
  },
  cute: {
    icon: <Heart size={20} />,
    label: 'Cute Moment',
    color: 'from-pink-600 to-pink-700',
    description: 'Aww-inducing behavior',
  },
  feeding: {
    icon: <Gift size={20} />,
    label: 'Feeding Time',
    color: 'from-orange-600 to-orange-700',
    description: 'Mealtime happening now',
  },
  playful: {
    icon: <Zap size={20} />,
    label: 'Playful Mode',
    color: 'from-yellow-600 to-yellow-700',
    description: 'Fun and energetic behavior',
  },
  surprise: {
    icon: <Lightbulb size={20} />,
    label: 'Surprise Event',
    color: 'from-purple-600 to-purple-700',
    description: 'Something unexpected!',
  },
};

export function KeeperMomentTrigger({ animalId, sessionId, animalName, onMomentTriggered }: KeeperMomentTriggerProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [recentMoments, setRecentMoments] = useState<RareMomentData[]>([]);

  const handleTrigger = async () => {
    if (!selectedType || !description) return;

    setSaving(true);
    try {
      const momentType = selectedType as 'rare' | 'cute' | 'feeding' | 'playful' | 'surprise';
      const momentData: RareMomentData = {
        type: momentType,
        name: momentTypes[selectedType].label,
        description,
      };

      await supabase
        .from('onezoo_rare_moments')
        .insert({
          animal_id: animalId,
          session_id: sessionId,
          moment_type: selectedType,
          keeper_description: description,
          avatar_commentary: `${animalName} is ${description}`,
        });

      onMomentTriggered(momentData);
      setRecentMoments([momentData, ...recentMoments.slice(0, 4)]);
      setDescription('');
      setSelectedType(null);
    } catch (error) {
      console.error('Error triggering moment:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-40 w-96">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-500/30 rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-3 border-b border-amber-500/20">
          <h3 className="text-lg font-black text-white">Keeper Moment Trigger</h3>
          <p className="text-xs text-slate-400 mt-1">For zoo staff only</p>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(momentTypes).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`p-3 rounded-lg transition-all border-2 ${
                  selectedType === key
                    ? `bg-gradient-to-r ${data.color} text-white border-white`
                    : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">{data.icon}</div>
                <p className="text-xs font-bold">{data.label}</p>
                <p className="text-xs text-slate-300/80 mt-1">{data.description}</p>
              </button>
            ))}
          </div>

          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe what's happening right now..."
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            rows={3}
          />

          <button
            onClick={handleTrigger}
            disabled={!selectedType || !description.trim() || saving}
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:from-slate-700 disabled:to-slate-600 text-white font-bold py-2 px-4 rounded transition-all"
          >
            {saving ? 'Triggering...' : 'Trigger Moment'}
          </button>

          {recentMoments.length > 0 && (
            <div className="border-t border-slate-700 pt-3 mt-3">
              <p className="text-xs text-slate-400 font-semibold mb-2">Recent Moments</p>
              <div className="space-y-2">
                {recentMoments.slice(0, 3).map((moment, idx) => (
                  <div key={idx} className="bg-slate-700/50 rounded p-2 border border-slate-600">
                    <p className="text-xs font-semibold text-amber-300">{moment.name}</p>
                    <p className="text-xs text-slate-300 mt-1">{moment.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
