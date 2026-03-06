import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Volume2, Sparkles } from "lucide-react";
import { PYTHAGOREAN_VALUES, reduceToSingleDigit, getMeaning } from "@/lib/numerology";

const fade = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const SUGGESTIONS = ["wisdom", "love", "peace", "strength", "harmony", "serenity", "courage", "compassion"];

interface WordData {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  etymology: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  meanings: { partOfSpeech: string; definitions: { definition: string; example?: string }[] }[];
}

function wordNumerology(word: string) {
  const letters = word.toUpperCase().split("").filter(c => /[A-Z]/.test(c));
  const values = letters.map(c => ({ char: c, value: PYTHAGOREAN_VALUES[c] || 0 }));
  const total = values.reduce((s, v) => s + v.value, 0);
  const reduced = reduceToSingleDigit(total);
  return { values, total, reduced };
}

export default function WordLookupPage() {
  const [search, setSearch] = useState("");
  const [current, setCurrent] = useState("");

  const { data: wordData, isLoading, error } = useQuery<WordData>({
    queryKey: ["dictionary", current],
    queryFn: () => fetch(`/api/dictionary/${encodeURIComponent(current)}`).then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); }),
    enabled: !!current,
  });

  const { data: verseData } = useQuery({
    queryKey: ["verse-for-word", current],
    queryFn: () => fetch(`/api/biblical-verses?lifePath=${wordNumerology(current).reduced}`).then(r => r.json()),
    enabled: !!current,
  });

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); if (search.trim()) setCurrent(search.trim().toLowerCase()); };
  const pick = (w: string) => { setSearch(w); setCurrent(w); };

  const num = current ? wordNumerology(current) : null;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fade} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-cyan-400 mb-6">
              <BookOpen className="w-4 h-4" /> Dictionary + Numerology
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Word <span className="text-gradient">Lookup</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Search any word. Get its definition, etymology, synonyms, and its numerological vibration all in one place.
            </p>
          </motion.div>

          <motion.div {...fade} className="glass rounded-2xl p-5 mb-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Enter a word to analyze..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-28 py-3.5 text-base outline-none focus:border-brand-500/40 transition-colors placeholder:text-gray-600" />
              <button type="submit" disabled={!search.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary px-5 py-2 text-sm disabled:opacity-30">
                Search
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map(w => (
                <button key={w} onClick={() => pick(w)}
                  className="px-3 py-1.5 rounded-lg text-xs border border-white/8 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all text-gray-400 hover:text-gray-200">
                  {w}
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence>
            {current && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {isLoading ? (
                    <div className="glass rounded-2xl h-60 animate-pulse" />
                  ) : error ? (
                    <div className="glass rounded-2xl p-8 text-center">
                      <BookOpen className="w-12 h-12 text-gray-600 opacity-30 mx-auto mb-3" />
                      <p className="font-display font-semibold mb-1">Word Not Found</p>
                      <p className="text-sm text-gray-500">"{current}" could not be found. Check the spelling and try again.</p>
                    </div>
                  ) : wordData ? (
                    <>
                      <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-display text-2xl font-bold capitalize">{wordData.word}</h2>
                          {wordData.pronunciation && (
                            <span className="flex items-center gap-1 text-sm text-gray-500"><Volume2 className="w-4 h-4" /> {wordData.pronunciation}</span>
                          )}
                        </div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs bg-brand-500/10 text-brand-400 mb-4">{wordData.partOfSpeech}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{wordData.definition}</p>
                        {wordData.example && (
                          <div className="border-l-4 border-brand-500/30 pl-3 py-1 mb-4">
                            <p className="text-sm italic text-gray-500">"{wordData.example}"</p>
                          </div>
                        )}
                        {wordData.etymology && (
                          <div className="mb-4">
                            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1 font-medium">Etymology</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{wordData.etymology}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {wordData.synonyms.length > 0 && (
                            <div>
                              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-medium">Synonyms</p>
                              <div className="flex flex-wrap gap-1.5">
                                {wordData.synonyms.map(s => (
                                  <button key={s} onClick={() => pick(s)} className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors cursor-pointer">{s}</button>
                                ))}
                              </div>
                            </div>
                          )}
                          {wordData.antonyms.length > 0 && (
                            <div>
                              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-medium">Antonyms</p>
                              <div className="flex flex-wrap gap-1.5">
                                {wordData.antonyms.map(a => (
                                  <button key={a} onClick={() => pick(a)} className="px-2 py-0.5 rounded-full text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer">{a}</button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {wordData.meanings.length > 1 && (
                        <div className="glass rounded-2xl p-6">
                          <h3 className="font-display font-semibold mb-4">Additional Meanings</h3>
                          <div className="space-y-3">
                            {wordData.meanings.slice(1, 3).map((m, i) => (
                              <div key={i} className="border-l-4 border-violet-500/30 pl-3">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">{m.partOfSpeech}</span>
                                {m.definitions.slice(0, 2).map((d, j) => (
                                  <div key={j} className="mt-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{d.definition}</p>
                                    {d.example && <p className="text-xs italic text-gray-500 mt-1">"{d.example}"</p>}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>

                <div className="space-y-4">
                  {num && (
                    <div className="glass rounded-2xl p-6">
                      <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-400" /> Numerological Value
                      </h3>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
                          <span className="text-white font-display font-bold text-2xl">{num.reduced}</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total: {num.total}</p>
                          <p className="text-xs text-gray-500">Reduced: {num.reduced}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{getMeaning(num.reduced)}</p>
                      <div className="flex flex-wrap gap-1">
                        {num.values.map((v, i) => (
                          <div key={i} className="text-center w-8">
                            <span className="block text-xs font-medium">{v.char}</span>
                            <span className="block text-[11px] text-brand-400">{v.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {verseData && (
                    <div className="glass rounded-2xl p-6">
                      <h3 className="font-display font-semibold mb-3">Spiritual Connection</h3>
                      <blockquote className="text-sm italic text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                        "{verseData.text}"
                      </blockquote>
                      <cite className="text-xs font-medium">{verseData.reference}</cite>
                      {verseData.themes && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {verseData.themes.map((t: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-full text-[11px] bg-brand-500/10 text-brand-400">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!current && (
            <motion.div {...fade} className="glass rounded-2xl p-8 text-center">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-30" />
              <h3 className="font-display text-xl font-semibold mb-2">Ready to Explore</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Type any word above or click a suggestion. You'll get its full definition,
                etymology, synonyms, and its numerological vibration.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
