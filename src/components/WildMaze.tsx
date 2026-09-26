import { useCallback, useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WildMazeProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAZE_TEMPLATE = [
  '###################',
  '#........#........#',
  '#.###.##.#.##.###.#',
  '#.#.............#.#',
  '#.#.###.###.###.#.#',
  '#.....#.....#.....#',
  '###.#.#.###.#.#.###',
  '#...#...#.#...#...#',
  '#.#####.#.#.#####.#',
  '#.................#',
  '#.#####.#.#.#####.#',
  '#...#...#.#...#...#',
  '###.#.#.###.#.#.###',
  '#.....#.....#.....#',
  '#.#.###.###.###.#.#',
  '#.#.............#.#',
  '#.###.##.#.##.###.#',
  '#........#........#',
  '###################',
];

interface Hunter {
  id: number;
  x: number;
  y: number;
  emoji: string;
  name: string;
}

const START_HUNTERS: Hunter[] = [
  { id: 1, x: 17, y: 17, emoji: '🐯', name: 'Tiger' },
  { id: 2, x: 17, y: 1, emoji: '🦁', name: 'Lion' },
  { id: 3, x: 1, y: 17, emoji: '🐺', name: 'Wolf' },
  { id: 4, x: 9, y: 9, emoji: '🐻', name: 'Bear' },
  { id: 5, x: 15, y: 9, emoji: '🐊', name: 'Crocodile' },
  { id: 6, x: 9, y: 15, emoji: '🦅', name: 'Eagle' },
];

const HERO_START = { x: 1, y: 1 };

type PowerupType = 'life' | 'speed' | 'freeze' | 'shield' | 'score';

const POWERUP_TYPES: Array<{ type: PowerupType; emoji: string; label: string }> = [
  { type: 'life', emoji: '❤️', label: 'Extra Life' },
  { type: 'speed', emoji: '⚡', label: 'Speed Boost' },
  { type: 'freeze', emoji: '❄️', label: 'Freeze Hunters' },
  { type: 'shield', emoji: '🛡️', label: 'Shield' },
  { type: 'score', emoji: '💎', label: 'Score Bonus' },
];

interface Powerup {
  id: string;
  x: number;
  y: number;
  type: PowerupType;
  emoji: string;
  label: string;
}

interface LeaderboardEntry {
  name: string;
  score: number;
}

const BOARD_WIDTH = MAZE_TEMPLATE[0].length;
const BOARD_HEIGHT = MAZE_TEMPLATE.length;

function createBoard(): string[][] {
  return MAZE_TEMPLATE.map((row) => row.split(''));
}

function generatePowerups(board: string[][]): Powerup[] {
  const powerups: Powerup[] = [];
  for (let i = 0; i < 12; i++) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 500) {
      attempts++;
      const x = Math.floor(Math.random() * BOARD_WIDTH);
      const y = Math.floor(Math.random() * BOARD_HEIGHT);
      if (board[y][x] === '.') {
        const random = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
        powerups.push({ id: `${x}-${y}-${i}`, x, y, ...random });
        placed = true;
      }
    }
  }
  return powerups;
}

function isWall(board: string[][], x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return true;
  return board[y][x] === '#';
}

export function WildMaze({ isOpen, onClose }: WildMazeProps) {
  const initialBoard = useMemo(() => createBoard(), []);

  const [board, setBoard] = useState<string[][]>(initialBoard);
  const [hero, setHero] = useState(HERO_START);
  const [hunters, setHunters] = useState<Hunter[]>(START_HUNTERS);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [lastBonus, setLastBonus] = useState('');
  const [powerups, setPowerups] = useState<Powerup[]>(() => generatePowerups(initialBoard));
  const [shieldActive, setShieldActive] = useState(false);
  const [freezeHunters, setFreezeHunters] = useState(false);
  const [speedBoost, setSpeedBoost] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState(() => {
    try {
      return localStorage.getItem('wildMazePlayerName') || '';
    } catch {
      return '';
    }
  });
  const [submitted, setSubmitted] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from('wild_maze_scores')
      .select('name,score')
      .order('score', { ascending: false })
      .limit(10);
    if (data) setLeaderboard(data as LeaderboardEntry[]);
  }, []);

  useEffect(() => {
    if (isOpen) loadLeaderboard();
  }, [isOpen, loadLeaderboard]);

  const checkHunterCollision = useCallback(
    (nextHero: { x: number; y: number }) =>
      hunters.some((h) => h.x === nextHero.x && h.y === nextHero.y),
    [hunters]
  );

  const loseLifeOrEnd = useCallback(() => {
    setLives((current) => {
      if (current <= 1) {
        setGameOver(true);
        return 0;
      }
      setHero(HERO_START);
      return current - 1;
    });
  }, []);

  const moveHero = useCallback(
    (dx: number, dy: number) => {
      if (dx === 0 && dy === 0) return;
      const nx = hero.x + dx;
      const ny = hero.y + dy;
      if (isWall(board, nx, ny)) return;

      const nextHero = { x: nx, y: ny };
      const collected = powerups.find((p) => p.x === nx && p.y === ny);
      let pointsToAdd = 0;
      let bonusText = '';

      const newBoard = board.map((row) => [...row]);

      if (newBoard[ny][nx] === '.') {
        newBoard[ny][nx] = ' ';
        pointsToAdd += 10;
      }

      if (collected) {
        if (collected.type === 'life') {
          setLives((l) => Math.min(l + 1, 5));
          bonusText = 'Extra Life';
        } else if (collected.type === 'speed') {
          setSpeedBoost(true);
          bonusText = 'Speed Boost';
          setTimeout(() => setSpeedBoost(false), 6000);
        } else if (collected.type === 'freeze') {
          setFreezeHunters(true);
          bonusText = 'Hunters Frozen';
          setTimeout(() => setFreezeHunters(false), 5000);
        } else if (collected.type === 'shield') {
          setShieldActive(true);
          bonusText = 'Shield Active';
          setTimeout(() => setShieldActive(false), 8000);
        } else if (collected.type === 'score') {
          pointsToAdd += 250;
          bonusText = '+250 Crystal Bonus';
        }
        setPowerups((cur) => cur.filter((p) => p.id !== collected.id));
      }

      if (Math.random() > 0.94) {
        pointsToAdd += 100;
        bonusText = '+100 Link Bonus!';
      }

      let remainingFood = 0;
      for (let yy = 0; yy < newBoard.length; yy++) {
        for (let xx = 0; xx < newBoard[yy].length; xx++) {
          if (newBoard[yy][xx] === '.') remainingFood++;
        }
      }

      if (remainingFood === 0) {
        pointsToAdd += 500;
        bonusText = '+500 Level Clear Bonus!';
        setWin(true);
      }

      const finalScore = score + pointsToAdd;
      setScore(finalScore);
      setHighScore((h) => Math.max(h, finalScore));
      if (bonusText) setLastBonus(bonusText);
      setBoard(newBoard);
      setHero(nextHero);

      if (checkHunterCollision(nextHero) && !shieldActive) {
        loseLifeOrEnd();
      }
    },
    [board, checkHunterCollision, hero, loseLifeOrEnd, powerups, score, shieldActive]
  );

  const moveHunters = useCallback(() => {
    if (freezeHunters) return;
    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    setHunters((current) => {
      const updated = current.map((hunter) => {
        const valid = directions.filter((d) => !isWall(board, hunter.x + d.dx, hunter.y + d.dy));
        if (valid.length === 0) return hunter;

        const currentDistance = Math.abs(hunter.x - hero.x) + Math.abs(hunter.y - hero.y);
        const chase = valid.filter((m) => {
          const nd = Math.abs(hunter.x + m.dx - hero.x) + Math.abs(hunter.y + m.dy - hero.y);
          return nd < currentDistance;
        });

        const pool = chase.length > 0 && Math.random() > 0.35 ? chase : valid;
        const move = pool[Math.floor(Math.random() * pool.length)];
        return { ...hunter, x: hunter.x + move.dx, y: hunter.y + move.dy };
      });

      if (updated.some((h) => h.x === hero.x && h.y === hero.y) && !shieldActive) {
        loseLifeOrEnd();
      }
      return updated;
    });
  }, [board, hero, freezeHunters, loseLifeOrEnd, shieldActive]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (gameOver || win) return;
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'ArrowUp') moveHero(0, -1);
      if (event.key === 'ArrowDown') moveHero(0, 1);
      if (event.key === 'ArrowLeft') moveHero(-1, 0);
      if (event.key === 'ArrowRight') moveHero(1, 0);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver, moveHero, win, isOpen]);

  useEffect(() => {
    if (!isOpen || gameOver || win) return;
    const interval = window.setInterval(moveHunters, speedBoost ? 90 : 160);
    return () => window.clearInterval(interval);
  }, [gameOver, moveHunters, win, speedBoost, isOpen]);

  const submitScore = useCallback(async () => {
    if (submitted || score <= 0) return;
    const name = (playerName || 'PLAYER').toUpperCase().slice(0, 16);
    try {
      localStorage.setItem('wildMazePlayerName', name);
    } catch {
      // ignore
    }
    const { error } = await supabase.from('wild_maze_scores').insert([{ name, score }]);
    if (!error) {
      setSubmitted(true);
      loadLeaderboard();
    }
  }, [submitted, score, playerName, loadLeaderboard]);

  useEffect(() => {
    if ((gameOver || win) && !submitted && score > 0) {
      submitScore();
    }
  }, [gameOver, win, submitted, score, submitScore]);

  const resetGame = () => {
    const fresh = createBoard();
    setBoard(fresh);
    setHero(HERO_START);
    setHunters(START_HUNTERS);
    setLives(3);
    setScore(0);
    setGameOver(false);
    setWin(false);
    setLastBonus('');
    setShieldActive(false);
    setFreezeHunters(false);
    setSpeedBoost(false);
    setPowerups(generatePowerups(fresh));
    setSubmitted(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.92)' }}>
      <style>{`
        .wm-board {
          display: grid;
          grid-template-columns: repeat(${BOARD_WIDTH}, 28px);
          grid-template-rows: repeat(${BOARD_HEIGHT}, 28px);
          gap: 1px;
          background: #081018;
          padding: 12px;
          border-radius: 18px;
          border: 2px solid rgba(255,255,255,0.08);
          box-shadow: 0 12px 40px rgba(0,0,0,0.55);
        }
        .wm-cell {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          border-radius: 4px;
          position: relative;
        }
        .wm-wall { background: linear-gradient(180deg,#16324f,#0c1d2f); border: 1px solid rgba(88,166,255,0.14); }
        .wm-path { background: #0d1722; }
        .wm-food::after {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: #facc15;
          display: block;
        }
        .wm-hero { filter: drop-shadow(0 0 8px rgba(255,200,50,0.5)); }
        .wm-enemy { filter: drop-shadow(0 0 6px rgba(255,255,255,0.15)); }
        @media (max-width: 640px) {
          .wm-board { grid-template-columns: repeat(${BOARD_WIDTH}, 18px); grid-template-rows: repeat(${BOARD_HEIGHT}, 18px); padding: 8px; }
          .wm-cell { width: 18px; height: 18px; font-size: 12px; }
        }
      `}</style>

      <div className="min-h-screen flex flex-col items-center justify-start p-4 md:p-8 text-white">
        <div className="w-full max-w-5xl flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-yellow-300 via-orange-400 to-emerald-400 text-transparent bg-clip-text">
              Wild Maze
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Escape the predators, clear the maze.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-white/10"
            style={{ border: '2px solid rgba(245,166,35,0.5)', color: '#f5a623' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-center mb-4">
          {shieldActive && (
            <div className="bg-cyan-400/20 border border-cyan-300/30 px-4 py-2 rounded-xl text-cyan-200 font-bold text-sm">
              Shield Active
            </div>
          )}
          {freezeHunters && (
            <div className="bg-blue-400/20 border border-blue-300/30 px-4 py-2 rounded-xl text-blue-200 font-bold text-sm">
              Hunters Frozen
            </div>
          )}
          {speedBoost && (
            <div className="bg-yellow-400/20 border border-yellow-300/30 px-4 py-2 rounded-xl text-yellow-200 font-bold text-sm">
              Speed Boost
            </div>
          )}

          <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-2 backdrop-blur-md">
            <div className="text-xs text-slate-300">Score</div>
            <div className="text-2xl font-bold">{score}</div>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-2 backdrop-blur-md">
            <div className="text-xs text-slate-300">High Score</div>
            <div className="text-2xl font-bold text-yellow-300">{highScore}</div>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-2 backdrop-blur-md">
            <div className="text-xs text-slate-300">Lives</div>
            <div className="text-2xl font-bold text-red-400">{'❤️'.repeat(lives)}</div>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-2 backdrop-blur-md">
            <div className="text-xs text-slate-300">Controls</div>
            <div className="text-sm font-semibold">Arrow Keys</div>
          </div>

          <button
            onClick={() => setShowLeaderboard((s) => !s)}
            className="bg-slate-800 hover:bg-slate-700 transition px-5 py-2 rounded-2xl font-bold shadow-lg border border-white/10 text-sm"
          >
            Leaderboard
          </button>
          <button
            onClick={resetGame}
            className="bg-emerald-500 hover:bg-emerald-400 transition px-5 py-2 rounded-2xl font-bold shadow-lg text-sm"
          >
            Restart
          </button>
        </div>

        {lastBonus && !gameOver && !win && (
          <div className="bg-yellow-400/15 border border-yellow-300/30 text-yellow-200 px-5 py-1.5 rounded-2xl font-bold text-sm mb-4">
            {lastBonus}
          </div>
        )}

        {showLeaderboard && (
          <div className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-xl mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-black text-yellow-300">Leaderboard</h2>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Close leaderboard"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {leaderboard.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">
                  No scores yet — be the first!
                </p>
              )}
              {leaderboard.map((entry, index) => (
                <div
                  key={`${entry.name}-${index}`}
                  className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-300 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{entry.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {index === 0 ? 'Legend' : index < 3 ? 'Elite Hunter' : 'Maze Survivor'}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-black text-yellow-300">{entry.score}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative">
          <div className="absolute -inset-6 bg-emerald-500/10 blur-3xl rounded-full" />
          <div className="wm-board relative z-10">
            {board.map((row, y) =>
              row.map((cell, x) => {
                const isHero = hero.x === x && hero.y === y;
                const hunter = hunters.find((h) => h.x === x && h.y === y) || null;
                const powerup = powerups.find((p) => p.x === x && p.y === y) || null;
                return (
                  <div
                    key={`${x}-${y}`}
                    className={`wm-cell ${cell === '#' ? 'wm-wall' : 'wm-path'} ${cell === '.' ? 'wm-food' : ''}`}
                  >
                    {powerup && !isHero && !hunter && (
                      <span className="absolute text-xs animate-pulse">{powerup.emoji}</span>
                    )}
                    {isHero ? (
                      <span className="wm-hero">🦊</span>
                    ) : hunter ? (
                      <span className="wm-enemy" title={hunter.name}>
                        {hunter.emoji}
                      </span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          {(gameOver || win) && (
            <div className="absolute inset-0 bg-black/85 rounded-3xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm text-center p-6">
              <div className="text-5xl">{win ? '🏆' : '💥'}</div>
              <h2 className="text-3xl font-black">
                {win ? 'You Win!' : 'Game Over'}
              </h2>
              <p className="text-base text-slate-300 max-w-xs">
                {win
                  ? 'The fox cleared the forest maze.'
                  : 'A wild hunter caught the fox.'}
              </p>
              <p className="text-lg font-bold text-yellow-300">Final Score: {score}</p>

              {!submitted && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitScore();
                  }}
                  className="flex flex-col items-center gap-2 w-full max-w-xs"
                >
                  <input
                    type="text"
                    maxLength={16}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-center text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button
                    type="submit"
                    className="bg-yellow-400 text-black hover:bg-yellow-300 px-5 py-2 rounded-2xl font-black transition w-full"
                  >
                    Submit Score
                  </button>
                </form>
              )}

              {submitted && (
                <p className="text-emerald-300 text-sm">Score submitted to the leaderboard!</p>
              )}

              <button
                onClick={resetGame}
                className="bg-emerald-500 text-white hover:bg-emerald-400 px-5 py-2 rounded-2xl font-bold transition mt-1"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
