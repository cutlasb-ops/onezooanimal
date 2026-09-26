import { Download, Share2, Clock, Users, Star, TrendingUp } from 'lucide-react';

interface RecapCardProps {
  animalName: string;
  animalEmoji: string;
  streamDuration: string;
  peakViewers: number;
  totalInteractions: number;
  treatsReceived: number;
  rareMoments: string[];
  topContributors: Array<{ username: string; treats: number }>;
  conservationRaised: number;
  nextStreamTime: string;
}

export function RecapCard({
  animalName,
  animalEmoji,
  streamDuration,
  peakViewers,
  totalInteractions,
  treatsReceived,
  rareMoments,
  topContributors,
  conservationRaised,
  nextStreamTime,
}: RecapCardProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-amber-900/40 to-yellow-900/30 px-6 py-4 border-b border-amber-500/20">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{animalEmoji}</span>
            <div>
              <p className="text-amber-300 font-black text-sm uppercase tracking-widest">Stream Recap</p>
              <h2 className="text-3xl font-black text-white">Today with {animalName}</h2>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-600/40 rounded-lg p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Duration</p>
              <p className="text-2xl font-black text-amber-300">{streamDuration}</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-600/40 rounded-lg p-4">
              <div className="flex items-center gap-1 mb-2">
                <Users size={14} className="text-blue-400" />
                <p className="text-xs text-slate-400 font-semibold uppercase">Peak Viewers</p>
              </div>
              <p className="text-2xl font-black text-blue-300">{peakViewers.toLocaleString()}</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-600/40 rounded-lg p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Interactions</p>
              <p className="text-2xl font-black text-pink-300">{totalInteractions.toLocaleString()}</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-600/40 rounded-lg p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Treats</p>
              <p className="text-2xl font-black text-yellow-300">{treatsReceived}</p>
            </div>
          </div>

          <div className="border-t border-slate-700">
            <h3 className="text-lg font-black text-white mt-6 mb-3 flex items-center gap-2">
              <Star size={20} className="text-amber-400" />
              Highlight Moments
            </h3>

            <div className="space-y-2">
              {rareMoments.map((moment, idx) => (
                <div key={idx} className="bg-slate-800/60 border border-slate-600/40 rounded-lg p-3 flex items-start gap-3">
                  <span className="text-xl">✨</span>
                  <p className="text-slate-200">{moment}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700">
            <h3 className="text-lg font-black text-white mt-6 mb-3 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-400" />
              Top Contributors
            </h3>

            <div className="space-y-2">
              {topContributors.map((contributor, idx) => (
                <div key={idx} className="bg-slate-800/60 border border-slate-600/40 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-amber-400">#{idx + 1}</span>
                    <p className="text-white font-semibold">@{contributor.username}</p>
                  </div>
                  <span className="text-xl">🎁 {contributor.treats}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border border-emerald-500/30 rounded-lg p-4">
            <p className="text-xs text-emerald-300 font-semibold uppercase mb-2">Conservation Impact</p>
            <p className="text-3xl font-black text-emerald-300 mb-1">${conservationRaised}</p>
            <p className="text-sm text-slate-300">donated to conservation efforts this stream</p>
          </div>

          <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/40 rounded-lg p-4 text-center">
            <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Next Stream</p>
            <p className="text-lg font-black text-white mb-3">{nextStreamTime}</p>
            <p className="text-sm text-slate-300">Don't miss {animalName}'s next appearance</p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-t border-amber-500/20 flex gap-3">
          <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Download size={18} />
            Download Recap
          </button>
          <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Share2 size={18} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
