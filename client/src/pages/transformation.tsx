import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Sparkles,
  BookOpen,
  ClipboardCheck,
  Loader2,
  ChevronRight,
  RotateCcw,
  Heart,
  Brain,
  Flame,
  Shield,
  Users,
  Send,
} from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const TABS = [
  { id: "rewriter", label: "Belief Rewriter", icon: RefreshCw },
  { id: "insights", label: "Spiritual Insights", icon: BookOpen },
  { id: "alignment", label: "Alignment Check", icon: ClipboardCheck },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface RewriteResult {
  rewrite: string;
  explanation: string;
  affirmation: string;
  practice: string;
}

interface InsightResult {
  content: string;
}

const INSIGHT_TOPICS = [
  "Life Purpose",
  "Inner Child",
  "Shadow Self",
  "Past Lives",
  "Soul Contracts",
  "Divine Feminine/Masculine",
  "Kundalini",
  "Akashic Records",
] as const;

const ALIGNMENT_QUESTIONS = [
  { question: "How would you rate your overall energy levels throughout the day?", category: "Physical" },
  { question: "How restful and restorative is your sleep on most nights?", category: "Physical" },
  { question: "How freely do you express your creativity in daily life?", category: "Mental" },
  { question: "How nourishing and supportive do your closest relationships feel?", category: "Relational" },
  { question: "How clear are you on your sense of purpose or direction?", category: "Mental" },
  { question: "How well do you care for your physical body through movement and nutrition?", category: "Physical" },
  { question: "How effectively do you process and release difficult emotions?", category: "Emotional" },
  { question: "How connected do you feel to something greater than yourself?", category: "Spiritual" },
  { question: "How open and trusting is your relationship with abundance and receiving?", category: "Emotional" },
  { question: "How deeply do you practice compassion and acceptance toward yourself?", category: "Spiritual" },
] as const;

type AlignmentCategory = "Physical" | "Emotional" | "Mental" | "Spiritual" | "Relational";

const CATEGORY_META: Record<AlignmentCategory, { icon: typeof Heart; color: string; gradient: string }> = {
  Physical: { icon: Flame, color: "text-orange-400", gradient: "from-orange-500 to-red-500" },
  Emotional: { icon: Heart, color: "text-rose-400", gradient: "from-rose-500 to-pink-500" },
  Mental: { icon: Brain, color: "text-cyan-400", gradient: "from-cyan-500 to-blue-500" },
  Spiritual: { icon: Sparkles, color: "text-violet-400", gradient: "from-violet-500 to-purple-500" },
  Relational: { icon: Users, color: "text-emerald-400", gradient: "from-emerald-500 to-teal-500" },
};

const CATEGORY_FEEDBACK: Record<AlignmentCategory, Record<string, string>> = {
  Physical: {
    low: "Your physical vessel is asking for more attention. Small, consistent shifts in movement, hydration, and rest can create profound ripple effects across every area of your life.",
    mid: "You have a decent foundation of physical awareness. Deepening your body-based practices and listening more closely to what your body needs will elevate your vitality.",
    high: "Your physical alignment is strong. You honor your body as a temple and that discipline radiates outward into everything you do.",
  },
  Emotional: {
    low: "There may be unprocessed emotions weighing on your system. Creating safe space for feeling, whether through journaling, movement, or conversation, is essential right now.",
    mid: "You are developing emotional intelligence and learning to honor your inner landscape. Keep building trust with your own feelings; they carry important wisdom.",
    high: "Your emotional fluency is remarkable. You allow feelings to move through you without resistance, which keeps your energy clear and your heart open.",
  },
  Mental: {
    low: "Your mental energy may feel scattered or stagnant. Reconnecting with curiosity, creative expression, and intentional focus will reignite your inner clarity.",
    mid: "Your mind is active and engaged, though it could benefit from more creative play and purposeful direction. Trust the ideas that excite you most deeply.",
    high: "Your mental alignment is sharp and inspired. You channel your thoughts with intention and allow creativity to flow freely through your daily experience.",
  },
  Spiritual: {
    low: "You may be feeling disconnected from the deeper currents of life. Even five minutes of stillness, prayer, or nature immersion daily can begin to restore that sacred connection.",
    mid: "Your spiritual awareness is growing. Continue nurturing your relationship with the unseen through whatever practices resonate most authentically with your soul.",
    high: "You walk with a deep sense of spiritual connection. Your practices sustain you and your presence carries a quality of peace that others can feel.",
  },
  Relational: {
    low: "Your relational field may need tending. Honest communication, healthy boundaries, and vulnerability are the seeds of the nourishing connections you deserve.",
    mid: "You value connection and are learning to balance giving with receiving in your relationships. Keep showing up authentically; the right people will meet you there.",
    high: "Your relationships reflect deep mutual respect and care. You attract and sustain connections that uplift both you and those around you.",
  },
};

function getLevel(score: number): "low" | "mid" | "high" {
  if (score <= 2) return "low";
  if (score <= 3.5) return "mid";
  return "high";
}

function BeliefRewriter() {
  const [belief, setBelief] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    if (!belief.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/transform/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ belief: belief.trim() }),
      });
      const text = await res.text();
      let data: RewriteResult;
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
  }, [belief, loading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit],
  );

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-3">
        <p className="text-foreground/70 max-w-xl mx-auto">
          Type a limiting belief that has been holding you back. Receive a
          rewritten perspective, an understanding of why the old pattern formed,
          a daily affirmation, and a practice to anchor the new truth.
        </p>
      </div>

      <div className="glass-card !p-4 space-y-4">
        <label className="block text-sm font-medium text-foreground/60">
          Your limiting belief
        </label>
        <textarea
          value={belief}
          onChange={(e) => setBelief(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='e.g. "I am not good enough" or "Money is hard to make"'
          rows={3}
          className="w-full bg-transparent resize-none outline-none text-foreground placeholder:text-foreground/30"
        />
        <button
          className="btn-primary w-full gap-2"
          onClick={submit}
          disabled={!belief.trim() || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Rewriting belief...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" /> Rewrite This Belief
            </>
          )}
        </button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-400 text-center bg-red-500/10 rounded-lg py-2 px-4"
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card space-y-3">
              <div className="flex items-center gap-2 text-violet-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  Rewritten Belief
                </span>
              </div>
              <p className="text-lg font-display font-bold text-gradient leading-relaxed">
                {result.rewrite}
              </p>
            </div>

            <div className="glass-card space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  Why the Old Belief Held You Back
                </span>
              </div>
              <p className="text-foreground/70 leading-relaxed">
                {result.explanation}
              </p>
            </div>

            <div className="glass-card space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  Daily Affirmation
                </span>
              </div>
              <p className="text-foreground/80 italic leading-relaxed">
                "{result.affirmation}"
              </p>
            </div>

            <div className="glass-card space-y-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  Suggested Practice
                </span>
              </div>
              <p className="text-foreground/70 leading-relaxed">
                {result.practice}
              </p>
            </div>

            <div className="text-center pt-2">
              <button
                className="btn-outline text-sm gap-1"
                onClick={() => {
                  setResult(null);
                  setBelief("");
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Rewrite Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SpiritualInsights() {
  const [topic, setTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InsightResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (selected: string) => {
      if (loading) return;
      setTopic(selected);
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const res = await fetch("/api/transform/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: selected }),
        });
        const text = await res.text();
        let data: InsightResult;
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
    },
    [loading],
  );

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-3">
        <p className="text-foreground/70 max-w-xl mx-auto">
          Choose a topic that calls to you. Receive a deep, thoughtful
          exploration designed to expand your understanding and support your
          spiritual journey.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {INSIGHT_TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => submit(t)}
            disabled={loading}
            className={`glass-card !p-3 text-sm font-medium text-center transition-all hover:scale-[1.03] ${
              topic === t
                ? "ring-2 ring-violet-500/50 bg-violet-500/10"
                : "hover:bg-violet-500/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-400 text-center bg-red-500/10 rounded-lg py-2 px-4"
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-violet-500" />
            </motion.div>
            <p className="text-sm text-foreground/50">
              Channeling insight on {topic}...
            </p>
          </motion.div>
        )}

        {!loading && result && topic && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card space-y-4"
          >
            <div className="flex items-center gap-2 text-violet-400 mb-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-semibold tracking-wide uppercase">
                {topic}
              </span>
            </div>
            <div className="text-foreground/80 leading-relaxed whitespace-pre-line">
              {result.content}
            </div>
            <div className="pt-2">
              <button
                className="btn-outline text-sm gap-1"
                onClick={() => {
                  setResult(null);
                  setTopic(null);
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Explore Another Topic
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AlignmentCheck() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const selectAnswer = useCallback(
    (value: number) => {
      const next = [...answers];
      next[currentQ] = value;
      setAnswers(next);

      if (currentQ < ALIGNMENT_QUESTIONS.length - 1) {
        setTimeout(() => setCurrentQ(currentQ + 1), 300);
      } else {
        setTimeout(() => setShowResults(true), 400);
      }
    },
    [currentQ, answers],
  );

  const reset = useCallback(() => {
    setCurrentQ(0);
    setAnswers([]);
    setShowResults(false);
  }, []);

  const categoryScores: Record<AlignmentCategory, { total: number; count: number }> = {
    Physical: { total: 0, count: 0 },
    Emotional: { total: 0, count: 0 },
    Mental: { total: 0, count: 0 },
    Spiritual: { total: 0, count: 0 },
    Relational: { total: 0, count: 0 },
  };

  if (showResults) {
    ALIGNMENT_QUESTIONS.forEach((q, i) => {
      const cat = q.category as AlignmentCategory;
      categoryScores[cat].total += answers[i] || 0;
      categoryScores[cat].count += 1;
    });
  }

  const overallAvg =
    answers.length > 0
      ? answers.reduce((a, b) => a + b, 0) / answers.length
      : 0;

  const scaleLabels = ["Very Low", "Low", "Moderate", "Good", "Excellent"];

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-8 max-w-2xl mx-auto"
      >
        <div className="glass-card text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-display font-bold text-gradient">
            Your Alignment Profile
          </h3>
          <p className="text-foreground/60 text-sm">
            Overall alignment: {overallAvg.toFixed(1)} / 5.0
          </p>
        </div>

        <div className="space-y-4">
          {(Object.keys(CATEGORY_META) as AlignmentCategory[]).map((cat) => {
            const data = categoryScores[cat];
            const avg = data.count > 0 ? data.total / data.count : 0;
            const pct = (avg / 5) * 100;
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            const level = getLevel(avg);
            const feedback = CATEGORY_FEEDBACK[cat][level];

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * Object.keys(CATEGORY_META).indexOf(cat) }}
                className="glass-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                    <span className="font-display font-semibold">{cat}</span>
                  </div>
                  <span className={`text-sm font-bold ${meta.color}`}>
                    {avg.toFixed(1)} / 5
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-foreground/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`}
                  />
                </div>

                <p className="text-sm text-foreground/60 leading-relaxed">
                  {feedback}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="glass-card space-y-3">
          <h4 className="font-display font-semibold text-gradient">
            Summary Reading
          </h4>
          <p className="text-foreground/70 leading-relaxed text-sm">
            {overallAvg >= 4
              ? "You are deeply aligned across all dimensions of your being. Your awareness and dedication to growth are evident. Continue honoring the practices that sustain this balance, and share your light with those who are still finding their way."
              : overallAvg >= 3
                ? "You are on a strong path of alignment, with some areas calling for deeper attention. The categories with lower scores are not weaknesses; they are invitations. Focus your energy there with gentleness and curiosity, and watch how the whole system rises."
                : overallAvg >= 2
                  ? "There are meaningful opportunities for growth across several areas of your life. This is not a judgment but an invitation to begin. Choose one category that resonates most and commit to one small daily practice. Consistency transforms everything."
                  : "Your scores suggest a season of disconnection or transition. Please know that awareness itself is the first and most powerful step. You showed up here, and that matters. Start with self-compassion. Everything else builds from that foundation."}
          </p>
        </div>

        <div className="text-center">
          <button className="btn-outline text-sm gap-1" onClick={reset}>
            <RotateCcw className="w-3.5 h-3.5" /> Take Again
          </button>
        </div>
      </motion.div>
    );
  }

  const progress = ((currentQ + 1) / ALIGNMENT_QUESTIONS.length) * 100;
  const q = ALIGNMENT_QUESTIONS[currentQ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-3">
        <p className="text-foreground/70 max-w-xl mx-auto">
          Answer ten questions honestly. Rate each area of your life from 1
          (needs significant attention) to 5 (thriving). Your results will
          reveal where your energy is flowing and where it may be blocked.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/50">
            Question {currentQ + 1} of {ALIGNMENT_QUESTIONS.length}
          </span>
          <span className="text-violet-400 font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-foreground/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          <div className="glass-card">
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${
                  CATEGORY_META[q.category as AlignmentCategory].gradient
                } text-white`}
              >
                {q.category}
              </span>
            </div>
            <p className="font-display text-lg font-semibold leading-relaxed">
              {q.question}
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => selectAnswer(val)}
                className={`glass-card !p-3 text-center transition-all hover:scale-105 hover:bg-violet-500/10 ${
                  answers[currentQ] === val
                    ? "ring-2 ring-violet-500/50 bg-violet-500/10"
                    : ""
                }`}
              >
                <span className="block text-2xl font-bold text-gradient">
                  {val}
                </span>
                <span className="block text-[10px] text-foreground/40 mt-1 leading-tight">
                  {scaleLabels[val - 1]}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {answers.length > 0 && currentQ > 0 && (
        <div className="text-center">
          <button
            className="btn-outline text-sm gap-1"
            onClick={() => setCurrentQ(currentQ - 1)}
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Previous
            Question
          </button>
        </div>
      )}
    </div>
  );
}

export default function Transformation() {
  const [activeTab, setActiveTab] = useState<TabId>("rewriter");

  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fade} className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-violet-400 font-medium mb-2">
              <Send className="w-4 h-4" />
              <span>Transformation Tools</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient">
              Transform from Within
            </h1>
            <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
              Rewrite limiting beliefs, explore spiritual wisdom, and assess your
              alignment across the core dimensions of your being.
            </p>
          </motion.div>

          <motion.div {...fade} transition={{ delay: 0.1 }}>
            <div className="flex gap-1 p-1 rounded-2xl glass mb-10 overflow-x-auto">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20"
                        : "text-foreground/50 hover:text-foreground/80"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "rewriter" && <BeliefRewriter />}
              {activeTab === "insights" && <SpiritualInsights />}
              {activeTab === "alignment" && <AlignmentCheck />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
