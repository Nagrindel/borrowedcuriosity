import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Loader2, Sparkles, Heart, Shield, BookOpen, Gem, Zap, Star, X, Droplets, Globe, Moon, AlertTriangle, Diamond } from "lucide-react";

interface CrystalResult {
  name: string;
  scientificName?: string;
  confidence?: number;
  geological?: { hardness: string; crystalSystem: string; composition: string; formation: string; locations: string[] };
  metaphysical?: { chakras: string[]; element: string; zodiac: string[]; vibration: number; properties: string[]; healingUses: string; emotionalUses: string; spiritualUses: string };
  sacredStories?: { biblical: string; mythology: string; cultural: string; folklore: string };
  careGuide?: { cleansing: string[]; charging: string[]; avoid: string[]; pairsWith: string[] };
  marketValue?: { priceRange: string; rarity: string; collectibility: string; factors: string[]; investmentNotes: string };
  numerologyLink?: { number: number; reason: string };
  funFact?: string;
  raw?: string;
}

type Tab = "metaphysical" | "geological" | "stories" | "care" | "market";

export default function CrystalIdentifier() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrystalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("metaphysical");

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) handleFile(f);
  };

  const analyze = async () => {
    if (!file && !description.trim()) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (file) formData.append("image", file);
    if (description) formData.append("description", description);

    try {
      const res = await fetch("/api/crystal/identify", { method: "POST", body: formData });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error("Server returned an invalid response. Please try again."); }
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      if (data.error && data.raw) {
        setResult({ name: "Unknown Crystal", raw: data.raw } as CrystalResult);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setDescription("");
    setResult(null);
    setError(null);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "metaphysical", label: "Metaphysical", icon: <Sparkles className="w-4 h-4" /> },
    { id: "geological", label: "Geological", icon: <Gem className="w-4 h-4" /> },
    { id: "market", label: "Market Value", icon: <Diamond className="w-4 h-4" /> },
    { id: "stories", label: "Sacred Stories", icon: <BookOpen className="w-4 h-4" /> },
    { id: "care", label: "Care Guide", icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen">
      <section className="section-padding min-h-[35vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-400 mb-6">
              <Gem className="w-3.5 h-3.5" /> Crystal Analysis
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5">
              Crystal <span className="text-gradient">Identifier</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Upload a photo or describe your crystal. Get geological data, metaphysical properties,
              sacred stories, and a personalized care guide.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        {!result ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className="glass rounded-2xl p-8 text-center mb-6 border-2 border-dashed border-white/10 hover:border-brand-500/30 transition-colors"
            >
              {preview ? (
                <div className="relative inline-block">
                  <img src={preview} alt="Crystal preview" className="max-h-64 rounded-xl mx-auto" />
                  <button onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center" aria-label="Remove image">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="py-8">
                  <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-brand-400" />
                  </div>
                  <p className="font-display font-semibold text-lg mb-2">Drop a crystal photo here</p>
                  <p className="text-sm text-gray-500 mb-4">or click to browse. JPG, PNG, WebP up to 10MB.</p>
                  <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" /> Choose Photo
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  </label>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-6 mb-6">
              <label className="text-sm font-medium mb-2 block">Or describe your crystal</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="e.g., Purple translucent stone, about 2 inches, pointed cluster shape, deep violet color with white banding..."
                className="w-full glass rounded-xl px-4 py-3 text-sm resize-none h-24 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            {error && <p className="text-sm text-red-400 text-center mb-4 bg-red-500/10 rounded-lg py-2 px-4">{error}</p>}

            <button onClick={analyze} disabled={loading || (!file && !description.trim())}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-40">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Sparkles className="w-5 h-5" /> Identify Crystal</>}
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="glass rounded-2xl p-6 sm:p-8 mb-6">
              <div className="flex items-start gap-5">
                {preview && <img src={preview} alt={result.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="font-display text-2xl sm:text-3xl font-bold">{result.name}</h2>
                    {result.confidence && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400">{result.confidence}% match</span>
                    )}
                  </div>
                  {result.scientificName && <p className="text-sm text-gray-500 italic mb-2">{result.scientificName}</p>}
                  {result.funFact && <p className="text-sm text-brand-400">{result.funFact}</p>}
                  {result.numerologyLink && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10">
                      <Star className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-xs text-brand-300">Life Path {result.numerologyLink.number}: {result.numerologyLink.reason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    tab === t.id ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25" : "glass hover:bg-brand-500/10"
                  }`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === "metaphysical" && result.metaphysical && (
                <motion.div key="meta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {result.metaphysical.chakras?.map(c => (
                      <div key={c} className="glass rounded-xl p-3 text-center">
                        <Zap className="w-5 h-5 text-brand-400 mx-auto mb-1" />
                        <p className="text-xs font-medium">{c}</p>
                        <p className="text-[10px] text-gray-500">Chakra</p>
                      </div>
                    ))}
                    {result.metaphysical.element && (
                      <div className="glass rounded-xl p-3 text-center">
                        <Droplets className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <p className="text-xs font-medium">{result.metaphysical.element}</p>
                        <p className="text-[10px] text-gray-500">Element</p>
                      </div>
                    )}
                    {result.metaphysical.vibration && (
                      <div className="glass rounded-xl p-3 text-center">
                        <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                        <p className="text-xs font-medium">{result.metaphysical.vibration}</p>
                        <p className="text-[10px] text-gray-500">Vibration</p>
                      </div>
                    )}
                  </div>
                  {result.metaphysical.properties && (
                    <div className="glass rounded-xl p-4">
                      <h4 className="font-display font-semibold text-sm mb-2">Key Properties</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.metaphysical.properties.map(p => (
                          <span key={p} className="text-xs px-3 py-1 rounded-full bg-brand-500/10 text-brand-300">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {[
                    { label: "Healing", icon: <Heart className="w-4 h-4 text-green-400" />, text: result.metaphysical.healingUses },
                    { label: "Emotional", icon: <Heart className="w-4 h-4 text-pink-400" />, text: result.metaphysical.emotionalUses },
                    { label: "Spiritual", icon: <Sparkles className="w-4 h-4 text-violet-400" />, text: result.metaphysical.spiritualUses },
                  ].filter(x => x.text).map(x => (
                    <div key={x.label} className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">{x.icon}<h4 className="font-display font-semibold text-sm">{x.label} Uses</h4></div>
                      <p className="text-sm text-gray-400 leading-relaxed">{x.text}</p>
                    </div>
                  ))}
                  {result.metaphysical.zodiac && (
                    <div className="glass rounded-xl p-4">
                      <h4 className="font-display font-semibold text-sm mb-2">Zodiac Affinity</h4>
                      <p className="text-sm text-gray-400">{result.metaphysical.zodiac.join(", ")}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {tab === "geological" && result.geological && (
                <motion.div key="geo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="glass rounded-xl p-5 space-y-3">
                  {[
                    { label: "Hardness", value: result.geological.hardness },
                    { label: "Crystal System", value: result.geological.crystalSystem },
                    { label: "Composition", value: result.geological.composition },
                    { label: "Formation", value: result.geological.formation },
                    { label: "Found In", value: result.geological.locations?.join(", ") },
                  ].filter(x => x.value).map(x => (
                    <div key={x.label} className="flex justify-between items-start py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm text-gray-500 w-32 flex-shrink-0">{x.label}</span>
                      <span className="text-sm text-right">{x.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {tab === "stories" && result.sacredStories && (
                <motion.div key="stories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-4">
                  {[
                    { label: "Biblical", icon: <BookOpen className="w-4 h-4 text-amber-400" />, text: result.sacredStories.biblical },
                    { label: "Mythology", icon: <Globe className="w-4 h-4 text-violet-400" />, text: result.sacredStories.mythology },
                    { label: "Cultural", icon: <Globe className="w-4 h-4 text-cyan-400" />, text: result.sacredStories.cultural },
                    { label: "Folklore", icon: <Moon className="w-4 h-4 text-blue-400" />, text: result.sacredStories.folklore },
                  ].filter(x => x.text).map(x => (
                    <div key={x.label} className="glass rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {x.icon}
                        <h4 className="font-display font-semibold">{x.label}</h4>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">{x.text}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {tab === "market" && result.marketValue && (
                <motion.div key="market" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">Price Range</p>
                      <p className="font-display font-bold text-lg text-emerald-400">{result.marketValue.priceRange}</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">Rarity</p>
                      <p className="font-display font-bold text-lg text-amber-400">{result.marketValue.rarity}</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">Collectibility</p>
                      <p className="font-display font-bold text-lg text-violet-400">{result.marketValue.collectibility}</p>
                    </div>
                  </div>
                  {result.marketValue.factors?.length > 0 && (
                    <div className="glass rounded-xl p-4">
                      <h4 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" /> Value Factors
                      </h4>
                      <div className="space-y-1.5">
                        {result.marketValue.factors.map(f => (
                          <p key={f} className="text-sm text-gray-400 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" /> {f}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.marketValue.investmentNotes && (
                    <div className="glass rounded-xl p-4">
                      <h4 className="font-display font-semibold text-sm mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-400" /> Market Notes
                      </h4>
                      <p className="text-sm text-gray-400 leading-relaxed">{result.marketValue.investmentNotes}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {tab === "care" && result.careGuide && (
                <motion.div key="care" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Cleansing", items: result.careGuide.cleansing, icon: <Droplets className="w-4 h-4 text-cyan-400" /> },
                    { label: "Charging", items: result.careGuide.charging, icon: <Zap className="w-4 h-4 text-amber-400" /> },
                    { label: "Avoid", items: result.careGuide.avoid, icon: <AlertTriangle className="w-4 h-4 text-red-400" /> },
                    { label: "Pairs With", items: result.careGuide.pairsWith, icon: <Diamond className="w-4 h-4 text-violet-400" /> },
                  ].filter(x => x.items?.length).map(x => (
                    <div key={x.label} className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {x.icon}
                        <h4 className="font-display font-semibold text-sm">{x.label}</h4>
                      </div>
                      <div className="space-y-1.5">
                        {x.items!.map(item => (
                          <p key={item} className="text-sm text-gray-400 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" /> {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={clear} className="btn-outline w-full mt-8 flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" /> Identify Another Crystal
            </button>
          </motion.div>
        )}
      </section>
    </div>
  );
}
