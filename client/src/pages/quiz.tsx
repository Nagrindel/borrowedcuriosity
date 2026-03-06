import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, CheckCircle, XCircle, RotateCcw, Trophy, Sparkles } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Quiz {
  title: string;
  description: string;
  questions: Question[];
}

const TOPICS = [
  "Numerology Basics",
  "Life Path Numbers",
  "Master Numbers 11, 22, 33",
  "Crystal Properties and Healing",
  "Chakra System",
  "Solfeggio Frequencies",
  "Gematria and Sacred Numbers",
  "Moon Phases and Spirituality",
  "Zodiac and Numerology",
  "Sacred Geometry",
];

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    const t = customTopic.trim() || topic;
    if (!t) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, questionCount }),
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error("Server returned an invalid response. Please try again."); }
      if (!res.ok) throw new Error(data.error || "Request failed");
      if (!data.questions?.length) throw new Error("No questions generated");
      setQuiz(data);
      setAnswers(new Array(data.questions.length).fill(null));
      setCurrentQ(0);
      setShowResult(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (idx: number) => {
    if (revealed) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
    setRevealed(true);
  };

  const next = () => {
    setRevealed(false);
    if (currentQ < (quiz?.questions.length || 0) - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
    }
  };

  const score = quiz ? answers.filter((a, i) => a === quiz.questions[i]?.correctIndex).length : 0;
  const total = quiz?.questions.length || 0;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const reset = () => { setQuiz(null); setAnswers([]); setCurrentQ(0); setShowResult(false); setRevealed(false); setCustomTopic(""); };

  return (
    <div className="min-h-screen">
      <section className="section-padding min-h-[35vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-400 mb-6">
              <Brain className="w-3.5 h-3.5" /> AI-Generated
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5">
              Spiritual <span className="text-gradient">Quiz</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Test your knowledge of numerology, crystals, chakras, and more.
              AI creates unique questions every time. Learn something new with each attempt.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          {!quiz ? (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-4">Pick a Topic</h3>
                <div className="grid grid-cols-2 gap-2">
                  {TOPICS.map(t => (
                    <button key={t} onClick={() => { setTopic(t); setCustomTopic(""); }}
                      className={`px-3 py-2.5 rounded-xl text-sm text-left transition-all ${
                        topic === t && !customTopic ? "bg-brand-500 text-white" : "glass hover:bg-brand-500/10"
                      }`}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-3">Or enter your own topic</h3>
                <input type="text" value={customTopic} onChange={e => setCustomTopic(e.target.value)}
                  placeholder="e.g., Karmic debt numbers and their meanings"
                  className="w-full glass rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-3">Questions: {questionCount}</h3>
                <input type="range" min={3} max={15} value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-brand-500" aria-label="Number of questions" title="Number of questions" />
                <div className="flex justify-between text-xs text-gray-500 mt-1"><span>3</span><span>15</span></div>
              </div>

              {error && <p className="text-sm text-red-400 text-center bg-red-500/10 rounded-lg py-2 px-4">{error}</p>}

              <button onClick={generate} disabled={loading || (!topic && !customTopic.trim())}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-40">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating quiz...</> : <><Sparkles className="w-5 h-5" /> Start Quiz</>}
              </button>
            </motion.div>
          ) : showResult ? (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-8 text-center">
              <div className={`w-20 h-20 rounded-full ${pct >= 70 ? "bg-green-500/20" : pct >= 40 ? "bg-amber-500/20" : "bg-red-500/20"} flex items-center justify-center mx-auto mb-6`}>
                <Trophy className={`w-10 h-10 ${pct >= 70 ? "text-green-400" : pct >= 40 ? "text-amber-400" : "text-red-400"}`} />
              </div>
              <h2 className="font-display text-3xl font-bold mb-2">{score}/{total}</h2>
              <p className="text-gray-500 mb-1">{pct}% correct</p>
              <p className="text-sm text-gray-400 mb-8">
                {pct >= 90 ? "Incredible. You really know your stuff." :
                 pct >= 70 ? "Well done. Your spiritual knowledge is solid." :
                 pct >= 40 ? "Not bad. Keep learning, you're getting there." :
                 "Room to grow. Curiosity is the first step."}
              </p>

              <div className="space-y-3 text-left mb-8">
                {quiz.questions.map((q, i) => {
                  const correct = answers[i] === q.correctIndex;
                  return (
                    <div key={i} className={`glass rounded-xl p-4 ${correct ? "border border-green-500/20" : "border border-red-500/20"}`}>
                      <div className="flex items-start gap-2 mb-2">
                        {correct ? <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
                        <p className="text-sm font-medium">{q.question}</p>
                      </div>
                      {!correct && <p className="text-xs text-green-400 ml-6 mb-1">Correct: {q.options[q.correctIndex]}</p>}
                      <p className="text-xs text-gray-500 ml-6">{q.explanation}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={reset} className="btn-outline flex items-center gap-2"><RotateCcw className="w-4 h-4" /> New Quiz</button>
                <button onClick={() => { setShowResult(false); setCurrentQ(0); setRevealed(false); setAnswers(new Array(total).fill(null)); }}
                  className="btn-primary flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Retry</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="question" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{quiz.title}</p>
                <p className="text-sm text-brand-400 font-medium">{currentQ + 1} / {total}</p>
              </div>

              <div className="w-full h-1.5 rounded-full bg-white/5 mb-8">
                <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${((currentQ + 1) / total) * 100}%` }} />
              </div>

              <div className="glass rounded-2xl p-6 sm:p-8 mb-6">
                <p className="font-display text-lg sm:text-xl font-semibold leading-relaxed">{quiz.questions[currentQ].question}</p>
              </div>

              <div className="space-y-3 mb-6">
                {quiz.questions[currentQ].options.map((opt, i) => {
                  const isSelected = answers[currentQ] === i;
                  const isCorrect = i === quiz.questions[currentQ].correctIndex;
                  let style = "glass hover:bg-brand-500/10";
                  if (revealed && isCorrect) style = "bg-green-500/10 ring-2 ring-green-500/50";
                  else if (revealed && isSelected && !isCorrect) style = "bg-red-500/10 ring-2 ring-red-500/50";
                  else if (isSelected) style = "bg-brand-500/10 ring-2 ring-brand-500/50";

                  return (
                    <button key={i} onClick={() => selectAnswer(i)} disabled={revealed}
                      className={`w-full rounded-xl p-4 text-left text-sm transition-all flex items-center gap-3 ${style}`}>
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        revealed && isCorrect ? "bg-green-500 text-white" : revealed && isSelected ? "bg-red-500 text-white" : "glass"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {revealed && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-400 leading-relaxed">{quiz.questions[currentQ].explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {revealed && (
                <button onClick={next} className="btn-primary w-full py-3">
                  {currentQ < total - 1 ? "Next Question" : "See Results"}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
