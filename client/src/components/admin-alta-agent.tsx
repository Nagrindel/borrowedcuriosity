import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  RotateCcw,
  FileText,
  ShoppingBag,
  Image,
  BookOpen,
  Layers,
  BarChart3,
  Check,
  X,
  Loader2,
  Zap,
  Terminal,
  Package,
  Trash2,
  PenLine,
  Plus,
  Sparkles,
  RefreshCcw,
} from "lucide-react";
import { useAdmin } from "../context/admin";

interface ActionEvent {
  type: "action";
  tool: string;
  args: Record<string, any>;
  result: { success: boolean; data?: any; error?: string };
}

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  actions?: ActionEvent[];
}

const TOOL_META: Record<string, { icon: typeof FileText; label: string; color: string }> = {
  create_blog_post: { icon: Plus, label: "Create Blog Post", color: "text-emerald-400" },
  update_blog_post: { icon: PenLine, label: "Update Blog Post", color: "text-amber-400" },
  delete_blog_post: { icon: Trash2, label: "Delete Blog Post", color: "text-red-400" },
  list_blog_posts: { icon: FileText, label: "List Blog Posts", color: "text-violet-400" },
  create_product: { icon: Plus, label: "Create Product", color: "text-emerald-400" },
  update_product: { icon: PenLine, label: "Update Product", color: "text-amber-400" },
  delete_product: { icon: Trash2, label: "Delete Product", color: "text-red-400" },
  list_products: { icon: ShoppingBag, label: "List Products", color: "text-violet-400" },
  create_gallery_item: { icon: Plus, label: "Create Gallery Item", color: "text-emerald-400" },
  delete_gallery_item: { icon: Trash2, label: "Delete Gallery Item", color: "text-red-400" },
  list_gallery: { icon: Image, label: "List Gallery", color: "text-violet-400" },
  create_course: { icon: Plus, label: "Create Course", color: "text-emerald-400" },
  add_lesson: { icon: Plus, label: "Add Lesson", color: "text-emerald-400" },
  list_courses: { icon: BookOpen, label: "List Courses", color: "text-violet-400" },
  create_thread: { icon: Plus, label: "Create Thread", color: "text-emerald-400" },
  add_thread_card: { icon: Plus, label: "Add Thread Card", color: "text-emerald-400" },
  list_orders: { icon: Package, label: "List Orders", color: "text-violet-400" },
  update_order_status: { icon: PenLine, label: "Update Order", color: "text-amber-400" },
  generate_report: { icon: Sparkles, label: "Generate Report", color: "text-brand-400" },
  sync_orders: { icon: RefreshCcw, label: "Sync Orders", color: "text-cyan-400" },
  import_stripe_orders: { icon: Package, label: "Import Stripe Orders", color: "text-green-400" },
  get_site_stats: { icon: BarChart3, label: "Site Stats", color: "text-cyan-400" },
};

const QUICK_ACTIONS = [
  { icon: BarChart3, text: "Show me site stats" },
  { icon: Package, text: "Show all orders" },
  { icon: RefreshCcw, text: "Sync orders with Stripe" },
  { icon: FileText, text: "List all blog posts" },
  { icon: ShoppingBag, text: "List all products" },
  { icon: Sparkles, text: "Show orders needing reports" },
];

function ActionCard({ action }: { action: ActionEvent }) {
  const meta = TOOL_META[action.tool] || { icon: Terminal, label: action.tool, color: "text-gray-400" };
  const Icon = meta.icon;
  const isSuccess = action.result?.success;
  const args = action.args && typeof action.args === "object" ? action.args : {};

  return (
    <div className={`rounded-lg border p-3 text-sm ${isSuccess ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${meta.color}`} />
        <span className="font-medium text-white">{meta.label}</span>
        {isSuccess ? (
          <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
        ) : (
          <X className="w-3.5 h-3.5 text-red-400 ml-auto" />
        )}
      </div>

      {Object.keys(args).length > 0 && (
        <div className="mb-2">
          {args.title && (
            <span className="text-gray-300 text-xs">"{args.title}"</span>
          )}
          {args.name && !args.title && (
            <span className="text-gray-300 text-xs">"{args.name}"</span>
          )}
          {args.topic && !args.title && (
            <span className="text-gray-300 text-xs">"{args.topic}"</span>
          )}
          {args.orderId && !args.title && !args.name && (
            <span className="text-gray-300 text-xs">Order #{args.orderId}</span>
          )}
          {args.price !== undefined && (
            <span className="text-gray-400 text-xs ml-2">${args.price}</span>
          )}
          {args.filter && (
            <span className="text-gray-400 text-xs ml-2">filter: {args.filter}</span>
          )}
          {args.id !== undefined && !args.title && !args.name && !args.orderId && (
            <span className="text-gray-400 text-xs">ID: {args.id}</span>
          )}
        </div>
      )}

      {isSuccess && action.result.data?.message && (
        <p className="text-xs text-emerald-300/80">{action.result.data.message}</p>
      )}
      {!isSuccess && action.result?.error && (
        <p className="text-xs text-red-300/80">{action.result.error}</p>
      )}

      {isSuccess && action.result.data?.count !== undefined && (
        <p className="text-xs text-gray-400 mt-1">{action.result.data.count} items found</p>
      )}
    </div>
  );
}

function safeStr(val: unknown): string {
  if (val == null) return "";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function DataTable({ data }: { data: any }) {
  try {
    if (!data || typeof data !== "object") return null;

    const isStatsLike = !Array.isArray(data) &&
      Object.values(data).some((v: any) => typeof v === "number" || typeof v === "string") &&
      !data.posts && !data.products && !data.orders && !data.items && !data.courses;

    if (isStatsLike) {
      const safe = data && typeof data === "object" ? data : {};
      const entries = Object.entries(safe).filter(
        ([k, v]) => (typeof v === "number" || typeof v === "string") && k !== "count" && k !== "totalInDB" && k !== "filter",
      );
      if (entries.length === 0) return null;
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {entries.map(([key, val]) => (
            <div key={key} className="rounded-lg bg-white/5 border border-white/10 p-2.5 text-center">
              <div className="text-lg font-display text-white">{safeStr(val)}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">{key.replace(/([A-Z])/g, " $1").trim()}</div>
            </div>
          ))}
        </div>
      );
    }

    const items = data.posts || data.products || data.orders || data.items || data.courses;
    if (!Array.isArray(items) || items.length === 0) return null;

    const validItems = items.filter((it: any) => it != null && typeof it === "object");
    if (validItems.length === 0) return null;

    const HIDDEN = new Set([
      "content", "gradient", "description", "excerpt", "mediaUrl", "downloadUrl",
      "imageUrl", "shippingAddress", "customerNotes", "generatedReport", "customerPhone",
      "customerDetails", "stripeSessionId", "stripePaymentIntentId", "paymentMethod",
    ]);

    const firstItem = validItems[0];
    let cols: string[];
    try {
      cols = Object.keys(firstItem).filter(k => !HIDDEN.has(k));
    } catch {
      return null;
    }
    if (cols.length === 0) return null;

    return (
      <div className="mt-2 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {cols.map(c => (
                <th key={c} className="px-3 py-2 text-left text-gray-400 font-medium uppercase tracking-wider">
                  {c.replace(/([A-Z])/g, " $1").trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {validItems.slice(0, 25).map((item: any, i: number) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                {cols.map(c => {
                  const val = item?.[c];
                  return (
                    <td key={c} className="px-3 py-2 text-gray-300 max-w-[200px] truncate">
                      {safeStr(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {validItems.length > 25 && (
          <div className="px-3 py-2 text-xs text-gray-500 text-center bg-white/5">
            Showing 25 of {validItems.length}
          </div>
        )}
      </div>
    );
  } catch {
    return (
      <div className="mt-2 text-xs text-gray-500 italic p-2">Data returned but could not be displayed as a table.</div>
    );
  }
}

const GREETING: ChatMessage = {
  id: "greeting",
  role: "agent",
  content: "Hey Nicole! I'm Alta Agent, your content manager. I can create blog posts, add products, manage courses, handle orders, and more. Just tell me what you need.\n\nTry something like:\n- \"Create a blog post about crystal healing\"\n- \"Add a new salve product for $28\"\n- \"Show me all orders\"\n- \"Create a course about numerology basics with 3 lessons\"",
};

export default function AdminAltaAgent() {
  const { adminFetch, token } = useAdmin();
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: text.trim() };
    const prevMessages = messages.filter(m => m.id !== "greeting");
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const agentId = `agent-${Date.now()}`;
    setMessages(prev => [...prev, { id: agentId, role: "agent", content: "", actions: [] }]);

    try {
      const apiMessages = [...prevMessages, userMsg].map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

      const res = await fetch("/api/admin/alta-agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token || "",
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Something went wrong" }));
        setMessages(prev =>
          prev.map(m => m.id === agentId ? { ...m, content: err.error || "Alta Agent had a moment." } : m),
        );
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let actions: ActionEvent[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "action") {
                actions = [...actions, parsed as ActionEvent];
                setMessages(prev =>
                  prev.map(m => m.id === agentId ? { ...m, actions: [...actions] } : m),
                );
              } else if (parsed.type === "content" && parsed.content) {
                accumulated += parsed.content;
                const snap = accumulated;
                const actionsSnap = [...actions];
                setMessages(prev =>
                  prev.map(m => m.id === agentId ? { ...m, content: snap, actions: actionsSnap } : m),
                );
              } else if (parsed.type === "error") {
                accumulated += `\n\nError: ${parsed.error}`;
                const snap = accumulated;
                setMessages(prev =>
                  prev.map(m => m.id === agentId ? { ...m, content: snap } : m),
                );
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === agentId ? { ...m, content: "Lost connection. Try sending that again." } : m),
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
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-sm text-white">Alta Agent</p>
            <p className="text-[11px] flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Content Manager
            </p>
          </div>
        </div>
        {messages.length > 2 && (
          <button
            onClick={handleRestart}
            className="text-xs text-gray-500 hover:text-violet-400 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> New chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "agent"
                    ? "bg-violet-500/10 border border-violet-500/15"
                    : "bg-white/8 border border-white/8"
                }`}
              >
                {msg.actions && msg.actions.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {msg.actions.map((action, i) => (
                      <ActionCard key={i} action={action} />
                    ))}
                    {msg.actions
                      .filter(a => a.result?.success && a.result?.data)
                      .map((a, i) => (
                        <DataTable key={`dt-${i}`} data={a.result.data} />
                      ))}
                  </div>
                )}

                {msg.content ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : msg.actions && msg.actions.length > 0 ? null : (
                  <span className="flex gap-1.5">
                    <span className="w-2 h-2 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {messages.length === 1 && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-2 pt-2"
          >
            {QUICK_ACTIONS.map((q, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                onClick={() => sendMessage(q.text)}
                className="text-left px-4 py-3 rounded-xl border border-white/8 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-sm flex items-center gap-3 group"
              >
                <q.icon className="w-4 h-4 text-violet-500/60 group-hover:text-violet-400 shrink-0" />
                <span className="text-gray-400 group-hover:text-gray-200 transition-colors">
                  {q.text}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell Alta Agent what to do..."
            disabled={isStreaming}
            rows={1}
            className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-violet-500/40 transition-colors placeholder:text-gray-600 disabled:opacity-50"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 disabled:opacity-30 hover:opacity-90 transition-opacity"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
