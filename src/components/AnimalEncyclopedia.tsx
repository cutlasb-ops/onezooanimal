import { useState, useEffect, useRef } from 'react';
import { X, Search, Link2, Check } from 'lucide-react';

const SUGGESTIONS = [
  'Giant Panda', 'Snow Leopard', 'Humpback Whale', 'African Elephant',
  'Bald Eagle', 'Komodo Dragon', 'Arctic Fox', 'Blue Whale',
  'Cheetah', 'Gorilla', 'Axolotl', 'Narwhal', 'Platypus', 'Mantis Shrimp',
];

const EMOJI_MAP: Record<string, string> = {
  'giant panda': '🐼', 'snow leopard': '🐆', 'humpback whale': '🐋',
  'african elephant': '🐘', 'bald eagle': '🦅', 'komodo dragon': '🦎',
  'arctic fox': '🦊', 'blue whale': '🐋', 'cheetah': '🐆', 'gorilla': '🦍',
  'axolotl': '🦎', 'narwhal': '🦄', 'platypus': '🦫', 'mantis shrimp': '🦐',
  'lion': '🦁', 'tiger': '🐯', 'wolf': '🐺', 'bear': '🐻',
  'penguin': '🐧', 'dolphin': '🐬', 'shark': '🦈', 'octopus': '🐙',
  'cat': '🐱', 'dog': '🐶', 'horse': '🐴', 'cow': '🐄',
  'rabbit': '🐰', 'fox': '🦊', 'deer': '🦌', 'moose': '🫎',
  'flamingo': '🦩', 'parrot': '🦜', 'owl': '🦉', 'snake': '🐍',
  'crocodile': '🐊', 'turtle': '🐢', 'frog': '🐸', 'bat': '🦇',
};

function getEmoji(name: string) {
  const lower = name.toLowerCase();
  for (const key in EMOJI_MAP) {
    if (lower.includes(key)) return EMOJI_MAP[key];
  }
  return '🐾';
}

interface AnimalData {
  commonName: string;
  scientificName: string;
  status: string;
  statusColor: string;
  habitat: string;
  diet: string;
  lifespan: string;
  weight: string;
  length: string;
  speed: string;
  population: string;
  range: string;
  funFact: string;
  threat: string;
  bio: string;
  imageUrl?: string;
}

interface WikipediaSummary {
  title: string;
  extract: string;
  thumbnail?: { source: string };
  originalimage?: { source: string };
}

const IUCN_STATUS_MAP: Record<string, { label: string; color: string }> = {
  'EX': { label: 'Extinct', color: '#71717a' },
  'EW': { label: 'Extinct in Wild', color: '#71717a' },
  'CR': { label: 'Critically Endangered', color: '#ef4444' },
  'EN': { label: 'Endangered', color: '#ef4444' },
  'VU': { label: 'Vulnerable', color: '#f97316' },
  'NT': { label: 'Near Threatened', color: '#eab308' },
  'LC': { label: 'Least Concern', color: '#22c55e' },
  'DD': { label: 'Data Deficient', color: '#71717a' },
};

function extractField(text: string, patterns: RegExp[]): string {
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) return m[1].replace(/\[\d+\]/g, '').trim();
  }
  return 'Unknown';
}

function parseWikipediaData(summary: WikipediaSummary, query: string): AnimalData {
  const text = summary.extract || '';
  const title = summary.title || query;

  const sentences = text.split(/(?<=[.!?])\s+/);
  const bio = sentences.slice(0, 3).join(' ') || text.slice(0, 400);

  const sciMatch = text.match(/\b([A-Z][a-z]+ [a-z]+)\b/);
  const scientificName = sciMatch ? sciMatch[1] : title;

  let status = 'Least Concern';
  let statusColor = '#22c55e';
  for (const [code, info] of Object.entries(IUCN_STATUS_MAP)) {
    if (text.includes(info.label) || text.includes(code)) {
      status = info.label;
      statusColor = info.color;
      break;
    }
  }
  if (text.toLowerCase().includes('critically endangered')) { status = 'Critically Endangered'; statusColor = '#ef4444'; }
  else if (text.toLowerCase().includes('endangered')) { status = 'Endangered'; statusColor = '#ef4444'; }
  else if (text.toLowerCase().includes('vulnerable')) { status = 'Vulnerable'; statusColor = '#f97316'; }
  else if (text.toLowerCase().includes('near threatened')) { status = 'Near Threatened'; statusColor = '#eab308'; }
  else if (text.toLowerCase().includes('least concern')) { status = 'Least Concern'; statusColor = '#22c55e'; }
  else if (text.toLowerCase().includes('extinct')) { status = 'Extinct'; statusColor = '#71717a'; }

  const lifespan = extractField(text, [
    /live[sd]? (?:up to |for )?(\d+[\–\-]?\d*)\s*years?/i,
    /lifespan[^.]*?(\d+[\–\-]?\d*)\s*years?/i,
    /maximum[^.]*?(\d+[\–\-]?\d*)\s*years?/i,
    /(\d+[\–\-]?\d*)\s*years? (?:in (?:the )?wild|in captivity)/i,
    /(\d+[\–\-]?\d*)[- ]year[- ]old/i,
  ]);

  const weight = extractField(text, [
    /weigh[st]? (?:up to |between |about |around )?(\d[\d,.\–\-]+ ?(?:kg|lb|tonnes?|g|kilograms?|pounds?)\b)/i,
    /mass[^.]*?(\d[\d,.\–\-]+ ?(?:kg|lb|tonnes?|g)\b)/i,
    /(\d[\d,.\–\-]+ ?(?:kg|lb|tonnes?)) (?:in weight|in mass)/i,
    /body weight[^.]*?(\d[\d,.\–\-]+ ?(?:kg|lb|g)\b)/i,
  ]);

  const length = extractField(text, [
    /(?:body length|total length|head[- ]to[- ]tail)[^.]*?(\d[\d,.\–\-]+ ?(?:m|cm|ft|inches?|mm)\b)/i,
    /(?:length|long|tall)[^.]*?(\d[\d,.\–\-]+ ?(?:m|cm|ft|inches?)\b)/i,
    /(?:reach|grow)[^.]*?(\d[\d,.\–\-]+ ?(?:m|cm|ft)\b)/i,
    /(\d[\d,.\–\-]+ ?(?:m|cm|ft)) (?:long|tall|in length)/i,
    /(\d[\d,.\–\-]+ ?(?:metres?|meters?|feet|foot)) (?:long|tall|in length)/i,
  ]);

  const speed = extractField(text, [
    /(\d+[\–\-]?\d*) (?:km\/h|kph|mph|knots?)/i,
    /speed[^.]*?(\d+[\–\-]?\d* ?(?:km\/h|kph|mph))/i,
    /run[^.]*?(\d+[\–\-]?\d*) (?:km\/h|mph)/i,
    /swim[^.]*?(\d+[\–\-]?\d*) (?:km\/h|mph|knots?)/i,
    /fly[^.]*?(\d+[\–\-]?\d*) (?:km\/h|mph)/i,
  ]);

  const population = extractField(text, [
    /population[^.]*?(\d[\d,.\–\-]+ ?(?:million|thousand|billion)?)/i,
    /(\d[\d,.\–\-]+ ?(?:million|thousand)?) (?:individuals|animals|specimens?|remain)/i,
    /fewer than (\d[\d,. ]+ ?(?:million|thousand)?)/i,
    /estimated (?:at |to be )?(\d[\d,. ]+ ?(?:million|thousand)?)/i,
    /approximately (\d[\d,. ]+ ?(?:million|thousand)?)/i,
  ]);

  const habitatMatch = text.match(/(?:found in|inhabit[s]?|lives? in|native to|ranges? (?:from|across|throughout)|habitat[^.]{0,20}(?:include|is|are|consist))[^.]{5,120}\./i);
  const habitat = habitatMatch ? habitatMatch[0].replace(/\[\d+\]/g, '').trim() : (() => {
    const biomeMatch = text.match(/(?:forest|savann|grassland|desert|ocean|marine|arctic|tundra|rainforest|jungle|wetland|river|coastal|mountain)[^.]{0,60}\./i);
    return biomeMatch ? biomeMatch[0].replace(/\[\d+\]/g, '').trim() : 'Habitat data not available.';
  })();

  const dietMatch = text.match(/(?:feed[s]? on|eat[s]?|diet[^.]{0,20}(?:consist|include|compris)|prey[s]? on|carnivore|herbivore|omnivore|feeds? primarily)[^.]{5,120}\./i);
  const diet = dietMatch ? dietMatch[0].replace(/\[\d+\]/g, '').trim() : (() => {
    if (/carnivore|carnivorous/i.test(text)) return 'Carnivore — feeds on other animals.';
    if (/herbivore|herbivorous/i.test(text)) return 'Herbivore — feeds on plants.';
    if (/omnivore|omnivorous/i.test(text)) return 'Omnivore — feeds on both plants and animals.';
    return 'Diet data not available.';
  })();

  const threatMatch = text.match(/(?:threat[s]?(?:ened)?|endanger[s]?(?:ed)?|decline[s]?(?:d)?|loss of habitat|habitat loss|poach|hunting|deforestation|climate change)[^.]{5,140}\./i);
  const threat = threatMatch ? threatMatch[0].replace(/\[\d+\]/g, '').trim() : (() => {
    if (/endangered|critically/i.test(text)) return 'Listed as endangered due to habitat loss and human activity.';
    if (/vulnerable/i.test(text)) return 'Listed as vulnerable; populations declining.';
    return 'Threat data not available.';
  })();

  const rangeMatch = text.match(/(?:range|distribution|found across|found in|across)[^.]{5,100}\./i);
  const range = rangeMatch ? rangeMatch[0].replace(/\[\d+\]/g, '').trim() : 'Range data not available.';

  const funFactMatch = sentences.find(s =>
    /unique|remarkable|only|first|largest|smallest|fastest|slowest|can|able to|known for/i.test(s) &&
    s.length > 40 && s.length < 200
  );
  const funFact = funFactMatch ? funFactMatch.replace(/\[\d+\]/g, '').trim() : sentences[sentences.length - 1]?.trim() || 'No additional facts available.';

  const imageUrl = summary.originalimage?.source || summary.thumbnail?.source;

  return {
    commonName: title,
    scientificName,
    status,
    statusColor,
    habitat,
    diet,
    lifespan: lifespan !== 'Unknown' ? lifespan + (lifespan.includes('year') ? '' : ' years') : 'Unknown',
    weight: weight !== 'Unknown' ? weight : 'Unknown',
    length: length !== 'Unknown' ? length : 'Unknown',
    speed: speed !== 'Unknown' ? speed : 'Unknown',
    population: population !== 'Unknown' ? population : 'Unknown',
    range,
    funFact,
    threat,
    bio,
    imageUrl,
  };
}

interface WikidataEntity {
  claims?: Record<string, Array<{
    mainsnak?: {
      datavalue?: {
        value?: {
          amount?: string;
          unit?: string;
          id?: string;
          time?: string;
        } | string;
      };
    };
  }>>;
}

function wikidataAmount(claims: WikidataEntity['claims'], prop: string): string | null {
  const claimList = claims?.[prop];
  if (!claimList?.length) return null;
  const val = claimList[0]?.mainsnak?.datavalue?.value;
  if (typeof val === 'object' && val?.amount) {
    const n = parseFloat(val.amount.replace('+', ''));
    if (isNaN(n)) return null;
    return n.toLocaleString();
  }
  return null;
}

async function fetchWikidataByQid(qid: string): Promise<Partial<AnimalData>> {
  try {
    const entityRes = await fetch(
      `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`
    );
    const entityData = await entityRes.json();
    const entity: WikidataEntity = entityData?.entities?.[qid] ?? {};
    const claims = entity.claims ?? {};

    const result: Partial<AnimalData> = {};

    const lifespan = wikidataAmount(claims, 'P2250');
    if (lifespan) result.lifespan = `${lifespan} years`;

    const massKg = wikidataAmount(claims, 'P2067');
    if (massKg) result.weight = `${massKg} kg`;

    const lengthM = wikidataAmount(claims, 'P2043');
    if (lengthM) result.length = `${lengthM} m`;

    const speedKmh = wikidataAmount(claims, 'P2052');
    if (speedKmh) result.speed = `${speedKmh} km/h`;

    const popSize = wikidataAmount(claims, 'P1082') ?? wikidataAmount(claims, 'P5153');
    if (popSize) result.population = popSize;

    return result;
  } catch {
    return {};
  }
}

async function fetchAnimalData(query: string): Promise<AnimalData> {
  const encoded = encodeURIComponent(query);

  const searchRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encoded}&limit=1&namespace=0&format=json&origin=*`
  );
  const searchData = await searchRes.json();
  const bestTitle = searchData[1]?.[0] || query;

  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle)}`;
  const qidUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(bestTitle)}&prop=pageprops&ppprop=wikibase_item&format=json&origin=*`;

  const [summaryRes, qidRes] = await Promise.all([
    fetch(summaryUrl),
    fetch(qidUrl),
  ]);

  if (!summaryRes.ok) throw new Error('Not found');

  const [summary, qidData]: [WikipediaSummary, unknown] = await Promise.all([
    summaryRes.json(),
    qidRes.json(),
  ]);

  const pages = (qidData as { query?: { pages?: Record<string, { pageprops?: { wikibase_item?: string } }> } })?.query?.pages ?? {};
  const qid = (Object.values(pages)[0] as { pageprops?: { wikibase_item?: string } })?.pageprops?.wikibase_item;

  const [base, wikidataPartial] = await Promise.all([
    Promise.resolve(parseWikipediaData(summary as WikipediaSummary, bestTitle)),
    qid ? fetchWikidataByQid(qid) : Promise.resolve({}),
  ]);

  return {
    ...base,
    lifespan: wikidataPartial.lifespan ?? base.lifespan,
    weight: wikidataPartial.weight ?? base.weight,
    length: wikidataPartial.length ?? base.length,
    speed: wikidataPartial.speed ?? base.speed,
    population: wikidataPartial.population ?? base.population,
  };
}

interface AnimalEncyclopediaProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnimalEncyclopedia({ isOpen, onClose }: AnimalEncyclopediaProps) {
  const [query, setQuery] = useState('');
  const [dropdownItems, setDropdownItems] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnimalData | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResult(null);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    if (v.trim()) {
      const matches = SUGGESTIONS.filter(s => s.toLowerCase().includes(v.toLowerCase()));
      setDropdownItems(matches);
      setShowDropdown(matches.length > 0);
    } else {
      setShowDropdown(false);
    }
  }

  async function doSearch(animal?: string) {
    const q = (animal ?? query).trim();
    if (!q) return;
    setQuery(q);
    setShowDropdown(false);
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const data = await fetchAnimalData(q);
      setResult(data);
    } catch {
      setError("Couldn't fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyShare() {
    if (!result) return;
    navigator.clipboard.writeText(
      `${result.commonName} (${result.scientificName}) — Status: ${result.status} | Pop: ${result.population}`
    ).catch(() => {});
    setCopied(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => {
      setCopied(false);
      setToastVisible(false);
    }, 2500);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          background: '#09090b',
          border: '1px solid #1f1f25',
          boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
        }}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: 'rgba(9,9,11,0.95)', borderBottom: '1px solid #1f1f25', backdropFilter: 'blur(8px)' }}
        >
          <div>
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#52525b', letterSpacing: '3px' }}>
              Animal Encyclopedia
            </p>
            <h2 className="text-xl font-black text-white leading-tight" style={{ letterSpacing: '-0.5px' }}>
              Search any animal on Earth
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
            style={{ background: '#18181c', border: '1px solid #1f1f25', color: '#71717a' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#71717a'; }}
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-6 pt-5 pb-2">
          <div className="relative">
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
              style={{ background: '#111114', border: '1px solid #1f1f25' }}
            >
              <Search size={17} style={{ color: '#52525b', flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
                onFocus={() => query && dropdownItems.length > 0 && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                placeholder="e.g. Snow Leopard, Blue Whale, Axolotl…"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: '#f4f4f5', caretColor: '#3b82f6', fontFamily: 'inherit' }}
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setResult(null); setError(''); }}
                  className="text-xs rounded-md w-5 h-5 flex items-center justify-center transition-all"
                  style={{ background: '#1f1f25', color: '#71717a' }}
                >
                  <X size={11} />
                </button>
              )}
              <button
                onClick={() => doSearch()}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: '#2563eb',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'; }}
              >
                Search
              </button>
            </div>

            {showDropdown && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-20"
                style={{ background: '#111114', border: '1px solid #1f1f25', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}
              >
                {dropdownItems.map(item => (
                  <button
                    key={item}
                    className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-all"
                    style={{ color: '#a1a1aa', borderBottom: '1px solid #18181c', fontFamily: 'inherit' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#18181c'; (e.currentTarget as HTMLButtonElement).style.color = '#f4f4f5'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa'; }}
                    onMouseDown={() => doSearch(item)}
                  >
                    <span>{getEmoji(item)}</span>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!result && !loading && !error && (
            <div className="flex flex-wrap gap-2 mt-4">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => doSearch(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    background: '#111114',
                    border: '1px solid #1f1f25',
                    color: '#71717a',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#2563eb';
                    (e.currentTarget as HTMLButtonElement).style.color = '#f4f4f5';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#1f1f25';
                    (e.currentTarget as HTMLButtonElement).style.color = '#71717a';
                  }}
                >
                  {getEmoji(s)} {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center py-16">
            <div className="text-5xl animate-spin mb-4" style={{ display: 'inline-block' }}>🌍</div>
            <p className="text-sm" style={{ color: '#52525b' }}>Fetching data for <span style={{ color: '#f4f4f5', fontWeight: 700 }}>{query}</span>…</p>
          </div>
        )}

        {error && (
          <div
            className="mx-6 my-4 rounded-xl px-4 py-3 text-sm text-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
          >
            {error}
          </div>
        )}

        {result && (
          <div className="px-6 pb-6">
            <div
              className="rounded-2xl overflow-hidden mt-4"
              style={{ border: '1px solid #1f1f25', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            >
              <div
                className="relative overflow-hidden"
                style={{ minHeight: result.imageUrl ? '200px' : undefined }}
              >
                {result.imageUrl ? (
                  <div className="relative">
                    <img
                      src={result.imageUrl}
                      alt={result.commonName}
                      className="w-full object-cover"
                      style={{ maxHeight: '220px', objectPosition: 'center 30%' }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(9,9,11,0.85) 100%)' }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <ResultHeader result={result} copied={copied} onCopy={copyShare} />
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-6 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#134e2a 100%)' }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)',
                        backgroundSize: '36px 36px',
                      }}
                    />
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.2),transparent 70%)', transform: 'translate(30%,-30%)' }} />
                    <div className="relative z-10">
                      <ResultHeader result={result} copied={copied} onCopy={copyShare} showEmoji />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5" style={{ background: '#111114' }}>
                <div
                  className="text-sm leading-relaxed rounded-xl px-4 py-3"
                  style={{ background: '#18181c', border: '1px solid #1f1f25', color: '#a1a1aa' }}
                >
                  {result.bio}
                </div>

                <div className="mt-5">
                  <SectionTitle>Quick Stats</SectionTitle>
                  <div className="grid grid-cols-4 gap-2">
                    <StatBox label="Lifespan" value={result.lifespan} color="#818cf8" />
                    <StatBox label="Weight" value={result.weight} color="#34d399" />
                    <StatBox label="Length" value={result.length} color="#f59e0b" />
                    <StatBox label="Speed" value={result.speed} color="#f472b6" />
                  </div>
                </div>

                <div className="mt-5">
                  <SectionTitle>Population</SectionTitle>
                  <div className="rounded-xl p-4" style={{ background: '#18181c', border: '1px solid #1f1f25' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-2xl font-black leading-tight" style={{ color: result.population === 'Unknown' ? '#3f3f46' : result.statusColor, letterSpacing: '-1px' }}>
                          {result.population === 'Unknown' ? '—' : result.population}
                        </div>
                        <div className="text-xs mt-1" style={{ color: '#52525b' }}>Estimated wild population</div>
                      </div>
                      <div className="text-xs text-right leading-relaxed max-w-xs" style={{ color: '#a1a1aa' }}>
                        {result.range}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <SectionTitle>Ecology</SectionTitle>
                  <div className="flex flex-col gap-2">
                    <EcoRow icon="🌿" label="Habitat" value={result.habitat} />
                    <EcoRow icon="🍖" label="Diet" value={result.diet} />
                    <EcoRow icon="⚠️" label="Threat" value={result.threat} />
                  </div>
                </div>

                <div className="mt-5">
                  <SectionTitle>Fun Fact</SectionTitle>
                  <div
                    className="flex gap-4 items-start rounded-xl p-4"
                    style={{ background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.2)' }}
                  >
                    <span className="text-2xl flex-shrink-0">💡</span>
                    <p className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>{result.funFact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {toastVisible && (
          <div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium"
            style={{
              background: '#18181c',
              border: '1px solid #1f1f25',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              color: '#f4f4f5',
              zIndex: 9999,
            }}
          >
            <Check size={15} style={{ color: '#22c55e' }} /> Copied to clipboard!
          </div>
        )}
      </div>

      <style>{`
        @keyframes encyclopedia-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

function ResultHeader({
  result,
  copied,
  onCopy,
  showEmoji,
}: {
  result: AnimalData;
  copied: boolean;
  onCopy: () => void;
  showEmoji?: boolean;
}) {
  return (
    <div className="flex items-center gap-6">
      {showEmoji && (
        <div className="text-7xl" style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))', animation: 'encyclopedia-float 3.5s ease-in-out infinite', flexShrink: 0 }}>
          {getEmoji(result.commonName)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div
          className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded mb-2"
          style={{
            background: result.statusColor + '22',
            color: result.statusColor,
            border: `1px solid ${result.statusColor}44`,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          {result.status}
        </div>
        <div className="text-2xl font-black text-white leading-tight" style={{ letterSpacing: '-0.5px' }}>{result.commonName}</div>
        <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>{result.scientificName}</div>
      </div>
      <button
        onClick={onCopy}
        className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 transition-all"
        style={{
          background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)',
          border: copied ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.12)',
          color: copied ? '#4ade80' : 'rgba(255,255,255,0.7)',
        }}
        title="Copy to clipboard"
      >
        {copied ? <Check size={16} /> : <Link2 size={16} />}
      </button>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-1 h-px" style={{ background: '#1f1f25' }} />
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#52525b' }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: '#1f1f25' }} />
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  const isUnknown = value === 'Unknown' || !value;
  return (
    <div className="rounded-xl p-3" style={{ background: '#18181c', border: '1px solid #1f1f25' }}>
      <div className="text-xs uppercase tracking-wide mb-1.5" style={{ color: '#52525b', letterSpacing: '0.8px' }}>{label}</div>
      <div className="text-xs font-bold leading-tight" style={{ color: isUnknown ? '#3f3f46' : color }}>
        {isUnknown ? '—' : value}
      </div>
    </div>
  );
}

function EcoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-3 items-start rounded-xl px-3 py-3" style={{ background: '#18181c', border: '1px solid #1f1f25' }}>
      <div className="text-xs font-bold uppercase tracking-wide pt-0.5 flex-shrink-0 flex items-center gap-1.5" style={{ color: '#52525b', minWidth: '72px', letterSpacing: '0.8px' }}>
        {icon} {label}
      </div>
      <div className="text-xs leading-relaxed" style={{ color: '#a1a1aa' }}>{value}</div>
    </div>
  );
}
