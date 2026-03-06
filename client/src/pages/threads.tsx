import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
const stagger = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

interface ThreadCard { id: number; title: string; content: string; orderIndex: number; }
interface Thread { id: number; topic: string; cards: ThreadCard[]; }

export default function Threads() {
  const [currentIndices, setCurrentIndices] = useState<Record<number, number>>({});

  const { data: threads = [], isLoading } = useQuery<Thread[]>({
    queryKey: ["threads"],
    queryFn: () => apiRequest("/api/threads"),
  });

  const getIndex = (threadId: number) => currentIndices[threadId] ?? 0;
  const setIndex = (threadId: number, index: number) => {
    setCurrentIndices(prev => ({ ...prev, [threadId]: index }));
  };

  return (
    <div className="min-h-screen pt-16">
      <section className="section-padding min-h-[40vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div {...fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-500 mb-6">
              <MessageCircle className="w-3.5 h-3.5" /> Bite-sized wisdom
            </span>
          </motion.div>
          <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
            <span className="text-gradient">Threads</span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            Bite-sized wisdom you can flip through. Like tarot cards, except these won't predict your death. Probably.
          </motion.p>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {threads.map((thread, threadIdx) => {
                const idx = getIndex(thread.id);
                const card = thread.cards[idx];
                const total = thread.cards.length;

                if (!card) return null;

                return (
                  <motion.div key={thread.id} {...stagger} transition={{ duration: 0.5, delay: threadIdx * 0.1 }} className="glass-card min-h-[320px] flex flex-col">
                    <h3 className="font-display text-lg font-semibold mb-4 text-brand-500">{thread.topic}</h3>
                    <div className="flex-grow relative min-h-[200px] touch-pan-y"
                      onTouchStart={e => { (e.currentTarget as any)._touchX = e.touches[0].clientX; }}
                      onTouchEnd={e => {
                        const startX = (e.currentTarget as any)._touchX;
                        if (startX == null) return;
                        const diff = e.changedTouches[0].clientX - startX;
                        if (Math.abs(diff) > 50) {
                          if (diff < 0 && idx < total - 1) setIndex(thread.id, idx + 1);
                          if (diff > 0 && idx > 0) setIndex(thread.id, idx - 1);
                        }
                      }}>
                      <AnimatePresence mode="wait">
                        <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="absolute inset-0">
                          <h4 className="font-display text-xl font-semibold mb-3">{card.title}</h4>
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{card.content}</p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/30 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setIndex(thread.id, Math.max(0, idx - 1))} disabled={idx === 0}
                          className="p-2 rounded-lg btn-outline disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Previous card">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setIndex(thread.id, Math.min(total - 1, idx + 1))} disabled={idx === total - 1}
                          className="p-2 rounded-lg btn-outline disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Next card">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex gap-1.5">
                        {thread.cards.map((_, dotIdx) => (
                          <button key={dotIdx} onClick={() => setIndex(thread.id, dotIdx)}
                            className={`w-2 h-2 rounded-full transition-all ${dotIdx === idx ? "bg-brand-500 w-4" : "bg-gray-300 dark:bg-gray-600 hover:bg-brand-500/50"}`}
                            aria-label={`Go to card ${dotIdx + 1}`} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
