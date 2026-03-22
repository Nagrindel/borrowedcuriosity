import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Sparkles,
  Gem,
  Music,
  Sun,
  Moon,
  Heart,
  Shield,
  Loader2,
  RotateCcw,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Droplets,
  Flame,
  Eye,
  Zap,
  Star,
  Clock,
  Target,
  Check,
  Package,
  Hexagon,
} from "lucide-react";
import { Link } from "wouter";
import { useCart } from "../context/cart";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface QuestionStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  options: { label: string; value: string; icon?: React.ReactNode }[];
}

interface OilRecommendation {
  name: string;
  benefits: string[];
}
interface CrystalRecommendation {
  name: string;
  benefits: string[];
}
interface SalveResult {
  oils: OilRecommendation[];
  crystals: CrystalRecommendation[];
  frequency: { hz: string; name: string; description: string };
  recipe: { name: string; ingredients: string[]; instructions: string[] };
  summary: string;
}

/* ------------------------------------------------------------------ */
/*  MyrrhMatcher Data                                                  */
/* ------------------------------------------------------------------ */

const ESSENTIAL_OILS = [
  { name: "Myrrh", desc: "Sacred, grounding, spiritual connection", benefits: ["grounding", "spiritual connection", "meditation", "skin healing"] },
  { name: "Lavender", desc: "Calming and peace", benefits: ["calming", "relaxation", "sleep", "stress relief"] },
  { name: "Frankincense", desc: "Spiritual elevation", benefits: ["spiritual growth", "meditation", "protection", "anti-aging"] },
  { name: "Tea Tree", desc: "Purification and healing", benefits: ["purification", "healing", "antiseptic", "acne treatment"] },
  { name: "Eucalyptus", desc: "Clarity and vitality", benefits: ["clarity", "energy", "respiratory", "mental focus"] },
  { name: "Rose", desc: "Love and emotional healing", benefits: ["love", "emotional healing", "self-compassion", "anti-aging"] },
  { name: "Sandalwood", desc: "Meditation and grounding", benefits: ["meditation", "grounding", "peace", "skin care"] },
  { name: "Peppermint", desc: "Energy and focus", benefits: ["energy", "focus", "cooling", "digestive aid"] },
];

const CRYSTALS_DB = [
  { name: "Amethyst", desc: "Spiritual protection and clarity", properties: ["spiritual protection", "clarity", "intuition", "peace"], chakra: "Crown" },
  { name: "Green Aventurine", desc: "Heart healing and emotional balance", properties: ["heart healing", "emotional balance", "luck", "calm"], chakra: "Heart" },
  { name: "Citrine", desc: "Manifestation and abundance", properties: ["manifestation", "abundance", "joy", "confidence"], chakra: "Solar Plexus" },
  { name: "Rose Quartz", desc: "Love and compassion", properties: ["love", "compassion", "self-care", "emotional healing"], chakra: "Heart" },
  { name: "Clear Quartz", desc: "Amplification and clarity", properties: ["amplification", "clarity", "healing", "energy"], chakra: "Crown" },
  { name: "Black Tourmaline", desc: "Protection and grounding", properties: ["protection", "grounding", "negativity clearing", "stability"], chakra: "Root" },
];

const GRID_PURPOSES = [
  { id: "healing", label: "Healing", desc: "Restore balance and promote physical wellness", keywords: ["healing", "energy", "calm"] },
  { id: "protection", label: "Protection", desc: "Create a shield of spiritual safety", keywords: ["protection", "grounding", "stability"] },
  { id: "manifestation", label: "Manifestation", desc: "Amplify your intentions and attract abundance", keywords: ["manifestation", "abundance", "clarity"] },
  { id: "love", label: "Love", desc: "Open the heart chakra and invite connection", keywords: ["love", "compassion", "emotional healing"] },
  { id: "clarity", label: "Clarity", desc: "Clear mental fog and enhance intuition", keywords: ["clarity", "intuition", "peace"] },
  { id: "transformation", label: "Transformation", desc: "Release old patterns and embrace change", keywords: ["spiritual protection", "amplification", "grounding"] },
];

const CONTAINERS = [
  { id: "glass", label: "2oz Glass Jar", price: 24, desc: "Handcrafted amber glass for daily use" },
  { id: "deodorant", label: "Deodorant Tube", price: 26, desc: "Roll-on style for easy application" },
  { id: "chapstick", label: "Chapstick Tube", price: 18, desc: "Compact and portable" },
];

const ADD_ONS = [
  { id: "vitamin_e", label: "Vitamin E Oil", price: 3, desc: "Skin nourishment and preservation" },
  { id: "castor", label: "Castor Oil", price: 2, desc: "Deep absorption and hair/skin health" },
];

/* ------------------------------------------------------------------ */
/*  Assessment Questions                                               */
/* ------------------------------------------------------------------ */

const QUESTIONS: QuestionStep[] = [
  {
    id: "energy",
    title: "Current Energy Level",
    subtitle: "How does your energy feel right now?",
    icon: <Zap className="w-6 h-6" />,
    options: [
      { label: "Low", value: "low", icon: <Moon className="w-5 h-5" /> },
      { label: "Moderate", value: "moderate", icon: <Sun className="w-5 h-5" /> },
      { label: "High", value: "high", icon: <Flame className="w-5 h-5" /> },
      { label: "Scattered", value: "scattered", icon: <Sparkles className="w-5 h-5" /> },
    ],
  },
  {
    id: "concern",
    title: "Primary Concern",
    subtitle: "What area would you like to focus on?",
    icon: <Target className="w-6 h-6" />,
    options: [
      { label: "Stress", value: "stress" },
      { label: "Pain", value: "pain" },
      { label: "Sleep", value: "sleep" },
      { label: "Focus", value: "focus" },
      { label: "Emotional Balance", value: "emotional_balance" },
      { label: "Skin Health", value: "skin_health" },
      { label: "Immunity", value: "immunity" },
      { label: "Spiritual Connection", value: "spiritual_connection" },
    ],
  },
  {
    id: "tension",
    title: "Physical Areas of Tension",
    subtitle: "Where do you carry the most tension?",
    icon: <Heart className="w-6 h-6" />,
    options: [
      { label: "Head", value: "head" },
      { label: "Neck / Shoulders", value: "neck_shoulders" },
      { label: "Back", value: "back" },
      { label: "Joints", value: "joints" },
      { label: "Stomach", value: "stomach" },
      { label: "Full Body", value: "full_body" },
    ],
  },
  {
    id: "scent",
    title: "Preferred Scents",
    subtitle: "Which scent family calls to you?",
    icon: <Droplets className="w-6 h-6" />,
    options: [
      { label: "Floral", value: "floral" },
      { label: "Earthy", value: "earthy" },
      { label: "Citrus", value: "citrus" },
      { label: "Herbal", value: "herbal" },
      { label: "Woody", value: "woody" },
      { label: "Minty", value: "minty" },
    ],
  },
  {
    id: "crystal",
    title: "Crystal Affinity",
    subtitle: "Which crystal resonates with you?",
    icon: <Gem className="w-6 h-6" />,
    options: [
      { label: "Amethyst", value: "amethyst", icon: <Gem className="w-5 h-5 text-purple-400" /> },
      { label: "Rose Quartz", value: "rose_quartz", icon: <Gem className="w-5 h-5 text-pink-400" /> },
      { label: "Clear Quartz", value: "clear_quartz", icon: <Gem className="w-5 h-5 text-gray-300" /> },
      { label: "Black Tourmaline", value: "black_tourmaline", icon: <Gem className="w-5 h-5 text-gray-500" /> },
      { label: "Citrine", value: "citrine", icon: <Gem className="w-5 h-5 text-yellow-400" /> },
      { label: "Labradorite", value: "labradorite", icon: <Gem className="w-5 h-5 text-cyan-400" /> },
    ],
  },
  {
    id: "frequency",
    title: "Healing Frequency",
    subtitle: "Which frequency do you feel drawn toward?",
    icon: <Music className="w-6 h-6" />,
    options: [
      { label: "174Hz Foundation", value: "174" },
      { label: "528Hz Miracles", value: "528" },
      { label: "639Hz Connection", value: "639" },
      { label: "741Hz Awakening", value: "741" },
      { label: "852Hz Intuition", value: "852" },
    ],
  },
  {
    id: "time",
    title: "Self-Care Timing",
    subtitle: "When do you prefer your self-care rituals?",
    icon: <Clock className="w-6 h-6" />,
    options: [
      { label: "Morning", value: "morning", icon: <Sun className="w-5 h-5 text-amber-400" /> },
      { label: "Afternoon", value: "afternoon", icon: <Sun className="w-5 h-5 text-orange-400" /> },
      { label: "Evening", value: "evening", icon: <Moon className="w-5 h-5 text-indigo-400" /> },
      { label: "Before Sleep", value: "before_sleep", icon: <Moon className="w-5 h-5 text-violet-400" /> },
    ],
  },
  {
    id: "intention",
    title: "Your Intention",
    subtitle: "What do you want to invite into your life?",
    icon: <Star className="w-6 h-6" />,
    options: [
      { label: "Healing", value: "healing", icon: <Heart className="w-5 h-5 text-green-400" /> },
      { label: "Protection", value: "protection", icon: <Shield className="w-5 h-5 text-blue-400" /> },
      { label: "Clarity", value: "clarity", icon: <Eye className="w-5 h-5 text-cyan-400" /> },
      { label: "Love", value: "love", icon: <Heart className="w-5 h-5 text-pink-400" /> },
      { label: "Abundance", value: "abundance", icon: <Sparkles className="w-5 h-5 text-yellow-400" /> },
      { label: "Transformation", value: "transformation", icon: <Flame className="w-5 h-5 text-orange-400" /> },
    ],
  },
];

const TOTAL_STEPS = QUESTIONS.length;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SalveBuilder() {
  const { addItem } = useCart();

  /* Assessment state */
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SalveResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* Physical builder state */
  const [secondOil, setSecondOil] = useState("");
  const [thirdOil, setThirdOil] = useState("");
  const [container, setContainer] = useState("glass");
  const [addOns, setAddOns] = useState<Record<string, boolean>>({});
  const [salveAdded, setSalveAdded] = useState(false);

  /* Crystal grid state */
  const [gridPurpose, setGridPurpose] = useState("");

  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const isComplete = Object.keys(answers).length === TOTAL_STEPS;

  /* Pricing */
  const selectedContainer = CONTAINERS.find((c) => c.id === container)!;
  const addOnTotal = ADD_ONS.reduce(
    (sum, a) => sum + (addOns[a.id] ? a.price : 0),
    0,
  );
  const salveTotal = selectedContainer.price + addOnTotal;

  /* Crystal grid logic */
  const gridCrystals = useMemo(() => {
    if (!gridPurpose) return [];
    const purpose = GRID_PURPOSES.find((p) => p.id === gridPurpose);
    if (!purpose) return [];
    return CRYSTALS_DB.filter((c) =>
      c.properties.some((prop) =>
        purpose.keywords.some((kw) => prop.toLowerCase().includes(kw)),
      ),
    ).slice(0, 4);
  }, [gridPurpose]);

  const availableOils = ESSENTIAL_OILS.filter((o) => o.name !== "Myrrh");

  /* Assessment handlers */
  const selectAnswer = (value: string) => {
    const updated = { ...answers, [currentQuestion.id]: value };
    setAnswers(updated);
    if (step < TOTAL_STEPS - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else if (Object.keys(updated).length === TOTAL_STEPS) {
      submitAssessment(updated);
    }
  };

  const submitAssessment = async (finalAnswers: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/salve/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const text = await res.text();
      let data: SalveResult;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response. Please try again.");
      }
      if (!res.ok) throw new Error((data as any).error || "Request failed");

      const raw = data as any;
      const toArr = (v: unknown): string[] => {
        if (Array.isArray(v)) return v;
        if (typeof v === "string") return v.split(/[.!]\s+/).filter(Boolean);
        return [];
      };
      const normalized: SalveResult = {
        oils: (raw.oils || []).map((o: any) => ({
          name: o.name || "Essential Oil",
          benefits: toArr(o.benefits || o.benefit),
        })),
        crystals: (raw.crystals || []).map((c: any) => ({
          name: c.name || "Crystal",
          benefits: toArr(c.benefits || c.benefit),
        })),
        frequency: {
          hz: String(raw.frequency?.hz ?? "528"),
          name: raw.frequency?.name || "Healing Frequency",
          description: raw.frequency?.description || raw.frequency?.benefit || "",
        },
        recipe: {
          name: (raw.recipe || raw.salveRecipe)?.name || "Custom Salve",
          ingredients: toArr((raw.recipe || raw.salveRecipe)?.ingredients),
          instructions: toArr((raw.recipe || raw.salveRecipe)?.instructions),
        },
        summary: raw.summary || "",
      };
      setResult(normalized);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    setError(null);
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  /* Physical builder handler */
  const handleAddToCart = () => {
    if (!secondOil || !thirdOil) return;
    const oils = `Myrrh + ${secondOil} + ${thirdOil}`;
    const addOnNames = ADD_ONS.filter((a) => addOns[a.id]).map((a) => a.label);
    const desc = [oils, selectedContainer.label, ...addOnNames].join(" | ");
    addItem({
      id: Date.now(),
      name: `Custom Sacred Salve (${desc})`,
      price: salveTotal,
      productType: "physical",
    });
    setSalveAdded(true);
    setTimeout(() => setSalveAdded(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <Leaf className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-gradient mb-3">
            Salve Builder
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Take the wellness assessment for personalized recommendations, then
            craft your own sacred salve with real ingredients
          </p>
        </motion.div>

        {/* ============ SECTION 1: Wellness Assessment ============ */}
        <AnimatePresence mode="wait">
          {/* Assessment Phase */}
          {!result && !loading && !error && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-10">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>
                    Step {step + 1} of {TOTAL_STEPS}
                  </span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card p-8 md:p-10 rounded-2xl mb-8"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-emerald-400">{currentQuestion.icon}</div>
                    <h2 className="text-2xl font-display text-white">
                      {currentQuestion.title}
                    </h2>
                  </div>
                  <p className="text-gray-400 mb-8">{currentQuestion.subtitle}</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected =
                        answers[currentQuestion.id] === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => selectAnswer(option.value)}
                          className={`relative p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-3 ${
                            isSelected
                              ? "border-emerald-500/60 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10"
                              : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10"
                          }`}
                        >
                          {option.icon && (
                            <span className="shrink-0">{option.icon}</span>
                          )}
                          <span className="font-medium text-sm md:text-base">
                            {option.label}
                          </span>
                          {isSelected && (
                            <motion.div
                              layoutId="check"
                              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400"
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between items-center">
                <button
                  onClick={goBack}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                {answers[currentQuestion?.id] && step < TOTAL_STEPS - 1 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setStep(step + 1)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-medium transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-12 rounded-2xl text-center"
            >
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-display text-white mb-2">
                Crafting Your Personalized Salve
              </h3>
              <p className="text-gray-400">
                Analyzing your wellness profile and matching ingredients...
              </p>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8 rounded-2xl text-center"
            >
              <p className="text-red-400 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setError(null);
                    if (isComplete) submitAssessment(answers);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-medium transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={retake}
                  className="px-5 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-gray-300 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </motion.div>
          )}

          {/* Assessment Results */}
          {result && !loading && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 rounded-2xl border border-emerald-500/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-2xl font-display text-gradient">
                    Your Wellness Profile
                  </h2>
                </div>
                <p className="text-gray-300 leading-relaxed">{result.summary}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Droplets className="w-6 h-6 text-amber-400" />
                  <h3 className="text-xl font-display text-white">
                    Recommended Essential Oils
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {result.oils.map((oil, i) => (
                    <motion.div
                      key={oil.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <h4 className="font-display text-amber-300 mb-2">
                        {oil.name}
                      </h4>
                      <ul className="space-y-1">
                        {oil.benefits.map((b) => (
                          <li
                            key={b}
                            className="text-sm text-gray-400 flex items-start gap-2"
                          >
                            <Leaf className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-8 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Gem className="w-6 h-6 text-violet-400" />
                  <h3 className="text-xl font-display text-white">
                    Matched Crystals
                  </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {result.crystals.map((crystal, i) => (
                    <motion.div
                      key={crystal.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                      <Gem className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                      <h4 className="font-display text-violet-300 mb-2">
                        {crystal.name}
                      </h4>
                      <ul className="space-y-1">
                        {crystal.benefits.map((b) => (
                          <li key={b} className="text-sm text-gray-400">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card p-8 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Music className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl font-display text-white">
                    Your Frequency
                  </h3>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <span className="text-2xl font-display text-cyan-300">
                        {result.frequency.hz}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-display text-cyan-300 text-lg mb-1">
                      {result.frequency.name}
                    </h4>
                    <p className="text-gray-400 leading-relaxed">
                      {result.frequency.description}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-card p-8 rounded-2xl border border-emerald-500/10"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Leaf className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-xl font-display text-white">
                    Custom Salve Recipe
                  </h3>
                </div>
                <h4 className="text-lg font-display text-emerald-300 mb-4">
                  {result.recipe.name}
                </h4>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h5 className="text-sm uppercase tracking-wider text-gray-500 mb-3">
                      Ingredients
                    </h5>
                    <ul className="space-y-2">
                      {result.recipe.ingredients.map((ing) => (
                        <li
                          key={ing}
                          className="flex items-start gap-2 text-gray-300 text-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm uppercase tracking-wider text-gray-500 mb-3">
                      Instructions
                    </h5>
                    <ol className="space-y-3">
                      {result.recipe.instructions.map((inst, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-gray-300 text-sm"
                        >
                          <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs text-emerald-400 font-medium">
                            {i + 1}
                          </span>
                          {inst}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center pt-2"
              >
                <button
                  onClick={retake}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake Assessment
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============ SECTION 2: Build Your Salve ============ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-16"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm mb-4">
              <Package className="w-4 h-4" />
              Order a Custom Salve
            </div>
            <h2 className="text-3xl md:text-4xl font-display text-gradient mb-3">
              Build Your Sacred Salve
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Myrrh is always the foundation. Choose two more oils, pick your
              container, and add optional ingredients.
            </p>
          </div>

          <div className="space-y-6">
            {/* Base Oil */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-display text-white mb-1">
                Base Oil: Myrrh
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Sacred, grounding, spiritual connection. Always included in every
                salve.
              </p>
              <div className="flex flex-wrap gap-2">
                {ESSENTIAL_OILS[0].benefits.map((b) => (
                  <span
                    key={b}
                    className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Oil Selectors */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl">
                <label className="text-sm text-gray-400 mb-3 block">
                  Second Oil
                </label>
                <select
                  value={secondOil}
                  onChange={(e) => setSecondOil(e.target.value)}
                  title="Select second oil"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  <option value="" className="bg-gray-900">
                    Choose an oil...
                  </option>
                  {availableOils.map((oil) => (
                    <option
                      key={oil.name}
                      value={oil.name}
                      disabled={oil.name === thirdOil}
                      className="bg-gray-900"
                    >
                      {oil.name} - {oil.desc}
                    </option>
                  ))}
                </select>
                {secondOil && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {ESSENTIAL_OILS.find((o) => o.name === secondOil)?.benefits.map(
                      (b) => (
                        <span
                          key={b}
                          className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300"
                        >
                          {b}
                        </span>
                      ),
                    )}
                  </div>
                )}
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <label className="text-sm text-gray-400 mb-3 block">
                  Third Oil
                </label>
                <select
                  value={thirdOil}
                  onChange={(e) => setThirdOil(e.target.value)}
                  title="Select third oil"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  <option value="" className="bg-gray-900">
                    Choose an oil...
                  </option>
                  {availableOils.map((oil) => (
                    <option
                      key={oil.name}
                      value={oil.name}
                      disabled={oil.name === secondOil}
                      className="bg-gray-900"
                    >
                      {oil.name} - {oil.desc}
                    </option>
                  ))}
                </select>
                {thirdOil && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {ESSENTIAL_OILS.find((o) => o.name === thirdOil)?.benefits.map(
                      (b) => (
                        <span
                          key={b}
                          className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300"
                        >
                          {b}
                        </span>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Container Selection */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-display text-white mb-4">
                Choose Your Container
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CONTAINERS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setContainer(c.id)}
                    className={`relative p-4 rounded-xl border text-left transition-all ${
                      container === c.id
                        ? "border-amber-500/60 bg-amber-500/10 shadow-lg shadow-amber-500/5"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    {container === c.id && (
                      <div className="absolute top-3 right-3">
                        <Check className="w-4 h-4 text-amber-400" />
                      </div>
                    )}
                    <div className="text-lg font-display text-white mb-1">
                      ${c.price}
                    </div>
                    <div className="text-sm font-medium text-gray-200">
                      {c.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-display text-white mb-4">
                Optional Ingredients
              </h3>
              <div className="space-y-3">
                {ADD_ONS.map((a) => (
                  <label
                    key={a.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      addOns[a.id]
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        addOns[a.id]
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-white/30"
                      }`}
                    >
                      {addOns[a.id] && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={!!addOns[a.id]}
                      onChange={(e) =>
                        setAddOns({ ...addOns, [a.id]: e.target.checked })
                      }
                    />
                    <div className="flex-1">
                      <span className="text-white font-medium">{a.label}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        {a.desc}
                      </span>
                    </div>
                    <span className="text-emerald-400 font-medium">
                      +${a.price}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Summary & Add to Cart */}
            <div className="glass-card p-6 rounded-2xl border border-amber-500/20">
              <h3 className="text-lg font-display text-white mb-4">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>
                    {selectedContainer.label} (Myrrh
                    {secondOil ? ` + ${secondOil}` : ""}
                    {thirdOil ? ` + ${thirdOil}` : ""})
                  </span>
                  <span>${selectedContainer.price}.00</span>
                </div>
                {ADD_ONS.filter((a) => addOns[a.id]).map((a) => (
                  <div key={a.id} className="flex justify-between text-gray-400">
                    <span>{a.label}</span>
                    <span>${a.price}.00</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3 mt-3 flex justify-between text-white font-display text-lg">
                  <span>Total</span>
                  <span>${salveTotal}.00</span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!secondOil || !thirdOil}
                className={`w-full mt-6 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all ${
                  salveAdded
                    ? "bg-emerald-500 text-white"
                    : !secondOil || !thirdOil
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-500/20"
                }`}
              >
                {salveAdded ? (
                  <>
                    <Check className="w-5 h-5" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> Add Custom Salve to Cart
                    - ${salveTotal}.00
                  </>
                )}
              </button>
              {(!secondOil || !thirdOil) && (
                <p className="text-center text-xs text-gray-500 mt-2">
                  Select your second and third oils to continue
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ============ SECTION 3: Crystal Grid Builder ============ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-4">
              <Hexagon className="w-4 h-4" />
              Sacred Geometry
            </div>
            <h2 className="text-3xl md:text-4xl font-display text-gradient mb-3">
              Crystal Grid Builder
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Select an intention to see which crystals align with your purpose
              and build your sacred crystal grid
            </p>
          </div>

          {/* Purpose Selector */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {GRID_PURPOSES.map((p) => (
              <motion.button
                key={p.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setGridPurpose(p.id === gridPurpose ? "" : p.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  gridPurpose === p.id
                    ? "border-violet-500/60 bg-violet-500/10 shadow-lg shadow-violet-500/5"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="font-display text-white mb-1">{p.label}</div>
                <div className="text-xs text-gray-500">{p.desc}</div>
              </motion.button>
            ))}
          </div>

          {/* Grid Results */}
          <AnimatePresence>
            {gridPurpose && gridCrystals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Visual Grid */}
                <div className="glass-card p-8 rounded-2xl">
                  <h3 className="text-lg font-display text-white mb-6 text-center">
                    Your{" "}
                    {GRID_PURPOSES.find((p) => p.id === gridPurpose)?.label} Grid
                  </h3>

                  <div className="relative w-72 h-72 mx-auto mb-8">
                    {/* Sacred geometry background lines */}
                    <svg
                      viewBox="0 0 300 300"
                      className="absolute inset-0 w-full h-full"
                    >
                      <circle
                        cx="150"
                        cy="150"
                        r="120"
                        fill="none"
                        stroke="rgba(139,92,246,0.15)"
                        strokeWidth="1"
                      />
                      <circle
                        cx="150"
                        cy="150"
                        r="80"
                        fill="none"
                        stroke="rgba(139,92,246,0.1)"
                        strokeWidth="1"
                      />
                      <circle
                        cx="150"
                        cy="150"
                        r="40"
                        fill="none"
                        stroke="rgba(139,92,246,0.08)"
                        strokeWidth="1"
                      />
                      {/* Lines from center to outer positions */}
                      {gridCrystals.map((_, i) => {
                        const angle =
                          (i * (360 / gridCrystals.length) - 90) *
                          (Math.PI / 180);
                        const x2 = 150 + 110 * Math.cos(angle);
                        const y2 = 150 + 110 * Math.sin(angle);
                        return (
                          <line
                            key={i}
                            x1="150"
                            y1="150"
                            x2={x2}
                            y2={y2}
                            stroke="rgba(139,92,246,0.12)"
                            strokeWidth="1"
                          />
                        );
                      })}
                    </svg>

                    {/* Center crystal (first) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 border-2 border-violet-400/40 flex items-center justify-center shadow-lg shadow-violet-500/30"
                      >
                        <div className="text-center">
                          <Gem className="w-6 h-6 text-white mx-auto mb-0.5" />
                          <span className="text-[10px] text-white/90 font-medium leading-none block">
                            {gridCrystals[0]?.name.split(" ")[0]}
                          </span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Surrounding crystals */}
                    {gridCrystals.slice(1).map((crystal, i) => {
                      const count = gridCrystals.length - 1;
                      const angle =
                        (i * (360 / count) - 90) * (Math.PI / 180);
                      const radius = 100;
                      const x = 144 + radius * Math.cos(angle) - 28;
                      const y = 144 + radius * Math.sin(angle) - 28;
                      return (
                        <motion.div
                          key={crystal.name}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 + i * 0.15 }}
                          className="absolute z-10"
                          style={{ left: x, top: y }}
                        >
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-400/30 flex items-center justify-center shadow-md shadow-emerald-500/20">
                            <div className="text-center">
                              <Gem className="w-4 h-4 text-white mx-auto" />
                              <span className="text-[8px] text-white/80 leading-none block mt-0.5">
                                {crystal.name.split(" ")[0]}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Crystal Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  {gridCrystals.map((crystal, i) => (
                    <motion.div
                      key={crystal.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className="glass-card p-5 rounded-xl"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            i === 0
                              ? "bg-violet-500/20 border border-violet-500/30"
                              : "bg-emerald-500/20 border border-emerald-500/30"
                          }`}
                        >
                          <Gem
                            className={`w-5 h-5 ${i === 0 ? "text-violet-400" : "text-emerald-400"}`}
                          />
                        </div>
                        <div>
                          <h4 className="font-display text-white">
                            {crystal.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {crystal.chakra} Chakra{" "}
                            {i === 0 ? "(Center)" : "(Support)"}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        {crystal.desc}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {crystal.properties.map((p) => (
                          <span
                            key={p}
                            className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!gridPurpose && (
            <div className="glass p-10 rounded-2xl text-center">
              <Hexagon className="w-10 h-10 text-violet-400/40 mx-auto mb-3" />
              <p className="text-gray-500">
                Select an intention above to generate your crystal grid
              </p>
            </div>
          )}
        </motion.div>

        {/* Shop link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 glass p-8 rounded-2xl text-center"
        >
          <ShoppingBag className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-display text-white mb-2">
            Find handcrafted salves and crystal jewelry in our store
          </h3>
          <p className="text-gray-400 mb-6">
            Explore products aligned with your wellness profile
          </p>
          <Link href="/store">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-medium transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Related Products
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
