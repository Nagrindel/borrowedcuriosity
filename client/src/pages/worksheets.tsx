import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Loader2,
  Download,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trash2,
  Clock,
  Settings,
  RotateCcw,
  Copy,
  Check,
  BookOpen,
  MessageCircle,
  PenLine,
  Users,
  Compass,
} from "lucide-react";

interface WorksheetHistoryEntry {
  id: string;
  type: string;
  topic: string;
  ageGroup: string;
  tone: string;
  questionCount: number;
  content: string;
  createdAt: number;
}

const CONTENT_TYPES = [
  { id: "worksheet", label: "Worksheet", icon: <FileText className="w-4 h-4" /> },
  { id: "questionnaire", label: "Questionnaire", icon: <BookOpen className="w-4 h-4" /> },
  { id: "journal-prompts", label: "Journal Prompts", icon: <PenLine className="w-4 h-4" /> },
  { id: "reflection", label: "Reflection Exercise", icon: <Compass className="w-4 h-4" /> },
  { id: "discussion-guide", label: "Discussion Guide", icon: <MessageCircle className="w-4 h-4" /> },
];

const QUICK_TOPICS = [
  "Numerology Basics",
  "Crystal Healing",
  "Chakra Balance",
  "Mindfulness",
  "Self-Discovery",
  "Gratitude Practice",
  "Shadow Work",
  "Manifestation",
  "Sacred Geometry",
  "Meditation Techniques",
  "Energy Work",
  "Moon Phases",
];

const AGE_GROUPS = [
  { id: "children", label: "Children (8-12)" },
  { id: "teens", label: "Teens (13-17)" },
  { id: "adults", label: "Adults (18+)" },
  { id: "all-ages", label: "All Ages" },
];

const TONES = [
  { id: "playful", label: "Playful" },
  { id: "thoughtful", label: "Thoughtful" },
  { id: "academic", label: "Academic" },
  { id: "conversational", label: "Conversational" },
  { id: "poetic", label: "Poetic" },
];

const QUESTION_COUNTS = [5, 10, 15, 20];

const HISTORY_KEY = "borrowed-curiosity-worksheets-history";
const MAX_HISTORY = 5;

function parseContent(raw: string): React.ReactNode[] {
  const lines = raw.split("\n");
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={i} className="font-display text-xl font-bold mt-6 mb-3 text-gradient">
          {applyInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={i} className="font-display text-lg font-semibold mt-5 mb-2">
          {applyInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("# ")) {
      nodes.push(
        <h1 key={i} className="font-display text-2xl font-bold mt-4 mb-3 text-gradient">
          {applyInline(line.slice(2))}
        </h1>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      nodes.push(
        <li key={i} className="ml-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300 list-disc list-inside">
          {applyInline(line.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        nodes.push(
          <div key={i} className="flex gap-3 items-start my-1.5">
            <span className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center text-xs font-bold text-brand-400 flex-shrink-0 mt-0.5">
              {match[1]}
            </span>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 flex-1">
              {applyInline(match[2])}
            </p>
          </div>
        );
      }
    } else if (line.trim() === "") {
      nodes.push(<div key={i} className="h-2" />);
    } else {
      nodes.push(
        <p key={i} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 my-1">
          {applyInline(line)}
        </p>
      );
    }
  }

  return nodes;
}

function applyInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="font-semibold text-gray-900 dark:text-gray-100">
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function loadHistory(): WorksheetHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WorksheetHistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(entries: WorksheetHistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

export default function Worksheets() {
  const [contentType, setContentType] = useState("worksheet");
  const [topic, setTopic] = useState("");
  const [ageGroup, setAgeGroup] = useState("adults");
  const [tone, setTone] = useState("thoughtful");
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [history, setHistory] = useState<WorksheetHistoryEntry[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const generate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch("/api/worksheets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
          topic: topic.trim(),
          ageGroup,
          tone,
          questionCount,
        }),
      });

      const text = await res.text();
      let data: { content?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response. Please try again.");
      }
      if (!res.ok) throw new Error(data.error || "Request failed");
      if (!data.content) throw new Error("No content was generated. Please try again.");

      setResult(data.content);

      const entry: WorksheetHistoryEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        type: contentType,
        topic: topic.trim(),
        ageGroup,
        tone,
        questionCount,
        content: data.content,
        createdAt: Date.now(),
      };
      const updated = [entry, ...history].slice(0, MAX_HISTORY);
      setHistory(updated);
      saveHistory(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [topic, contentType, ageGroup, tone, questionCount, history]);

  const downloadWorksheet = useCallback(
    (content: string, worksheetTopic: string, worksheetType: string) => {
      const header = [
        "Borrowed Curiosity",
        `Type: ${CONTENT_TYPES.find((t) => t.id === worksheetType)?.label || worksheetType}`,
        `Topic: ${worksheetTopic}`,
        `Age Group: ${AGE_GROUPS.find((a) => a.id === ageGroup)?.label || ageGroup}`,
        `Tone: ${TONES.find((t) => t.id === tone)?.label || tone}`,
        "=".repeat(50),
        "",
      ].join("\n");

      const blob = new Blob([header + content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeTopic = worksheetTopic.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
      a.download = `${worksheetType}-${safeTopic}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [ageGroup, tone]
  );

  const copyToClipboard = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may not be available */
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  const removeHistoryEntry = useCallback(
    (id: string) => {
      const updated = history.filter((h) => h.id !== id);
      setHistory(updated);
      saveHistory(updated);
    },
    [history]
  );

  const resetForm = useCallback(() => {
    setResult(null);
    setError(null);
    setCopied(false);
  }, []);

  const typeMeta = CONTENT_TYPES.find((t) => t.id === contentType);

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="section-padding min-h-[35vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-400 mb-6">
              <FileText className="w-3.5 h-3.5" /> Worksheet Generator
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5">
              Create <span className="text-gradient">Worksheets</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Generate worksheets, journal prompts, discussion guides, and more.
              Tailored to your topic, audience, and style.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Result toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold">
                    {typeMeta?.label || "Worksheet"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {topic} / {AGE_GROUPS.find((a) => a.id === ageGroup)?.label} /{" "}
                    {TONES.find((t) => t.id === tone)?.label}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(result)}
                    className="btn-outline flex items-center gap-2 text-sm"
                    aria-label="Copy content"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={() => downloadWorksheet(result, topic, contentType)}
                    className="btn-outline flex items-center gap-2 text-sm"
                    aria-label="Download worksheet"
                  >
                    <Download className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={resetForm}
                    className="btn-outline flex items-center gap-2 text-sm"
                    aria-label="Create new worksheet"
                  >
                    <RotateCcw className="w-4 h-4" /> New
                  </button>
                </div>
              </div>

              {/* Rendered content */}
              <div className="glass rounded-2xl p-6 sm:p-8">{parseContent(result)}</div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Content Type Selector */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-4">Content Type</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {CONTENT_TYPES.map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => setContentType(ct.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        contentType === ct.id
                          ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                          : "glass hover:bg-brand-500/10"
                      }`}
                    >
                      {ct.icon} {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Input */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-3">Topic</h3>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter any topic, spiritual or otherwise..."
                  className="w-full glass rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none mb-4"
                />
                <p className="text-xs text-gray-500 mb-3">Or choose a quick topic:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TOPICS.map((qt) => (
                    <button
                      key={qt}
                      onClick={() => setTopic(qt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        topic === qt
                          ? "bg-brand-500 text-white"
                          : "glass hover:bg-brand-500/10"
                      }`}
                    >
                      {qt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Panel */}
              <div className="glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-brand-400" />
                    <h3 className="font-display font-semibold">Settings</h3>
                    <span className="text-xs text-gray-500 ml-2">
                      {AGE_GROUPS.find((a) => a.id === ageGroup)?.label} /{" "}
                      {TONES.find((t) => t.id === tone)?.label} / {questionCount} prompts
                    </span>
                  </div>
                  {settingsOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {settingsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-5">
                        {/* Age Group */}
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-2 block">
                            Age Group
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {AGE_GROUPS.map((ag) => (
                              <button
                                key={ag.id}
                                onClick={() => setAgeGroup(ag.id)}
                                className={`px-4 py-2 rounded-full text-sm transition-all ${
                                  ageGroup === ag.id
                                    ? "bg-brand-500 text-white"
                                    : "glass hover:bg-brand-500/10"
                                }`}
                              >
                                {ag.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Tone */}
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-2 block">
                            Tone
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {TONES.map((t) => (
                              <button
                                key={t.id}
                                onClick={() => setTone(t.id)}
                                className={`px-4 py-2 rounded-full text-sm transition-all ${
                                  tone === t.id
                                    ? "bg-brand-500 text-white"
                                    : "glass hover:bg-brand-500/10"
                                }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Question Count */}
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-2 block">
                            Question / Prompt Count
                          </label>
                          <div className="flex gap-2">
                            {QUESTION_COUNTS.map((qc) => (
                              <button
                                key={qc}
                                onClick={() => setQuestionCount(qc)}
                                className={`w-14 py-2 rounded-xl text-sm font-medium transition-all text-center ${
                                  questionCount === qc
                                    ? "bg-brand-500 text-white"
                                    : "glass hover:bg-brand-500/10"
                                }`}
                              >
                                {qc}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 text-center bg-red-500/10 rounded-lg py-2 px-4"
                >
                  {error}
                </motion.p>
              )}

              {/* Generate Button */}
              <button
                onClick={generate}
                disabled={loading || !topic.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Crafting your worksheet...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Generate{" "}
                    {typeMeta?.label || "Worksheet"}
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Section */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <h3 className="font-display font-semibold text-sm text-gray-400">
                  Recent Worksheets
                </h3>
              </div>
              <button
                onClick={clearHistory}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear All
              </button>
            </div>

            <div className="space-y-2">
              {history.map((entry) => {
                const isExpanded = expandedHistory === entry.id;
                const entryTypeMeta = CONTENT_TYPES.find((t) => t.id === entry.type);

                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedHistory(isExpanded ? null : entry.id)
                      }
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-500/5 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                          {entryTypeMeta?.icon || (
                            <FileText className="w-4 h-4 text-brand-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {entry.topic}
                          </p>
                          <p className="text-xs text-gray-500">
                            {entryTypeMeta?.label || entry.type} /{" "}
                            {formatTimestamp(entry.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHistoryEntry(entry.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          aria-label="Remove from history"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-400" />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-white/5">
                            <div className="flex gap-2 mt-3 mb-4">
                              <button
                                onClick={() =>
                                  downloadWorksheet(
                                    entry.content,
                                    entry.topic,
                                    entry.type
                                  )
                                }
                                className="btn-outline flex items-center gap-1.5 text-xs py-1.5 px-3"
                              >
                                <Download className="w-3.5 h-3.5" /> Download
                              </button>
                              <button
                                onClick={() => copyToClipboard(entry.content)}
                                className="btn-outline flex items-center gap-1.5 text-xs py-1.5 px-3"
                              >
                                <Copy className="w-3.5 h-3.5" /> Copy
                              </button>
                              <button
                                onClick={() => {
                                  setTopic(entry.topic);
                                  setContentType(entry.type);
                                  setAgeGroup(entry.ageGroup);
                                  setTone(entry.tone);
                                  setQuestionCount(entry.questionCount);
                                  setResult(null);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="btn-outline flex items-center gap-1.5 text-xs py-1.5 px-3"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Regenerate
                              </button>
                            </div>
                            <div className="glass-card rounded-xl p-4 max-h-80 overflow-y-auto text-sm">
                              {parseContent(entry.content)}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state hint */}
        {!result && history.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="glass rounded-2xl p-8 max-w-md mx-auto">
              <Users className="w-8 h-8 text-brand-400 mx-auto mb-3 opacity-50" />
              <p className="text-sm text-gray-500 leading-relaxed">
                Choose a content type, enter a topic, and hit generate.
                Your recent worksheets will appear here for easy access.
              </p>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}
