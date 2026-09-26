export interface FaunaAnimal {
  id: number;
  name: string;
  species: string;
  location: string;
  emoji: string;
  color: string;
  tags: string[];
  stats: Record<string, string>;
  bio: string;
  facts: string[];
  viewers: number;
  record: string;
  rival: string | null;
  pts: number;
  migration?: {
    week: number;
    total: number;
    phase: string;
    next: string;
  };
}

export interface FaunaEvent {
  id: number;
  title: string;
  type: string;
  animal: string;
  date: string;
  time: string;
  status: string;
  viewers: number;
  aiEnabled: boolean;
}

export interface ScoringEvent {
  id: number;
  label: string;
  pts: number;
}

export interface FaunaDraft {
  name: string;
  date: string;
  time: string;
  open: boolean;
  rounds: number;
  teamsMax: number;
  teamsJoined: number;
  scoringEvents: ScoringEvent[];
}

export const INITIAL_ANIMALS: FaunaAnimal[] = [
  { id: 1, name: "Scarface", species: "African Lion", location: "Maasai Mara, Kenya", emoji: "\u{1F981}", color: "#BA7517", tags: ["Top predator", "Coalition leader", "Documentary subject"], stats: { topSpeed: "80 km/h", huntSuccess: "25%", territory: "260 km\u00B2", age: "14 yrs", weight: "180 kg" }, bio: "Scarface led the Notch coalition for over a decade \u2014 one of the longest-reigning lion coalitions ever recorded in the Maasai Mara.", facts: ["Led a 5-male coalition \u2014 extremely rare", "Survived 3 serious injuries", "Documented by BBC & Nat Geo"], viewers: 14820, record: "11 yrs territory dominance", rival: "Notch II coalition", pts: 340 },
  { id: 2, name: "April", species: "Giraffe", location: "Animal Adventure Park, NY", emoji: "\u{1F992}", color: "#EF9F27", tags: ["Internet icon", "Most-watched birth", "Conservation ambassador"], stats: { topSpeed: "55 km/h", height: "5.5 m", weight: "900 kg", age: "20 yrs" }, bio: "April's 2017 live birth stream drew 1.2 million concurrent viewers on YouTube \u2014 one of the most-watched animal streams in internet history.", facts: ["1.2M concurrent YouTube viewers at birth", "Streamed 3 months before giving birth", "Raised $1M+ for giraffe conservation"], viewers: 8200, record: "1.2M concurrent viewers (2017)", rival: null, pts: 210 },
  { id: 3, name: "Lamar Canyon Pack", species: "Grey Wolf", location: "Yellowstone NP, Wyoming", emoji: "\u{1F43A}", color: "#5F5E5A", tags: ["Most studied pack", "Reintroduction success", "Keystone species"], stats: { topSpeed: "72 km/h", territory: "1,000+ km\u00B2", packSize: "10 wolves", age: "Pack est. 2012", weight: "40\u201360 kg" }, bio: "The most studied wolf pack in the world. Their territory spans the Lamar Valley, tracked continuously since the 1995 Yellowstone reintroduction.", facts: ["Wolves restored Yellowstone's rivers via trophic cascade", "Pack territories tracked daily by Yellowstone Wolf Project", "100+ pups born in Lamar lineage since 1995"], viewers: 9100, record: "30 yrs continuous research data", rival: "Junction Butte Pack", pts: 290 },
  { id: 4, name: "Wildebeest Migration", species: "Blue Wildebeest (1.5M)", location: "Serengeti\u2013Mara Ecosystem", emoji: "\u{1F403}", color: "#1D9E75", tags: ["Largest migration", "UNESCO ecosystem", "Predator hotspot"], stats: { distance: "1,800 km/yr", herdSize: "1.5M animals", speed: "80 km/h sprint", crossings: "2\u20133/yr" }, bio: "The largest overland animal migration on Earth. 1.5M wildebeest complete a continuous 1,800 km loop between Tanzania and Kenya driven by rainfall.", facts: ["250,000 wildebeest die per crossing season", "Crocodiles wait up to a year for crossing events", "Migration generates $200M+ in annual tourism revenue"], viewers: 22400, record: "Largest land migration on Earth", rival: null, pts: 410, migration: { week: 14, total: 52, phase: "Mara River crossing season", next: "Southern return begins July" } },
  { id: 5, name: "Tian Tian", species: "Giant Panda", location: "Edinburgh Zoo, Scotland", emoji: "\u{1F43C}", color: "#378ADD", tags: ["Endangered recovery", "Zoo diplomacy", "Bamboo athletes"], stats: { weight: "100\u2013150 kg", age: "25 yrs", diet: "99% bamboo", dailyBamboo: "12\u201338 kg/day" }, bio: "The UK's only giant panda on loan from China. Giant pandas were downlisted from Endangered to Vulnerable in 2016 \u2014 a major conservation win.", facts: ["Wild population recovered to 1,864 (2021 census)", "Downlisted to Vulnerable in 2016", "Eats up to 38 kg of bamboo daily"], viewers: 6800, record: "Only panda in the UK", rival: null, pts: 175 },
  { id: 6, name: "Arctic Tern", species: "Sterna paradisaea", location: "Iceland \u2192 Antarctica", emoji: "\u{1F426}", color: "#7F77DD", tags: ["Distance record", "Pole to pole", "Two summers/year"], stats: { migration: "90,000 km/yr", lifespan: "30 yrs", totalLifeDist: "2.4M km", weight: "100 g", wingspan: "85 cm" }, bio: "Makes the longest migration of any animal \u2014 up to 90,000 km annually, chasing two summers per year. Over 30 years, travels equivalent to 3 round trips to the Moon.", facts: ["Travels 90,000 km per year \u2014 pole to pole", "Sees more daylight than any other creature", "Weighs 100g \u2014 lighter than a smartphone"], viewers: 3900, record: "Longest migration of any animal", rival: null, pts: 175, migration: { week: 8, total: 26, phase: "Northbound Atlantic route", next: "Iceland arrival est. May" } },
];

export const INITIAL_SCHEDULE: FaunaEvent[] = [
  { id: 1, title: "Mara River Crossing \u2014 Live", type: "migration", animal: "Wildebeest Migration", date: "2026-06-15", time: "08:00", status: "upcoming", viewers: 0, aiEnabled: true },
  { id: 2, title: "Lamar Pack vs Junction Butte", type: "rivalry", animal: "Lamar Canyon Pack", date: "2026-04-20", time: "06:30", status: "live", viewers: 9100, aiEnabled: true },
  { id: 3, title: "Yellowstone Pup Season Watch", type: "birth", animal: "Lamar Canyon Pack", date: "2026-04-10", time: "00:00", status: "live", viewers: 3400, aiEnabled: true },
  { id: 4, title: "Tian Tian Enrichment Stream", type: "cam", animal: "Tian Tian", date: "2026-04-08", time: "10:00", status: "live", viewers: 6800, aiEnabled: false },
  { id: 5, title: "Arctic Tern Iceland Arrival", type: "migration", animal: "Arctic Tern", date: "2026-05-10", time: "12:00", status: "upcoming", viewers: 0, aiEnabled: true },
  { id: 6, title: "Serengeti Dusk Hunt Watch", type: "hunt", animal: "Scarface", date: "2026-04-09", time: "17:30", status: "upcoming", viewers: 0, aiEnabled: true },
];

export const INITIAL_DRAFT: FaunaDraft = {
  name: "OneZoo Spring Draft 2026",
  date: "2026-04-15",
  time: "19:00",
  open: true,
  rounds: 4,
  teamsMax: 32,
  teamsJoined: 18,
  scoringEvents: [
    { id: 1, label: "Animal spotted on cam", pts: 1 },
    { id: 2, label: "Successful hunt observed", pts: 10 },
    { id: 3, label: "Birth event (live)", pts: 25 },
    { id: 4, label: "Rare behavior \u2014 AI detected", pts: 15 },
    { id: 5, label: "Migration crossing", pts: 20 },
    { id: 6, label: "Rival encounter", pts: 8 },
  ]
};

export const COMMENTARY_PROMPTS: Record<string, string> = {
  rivalry: "You are a live wildlife sports commentator for OneZoo. Generate exciting, real-time play-by-play commentary for a territorial rivalry between wolf packs in Yellowstone. Use real facts about grey wolf behavior \u2014 pack dynamics, howling, scent marking, flank attacks. Keep each update to 2 sentences. Make it feel like ESPN for wolves. Output only the commentary line, no quotes.",
  migration: "You are a live wildlife sports commentator for OneZoo. Generate exciting real-time commentary for the Great Wildebeest Migration river crossing. Use real facts \u2014 crocodile ambushes, the chaos of 1.5M animals, calf survival rates. 2 sentences, ESPN energy. Output only the commentary.",
  hunt: "You are a live wildlife sports commentator for OneZoo. Generate real-time commentary for a lion hunt in the Maasai Mara. Use real facts \u2014 lions' 25% hunt success rate, coordinated female flanking, prey escape tactics. 2 sentences. Output only the commentary.",
  birth: "You are a live wildlife sports commentator for OneZoo. Generate warm, exciting commentary for a wolf pup birth event in Yellowstone. Real facts about wolf pup development, pack protection behavior, denning season. 2 sentences. Output only the commentary.",
  cam: "You are a wildlife presenter for OneZoo. Narrate what a giant panda might be doing during enrichment time at a zoo \u2014 bamboo feeding behavior, scent marking, play. Real facts, warm tone. 2 sentences. Output only the narration.",
  migration2: "You are a live wildlife commentator. Generate commentary for an Arctic tern spotted mid-migration over the Atlantic. Real facts \u2014 their 90,000 km journey, navigation by magnetic field, feeding on the fly. 2 sentences. Output only.",
};

export const TYPE_COLORS: Record<string, { fg: string; bg: string }> = {
  migration: { fg: "#1D9E75", bg: "#E1F5EE" },
  rivalry: { fg: "#E24B4A", bg: "#FCEBEB" },
  birth: { fg: "#D4537E", bg: "#FBEAF0" },
  hunt: { fg: "#BA7517", bg: "#FAEEDA" },
  cam: { fg: "#378ADD", bg: "#E6F1FB" },
};
