import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Timer, Music, Brain, Sparkles, ChevronDown, Hash } from "lucide-react";

interface Frequency {
  hz: number;
  name: string;
  description: string;
  color: string;
  chakra?: string;
}

const SOLFEGGIO: Frequency[] = [
  { hz: 174, name: "Foundation", description: "Relieves pain and stress. The lowest solfeggio tone creates a natural anesthetic effect, grounding and stabilizing your energy.", color: "from-red-600 to-red-800", chakra: "Root" },
  { hz: 285, name: "Restoration", description: "Influences energy fields and promotes cellular repair. Helps heal tissue and brings the body back to its original form.", color: "from-orange-500 to-red-600", chakra: "Sacral" },
  { hz: 396, name: "Liberation", description: "Frees you from guilt and fear. Turns grief into joy, helping you achieve goals by removing subconscious blockages.", color: "from-amber-500 to-orange-600", chakra: "Solar Plexus" },
  { hz: 417, name: "Transformation", description: "Facilitates change and undoes negative situations. Cleanses traumatic experiences and clears destructive influences.", color: "from-yellow-400 to-amber-500", chakra: "Solar Plexus" },
  { hz: 528, name: "Miracles", description: "The 'Love Frequency.' Repairs DNA, brings transformation, and produces miracles. The most studied of all solfeggio tones.", color: "from-emerald-400 to-green-600", chakra: "Heart" },
  { hz: 639, name: "Connection", description: "Enhances communication, understanding, and harmony in relationships. Strengthens community and interpersonal bonds.", color: "from-cyan-400 to-teal-600", chakra: "Throat" },
  { hz: 741, name: "Awakening", description: "Cleans cells of toxins. Leads to a healthier, simpler life. Promotes self-expression and problem-solving.", color: "from-blue-400 to-indigo-600", chakra: "Third Eye" },
  { hz: 852, name: "Intuition", description: "Returns you to spiritual order. Awakens intuition and inner strength. Raises awareness and helps see through illusions.", color: "from-violet-400 to-purple-600", chakra: "Third Eye" },
  { hz: 963, name: "Divine", description: "Activates the pineal gland and connects to the oneness of the universe. Known as the frequency of the gods.", color: "from-fuchsia-400 to-violet-600", chakra: "Crown" },
];

interface BinauralPreset {
  name: string;
  baseHz: number;
  beatHz: number;
  wave: string;
  description: string;
  color: string;
}

const BINAURAL: BinauralPreset[] = [
  { name: "Deep Sleep (Delta)", baseHz: 200, beatHz: 2, wave: "0.5-4 Hz", description: "Delta waves for deep, dreamless sleep and profound healing. Best used lying down with eyes closed.", color: "from-indigo-600 to-blue-900" },
  { name: "Meditation (Theta)", baseHz: 200, beatHz: 6, wave: "4-8 Hz", description: "Theta waves for deep meditation, creativity, and REM sleep. The gateway to your subconscious mind.", color: "from-purple-500 to-indigo-700" },
  { name: "Relaxation (Alpha)", baseHz: 200, beatHz: 10, wave: "8-13 Hz", description: "Alpha waves for calm alertness and relaxation. Perfect for creative thinking and stress reduction.", color: "from-teal-400 to-cyan-600" },
  { name: "Focus (Beta)", baseHz: 200, beatHz: 20, wave: "13-30 Hz", description: "Beta waves for concentration, problem solving, and active thinking. Use during work or study.", color: "from-amber-400 to-orange-600" },
  { name: "Peak State (Gamma)", baseHz: 200, beatHz: 40, wave: "30-100 Hz", description: "Gamma waves for heightened perception, peak awareness, and information processing.", color: "from-rose-400 to-pink-600" },
];

const LIFE_PATH_FREQUENCIES: Record<number, { hz: number; reason: string }> = {
  1: { hz: 396, reason: "The Initiator resonates with Liberation. Removing fear clears the path for new beginnings." },
  2: { hz: 639, reason: "The Peacemaker resonates with Connection. Harmony in relationships is your core gift." },
  3: { hz: 528, reason: "The Creator resonates with Miracles. Your creative energy transforms everything it touches." },
  4: { hz: 174, reason: "The Builder resonates with Foundation. Stability and grounding are your superpowers." },
  5: { hz: 417, reason: "The Explorer resonates with Transformation. Change is your natural state of being." },
  6: { hz: 639, reason: "The Nurturer resonates with Connection. Love and care for others defines your path." },
  7: { hz: 852, reason: "The Seeker resonates with Intuition. Spiritual awareness is woven into your DNA." },
  8: { hz: 741, reason: "The Powerhouse resonates with Awakening. Self-expression and authority come naturally." },
  9: { hz: 963, reason: "The Humanitarian resonates with Divine. Universal consciousness is your operating system." },
  11: { hz: 852, reason: "The Illuminator resonates with Intuition. Master Number 11 channels higher spiritual insight." },
  22: { hz: 528, reason: "The Master Builder resonates with Miracles. You manifest dreams into reality at the highest level." },
  33: { hz: 963, reason: "The Master Teacher resonates with Divine. Compassion at a cosmic level connects you to source." },
};

type Tab = "solfeggio" | "binaural" | "numerology";

export default function Frequencies() {
  const [tab, setTab] = useState<Tab>("solfeggio");
  const [playing, setPlaying] = useState(false);
  const [activeFreq, setActiveFreq] = useState<Frequency | null>(null);
  const [activeBinaural, setActiveBinaural] = useState<BinauralPreset | null>(null);
  const [volume, setVolume] = useState(0.4);
  const [muted, setMuted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerDuration, setTimerDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [lifePathInput, setLifePathInput] = useState("");
  const [lifePathResult, setLifePathResult] = useState<number | null>(null);
  const [use432, setUse432] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ oscs: OscillatorNode[]; gains: GainNode[]; master: GainNode } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timerRef = useRef<number>(0);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const stopAll = useCallback(() => {
    if (nodesRef.current) {
      const { oscs, gains, master } = nodesRef.current;
      const t = audioCtxRef.current?.currentTime ?? 0;
      master.gain.linearRampToValueAtTime(0, t + 0.3);
      setTimeout(() => {
        oscs.forEach(o => { try { o.stop(); o.disconnect(); } catch {} });
        gains.forEach(g => g.disconnect());
        master.disconnect();
        nodesRef.current = null;
      }, 350);
    }
    setPlaying(false);
    cancelAnimationFrame(animRef.current);
    clearInterval(timerRef.current);
  }, []);

  const playSolfeggio = useCallback((freq: Frequency) => {
    stopAll();
    const ctx = getCtx();
    const hz = use432 ? freq.hz * (432 / 440) : freq.hz;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = hz;
    const g1 = ctx.createGain();
    g1.gain.value = 0.6;
    osc1.connect(g1).connect(master);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = hz * 2;
    const g2 = ctx.createGain();
    g2.gain.value = 0.15;
    osc2.connect(g2).connect(master);

    const osc3 = ctx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.value = hz * 0.5;
    const g3 = ctx.createGain();
    g3.gain.value = 0.25;
    osc3.connect(g3).connect(master);

    osc1.start();
    osc2.start();
    osc3.start();

    const vol = muted ? 0 : volume;
    master.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.5);

    nodesRef.current = { oscs: [osc1, osc2, osc3], gains: [g1, g2, g3], master };
    setActiveFreq(freq);
    setActiveBinaural(null);
    setPlaying(true);
    setElapsed(0);
    startTimer();
  }, [stopAll, getCtx, volume, muted, use432]);

  const playBinaural = useCallback((preset: BinauralPreset) => {
    stopAll();
    const ctx = getCtx();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const oscL = ctx.createOscillator();
    oscL.type = "sine";
    oscL.frequency.value = preset.baseHz;
    const panL = ctx.createStereoPanner();
    panL.pan.value = -1;
    const gL = ctx.createGain();
    gL.gain.value = 0.5;
    oscL.connect(gL).connect(panL).connect(master);

    const oscR = ctx.createOscillator();
    oscR.type = "sine";
    oscR.frequency.value = preset.baseHz + preset.beatHz;
    const panR = ctx.createStereoPanner();
    panR.pan.value = 1;
    const gR = ctx.createGain();
    gR.gain.value = 0.5;
    oscR.connect(gR).connect(panR).connect(master);

    oscL.start();
    oscR.start();

    const vol = muted ? 0 : volume;
    master.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.5);

    nodesRef.current = { oscs: [oscL, oscR], gains: [gL, gR], master };
    setActiveBinaural(preset);
    setActiveFreq(null);
    setPlaying(true);
    setElapsed(0);
    startTimer();
  }, [stopAll, getCtx, volume, muted]);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (timerDuration > 0 && next >= timerDuration) {
          stopAll();
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [timerDuration, stopAll]);

  useEffect(() => {
    if (nodesRef.current?.master) {
      const ctx = audioCtxRef.current;
      if (ctx) {
        const vol = muted ? 0 : volume;
        nodesRef.current.master.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.1);
      }
    }
  }, [volume, muted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;

    let t = 0;
    const draw = () => {
      const w = canvas.width = canvas.offsetWidth * 2;
      const h = canvas.height = canvas.offsetHeight * 2;
      c.clearRect(0, 0, w, h);

      if (!playing) {
        c.strokeStyle = "rgba(139,92,246,0.15)";
        c.lineWidth = 2;
        c.beginPath();
        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin(x * 0.01 + t * 0.5) * 20;
          x === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.stroke();
        t += 0.016;
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const hz = activeFreq?.hz || activeBinaural?.baseHz || 200;
      const layers = 5;
      for (let l = 0; l < layers; l++) {
        const alpha = 0.12 + (l * 0.08);
        const hue = activeFreq
          ? 270 + (activeFreq.hz / 963) * 60
          : 200 + (activeBinaural?.beatHz || 0) * 2;
        c.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        c.lineWidth = 2 + l * 0.5;
        c.beginPath();
        const freq = (hz / 100) * (1 + l * 0.3);
        const amp = (h * 0.15) * (1 - l * 0.12) * (muted ? 0.1 : volume);
        for (let x = 0; x < w; x++) {
          const y = h / 2
            + Math.sin(x * freq * 0.001 + t * (2 + l * 0.5)) * amp
            + Math.sin(x * freq * 0.0003 + t * 0.7) * amp * 0.4;
          x === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.stroke();
      }

      if (activeBinaural) {
        c.strokeStyle = `hsla(300, 70%, 50%, 0.08)`;
        c.lineWidth = 3;
        c.beginPath();
        for (let x = 0; x < w; x++) {
          const beat = Math.sin(x * 0.002 + t * activeBinaural.beatHz * 0.3);
          const y = h / 2 + beat * h * 0.2 * volume;
          x === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.stroke();
      }

      t += 0.016;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, activeFreq, activeBinaural, volume, muted]);

  useEffect(() => {
    return () => {
      stopAll();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [stopAll]);

  const calculateLifePath = () => {
    const cleaned = lifePathInput.replace(/\D/g, "");
    if (cleaned.length < 8) return;
    const digits = cleaned.split("").map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = String(sum).split("").map(Number).reduce((a, b) => a + b, 0);
    }
    setLifePathResult(sum);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const timerOptions = [0, 60, 180, 300, 600, 900, 1200, 1800];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "solfeggio", label: "Solfeggio", icon: <Music className="w-4 h-4" /> },
    { id: "binaural", label: "Binaural Beats", icon: <Brain className="w-4 h-4" /> },
    { id: "numerology", label: "Your Frequency", icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen">
      <section className="section-padding min-h-[40vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-400 mb-6">
              <Music className="w-3.5 h-3.5" /> Healing Frequencies
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              Frequency <span className="text-gradient">Generator</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Ancient healing tones, brainwave entrainment, and numerology-matched frequencies.
              Use headphones for binaural beats. Best experienced with eyes closed.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        {/* Visualizer */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 sm:p-6 mb-6 relative overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-32 sm:h-44 rounded-xl" />

          {playing && (activeFreq || activeBinaural) && (
            <div className="absolute top-6 left-8 sm:top-8 sm:left-10">
              <p className="text-xs text-brand-400 font-medium">Now Playing</p>
              <p className="font-display font-bold text-lg sm:text-xl">
                {activeFreq ? `${activeFreq.hz} Hz - ${activeFreq.name}` : activeBinaural?.name}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={() => playing ? stopAll() : (activeFreq ? playSolfeggio(activeFreq) : activeBinaural ? playBinaural(activeBinaural) : null)}
                disabled={!activeFreq && !activeBinaural && !playing}
                className="w-12 h-12 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25"
                aria-label={playing ? "Stop" : "Play"}
              >
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button onClick={() => setMuted(!muted)} className="p-2 rounded-lg hover:bg-brand-500/10" aria-label="Toggle mute">
                {muted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-brand-400" />}
              </button>

              <input
                type="range" min="0" max="1" step="0.01" value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-20 sm:w-28 accent-brand-500"
                aria-label="Volume"
              />
              <span className="text-xs text-gray-500 w-8">{Math.round(volume * 100)}%</span>
            </div>

            <div className="flex items-center gap-3">
              {playing && <span className="text-sm font-mono text-brand-400">{formatTime(elapsed)}</span>}

              <div className="relative">
                <select
                  value={timerDuration}
                  onChange={e => setTimerDuration(Number(e.target.value))}
                  className="appearance-none glass rounded-lg pl-8 pr-8 py-2 text-xs cursor-pointer"
                  aria-label="Timer duration"
                >
                  <option value={0}>No timer</option>
                  {timerOptions.filter(t => t > 0).map(t => (
                    <option key={t} value={t}>{formatTime(t)}</option>
                  ))}
                </select>
                <Timer className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <label className="flex items-center gap-2 glass rounded-lg px-3 py-2 cursor-pointer">
                <input type="checkbox" checked={use432} onChange={e => setUse432(e.target.checked)}
                  className="accent-brand-500 w-3.5 h-3.5" />
                <span className="text-xs whitespace-nowrap">432 Hz tuning</span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.id ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25" : "glass hover:bg-brand-500/10"
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Solfeggio */}
        <AnimatePresence mode="wait">
          {tab === "solfeggio" && (
            <motion.div key="solfeggio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid gap-3">
              {SOLFEGGIO.map((freq) => {
                const isActive = activeFreq?.hz === freq.hz && playing;
                return (
                  <button key={freq.hz} onClick={() => playSolfeggio(freq)}
                    className={`glass rounded-xl p-4 sm:p-5 text-left transition-all group ${
                      isActive ? "ring-2 ring-brand-500 bg-brand-500/5" : "hover:bg-brand-500/5"
                    }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${freq.color} flex items-center justify-center flex-shrink-0 shadow-lg ${
                        isActive ? "animate-pulse" : ""
                      }`}>
                        <span className="text-white font-display font-bold text-sm">{freq.hz}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-semibold">{freq.hz} Hz - {freq.name}</h3>
                          {freq.chakra && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400">{freq.chakra} Chakra</span>
                          )}
                          {isActive && (
                            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Playing
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{freq.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}

          {tab === "binaural" && (
            <motion.div key="binaural" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="glass rounded-xl p-4 mb-4 flex items-start gap-3 border border-amber-500/20 bg-amber-500/5">
                <span className="text-lg">🎧</span>
                <p className="text-sm text-amber-300/80">
                  <strong>Headphones required.</strong> Binaural beats work by playing slightly different frequencies in each ear.
                  Your brain perceives the difference as a pulsing beat that entrains brainwave activity.
                </p>
              </div>

              <div className="grid gap-3">
                {BINAURAL.map((preset) => {
                  const isActive = activeBinaural?.name === preset.name && playing;
                  return (
                    <button key={preset.name} onClick={() => playBinaural(preset)}
                      className={`glass rounded-xl p-4 sm:p-5 text-left transition-all ${
                        isActive ? "ring-2 ring-brand-500 bg-brand-500/5" : "hover:bg-brand-500/5"
                      }`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${preset.color} flex items-center justify-center flex-shrink-0 shadow-lg ${
                          isActive ? "animate-pulse" : ""
                        }`}>
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-semibold">{preset.name}</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400">{preset.wave}</span>
                            {isActive && (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Playing
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{preset.description}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Left ear: {preset.baseHz} Hz / Right ear: {preset.baseHz + preset.beatHz} Hz = {preset.beatHz} Hz beat
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {tab === "numerology" && (
            <motion.div key="numerology" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="glass rounded-2xl p-6 sm:p-8 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">Find Your Frequency</h3>
                    <p className="text-xs text-gray-500">Enter your birthday to discover the frequency matched to your Life Path</p>
                  </div>
                </div>

                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Birthday (MM/DD/YYYY)</label>
                    <input
                      type="text" placeholder="03/15/1990" value={lifePathInput}
                      onChange={e => setLifePathInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && calculateLifePath()}
                      className="w-full glass rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <button onClick={calculateLifePath} className="btn-primary px-6 py-2.5 whitespace-nowrap">
                    Calculate
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {lifePathResult && LIFE_PATH_FREQUENCIES[lifePathResult] && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="glass rounded-2xl p-6 sm:p-8">
                    <div className="text-center mb-6">
                      <p className="text-sm text-brand-400 font-medium mb-1">Your Life Path Number</p>
                      <p className="font-display text-5xl font-bold text-gradient mb-2">{lifePathResult}</p>
                      <p className="text-sm text-gray-500 max-w-md mx-auto">
                        {LIFE_PATH_FREQUENCIES[lifePathResult].reason}
                      </p>
                    </div>

                    {(() => {
                      const matched = SOLFEGGIO.find(f => f.hz === LIFE_PATH_FREQUENCIES[lifePathResult!].hz);
                      if (!matched) return null;
                      const isActive = activeFreq?.hz === matched.hz && playing;
                      return (
                        <button onClick={() => playSolfeggio(matched)}
                          className={`w-full glass rounded-xl p-5 text-left transition-all ${
                            isActive ? "ring-2 ring-brand-500 bg-brand-500/5" : "hover:bg-brand-500/5"
                          }`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${matched.color} flex flex-col items-center justify-center flex-shrink-0 shadow-lg ${
                              isActive ? "animate-pulse" : ""
                            }`}>
                              <span className="text-white font-display font-bold">{matched.hz}</span>
                              <span className="text-white/70 text-[9px]">Hz</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-display font-semibold text-lg">{matched.name} Frequency</h3>
                                {matched.chakra && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400">{matched.chakra}</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{matched.description}</p>
                              <p className="text-xs text-brand-400 mt-2 font-medium">
                                {isActive ? "Now playing your frequency..." : "Tap to play your personal frequency"}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>

              {!lifePathResult && (
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-display font-semibold mb-4">Life Path to Frequency Map</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(LIFE_PATH_FREQUENCIES).map(([num, { hz }]) => {
                      const freq = SOLFEGGIO.find(f => f.hz === hz);
                      return (
                        <div key={num} className="glass rounded-lg p-3 text-center">
                          <p className="font-display font-bold text-brand-400 text-lg">{num}</p>
                          <p className="text-xs text-gray-500">{hz} Hz - {freq?.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
