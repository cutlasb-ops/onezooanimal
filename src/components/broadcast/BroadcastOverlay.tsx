import { useState, useEffect } from 'react';

interface BroadcastOverlayProps {
  activityLevel: number;
  feedingEvents: number;
  rareBehaviors: number;
  treatCount: number;
  conservationMilestone: string;
  statType?: 'activity' | 'feeding' | 'conservation' | 'interaction';
}

const stats = [
  { icon: '🐾', label: 'Activity', color: 'from-blue-500 to-blue-600' },
  { icon: '🍽️', label: 'Feeding Events', color: 'from-orange-500 to-orange-600' },
  { icon: '⭐', label: 'Rare Behaviors', color: 'from-purple-500 to-purple-600' },
  { icon: '🎁', label: 'Treats Received', color: 'from-pink-500 to-pink-600' },
];

export function ActivityMeter({ activityLevel }: { activityLevel: number }) {
  const getActivityText = (level: number) => {
    if (level < 20) return 'SLEEPING';
    if (level < 40) return 'RESTING';
    if (level < 60) return 'MODERATE';
    if (level < 80) return 'VERY ACTIVE';
    return 'EXTREMELY ACTIVE';
  };

  const getActivityColor = (level: number) => {
    if (level < 20) return 'from-gray-500 to-gray-600';
    if (level < 40) return 'from-blue-500 to-blue-600';
    if (level < 60) return 'from-yellow-500 to-yellow-600';
    if (level < 80) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="fixed bottom-8 left-8 z-40 w-96">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ACTIVITY LEVEL</span>
          <span className="text-sm font-bold text-amber-300">{getActivityText(activityLevel)}</span>
        </div>

        <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden border border-slate-600">
          <div
            className={`h-full bg-gradient-to-r ${getActivityColor(activityLevel)} transition-all duration-1000`}
            style={{ width: `${Math.min(activityLevel, 100)}%` }}
          />
        </div>

        <div className="flex justify-between mt-2">
          <span className="text-xs text-slate-400">REST</span>
          <span className="text-xs text-slate-400">ACTIVE</span>
        </div>
      </div>
    </div>
  );
}

export function StatLine({
  feedingEvents,
  rareBehaviors,
  treatCount,
  conservationMilestone,
}: Omit<BroadcastOverlayProps, 'activityLevel' | 'statType'>) {
  const [currentStatIndex, setCurrentStatIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex(prev => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatContent = () => {
    switch (currentStatIndex) {
      case 0:
        return {
          label: 'FEEDING EVENTS',
          value: feedingEvents,
          detail: 'today',
          icon: '🍽️',
        };
      case 1:
        return {
          label: 'RARE BEHAVIORS',
          value: rareBehaviors,
          detail: 'detected',
          icon: '⭐',
        };
      case 2:
        return {
          label: 'TREATS RECEIVED',
          value: treatCount,
          detail: 'this session',
          icon: '🎁',
        };
      default:
        return {
          label: 'CONSERVATION',
          value: conservationMilestone,
          detail: 'status',
          icon: '🌍',
        };
    }
  };

  const stat = getStatContent();

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/40 rounded-lg px-6 py-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{stat.icon}</span>

          <div>
            <p className="text-xs font-black text-amber-300 uppercase tracking-wider mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{stat.value}</span>
              <span className="text-xs text-slate-400 font-semibold">{stat.detail}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60 rounded-full" />

        <div className="flex gap-1 mt-2 justify-center">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-1 w-2 rounded-full transition-colors ${
                i === currentStatIndex ? 'bg-amber-400' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BroadcastOverlay({
  activityLevel,
  feedingEvents,
  rareBehaviors,
  treatCount,
  conservationMilestone,
}: BroadcastOverlayProps) {
  return (
    <>
      <ActivityMeter activityLevel={activityLevel} />
      <StatLine
        feedingEvents={feedingEvents}
        rareBehaviors={rareBehaviors}
        treatCount={treatCount}
        conservationMilestone={conservationMilestone}
      />
    </>
  );
}
