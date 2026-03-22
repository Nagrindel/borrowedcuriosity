import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan, BookOpenText, Shapes, ChevronRight, ChevronLeft,
  Loader2, Send, Sparkles, Shield, Eye, Sword, Heart,
  Droplets, Flame, TreePine, DoorOpen, Mountain, Moon,
  KeyRound, BirdIcon, Clock, Ban, Compass, RefreshCw,
} from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

type TabId = "quiz" | "journal" | "symbol";

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Scan;
}

const TABS: Tab[] = [
  { id: "quiz", label: "Pattern Quiz", icon: Scan },
  { id: "journal", label: "Journal Analysis", icon: BookOpenText },
  { id: "symbol", label: "Symbol Decoder", icon: Shapes },
];

type Archetype = "architect" | "mystic" | "warrior" | "healer";

interface ArchetypeData {
  name: string;
  icon: typeof Shield;
  gradient: string;
  description: string;
  strengths: string[];
  shadow: string[];
  growthPath: string;
  compatible: string[];
}

const ARCHETYPES: Record<Archetype, ArchetypeData> = {
  architect: {
    name: "The Architect",
    icon: Compass,
    gradient: "from-sky-400 to-indigo-600",
    description:
      "You are a natural systems thinker who sees the world in blueprints and possibilities. Your mind instinctively organizes chaos into coherent structures, finding elegant solutions where others see only noise. You carry the rare gift of turning abstract vision into concrete reality, building frameworks that endure long after the initial spark.",
    strengths: [
      "Strategic long-term thinking",
      "Pattern recognition in complex systems",
      "Disciplined execution under pressure",
      "Ability to create order from chaos",
    ],
    shadow: [
      "Rigidity when plans are disrupted",
      "Need for control that suffocates spontaneity",
      "Difficulty trusting processes you did not design",
    ],
    growthPath:
      "Your growth lies in learning to release your grip on outcomes. Practice allowing structures to evolve organically. The most resilient systems are those that adapt, not those that resist all change.",
    compatible: ["The Mystic", "The Healer"],
  },
  mystic: {
    name: "The Mystic",
    icon: Eye,
    gradient: "from-violet-400 to-purple-700",
    description:
      "You navigate the world through feeling, intuition, and symbolic understanding. Where others rely on data, you sense the undercurrents that shape events before they surface. Your depth of perception allows you to hold paradox without needing resolution, sitting comfortably in the space between knowing and mystery.",
    strengths: [
      "Deep intuitive intelligence",
      "Comfort with ambiguity and the unknown",
      "Ability to read emotional subtext",
      "Natural connection to symbolic and archetypal thinking",
    ],
    shadow: [
      "Escapism into inner worlds when reality feels harsh",
      "Overwhelm from absorbing too much emotional input",
      "Difficulty translating insight into practical action",
    ],
    growthPath:
      "Your growth lies in grounding your visions into tangible form. Build a bridge between the imaginal realm and the physical world. Your insights gain power only when they are shared and applied.",
    compatible: ["The Architect", "The Warrior"],
  },
  warrior: {
    name: "The Warrior",
    icon: Sword,
    gradient: "from-orange-400 to-red-600",
    description:
      "You meet life head-on with courage and directness that others admire and sometimes fear. Action is your native language; you believe that clarity comes through movement rather than deliberation. Your willingness to confront what others avoid makes you a catalyst for change in every environment you enter.",
    strengths: [
      "Decisive action in uncertain conditions",
      "Courage to speak and act on truth",
      "Resilience that recovers quickly from setbacks",
      "Natural ability to protect and champion others",
    ],
    shadow: [
      "Burnout from relentless forward momentum",
      "Aggression masked as assertiveness",
      "Impatience with slower, reflective processes",
    ],
    growthPath:
      "Your growth lies in cultivating the strength of stillness. Not every situation requires a battle. Learn to distinguish between fights worth having and conflicts that dissolve on their own when given space.",
    compatible: ["The Mystic", "The Healer"],
  },
  healer: {
    name: "The Healer",
    icon: Heart,
    gradient: "from-emerald-400 to-teal-600",
    description:
      "You carry an innate capacity to sense suffering and respond with genuine compassion. Others are drawn to your presence because you create spaces where vulnerability feels safe. Your wisdom comes not from study alone but from a willingness to sit with pain, both your own and others, without flinching or fixing.",
    strengths: [
      "Emotional intelligence and empathic precision",
      "Creating safe containers for transformation",
      "Patience that allows organic healing timelines",
      "Wisdom gained through lived experience of pain",
    ],
    shadow: [
      "Self-neglect from prioritizing everyone else",
      "Porous boundaries that drain your vitality",
      "Martyrdom patterns disguised as generosity",
    ],
    growthPath:
      "Your growth lies in directing that healing gaze inward. You cannot pour from a vessel you refuse to fill. Establishing firm boundaries is not selfish; it is the foundation that makes your gifts sustainable.",
    compatible: ["The Architect", "The Warrior"],
  },
};

interface QuizQuestion {
  question: string;
  options: { label: string; value: "A" | "B" | "C" | "D" }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "When you encounter a conflict, your first instinct is to...",
    options: [
      { label: "Analyze the situation and map out a logical resolution", value: "A" },
      { label: "Tune into the emotional undercurrents before responding", value: "B" },
      { label: "Address it directly and immediately", value: "C" },
      { label: "Hold space for everyone involved and seek common ground", value: "D" },
    ],
  },
  {
    question: "What drains your energy the fastest?",
    options: [
      { label: "Disorganization and lack of clear structure", value: "A" },
      { label: "Superficial interactions that never go deeper", value: "B" },
      { label: "Being forced to wait when action is possible", value: "C" },
      { label: "Witnessing suffering you feel powerless to ease", value: "D" },
    ],
  },
  {
    question: "Your most common relationship pattern is...",
    options: [
      { label: "Being the reliable planner everyone depends on", value: "A" },
      { label: "Connecting deeply with a few, struggling with the rest", value: "B" },
      { label: "Leading the way and attracting people who follow", value: "C" },
      { label: "Giving more than you receive until you are depleted", value: "D" },
    ],
  },
  {
    question: "How do you typically make important decisions?",
    options: [
      { label: "Research, compare options, then choose the most logical path", value: "A" },
      { label: "Wait for a feeling of inner certainty, even if it takes time", value: "B" },
      { label: "Trust your gut and commit quickly", value: "C" },
      { label: "Consider how your choice will affect everyone around you", value: "D" },
    ],
  },
  {
    question: "Your natural response to unexpected change is...",
    options: [
      { label: "Immediately creating a new plan to regain control", value: "A" },
      { label: "Retreating inward to process before re-engaging", value: "B" },
      { label: "Adapting on the fly and turning it into momentum", value: "C" },
      { label: "Checking on how others are handling it first", value: "D" },
    ],
  },
  {
    question: "The thing you avoid most consistently is...",
    options: [
      { label: "Situations where you have no plan or framework", value: "A" },
      { label: "Environments that feel emotionally shallow or cold", value: "B" },
      { label: "Vulnerability and admitting you need help", value: "C" },
      { label: "Setting firm boundaries with people you care about", value: "D" },
    ],
  },
  {
    question: "Your creative expression tends to be...",
    options: [
      { label: "Precise, architectural, and intentionally designed", value: "A" },
      { label: "Abstract, symbolic, and emotionally layered", value: "B" },
      { label: "Bold, physical, and high-energy", value: "C" },
      { label: "Gentle, nurturing, and focused on beauty that heals", value: "D" },
    ],
  },
  {
    question: "When you achieve something significant, you...",
    options: [
      { label: "Immediately begin optimizing or planning the next goal", value: "A" },
      { label: "Reflect deeply on the journey and what it revealed", value: "B" },
      { label: "Celebrate briefly, then look for the next challenge", value: "C" },
      { label: "Share the credit and uplift those who helped you", value: "D" },
    ],
  },
  {
    question: "Your relationship with money is best described as...",
    options: [
      { label: "A system to be managed with precision and foresight", value: "A" },
      { label: "Something you struggle to focus on because it feels unspiritual", value: "B" },
      { label: "A resource you earn through effort and spend with confidence", value: "C" },
      { label: "Complicated because you give freely and save reluctantly", value: "D" },
    ],
  },
  {
    question: "Your inner critic most often says...",
    options: [
      { label: "You should have planned better. This could have been prevented.", value: "A" },
      { label: "You are too much for people. Tone yourself down.", value: "B" },
      { label: "You are not doing enough. Move faster.", value: "C" },
      { label: "You are selfish for wanting something for yourself.", value: "D" },
    ],
  },
  {
    question: "A recurring theme in your dreams or daydreams is...",
    options: [
      { label: "Building something vast and intricate", value: "A" },
      { label: "Underwater worlds, hidden rooms, or secret landscapes", value: "B" },
      { label: "Running, flying, or overcoming a great obstacle", value: "C" },
      { label: "Caring for someone, tending a garden, or finding lost things", value: "D" },
    ],
  },
  {
    question: "What you need most right now is...",
    options: [
      { label: "A clear framework to channel your scattered ideas", value: "A" },
      { label: "Permission to retreat and listen to your inner voice", value: "B" },
      { label: "A worthy challenge that demands your full power", value: "C" },
      { label: "Reassurance that caring for yourself is not abandonment", value: "D" },
    ],
  },
];

interface JournalResult {
  patterns: string[];
  emotionalThemes: string[];
  insight: string;
  followUpQuestion: string;
}

interface SymbolResult {
  psychological: string;
  spiritual: string;
  personalMessage: string;
  suggestion: string;
}

const QUICK_SYMBOLS = [
  { label: "Mirror", icon: Scan },
  { label: "Water", icon: Droplets },
  { label: "Fire", icon: Flame },
  { label: "Door", icon: DoorOpen },
  { label: "Tree", icon: TreePine },
  { label: "Snake", icon: Ban },
  { label: "Mountain", icon: Mountain },
  { label: "Moon", icon: Moon },
  { label: "Key", icon: KeyRound },
  { label: "Bridge", icon: Compass },
  { label: "Bird", icon: BirdIcon },
  { label: "Clock", icon: Clock },
];

export default function Mirror() {
  const [activeTab, setActiveTab] = useState<TabId>("quiz");
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [showResult, setShowResult] = useState(false);

  const [journalText, setJournalText] = useState("");
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalResult, setJournalResult] = useState<JournalResult | null>(null);
  const [journalError, setJournalError] = useState<string | null>(null);

  const [symbolInput, setSymbolInput] = useState("");
  const [symbolLoading, setSymbolLoading] = useState(false);
  const [symbolResult, setSymbolResult] = useState<SymbolResult | null>(null);
  const [symbolError, setSymbolError] = useState<string | null>(null);

  const archetype = useMemo<Archetype>(() => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    Object.values(answers).forEach((v) => { counts[v]++; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const map: Record<string, Archetype> = { A: "architect", B: "mystic", C: "warrior", D: "healer" };
    return map[sorted[0][0]];
  }, [answers]);

  const progress = useMemo(() => {
    return Math.round((Object.keys(answers).length / QUIZ_QUESTIONS.length) * 100);
  }, [answers]);

  const handleAnswer = (value: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({ ...prev, [quizStep]: value }));
    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => setQuizStep((s) => s + 1), 300);
    }
  };

  const handleFinishQuiz = () => {
    if (Object.keys(answers).length === QUIZ_QUESTIONS.length) {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setQuizStep(0);
    setShowResult(false);
  };

  const analyzeJournal = async () => {
    if (journalText.trim().length < 50) return;
    setJournalLoading(true);
    setJournalError(null);
    setJournalResult(null);

    try {
      const res = await fetch("/api/mirror/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "journal", content: journalText }),
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response. Please try again.");
      }
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setJournalResult(data);
    } catch (err: any) {
      setJournalError(err.message);
    } finally {
      setJournalLoading(false);
    }
  };

  const analyzeSymbol = async () => {
    if (!symbolInput.trim()) return;
    setSymbolLoading(true);
    setSymbolError(null);
    setSymbolResult(null);

    try {
      const res = await fetch("/api/mirror/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "symbol", content: symbolInput }),
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response. Please try again.");
      }
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setSymbolResult(data);
    } catch (err: any) {
      setSymbolError(err.message);
    } finally {
      setSymbolLoading(false);
    }
  };

  const currentQuestion = QUIZ_QUESTIONS[quizStep];
  const result = ARCHETYPES[archetype];
  const ResultIcon = result.icon;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="section-padding min-h-[35vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-400 mb-6">
              <Scan className="w-3.5 h-3.5" /> Self-Discovery Tool
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5">
              Pattern <span className="text-gradient">Mirror</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover the hidden patterns shaping your thoughts, relationships, and choices.
              What you see in the mirror might surprise you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <motion.div {...fade} className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                    : "glass hover:bg-brand-500/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ─── Tab 1: Pattern Quiz ─── */}
          {activeTab === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {!showResult ? (
                <div className="space-y-6">
                  {/* Progress */}
                  <div className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Question {quizStep + 1} of {QUIZ_QUESTIONS.length}
                      </span>
                      <span className="text-xs text-brand-400 font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Question Card */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={quizStep}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.3 }}
                      className="glass-card rounded-2xl p-6 sm:p-8"
                    >
                      <h3 className="font-display text-lg sm:text-xl font-semibold mb-6 leading-relaxed">
                        {currentQuestion.question}
                      </h3>
                      <div className="space-y-3">
                        {currentQuestion.options.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleAnswer(opt.value)}
                            className={`w-full text-left px-5 py-4 rounded-xl text-sm leading-relaxed transition-all border ${
                              answers[quizStep] === opt.value
                                ? "border-brand-500 bg-brand-500/10 text-brand-300 shadow-md shadow-brand-500/10"
                                : "border-transparent glass hover:bg-brand-500/5 hover:border-brand-500/20"
                            }`}
                          >
                            <span className="font-semibold text-brand-400 mr-3">{opt.value}.</span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setQuizStep((s) => Math.max(0, s - 1))}
                      disabled={quizStep === 0}
                      className="flex items-center gap-2 px-4 py-2 text-sm glass rounded-xl disabled:opacity-30 hover:bg-brand-500/10 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    {quizStep === QUIZ_QUESTIONS.length - 1 && Object.keys(answers).length === QUIZ_QUESTIONS.length ? (
                      <button
                        onClick={handleFinishQuiz}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all"
                      >
                        <Sparkles className="w-4 h-4" /> Reveal My Pattern
                      </button>
                    ) : (
                      <button
                        onClick={() => setQuizStep((s) => Math.min(QUIZ_QUESTIONS.length - 1, s + 1))}
                        disabled={quizStep === QUIZ_QUESTIONS.length - 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm glass rounded-xl disabled:opacity-30 hover:bg-brand-500/10 transition-all"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* ─── Quiz Result ─── */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Archetype Header */}
                  <div className="glass-card rounded-2xl p-8 text-center relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${result.gradient} opacity-5`} />
                    <div className="relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${result.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg`}
                      >
                        <ResultIcon className="w-10 h-10 text-white" />
                      </motion.div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                        Your Archetype
                      </p>
                      <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient mb-4">
                        {result.name}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl mx-auto">
                        {result.description}
                      </p>
                    </div>
                  </div>

                  {/* Strengths & Shadow */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="glass rounded-2xl p-6">
                      <h3 className="font-display font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Core Strengths
                      </h3>
                      <div className="space-y-2.5">
                        {result.strengths.map((s, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                            {s}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                      <h3 className="font-display font-semibold text-amber-400 mb-4 flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Shadow Aspects
                      </h3>
                      <div className="space-y-2.5">
                        {result.shadow.map((s, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                            {s}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Growth Path */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-display font-semibold text-brand-400 mb-3">Growth Path</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {result.growthPath}
                    </p>
                  </div>

                  {/* Compatible Archetypes */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-display font-semibold mb-3">Compatible Archetypes</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.compatible.map((c) => (
                        <span
                          key={c}
                          className="px-4 py-2 rounded-full text-sm glass text-brand-300 font-medium"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Retake */}
                  <button
                    onClick={resetQuiz}
                    className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl text-sm font-medium glass hover:bg-brand-500/10 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> Take the Quiz Again
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─── Tab 2: Journal Analysis ─── */}
          {activeTab === "journal" && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {!journalResult ? (
                <>
                  <div className="glass-card rounded-2xl p-6 sm:p-8">
                    <h3 className="font-display text-lg font-semibold mb-2">Write a Journal Entry</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                      Write freely about whatever is on your mind. The analysis will identify patterns,
                      emotional themes, and offer a deeper reflection back to you.
                    </p>
                    <textarea
                      value={journalText}
                      onChange={(e) => setJournalText(e.target.value)}
                      placeholder="Start writing here... What has been on your mind lately? What keeps showing up in your thoughts?"
                      rows={8}
                      className="w-full glass rounded-xl px-5 py-4 text-sm leading-relaxed resize-none focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <span
                        className={`text-xs ${
                          journalText.trim().length < 50
                            ? "text-gray-500"
                            : "text-emerald-400"
                        }`}
                      >
                        {journalText.trim().length} / 50 minimum characters
                      </span>
                      <button
                        onClick={analyzeJournal}
                        disabled={journalLoading || journalText.trim().length < 50}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {journalLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" /> Analyze Entry
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {journalError && (
                    <div className="text-sm text-red-400 text-center bg-red-500/10 rounded-xl py-3 px-4">
                      {journalError}
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-xl font-bold">Your Analysis</h3>
                    <button
                      onClick={() => {
                        setJournalResult(null);
                        setJournalText("");
                      }}
                      className="flex items-center gap-2 text-sm glass px-4 py-2 rounded-xl hover:bg-brand-500/10 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" /> New Entry
                    </button>
                  </div>

                  {/* Identified Patterns */}
                  <div className="glass rounded-2xl p-6">
                    <h4 className="font-display font-semibold text-brand-400 mb-3">
                      Identified Patterns
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {journalResult.patterns.map((p, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 }}
                          className="px-3 py-1.5 rounded-full text-xs font-medium glass text-brand-300"
                        >
                          {p}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Emotional Themes */}
                  <div className="glass rounded-2xl p-6">
                    <h4 className="font-display font-semibold text-violet-400 mb-3">
                      Emotional Themes
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {journalResult.emotionalThemes.map((t, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 }}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300"
                        >
                          {t}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Deep Insight */}
                  <div className="glass-card rounded-2xl p-6">
                    <h4 className="font-display font-semibold text-emerald-400 mb-3">
                      Deep Insight
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {journalResult.insight}
                    </p>
                  </div>

                  {/* Follow-up Question */}
                  <div className="glass rounded-2xl p-6 border border-brand-500/20">
                    <h4 className="font-display font-semibold text-amber-400 mb-3">
                      A Question for You
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                      {journalResult.followUpQuestion}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─── Tab 3: Symbol Decoder ─── */}
          {activeTab === "symbol" && (
            <motion.div
              key="symbol"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {!symbolResult ? (
                <>
                  <div className="glass-card rounded-2xl p-6 sm:p-8">
                    <h3 className="font-display text-lg font-semibold mb-2">
                      Enter a Symbol or Dream Element
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                      Type a symbol, recurring image, or dream element that keeps appearing in your life.
                      You can also pick from the common symbols below.
                    </p>
                    <input
                      type="text"
                      value={symbolInput}
                      onChange={(e) => setSymbolInput(e.target.value)}
                      placeholder="e.g., a door that won't open, falling, a white wolf..."
                      className="w-full glass rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && symbolInput.trim()) analyzeSymbol();
                      }}
                    />

                    {/* Quick-pick Symbols */}
                    <div className="mt-5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
                        Quick pick a symbol
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {QUICK_SYMBOLS.map((sym) => {
                          const SymIcon = sym.icon;
                          return (
                            <button
                              key={sym.label}
                              onClick={() => setSymbolInput(sym.label)}
                              className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-medium transition-all ${
                                symbolInput === sym.label
                                  ? "bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30"
                                  : "glass hover:bg-brand-500/10"
                              }`}
                            >
                              <SymIcon className="w-5 h-5" />
                              {sym.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        onClick={analyzeSymbol}
                        disabled={symbolLoading || !symbolInput.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {symbolLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Decoding...
                          </>
                        ) : (
                          <>
                            <Shapes className="w-4 h-4" /> Decode Symbol
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {symbolError && (
                    <div className="text-sm text-red-400 text-center bg-red-500/10 rounded-xl py-3 px-4">
                      {symbolError}
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-display text-xl font-bold">Symbol Decoded</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Interpreting: <span className="text-brand-400 font-medium">{symbolInput}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSymbolResult(null);
                        setSymbolInput("");
                      }}
                      className="flex items-center gap-2 text-sm glass px-4 py-2 rounded-xl hover:bg-brand-500/10 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" /> New Symbol
                    </button>
                  </div>

                  {/* Psychological Interpretation */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl p-6"
                  >
                    <h4 className="font-display font-semibold text-sky-400 mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Psychological Interpretation
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {symbolResult.psychological}
                    </p>
                  </motion.div>

                  {/* Spiritual Meaning */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl p-6"
                  >
                    <h4 className="font-display font-semibold text-violet-400 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Spiritual Meaning
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {symbolResult.spiritual}
                    </p>
                  </motion.div>

                  {/* Personal Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-2xl p-6 border border-brand-500/20"
                  >
                    <h4 className="font-display font-semibold text-brand-400 mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4" /> Personal Message
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {symbolResult.personalMessage}
                    </p>
                  </motion.div>

                  {/* Practical Suggestion */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-2xl p-6"
                  >
                    <h4 className="font-display font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                      <Compass className="w-4 h-4" /> Practical Suggestion
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {symbolResult.suggestion}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
