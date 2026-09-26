/*
  # Create Animal Facts Table

  1. New Tables
    - `animal_facts`
      - `id` (serial, primary key)
      - `fact` (text) - The animal fact content
      - `animal_name` (text) - Name of the animal the fact is about
      - `category` (text) - Category like mammals, reptiles, birds, etc.
      - `fun_rating` (integer) - How fun/interesting the fact is (1-5)
      - `last_sent_at` (timestamptz) - When this fact was last sent
      - `send_count` (integer) - How many times this fact has been sent
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `animal_facts` table
    - Allow authenticated users to read facts
    - Only service role can insert/update (via edge functions)

  3. Seed Data
    - 60 interesting animal facts for daily rotation
*/

CREATE TABLE IF NOT EXISTS animal_facts (
  id serial PRIMARY KEY,
  fact text NOT NULL,
  animal_name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  fun_rating integer NOT NULL DEFAULT 3,
  last_sent_at timestamptz,
  send_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE animal_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read animal facts"
  ON animal_facts
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

INSERT INTO animal_facts (fact, animal_name, category, fun_rating) VALUES
  ('Octopuses have three hearts, nine brains, and blue blood. Two hearts pump blood to the gills, while the third pumps it to the rest of the body.', 'Octopus', 'marine', 5),
  ('A group of flamingos is called a "flamboyance." They can only eat with their heads upside down.', 'Flamingo', 'birds', 5),
  ('Sea otters hold hands while they sleep so they don''t drift apart. They also have a favorite rock they keep in a pouch under their arm.', 'Sea Otter', 'marine', 5),
  ('Elephants are the only animals that can''t jump. They also mourn their dead and have been observed performing burial rituals.', 'Elephant', 'mammals', 5),
  ('A mantis shrimp can punch with the force of a .22 caliber bullet. Their strike is so fast it boils the water around their fist.', 'Mantis Shrimp', 'marine', 5),
  ('Crows can recognize human faces and hold grudges for years. They also gift objects to people who feed them.', 'Crow', 'birds', 5),
  ('Dolphins have names for each other. Each dolphin develops a unique whistle that other dolphins use to call them.', 'Dolphin', 'marine', 5),
  ('A group of pugs is called a "grumble." Pugs were originally bred to be lap dogs for Chinese emperors.', 'Pug', 'mammals', 4),
  ('Axolotls can regenerate their brain, heart, and limbs. They never undergo metamorphosis, staying aquatic their whole lives.', 'Axolotl', 'amphibians', 5),
  ('Wombat poop is cube-shaped. They use it to mark their territory, and the shape prevents it from rolling away.', 'Wombat', 'mammals', 5),
  ('Pistol shrimp can snap their claws so fast it creates a bubble that reaches 4,700 degrees Celsius -- nearly as hot as the surface of the sun.', 'Pistol Shrimp', 'marine', 5),
  ('Hummingbirds are the only birds that can fly backwards. Their hearts beat up to 1,200 times per minute.', 'Hummingbird', 'birds', 4),
  ('A blue whale''s heart is so large that a small child could crawl through its arteries. It beats only about 8-10 times per minute.', 'Blue Whale', 'marine', 5),
  ('Tardigrades (water bears) can survive in the vacuum of space, extreme radiation, and temperatures from near absolute zero to 300 degrees Fahrenheit.', 'Tardigrade', 'microscopic', 5),
  ('Honey badgers are immune to most snake venom. After being bitten by a cobra, they just take a nap and wake up fine.', 'Honey Badger', 'mammals', 5),
  ('Cats have over 20 vocalizations, including the purr which vibrates at a frequency that promotes bone healing.', 'Cat', 'mammals', 4),
  ('Penguins propose to their mates with a pebble. If the female accepts, they mate for life.', 'Penguin', 'birds', 5),
  ('Sloths can hold their breath longer than dolphins -- up to 40 minutes underwater by slowing their heart rate.', 'Sloth', 'mammals', 5),
  ('Butterflies taste with their feet. A butterfly''s proboscis works like a straw to sip nectar.', 'Butterfly', 'insects', 4),
  ('Giraffes only need 30 minutes of sleep per day, taken in short 5-minute naps. They sleep standing up.', 'Giraffe', 'mammals', 4),
  ('A woodpecker''s tongue wraps around the back of its skull. This cushions their brain during pecking at up to 20 times per second.', 'Woodpecker', 'birds', 5),
  ('Platypuses are one of only five species of venomous mammals. Males have a venomous spur on their hind legs.', 'Platypus', 'mammals', 4),
  ('An electric eel can produce enough electricity (860 volts) to power a dozen light bulbs.', 'Electric Eel', 'fish', 4),
  ('Snow leopards can''t roar. Instead, they make a unique sound called a "chuff" to greet each other.', 'Snow Leopard', 'mammals', 4),
  ('Koalas sleep up to 22 hours a day. Their fingerprints are so similar to humans that they''ve confused crime scene investigators.', 'Koala', 'mammals', 5),
  ('A chameleon''s tongue is roughly twice the length of its body and can accelerate from 0 to 60 mph in a hundredth of a second.', 'Chameleon', 'reptiles', 5),
  ('Bees can recognize human faces. They process faces the same way humans do -- by looking at the arrangement of features.', 'Bee', 'insects', 4),
  ('Sharks existed before trees. Sharks have been around for about 400 million years, while trees are only about 350 million years old.', 'Shark', 'marine', 5),
  ('A group of owls is called a "parliament." Great horned owls have no sense of smell, which is why they''re one of the few predators of skunks.', 'Owl', 'birds', 4),
  ('Red pandas use their fluffy tails as blankets to keep warm in their cold mountain habitats.', 'Red Panda', 'mammals', 5),
  ('Jellyfish have no brain, heart, or blood. Some species are immortal -- the Turritopsis dohrnii can revert back to its juvenile state.', 'Jellyfish', 'marine', 5),
  ('A rhinoceros horn is made of keratin, the same protein in your fingernails. Despite myths, it has zero medicinal value.', 'Rhinoceros', 'mammals', 4),
  ('Parrots can learn to use tools and understand the concept of zero -- something human children struggle with until age 3-4.', 'Parrot', 'birds', 5),
  ('Wolverines have been known to fight off bears and wolves many times their size to defend a meal. Pound for pound, they''re one of the toughest animals.', 'Wolverine', 'mammals', 4),
  ('Sperm whales sleep vertically, bobbing at the surface like giant pickles. They only sleep for about 7% of the day.', 'Sperm Whale', 'marine', 5),
  ('Leafcutter ants don''t eat the leaves they cut. They use them to grow a fungus garden underground -- making them the world''s first farmers.', 'Leafcutter Ant', 'insects', 5),
  ('A polar bear''s fur is actually transparent, not white. Each hair is a hollow tube that reflects light, making them appear white.', 'Polar Bear', 'mammals', 5),
  ('Capybaras are so chill that other animals love sitting on them. Birds, monkeys, and even rabbits have been spotted riding on capybaras.', 'Capybara', 'mammals', 5),
  ('The mimic octopus can impersonate at least 15 different species, including lionfish, flatfish, and sea snakes, depending on the threat.', 'Mimic Octopus', 'marine', 5),
  ('Cheetahs can''t roar. Instead, they chirp like birds and purr like house cats.', 'Cheetah', 'mammals', 4),
  ('Archerfish can spit water at insects up to 5 feet above the water''s surface with pinpoint accuracy, accounting for light refraction.', 'Archerfish', 'fish', 5),
  ('A group of porcupines is called a "prickle." Baby porcupines are called "porcupettes" and are born with soft quills.', 'Porcupine', 'mammals', 4),
  ('Lyrebirds can mimic almost any sound -- chainsaws, camera shutters, car alarms, and even human speech.', 'Lyrebird', 'birds', 5),
  ('Hippos secrete a natural red-tinted sunscreen to protect their sensitive skin from UV rays.', 'Hippopotamus', 'mammals', 4),
  ('Narwhals'' tusks are actually inside-out teeth with millions of nerve endings. They can sense changes in water temperature and salinity.', 'Narwhal', 'marine', 5),
  ('Gorillas hum happy songs when they eat. Different meals get different songs.', 'Gorilla', 'mammals', 5),
  ('Bombardier beetles defend themselves by shooting boiling hot chemical spray from their abdomen at predators.', 'Bombardier Beetle', 'insects', 5),
  ('Elephants can "hear" with their feet. They detect seismic vibrations through their toes from other elephants up to 10 miles away.', 'Elephant', 'mammals', 5),
  ('A bar-tailed godwit holds the record for the longest non-stop flight -- 7,500 miles from Alaska to New Zealand in 11 days without rest.', 'Bar-tailed Godwit', 'birds', 5),
  ('Cuttlefish have W-shaped pupils and can see polarized light. They have the most sophisticated eyes of any invertebrate.', 'Cuttlefish', 'marine', 4),
  ('Prairie dogs have the most sophisticated animal language discovered so far. They can describe a specific human including height, build, and clothing color.', 'Prairie Dog', 'mammals', 5),
  ('Glass frogs have transparent bellies that let you see their beating heart, digestive system, and developing eggs from underneath.', 'Glass Frog', 'amphibians', 5),
  ('Ravens can solve multi-step puzzles and plan for the future -- abilities once thought to be uniquely human.', 'Raven', 'birds', 5),
  ('The tongue of a blue whale weighs as much as an elephant. A single blue whale needs to eat about 4 tons of krill per day.', 'Blue Whale', 'marine', 4),
  ('Pangolins are the only mammals with scales. When threatened, they curl into an armored ball that even lions can''t penetrate.', 'Pangolin', 'mammals', 5),
  ('Dragonflies have a 95% hunting success rate -- making them the most efficient predators in the animal kingdom.', 'Dragonfly', 'insects', 5),
  ('Fennec foxes have ears up to 6 inches long that act as natural radiators, helping them dissipate heat in the Sahara Desert.', 'Fennec Fox', 'mammals', 5),
  ('Male seahorses are the ones who get pregnant and give birth. A single male can deliver up to 2,500 babies at once.', 'Seahorse', 'marine', 5),
  ('Alpine ibex can climb near-vertical dam walls to lick salt and minerals from the stone surface.', 'Alpine Ibex', 'mammals', 5),
  ('A flea can jump up to 150 times its body length. That would be like a human jumping over a 75-story building.', 'Flea', 'insects', 4);
