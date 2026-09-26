import { useState } from 'react';
import { ChevronDown, ChevronUp, Leaf, Heart, TrendingUp } from 'lucide-react';

interface ConservationTrackerProps {
  animalName: string;
  species: string;
  raisedToday: number;
  raisedTotal: number;
  treatsDonated: number;
  treesPlanted: number;
  wildPopulation: number;
  populationTrend: number;
  isCollapsed?: boolean;
}

export function ConservationTracker({
  animalName,
  species,
  raisedToday,
  raisedTotal,
  treatsDonated,
  treesPlanted,
  wildPopulation,
  populationTrend,
  isCollapsed: initialCollapsed = true,
}: ConservationTrackerProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  return (
    <div className="fixed right-8 top-32 z-40 w-80">
      <div className="bg-gradient-to-br from-emerald-950 to-slate-900 border-2 border-emerald-500/40 rounded-lg overflow-hidden shadow-2xl">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-4 py-3 bg-gradient-to-r from-emerald-900 to-emerald-800 hover:from-emerald-800 hover:to-emerald-700 transition-colors flex items-center justify-between text-white font-bold"
        >
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-red-400" />
            <span>CONSERVATION IMPACT</span>
          </div>
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>

        {!isCollapsed && (
          <div className="p-4 space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-emerald-500/20">
              <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wide mb-2">Today's Raise</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-300">${raisedToday}</span>
                <span className="text-xs text-slate-400">for {species} conservation</span>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-3 border border-emerald-500/20">
              <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wide mb-2">Total Raised</p>
              <p className="text-2xl font-black text-amber-300">${raisedTotal.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3 border border-emerald-500/20">
                <div className="flex items-center gap-1 mb-1">
                  <Leaf size={14} className="text-green-400" />
                  <p className="text-xs text-slate-400 font-semibold">Trees Planted</p>
                </div>
                <p className="text-xl font-black text-green-400">{treesPlanted}</p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 border border-emerald-500/20">
                <p className="text-xs text-slate-400 font-semibold mb-1">Treats → Trees</p>
                <p className="text-xl font-black text-yellow-400">{treatsDonated}</p>
              </div>
            </div>

            <div className="border-t border-emerald-500/20 pt-3 mt-3">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Population</p>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-emerald-500/20">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-lg font-black text-white">{wildPopulation.toLocaleString()}</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={16} className={populationTrend >= 0 ? 'text-green-400' : 'text-red-400'} />
                    <span className={`text-sm font-bold ${populationTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {populationTrend >= 0 ? '+' : ''}{populationTrend}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">wild {species.toLowerCase()} since 2004</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-900/40 to-blue-900/40 rounded-lg p-3 border border-emerald-500/30">
              <p className="text-xs text-emerald-300 font-semibold text-center">
                Your contribution matters. Every treat is a step toward conservation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
