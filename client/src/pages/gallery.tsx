import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryVerticalEnd, Download, Play, Image, Video, FileDown, X, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Comments from "@/components/comments";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
const stagger = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

interface GalleryItem {
  id: number; title: string; description: string; type: string;
  gradient: string; mediaUrl: string | null; downloadUrl: string | null;
}

type Filter = "all" | "photo" | "video" | "download";
const filterTabs: { value: Filter; label: string; icon: typeof Image }[] = [
  { value: "all", label: "All", icon: GalleryVerticalEnd },
  { value: "photo", label: "Photos", icon: Image },
  { value: "video", label: "Videos", icon: Video },
  { value: "download", label: "Downloads", icon: FileDown },
];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [videoModal, setVideoModal] = useState<string | null>(null);
  const [commentItem, setCommentItem] = useState<number | null>(null);

  const { data: items = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["gallery"],
    queryFn: () => apiRequest("/api/gallery"),
  });

  const filtered = activeFilter === "all" ? items : items.filter(i => i.type === activeFilter);

  return (
    <div className="min-h-screen pt-16">
      <section className="section-padding min-h-[40vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div {...fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-500 mb-6">
              <GalleryVerticalEnd className="w-3.5 h-3.5" /> Visual curiosity
            </span>
          </motion.div>
          <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
            The <span className="text-gradient">Gallery</span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            Photos, videos, downloadable goodies, and creative projects. A curated corner of visual curiosity. No algorithm, just vibes.
          </motion.p>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="flex flex-wrap gap-2 mb-12">
            {filterTabs.map(tab => (
              <button key={tab.value} onClick={() => setActiveFilter(tab.value)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeFilter === tab.value ? "btn-primary" : "btn-outline"}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6" style={{ columnFill: "balance" }}>
              {filtered.map((item, i) => (
                <motion.div key={item.id} {...stagger} transition={{ duration: 0.5, delay: i * 0.06 }} className="break-inside-avoid mb-6">
                  <div className="glass-card group flex flex-col h-full">
                    <div className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${item.gradient} mb-4 overflow-hidden group-hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center relative`}>
                      {item.mediaUrl && !item.mediaUrl.includes("youtube") && !item.mediaUrl.includes("embed") && (
                        <img src={item.mediaUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      )}
                      {item.type === "video" && (
                        <button onClick={() => item.mediaUrl && setVideoModal(item.mediaUrl)}
                          className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-7 h-7 text-brand-600 ml-1" fill="currentColor" />
                          </div>
                        </button>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium w-fit mb-2 ${item.type === "photo" ? "bg-blue-500/20 text-blue-400" : item.type === "video" ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                      {item.type === "photo" ? "Photo" : item.type === "video" ? "Video" : "Download"}
                    </span>
                    <h3 className="font-display text-lg font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-grow">{item.description}</p>
                    <div className="flex items-center justify-between gap-3">
                      <button onClick={() => setCommentItem(commentItem === item.id ? null : item.id)}
                        className="text-xs text-gray-500 hover:text-brand-400 transition-colors">
                        Comments
                      </button>
                      {item.type === "download" && item.downloadUrl && (
                        <a href={item.downloadUrl} download className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                          <Download className="w-4 h-4" /> Download
                        </a>
                      )}
                      {item.type === "video" && item.mediaUrl && (
                        <button onClick={() => setVideoModal(item.mediaUrl!)} className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
                          <Play className="w-4 h-4" /> Play
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {commentItem === item.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 pt-4 border-t border-white/5">
                          <Comments targetType="gallery" targetId={item.id} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {videoModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setVideoModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="w-full max-w-4xl aspect-video relative">
              <button onClick={() => setVideoModal(null)} className="absolute -top-10 right-0 text-white/60 hover:text-white"><X className="w-6 h-6" /></button>
              <iframe src={videoModal} className="w-full h-full rounded-2xl" allow="autoplay; fullscreen" allowFullScreen />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
