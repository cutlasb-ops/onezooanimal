import { useState } from 'react';
import { X } from 'lucide-react';
import { AnimalGame } from './AnimalGame';
import { AnimalBattle } from './AnimalBattle';
import { WildMaze } from './WildMaze';

interface GameHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GameHub({ isOpen, onClose }: GameHubProps) {
  const [activeGame, setActiveGame] = useState<'hub' | 'catcher' | 'battle' | 'maze'>('hub');

  if (!isOpen) return null;

  if (activeGame === 'catcher') {
    return (
      <AnimalGame
        isOpen={true}
        onClose={() => setActiveGame('hub')}
      />
    );
  }

  if (activeGame === 'battle') {
    return (
      <AnimalBattle
        isOpen={true}
        onClose={() => setActiveGame('hub')}
      />
    );
  }

  if (activeGame === 'maze') {
    return (
      <WildMaze
        isOpen={true}
        onClose={() => setActiveGame('hub')}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0d2e14 100%)', border: '2px solid rgba(245,166,35,0.3)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-white/10"
          style={{ border: '2px solid rgba(245,166,35,0.5)', color: '#f5a623' }}
        >
          <X size={16} />
        </button>

        <div className="text-center px-8 pt-10 pb-6" style={{ borderBottom: '2px solid rgba(245,166,35,0.2)' }}>
          <div className="text-5xl mb-3">🎮</div>
          <h2 className="text-3xl font-black tracking-widest uppercase mb-1" style={{ color: '#f5a623' }}>Game Zone</h2>
          <p className="text-sm" style={{ color: '#aac' }}>Choose your adventure</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-8">
          <button
            onClick={() => setActiveGame('catcher')}
            className="group flex flex-col items-center gap-4 rounded-xl p-6 transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(22,163,74,0.12)', border: '2px solid rgba(74,222,128,0.3)' }}
          >
            <div className="text-5xl">🦁</div>
            <div className="text-center">
              <div className="text-lg font-bold mb-1" style={{ color: '#4ade80' }}>Animal Catcher</div>
              <div className="text-xs" style={{ color: '#556' }}>Tap animals before they escape!</div>
            </div>
            <span
              className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-colors"
              style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.4)' }}
            >
              Play Now
            </span>
          </button>

          <button
            onClick={() => setActiveGame('battle')}
            className="group flex flex-col items-center gap-4 rounded-xl p-6 transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(245,166,35,0.1)', border: '2px solid rgba(245,166,35,0.3)' }}
          >
            <div className="text-5xl">⚔️</div>
            <div className="text-center">
              <div className="text-lg font-bold mb-1" style={{ color: '#f5a623' }}>Battle Arena</div>
              <div className="text-xs" style={{ color: '#556' }}>Pick fighters and watch them battle!</div>
            </div>
            <span
              className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-colors"
              style={{ background: 'rgba(245,166,35,0.2)', color: '#f5a623', border: '1px solid rgba(245,166,35,0.4)' }}
            >
              Play Now
            </span>
          </button>

          <button
            onClick={() => setActiveGame('maze')}
            className="group flex flex-col items-center gap-4 rounded-xl p-6 transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(56,189,248,0.1)', border: '2px solid rgba(56,189,248,0.3)' }}
          >
            <div className="text-5xl">🦊</div>
            <div className="text-center">
              <div className="text-lg font-bold mb-1" style={{ color: '#38bdf8' }}>Wild Maze</div>
              <div className="text-xs" style={{ color: '#556' }}>Escape the predators, clear the maze!</div>
            </div>
            <span
              className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-colors"
              style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)' }}
            >
              Play Now
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
