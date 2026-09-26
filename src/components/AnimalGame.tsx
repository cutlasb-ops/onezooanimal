import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Gamepad2, Trophy, Heart, Zap, RotateCcw } from 'lucide-react';

interface AnimalGameProps {
  isOpen: boolean;
  onClose: () => void;
}

const ANIMALS = [
  { emoji: '🦁', name: 'Lion', sound: 'ROAR!', points: 10, speed: 1 },
  { emoji: '🐘', name: 'Elephant', sound: 'TRUMPET!', points: 15, speed: 0.7 },
  { emoji: '🦊', name: 'Fox', sound: 'YIP!', points: 20, speed: 1.5 },
  { emoji: '🐆', name: 'Cheetah', sound: 'HISS!', points: 30, speed: 2.2 },
  { emoji: '🦒', name: 'Giraffe', sound: 'SNORT!', points: 12, speed: 0.9 },
  { emoji: '🦓', name: 'Zebra', sound: 'BARK!', points: 18, speed: 1.3 },
  { emoji: '🐊', name: 'Croc', sound: 'SNAP!', points: 25, speed: 1.1 },
  { emoji: '🦏', name: 'Rhino', sound: 'GRUNT!', points: 22, speed: 0.8 },
  { emoji: '🦩', name: 'Flamingo', sound: 'SQUAWK!', points: 8, speed: 1.6 },
  { emoji: '🐍', name: 'Snake', sound: 'HISSSS!', points: 35, speed: 1.8 },
];

const POISON = { emoji: '🪲', name: 'Bug', points: -1, speed: 1.2 };

type GameAnimal = {
  id: number;
  x: number;
  y: number;
  emoji: string;
  name: string;
  sound?: string;
  points: number;
  speed: number;
  dx: number;
  dy: number;
  isPoison: boolean;
  bounce: number;
  caught?: boolean;
  caughtAt?: number;
  showSound?: boolean;
};

const ARENA_W = 600;
const ARENA_H = 360;
const ANIMAL_SIZE = 52;
const GAME_DURATION = 45;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function spawnAnimal(id: number, isPoison = false): GameAnimal {
  const template = isPoison ? null : ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const speed = isPoison ? POISON.speed : (template!.speed + Math.random() * 0.4 - 0.2);
  const angle = Math.random() * Math.PI * 2;
  return {
    id,
    x: Math.random() * (ARENA_W - ANIMAL_SIZE),
    y: Math.random() * (ARENA_H - ANIMAL_SIZE),
    emoji: isPoison ? POISON.emoji : template!.emoji,
    name: isPoison ? POISON.name : template!.name,
    sound: isPoison ? undefined : template!.sound,
    points: isPoison ? POISON.points : template!.points,
    speed,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    isPoison,
    bounce: 0,
  };
}

type Phase = 'idle' | 'playing' | 'gameover';

export function AnimalGame({ isOpen, onClose }: AnimalGameProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem('onezoo_hiscore') || '0'); } catch { return 0; }
  });
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [animals, setAnimals] = useState<GameAnimal[]>([]);
  const [popups, setPopups] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([]);
  const [combo, setCombo] = useState(0);
  const [lastSound, setLastSound] = useState<string | null>(null);
  const [level, setLevel] = useState(1);

  const nextId = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const spawnRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const getId = () => ++nextId.current;

  const startGame = useCallback(() => {
    setPhase('playing');
    setScore(0);
    setLives(3);
    setTimeLeft(GAME_DURATION);
    setCombo(0);
    setLevel(1);
    setPopups([]);
    const initial: GameAnimal[] = [];
    for (let i = 0; i < 5; i++) initial.push(spawnAnimal(getId()));
    initial.push(spawnAnimal(getId(), true));
    setAnimals(initial);
  }, []);

  const addPopup = useCallback((x: number, y: number, text: string, color: string) => {
    const id = getId();
    setPopups(p => [...p, { id, x, y, text, color }]);
    setTimeout(() => setPopups(p => p.filter(pp => pp.id !== id)), 900);
  }, []);

  const handleCatch = useCallback((animal: GameAnimal) => {
    if (animal.caught) return;

    setAnimals(prev => prev.map(a => a.id === animal.id ? { ...a, caught: true, caughtAt: Date.now(), showSound: true } : a));

    if (animal.isPoison) {
      setLives(l => {
        const next = l - 1;
        if (next <= 0) setPhase('gameover');
        return next;
      });
      setCombo(0);
      addPopup(animal.x, animal.y, '-1 Life!', '#ef4444');
    } else {
      setCombo(c => c + 1);
      const newCombo = combo + 1;
      const multiplier = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;
      const earned = animal.points * multiplier;
      setScore(s => s + earned);
      const label = multiplier > 1 ? `+${earned} x${multiplier} COMBO!` : `+${earned}`;
      addPopup(animal.x, animal.y - 20, label, multiplier > 1 ? '#fbbf24' : '#4ade80');
      if (animal.sound) setLastSound(animal.sound);
      setTimeout(() => setLastSound(null), 800);
    }

    setTimeout(() => {
      setAnimals(prev => {
        const filtered = prev.filter(a => a.id !== animal.id);
        const isPoison = Math.random() < 0.18;
        return [...filtered, spawnAnimal(getId(), isPoison)];
      });
    }, 400);
  }, [combo, addPopup]);

  useEffect(() => {
    if (phase !== 'playing') return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setPhase('gameover');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    spawnRef.current = window.setInterval(() => {
      setLevel(l => {
        setAnimals(prev => {
          const cap = Math.min(5 + l * 2, 18);
          if (prev.length < cap) {
            const isPoison = Math.random() < 0.15 + l * 0.02;
            return [...prev, spawnAnimal(getId(), isPoison)];
          }
          return prev;
        });
        return l;
      });
    }, 2000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    const tick = (ts: number) => {
      const dt = Math.min((ts - lastTimeRef.current) / 16, 3);
      lastTimeRef.current = ts;

      setAnimals(prev => prev.map(a => {
        if (a.caught) return a;
        let nx = a.x + a.dx * dt;
        let ny = a.y + a.dy * dt;
        let ndx = a.dx;
        let ndy = a.dy;

        if (nx <= 0 || nx >= ARENA_W - ANIMAL_SIZE) {
          ndx = -ndx;
          nx = clamp(nx, 0, ARENA_W - ANIMAL_SIZE);
        }
        if (ny <= 0 || ny >= ARENA_H - ANIMAL_SIZE) {
          ndy = -ndy;
          ny = clamp(ny, 0, ARENA_H - ANIMAL_SIZE);
        }

        if (Math.random() < 0.005) {
          const angle = Math.random() * Math.PI * 2;
          ndx = Math.cos(angle) * a.speed;
          ndy = Math.sin(angle) * a.speed;
        }

        return { ...a, x: nx, y: ny, dx: ndx, dy: ndy, bounce: (a.bounce + 0.12) % (Math.PI * 2) };
      }));

      gameLoopRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(tick);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'gameover') {
      setHighScore(prev => {
        const next = Math.max(prev, score);
        try { localStorage.setItem('onezoo_hiscore', String(next)); } catch {}
        return next;
      });
    }
  }, [phase, score]);

  useEffect(() => {
    setLevel(l => {
      const newLevel = Math.floor(score / 150) + 1;
      return Math.max(l, newLevel);
    });
  }, [score]);

  if (!isOpen) return null;

  const timerPct = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timerPct > 50 ? '#4ade80' : timerPct > 25 ? '#fbbf24' : '#ef4444';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl"
        style={{
          background: 'linear-gradient(145deg, #0f1a0a 0%, #1a2e10 40%, #0d1f08 100%)',
          border: '2px solid #3d6b20',
          boxShadow: '0 0 60px rgba(74,222,128,0.15), 0 0 120px rgba(0,0,0,0.8)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 32px, rgba(74,222,128,0.3) 32px, rgba(74,222,128,0.3) 33px), repeating-linear-gradient(90deg, transparent, transparent 32px, rgba(74,222,128,0.3) 32px, rgba(74,222,128,0.3) 33px)',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between px-5 py-3 border-b border-green-900/60">
            <div className="flex items-center gap-2">
              <Gamepad2 size={20} className="text-green-400" />
              <span className="font-bold text-green-300 tracking-wider text-sm uppercase">Animal Safari Catch</span>
              {phase === 'playing' && level > 1 && (
                <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold bg-yellow-600/30 text-yellow-300 border border-yellow-600/40">
                  LVL {level}
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-green-600 hover:text-green-300 transition-colors">
              <X size={20} />
            </button>
          </div>

          {phase === 'idle' && (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-5">
              <div className="text-7xl mb-2 animate-bounce">🦁</div>
              <h2
                className="text-4xl font-black tracking-widest uppercase"
                style={{ color: '#86efac', textShadow: '0 0 20px rgba(74,222,128,0.6)' }}
              >
                Animal Safari
              </h2>
              <p className="text-green-400/80 text-sm max-w-xs">
                Tap the animals before they escape! Avoid the bugs or lose a life. Build combos for bonus points!
              </p>
              <div className="flex gap-6 text-xs text-green-500/70 mt-1">
                <span>🦁 = 10 pts</span>
                <span>🐆 = 30 pts</span>
                <span>🐍 = 35 pts</span>
                <span>🪲 = -1 life</span>
              </div>
              {highScore > 0 && (
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <Trophy size={16} />
                  Best: {highScore}
                </div>
              )}
              <button
                onClick={startGame}
                className="mt-2 px-10 py-3 rounded-xl font-black text-lg uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #4ade80)',
                  color: '#052e16',
                  boxShadow: '0 0 30px rgba(74,222,128,0.4)',
                }}
              >
                Start Hunt!
              </button>
            </div>
          )}

          {phase === 'playing' && (
            <div>
              <div className="flex items-center gap-4 px-5 py-2">
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart
                      key={i}
                      size={18}
                      className={i < lives ? 'text-red-400' : 'text-gray-700'}
                      fill={i < lives ? '#f87171' : 'none'}
                    />
                  ))}
                </div>
                <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
                  />
                </div>
                <span className="text-sm font-bold tabular-nums" style={{ color: timerColor }}>{timeLeft}s</span>
                <div className="flex items-center gap-1.5 ml-2">
                  <Zap size={16} className="text-yellow-400" />
                  <span className="text-yellow-300 font-black text-lg tabular-nums">{score}</span>
                </div>
                {combo >= 2 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-600/30 text-orange-300 border border-orange-600/30 animate-pulse">
                    x{combo >= 5 ? 3 : combo >= 3 ? 2 : 1} COMBO
                  </span>
                )}
              </div>

              <div
                className="relative mx-3 mb-3 rounded-xl overflow-hidden select-none"
                style={{
                  width: ARENA_W,
                  height: ARENA_H,
                  maxWidth: '100%',
                  background: 'radial-gradient(ellipse at 50% 80%, #052e16 0%, #0a1f06 60%, #071205 100%)',
                  border: '1px solid #166534',
                  cursor: 'crosshair',
                }}
              >
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20% 70%, #166534 1px, transparent 1px), radial-gradient(circle at 60% 30%, #166534 1px, transparent 1px), radial-gradient(circle at 80% 60%, #166534 1px, transparent 1px)',
                    backgroundSize: '80px 80px, 120px 120px, 60px 60px',
                  }}
                />

                {lastSound && (
                  <div
                    className="absolute top-3 left-1/2 -translate-x-1/2 font-black text-2xl z-20 pointer-events-none animate-ping"
                    style={{ color: '#fbbf24', textShadow: '0 0 10px #fbbf24' }}
                  >
                    {lastSound}
                  </div>
                )}

                {animals.map(animal => (
                  <button
                    key={animal.id}
                    onClick={() => handleCatch(animal)}
                    className="absolute transition-none focus:outline-none"
                    style={{
                      left: animal.x,
                      top: animal.y,
                      width: ANIMAL_SIZE,
                      height: ANIMAL_SIZE,
                      fontSize: 36,
                      lineHeight: 1,
                      transform: animal.caught
                        ? 'scale(1.6) rotate(20deg)'
                        : `translateY(${Math.sin(animal.bounce) * 3}px)`,
                      opacity: animal.caught ? 0 : 1,
                      transition: animal.caught ? 'opacity 0.3s, transform 0.3s' : 'none',
                      filter: animal.isPoison ? 'drop-shadow(0 0 6px #ef4444)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
                      zIndex: 10,
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                    }}
                  >
                    {animal.emoji}
                  </button>
                ))}

                {popups.map(p => (
                  <div
                    key={p.id}
                    className="absolute pointer-events-none font-black text-sm z-30 animate-bounce"
                    style={{
                      left: p.x,
                      top: p.y,
                      color: p.color,
                      textShadow: `0 0 8px ${p.color}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === 'gameover' && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-5">
              <div className="text-6xl">
                {score >= highScore && score > 0 ? '🏆' : '🌿'}
              </div>
              <h2
                className="text-3xl font-black tracking-widest uppercase"
                style={{ color: '#86efac', textShadow: '0 0 20px rgba(74,222,128,0.5)' }}
              >
                {score >= highScore && score > 0 ? 'New Record!' : 'Hunt Over!'}
              </h2>
              <div className="flex gap-8 mt-2">
                <div className="text-center">
                  <p className="text-green-600 text-xs uppercase tracking-wider mb-1">Score</p>
                  <p className="text-4xl font-black text-green-300">{score}</p>
                </div>
                <div className="w-px bg-green-900" />
                <div className="text-center">
                  <p className="text-yellow-600 text-xs uppercase tracking-wider mb-1">Best</p>
                  <p className="text-4xl font-black text-yellow-300">{Math.max(highScore, score)}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #16a34a, #4ade80)',
                    color: '#052e16',
                    boxShadow: '0 0 20px rgba(74,222,128,0.3)',
                  }}
                >
                  <RotateCcw size={16} />
                  Play Again
                </button>
                <button
                  onClick={onClose}
                  className="px-7 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm bg-green-900/30 text-green-400 border border-green-800/50 hover:bg-green-900/50 transition-colors"
                >
                  Exit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
