import { useState, useEffect } from "react";
import { useAdmin } from "@/context/admin";
import ImageUpload from "@/components/image-upload";
import {
  LayoutDashboard, FileText, ShoppingBag, Image, GraduationCap,
  MessageCircle as ThreadIcon, Users, Package, MessageSquare,
  Plus, Trash2, Pencil, X, Save, LogOut, Lock, Eye, EyeOff,
  Loader2, ChevronDown, ChevronUp, MapPin, Phone, Truck, ClipboardList
} from "lucide-react";

type Tab = "dashboard" | "blog" | "products" | "gallery" | "courses" | "threads" | "subscribers" | "orders" | "comments";

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "blog", label: "Blog Posts", icon: FileText },
  { id: "products", label: "Products", icon: ShoppingBag },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "courses", label: "Courses", icon: GraduationCap },
  { id: "threads", label: "Threads", icon: ThreadIcon },
  { id: "subscribers", label: "Subscribers", icon: Users },
  { id: "orders", label: "Orders", icon: Package },
  { id: "comments", label: "Comments", icon: MessageSquare },
];

const GRADIENTS = [
  "from-brand-400 to-brand-700", "from-violet-400 to-purple-600", "from-amber-400 to-orange-600",
  "from-emerald-500 to-teal-700", "from-rose-400 to-pink-600", "from-slate-400 to-indigo-600",
  "from-cyan-500 to-blue-600", "from-brand-500 to-violet-600", "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

export default function Admin() {
  const { isAuthenticated, login, logout, adminFetch } = useAdmin();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loginErr, setLoginErr] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sideOpen, setSideOpen] = useState(true);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-card max-w-sm w-full">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-brand-500" />
            <h1 className="font-display text-2xl font-bold">Admin Login</h1>
          </div>
          <form onSubmit={async e => {
            e.preventDefault();
            setLoginErr("");
            const ok = await login(password);
            if (!ok) setLoginErr("Wrong password");
          }} className="space-y-4">
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Admin password" autoFocus
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-brand-500/50 outline-none text-sm pr-10" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {loginErr && <p className="text-red-400 text-xs">{loginErr}</p>}
            <button type="submit" className="btn-primary w-full">Log In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`${sideOpen ? "w-56" : "w-14"} shrink-0 glass-strong border-r border-white/5 transition-all duration-200 flex flex-col`}>
        <div className="p-3 flex items-center justify-between border-b border-white/5">
          {sideOpen && <span className="font-display font-bold text-sm text-brand-500">Admin Panel</span>}
          <button onClick={() => setSideOpen(!sideOpen)} className="p-1.5 rounded-lg hover:bg-brand-500/10">
            {sideOpen ? <ChevronDown className="w-4 h-4 rotate-90" /> : <ChevronUp className="w-4 h-4 -rotate-90" />}
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id ? "bg-brand-500/15 text-brand-400" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}>
              <t.icon className="w-4 h-4 shrink-0" />
              {sideOpen && <span>{t.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-white/5">
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4 shrink-0" />
            {sideOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {activeTab === "dashboard" && <DashboardTab adminFetch={adminFetch} />}
        {activeTab === "blog" && <BlogTab adminFetch={adminFetch} />}
        {activeTab === "products" && <ProductsTab adminFetch={adminFetch} />}
        {activeTab === "gallery" && <GalleryTab adminFetch={adminFetch} />}
        {activeTab === "courses" && <CoursesTab adminFetch={adminFetch} />}
        {activeTab === "threads" && <ThreadsTab adminFetch={adminFetch} />}
        {activeTab === "subscribers" && <SubscribersTab adminFetch={adminFetch} />}
        {activeTab === "orders" && <OrdersTab adminFetch={adminFetch} />}
        {activeTab === "comments" && <CommentsTab adminFetch={adminFetch} />}
      </main>
    </div>
  );
}

// ────────────────────────────────────────────
// Dashboard Tab
// ────────────────────────────────────────────
function DashboardTab({ adminFetch }: { adminFetch: any }) {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { adminFetch("/api/admin/stats").then(setStats); }, []);

  if (!stats) return <Loading />;

  const cards = [
    { label: "Blog Posts", value: stats.postCount, color: "text-violet-400" },
    { label: "Products", value: stats.productCount, color: "text-amber-400" },
    { label: "Gallery Items", value: stats.galleryCount, color: "text-emerald-400" },
    { label: "Courses", value: stats.courseCount, color: "text-rose-400" },
    { label: "Threads", value: stats.threadCount, color: "text-cyan-400" },
    { label: "Subscribers", value: stats.subCount, color: "text-brand-400" },
    { label: "Orders", value: stats.orderCount, color: "text-orange-400" },
    { label: "Comments", value: stats.commentCount, color: "text-pink-400" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="glass rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`font-display text-3xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Blog Tab
// ────────────────────────────────────────────
function BlogTab({ adminFetch }: { adminFetch: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const load = () => { setLoading(true); adminFetch("/api/admin/blog").then((d: any) => { setPosts(d); setLoading(false); }); };
  useEffect(load, []);

  const empty = { title: "", slug: "", excerpt: "", content: "", category: "Numerology", readingTime: "5 min read", gradient: GRADIENTS[0], imageUrl: null, published: true };

  const save = async (data: any, id?: number) => {
    if (id) await adminFetch(`/api/admin/blog/${id}`, { method: "PUT", body: JSON.stringify(data) });
    else await adminFetch("/api/admin/blog", { method: "POST", body: JSON.stringify(data) });
    setEditing(null); setCreating(false); load();
  };

  const del = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    await adminFetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Blog Posts ({posts.length})</h1>
        <button onClick={() => { setCreating(true); setEditing(empty); }} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Post</button>
      </div>
      {(editing || creating) && (
        <BlogForm data={editing} onSave={d => save(d, creating ? undefined : editing.id)} onCancel={() => { setEditing(null); setCreating(false); }} />
      )}
      <div className="space-y-2">
        {posts.map(p => (
          <div key={p.id} className="glass rounded-xl p-4 flex items-center gap-4">
            {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" /> : <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.gradient} shrink-0`} />}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{p.title}</p>
              <p className="text-xs text-gray-500">{p.category} &middot; {p.readingTime} &middot; {p.published ? "Published" : "Draft"}</p>
            </div>
            <button onClick={() => { setEditing(p); setCreating(false); }} className="p-2 rounded-lg hover:bg-brand-500/10"><Pencil className="w-4 h-4 text-gray-400" /></button>
            <button onClick={() => del(p.id)} className="p-2 rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4 text-red-400" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlogForm({ data, onSave, onCancel }: { data: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState(data);
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div className="glass rounded-xl p-5 mb-6 space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-display font-semibold">{data.id ? "Edit Post" : "New Post"}</h3>
        <button onClick={onCancel}><X className="w-5 h-5 text-gray-400" /></button>
      </div>
      <ImageUpload value={form.imageUrl} onChange={url => set("imageUrl", url)} label="Cover Image" />
      <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Title" className="admin-input" />
      <input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="slug-like-this" className="admin-input" />
      <input value={form.excerpt} onChange={e => set("excerpt", e.target.value)} placeholder="Short excerpt" className="admin-input" />
      <textarea value={form.content} onChange={e => set("content", e.target.value)} placeholder="Full content (paragraphs separated by blank lines)" rows={8} className="admin-input resize-y" />
      <div className="grid grid-cols-2 gap-3">
        <input value={form.category} onChange={e => set("category", e.target.value)} placeholder="Category" className="admin-input" />
        <input value={form.readingTime} onChange={e => set("readingTime", e.target.value)} placeholder="5 min read" className="admin-input" />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Fallback Gradient (used if no image)</label>
        <div className="flex flex-wrap gap-2">
          {GRADIENTS.map(g => (
            <button key={g} onClick={() => set("gradient", g)} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} ${form.gradient === g ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-gray-900" : ""}`} />
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} className="accent-brand-500" />
        Published
      </label>
      <button onClick={() => onSave(form)} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
    </div>
  );
}

// ────────────────────────────────────────────
// Products Tab
// ────────────────────────────────────────────
function ProductsTab({ adminFetch }: { adminFetch: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const load = () => { setLoading(true); adminFetch("/api/admin/products").then((d: any) => { setItems(d); setLoading(false); }); };
  useEffect(load, []);

  const empty = { name: "", description: "", price: 0, category: "salve", productType: "physical", gradient: GRADIENTS[0], imageUrl: null, inStock: true };

  const save = async (data: any, id?: number) => {
    if (id) await adminFetch(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
    else await adminFetch("/api/admin/products", { method: "POST", body: JSON.stringify(data) });
    setEditing(null); setCreating(false); load();
  };

  const del = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await adminFetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Products ({items.length})</h1>
        <button onClick={() => { setCreating(true); setEditing(empty); }} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Product</button>
      </div>
      {(editing || creating) && (
        <div className="glass rounded-xl p-5 mb-6 space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-display font-semibold">{creating ? "New Product" : "Edit Product"}</h3>
            <button onClick={() => { setEditing(null); setCreating(false); }}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <ImageUpload value={editing.imageUrl} onChange={url => setEditing({ ...editing, imageUrl: url })} label="Product Image" />
          <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Name" className="admin-input" />
          <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Description" rows={3} className="admin-input resize-y" />
          <div className="grid grid-cols-3 gap-3">
            <input type="number" step="0.01" value={editing.price} onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} placeholder="Price" className="admin-input" />
            <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} className="admin-input">
              <option value="salve">Salve</option>
              <option value="jewelry">Jewelry</option>
              <option value="service">Service</option>
            </select>
            <select value={editing.productType || "physical"} onChange={e => setEditing({ ...editing, productType: e.target.value })} className="admin-input">
              <option value="physical">Physical</option>
              <option value="service">Service (requires customer details)</option>
              <option value="digital">Digital Download</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fallback Gradient (used if no image)</label>
            <div className="flex flex-wrap gap-2">
              {GRADIENTS.map(g => (
                <button key={g} onClick={() => setEditing({ ...editing, gradient: g })} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} ${editing.gradient === g ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-gray-900" : ""}`} />
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.inStock} onChange={e => setEditing({ ...editing, inStock: e.target.checked })} className="accent-brand-500" />
            In Stock
          </label>
          <button onClick={() => save(editing, creating ? undefined : editing.id)} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
        </div>
      )}
      <div className="space-y-2">
        {items.map(p => (
          <div key={p.id} className="glass rounded-xl p-4 flex items-center gap-4">
            {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" /> : <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.gradient} shrink-0`} />}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{p.name}</p>
              <p className="text-xs text-gray-500">${p.price} &middot; {p.category} &middot; {p.inStock ? "In Stock" : "Out of Stock"}</p>
            </div>
            <button onClick={() => { setEditing(p); setCreating(false); }} className="p-2 rounded-lg hover:bg-brand-500/10"><Pencil className="w-4 h-4 text-gray-400" /></button>
            <button onClick={() => del(p.id)} className="p-2 rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4 text-red-400" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Gallery Tab
// ────────────────────────────────────────────
function GalleryTab({ adminFetch }: { adminFetch: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const load = () => { setLoading(true); adminFetch("/api/admin/gallery").then((d: any) => { setItems(d); setLoading(false); }); };
  useEffect(load, []);

  const empty = { title: "", description: "", type: "photo", gradient: GRADIENTS[0], mediaUrl: "", downloadUrl: "" };

  const save = async (data: any, id?: number) => {
    if (id) await adminFetch(`/api/admin/gallery/${id}`, { method: "PUT", body: JSON.stringify(data) });
    else await adminFetch("/api/admin/gallery", { method: "POST", body: JSON.stringify(data) });
    setEditing(null); setCreating(false); load();
  };

  const del = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    await adminFetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Gallery ({items.length})</h1>
        <button onClick={() => { setCreating(true); setEditing(empty); }} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Item</button>
      </div>
      {(editing || creating) && (
        <div className="glass rounded-xl p-5 mb-6 space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-display font-semibold">{creating ? "New Gallery Item" : "Edit Gallery Item"}</h3>
            <button onClick={() => { setEditing(null); setCreating(false); }}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <ImageUpload value={editing.mediaUrl} onChange={url => setEditing({ ...editing, mediaUrl: url })} label={editing.type === "photo" ? "Photo" : "Thumbnail Image"} />
          <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="Title" className="admin-input" />
          <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Description" rows={2} className="admin-input resize-y" />
          <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })} className="admin-input">
            <option value="photo">Photo</option>
            <option value="video">Video</option>
            <option value="download">Download</option>
          </select>
          {editing.type === "video" && <input value={editing.mediaUrl || ""} onChange={e => setEditing({ ...editing, mediaUrl: e.target.value })} placeholder="Video embed URL (e.g. YouTube)" className="admin-input" />}
          {editing.type === "download" && <input value={editing.downloadUrl || ""} onChange={e => setEditing({ ...editing, downloadUrl: e.target.value })} placeholder="Download URL" className="admin-input" />}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fallback Gradient (used if no image)</label>
            <div className="flex flex-wrap gap-2">
              {GRADIENTS.map(g => (
                <button key={g} onClick={() => setEditing({ ...editing, gradient: g })} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} ${editing.gradient === g ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-gray-900" : ""}`} />
              ))}
            </div>
          </div>
          <button onClick={() => save(editing, creating ? undefined : editing.id)} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
        </div>
      )}
      <div className="space-y-2">
        {items.map(i => (
          <div key={i.id} className="glass rounded-xl p-4 flex items-center gap-4">
            {i.mediaUrl && !i.mediaUrl.includes("youtube") ? <img src={i.mediaUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" /> : <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${i.gradient} shrink-0`} />}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{i.title}</p>
              <p className="text-xs text-gray-500">{i.type}</p>
            </div>
            <button onClick={() => { setEditing(i); setCreating(false); }} className="p-2 rounded-lg hover:bg-brand-500/10"><Pencil className="w-4 h-4 text-gray-400" /></button>
            <button onClick={() => del(i.id)} className="p-2 rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4 text-red-400" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Courses Tab
// ────────────────────────────────────────────
function CoursesTab({ adminFetch }: { adminFetch: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [newLesson, setNewLesson] = useState<any>(null);

  const load = () => { setLoading(true); adminFetch("/api/admin/courses").then((d: any) => { setItems(d); setLoading(false); }); };
  useEffect(load, []);

  const empty = { title: "", description: "", gradient: GRADIENTS[0], imageUrl: null };
  const emptyLesson = (courseId: number, order: number) => ({ courseId, orderIndex: order, title: "", description: "", content: "" });

  const saveCourse = async (data: any, id?: number) => {
    if (id) await adminFetch(`/api/admin/courses/${id}`, { method: "PUT", body: JSON.stringify(data) });
    else await adminFetch("/api/admin/courses", { method: "POST", body: JSON.stringify(data) });
    setEditing(null); setCreating(false); load();
  };

  const saveLesson = async (data: any) => {
    await adminFetch("/api/admin/lessons", { method: "POST", body: JSON.stringify(data) });
    setNewLesson(null); load();
  };

  const delCourse = async (id: number) => {
    if (!confirm("Delete this course and all its lessons?")) return;
    await adminFetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    load();
  };

  const delLesson = async (id: number) => {
    await adminFetch(`/api/admin/lessons/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Courses ({items.length})</h1>
        <button onClick={() => { setCreating(true); setEditing(empty); }} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Course</button>
      </div>
      {(editing || creating) && (
        <div className="glass rounded-xl p-5 mb-6 space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-display font-semibold">{creating ? "New Course" : "Edit Course"}</h3>
            <button onClick={() => { setEditing(null); setCreating(false); }}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <ImageUpload value={editing.imageUrl} onChange={url => setEditing({ ...editing, imageUrl: url })} label="Course Image" />
          <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="Title" className="admin-input" />
          <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Description" rows={3} className="admin-input resize-y" />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fallback Gradient (used if no image)</label>
            <div className="flex flex-wrap gap-2">
              {GRADIENTS.map(g => (
                <button key={g} onClick={() => setEditing({ ...editing, gradient: g })} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} ${editing.gradient === g ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-gray-900" : ""}`} />
              ))}
            </div>
          </div>
          <button onClick={() => saveCourse(editing, creating ? undefined : editing.id)} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
        </div>
      )}
      <div className="space-y-2">
        {items.map(c => (
          <div key={c.id} className="glass rounded-xl p-4">
            <div className="flex items-center gap-4">
              {c.imageUrl ? <img src={c.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" /> : <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.gradient} shrink-0 flex items-center justify-center`}><GraduationCap className="w-5 h-5 text-white" /></div>}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{c.title}</p>
                <p className="text-xs text-gray-500">{c.lessons?.length || 0} lessons</p>
              </div>
              <button onClick={() => setExpandedCourse(expandedCourse === c.id ? null : c.id)} className="p-2 rounded-lg hover:bg-brand-500/10">
                {expandedCourse === c.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              <button onClick={() => { setEditing(c); setCreating(false); }} className="p-2 rounded-lg hover:bg-brand-500/10"><Pencil className="w-4 h-4 text-gray-400" /></button>
              <button onClick={() => delCourse(c.id)} className="p-2 rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4 text-red-400" /></button>
            </div>
            {expandedCourse === c.id && (
              <div className="mt-4 pl-14 space-y-2">
                {c.lessons?.map((l: any) => (
                  <div key={l.id} className="flex items-center gap-3 glass rounded-lg p-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-500 text-[10px] font-bold flex items-center justify-center shrink-0">{l.orderIndex}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{l.title}</p>
                      <p className="text-[11px] text-gray-500 truncate">{l.description}</p>
                    </div>
                    <button onClick={() => delLesson(l.id)} className="p-1 hover:bg-red-500/10 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                ))}
                {newLesson && newLesson.courseId === c.id ? (
                  <div className="glass rounded-lg p-3 space-y-2">
                    <input value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} placeholder="Lesson title" className="admin-input text-sm" />
                    <input value={newLesson.description} onChange={e => setNewLesson({ ...newLesson, description: e.target.value })} placeholder="Short description" className="admin-input text-sm" />
                    <div className="flex gap-2">
                      <button onClick={() => saveLesson(newLesson)} className="btn-primary text-xs py-1.5 px-3">Add</button>
                      <button onClick={() => setNewLesson(null)} className="btn-outline text-xs py-1.5 px-3">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setNewLesson(emptyLesson(c.id, (c.lessons?.length || 0) + 1))}
                    className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 py-1">
                    <Plus className="w-3.5 h-3.5" /> Add Lesson
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Threads Tab
// ────────────────────────────────────────────
function ThreadsTab({ adminFetch }: { adminFetch: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [expandedThread, setExpandedThread] = useState<number | null>(null);
  const [newCard, setNewCard] = useState<any>(null);

  const load = () => { setLoading(true); adminFetch("/api/admin/threads").then((d: any) => { setItems(d); setLoading(false); }); };
  useEffect(load, []);

  const empty = { topic: "" };
  const emptyCard = (threadId: number, order: number) => ({ threadId, orderIndex: order, title: "", content: "" });

  const saveThread = async (data: any, id?: number) => {
    if (id) await adminFetch(`/api/admin/threads/${id}`, { method: "PUT", body: JSON.stringify(data) });
    else await adminFetch("/api/admin/threads", { method: "POST", body: JSON.stringify(data) });
    setEditing(null); setCreating(false); load();
  };

  const saveCard = async (data: any) => {
    await adminFetch("/api/admin/thread-cards", { method: "POST", body: JSON.stringify(data) });
    setNewCard(null); load();
  };

  const delThread = async (id: number) => {
    if (!confirm("Delete this thread and all its cards?")) return;
    await adminFetch(`/api/admin/threads/${id}`, { method: "DELETE" });
    load();
  };

  const delCard = async (id: number) => {
    await adminFetch(`/api/admin/thread-cards/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Threads ({items.length})</h1>
        <button onClick={() => { setCreating(true); setEditing(empty); }} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Thread</button>
      </div>
      {(editing || creating) && (
        <div className="glass rounded-xl p-5 mb-6 space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-display font-semibold">{creating ? "New Thread" : "Edit Thread"}</h3>
            <button onClick={() => { setEditing(null); setCreating(false); }}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <input value={editing.topic} onChange={e => setEditing({ ...editing, topic: e.target.value })} placeholder="Thread topic" className="admin-input" />
          <button onClick={() => saveThread(editing, creating ? undefined : editing.id)} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
        </div>
      )}
      <div className="space-y-2">
        {items.map(t => (
          <div key={t.id} className="glass rounded-xl p-4">
            <div className="flex items-center gap-4">
              <ThreadIcon className="w-5 h-5 text-brand-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{t.topic}</p>
                <p className="text-xs text-gray-500">{t.cards?.length || 0} cards</p>
              </div>
              <button onClick={() => setExpandedThread(expandedThread === t.id ? null : t.id)} className="p-2 rounded-lg hover:bg-brand-500/10">
                {expandedThread === t.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              <button onClick={() => { setEditing(t); setCreating(false); }} className="p-2 rounded-lg hover:bg-brand-500/10"><Pencil className="w-4 h-4 text-gray-400" /></button>
              <button onClick={() => delThread(t.id)} className="p-2 rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4 text-red-400" /></button>
            </div>
            {expandedThread === t.id && (
              <div className="mt-4 pl-9 space-y-2">
                {t.cards?.map((c: any) => (
                  <div key={c.id} className="glass rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-500 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{c.orderIndex}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{c.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{c.content}</p>
                      </div>
                      <button onClick={() => delCard(c.id)} className="p-1 hover:bg-red-500/10 rounded shrink-0"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                ))}
                {newCard && newCard.threadId === t.id ? (
                  <div className="glass rounded-lg p-3 space-y-2">
                    <input value={newCard.title} onChange={e => setNewCard({ ...newCard, title: e.target.value })} placeholder="Card title" className="admin-input text-sm" />
                    <textarea value={newCard.content} onChange={e => setNewCard({ ...newCard, content: e.target.value })} placeholder="Card content" rows={3} className="admin-input text-sm resize-y" />
                    <div className="flex gap-2">
                      <button onClick={() => saveCard(newCard)} className="btn-primary text-xs py-1.5 px-3">Add</button>
                      <button onClick={() => setNewCard(null)} className="btn-outline text-xs py-1.5 px-3">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setNewCard(emptyCard(t.id, (t.cards?.length || 0) + 1))}
                    className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 py-1">
                    <Plus className="w-3.5 h-3.5" /> Add Card
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Subscribers Tab
// ────────────────────────────────────────────
function SubscribersTab({ adminFetch }: { adminFetch: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); adminFetch("/api/admin/subscribers").then((d: any) => { setItems(d); setLoading(false); }); };
  useEffect(load, []);

  const del = async (id: number) => {
    await adminFetch(`/api/admin/subscribers/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Subscribers ({items.length})</h1>
      {items.length === 0 ? <p className="text-gray-500 text-sm">No subscribers yet.</p> : (
        <div className="space-y-2">
          {items.map(s => (
            <div key={s.id} className="glass rounded-xl p-4 flex items-center gap-4">
              <Users className="w-5 h-5 text-brand-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{s.email}</p>
                <p className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => del(s.id)} className="p-2 rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4 text-red-400" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// Orders Tab
// ────────────────────────────────────────────
function OrdersTab({ adminFetch }: { adminFetch: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = () => { setLoading(true); adminFetch("/api/admin/orders").then((d: any) => { setItems(d); setLoading(false); }); };
  useEffect(load, []);

  const updateStatus = async (id: number, status: string) => {
    await adminFetch(`/api/admin/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    load();
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "paid": return "bg-green-500/20 text-green-400";
      case "processing": return "bg-brand-500/20 text-brand-400";
      case "shipped": return "bg-blue-500/20 text-blue-400";
      case "delivered": return "bg-emerald-500/20 text-emerald-400";
      case "completed": return "bg-emerald-500/20 text-emerald-400";
      case "cancelled": return "bg-red-500/20 text-red-400";
      default: return "bg-amber-500/20 text-amber-400";
    }
  };

  const orderTypeBadge = (type: string) => {
    switch (type) {
      case "service": return "bg-violet-500/20 text-violet-400";
      case "mixed": return "bg-amber-500/20 text-amber-400";
      default: return "bg-cyan-500/20 text-cyan-400";
    }
  };

  const parseItems = (itemsJson: string) => {
    try { return JSON.parse(itemsJson); } catch { return []; }
  };

  const parseNotes = (notes: string | null) => {
    if (!notes) return null;
    try { return JSON.parse(notes); } catch { return null; }
  };

  const parseShipping = (addr: string | null) => {
    if (!addr) return null;
    try { return JSON.parse(addr); } catch { return null; }
  };

  if (loading) return <Loading />;

  const paidStatuses = ["paid", "processing", "shipped", "delivered", "completed"];
  const paidTotal = items.filter(o => paidStatuses.includes(o.status)).reduce((sum, o) => sum + o.total, 0);
  const pendingService = items.filter(o => (o.orderType === "service" || o.orderType === "mixed") && (o.status === "paid" || o.status === "processing")).length;
  const pendingShip = items.filter(o => (o.orderType === "physical" || o.orderType === "mixed") && (o.status === "paid" || o.status === "processing")).length;

  const filtered = filter === "all" ? items
    : filter === "service" ? items.filter(o => o.orderType === "service" || o.orderType === "mixed")
    : filter === "needs-action" ? items.filter(o => o.status === "paid" || o.status === "processing")
    : filter === "to-ship" ? items.filter(o => (o.orderType === "physical" || o.orderType === "mixed") && (o.status === "paid" || o.status === "processing"))
    : items;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Orders ({items.length})</h1>
          <div className="flex items-center gap-4 mt-1">
            {paidTotal > 0 && <span className="text-xs text-green-400 font-medium">Revenue: ${paidTotal.toFixed(2)}</span>}
            {pendingService > 0 && <span className="text-xs text-violet-400 font-medium">{pendingService} report{pendingService > 1 ? "s" : ""} to write</span>}
            {pendingShip > 0 && <span className="text-xs text-cyan-400 font-medium">{pendingShip} to ship</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {["all", "needs-action", "to-ship", "service"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-brand-500/15 text-brand-400" : "text-gray-500 hover:text-gray-300 glass"}`}>
              {f === "all" ? "All" : f === "needs-action" ? "Needs Action" : f === "to-ship" ? "To Ship" : "Reports"}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? <p className="text-gray-500 text-sm">No orders match this filter.</p> : (
        <div className="space-y-2">
          {filtered.map(o => {
            const orderItems = parseItems(o.items);
            const notes = parseNotes(o.customerNotes);
            const shipping = parseShipping(o.shippingAddress);
            const isExpanded = expandedOrder === o.id;
            const isService = o.orderType === "service" || o.orderType === "mixed";
            const isPhysical = o.orderType === "physical" || o.orderType === "mixed";
            return (
              <div key={o.id} className={`glass rounded-xl p-4 ${isService && (o.status === "paid" || o.status === "processing") ? "border border-violet-500/30" : ""}`}>
                <div className="flex items-center gap-4">
                  <Package className={`w-5 h-5 shrink-0 ${isService ? "text-violet-400" : "text-amber-400"}`} />
                  <div className="flex-1 min-w-0" role="button" onClick={() => setExpandedOrder(isExpanded ? null : o.id)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">#{o.id}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${orderTypeBadge(o.orderType || "physical")}`}>
                        {o.orderType === "service" ? "Report" : o.orderType === "mixed" ? "Mixed" : "Physical"}
                      </span>
                      {o.paymentMethod === "stripe" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-500/20 text-brand-400">Stripe</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {o.customerName !== "Pending Checkout" ? o.customerName : ""} {o.customerEmail !== "pending@checkout" ? `(${o.customerEmail})` : ""}
                      {" "}&middot; ${o.total.toFixed(2)} &middot; {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className="admin-input text-xs py-1 w-32">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    {isService ? (
                      <option value="completed">Completed</option>
                    ) : (
                      <>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </>
                    )}
                    {o.orderType === "mixed" && (
                      <>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                      </>
                    )}
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button onClick={() => setExpandedOrder(isExpanded ? null : o.id)} className="p-2 rounded-lg hover:bg-brand-500/10">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 ml-9 space-y-3">
                    {notes && Array.isArray(notes) && notes.length > 0 && (
                      <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4 space-y-3">
                        <p className="text-xs font-medium text-violet-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> Report Details (Customer Submitted)
                        </p>
                        {notes.map((note: any, i: number) => (
                          <div key={i} className="space-y-1.5">
                            {note.productName && <p className="text-xs text-gray-400 font-medium">{note.productName}</p>}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500">Full Name:</span>
                                <p className="font-medium">{note.fullName}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Birth Date:</span>
                                <p className="font-medium">{note.birthDate}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Delivery Email:</span>
                                <p className="font-medium">{note.email}</p>
                              </div>
                            </div>
                            {note.specialRequests && (
                              <div className="text-xs">
                                <span className="text-gray-500">Special Requests:</span>
                                <p className="mt-0.5 text-gray-300 italic">{note.specialRequests}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {isPhysical && shipping && (
                      <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4 space-y-2">
                        <p className="text-xs font-medium text-cyan-400 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5" /> Shipping Details
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Ship To:</span>
                            <p className="font-medium">{shipping.name}</p>
                          </div>
                          {o.customerPhone && (
                            <div>
                              <span className="text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone:</span>
                              <p className="font-medium">{o.customerPhone}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Address:</span>
                          <p className="font-medium mt-0.5">
                            {shipping.line1}
                            {shipping.line2 && <><br />{shipping.line2}</>}
                            <br />{shipping.city}, {shipping.state} {shipping.postal_code}
                            <br />{shipping.country}
                          </p>
                        </div>
                      </div>
                    )}

                    {isPhysical && !shipping && o.status === "paid" && (
                      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        Shipping address not yet captured. Check Stripe Dashboard for details.
                      </div>
                    )}

                    {orderItems.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                          <ClipboardList className="w-3.5 h-3.5" /> Items
                        </p>
                        {orderItems.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm glass rounded-lg p-2.5">
                            <span>{item.quantity || item.qty}x {item.name}</span>
                            <span className="text-gray-400">${((item.price) * (item.quantity || item.qty)).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {o.stripeSessionId && (
                      <div className="text-[11px] text-gray-600 space-y-0.5">
                        <p>Session: {o.stripeSessionId.slice(0, 30)}...</p>
                        {o.stripePaymentIntentId && <p>Payment: {o.stripePaymentIntentId}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// Comments Tab
// ────────────────────────────────────────────
function CommentsTab({ adminFetch }: { adminFetch: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); adminFetch("/api/admin/comments").then((d: any) => { setItems(d); setLoading(false); }); };
  useEffect(load, []);

  const del = async (id: number) => {
    await adminFetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Comments ({items.length})</h1>
      {items.length === 0 ? <p className="text-gray-500 text-sm">No comments yet.</p> : (
        <div className="space-y-2">
          {items.map(c => (
            <div key={c.id} className="glass rounded-xl p-4 flex items-start gap-4">
              <MessageSquare className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{c.author}</span>
                  <span className="text-[10px] text-gray-500 px-1.5 py-0.5 rounded glass">{c.targetType} #{c.targetId}</span>
                  <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-400">{c.content}</p>
              </div>
              <button onClick={() => del(c.id)} className="p-2 rounded-lg hover:bg-red-500/10 shrink-0"><Trash2 className="w-4 h-4 text-red-400" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Loading() {
  return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
}
