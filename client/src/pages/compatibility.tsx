import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Users, Sparkles, RotateCcw } from "lucide-react";
import { calculateLifePath } from "@/lib/numerology";

const fade = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

interface CompatResult {
  id: number;
  partner1Name: string;
  partner2Name: string;
  partner1LifePath: number;
  partner2LifePath: number;
  harmonyScore: number;
  attractionPotential: number;
  compatibilityNotes: string | null;
  createdAt: string;
}

function harmonyLabel(h: number) {
  if (h <= 3) return { text: "Excellent", color: "text-green-400 bg-green-500/10 border-green-500/20" };
  if (h <= 6) return { text: "Very Good", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
  if (h <= 9) return { text: "Good", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" };
  return { text: "Unique", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
}

function attractionLabel(a: number) {
  if (a <= 3) return { text: "Magnetic", color: "text-rose-400" };
  if (a <= 6) return { text: "Strong", color: "text-violet-400" };
  if (a <= 9) return { text: "Gentle", color: "text-blue-400" };
  return { text: "Mystical", color: "text-indigo-400" };
}

export default function CompatibilityPage() {
  const qc = useQueryClient();
  const [p1, setP1] = useState({ name: "", birth: "" });
  const [p2, setP2] = useState({ name: "", birth: "" });
  const [latest, setLatest] = useState<CompatResult | null>(null);

  const { data: history = [] } = useQuery<CompatResult[]>({
    queryKey: ["compatibilities"],
    queryFn: () => fetch("/api/relationship-compatibilities").then(r => r.json()),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const lp1 = calculateLifePath(p1.birth);
      const lp2 = calculateLifePath(p2.birth);
      const res = await fetch("/api/relationship-compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner1Name: p1.name, partner2Name: p2.name, partner1LifePath: lp1, partner2LifePath: lp2 }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setLatest(data);
      qc.invalidateQueries({ queryKey: ["compatibilities"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (p1.name && p1.birth && p2.name && p2.birth) mutation.mutate();
  };

  const reset = () => { setP1({ name: "", birth: "" }); setP2({ name: "", birth: "" }); setLatest(null); };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fade} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-rose-400 mb-6">
              <Heart className="w-4 h-4" /> Free Compatibility Check
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Relationship <span className="text-gradient">Compatibility</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Enter two birthdays and names. We'll calculate Life Path numbers and reveal the numerological harmony between you.
            </p>
          </motion.div>

          <motion.div {...fade} className="glass rounded-2xl p-6 sm:p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-widest text-brand-400 font-medium">Person 1</p>
                  <input value={p1.name} onChange={e => setP1(s => ({ ...s, name: e.target.value }))} placeholder="Full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500/40 transition-colors placeholder:text-gray-600" required />
                  <input type="date" value={p1.birth} onChange={e => setP1(s => ({ ...s, birth: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500/40 transition-colors" required />
                </div>
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-widest text-rose-400 font-medium">Person 2</p>
                  <input value={p2.name} onChange={e => setP2(s => ({ ...s, name: e.target.value }))} placeholder="Full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500/40 transition-colors placeholder:text-gray-600" required />
                  <input type="date" value={p2.birth} onChange={e => setP2(s => ({ ...s, birth: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500/40 transition-colors" required />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={mutation.isPending}
                  className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-40">
                  {mutation.isPending ? <><Sparkles className="w-4 h-4 animate-spin" /> Calculating...</> : <><Heart className="w-4 h-4" /> Check Compatibility</>}
                </button>
                {latest && <button type="button" onClick={reset} className="btn-outline flex items-center gap-2 px-4 py-3"><RotateCcw className="w-4 h-4" /></button>}
              </div>
            </form>
          </motion.div>

          <AnimatePresence>
            {latest && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass rounded-2xl p-6 sm:p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-400" />
                    {latest.partner1Name} & {latest.partner2Name}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${harmonyLabel(latest.harmonyScore).color}`}>
                    {harmonyLabel(latest.harmonyScore).text}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: `${latest.partner1Name}'s LP`, val: latest.partner1LifePath, color: "from-brand-500 to-violet-600" },
                    { label: `${latest.partner2Name}'s LP`, val: latest.partner2LifePath, color: "from-rose-500 to-pink-600" },
                    { label: "Harmony", val: latest.harmonyScore, color: "from-emerald-500 to-teal-600" },
                    { label: "Attraction", val: latest.attractionPotential, color: "from-amber-500 to-orange-600" },
                  ].map(n => (
                    <div key={n.label} className="text-center">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${n.color} flex items-center justify-center mx-auto mb-2`}>
                        <span className="text-white font-display font-bold text-xl">{n.val}</span>
                      </div>
                      <p className="text-xs text-gray-500">{n.label}</p>
                    </div>
                  ))}
                </div>
                {latest.compatibilityNotes && <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{latest.compatibilityNotes}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {history.length > 0 && (
            <motion.div {...fade}>
              <h3 className="font-display text-lg font-semibold mb-4">Previous Readings</h3>
              <div className="space-y-3">
                {history.slice(0, 10).map(c => {
                  const h = harmonyLabel(c.harmonyScore);
                  const a = attractionLabel(c.attractionPotential);
                  return (
                    <div key={c.id} className="glass rounded-xl p-4 flex items-center gap-4">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Users className="w-4 h-4 text-gray-500 shrink-0" />
                        <span className="text-sm font-medium truncate">{c.partner1Name} & {c.partner2Name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-gray-500">LP {c.partner1LifePath} + {c.partner2LifePath}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${h.color}`}>{h.text}</span>
                        <span className={`text-xs font-medium ${a.color}`}>{a.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          <motion.div {...fade} className="glass rounded-2xl p-6 mt-8">
            <h3 className="font-display font-semibold mb-4">Understanding Numerological Compatibility</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <p className="font-medium text-gray-300 mb-1">Harmony Score</p>
                <p className="leading-relaxed">Sum of both Life Path numbers, reduced. Lower numbers indicate stronger foundational compatibility.</p>
              </div>
              <div>
                <p className="font-medium text-gray-300 mb-1">Attraction Potential</p>
                <p className="leading-relaxed">Magnetic pull and romantic chemistry based on numerological vibrations between two souls.</p>
              </div>
              <div>
                <p className="font-medium text-gray-300 mb-1">Divine Timing</p>
                <p className="leading-relaxed">True compatibility transcends numbers. Use this as guidance while trusting each relationship's unique journey.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
