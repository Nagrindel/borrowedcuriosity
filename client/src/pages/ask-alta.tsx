import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Calculator, FileText, Sparkles, BookOpen, ShoppingBag, RotateCcw, Zap, AlertCircle, Gem, Hash } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "alta";
  content: string;
}

const QUICK_STARTERS = [
  { icon: Zap, text: "What can my birthday tell me about myself?" },
  { icon: Calculator, text: "How does numerology actually work?" },
  { icon: Sparkles, text: "What's a Life Path number?" },
  { icon: BookOpen, text: "I want to learn about myself" },
];

const GREETING: ChatMessage = {
  id: "greeting",
  role: "alta",
  content: "Hey! I'm Alta, your numerology guide and general curiosity enabler. I can calculate your numbers, explain what they mean, or just chat about whatever's on your mind. Give me your birthday and full name and I'll blow your mind. Or just ask me anything.",
};

const NUMEROLOGY_CALCULATOR_URL = "/calculator";

export default function AskAlta() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/alta/status")
      .then(r => r.json())
      .then(d => setConnected(d.connected))
      .catch(() => setConnected(false));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: text.trim() };
    const history = [...messages.filter(m => m.id !== "greeting"), userMsg];
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const altaId = `alta-${Date.now()}`;
    setMessages(prev => [...prev, { id: altaId, role: "alta", content: "" }]);

    try {
      const apiMessages = history.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

      const res = await fetch("/api/alta/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Something went wrong" }));
        setMessages(prev =>
          prev.map(m => m.id === altaId ? { ...m, content: err.error || "Alta had a moment. Try again." } : m)
        );
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  accumulated += parsed.content;
                  const snapshot = accumulated;
                  setMessages(prev =>
                    prev.map(m => m.id === altaId ? { ...m, content: snapshot } : m)
                  );
                }
              } catch {}
            }
          }
        }
      }
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === altaId ? { ...m, content: "Lost connection for a second. Try sending that again." } : m)
      );
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleRestart = () => {
    setMessages([GREETING]);
    setInput("");
    setIsStreaming(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <img
            src="/logo.png"
            alt="Borrowed Curiosity"
            className="w-16 h-16 object-contain mx-auto mb-5 dark:mix-blend-screen dark:brightness-[2.5] dark:drop-shadow-[0_0_6px_rgba(139,92,246,0.4)] mix-blend-multiply brightness-0 dark:brightness-[2.5]"
          />
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
            Ask <span className="text-gradient">Alta</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
            Your personal numerology guide. Ask anything, or give me your birthday and name for a reading.
          </p>
        </motion.div>

        {connected === false && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400">Alta's brain is offline</p>
              <p className="text-xs text-gray-500 mt-1">The GROQ_API_KEY environment variable needs to be set. Once connected, Alta can have real conversations and calculate numerology readings.</p>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl overflow-hidden flex flex-col" style={{ height: "min(600px, 65vh)" }}>

          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Alta"
                className="w-8 h-8 object-contain dark:mix-blend-screen dark:brightness-[2.5] mix-blend-multiply brightness-0 dark:brightness-[2.5]"
              />
              <div>
                <p className="font-medium text-sm">Alta</p>
                <p className={`text-[11px] flex items-center gap-1 ${connected ? "text-green-400" : "text-gray-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-gray-500"}`} />
                  {connected ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            {messages.length > 2 && (
              <button onClick={handleRestart} className="text-xs text-gray-500 hover:text-brand-400 transition-colors flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> New chat
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "alta"
                      ? "bg-brand-500/10 border border-brand-500/15"
                      : "bg-white/8 border border-white/8"
                  }`}>
                    {msg.content || (
                      <span className="flex gap-1.5">
                        <span className="w-2 h-2 bg-brand-400/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-brand-400/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-brand-400/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {messages.length === 1 && !isStreaming && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {QUICK_STARTERS.map((q, i) => (
                  <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    onClick={() => sendMessage(q.text)}
                    className="text-left px-4 py-3 rounded-xl border border-white/8 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all text-sm flex items-center gap-3 group">
                    <q.icon className="w-4 h-4 text-brand-500/60 group-hover:text-brand-400 shrink-0" />
                    <span className="text-gray-400 group-hover:text-gray-200 transition-colors">{q.text}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {messages.length > 2 && !isStreaming && (
            <div className="px-5 pb-2 flex flex-wrap gap-2">
              <a href={NUMEROLOGY_CALCULATOR_URL}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/10 transition-colors text-brand-400">
                <Calculator className="w-3 h-3" /> Free Calculator
              </a>
              <a href="/store"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors text-amber-400">
                <ShoppingBag className="w-3 h-3" /> Store
              </a>
              <a href="/courses"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors text-rose-400">
                <Sparkles className="w-3 h-3" /> Courses
              </a>
              <a href="/blog"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors text-cyan-400">
                <FileText className="w-3 h-3" /> Blog
              </a>
              <a href="/crystals"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors text-purple-400">
                <Gem className="w-3 h-3" /> Crystals
              </a>
              <a href="/gematria"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 transition-colors text-teal-400">
                <Hash className="w-3 h-3" /> Gematria
              </a>
            </div>
          )}

          <div className="p-3 border-t border-white/5">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={connected ? "Ask Alta anything..." : "Alta is offline (needs GROQ_API_KEY)"}
                disabled={!connected || isStreaming}
                rows={1}
                className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-brand-500/40 transition-colors placeholder:text-gray-600 disabled:opacity-50"
                style={{ maxHeight: "120px" }}
                onInput={e => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming || !connected}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shrink-0 disabled:opacity-30 hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
