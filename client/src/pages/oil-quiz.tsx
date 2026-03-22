import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets,
  Leaf,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  FlaskConical,
  Wind,
  Sun,
  Moon,
  Heart,
  Shield,
  Flame,
} from "lucide-react";
import { Link } from "wouter";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuizOption {
  label: string;
  affinities: Record<OilKey, number>;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

type OilKey =
  | "lavender"
  | "peppermint"
  | "teaTree"
  | "eucalyptus"
  | "frankincense"
  | "rosemary"
  | "chamomile"
  | "ylangYlang"
  | "lemon"
  | "sandalwood"
  | "rose"
  | "bergamot";

interface OilProfile {
  name: string;
  tagline: string;
  description: string;
  usageTips: string[];
  gradient: string;
  icon: typeof Droplets;
}

// ---------------------------------------------------------------------------
// Oil profiles
// ---------------------------------------------------------------------------

const OIL_PROFILES: Record<OilKey, OilProfile> = {
  lavender: {
    name: "Lavender",
    tagline: "The Universal Healer",
    description:
      "Lavender is the cornerstone of any essential oil collection. Known for its deeply calming properties, it eases anxiety, promotes restful sleep, and soothes irritated skin. A single drop on your pillow can transform your nighttime routine.",
    usageTips: [
      "Add 3-4 drops to your diffuser before bed for better sleep",
      "Dilute with a carrier oil and apply to temples for headache relief",
      "Mix into an Epsom salt bath to melt tension",
    ],
    gradient: "from-violet-400 to-purple-600",
    icon: Moon,
  },
  peppermint: {
    name: "Peppermint",
    tagline: "The Energizer",
    description:
      "Peppermint is a powerhouse for focus and physical relief. Its cooling menthol sensation awakens the senses, clears brain fog, and provides fast-acting relief for sore muscles and headaches.",
    usageTips: [
      "Inhale directly from the bottle for an instant energy boost",
      "Dilute and massage into sore muscles after a workout",
      "Add a drop to your morning water for digestive support",
    ],
    gradient: "from-emerald-400 to-green-600",
    icon: Wind,
  },
  teaTree: {
    name: "Tea Tree",
    tagline: "The Purifier",
    description:
      "Tea Tree oil is nature's antiseptic. It supports immune health, clears blemishes, and purifies the air. Its sharp, medicinal scent signals deep cleansing at work.",
    usageTips: [
      "Dab diluted oil on blemishes for spot treatment",
      "Add to a spray bottle with water for a natural surface cleaner",
      "Diffuse during cold season to support respiratory health",
    ],
    gradient: "from-teal-400 to-cyan-600",
    icon: Shield,
  },
  eucalyptus: {
    name: "Eucalyptus",
    tagline: "The Breath of Clarity",
    description:
      "Eucalyptus opens the airways and sharpens mental clarity. It is the go-to oil for congestion, sinus pressure, and creating a spa-like atmosphere in your home.",
    usageTips: [
      "Add drops to a steaming bowl of water and inhale for sinus relief",
      "Hang a bundle of eucalyptus in your shower for aromatherapy",
      "Diffuse while studying or working to improve concentration",
    ],
    gradient: "from-sky-400 to-blue-600",
    icon: Wind,
  },
  frankincense: {
    name: "Frankincense",
    tagline: "The Sacred Resin",
    description:
      "Frankincense has been used in spiritual ceremonies for thousands of years. It deepens meditation, promotes cellular renewal, and carries a warm, resinous scent that grounds the spirit.",
    usageTips: [
      "Apply to the crown of your head before meditation",
      "Mix with a carrier oil for an anti-aging facial serum",
      "Diffuse during prayer or journaling for spiritual connection",
    ],
    gradient: "from-amber-400 to-orange-600",
    icon: Sparkles,
  },
  rosemary: {
    name: "Rosemary",
    tagline: "The Mind Sharpener",
    description:
      "Rosemary has long been called the herb of remembrance. Its herbaceous, stimulating aroma boosts memory retention, supports hair growth, and invigorates the senses.",
    usageTips: [
      "Diffuse while studying to enhance memory and focus",
      "Add to coconut oil and massage into your scalp for hair health",
      "Inhale before exams or important meetings",
    ],
    gradient: "from-green-400 to-emerald-600",
    icon: Leaf,
  },
  chamomile: {
    name: "Chamomile",
    tagline: "The Gentle Comforter",
    description:
      "Chamomile wraps you in warmth like a cup of tea for the soul. It calms frayed nerves, settles the stomach, and is gentle enough for even the most sensitive skin.",
    usageTips: [
      "Add to a warm compress for stomach discomfort",
      "Dilute and apply to irritated skin for soothing relief",
      "Diffuse in the evening for a peaceful wind-down ritual",
    ],
    gradient: "from-yellow-300 to-amber-500",
    icon: Sun,
  },
  ylangYlang: {
    name: "Ylang Ylang",
    tagline: "The Heart Opener",
    description:
      "Ylang Ylang is rich, floral, and deeply sensual. It lifts the mood, eases tension, and encourages emotional openness. Traditionally used to set a romantic atmosphere.",
    usageTips: [
      "Add to an unscented lotion for a natural perfume",
      "Diffuse to create a calming, romantic ambiance",
      "Blend with lavender for a powerful stress-relief combination",
    ],
    gradient: "from-pink-400 to-rose-600",
    icon: Heart,
  },
  lemon: {
    name: "Lemon",
    tagline: "Liquid Sunshine",
    description:
      "Lemon is bright, uplifting, and cleansing. It cuts through mental fog, purifies the air, and brings an instant sense of freshness to any space.",
    usageTips: [
      "Diffuse in the morning for an energizing start to your day",
      "Add to DIY cleaning sprays for a natural disinfectant",
      "Mix with peppermint for a focus-boosting blend",
    ],
    gradient: "from-yellow-400 to-amber-500",
    icon: Sun,
  },
  sandalwood: {
    name: "Sandalwood",
    tagline: "The Grounding Root",
    description:
      "Sandalwood carries a rich, woody warmth that anchors scattered energy. It is a meditation staple, skin-nourishing, and one of the most prized scents in traditional wellness.",
    usageTips: [
      "Apply to pulse points before meditation or breathwork",
      "Add to a facial oil for hydrated, glowing skin",
      "Diffuse during yoga for a grounding atmosphere",
    ],
    gradient: "from-orange-400 to-red-700",
    icon: Flame,
  },
  rose: {
    name: "Rose",
    tagline: "The Healer of Hearts",
    description:
      "Rose oil is extraordinarily precious, requiring thousands of petals for a single drop. It is unmatched for processing grief, cultivating self-love, and rejuvenating skin.",
    usageTips: [
      "Inhale deeply during moments of emotional heaviness",
      "Add a drop to your moisturizer for radiant skin",
      "Diffuse during self-care rituals to nurture self-compassion",
    ],
    gradient: "from-rose-400 to-pink-600",
    icon: Heart,
  },
  bergamot: {
    name: "Bergamot",
    tagline: "The Mood Alchemist",
    description:
      "Bergamot is citrus with depth. It lifts anxiety, fosters self-acceptance, and brings a sophisticated warmth that blends beautifully with almost any other oil.",
    usageTips: [
      "Diffuse when feeling anxious or emotionally heavy",
      "Add to a carrier oil for a calming chest rub",
      "Blend with lavender for a soothing nighttime diffuser mix",
    ],
    gradient: "from-lime-400 to-green-600",
    icon: Droplets,
  },
};

const ALL_OIL_KEYS: OilKey[] = Object.keys(OIL_PROFILES) as OilKey[];

function emptyAffinities(): Record<OilKey, number> {
  return Object.fromEntries(ALL_OIL_KEYS.map((k) => [k, 0])) as Record<OilKey, number>;
}

function a(overrides: Partial<Record<OilKey, number>>): Record<OilKey, number> {
  return { ...emptyAffinities(), ...overrides };
}

// ---------------------------------------------------------------------------
// Questions & affinity mappings
// ---------------------------------------------------------------------------

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What best describes your current mood?",
    options: [
      { label: "Anxious", affinities: a({ lavender: 4, bergamot: 4, chamomile: 3, ylangYlang: 2 }) },
      { label: "Tired", affinities: a({ peppermint: 4, lemon: 4, rosemary: 3, eucalyptus: 2 }) },
      { label: "Restless", affinities: a({ sandalwood: 4, frankincense: 3, lavender: 2, chamomile: 2 }) },
      { label: "Content but seeking more", affinities: a({ frankincense: 4, sandalwood: 3, rose: 3, bergamot: 2 }) },
      { label: "Overwhelmed", affinities: a({ bergamot: 4, lavender: 3, chamomile: 3, ylangYlang: 2, rose: 2 }) },
    ],
  },
  {
    id: 2,
    question: "Which element calls to you today?",
    options: [
      { label: "Fire", affinities: a({ peppermint: 3, rosemary: 3, lemon: 2, frankincense: 2 }) },
      { label: "Water", affinities: a({ chamomile: 3, ylangYlang: 3, rose: 3, lavender: 2 }) },
      { label: "Earth", affinities: a({ sandalwood: 4, frankincense: 3, teaTree: 2, rosemary: 2 }) },
      { label: "Air", affinities: a({ eucalyptus: 4, peppermint: 3, lemon: 3 }) },
      { label: "Spirit", affinities: a({ frankincense: 4, sandalwood: 3, rose: 3, lavender: 2 }) },
    ],
  },
  {
    id: 3,
    question: "Pick a time of day that feels most like you:",
    options: [
      { label: "Dawn", affinities: a({ lemon: 4, rosemary: 3, eucalyptus: 2, peppermint: 2 }) },
      { label: "Midday", affinities: a({ peppermint: 4, lemon: 3, rosemary: 3 }) },
      { label: "Sunset", affinities: a({ ylangYlang: 3, bergamot: 3, sandalwood: 3, rose: 2 }) },
      { label: "Midnight", affinities: a({ lavender: 4, chamomile: 3, sandalwood: 2, frankincense: 2 }) },
      { label: "Golden Hour", affinities: a({ bergamot: 3, rose: 3, ylangYlang: 3, frankincense: 2 }) },
    ],
  },
  {
    id: 4,
    question: "What does your body need right now?",
    options: [
      { label: "Relaxation", affinities: a({ lavender: 4, chamomile: 3, bergamot: 3, ylangYlang: 2 }) },
      { label: "Energy", affinities: a({ peppermint: 4, lemon: 4, rosemary: 3, eucalyptus: 2 }) },
      { label: "Pain Relief", affinities: a({ peppermint: 4, eucalyptus: 3, chamomile: 3, lavender: 2 }) },
      { label: "Better Sleep", affinities: a({ lavender: 5, chamomile: 4, sandalwood: 3, bergamot: 2 }) },
      { label: "Clearer Skin", affinities: a({ teaTree: 5, rose: 3, lavender: 3, frankincense: 3, chamomile: 2 }) },
    ],
  },
  {
    id: 5,
    question: "Which scent family appeals to you?",
    options: [
      { label: "Floral / Sweet", affinities: a({ ylangYlang: 4, rose: 4, lavender: 3, chamomile: 2 }) },
      { label: "Fresh / Citrus", affinities: a({ lemon: 4, bergamot: 4, eucalyptus: 2, peppermint: 2 }) },
      { label: "Warm / Spicy", affinities: a({ frankincense: 4, sandalwood: 3, rosemary: 2 }) },
      { label: "Cool / Minty", affinities: a({ peppermint: 5, eucalyptus: 4, teaTree: 2 }) },
      { label: "Earthy / Woody", affinities: a({ sandalwood: 5, frankincense: 4, teaTree: 2, rosemary: 2 }) },
    ],
  },
  {
    id: 6,
    question: "How do you prefer to unwind?",
    options: [
      { label: "Bath / Soak", affinities: a({ lavender: 4, chamomile: 3, ylangYlang: 3, rose: 2 }) },
      { label: "Massage", affinities: a({ peppermint: 3, eucalyptus: 3, sandalwood: 3, ylangYlang: 2 }) },
      { label: "Diffuser / Aromatherapy", affinities: a({ bergamot: 3, lemon: 3, lavender: 3, frankincense: 2 }) },
      { label: "Meditation", affinities: a({ frankincense: 5, sandalwood: 4, lavender: 2 }) },
      { label: "Nature Walk", affinities: a({ eucalyptus: 3, rosemary: 3, lemon: 3, teaTree: 2 }) },
    ],
  },
  {
    id: 7,
    question: "What are you working through emotionally?",
    options: [
      { label: "Grief / Loss", affinities: a({ rose: 5, frankincense: 3, bergamot: 3, sandalwood: 2 }) },
      { label: "Stress / Anxiety", affinities: a({ lavender: 4, bergamot: 4, chamomile: 3, ylangYlang: 2 }) },
      { label: "Self-Doubt", affinities: a({ bergamot: 4, rosemary: 3, frankincense: 3, sandalwood: 2 }) },
      { label: "Anger / Frustration", affinities: a({ chamomile: 4, ylangYlang: 3, lavender: 3, bergamot: 2 }) },
      { label: "Feeling Disconnected", affinities: a({ frankincense: 4, sandalwood: 4, rose: 3, ylangYlang: 2 }) },
    ],
  },
  {
    id: 8,
    question: "Pick a healing intention:",
    options: [
      { label: "Peace", affinities: a({ lavender: 4, chamomile: 4, bergamot: 3, sandalwood: 2 }) },
      { label: "Strength", affinities: a({ peppermint: 4, rosemary: 3, eucalyptus: 3, teaTree: 2 }) },
      { label: "Clarity", affinities: a({ eucalyptus: 4, rosemary: 4, peppermint: 3, lemon: 2 }) },
      { label: "Joy", affinities: a({ lemon: 4, bergamot: 4, ylangYlang: 3, rose: 2 }) },
      { label: "Protection", affinities: a({ teaTree: 4, frankincense: 3, eucalyptus: 3, sandalwood: 2 }) },
    ],
  },
  {
    id: 9,
    question: "Which season resonates with your spirit?",
    options: [
      { label: "Spring", affinities: a({ lemon: 4, rose: 3, bergamot: 3, chamomile: 2 }) },
      { label: "Summer", affinities: a({ peppermint: 3, lemon: 3, ylangYlang: 3, eucalyptus: 2 }) },
      { label: "Autumn", affinities: a({ frankincense: 4, sandalwood: 3, rosemary: 3, bergamot: 2 }) },
      { label: "Winter", affinities: a({ lavender: 3, chamomile: 3, eucalyptus: 3, teaTree: 2, frankincense: 2 }) },
    ],
  },
  {
    id: 10,
    question: "What kind of support do you want?",
    options: [
      { label: "Physical Healing", affinities: a({ peppermint: 4, eucalyptus: 4, teaTree: 3, lavender: 2 }) },
      { label: "Emotional Balance", affinities: a({ bergamot: 4, ylangYlang: 3, chamomile: 3, rose: 3 }) },
      { label: "Spiritual Growth", affinities: a({ frankincense: 5, sandalwood: 4, rose: 3 }) },
      { label: "Mental Focus", affinities: a({ rosemary: 5, peppermint: 4, lemon: 3, eucalyptus: 2 }) },
      { label: "Overall Wellness", affinities: a({ lavender: 3, teaTree: 3, lemon: 3, frankincense: 3, eucalyptus: 2 }) },
    ],
  },
];

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function computeScores(answers: number[]): { key: OilKey; score: number }[] {
  const totals = emptyAffinities();
  let maxPossible = 0;

  answers.forEach((choiceIdx, qIdx) => {
    const q = QUESTIONS[qIdx];
    if (choiceIdx < 0 || choiceIdx >= q.options.length) return;
    const chosen = q.options[choiceIdx].affinities;

    let qMax = 0;
    q.options.forEach((opt) => {
      ALL_OIL_KEYS.forEach((k) => {
        if (opt.affinities[k] > qMax) qMax = opt.affinities[k];
      });
    });
    maxPossible += qMax;

    ALL_OIL_KEYS.forEach((k) => {
      totals[k] += chosen[k];
    });
  });

  const maxOilTotal = Math.max(...ALL_OIL_KEYS.map((k) => totals[k]), 1);

  return ALL_OIL_KEYS.map((k) => ({
    key: k,
    score: Math.round((totals[k] / maxOilTotal) * 100),
  })).sort((x, y) => y.score - x.score);
}

function generateBlendName(topOils: OilKey[]): string {
  const prefixes: Record<string, string[]> = {
    lavender: ["Twilight", "Serene"],
    peppermint: ["Frost", "Vivid"],
    teaTree: ["Pure", "Shield"],
    eucalyptus: ["Breeze", "Clarity"],
    frankincense: ["Sacred", "Ancient"],
    rosemary: ["Sage", "Lucid"],
    chamomile: ["Golden", "Gentle"],
    ylangYlang: ["Bloom", "Velvet"],
    lemon: ["Solar", "Bright"],
    sandalwood: ["Root", "Ember"],
    rose: ["Petal", "Grace"],
    bergamot: ["Citrine", "Haven"],
  };

  const suffixes = ["Accord", "Ritual", "Elixir", "Blend", "Essence", "Tonic"];

  const first = prefixes[topOils[0]]?.[0] ?? "Custom";
  const second = prefixes[topOils[1]]?.[1] ?? "Harmony";
  const suffix = suffixes[topOils.length % suffixes.length];

  return `${first} ${second} ${suffix}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OilQuiz() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);

  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  const selectAnswer = useCallback(
    (optionIdx: number) => {
      const updated = [...answers];
      updated[currentQ] = optionIdx;
      setAnswers(updated);

      setTimeout(() => {
        if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(currentQ + 1);
        } else {
          setShowResults(true);
        }
      }, 350);
    },
    [answers, currentQ],
  );

  const results = useMemo(() => {
    if (!showResults || answers.length < QUESTIONS.length) return null;
    const scored = computeScores(answers);
    const topOils = scored.slice(0, 4).filter((s) => s.score > 0);
    const blendName = generateBlendName(topOils.map((o) => o.key));
    return { topOils, blendName };
  }, [showResults, answers]);

  const reset = () => {
    setAnswers([]);
    setCurrentQ(0);
    setShowResults(false);
    setCopied(false);
  };

  const shareResults = async () => {
    if (!results) return;
    const lines = [
      "My Essential Oil Blend from Borrowed Curiosity",
      "",
      `Blend: ${results.blendName}`,
      "",
      "Top Oils:",
      ...results.topOils.map(
        (o) => `  ${OIL_PROFILES[o.key].name} (${o.score}%) - ${OIL_PROFILES[o.key].tagline}`,
      ),
      "",
      "Take the quiz: " + window.location.href,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard blocked
    }
  };

  const question = QUESTIONS[currentQ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="section-padding min-h-[35vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-400 mb-6">
              <FlaskConical className="w-3.5 h-3.5" /> Essential Oil Quiz
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5">
              Find Your <span className="text-gradient">Essential Blend</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Answer ten questions about your mood, body, and spirit. We will match
              you with the essential oils that align with exactly what you need right now.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          {/* ---- QUIZ FLOW ---- */}
          {!showResults ? (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Question {currentQ + 1} of {QUESTIONS.length}
                </p>
                <p className="text-sm text-brand-400 font-medium">
                  {Math.round(progress)}%
                </p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 dark:bg-white/5 bg-gray-200 mb-8 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>

              {/* Question card */}
              <div className="glass rounded-2xl p-6 sm:p-8 mb-6">
                <p className="font-display text-lg sm:text-xl font-semibold leading-relaxed">
                  {question.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {question.options.map((opt, idx) => {
                  const isSelected = answers[currentQ] === idx;
                  return (
                    <motion.button
                      key={idx}
                      onClick={() => selectAnswer(idx)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full rounded-xl p-4 text-left text-sm transition-all flex items-center gap-3 ${
                        isSelected
                          ? "bg-brand-500/15 ring-2 ring-brand-500/50"
                          : "glass hover:bg-brand-500/10"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isSelected
                            ? "bg-brand-500 text-white"
                            : "glass"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{opt.label}</span>
                      {isSelected && (
                        <ChevronRight className="w-4 h-4 text-brand-400" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Back button */}
              {currentQ > 0 && (
                <button
                  onClick={() => setCurrentQ(currentQ - 1)}
                  className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Back to previous question
                </button>
              )}
            </motion.div>
          ) : results ? (
            /* ---- RESULTS ---- */
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Blend heading */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-6"
                >
                  <Droplets className="w-10 h-10 text-brand-400" />
                </motion.div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
                  Your <span className="text-gradient">Essential Blend</span>
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                  Crafted from your unique answers
                </p>
                <p className="font-display text-xl text-brand-400 font-semibold">
                  {results.blendName}
                </p>
              </div>

              {/* Oil cards */}
              <div className="space-y-4 mb-10">
                {results.topOils.map((oil, idx) => {
                  const profile = OIL_PROFILES[oil.key];
                  const Icon = profile.icon;
                  return (
                    <motion.div
                      key={oil.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 * idx }}
                      className="glass-card rounded-2xl p-6 relative overflow-hidden"
                    >
                      <div
                        className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${profile.gradient}`}
                      />
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-display text-lg font-semibold">
                              {profile.name}
                            </h3>
                            <span className="text-sm font-bold text-brand-400">
                              {oil.score}%
                            </span>
                          </div>
                          <p className="text-xs text-brand-400/80 mb-2">
                            {profile.tagline}
                          </p>

                          {/* Score bar */}
                          <div className="w-full h-1.5 rounded-full bg-white/5 dark:bg-white/5 bg-gray-200 mb-3 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full bg-gradient-to-r ${profile.gradient}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${oil.score}%` }}
                              transition={{ duration: 0.8, delay: 0.2 * idx }}
                            />
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                            {profile.description}
                          </p>

                          <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              How to Use
                            </p>
                            {profile.usageTips.map((tip, tIdx) => (
                              <p
                                key={tIdx}
                                className="text-xs text-gray-500 dark:text-gray-400 pl-3 border-l border-brand-500/30"
                              >
                                {tip}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Usage instructions */}
              <div className="glass rounded-2xl p-6 mb-8">
                <h3 className="font-display text-lg font-semibold mb-4">
                  Ways to Use Your Blend
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <UsageCard
                    icon={Wind}
                    title="Diffuser"
                    description="Add 3-5 drops of each recommended oil to your diffuser. Run for 30-60 minutes in a well-ventilated room."
                  />
                  <UsageCard
                    icon={Droplets}
                    title="Topical"
                    description="Dilute 2-3 drops in a teaspoon of carrier oil (jojoba, coconut). Apply to wrists, temples, or the soles of your feet."
                  />
                  <UsageCard
                    icon={Flame}
                    title="Bath Ritual"
                    description="Mix 5-8 drops total with Epsom salts before adding to warm bathwater. Soak for at least 20 minutes."
                  />
                </div>
              </div>

              {/* Safety note */}
              <div className="glass rounded-xl p-4 mb-8 border border-amber-500/20">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  <strong className="text-amber-400">Note:</strong> Essential oils
                  are potent. Always dilute before applying to skin. Avoid contact
                  with eyes. If pregnant, nursing, or on medication, consult a
                  healthcare provider before use. Some citrus oils increase sun
                  sensitivity.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                <button
                  onClick={reset}
                  className="btn-outline flex items-center gap-2 px-5 py-2.5"
                >
                  <RotateCcw className="w-4 h-4" /> Retake Quiz
                </button>
                <button
                  onClick={shareResults}
                  className="btn-outline flex items-center gap-2 px-5 py-2.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Share Results
                    </>
                  )}
                </button>
                <Link href="/store">
                  <span className="btn-primary flex items-center gap-2 px-5 py-2.5 cursor-pointer">
                    <ShoppingBag className="w-4 h-4" /> Browse Our Store
                  </span>
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function UsageCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Wind;
  title: string;
  description: string;
}) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-brand-400" />
      </div>
      <h4 className="font-display text-sm font-semibold mb-1.5">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
