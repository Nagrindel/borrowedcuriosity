import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, Loader2, ChevronRight, X, Sparkles } from "lucide-react";

interface Story {
  slug: string;
  title: string;
  category: string;
  content: string;
  image: string;
  expanded?: string | null;
}

const CATEGORIES = ["all", "biblical", "mythology", "cultural", "alchemy", "spiritual", "folklore"];

const categoryColors: Record<string, string> = {
  biblical: "bg-amber-500/10 text-amber-400",
  mythology: "bg-violet-500/10 text-violet-400",
  cultural: "bg-cyan-500/10 text-cyan-400",
  alchemy: "bg-rose-500/10 text-rose-400",
  spiritual: "bg-emerald-500/10 text-emerald-400",
  folklore: "bg-blue-500/10 text-blue-400",
};

export default function SacredStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Story | null>(null);
  const [expanding, setExpanding] = useState(false);

  useEffect(() => {
    fetch("/api/stories").then(r => r.json()).then(d => { setStories(d.stories || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const openStory = async (story: Story) => {
    setSelected(story);
    if (story.expanded) return;
    setExpanding(true);
    try {
      const res = await fetch(`/api/stories/${story.slug}`);
      const data = await res.json();
      setSelected(data);
      setStories(prev => prev.map(s => s.slug === story.slug ? { ...s, expanded: data.expanded } : s));
    } catch {} finally {
      setExpanding(false);
    }
  };

  const filtered = stories.filter(s => {
    const matchCat = category === "all" || s.category === category;
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.content.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen">
      <section className="section-padding min-h-[35vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-400 mb-6">
              <BookOpen className="w-3.5 h-3.5" /> Ancient Wisdom
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5">
              Sacred <span className="text-gradient">Stories</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Biblical references, mythology, folklore, and cultural traditions surrounding
              crystals, numbers, and the spiritual world. Click any story for an AI-expanded deep dive.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stories..."
              className="w-full glass rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-2 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-all ${
                  category === c ? "bg-brand-500 text-white" : "glass hover:bg-brand-500/10"
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((story, i) => (
              <motion.button key={story.slug} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => openStory(story)}
                className="glass rounded-xl overflow-hidden text-left group hover:ring-2 hover:ring-brand-500/30 transition-all">
                <div className="aspect-[2.5/1] bg-gradient-to-br from-brand-500/20 to-violet-600/20 relative overflow-hidden">
                  <img src={story.image} alt={story.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${categoryColors[story.category] || "bg-gray-500/10 text-gray-400"}`}>{story.category}</span>
                  </div>
                  <h3 className="font-display font-semibold mb-1 group-hover:text-brand-400 transition-colors">{story.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{story.content}</p>
                  <div className="flex items-center gap-1 text-xs text-brand-400 mt-3 font-medium">
                    Read more <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Story Modal */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelected(null)} className="fixed inset-0 bg-black/60 z-50" />
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                className="fixed inset-x-4 top-[10%] bottom-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-2xl sm:w-full z-50 glass-strong rounded-2xl overflow-y-auto">
                <div className="relative">
                  <div className="aspect-[3/1] bg-gradient-to-br from-brand-500/20 to-violet-600/20 relative overflow-hidden">
                    <img src={selected.image} alt={selected.title} className="w-full h-full object-cover opacity-50"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center" aria-label="Close">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 sm:p-8">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize mb-3 inline-block ${categoryColors[selected.category] || ""}`}>{selected.category}</span>
                  <h2 className="font-display text-2xl font-bold mb-4">{selected.title}</h2>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">{selected.content}</p>

                  {expanding ? (
                    <div className="flex items-center gap-2 text-sm text-brand-400">
                      <Loader2 className="w-4 h-4 animate-spin" /> Alta is expanding this story...
                    </div>
                  ) : selected.expanded ? (
                    <div className="border-t border-white/5 pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-brand-400" />
                        <h3 className="font-display font-semibold text-sm text-brand-400">Deep Dive</h3>
                      </div>
                      <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{selected.expanded}</div>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
