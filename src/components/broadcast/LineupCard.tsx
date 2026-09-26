import { Clock, TrendingUp, Bell } from 'lucide-react';

interface Animal {
  id: string;
  name: string;
  species: string;
  age: number;
  emoji: string;
  expectedActivity: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  status: 'THRIVING' | 'HEALTHY' | 'ACTIVE' | 'RESTING';
  keeperNote: string;
}

interface LineupCardProps {
  animals: Animal[];
  showTime?: string;
}

const getActivityColor = (activity: string) => {
  switch (activity) {
    case 'LOW':
      return 'from-gray-500 to-gray-600';
    case 'MODERATE':
      return 'from-blue-500 to-blue-600';
    case 'HIGH':
      return 'from-orange-500 to-orange-600';
    case 'VERY HIGH':
      return 'from-red-500 to-red-600';
    default:
      return 'from-slate-500 to-slate-600';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'THRIVING':
      return 'text-green-400';
    case 'HEALTHY':
      return 'text-blue-400';
    case 'ACTIVE':
      return 'text-orange-400';
    case 'RESTING':
      return 'text-purple-400';
    default:
      return 'text-slate-400';
  }
};

export function LineupCard({ animals, showTime = '2:00 PM EST' }: LineupCardProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-amber-900/40 to-yellow-900/30 px-6 py-4 border-b border-amber-500/20">
          <div className="text-center">
            <p className="text-amber-300 font-black text-sm uppercase tracking-widest mb-1">Tonight On OneZoo</p>
            <h2 className="text-4xl font-black text-white mb-2">Featured Animals</h2>
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Clock size={16} />
              <span className="font-semibold">{showTime}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {animals.map((animal, index) => (
            <div
              key={animal.id}
              className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/40 rounded-lg overflow-hidden hover:border-amber-500/40 transition-colors"
            >
              <div className="p-4">
                <div className="flex items-start gap-4 mb-3">
                  <div className="text-4xl">{animal.emoji}</div>

                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="text-2xl font-black text-white">{animal.name.toUpperCase()}</h3>
                      <span className="text-xs text-slate-400">#{index + 1}</span>
                    </div>
                    <p className="text-sm text-amber-300 font-semibold mb-2">{animal.species}</p>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">Age: <span className="text-white font-bold">{animal.age}</span></span>
                      <span className={`font-bold ${getStatusColor(animal.status)}`}>
                        Status: {animal.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-semibold mb-1">Expected Activity</p>
                    <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${getActivityColor(animal.expectedActivity)} text-white font-bold text-sm`}>
                      {animal.expectedActivity}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded px-3 py-2 border border-slate-700/40">
                  <p className="text-xs text-slate-400 font-semibold mb-1">Keeper's Note</p>
                  <p className="text-sm text-slate-200">{animal.keeperNote}</p>
                </div>
              </div>

              <div className="h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0" />
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-t border-amber-500/20 flex gap-3">
          <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Bell size={18} />
            Set Reminder
          </button>
          <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
            Join Stream Now
          </button>
        </div>
      </div>
    </div>
  );
}
