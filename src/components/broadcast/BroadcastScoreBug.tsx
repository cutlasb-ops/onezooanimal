import { useState, useEffect } from 'react';

interface BroadcastScoreBugProps {
  animalName: string;
  animalSpecies: string;
  timeActive: string;
  mood: string;
  viewerCount: number;
  avatarEmoji: string;
}

const moods = [
  { name: 'PLAYFUL', emoji: '🎉', color: 'from-blue-500 to-blue-600' },
  { name: 'CALM', emoji: '😌', color: 'from-green-500 to-green-600' },
  { name: 'CURIOUS', emoji: '🔍', color: 'from-yellow-500 to-yellow-600' },
  { name: 'RESTING', emoji: '😴', color: 'from-purple-500 to-purple-600' },
  { name: 'ACTIVE', emoji: '⚡', color: 'from-red-500 to-red-600' },
];

export function BroadcastScoreBug({ animalName, animalSpecies, timeActive, mood, viewerCount, avatarEmoji }: BroadcastScoreBugProps) {
  const [displayMood, setDisplayMood] = useState(mood);
  const moodData = moods.find(m => m.name === displayMood) || moods[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayMood(moods[Math.floor(Math.random() * moods.length)].name);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-6 left-6 z-40">
      <div className="w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/30 rounded-lg overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-3 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{avatarEmoji}</span>
            <div>
              <h3 className="font-black text-white text-lg leading-tight">{animalName.toUpperCase()}</h3>
              <p className="text-xs text-amber-300/80 font-semibold">{animalSpecies}</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300 font-semibold">Active:</span>
            <span className="text-amber-300 font-bold">{timeActive}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-semibold text-sm">Mood:</span>
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${moodData.color} text-white font-bold text-sm flex items-center gap-1`}>
              <span>{moodData.emoji}</span>
              <span>{displayMood}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-500/20 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">VIEWERS</span>
              <span className="text-white font-bold text-lg">{viewerCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-60" />
      </div>
    </div>
  );
}
