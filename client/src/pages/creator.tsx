import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenLine,
  Send,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Trash2,
  Clock,
  Sparkles,
  FileText,
  MessageSquare,
  Brain,
  Heart,
  Mail,
  Users,
  ShoppingBag,
  Quote,
  X,
} from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

interface HistoryItem {
  id: string;
  contentType: string;
  topic: string;
  tone: string;
  content: string;
  createdAt: number;
}

const CONTENT_TYPES = [
  { id: "blog-outline", label: "Blog Post Outline", icon: FileText, color: "from-violet-500 to-indigo-600" },
  { id: "social-caption", label: "Social Media Caption", icon: MessageSquare, color: "from-pink-500 to-rose-600" },
  { id: "meditation-script", label: "Meditation Script", icon: Brain, color: "from-cyan-400 to-blue-600" },
  { id: "affirmation-set", label: "Affirmation Set", icon: Heart, color: "from-emerald-400 to-green-600" },
  { id: "newsletter-draft", label: "Newsletter Draft", icon: Mail, color: "from-amber-400 to-orange-600" },
  { id: "workshop-outline", label: "Workshop Outline", icon: Users, color: "from-purple-500 to-fuchsia-600" },
  { id: "product-description", label: "Product Description", icon: ShoppingBag, color: "from-teal-400 to-cyan-600" },
  { id: "quote-set", label: "Inspirational Quote Set", icon: Quote, color: "from-rose-400 to-pink-600" },
] as const;

type ContentTypeId = (typeof CONTENT_TYPES)[number]["id"];

const TOPIC_SUGGESTIONS = [
  "Numerology",
  "Crystal Healing",
  "Spiritual Growth",
  "Mindfulness",
  "Energy Work",
  "Moon Rituals",
  "Self-Love",
  "Sacred Geometry",
];

const TONES = [
  { id: "warm", label: "Warm" },
  { id: "professional", label: "Professional" },
  { id: "playful", label: "Playful" },
  { id: "mystical", label: "Mystical" },
  { id: "educational", label: "Educational" },
  { id: "empowering", label: "Empowering" },
] as const;

type ToneId = (typeof TONES)[number]["id"];

const STORAGE_KEY = "bc-creator-history";

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 5);
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 5)));
}

function contentTypeLabel(id: string): string {
  return CONTENT_TYPES.find((ct) => ct.id === id)?.label ?? id;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

export default function Creator() {
  const [contentType, setContentType] = useState<ContentTypeId | null>(null);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<ToneId>("warm");
  const [additionalContext, setAdditionalContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [viewingHistoryItem, setViewingHistoryItem] = useState<HistoryItem | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const canGenerate = contentType !== null && topic.trim().length > 0;

  const generate = useCallback(async () => {
    if (!canGenerate || loading) return;
    setLoading(true);
    setError(null);
    setOutput("");
    setViewingHistoryItem(null);

    try {
      const res = await fetch("/api/creator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          topic: topic.trim(),
          tone,
          additionalContext: additionalContext.trim() || undefined,
        }),
      });

      const text = await res.text();
      let data: { content?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("The server returned an unexpected response. Please try again.");
      }

      if (!res.ok) throw new Error(data.error || "Request failed. Please try again.");
      if (!data.content) throw new Error("No content was returned. Please try again.");

      setOutput(data.content);

      const item: HistoryItem = {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        contentType: contentType!,
        topic: topic.trim(),
        tone,
        content: data.content,
        createdAt: Date.now(),
      };
      setHistory((prev) => [item, ...prev].slice(0, 5));

      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [canGenerate, loading, contentType, topic, tone, additionalContext]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setViewingHistoryItem(null);
  }, []);

  const removeHistoryItem = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    setViewingHistoryItem((prev) => (prev?.id === id ? null : prev));
  }, []);

  const restoreHistoryItem = useCallback((item: HistoryItem) => {
    setViewingHistoryItem(item);
    setOutput(item.content);
    setContentType(item.contentType as ContentTypeId);
    setTopic(item.topic);
    setTone(item.tone as ToneId);
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  }, []);

  const displayedContent = viewingHistoryItem ? viewingHistoryItem.content : output;

  return (
    <div className="min-h-screen">
      <section className="section-padding min-h-[32vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-violet-400 mb-6">
              <PenLine className="w-3.5 h-3.5" /> Content Creator
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5">
              Sacred <span className="text-gradient">Content</span> Creator
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Craft thoughtful spiritual content for your audience. Choose a format,
              set the tone, and let the words flow through intentional creation.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div {...fade} className="space-y-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 text-sm font-bold">1</span>
                Content Type
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CONTENT_TYPES.map((ct) => {
                  const Icon = ct.icon;
                  const isSelected = contentType === ct.id;
                  return (
                    <motion.button
                      key={ct.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setContentType(ct.id)}
                      className={`relative glass rounded-xl p-4 text-left transition-all duration-200 group ${
                        isSelected
                          ? "ring-2 ring-violet-500 bg-violet-500/10"
                          : "hover:bg-violet-500/5"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ct.color} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm font-medium leading-tight">{ct.label}</p>
                      {isSelected && (
                        <motion.div
                          layoutId="content-type-check"
                          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.1 }} className="space-y-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 text-sm font-bold">2</span>
                Topic
              </h2>
              <div className="glass rounded-xl p-4 space-y-3">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What should the content be about?"
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-foreground/30 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  {TOPIC_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setTopic(s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        topic === s
                          ? "bg-violet-500 text-white"
                          : "glass text-foreground/60 hover:text-foreground hover:bg-violet-500/10"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.15 }} className="space-y-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 text-sm font-bold">3</span>
                Tone
              </h2>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      tone === t.id
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20"
                        : "glass text-foreground/60 hover:text-foreground hover:bg-violet-500/10"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.2 }} className="space-y-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 text-sm font-bold">4</span>
                Additional Context
                <span className="text-xs font-normal text-foreground/40 ml-1">(optional)</span>
              </h2>
              <div className="glass rounded-xl p-4">
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Any specific instructions, keywords, or details you want included..."
                  rows={3}
                  className="w-full bg-transparent resize-none outline-none text-foreground placeholder:text-foreground/30 text-sm leading-relaxed"
                />
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}

            <motion.div {...fade} transition={{ delay: 0.25 }}>
              <button
                onClick={generate}
                disabled={!canGenerate || loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating your content...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Generate Content
                  </>
                )}
              </button>
            </motion.div>

            <AnimatePresence>
              {displayedContent && (
                <motion.div
                  ref={outputRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-violet-400" />
                      {viewingHistoryItem ? "Saved Result" : "Your Content"}
                    </h2>
                    <button
                      onClick={() => copyToClipboard(displayedContent)}
                      className="btn-outline text-sm gap-2 !px-4 !py-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="glass-card">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {displayedContent.split("\n").map((line, i) => {
                        if (!line.trim()) return <div key={i} className="h-3" />;

                        const isHeading = line.startsWith("# ") || line.startsWith("## ") || line.startsWith("### ");
                        if (isHeading) {
                          const level = line.startsWith("### ") ? 3 : line.startsWith("## ") ? 2 : 1;
                          const text = line.replace(/^#{1,3}\s/, "");
                          if (level === 1) return <h3 key={i} className="text-xl font-display font-bold text-gradient mt-4 mb-2">{text}</h3>;
                          if (level === 2) return <h4 key={i} className="text-lg font-display font-semibold mt-3 mb-1">{text}</h4>;
                          return <h5 key={i} className="text-base font-display font-semibold mt-2 mb-1">{text}</h5>;
                        }

                        const isBullet = line.trimStart().startsWith("- ") || line.trimStart().startsWith("* ");
                        if (isBullet) {
                          const text = line.trimStart().replace(/^[-*]\s/, "");
                          return (
                            <div key={i} className="flex gap-2 ml-2 mb-1">
                              <span className="text-violet-400 mt-1 shrink-0">*</span>
                              <span className="text-foreground/80 leading-relaxed">{text}</span>
                            </div>
                          );
                        }

                        const isNumbered = /^\d+[.)]\s/.test(line.trimStart());
                        if (isNumbered) {
                          const match = line.trimStart().match(/^(\d+)[.)]\s(.*)/);
                          if (match) {
                            return (
                              <div key={i} className="flex gap-2 ml-2 mb-1">
                                <span className="text-violet-400 font-mono text-xs mt-1 shrink-0 w-5 text-right">{match[1]}.</span>
                                <span className="text-foreground/80 leading-relaxed">{match[2]}</span>
                              </div>
                            );
                          }
                        }

                        return (
                          <p key={i} className="text-foreground/80 leading-relaxed mb-2">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                  {viewingHistoryItem && (
                    <button
                      onClick={() => {
                        setViewingHistoryItem(null);
                        setOutput("");
                      }}
                      className="btn-outline text-sm gap-2"
                    >
                      <X className="w-4 h-4" />
                      Close saved result
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <motion.div {...fade} transition={{ delay: 0.3 }} className="sticky top-28">
              <div className="glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => setHistoryOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-violet-500/5 transition-colors"
                >
                  <span className="font-display font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-400" />
                    Recent Creations
                    {history.length > 0 && (
                      <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">
                        {history.length}
                      </span>
                    )}
                  </span>
                  {historyOpen ? (
                    <ChevronUp className="w-4 h-4 text-foreground/40" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-foreground/40" />
                  )}
                </button>

                <AnimatePresence>
                  {historyOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 space-y-2">
                        {history.length === 0 ? (
                          <p className="text-sm text-foreground/40 py-4 text-center">
                            No creations yet. Generate your first piece of content above.
                          </p>
                        ) : (
                          <>
                            {history.map((item) => {
                              const ct = CONTENT_TYPES.find((c) => c.id === item.contentType);
                              const Icon = ct?.icon ?? FileText;
                              const isViewing = viewingHistoryItem?.id === item.id;
                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className={`group rounded-xl p-3 transition-all cursor-pointer ${
                                    isViewing
                                      ? "bg-violet-500/15 ring-1 ring-violet-500/30"
                                      : "hover:bg-violet-500/5"
                                  }`}
                                  onClick={() => restoreHistoryItem(item)}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ct?.color ?? "from-gray-400 to-gray-600"} flex items-center justify-center shrink-0`}>
                                      <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-foreground/80 truncate">
                                        {item.topic}
                                      </p>
                                      <p className="text-[10px] text-foreground/40 mt-0.5">
                                        {contentTypeLabel(item.contentType)} / {formatTimestamp(item.createdAt)}
                                      </p>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeHistoryItem(item.id);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 transition-all"
                                      aria-label="Remove from history"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-foreground/30 mt-1.5 line-clamp-2 leading-relaxed">
                                    {item.content.slice(0, 120)}...
                                  </p>
                                </motion.div>
                              );
                            })}
                            <button
                              onClick={clearHistory}
                              className="w-full mt-2 py-2 text-xs text-red-400/60 hover:text-red-400 transition-colors flex items-center justify-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Clear all history
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="glass rounded-2xl p-5 mt-4 space-y-3">
                <h3 className="font-display font-semibold text-sm">Quick Tips</h3>
                <ul className="space-y-2 text-xs text-foreground/50">
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5 shrink-0">*</span>
                    <span>Be specific with your topic for more focused results</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5 shrink-0">*</span>
                    <span>Use additional context to mention your target audience or brand voice</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5 shrink-0">*</span>
                    <span>Try different tone and content type combinations for variety</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5 shrink-0">*</span>
                    <span>Your last 5 creations are saved locally for easy reference</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
