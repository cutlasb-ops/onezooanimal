export interface StreamChannel {
  id: string;
  name: string;
  emoji: string;
  color: string;
  viewers: number;
  context: string;
  prompt: string;
}

export const STREAM_CHANNELS: StreamChannel[] = [
  {
    id: "wolves",
    name: "Lamar Canyon Wolf Pack",
    emoji: "\u{1F43A}",
    color: "#5F5E5A",
    viewers: 9100,
    context: "Lamar Canyon wolf pack, Yellowstone, April denning season, 10 members, rival is Junction Butte Pack",
    prompt: "You are a live wildlife sports commentator. Generate 2-sentence ESPN-energy commentary about the Lamar Canyon wolf pack during April denning season. Real wolf behaviors only \u2014 scent marking, howling, pup protection, territorial patrol. Output commentary only.",
  },
  {
    id: "serengeti",
    name: "Serengeti Watering Hole",
    emoji: "\u{1F981}",
    color: "#BA7517",
    viewers: 14820,
    context: "Serengeti watering hole, dry season, lions, elephants, wildebeest share the source",
    prompt: "You are a live wildlife commentator. Generate 2-sentence urgent live update for a Serengeti watering hole cam. Real behaviors \u2014 dominance at water, predator ambush, herd alerts. Output commentary only.",
  },
  {
    id: "migration",
    name: "Great Migration",
    emoji: "\u{1F403}",
    color: "#1D9E75",
    viewers: 22400,
    context: "Great Wildebeest Migration, Mara River, 1.5M wildebeest, Week 14, Nile crocodiles waiting",
    prompt: "You are a live wildlife commentator covering the Great Migration. Generate 2-sentence high-energy commentary. Real facts \u2014 1.5M wildebeest, crocodile ambushes, calf survival, river crossing chaos. Output commentary only.",
  },
  {
    id: "tern",
    name: "Arctic Tern Migration",
    emoji: "\u{1F426}",
    color: "#7F77DD",
    viewers: 3900,
    context: "Arctic tern northbound migration, mid-Atlantic, April, 90000km annual journey, 100g bird",
    prompt: "You are a wildlife commentator. Generate 2-sentence poetic but punchy commentary for Arctic tern migration. Real facts \u2014 90000km journey, magnetic navigation, feeding on the fly. Output commentary only.",
  },
  {
    id: "panda",
    name: "Edinburgh Panda Cam",
    emoji: "\u{1F43C}",
    color: "#378ADD",
    viewers: 6800,
    context: "Tian Tian, 25yr old giant panda, Edinburgh Zoo, eats 38kg bamboo daily, UK's only panda",
    prompt: "You are a warm wildlife presenter. Generate 2-sentence narration for the Edinburgh panda cam. Real panda facts \u2014 bamboo feeding, enrichment, scent marking, play. Output narration only.",
  },
];

export const VISION_PROMPT_TEMPLATE = (context: string) =>
  `You are a live wildlife AI commentator for OneZoo. Context: ${context}. Analyze this image and generate 2-sentence live commentary describing what you actually see. Output commentary only.`;
