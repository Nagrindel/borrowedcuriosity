import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { BookOpen, ArrowRight, Mail, Tag, Clock, Calendar, Check, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
const stagger = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

interface BlogPost {
  id: number; title: string; slug: string; excerpt: string; category: string;
  readingTime: string; gradient: string; imageUrl: string | null; createdAt: string;
}

const popularTags = ["Numerology", "Self-Discovery", "Handcrafted", "Crystals", "Moon Phases", "Intentions", "Creative", "Curiosity"];

export default function Blog() {
  const [email, setEmail] = useState("");
  const [subMsg, setSubMsg] = useState("");

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["blog-posts"],
    queryFn: () => apiRequest("/api/blog"),
  });

  const subscribe = useMutation({
    mutationFn: () => apiRequest("/api/subscribers", { method: "POST", body: JSON.stringify({ email }) }),
    onSuccess: () => { setSubMsg("You're in! Welcome to the curiosity club."); setEmail(""); },
    onError: (err: Error) => setSubMsg(err.message.includes("Already") ? "You're already subscribed!" : "Something went wrong. Try again."),
  });

  return (
    <div className="min-h-screen pt-16">
      <section className="section-padding min-h-[40vh] flex items-center relative overflow-hidden">
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
          <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
            The <span className="text-gradient">Blog</span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            Cosmic rants, practical wisdom, and the occasional hot take. Free to read, free to disagree. We're not your guru.
          </motion.p>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post, i) => (
                    <motion.article key={post.id} {...stagger} transition={{ duration: 0.5, delay: i * 0.08 }}>
                      <Link href={`/blog/${post.slug}`}>
                        <div className="glass-card h-full group cursor-pointer flex flex-col">
                          <div className={`aspect-video rounded-xl bg-gradient-to-br ${post.gradient} mb-4 group-hover:scale-[1.02] transition-transform duration-300 overflow-hidden`}>
                            {post.imageUrl && (
                              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full glass text-xs font-medium text-brand-500">{post.category}</span>
                            <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar className="w-3.5 h-3.5" />{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3.5 h-3.5" />{post.readingTime}</span>
                          </div>
                          <h2 className="font-display text-xl font-semibold mb-2 group-hover:text-brand-500 transition-colors">{post.title}</h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-grow">{post.excerpt}</p>
                          <span className="inline-flex items-center gap-1 text-brand-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Read More <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              )}
            </div>

            <aside className="lg:col-span-1 space-y-6">
              <motion.div {...stagger} transition={{ duration: 0.5, delay: 0.2 }}>
                <div className="glass-card sticky top-24">
                  <h3 className="font-display text-lg font-semibold mb-3">Sign Up Free</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Get new posts, shop updates, and the occasional existential musing. No spam.
                  </p>
                  <form onSubmit={e => { e.preventDefault(); subscribe.mutate(); }} className="space-y-3">
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm"
                    />
                    <button type="submit" disabled={subscribe.isPending} className="btn-primary w-full flex items-center justify-center gap-2">
                      {subscribe.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : subscribe.isSuccess ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      {subscribe.isPending ? "Subscribing..." : subscribe.isSuccess ? "Subscribed!" : "Subscribe"}
                    </button>
                    {subMsg && <p className="text-xs text-center text-brand-400">{subMsg}</p>}
                  </form>
                </div>
              </motion.div>

              <motion.div {...stagger} transition={{ duration: 0.5, delay: 0.3 }}>
                <div className="glass-card border-2 border-dashed border-gray-300/50 dark:border-white/10 min-h-[180px] flex flex-col items-center justify-center text-center">
                  <p className="font-display font-semibold text-lg text-gray-500 dark:text-gray-400 mb-1">Your Ad Here</p>
                  <p className="text-xs text-gray-500">
                    Interested in sponsoring? <a href="mailto:hello@borrowedcuriosity.com" className="text-brand-500 hover:underline">Get in touch</a>.
                  </p>
                </div>
              </motion.div>

              <motion.div {...stagger} transition={{ duration: 0.5, delay: 0.4 }}>
                <div className="glass-card">
                  <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-brand-500" /> Popular Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-lg glass text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-brand-500 cursor-pointer transition-colors">{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
