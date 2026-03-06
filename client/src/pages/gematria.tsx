import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, ArrowRight, RotateCcw, Sparkles, BookOpen } from "lucide-react";

const HEBREW_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 10, K: 20, L: 30, M: 40, N: 50, O: 60, P: 70, Q: 80,
  R: 90, S: 100, T: 200, U: 300, V: 400, W: 500, X: 600,
  Y: 700, Z: 800,
};

const PYTHAGOREAN_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const NOTABLE_NUMBERS: Record<number, { title: string; meaning: string }> = {
  1: { title: "Unity", meaning: "The beginning of all things. Divine singularity and the source from which everything flows." },
  7: { title: "Divine Perfection", meaning: "Completion and spiritual awakening. Seven days, seven chakras, seven notes in a scale. The universe's favorite number." },
  12: { title: "Cosmic Order", meaning: "Twelve tribes, twelve apostles, twelve zodiac signs, twelve months. The number of divine governance and cosmic structure." },
  13: { title: "Transformation", meaning: "Often feared, deeply misunderstood. In many traditions, 13 represents death and rebirth, not bad luck. The ultimate transformation number." },
  26: { title: "YHVH", meaning: "The numerical value of the Tetragrammaton, the sacred four-letter name of God in Hebrew tradition. One of the most significant numbers in gematria." },
  33: { title: "Master Teacher", meaning: "The master number of compassion, healing, and selfless service. In numerology, a number of spiritual mastery and upliftment." },
  40: { title: "Trial & Testing", meaning: "Forty days in the desert, forty years in the wilderness, forty days of rain. The number of preparation before breakthrough." },
  72: { title: "Names of God", meaning: "Seventy-two names of God in Kabbalistic tradition. Represents the full spectrum of divine attributes and angelic hierarchy." },
  108: { title: "Sacred Completion", meaning: "108 beads on a mala, 108 Upanishads, 108 energy lines converging at the heart chakra. A number sacred across Hindu, Buddhist, and Jain traditions." },
  144: { title: "Spiritual Perfection", meaning: "12 times 12. The number of the New Jerusalem in Revelation. Represents the perfection of divine order multiplied by itself." },
  666: { title: "Material World", meaning: "Often misunderstood. In numerology, it represents the material plane, human imperfection, and solar energy. Not evil, just very human." },
  777: { title: "Divine Completion", meaning: "God's signature. Triple spiritual perfection. If 7 is divine, 777 is the universe saying 'I meant that.'" },
  888: { title: "Infinite Abundance", meaning: "The number of Jesus in Greek gematria. Represents infinite abundance, resurrection, and new beginnings on a cosmic scale." },
};

function reduceToSingle(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split("").reduce((s, d) => s + parseInt(d), 0);
  }
  return n;
}

function calculateGematria(word: string, system: "hebrew" | "pythagorean") {
  const values = system === "hebrew" ? HEBREW_VALUES : PYTHAGOREAN_VALUES;
  const letters = word.toUpperCase().split("").filter(c => /[A-Z]/.test(c));
  const breakdown = letters.map(l => ({ letter: l, value: values[l] || 0 }));
  const total = breakdown.reduce((s, b) => s + b.value, 0);
  const reduced = reduceToSingle(total);
  return { breakdown, total, reduced };
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function Gematria() {
  const [input, setInput] = useState("");
  const [compareInput, setCompareInput] = useState("");
  const [system, setSystem] = useState<"hebrew" | "pythagorean">("hebrew");
  const [result, setResult] = useState<ReturnType<typeof calculateGematria> | null>(null);
  const [compareResult, setCompareResult] = useState<ReturnType<typeof calculateGematria> | null>(null);

  const handleCalculate = () => {
    if (!input.trim()) return;
    setResult(calculateGematria(input, system));
    if (compareInput.trim()) {
      setCompareResult(calculateGematria(compareInput, system));
    } else {
      setCompareResult(null);
    }
  };

  const handleReset = () => {
    setInput("");
    setCompareInput("");
    setResult(null);
    setCompareResult(null);
  };

  const notable = result ? NOTABLE_NUMBERS[result.total] || NOTABLE_NUMBERS[result.reduced] : null;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-500 mb-6">
              <Hash className="w-4 h-4" /> Free Gematria Tool
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-gradient">Gematria</span> Calculator
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
              Every word has a numerical value. Type a word, name, or phrase and discover its
              hidden number. Compare two words to see if they share a vibration.
            </p>
          </motion.div>

          <motion.div {...fadeUp} className="glass rounded-2xl p-6 sm:p-8 mb-8">
            <div className="flex gap-2 mb-6">
              <button onClick={() => setSystem("hebrew")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${system === "hebrew" ? "btn-primary" : "btn-outline"}`}>
                Hebrew System
              </button>
              <button onClick={() => setSystem("pythagorean")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${system === "pythagorean" ? "btn-primary" : "btn-outline"}`}>
                Pythagorean System
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCalculate()}
                placeholder="Enter a word, name, or phrase..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-base outline-none focus:border-brand-500/40 transition-colors placeholder:text-gray-600"
              />
              <input
                value={compareInput}
                onChange={e => setCompareInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCalculate()}
                placeholder="Compare with another word (optional)..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500/40 transition-colors placeholder:text-gray-600"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={handleCalculate} disabled={!input.trim()}
                className="btn-primary flex items-center gap-2 px-6 disabled:opacity-30">
                <Sparkles className="w-4 h-4" /> Calculate
              </button>
              {result && (
                <button onClick={handleReset} className="btn-outline flex items-center gap-2 px-4">
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-6">

                <div className="glass rounded-2xl p-6 sm:p-8">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">{system === "hebrew" ? "Hebrew" : "Pythagorean"} Gematria Value</p>
                  <div className="flex items-baseline gap-4 mb-4">
                    <span className="font-display text-5xl sm:text-6xl font-bold text-gradient">{result.total}</span>
                    <span className="text-gray-500">reduces to</span>
                    <span className="font-display text-3xl font-bold text-brand-400">{result.reduced}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {result.breakdown.map((b, i) => (
                      <div key={i} className="glass rounded-lg px-3 py-2 text-center min-w-[50px]">
                        <p className="font-display text-lg font-bold text-brand-400">{b.letter}</p>
                        <p className="text-xs text-gray-500">{b.value}</p>
                      </div>
                    ))}
                  </div>

                  {notable && (
                    <div className="glass rounded-xl p-4 border border-brand-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-brand-400" />
                        <p className="font-display font-semibold text-sm text-brand-400">{notable.title}</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{notable.meaning}</p>
                    </div>
                  )}
                </div>

                {compareResult && (
                  <div className="glass rounded-2xl p-6 sm:p-8">
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Comparison: "{compareInput}"</p>
                    <div className="flex items-baseline gap-4 mb-4">
                      <span className="font-display text-4xl font-bold text-gradient">{compareResult.total}</span>
                      <span className="text-gray-500">reduces to</span>
                      <span className="font-display text-2xl font-bold text-brand-400">{compareResult.reduced}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {compareResult.breakdown.map((b, i) => (
                        <div key={i} className="glass rounded-lg px-3 py-2 text-center min-w-[50px]">
                          <p className="font-display text-lg font-bold text-brand-400">{b.letter}</p>
                          <p className="text-xs text-gray-500">{b.value}</p>
                        </div>
                      ))}
                    </div>

                    {result.total === compareResult.total ? (
                      <div className="glass rounded-xl p-4 border border-green-500/20">
                        <p className="text-sm text-green-400 font-medium">Exact match. These words share the same gematria value. In many traditions, this implies a deep spiritual connection between the two concepts.</p>
                      </div>
                    ) : result.reduced === compareResult.reduced ? (
                      <div className="glass rounded-xl p-4 border border-amber-500/20">
                        <p className="text-sm text-amber-400 font-medium">These words reduce to the same root number ({result.reduced}). They share a fundamental vibration, even though their surface expressions differ.</p>
                      </div>
                    ) : (
                      <div className="glass rounded-xl p-4 border border-white/10">
                        <p className="text-sm text-gray-400">Different values ({result.total} vs {compareResult.total}). These words carry distinct vibrations. Neither better nor worse, just different frequencies.</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div {...fadeUp} className="mt-12 glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-brand-400" />
              <h2 className="font-display text-xl font-bold">What is Gematria?</h2>
            </div>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>Gematria is an ancient practice of assigning numerical values to letters, then finding meaning in the totals. It's been used in Hebrew, Greek, and Arabic traditions for thousands of years.</p>
              <p>The idea is simple: if two words add up to the same number, there's a hidden connection between them. Kabbalists used this to find deeper layers of meaning in sacred texts. Modern practitioners use it for names, intentions, and exploration.</p>
              <p><strong className="text-gray-300">Hebrew System:</strong> Uses values from 1 to 800, following the traditional Hebrew letter-number assignments mapped to the English alphabet.</p>
              <p><strong className="text-gray-300">Pythagorean System:</strong> Uses values 1-9 in a repeating cycle (A=1, B=2... I=9, J=1, K=2...). More familiar to numerology practitioners.</p>
              <p>Is it real? It's a framework for pattern recognition. Whether those patterns are cosmic design or human creativity is up to you. Either way, it's a fascinating lens for looking at language differently.</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
