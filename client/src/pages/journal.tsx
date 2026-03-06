import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Loader2, RefreshCw, Download, Sparkles, Heart, Sun, Moon, Flame, Feather } from "lucide-react";

interface JournalPrompt {
  prompt: string;
  followUp: string;
  affirmation: string;
  category: string;
}

const THEMES = [
  { id: "self-discovery", label: "Self-Discovery", icon: <Sparkles className="w-4 h-4" /> },
  { id: "gratitude", label: "Gratitude", icon: <Heart className="w-4 h-4" /> },
  { id: "shadow-work", label: "Shadow Work", icon: <Moon className="w-4 h-4" /> },
  { id: "manifestation", label: "Manifestation", icon: <Sun className="w-4 h-4" /> },
  { id: "healing", label: "Healing", icon: <Feather className="w-4 h-4" /> },
  { id: "purpose", label: "Life Purpose", icon: <Flame className="w-4 h-4" /> },
];

const MOODS = ["Reflective", "Restless", "Grateful", "Anxious", "Hopeful", "Overwhelmed", "Peaceful", "Curious"];

const categoryColors: Record<string, string> = {
  reflection: "bg-blue-500/10 text-blue-400",
  gratitude: "bg-green-500/10 text-green-400",
  "shadow-work": "bg-violet-500/10 text-violet-400",
  manifestation: "bg-amber-500/10 text-amber-400",
  relationships: "bg-pink-500/10 text-pink-400",
  purpose: "bg-cyan-500/10 text-cyan-400",
  healing: "bg-emerald-500/10 text-emerald-400",
};

export default function Journal() {
  const [theme, setTheme] = useState("self-discovery");
  const [mood, setMood] = useState("Reflective");
  const [lifePathNumber, setLifePathNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState<JournalPrompt[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setExpandedIdx(null);

    try {
      const res = await fetch("/api/journal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, mood, lifePathNumber: lifePathNumber || undefined, depth: "medium" }),
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error("Server returned an invalid response. Please try again."); }
      if (!res.ok) throw new Error(data.error || "Request failed");
      setPrompts(data.prompts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const text = prompts.map((p, i) =>
      `--- Prompt ${i + 1}: ${p.category} ---\n\n${p.prompt}\n\nDig deeper: ${p.followUp}\n\nAffirmation: ${p.affirmation}\n`
    ).join("\n\n");
    const blob = new Blob([`Borrowed Curiosity - Journal Prompts\nTheme: ${theme} | Mood: ${mood}\n${"=".repeat(40)}\n\n${text}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-prompts-${theme}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <section className="section-padding min-h-[35vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-400 mb-6">
              <BookOpen className="w-3.5 h-3.5" /> AI-Powered
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5">
              Spiritual <span className="text-gradient">Journal</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              AI-generated journal prompts tailored to your mood, theme, and numerology.
              Because the right question can change everything.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        {prompts.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4">Choose a Theme</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      theme === t.id ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25" : "glass hover:bg-brand-500/10"
                    }`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4">How are you feeling?</h3>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(m => (
                  <button key={m} onClick={() => setMood(m)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      mood === m ? "bg-brand-500 text-white" : "glass hover:bg-brand-500/10"
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-2">Life Path Number (optional)</h3>
              <p className="text-xs text-gray-500 mb-3">Personalizes prompts to your numerology. Don't know yours? Try the calculator.</p>
              <input type="text" value={lifePathNumber} onChange={e => setLifePathNumber(e.target.value)}
                placeholder="e.g., 7" maxLength={2}
                className="w-24 glass rounded-lg px-4 py-2.5 text-sm text-center focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>

            {error && <p className="text-sm text-red-400 text-center bg-red-500/10 rounded-lg py-2 px-4">{error}</p>}

            <button onClick={generate} disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating prompts...</> : <><Sparkles className="w-5 h-5" /> Generate Journal Prompts</>}
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold">Your Prompts</h2>
                <p className="text-xs text-gray-500">{theme} / {mood}{lifePathNumber ? ` / Life Path ${lifePathNumber}` : ""}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={download} className="btn-outline flex items-center gap-2 text-sm" aria-label="Download prompts">
                  <Download className="w-4 h-4" /> Save
                </button>
                <button onClick={() => { setPrompts([]); }} className="btn-outline flex items-center gap-2 text-sm" aria-label="Generate new prompts">
                  <RefreshCw className="w-4 h-4" /> New
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {prompts.map((p, i) => {
                const isOpen = expandedIdx === i;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <button onClick={() => setExpandedIdx(isOpen ? null : i)}
                      className={`w-full glass rounded-xl p-5 text-left transition-all ${isOpen ? "ring-2 ring-brand-500 bg-brand-500/5" : "hover:bg-brand-500/5"}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="font-display font-bold text-brand-400 text-sm">{i + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColors[p.category] || "bg-gray-500/10 text-gray-400"}`}>{p.category}</span>
                          </div>
                          <p className="font-medium text-sm leading-relaxed">{p.prompt}</p>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden">
                                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1 font-medium">Go Deeper</p>
                                    <p className="text-sm text-gray-400">{p.followUp}</p>
                                  </div>
                                  <div className="bg-brand-500/5 rounded-lg p-3">
                                    <p className="text-xs text-brand-400 mb-1 font-medium">Affirmation</p>
                                    <p className="text-sm text-brand-300 italic">{p.affirmation}</p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}
