import React, { useState, useEffect, useRef } from 'react';

const ANIMALS = [
  // Savanna Region
  { id:1,  name:"Tasmanian Devil",  emoji:"😈", hp:96, atk:90, def:72, spd:80, special:"Devil Spin",       tier:"S" },
  { id:2,  name:"Dove",             emoji:"🕊️", hp:42, atk:35, def:30, spd:88, special:"Wing Gust",        tier:"C" },
  { id:3,  name:"White-tailed Deer",emoji:"🦌", hp:70, atk:58, def:55, spd:90, special:"Antler Charge",    tier:"B" },
  { id:4,  name:"Horned Lizard",    emoji:"🦎", hp:55, atk:52, def:72, spd:48, special:"Blood Squirt",     tier:"B" },
  { id:5,  name:"Red Hawk",         emoji:"🦅", hp:65, atk:78, def:50, spd:92, special:"Talon Dive",       tier:"A" },
  { id:6,  name:"Panther",          emoji:"🐆", hp:82, atk:85, def:62, spd:90, special:"Shadow Pounce",    tier:"A" },
  { id:7,  name:"Jayhawk",          emoji:"🐦", hp:72, atk:80, def:58, spd:85, special:"Sky Strike",       tier:"A" },
  { id:8,  name:"Horse",            emoji:"🐴", hp:80, atk:65, def:60, spd:88, special:"Gallop Charge",    tier:"B" },
  { id:9,  name:"Cardinal",         emoji:"🐦", hp:60, atk:72, def:52, spd:82, special:"Crimson Dive",     tier:"B" },
  { id:10, name:"Bull",             emoji:"🐂", hp:92, atk:82, def:75, spd:55, special:"Horn Rush",        tier:"A" },
  { id:11, name:"Lion",             emoji:"🦁", hp:95, atk:88, def:70, spd:75, special:"Royal Roar",       tier:"S" },
  { id:12, name:"Bison",            emoji:"🦬", hp:98, atk:78, def:85, spd:45, special:"Stampede",         tier:"A" },
  { id:13, name:"Bear",             emoji:"🐻", hp:100,atk:85, def:80, spd:50, special:"Bear Hug",         tier:"S" },
  { id:14, name:"Stallion",         emoji:"🐴", hp:78, atk:70, def:58, spd:92, special:"Thunder Hooves",   tier:"B" },
  { id:15, name:"Husky",            emoji:"🐺", hp:75, atk:72, def:65, spd:85, special:"Ice Howl",         tier:"A" },
  { id:16, name:"Warhorse",         emoji:"🐴", hp:88, atk:75, def:72, spd:70, special:"Battle Charge",    tier:"A" },

  // Ocean Region
  { id:17, name:"Alligator",        emoji:"🐊", hp:95, atk:88, def:85, spd:48, special:"Death Roll",       tier:"S" },
  { id:18, name:"Hawk",             emoji:"🦅", hp:55, atk:72, def:45, spd:95, special:"Aerial Strike",    tier:"B" },
  { id:19, name:"Tiger",            emoji:"🐯", hp:92, atk:90, def:68, spd:78, special:"Pounce Strike",    tier:"S" },
  { id:20, name:"Iowa Hawk",        emoji:"🦅", hp:62, atk:74, def:50, spd:90, special:"Hawk Eye",         tier:"B" },
  { id:21, name:"Sea Lion",         emoji:"🦭", hp:78, atk:68, def:62, spd:72, special:"Aqua Bash",        tier:"B" },
  { id:22, name:"Longhorn",         emoji:"🐂", hp:90, atk:80, def:75, spd:52, special:"Gore Charge",      tier:"A" },
  { id:23, name:"Prairie Dog",      emoji:"🐕", hp:50, atk:45, def:55, spd:80, special:"Tunnel Strike",    tier:"C" },
  { id:24, name:"Trojan Horse",     emoji:"🐴", hp:85, atk:72, def:68, spd:65, special:"Shield Bash",      tier:"B" },
  { id:25, name:"Ram",              emoji:"🐏", hp:82, atk:78, def:70, spd:60, special:"Headbutt",         tier:"A" },
  { id:26, name:"VCU Ram",          emoji:"🐏", hp:80, atk:76, def:68, spd:62, special:"Ram Charge",       tier:"A" },
  { id:27, name:"Illinois Bison",   emoji:"🦬", hp:95, atk:80, def:82, spd:48, special:"Prairie Thunder",  tier:"A" },
  { id:28, name:"Duck",             emoji:"🦆", hp:52, atk:48, def:42, spd:78, special:"Wing Slap",        tier:"C" },
  { id:29, name:"Irish Wolfhound",  emoji:"🐕", hp:85, atk:75, def:65, spd:72, special:"Celtic Fang",      tier:"A" },
  { id:30, name:"Collie",           emoji:"🐕", hp:68, atk:62, def:58, spd:82, special:"Herd Rush",        tier:"B" },
  { id:31, name:"Cougar",           emoji:"🦁", hp:85, atk:84, def:62, spd:88, special:"Mountain Strike",  tier:"A" },
  { id:32, name:"Wolverine",        emoji:"🦡", hp:78, atk:82, def:75, spd:68, special:"Berserker Rage",   tier:"A" },

  // Forest Region
  { id:33, name:"Wildcat",          emoji:"🐱", hp:75, atk:80, def:58, spd:88, special:"Feral Slash",      tier:"A" },
  { id:34, name:"Shark",            emoji:"🦈", hp:90, atk:92, def:60, spd:82, special:"Feeding Frenzy",   tier:"S" },
  { id:35, name:"Villanova Wildcat",emoji:"🐱", hp:72, atk:78, def:55, spd:85, special:"Quick Claw",       tier:"A" },
  { id:36, name:"Utah Bull",        emoji:"🐂", hp:88, atk:78, def:72, spd:55, special:"Desert Charge",    tier:"A" },
  { id:37, name:"Badger",           emoji:"🦡", hp:72, atk:76, def:80, spd:60, special:"Tunnel Fury",      tier:"A" },
  { id:38, name:"HP Panther",       emoji:"🐆", hp:80, atk:82, def:60, spd:88, special:"Night Pounce",     tier:"A" },
  { id:39, name:"Wild Boar",        emoji:"🐗", hp:90, atk:82, def:78, spd:52, special:"Tusk Charge",      tier:"A" },
  { id:40, name:"Hawaii Hawk",      emoji:"🦅", hp:58, atk:70, def:48, spd:92, special:"Island Dive",      tier:"B" },
  { id:41, name:"BYU Cougar",       emoji:"🦁", hp:82, atk:80, def:60, spd:85, special:"Canyon Roar",      tier:"A" },
  { id:42, name:"Texas Longhorn",   emoji:"🐂", hp:92, atk:82, def:75, spd:55, special:"Lone Star Rush",   tier:"A" },
  { id:43, name:"Bulldog",          emoji:"🐕", hp:82, atk:75, def:72, spd:58, special:"Jaw Lock",         tier:"A" },
  { id:44, name:"Owl",              emoji:"🦉", hp:58, atk:70, def:50, spd:85, special:"Night Vision",     tier:"B" },
  { id:45, name:"Ibis",             emoji:"🐦", hp:55, atk:65, def:48, spd:82, special:"Storm Wing",       tier:"B" },
  { id:46, name:"Missouri Tiger",   emoji:"🐯", hp:88, atk:86, def:65, spd:75, special:"Tiger Claw",       tier:"A" },
  { id:47, name:"Purdue Badger",    emoji:"🦡", hp:75, atk:78, def:78, spd:58, special:"Iron Claw",        tier:"A" },
  { id:48, name:"Queens Lion",      emoji:"🦁", hp:70, atk:72, def:60, spd:70, special:"Crown Strike",     tier:"B" },

  // Apex Region
  { id:49, name:"Michigan Wolverine",emoji:"🦡", hp:80, atk:85, def:78, spd:70, special:"Wolverine Fury",  tier:"S" },
  { id:50, name:"Retriever",        emoji:"🐕", hp:60, atk:52, def:50, spd:78, special:"Fetch Strike",     tier:"C" },
  { id:51, name:"Georgia Bulldog",  emoji:"🐕", hp:85, atk:78, def:75, spd:55, special:"Dawg Bite",        tier:"A" },
  { id:52, name:"Goblin Shark",     emoji:"🦈", hp:75, atk:88, def:55, spd:65, special:"Deep Strike",      tier:"A" },
  { id:53, name:"Red Fox",          emoji:"🦊", hp:62, atk:72, def:50, spd:92, special:"Fox Trick",        tier:"B" },
  { id:54, name:"Kangaroo",         emoji:"🦘", hp:78, atk:80, def:60, spd:75, special:"Power Kick",       tier:"A" },
  { id:55, name:"Elephant",         emoji:"🐘", hp:100,atk:80, def:90, spd:40, special:"Stampede Crush",   tier:"S" },
  { id:56, name:"Hofstra Lion",     emoji:"🦁", hp:72, atk:74, def:62, spd:72, special:"Pride Strike",     tier:"B" },
  { id:57, name:"Hound Dog",        emoji:"🐕", hp:70, atk:68, def:58, spd:80, special:"Tracking Bite",    tier:"B" },
  { id:58, name:"Mustang",          emoji:"🐴", hp:82, atk:72, def:60, spd:90, special:"Wild Gallop",      tier:"A" },
  { id:59, name:"Cavalier Horse",   emoji:"🐴", hp:80, atk:70, def:65, spd:78, special:"Knight Charge",    tier:"A" },
  { id:60, name:"Wolf",             emoji:"🐺", hp:75, atk:78, def:62, spd:85, special:"Pack Hunt",        tier:"A" },
  { id:61, name:"Kentucky Wildcat", emoji:"🐱", hp:78, atk:82, def:58, spd:88, special:"Wildcat Fury",     tier:"A" },
  { id:62, name:"Bronco Horse",     emoji:"🐴", hp:78, atk:70, def:62, spd:85, special:"Bronco Kick",      tier:"B" },
  { id:63, name:"Eagle",            emoji:"🦅", hp:68, atk:80, def:52, spd:95, special:"Cyclone Dive",     tier:"A" },
  { id:64, name:"TN State Tiger",   emoji:"🐯", hp:72, atk:75, def:58, spd:78, special:"Volunteer Roar",   tier:"B" },
];

const TIER_COLOR: Record<string, string> = { S:"#f5a623", A:"#4caf50", B:"#2196f3", C:"#9e9e9e" };

interface Animal {
  id: number;
  name: string;
  emoji: string;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  special: string;
  tier: string;
}

interface LogEntry {
  msg: string;
  hpA: number;
  hpB: number;
  attacker: 'a' | 'b';
}

interface BattleResult {
  log: LogEntry[];
  winner: Animal;
  loser: Animal;
  hpA: number;
  hpB: number;
}

interface Ratings {
  [id: number]: { wins: number; losses: number; rating: number };
}

function calcRating(a: Animal) {
  return Math.round(a.atk * 0.35 + a.def * 0.25 + a.hp * 0.25 + a.spd * 0.15);
}

function StatBar({ val, color = "#f5a623" }: { val: number; color?: string }) {
  return (
    <div style={{ background: "#0a1628", borderRadius: 4, height: 7, width: "100%", overflow: "hidden" }}>
      <div style={{ width: val + "%", height: "100%", background: color, borderRadius: 4, transition: "width 0.5s" }} />
    </div>
  );
}

function AnimalCard({ animal, onClick, selected, small }: { animal: Animal; onClick?: () => void; selected?: boolean; small?: boolean }) {
  const rating = calcRating(animal);
  const tc = TIER_COLOR[animal.tier] || "#888";
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? "rgba(245,166,35,0.15)" : "#112240",
        border: `2px solid ${selected ? "#f5a623" : "#1e3a5c"}`,
        borderRadius: 10,
        padding: small ? "8px" : "12px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        transform: selected ? "scale(1.03)" : "scale(1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: small ? 2 : 6 }}>
        <span style={{ fontSize: small ? "1.5em" : "1.9em" }}>{animal.emoji}</span>
        <div>
          <div style={{ fontWeight: "bold", fontSize: small ? "0.78em" : "0.88em", color: "#fff" }}>{animal.name}</div>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ background: tc, color: "#000", borderRadius: 4, padding: "1px 5px", fontSize: "0.6em", fontWeight: "bold" }}>{animal.tier}</span>
            <span style={{ fontSize: "0.6em", color: "#aac" }}>★ {rating}</span>
          </div>
        </div>
      </div>
      {!small && (
        <>
          <div style={{ fontSize: "0.58em", color: "#778", marginBottom: 1 }}>ATK {animal.atk}</div>
          <StatBar val={animal.atk} color="#e74c3c" />
          <div style={{ fontSize: "0.58em", color: "#778", marginBottom: 1, marginTop: 3 }}>DEF {animal.def}</div>
          <StatBar val={animal.def} color="#3498db" />
          <div style={{ fontSize: "0.58em", color: "#778", marginBottom: 1, marginTop: 3 }}>SPD {animal.spd}</div>
          <StatBar val={animal.spd} color="#2ecc71" />
          <div style={{ fontSize: "0.58em", color: "#778", marginBottom: 1, marginTop: 3 }}>HP {animal.hp}</div>
          <StatBar val={animal.hp} color="#f5a623" />
          <div style={{ marginTop: 7, fontSize: "0.6em", color: "#f5a623", background: "rgba(245,166,35,0.1)", borderRadius: 5, padding: "2px 7px", textAlign: "center" }}>
            ⚡ {animal.special}
          </div>
        </>
      )}
    </div>
  );
}

function runBattle(a: Animal, b: Animal): BattleResult {
  let hpA = a.hp, hpB = b.hp;
  const log: LogEntry[] = [];
  let round = 0;
  let specialUsedA = false, specialUsedB = false;

  while (hpA > 0 && hpB > 0 && round < 30) {
    round++;
    const first = a.spd >= b.spd ? "a" : "b";
    const turns: Array<['a' | 'b', 'a' | 'b']> = first === "a" ? [["a", "b"], ["b", "a"]] : [["b", "a"], ["a", "b"]];

    for (const [att, def] of turns) {
      if (hpA <= 0 || hpB <= 0) break;
      const attAnimal = att === "a" ? a : b;
      const useSpecial = !(att === "a" ? specialUsedA : specialUsedB) && Math.random() < 0.25;
      if (useSpecial) att === "a" ? (specialUsedA = true) : (specialUsedB = true);

      const defDef = def === "a" ? a.def : b.def;
      const baseDmg = Math.max(2, attAnimal.atk - defDef * 0.4 + (Math.random() * 12 - 6));
      const dmg = Math.round(useSpecial ? baseDmg * 1.6 : baseDmg);
      const crit = !useSpecial && Math.random() < 0.12;
      const finalDmg = crit ? Math.round(dmg * 1.5) : dmg;

      if (att === "a") hpB = Math.max(0, hpB - finalDmg);
      else hpA = Math.max(0, hpA - finalDmg);

      const msg = useSpecial
        ? `${attAnimal.emoji} ${attAnimal.name} uses <b>${attAnimal.special}</b>! 💥 ${finalDmg} dmg!`
        : crit
        ? `${attAnimal.emoji} ${attAnimal.name} <b>CRITICAL HIT!</b> 🔴 ${finalDmg} dmg!`
        : `${attAnimal.emoji} ${attAnimal.name} attacks for ${finalDmg} dmg.`;

      log.push({ msg, hpA: Math.max(0, hpA), hpB: Math.max(0, hpB), attacker: att });
    }
  }

  const winner = hpA >= hpB ? a : b;
  const loser = hpA >= hpB ? b : a;
  return { log, winner, loser, hpA: Math.max(0, hpA), hpB: Math.max(0, hpB) };
}

const initRatings = (): Ratings => {
  const r: Ratings = {};
  ANIMALS.forEach(a => { r[a.id] = { wins: 0, losses: 0, rating: calcRating(a) * 10 }; });
  return r;
};

type BattleScreen = 'home' | 'roster' | 'select' | 'battle' | 'ratings';

interface AnimalBattleProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnimalBattle({ isOpen, onClose }: AnimalBattleProps) {
  if (!isOpen) return null;
  const [screen, setScreen] = useState<BattleScreen>('home');
  const [selected, setSelected] = useState<[Animal | null, Animal | null]>([null, null]);
  const [step, setStep] = useState(0);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [battleLog, setBattleLog] = useState<LogEntry[]>([]);
  const [logIdx, setLogIdx] = useState(0);
  const [ratings, setRatings] = useState<Ratings>(initRatings);
  const [phase, setPhase] = useState<'intro' | 'fighting' | 'result'>('intro');
  const [search, setSearch] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logIdx]);

  const filtered = ANIMALS.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.tier.toLowerCase().includes(search.toLowerCase())
  );

  function selectAnimal(a: Animal) {
    if (step === 0) { setSelected([a, null]); setStep(1); }
    else if (step === 1 && selected[0]?.id !== a.id) {
      setSelected([selected[0], a]);
      startBattle(selected[0]!, a);
    }
  }

  function startBattle(a: Animal, b: Animal) {
    const result = runBattle(a, b);
    setBattleResult(result);
    setBattleLog(result.log);
    setLogIdx(0);
    setPhase('intro');
    setScreen('battle');
    setTimeout(() => {
      setPhase('fighting');
      let i = 0;
      intervalRef.current = setInterval(() => {
        i++;
        setLogIdx(i);
        if (i >= result.log.length) {
          clearInterval(intervalRef.current!);
          setTimeout(() => {
            setPhase('result');
            setRatings(prev => {
              const next = { ...prev };
              next[result.winner.id] = { ...next[result.winner.id], wins: next[result.winner.id].wins + 1, rating: next[result.winner.id].rating + 25 };
              next[result.loser.id] = { ...next[result.loser.id], losses: next[result.loser.id].losses + 1, rating: Math.max(100, next[result.loser.id].rating - 20) };
              return next;
            });
          }, 600);
        }
      }, 650);
    }, 1400);
  }

  function resetBattle() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSelected([null, null]);
    setStep(0);
    setBattleResult(null);
    setBattleLog([]);
    setLogIdx(0);
    setPhase('intro');
    setScreen('home');
  }

  const sortedRatings = [...ANIMALS].sort((a, b) => (ratings[b.id]?.rating || 0) - (ratings[a.id]?.rating || 0));

  const s = { background: '#0a1628', color: '#fff', fontFamily: 'Arial,sans-serif', height: '100%', overflowY: 'auto' as const, fontSize: '0.92em' };

  const BackBtn = ({ to }: { to: BattleScreen }) => (
    <button
      onClick={() => setScreen(to)}
      style={{ background: 'transparent', border: '2px solid #f5a623', color: '#f5a623', borderRadius: 20, padding: '5px 13px', cursor: 'pointer', fontSize: '0.78em', fontWeight: 'bold' }}
    >
      ← Back
    </button>
  );

  const modal = (content: React.ReactNode) => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 900, maxHeight: '90vh', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 10, right: 12, zIndex: 10, background: 'rgba(0,0,0,0.5)', border: '2px solid #f5a623', color: '#f5a623', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontWeight: 'bold', fontSize: '1em', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >✕</button>
        {content}
      </div>
    </div>
  );

  if (screen === 'ratings') return modal(
    <div style={s}>
      <div style={{ background: 'linear-gradient(135deg,#1a3a5c,#0a1628)', padding: '12px 16px', borderBottom: '3px solid #f5a623', display: 'flex', alignItems: 'center', gap: 10 }}>
        <BackBtn to="home" />
        <span style={{ color: '#f5a623', fontSize: '1.1em', fontWeight: 'bold', letterSpacing: 2 }}>🏆 Power Rankings</span>
      </div>
      <div style={{ padding: '14px 16px', maxWidth: 680, margin: '0 auto' }}>
        {sortedRatings.map((a, i) => {
          const r = ratings[a.id];
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
          return (
            <div key={a.id} style={{ background: '#112240', border: `2px solid ${i < 3 ? '#f5a623' : '#1e3a5c'}`, borderRadius: 10, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: '1.2em', minWidth: 32, textAlign: 'center' }}>{medal || `#${i + 1}`}</div>
              <div style={{ fontSize: '1.7em' }}>{a.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9em' }}>{a.name}</div>
                <div style={{ fontSize: '0.68em', color: '#778' }}>W:{r.wins} L:{r.losses}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#f5a623', fontWeight: 'bold', fontSize: '1.05em' }}>{r.rating}</div>
                <div style={{ fontSize: '0.6em', color: '#aac' }}>POWER</div>
              </div>
              <span style={{ background: TIER_COLOR[a.tier], color: '#000', borderRadius: 5, padding: '2px 7px', fontSize: '0.65em', fontWeight: 'bold' }}>{a.tier}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (screen === 'roster') return modal(
    <div style={s}>
      <div style={{ background: 'linear-gradient(135deg,#1a3a5c,#0a1628)', padding: '12px 16px', borderBottom: '3px solid #f5a623', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <BackBtn to="home" />
        <span style={{ color: '#f5a623', fontSize: '1.1em', fontWeight: 'bold', letterSpacing: 2, flex: 1 }}>📖 Animal Roster</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ padding: '5px 10px', borderRadius: 20, border: '1px solid #2a4a6a', background: '#1a2e4a', color: '#fff', fontSize: '0.75em', outline: 'none' }} />
      </div>
      <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 10, maxWidth: 1100, margin: '0 auto' }}>
        {filtered.map(a => <AnimalCard key={a.id} animal={a} />)}
      </div>
    </div>
  );

  if (screen === 'select') return modal(
    <div style={s}>
      <div style={{ background: 'linear-gradient(135deg,#1a3a5c,#0a1628)', padding: '12px 16px', borderBottom: '3px solid #f5a623', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <BackBtn to="home" />
        <span style={{ color: '#f5a623', fontSize: '1em', fontWeight: 'bold', letterSpacing: 2, flex: 1 }}>⚔️ Choose Fighters</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ padding: '5px 10px', borderRadius: 20, border: '1px solid #2a4a6a', background: '#1a2e4a', color: '#fff', fontSize: '0.75em', outline: 'none' }} />
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: '#0d1e34', borderBottom: '2px solid #1e3a5c', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', minWidth: 130 }}>
          <div style={{ fontSize: '0.65em', color: '#f5a623', letterSpacing: 1, marginBottom: 5 }}>FIGHTER 1 {step === 0 ? "← Pick" : "✅"}</div>
          {selected[0]
            ? <AnimalCard animal={selected[0]} small />
            : <div style={{ background: '#112240', border: '2px dashed #2a4a6a', borderRadius: 10, padding: '16px', color: '#445', fontSize: '0.75em' }}>Select Animal</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.3em', color: '#f5a623', fontWeight: 'bold' }}>VS</div>
        <div style={{ textAlign: 'center', minWidth: 130 }}>
          <div style={{ fontSize: '0.65em', color: '#f5a623', letterSpacing: 1, marginBottom: 5 }}>FIGHTER 2 {step === 1 ? "← Pick" : ""}</div>
          {selected[1]
            ? <AnimalCard animal={selected[1]} small />
            : <div style={{ background: '#112240', border: '2px dashed #2a4a6a', borderRadius: 10, padding: '16px', color: '#445', fontSize: '0.75em' }}>Select Animal</div>}
        </div>
      </div>

      <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 8, maxWidth: 1100, margin: '0 auto' }}>
        {filtered.map(a => (
          <AnimalCard key={a.id} animal={a} small selected={selected[0]?.id === a.id} onClick={() => selectAnimal(a)} />
        ))}
      </div>
    </div>
  );

  if (screen === 'battle') {
    const a = selected[0]!, b = selected[1]!;
    const hpAMax = a?.hp, hpBMax = b?.hp;
    const curLog = battleLog.slice(0, logIdx);
    const lastEntry = curLog[curLog.length - 1];
    const curHpA = lastEntry ? lastEntry.hpA : (a?.hp || 0);
    const curHpB = lastEntry ? lastEntry.hpB : (b?.hp || 0);

    return modal(
      <div style={{ ...s, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'linear-gradient(135deg,#1a0a00,#0a1628)', padding: '8px 16px', borderBottom: '3px solid #f5a623', textAlign: 'center' }}>
          <span style={{ color: '#f5a623', fontSize: '0.9em', fontWeight: 'bold', letterSpacing: 3 }}>⚔️ BATTLE ARENA ⚔️</span>
        </div>

        {a && b && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: '#0d1e34', borderBottom: '2px solid #1e3a5c' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68em', marginBottom: 3 }}>
                <span>{a.emoji} {a.name}</span><span style={{ color: '#e74c3c' }}>{curHpA}/{hpAMax}</span>
              </div>
              <div style={{ background: '#0a1628', borderRadius: 5, height: 12, overflow: 'hidden' }}>
                <div style={{ width: `${(curHpA / hpAMax) * 100}%`, height: '100%', background: '#e74c3c', borderRadius: 5, transition: 'width 0.5s' }} />
              </div>
            </div>
            <div style={{ color: '#f5a623', fontWeight: 'bold', fontSize: '0.85em', minWidth: 26, textAlign: 'center' }}>VS</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68em', marginBottom: 3 }}>
                <span style={{ color: '#3498db' }}>{curHpB}/{hpBMax}</span><span>{b.emoji} {b.name}</span>
              </div>
              <div style={{ background: '#0a1628', borderRadius: 5, height: 12, overflow: 'hidden' }}>
                <div style={{ width: `${(curHpB / hpBMax) * 100}%`, height: '100%', background: '#3498db', borderRadius: 5, transition: 'width 0.5s' }} />
              </div>
            </div>
          </div>
        )}

        <div style={{ position: 'relative', background: 'linear-gradient(180deg,#0d1e34 0%,#1a0a00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '16px', flex: '0 0 auto' }}>
          {phase === 'intro' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', fontSize: '1.8em', fontWeight: 'bold', color: '#f5a623', letterSpacing: 4, zIndex: 10 }}>
              FIGHT!
            </div>
          )}
          {a && (
            <div style={{ textAlign: 'center', transition: 'all 0.3s', transform: lastEntry?.attacker === 'a' ? 'scale(1.15) translateX(12px)' : 'scale(1)' }}>
              <div style={{ fontSize: '4em' }}>{a.emoji}</div>
              <div style={{ fontSize: '0.68em', color: '#aac' }}>{a.name}</div>
            </div>
          )}
          <div style={{ fontSize: '1.3em', color: '#f5a623', fontWeight: 'bold' }}>⚡</div>
          {b && (
            <div style={{ textAlign: 'center', transition: 'all 0.3s', transform: lastEntry?.attacker === 'b' ? 'scale(1.15) translateX(-12px)' : 'scale(1)' }}>
              <div style={{ fontSize: '4em' }}>{b.emoji}</div>
              <div style={{ fontSize: '0.68em', color: '#aac' }}>{b.name}</div>
            </div>
          )}

          {phase === 'result' && battleResult && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.88)', zIndex: 10, padding: 16 }}>
              <div style={{ fontSize: '0.68em', color: '#f5a623', letterSpacing: 3, marginBottom: 6 }}>WINNER!</div>
              <div style={{ fontSize: '4em' }}>{battleResult.winner.emoji}</div>
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#fff', marginBottom: 3 }}>{battleResult.winner.name}</div>
              <div style={{ fontSize: '0.65em', color: '#4caf50', marginBottom: 14 }}>+25 Power Rating 📈</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={() => { setSelected([null, null]); setStep(0); setSearch(''); setScreen('select'); }} style={{ background: '#f5a623', color: '#000', border: 'none', borderRadius: 20, padding: '7px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75em' }}>⚔️ Battle Again</button>
                <button onClick={() => setScreen('ratings')} style={{ background: 'transparent', border: '2px solid #f5a623', color: '#f5a623', borderRadius: 20, padding: '7px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75em' }}>🏆 Rankings</button>
                <button onClick={resetBattle} style={{ background: 'transparent', border: '2px solid #556', color: '#aac', borderRadius: 20, padding: '7px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75em' }}>🏠 Home</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '10px 14px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ fontSize: '0.65em', color: '#778', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>Battle Log</div>
          <div
            ref={logRef}
            style={{ background: '#0d1e34', borderRadius: 8, border: '1px solid #1e3a5c', padding: 10, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0, maxHeight: 180 }}
          >
            {curLog.length === 0 && <div style={{ color: '#445', fontSize: '0.75em', textAlign: 'center', padding: '14px 0' }}>Battle starting...</div>}
            {curLog.map((entry, i) => (
              <div
                key={i}
                style={{ fontSize: '0.72em', color: i === curLog.length - 1 ? '#fff' : '#aac', background: i === curLog.length - 1 ? 'rgba(245,166,35,0.08)' : 'transparent', borderRadius: 5, padding: '3px 7px' }}
                dangerouslySetInnerHTML={{ __html: `<span style="color:#556;margin-right:5px">R${i + 1}</span>${entry.msg}` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return modal(
    <div style={{ ...s, display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', padding: '28px 16px 22px', background: 'linear-gradient(180deg,#1a3a5c,#0a1628)', borderBottom: '3px solid #f5a623' }}>
        <div style={{ fontSize: '3em', marginBottom: 6 }}>🦁</div>
        <h1 style={{ fontSize: '1.6em', color: '#f5a623', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Battle Arena</h1>
        <p style={{ color: '#aac', fontSize: '0.82em' }}>March Madness Animal Showdown</p>
        <p style={{ color: '#556', fontSize: '0.72em', marginTop: 2 }}>64 animals · Power ratings · Epic battles</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11, padding: '28px 16px', maxWidth: 360, margin: '0 auto', width: '100%' }}>
        <button
          onClick={() => { setSelected([null, null]); setStep(0); setScreen('select'); }}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#f5a623,#e67e00)', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: '1.05em', fontWeight: 'bold', color: '#000', letterSpacing: 1 }}
        >
          ⚔️ Battle Now
        </button>
        <button
          onClick={() => setScreen('ratings')}
          style={{ width: '100%', padding: '12px', background: '#112240', border: '2px solid #f5a623', borderRadius: 12, cursor: 'pointer', fontSize: '0.95em', fontWeight: 'bold', color: '#f5a623' }}
        >
          🏆 Power Rankings
        </button>
        <button
          onClick={() => setScreen('roster')}
          style={{ width: '100%', padding: '12px', background: '#112240', border: '2px solid #2a4a6a', borderRadius: 12, cursor: 'pointer', fontSize: '0.95em', fontWeight: 'bold', color: '#aac' }}
        >
          📖 Animal Roster
        </button>
      </div>

      <div style={{ padding: '0 16px 24px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', fontSize: '0.68em', color: '#778', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>Tier Rankings</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {["S", "A", "B", "C"].map(tier => (
            <div key={tier} style={{ background: '#112240', border: `2px solid ${TIER_COLOR[tier]}`, borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ color: TIER_COLOR[tier], fontWeight: 'bold', fontSize: '1em', marginBottom: 5 }}>{tier} Tier</div>
              <div style={{ fontSize: '1.1em' }}>{ANIMALS.filter(a => a.tier === tier).map(a => a.emoji).join(" ")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
