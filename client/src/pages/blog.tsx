import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { BookOpen, ArrowRight, Mail, Tag, Clock, Calendar, Check, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
const stagger = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

interface BlogPost {
  id: number; title: string; slug: string; excerpt: string; category: string;
  readingTime: string; gradient: string; imageUrl: string | null; createdAt: string;
}

const POSTS_PER_PAGE = 9;
const popularTags = ["Numerology", "Crystals", "Spirituality", "Psychology", "Wellness", "Metaphysics", "Lifestyle", "Curiosity"];

export default function Blog() {
  const [email, setEmail] = useState("");
  const [subMsg, setSubMsg] = useState("");
  const [page, setPage] = useState(1);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["blog-posts"],
    queryFn: () => apiRequest("/api/blog"),
  });

  const subscribe = useMutation({
    mutationFn: () => apiRequest("/api/subscribers", { method: "POST", body: JSON.stringify({ email }) }),
    onSuccess: () => { setSubMsg("You're in! Welcome to the curiosity club."); setEmail(""); },
    onError: (err: Error) => setSubMsg(err.message.includes("Already") ? "You're already subscribed!" : "Something went wrong. Try again."),
  });

  const filtered = activeTag ? posts.filter(p => p.category === activeTag) : posts;
  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  const handleTagClick = (tag: string) => {
    setActiveTag(activeTag === tag ? null : tag);
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-16">
      <section className="section-padding min-h-[35vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div {...fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-500 mb-6">
              <BookOpen className="w-3.5 h-3.5" /> Stories & insights
            </span>
          </motion.div>
          <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-4">
            The <span className="text-gradient">Blog</span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-6">
            Cosmic rants, practical wisdom, and the occasional hot take. Free to read, free to disagree.
          </motion.p>
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-wrap gap-2">
            {popularTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTag === tag
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                    : "glass text-gray-600 dark:text-gray-400 hover:text-brand-500"
                }`}
              >
                {tag}
              </button>
            ))}
            {activeTag && (
              <button onClick={() => { setActiveTag(null); setPage(1); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 transition-colors">
                Clear filter
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No posts found for this category.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((post, i) => (
                <motion.article key={post.id} {...stagger} transition={{ duration: 0.5, delay: i * 0.06 }}>
                  <Link href={`/blog/${post.slug}`}>
                    <div className="glass-card h-full group cursor-pointer flex flex-col">
                      <div className={`aspect-video rounded-xl bg-gradient-to-br ${post.gradient} mb-4 group-hover:scale-[1.02] transition-transform duration-300 overflow-hidden`}>
                        {post.imageUrl && (
                          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full glass text-xs font-medium text-brand-500">{post.category}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3.5 h-3.5" />{post.readingTime}</span>
                      </div>
                      <h2 className="font-display text-lg font-semibold mb-2 group-hover:text-brand-500 transition-colors line-clamp-2">{post.title}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-grow line-clamp-3">{post.excerpt}</p>
                      <span className="inline-flex items-center gap-1 text-brand-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Read More <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={page === 1}
                className="p-2 rounded-lg glass hover:text-brand-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    p === page ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25" : "glass hover:text-brand-500"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={page === totalPages}
                className="p-2 rounded-lg glass hover:text-brand-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div {...stagger} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="glass-card">
                <h3 className="font-display text-lg font-semibold mb-3">Stay Curious</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Get new posts and updates delivered to your inbox. No spam.
                </p>
                <form onSubmit={e => { e.preventDefault(); subscribe.mutate(); }} className="flex gap-2">
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 px-4 py-3 rounded-xl glass border border-white/10 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm"
                  />
                  <button type="submit" disabled={subscribe.isPending} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                    {subscribe.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : subscribe.isSuccess ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    {subscribe.isPending ? "..." : subscribe.isSuccess ? "Done" : "Subscribe"}
                  </button>
                </form>
                {subMsg && <p className="text-xs mt-2 text-brand-400">{subMsg}</p>}
              </div>
            </motion.div>

            <motion.div {...stagger} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="glass-card border-2 border-dashed border-gray-300/50 dark:border-white/10 h-full flex flex-col items-center justify-center text-center py-8">
                <p className="font-display font-semibold text-lg text-gray-500 dark:text-gray-400 mb-1">Your Ad Here</p>
                <p className="text-xs text-gray-500">
                  Interested in sponsoring? <a href="mailto:hello@borrowedcuriosity.com" className="text-brand-500 hover:underline">Get in touch</a>.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
