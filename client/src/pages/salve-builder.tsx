import { useState } from "react";
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
} from "lucide-react";
import { Link } from "wouter";

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

export default function SalveBuilder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SalveResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const isComplete = Object.keys(answers).length === TOTAL_STEPS;

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
      setResult(data);
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
            A personalized wellness assessment to discover the essential oils, crystals,
            and frequencies aligned with your body and spirit
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Assessment Phase */}
          {!result && !loading && !error && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Progress Bar */}
              <div className="mb-10">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Step {step + 1} of {TOTAL_STEPS}</span>
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

              {/* Question Card */}
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
                      const isSelected = answers[currentQuestion.id] === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => selectAnswer(option.value)}
                          className={`
                            relative p-4 rounded-xl border text-left transition-all duration-200
                            flex items-center gap-3
                            ${
                              isSelected
                                ? "border-emerald-500/60 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10"
                                : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10"
                            }
                          `}
                        >
                          {option.icon && <span className="shrink-0">{option.icon}</span>}
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

              {/* Navigation */}
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

          {/* Loading */}
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

          {/* Error */}
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

          {/* Results */}
          {result && !loading && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Summary */}
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

              {/* Essential Oils */}
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
                      <h4 className="font-display text-amber-300 mb-2">{oil.name}</h4>
                      <ul className="space-y-1">
                        {oil.benefits.map((b) => (
                          <li key={b} className="text-sm text-gray-400 flex items-start gap-2">
                            <Leaf className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Matched Crystals */}
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
                      <h4 className="font-display text-violet-300 mb-2">{crystal.name}</h4>
                      <ul className="space-y-1">
                        {crystal.benefits.map((b) => (
                          <li key={b} className="text-sm text-gray-400">{b}</li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Personal Frequency */}
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

              {/* Custom Salve Recipe */}
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

              {/* Shop Connection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="glass p-8 rounded-2xl text-center"
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

              {/* Retake */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center pt-4"
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
      </div>
    </div>
  );
}
