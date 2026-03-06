import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gem, Sparkles, Heart, Shield, Sun, Moon, Eye, Zap, Leaf, Star, Droplets, Flame } from "lucide-react";
import { Link } from "wouter";

interface Crystal {
  name: string;
  tagline: string;
  description: string;
  properties: string[];
  chakra: string;
  element: string;
  gradient: string;
  icon: typeof Gem;
  funFact: string;
}

const crystals: Crystal[] = [
  {
    name: "Clear Quartz",
    tagline: "The Master Healer",
    description: "The Swiss Army knife of crystals. It amplifies energy, clears mental fog, and pairs well with literally every other stone. If crystals had a class president, this would be it.",
    properties: ["Amplification", "Clarity", "Energy cleansing", "Intention setting"],
    chakra: "Crown",
    element: "All",
    gradient: "from-gray-200 via-white to-gray-100",
    icon: Star,
    funFact: "Clear Quartz makes up about 12% of the Earth's crust. It's been used in watches, computers, and spiritual practices. The original multi-tasker."
  },
  {
    name: "Amethyst",
    tagline: "Spiritual Insight",
    description: "The crystal that says 'calm down' in the most beautiful way possible. Known for opening the third eye and helping you access intuition you didn't know you had.",
    properties: ["Intuition", "Spiritual awareness", "Calm", "Third eye activation"],
    chakra: "Third Eye & Crown",
    element: "Air",
    gradient: "from-purple-300 via-violet-400 to-purple-600",
    icon: Eye,
    funFact: "Ancient Greeks believed amethyst prevented intoxication. They literally made wine goblets from it. Spoiler: it did not work."
  },
  {
    name: "Rose Quartz",
    tagline: "Heart Healing",
    description: "The love stone. Not just romantic love, but the kind where you look in the mirror and don't immediately start critiquing. Self-love is the hardest curriculum.",
    properties: ["Unconditional love", "Self-worth", "Emotional healing", "Compassion"],
    chakra: "Heart",
    element: "Water",
    gradient: "from-pink-200 via-rose-300 to-pink-400",
    icon: Heart,
    funFact: "Rose Quartz has been used as a love token since 600 BC. It's been in the love game longer than most relationship advice columns."
  },
  {
    name: "Black Obsidian",
    tagline: "Truth Revealer",
    description: "This stone doesn't sugarcoat anything. It's the brutally honest friend who tells you what you need to hear. Protection and truth, no chaser.",
    properties: ["Protection", "Truth", "Grounding", "Shadow work"],
    chakra: "Root",
    element: "Earth & Fire",
    gradient: "from-gray-700 via-gray-900 to-black",
    icon: Shield,
    funFact: "Obsidian is volcanic glass, formed when lava cools rapidly. It's been used for surgical scalpels because it can be sharper than steel. Metal."
  },
  {
    name: "Citrine",
    tagline: "Solar Manifestation",
    description: "The abundance stone. Citrine is like liquid sunshine trapped in rock form. Carry it when you need confidence, creativity, or just a reminder that you're capable of good things.",
    properties: ["Manifestation", "Confidence", "Creativity", "Abundance"],
    chakra: "Solar Plexus",
    element: "Fire",
    gradient: "from-yellow-200 via-amber-300 to-orange-400",
    icon: Sun,
    funFact: "Natural citrine is actually pretty rare. Most 'citrine' on the market is heat-treated amethyst. Know what you're buying."
  },
  {
    name: "Labradorite",
    tagline: "Magic Awakener",
    description: "The stone of transformation and magic. That iridescent flash? That's called labradorescence, and it's basically the crystal version of showing off. Deservedly.",
    properties: ["Transformation", "Intuition", "Protection", "Magic"],
    chakra: "Third Eye",
    element: "Water",
    gradient: "from-blue-300 via-indigo-400 to-violet-500",
    icon: Sparkles,
    funFact: "Inuit legends say the Northern Lights were trapped in rocks along the Labrador coast. A warrior freed most of them with his spear, but some remained. Those became labradorite."
  },
  {
    name: "Selenite",
    tagline: "Divine Connection",
    description: "Named after Selene, the Greek moon goddess. This crystal is all about clearing energy and connecting to something higher. Also makes a gorgeous lamp.",
    properties: ["Cleansing", "Peace", "Divine connection", "Mental clarity"],
    chakra: "Crown",
    element: "Air",
    gradient: "from-white via-blue-50 to-gray-100",
    icon: Moon,
    funFact: "Selenite is water-soluble. Do not put it in your water bottle. This has been a public service announcement."
  },
  {
    name: "Moldavite",
    tagline: "Cosmic Transformation",
    description: "Born from a meteorite impact 15 million years ago. This isn't just a crystal, it's literally space debris that survived atmospheric entry. Your problems seem manageable now, right?",
    properties: ["Rapid transformation", "Spiritual evolution", "Cosmic connection", "Breakthrough"],
    chakra: "Heart & Third Eye",
    element: "Storm",
    gradient: "from-green-300 via-emerald-500 to-green-700",
    icon: Zap,
    funFact: "Moldavite is technically a tektite (impact glass), not a crystal. It only comes from one place on Earth: the Czech Republic. Supply is finite and running out."
  },
  {
    name: "Fluorite",
    tagline: "Mental Clarity",
    description: "The study buddy of the crystal world. Fluorite helps organize chaotic thoughts and protects against electromagnetic fog. Your brain's best friend during decision season.",
    properties: ["Focus", "Mental clarity", "Psychic protection", "Organization"],
    chakra: "Third Eye",
    element: "Air & Water",
    gradient: "from-green-200 via-blue-300 to-purple-300",
    icon: Eye,
    funFact: "Fluorite is where we get the word 'fluorescent.' Under UV light, many specimens glow. It was literally the OG glow-up."
  },
  {
    name: "Hematite",
    tagline: "Ancient Grounding",
    description: "Heavy, metallic, and deeply grounding. When you feel scattered, hematite is the stone equivalent of someone putting their hands on your shoulders and saying 'breathe.'",
    properties: ["Grounding", "Protection", "Strength", "Stability"],
    chakra: "Root",
    element: "Earth",
    gradient: "from-gray-500 via-gray-700 to-gray-900",
    icon: Shield,
    funFact: "Hematite has been found on Mars. NASA's Opportunity rover discovered it, which means this grounding stone exists on another planet. Let that sink in."
  },
  {
    name: "Moonstone",
    tagline: "Intuitive Wisdom",
    description: "The stone of new beginnings and inner wisdom. Moonstone connects you to lunar cycles, intuition, and the part of yourself that already knows what to do.",
    properties: ["Intuition", "New beginnings", "Emotional balance", "Inner wisdom"],
    chakra: "Third Eye & Sacral",
    element: "Water",
    gradient: "from-blue-100 via-indigo-200 to-gray-200",
    icon: Moon,
    funFact: "In Hindu mythology, moonstone is made of solidified moonbeams. We can't verify this, but we choose to believe it."
  },
  {
    name: "Carnelian",
    tagline: "Creative Fire",
    description: "The motivation stone. When you need a kick in the pants to start that project, make that call, or just get out of bed with some enthusiasm. Carnelian is your hype crystal.",
    properties: ["Courage", "Creativity", "Vitality", "Motivation"],
    chakra: "Sacral",
    element: "Fire",
    gradient: "from-orange-300 via-red-400 to-orange-500",
    icon: Flame,
    funFact: "Ancient Egyptian architects wore carnelian to denote their rank. Napoleon had a carnelian seal. It's been the confident person's stone for millennia."
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function CrystalGuide() {
  const [selected, setSelected] = useState<Crystal | null>(null);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-500 mb-6">
              <Gem className="w-4 h-4" /> 12 Crystals Explained Honestly
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              The <span className="text-gradient">Crystal Guide</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
              No woo-woo gatekeeping. Just honest info about 12 popular crystals, what people
              believe about them, and what science actually says. Pretty rocks with good vibes.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {crystals.map((crystal, i) => (
              <motion.button
                key={crystal.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                onClick={() => setSelected(crystal)}
                className="glass-card text-left group cursor-pointer hover:ring-2 hover:ring-brand-500/30 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${crystal.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <crystal.icon className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <h3 className="font-display font-semibold text-sm sm:text-base mb-1">{crystal.name}</h3>
                <p className="text-xs text-brand-500 font-medium">{crystal.tagline}</p>
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setSelected(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.3 }}
                  onClick={e => e.stopPropagation()}
                  className="glass rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selected.gradient} flex items-center justify-center shrink-0`}>
                      <selected.icon className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold">{selected.name}</h2>
                      <p className="text-brand-500 font-medium text-sm">{selected.tagline}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{selected.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="glass rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Chakra</p>
                      <p className="text-sm font-medium">{selected.chakra}</p>
                    </div>
                    <div className="glass rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Element</p>
                      <p className="text-sm font-medium">{selected.element}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Properties</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.properties.map(p => (
                        <span key={p} className="px-3 py-1 rounded-full glass text-xs font-medium text-brand-400">{p}</span>
                      ))}
                    </div>
                  </div>

                  <div className="glass rounded-xl p-4 mb-6">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Fun Fact</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selected.funFact}</p>
                  </div>

                  <div className="flex gap-3">
                    <Link href="/store">
                      <span className="btn-primary text-sm px-5 py-2.5 cursor-pointer inline-flex items-center gap-2">
                        <Gem className="w-4 h-4" /> Shop Crystals
                      </span>
                    </Link>
                    <button onClick={() => setSelected(null)} className="btn-outline text-sm px-5 py-2.5">Close</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
