import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Sparkles, Download, RotateCcw, ChevronDown, Info, Save, CheckCircle } from "lucide-react";
import {
  calculateProfile, getMeaning, getDetailedLifePath, getDetailedExpression,
  generateReportHTML, getResearchInterests, type NumerologyProfile, type System,
} from "@/lib/numerology";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const CORE_LABELS = [
  { key: "lifePath", label: "Life Path", desc: "Your life's purpose and journey", color: "from-brand-500 to-violet-600" },
  { key: "expression", label: "Expression", desc: "Your natural talents and abilities", color: "from-violet-500 to-purple-600" },
  { key: "soulUrge", label: "Soul Urge", desc: "Your inner desires and motivations", color: "from-rose-500 to-pink-600" },
  { key: "personality", label: "Personality", desc: "How others perceive you", color: "from-emerald-500 to-teal-600" },
] as const;

const EXTENDED_LABELS = [
  { key: "birthDay", label: "Birth Day", desc: "Personal strength", color: "from-amber-500 to-orange-600" },
  { key: "maturity", label: "Maturity", desc: "Later life focus", color: "from-cyan-500 to-blue-600" },
  { key: "hiddenPassion", label: "Hidden Passion", desc: "Secret strength", color: "from-red-500 to-rose-600" },
  { key: "balance", label: "Balance", desc: "Inner harmony", color: "from-green-500 to-emerald-600" },
  { key: "subconscious", label: "Subconscious", desc: "Crisis response", color: "from-indigo-500 to-violet-600" },
] as const;

export default function CalculatorPage() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [system, setSystem] = useState<System>("pythagorean");
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile || saving) return;
    setSaving(true);
    try {
      await fetch("/api/numerology/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name, birthDate, system,
          lifePath: profile.lifePath, expression: profile.expression,
          soulUrge: profile.soulUrge, personality: profile.personality,
          birthDay: profile.birthDay, maturity: profile.maturity,
          hiddenPassion: profile.hiddenPassion, karmicLesson: profile.karmicLessons[0] || 0,
          balance: profile.balance, subconscious: profile.subconscious,
        }),
      });
      setSaved(true);
    } catch { /* silent */ }
    setSaving(false);
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) return;
    setCalculating(true);
    setExpanded(null);
    setSaved(false);
    setTimeout(() => {
      setProfile(calculateProfile(name, birthDate, system));
      setCalculating(false);
    }, 600);
  };

  const handleDownload = () => {
    if (!profile) return;
    const html = generateReportHTML(profile, name, birthDate, system);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `numerology-report-${name.replace(/\s+/g, "-").toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setProfile(null);
    setName("");
    setBirthDate("");
    setExpanded(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-500 mb-6">
              <Calculator className="w-4 h-4" /> Free, No Sign-up Required
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Numerology <span className="text-gradient">Calculator</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
              Enter your full birth name and birthday. Get 10 core numbers with personality-filled
              interpretations. Both Pythagorean and Chaldean systems supported.
            </p>
          </motion.div>

          <motion.div {...fadeUp} className="glass rounded-2xl p-6 sm:p-8 mb-10">
            <form onSubmit={handleCalculate} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Full Birth Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full legal birth name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-base outline-none focus:border-brand-500/40 transition-colors placeholder:text-gray-600"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Birth Date</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-base outline-none focus:border-brand-500/40 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">System</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setSystem("pythagorean")}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${system === "pythagorean" ? "btn-primary" : "btn-outline"}`}>
                      Pythagorean
                    </button>
                    <button type="button" onClick={() => setSystem("chaldean")}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${system === "chaldean" ? "btn-primary" : "btn-outline"}`}>
                      Chaldean
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={!name.trim() || !birthDate || calculating}
                  className="btn-primary flex items-center gap-2 px-8 py-3 text-base disabled:opacity-40">
                  {calculating ? (
                    <><Sparkles className="w-4 h-4 animate-spin" /> Calculating...</>
                  ) : (
                    <><Calculator className="w-4 h-4" /> Calculate My Numbers</>
                  )}
                </button>
                {profile && (
                  <>
                    <button type="button" onClick={handleSave} disabled={saved || saving}
                      className="btn-outline flex items-center gap-2 px-5 py-3 disabled:opacity-50">
                      {saved ? <><CheckCircle className="w-4 h-4 text-green-400" /> Saved</> : saving ? <><Save className="w-4 h-4 animate-pulse" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
                    </button>
                    <button type="button" onClick={handleDownload} className="btn-outline flex items-center gap-2 px-5 py-3">
                      <Download className="w-4 h-4" /> Download
                    </button>
                    <button type="button" onClick={handleReset} className="btn-outline flex items-center gap-2 px-4 py-3">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </form>

            <div className="mt-5 flex items-start gap-2 text-xs text-gray-500">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Use your full legal birth name (including middle names). Married or changed names carry different vibrations.</span>
            </div>
          </motion.div>

          <AnimatePresence>
            {profile && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }} className="space-y-8">

                <div>
                  <h2 className="font-display text-2xl font-bold mb-6">Core Numbers</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CORE_LABELS.map(({ key, label, desc, color }) => {
                      const val = profile[key as keyof NumerologyProfile] as number;
                      const isOpen = expanded === key;
                      return (
                        <motion.div key={key}
                          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="glass rounded-2xl overflow-hidden">
                          <button onClick={() => setExpanded(isOpen ? null : key)}
                            className="w-full p-5 flex items-center gap-4 text-left">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                              <span className="text-white font-display text-2xl font-bold">{val}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-display font-semibold">{label}</p>
                              <p className="text-xs text-gray-500">{desc}</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                                <div className="px-5 pb-5 pt-0">
                                  <div className="h-px bg-white/5 mb-4" />
                                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {key === "lifePath" ? getDetailedLifePath(val) : key === "expression" ? getDetailedExpression(val) : getMeaning(val)}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-6">Extended Analysis</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {EXTENDED_LABELS.map(({ key, label, desc, color }) => {
                      const val = key === "subconscious"
                        ? profile.subconscious
                        : (profile[key as keyof NumerologyProfile] as number);
                      return (
                        <motion.div key={key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }} className="glass rounded-xl p-4 text-center">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2`}>
                            <span className="text-white font-display font-bold text-lg">
                              {key === "subconscious" ? `${val}` : val}
                            </span>
                          </div>
                          <p className="font-medium text-sm">{label}</p>
                          <p className="text-[11px] text-gray-500">{desc}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {profile.karmicLessons.length > 0 && (
                  <div>
                    <h2 className="font-display text-2xl font-bold mb-4">Karmic Lessons</h2>
                    <div className="glass rounded-2xl p-6">
                      <p className="text-sm text-gray-500 mb-4">
                        These numbers are missing from your name. Energies you're here to develop.
                        Think of them as elective courses the universe made mandatory.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {profile.karmicLessons.map(num => (
                          <div key={num} className="text-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-2">
                              <span className="text-white font-bold">{num}</span>
                            </div>
                            <p className="text-xs text-gray-500 max-w-[100px]">{getMeaning(num).split(".")[0]}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">Detailed Interpretations</h2>
                  <div className="glass rounded-2xl p-6 space-y-5">
                    {[
                      { label: "Life Purpose", sub: `Life Path ${profile.lifePath}`, text: getDetailedLifePath(profile.lifePath), border: "border-brand-500" },
                      { label: "Natural Talents", sub: `Expression ${profile.expression}`, text: getDetailedExpression(profile.expression), border: "border-violet-500" },
                      { label: "Inner Desires", sub: `Soul Urge ${profile.soulUrge}`, text: getMeaning(profile.soulUrge), border: "border-rose-500" },
                      { label: "How Others See You", sub: `Personality ${profile.personality}`, text: getMeaning(profile.personality), border: "border-emerald-500" },
                      { label: "Subconscious Self", sub: `${profile.subconscious}/9`, text: profile.subconscious >= 7 ? "You handle crises with confidence. When pressure hits, you've got most tools in your belt." : profile.subconscious >= 5 ? "Solid foundation for handling challenges, with growth edges that keep things interesting." : "You may feel uncertain under sudden pressure. This is where your karmic lessons ask you to grow.", border: "border-cyan-500" },
                    ].map(item => (
                      <div key={item.label} className={`border-l-4 ${item.border} pl-4`}>
                        <p className="font-display font-semibold text-sm mb-0.5">{item.label} <span className="text-gray-500 font-normal">({item.sub})</span></p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">Research Interests and Topics for You</h2>
                  <div className="glass rounded-2xl p-6">
                    <p className="text-sm text-gray-500 mb-5">
                      Based on your Life Path {profile.lifePath}, Expression {profile.expression}, and Soul Urge {profile.soulUrge}, these
                      subjects naturally align with your numerological profile. Not career advice, but fuel for your curiosity.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {getResearchInterests(profile).map((interest, idx) => (
                        <motion.div
                          key={interest.topic}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.3 }}
                          className="border-l-3 border-brand-500 pl-4 py-2"
                          style={{ borderLeftWidth: 3 }}
                        >
                          <p className="font-medium text-sm mb-0.5">{interest.topic}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{interest.reason}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <motion.div {...fadeUp} className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-4">Want a deeper, personalized analysis that connects all your numbers?</p>
                  <a href="/store" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                    <Sparkles className="w-4 h-4" /> Order a Written Report
                  </a>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {!profile && (
            <motion.div {...fadeUp} className="glass rounded-2xl p-8 text-center">
              <Calculator className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-30" />
              <h3 className="font-display text-xl font-semibold mb-2">Ready to Calculate</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Enter your name and birthday above to discover your complete numerological profile.
                10 core numbers with full interpretations. Completely free.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
