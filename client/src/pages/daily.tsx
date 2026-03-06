import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Sparkles, BookOpen, Target, Lightbulb } from "lucide-react";

const fade = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const ENERGY: Record<number, string> = {
  1: "Leadership and new beginnings. Take initiative and start something fresh.",
  2: "Cooperation and partnership. Focus on relationships and teamwork.",
  3: "Creative expression. Share your talents and communicate openly.",
  4: "Foundation building. Focus on practical matters and stability.",
  5: "Freedom and adventure. Embrace change and seek new experiences.",
  6: "Nurturing and responsibility. Care for others and create harmony.",
  7: "Spiritual seeking. Focus on inner wisdom and contemplation.",
  8: "Material achievement. Pursue goals and financial success.",
  9: "Universal service. Give back and complete important cycles.",
  11: "Intuitive master energy. Trust your inner guidance and inspire others.",
  22: "Master builder energy. Manifest big dreams into reality.",
  33: "Master teacher energy. Share wisdom and heal through compassion.",
};

interface DailyData {
  energyOfDay: number;
  monthFocus: number;
  intentionalAction: number;
  biblicalVerse: string | null;
  verseReference: string | null;
  verseNumericalValue: number | null;
}

export default function DailyNumerologyPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { data, isLoading } = useQuery<DailyData>({
    queryKey: ["daily-numerology", date],
    queryFn: () => fetch(`/api/daily-numerology/${date}`).then(r => r.json()),
  });

  const { data: verseData } = useQuery({
    queryKey: ["biblical-verse", data?.energyOfDay],
    queryFn: () => fetch(`/api/biblical-verses?lifePath=${data?.energyOfDay}`).then(r => r.json()),
    enabled: !!data?.energyOfDay,
  });

  const formatted = new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fade} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-500 mb-6">
              <Calendar className="w-4 h-4" /> Daily Guidance
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Daily <span className="text-gradient">Numerology</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Discover your spiritual guidance and biblical inspiration for any day.
            </p>
          </motion.div>

          <motion.div {...fade} className="glass rounded-2xl p-5 mb-8 flex items-center justify-center gap-4 flex-wrap">
            <Calendar className="w-5 h-5 text-brand-400" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500/40 transition-colors" />
            <span className="text-sm text-gray-500">{formatted}</span>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass rounded-2xl h-72 animate-pulse" />
              <div className="glass rounded-2xl h-72 animate-pulse" />
            </div>
          ) : data ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <motion.div {...fade} className="glass rounded-2xl p-6">
                  <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-brand-400" /> Today's Numbers
                  </h2>
                  <div className="space-y-4">
                    {[
                      { label: "Energy of the Day", sub: "Your overall daily vibration", val: data.energyOfDay, color: "from-brand-500 to-violet-600" },
                      { label: "Monthly Focus", sub: "This month's spiritual theme", val: data.monthFocus, color: "from-violet-500 to-purple-600" },
                      { label: "Intentional Action", sub: "Guided action number", val: data.intentionalAction, color: "from-emerald-500 to-teal-600" },
                    ].map(n => (
                      <div key={n.label} className="flex items-center gap-4 p-3 rounded-xl bg-white/3 border border-white/5">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${n.color} flex items-center justify-center shrink-0`}>
                          <span className="text-white font-display font-bold text-lg">{n.val}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{n.label}</p>
                          <p className="text-xs text-gray-500">{n.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-4">
                    {ENERGY[data.energyOfDay] || "Unique spiritual energy for personal growth."}
                  </p>
                </motion.div>

                <motion.div {...fade} className="glass rounded-2xl p-6">
                  <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" /> Daily Guidance
                  </h3>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2 leading-relaxed">
                    <li>Embrace the energy of number {data.energyOfDay}</li>
                    <li>Channel monthly focus through number {data.monthFocus}</li>
                    <li>Take intentional action guided by number {data.intentionalAction}</li>
                  </ul>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                    Meditate on today's energy number and allow divine timing to guide your decisions.
                  </p>
                </motion.div>
              </div>

              <motion.div {...fade} className="glass rounded-2xl p-6 flex flex-col">
                <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-400" /> Today's Biblical Inspiration
                </h2>
                {data.biblicalVerse && data.verseReference ? (
                  <div className="flex-1 flex flex-col">
                    <blockquote className="text-base leading-relaxed italic text-gray-600 dark:text-gray-300 flex-1">
                      "{data.biblicalVerse}"
                    </blockquote>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <cite className="font-medium text-sm">{data.verseReference}</cite>
                      {data.verseNumericalValue && (
                        <span className="text-xs text-brand-400">Value: {data.verseNumericalValue}</span>
                      )}
                    </div>
                    {verseData?.themes && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {verseData.themes.map((t: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-[11px] bg-brand-500/10 text-brand-400">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        <Sparkles className="w-3 h-3 inline mr-1 text-brand-400" />
                        How does this verse align with your energy number {data.energyOfDay} today?
                        Consider journaling about the connections between scripture and your numerological guidance.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-600 opacity-30 mb-3" />
                    <p className="text-sm text-gray-500">Your daily verse is being prepared.</p>
                  </div>
                )}
              </motion.div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
