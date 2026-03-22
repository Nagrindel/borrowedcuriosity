import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  BookOpen,
  PenTool,
  Save,
  ArrowLeft,
  Bookmark,
  Trash2,
  Flame,
  Waves,
  Sun,
  Moon,
  Shield,
  Feather,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

interface Passage {
  voice: string;
  resonance: string;
  text: string;
  journalPrompt: string;
}

interface HealingThread {
  id: string;
  title: string;
  theme: string;
  passages: Passage[];
  isGenerated?: boolean;
}

const PREBUILT_THREADS: HealingThread[] = [
  {
    id: "returning-home",
    title: "Returning Home",
    theme: "Self-Acceptance",
    passages: [
      {
        voice: "Inner Child",
        resonance: "Tenderness",
        text: "I have been waiting for you in the rooms you stopped visiting. The ones with low ceilings and soft light, where your laughter used to fill every corner. You do not need to arrive perfect. You only need to arrive.",
        journalPrompt: "What part of yourself have you been avoiding? Write a letter to the version of you that still lives there.",
      },
      {
        voice: "Higher Self",
        resonance: "Clarity",
        text: "You were never broken in the way you believed. The cracks you carry are not evidence of failure. They are the seams where you bent instead of shattered, and that bending is a kind of strength most people never learn.",
        journalPrompt: "Name three ways you have bent without breaking. What did each one teach you?",
      },
      {
        voice: "The Observer",
        resonance: "Stillness",
        text: "Watch how gently the body breathes when you stop telling it how to perform. There is an intelligence in you that predates every wound. It is still running. It has always been running.",
        journalPrompt: "Sit quietly for two minutes with your eyes closed. What does your body want you to know right now?",
      },
      {
        voice: "Inner Child",
        resonance: "Safety",
        text: "I remember when we used to believe we deserved good things without earning them first. Somewhere along the way, someone convinced us that love was a transaction. It never was. It never will be.",
        journalPrompt: "What is one good thing you could receive today without needing to earn it?",
      },
      {
        voice: "Higher Self",
        resonance: "Compassion",
        text: "Coming home to yourself is not a single moment of revelation. It is a thousand small returns. It is choosing, over and over, to stay when every familiar impulse says to run.",
        journalPrompt: "Describe a recent moment when you chose to stay present with yourself instead of numbing out or escaping.",
      },
      {
        voice: "The Observer",
        resonance: "Presence",
        text: "There is nothing to fix here. Only something to witness. Sit with yourself the way you would sit with a friend who has traveled a very long road. Offer water, not advice.",
        journalPrompt: "What would it look like to simply witness your own life today without judging any part of it?",
      },
    ],
  },
  {
    id: "breaking-the-pattern",
    title: "Breaking the Pattern",
    theme: "Releasing Old Cycles",
    passages: [
      {
        voice: "Future Self",
        resonance: "Assurance",
        text: "I am writing to you from the other side of the thing you are most afraid to release. It is quieter here than you imagined. The emptiness you feared turns out to be space, and space turns out to be freedom.",
        journalPrompt: "What pattern in your life feels most like a loop? What would one day look like without it?",
      },
      {
        voice: "The Healer",
        resonance: "Honesty",
        text: "Patterns do not dissolve the moment you name them. They loosen. The naming is important, but the loosening takes patience. You will reach for the old way a hundred more times. Each time you notice, that noticing is the healing.",
        journalPrompt: "Write down a behavior you keep repeating. Without judgment, trace it back to the first time you remember choosing it.",
      },
      {
        voice: "The Warrior",
        resonance: "Courage",
        text: "Some doors close only from the inside. No one else can shut them for you. The strength you need is not the dramatic kind. It is the steady, unglamorous decision to stop walking down a road that no longer leads anywhere worth going.",
        journalPrompt: "What is one door only you can close? What keeps you walking back through it?",
      },
      {
        voice: "Future Self",
        resonance: "Gentleness",
        text: "You will not believe this yet, but the person you become on the other side of this cycle is already forming. She is being shaped by every time you pause before reacting, every time you choose the harder, truer thing.",
        journalPrompt: "Describe the version of yourself who has already broken free of this pattern. What does their daily life look like?",
      },
      {
        voice: "The Healer",
        resonance: "Patience",
        text: "Relapse is not failure. It is the body remembering what it practiced for years. You are not starting over. You are starting from a place of deeper knowing, and that makes all the difference.",
        journalPrompt: "Recall a time you fell back into an old pattern. What did you learn that you could not have learned any other way?",
      },
      {
        voice: "The Warrior",
        resonance: "Resolve",
        text: "The cycle breaks not in a single heroic act but in the accumulated weight of a thousand small refusals. Every time you say not this time, you are forging a new path through the oldest part of your nervous system.",
        journalPrompt: "What is your personal phrase for interrupting an old cycle in the moment? Write it down and place it where you will see it.",
      },
    ],
  },
  {
    id: "the-quiet-after",
    title: "The Quiet After",
    theme: "Grief and Renewal",
    passages: [
      {
        voice: "The Witness",
        resonance: "Honoring",
        text: "Grief is not a problem to be solved. It is the natural shape of love when it has nowhere left to go. Let it move through you without asking it to hurry. It knows its own timing better than your mind does.",
        journalPrompt: "What loss are you still carrying? Give it permission to exist without needing resolution today.",
      },
      {
        voice: "The Garden",
        resonance: "Patience",
        text: "In every garden there is a season of apparent death, when the soil looks barren and the branches stand like bones against the sky. But below the surface, roots are doing their most important work. You are in that season now.",
        journalPrompt: "What might be growing beneath the surface of your grief that you cannot yet see?",
      },
      {
        voice: "The River",
        resonance: "Movement",
        text: "Water does not stop when it meets a stone. It does not fight the stone or pretend the stone is not there. It finds another way forward, and in time, it smooths every sharp edge it touches. Your grief will teach you the same thing.",
        journalPrompt: "Where have you been fighting against what is? What would it feel like to flow around it instead?",
      },
      {
        voice: "The Witness",
        resonance: "Tenderness",
        text: "You are allowed to hold two truths at once. You can miss what is gone and still welcome what is coming. The heart is not a container with a fixed volume. It stretches. It has always been stretching.",
        journalPrompt: "Name something you are grieving and something you are quietly hopeful about. Let them sit side by side.",
      },
      {
        voice: "The Garden",
        resonance: "Renewal",
        text: "The first green shoot after a long winter does not announce itself. It simply appears, small and trembling, asking nothing. Renewal comes the same way. One morning you will notice that the heaviness has shifted, and something tender has taken root.",
        journalPrompt: "Have you noticed any small signs of renewal in your life recently? Write them down, no matter how tiny.",
      },
      {
        voice: "The River",
        resonance: "Release",
        text: "Letting go does not mean forgetting. It means carrying the love without carrying the weight. It means setting down the stone so your hands are free to touch what is alive, what is here, what is still waiting for you.",
        journalPrompt: "If you could set down one thing you have been carrying, what would it be? Imagine placing it gently on the ground.",
      },
      {
        voice: "The Witness",
        resonance: "Trust",
        text: "There is a kind of quiet that follows great loss. It is not emptiness. It is the sound of space being made for something you have not yet imagined. Trust the quiet. It is doing more than you know.",
        journalPrompt: "Spend a few moments in silence. What does the quiet seem to be making room for?",
      },
    ],
  },
  {
    id: "becoming-whole",
    title: "Becoming Whole",
    theme: "Integration",
    passages: [
      {
        voice: "Shadow Self",
        resonance: "Honesty",
        text: "You cannot become whole by cutting away the parts that frighten you. I am the anger you swallowed, the grief you postponed, the hunger you pretended not to feel. I am not your enemy. I am the cost of your survival, and I deserve a seat at the table.",
        journalPrompt: "What emotion have you been exiling? Write to it as if it were a guest you have kept waiting too long.",
      },
      {
        voice: "Light Self",
        resonance: "Warmth",
        text: "Your goodness is not fragile. It does not need to be protected from your darkness. The brightest stars burn in the deepest night. You can hold your joy and your sorrow in the same body without either one consuming the other.",
        journalPrompt: "When did you last feel genuinely joyful? What were you doing, and who were you with?",
      },
      {
        voice: "The Bridge",
        resonance: "Connection",
        text: "Integration is not about making peace between opposites. It is about discovering they were never truly opposed. The part of you that rages and the part of you that loves are made of the same fire, aimed in different directions.",
        journalPrompt: "Choose two qualities in yourself that seem contradictory. How might they actually serve the same purpose?",
      },
      {
        voice: "Shadow Self",
        resonance: "Vulnerability",
        text: "Every mask you wear costs something. I am the face beneath all of them. Not prettier, not uglier. Just real. When you finally look at me without flinching, you will find that I am tired too. And that I have been protecting you this whole time.",
        journalPrompt: "What mask are you most tired of wearing? What would it feel like to set it down, even briefly?",
      },
      {
        voice: "Light Self",
        resonance: "Acceptance",
        text: "You do not need to earn the right to your own wholeness. You were born with every piece already inside you. The work is not addition. It is remembering. It is turning toward everything you turned away from and saying, yes, this too is mine.",
        journalPrompt: "Complete this sentence ten times: 'I am also the person who...' Let yourself be surprised by what comes.",
      },
      {
        voice: "The Bridge",
        resonance: "Unity",
        text: "Wholeness does not feel the way you think it will. It is not the absence of conflict. It is the presence of enough inner space to hold all of your contradictions without collapsing. It is the quiet confidence of a house with many rooms.",
        journalPrompt: "Draw or describe the inner house of your self. How many rooms does it have? Which ones are locked? Which ones are full of light?",
      },
    ],
  },
  {
    id: "permission-to-rest",
    title: "Permission to Rest",
    theme: "Surrender",
    passages: [
      {
        voice: "The Body",
        resonance: "Exhaustion",
        text: "I have been speaking to you for years in a language you forgot how to hear. The tightness in your shoulders, the ache behind your eyes, the way your jaw clenches while you sleep. These are not malfunctions. They are messages. Please stop and listen.",
        journalPrompt: "Place your hand on the part of your body that holds the most tension. Ask it what it needs. Write down whatever comes.",
      },
      {
        voice: "The Earth",
        resonance: "Grounding",
        text: "Nothing in nature blooms all year. The trees do not apologize for their bare branches. The fields do not feel guilty for lying fallow. You are as much a part of the natural world as any of them. You are allowed your winter.",
        journalPrompt: "What season of life are you in right now? Are you honoring it, or fighting against it?",
      },
      {
        voice: "The Moon",
        resonance: "Cycles",
        text: "I disappear every month, and no one calls me broken. I rest in total darkness, and the tides still answer to me. You do not lose your power when you withdraw from the world. Sometimes withdrawal is the most powerful thing you can do.",
        journalPrompt: "When was the last time you withdrew without guilt? What would it take to give yourself that permission now?",
      },
      {
        voice: "The Body",
        resonance: "Softness",
        text: "Rest is not a reward for productivity. It is a biological need as fundamental as hunger. You would not shame yourself for eating. Stop shaming yourself for needing to lie down, to slow down, to do absolutely nothing for an hour.",
        journalPrompt: "List five forms of rest that have nothing to do with sleep. Which ones are you most starved for?",
      },
      {
        voice: "The Earth",
        resonance: "Trust",
        text: "Seeds do not push themselves open. They wait until the soil warms, until the moisture is right, until the conditions align. Then they unfold without effort. Your next season of growth will come when you stop forcing it and start trusting the timing.",
        journalPrompt: "What are you trying to force right now? What would happen if you gave it space instead of pressure?",
      },
      {
        voice: "The Moon",
        resonance: "Surrender",
        text: "Surrender is not defeat. It is the moment you stop fighting the current and realize it was carrying you somewhere all along. Let your hands open. Let your plans dissolve. What remains when you stop holding everything together is often more true than what you were holding.",
        journalPrompt: "Imagine surrendering one thing you have been gripping tightly. What does your life look like with your hands open?",
      },
      {
        voice: "The Body",
        resonance: "Gratitude",
        text: "Even now, while you worry about everything left undone, your heart is beating. Your lungs are filling. Your blood is moving. There is a part of you that never stops working on your behalf, and it is asking for so little in return. Just rest. Just rest.",
        journalPrompt: "Thank your body for three specific things it did for you today. Be as detailed as you can.",
      },
    ],
  },
  {
    id: "the-fire-inside",
    title: "The Fire Inside",
    theme: "Reclaiming Power",
    passages: [
      {
        voice: "The Phoenix",
        resonance: "Transformation",
        text: "You have burned before and it did not end you. Every time they told you it was over, you built something new from the ash. That is not luck. That is not coincidence. That is the part of you that refuses to stay destroyed.",
        journalPrompt: "Name a time you rebuilt yourself after devastation. What did the new version of you know that the old version did not?",
      },
      {
        voice: "The Ancestor",
        resonance: "Lineage",
        text: "Before you were you, there were others who survived impossible things so that one day you could exist. Their strength is not metaphorical. It is in your blood, your bone, your stubborn refusal to give up when everything says you should. You come from people who endured.",
        journalPrompt: "Think of an ancestor, real or imagined, whose strength you carry. What would they say to you right now?",
      },
      {
        voice: "The Storm",
        resonance: "Power",
        text: "You were taught to be palatable. To sand down your edges, to lower your voice, to take up less room. But there is a storm inside you that was never meant to be small. The world does not need your smallness. It needs the full, unedited force of what you carry.",
        journalPrompt: "Where in your life have you been making yourself smaller? What would the full-volume version of you do differently?",
      },
      {
        voice: "The Phoenix",
        resonance: "Rebirth",
        text: "Do not mourn the person you were before the fire. She did what she could with what she had. Honor her by becoming what she could not yet imagine. Every ending you have survived has been a doorway dressed as a wall.",
        journalPrompt: "What ending turned out to be a beginning? How did that shift change the way you see transitions?",
      },
      {
        voice: "The Ancestor",
        resonance: "Reclamation",
        text: "Reclaiming your power does not mean becoming loud. It means becoming unavailable for situations that require you to abandon yourself. It means choosing, quietly and completely, to stop betraying your own knowing in order to keep others comfortable.",
        journalPrompt: "Where have you been betraying your own knowing recently? What would it look like to honor it instead?",
      },
      {
        voice: "The Storm",
        resonance: "Release",
        text: "Let the storm come. Let it tear apart the structures that were never truly yours. Let it rearrange the landscape of your life until the only things left standing are the ones with roots deep enough to hold. You do not need to be afraid of your own power.",
        journalPrompt: "What in your life is ready to be torn apart and rebuilt? What would you want to remain standing?",
      },
    ],
  },
];

const GENERATOR_THEMES = [
  "Self-Love",
  "Forgiveness",
  "Courage",
  "Trust",
  "Grief",
  "Boundaries",
  "Transformation",
  "Gratitude",
  "Letting Go",
  "Beginning Again",
];

const themeIcons: Record<string, React.ReactNode> = {
  "Self-Acceptance": <Heart className="w-4 h-4" />,
  "Releasing Old Cycles": <Shield className="w-4 h-4" />,
  "Grief and Renewal": <Waves className="w-4 h-4" />,
  Integration: <Sun className="w-4 h-4" />,
  Surrender: <Moon className="w-4 h-4" />,
  "Reclaiming Power": <Flame className="w-4 h-4" />,
};

const themeColors: Record<string, string> = {
  "Self-Acceptance": "from-rose-500/20 to-pink-500/5",
  "Releasing Old Cycles": "from-amber-500/20 to-orange-500/5",
  "Grief and Renewal": "from-cyan-500/20 to-blue-500/5",
  Integration: "from-emerald-500/20 to-green-500/5",
  Surrender: "from-indigo-500/20 to-violet-500/5",
  "Reclaiming Power": "from-red-500/20 to-orange-500/5",
};

const voiceColors: Record<string, string> = {
  "Inner Child": "bg-pink-500/10 text-pink-400",
  "Higher Self": "bg-violet-500/10 text-violet-400",
  "The Observer": "bg-slate-500/10 text-slate-400",
  "Future Self": "bg-sky-500/10 text-sky-400",
  "The Healer": "bg-emerald-500/10 text-emerald-400",
  "The Warrior": "bg-amber-500/10 text-amber-400",
  "The Witness": "bg-indigo-500/10 text-indigo-400",
  "The Garden": "bg-green-500/10 text-green-400",
  "The River": "bg-cyan-500/10 text-cyan-400",
  "Shadow Self": "bg-gray-500/10 text-gray-400",
  "Light Self": "bg-yellow-500/10 text-yellow-400",
  "The Bridge": "bg-teal-500/10 text-teal-400",
  "The Body": "bg-rose-500/10 text-rose-400",
  "The Earth": "bg-lime-500/10 text-lime-400",
  "The Moon": "bg-purple-500/10 text-purple-400",
  "The Phoenix": "bg-orange-500/10 text-orange-400",
  "The Ancestor": "bg-amber-500/10 text-amber-300",
  "The Storm": "bg-blue-500/10 text-blue-400",
};

const STORAGE_KEY = "borrowed-curiosity-healing-threads";

function loadSavedThreads(): HealingThread[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function persistThreads(threads: HealingThread[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

export default function HealingThreads() {
  const [view, setView] = useState<"browse" | "read" | "generate">("browse");
  const [activeThread, setActiveThread] = useState<HealingThread | null>(null);
  const [passageIndex, setPassageIndex] = useState(0);
  const [showJournalPrompt, setShowJournalPrompt] = useState(false);
  const [savedThreads, setSavedThreads] = useState<HealingThread[]>(loadSavedThreads);

  const [genTheme, setGenTheme] = useState("");
  const [genIntention, setGenIntention] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    persistThreads(savedThreads);
  }, [savedThreads]);

  const openThread = (thread: HealingThread) => {
    setActiveThread(thread);
    setPassageIndex(0);
    setShowJournalPrompt(false);
    setView("read");
  };

  const closeReader = () => {
    setActiveThread(null);
    setPassageIndex(0);
    setShowJournalPrompt(false);
    setView("browse");
  };

  const goNext = () => {
    if (!activeThread) return;
    if (passageIndex < activeThread.passages.length - 1) {
      setPassageIndex((i) => i + 1);
      setShowJournalPrompt(false);
    }
  };

  const goPrev = () => {
    if (passageIndex > 0) {
      setPassageIndex((i) => i - 1);
      setShowJournalPrompt(false);
    }
  };

  const saveThread = (thread: HealingThread) => {
    setSavedThreads((prev) => {
      if (prev.some((t) => t.id === thread.id)) return prev;
      return [...prev, thread];
    });
  };

  const removeSaved = (id: string) => {
    setSavedThreads((prev) => prev.filter((t) => t.id !== id));
  };

  const isThreadSaved = (id: string) => savedThreads.some((t) => t.id === id);

  const generateThread = async () => {
    if (!genTheme) return;
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/healing-thread/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: genTheme,
          intention: genIntention || undefined,
        }),
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response. Please try again.");
      }
      if (!res.ok) throw new Error(data.error || "Request failed");

      const thread: HealingThread = {
        id: `generated-${Date.now()}`,
        title: data.title || genTheme,
        theme: genTheme,
        passages: data.passages || [],
        isGenerated: true,
      };

      saveThread(thread);
      openThread(thread);
    } catch (err: any) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const currentPassage = activeThread?.passages[passageIndex];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="section-padding min-h-[35vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-400 mb-6">
              <Heart className="w-3.5 h-3.5" /> Soul-Guided Reading
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5">
              Healing <span className="text-gradient">Threads</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Nonlinear passages for the soul. Read at your own pace, follow
              the voices that call to you, and let the words land where they
              need to.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          {/* ──── READER VIEW ──── */}
          {view === "read" && activeThread && currentPassage && (
            <motion.div
              key="reader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Reader header */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={closeReader}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="text-center">
                  <h2 className="font-display text-lg font-semibold">
                    {activeThread.title}
                  </h2>
                  <p className="text-xs text-gray-500">{activeThread.theme}</p>
                </div>
                <button
                  onClick={() =>
                    isThreadSaved(activeThread.id)
                      ? removeSaved(activeThread.id)
                      : saveThread(activeThread)
                  }
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    isThreadSaved(activeThread.id)
                      ? "text-brand-400"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Bookmark
                    className="w-4 h-4"
                    fill={isThreadSaved(activeThread.id) ? "currentColor" : "none"}
                  />
                  {isThreadSaved(activeThread.id) ? "Saved" : "Save"}
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>
                    Passage {passageIndex + 1} of {activeThread.passages.length}
                  </span>
                  <span className={voiceColors[currentPassage.voice] || "text-gray-400"}>
                    {currentPassage.voice}
                  </span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-400"
                    initial={false}
                    animate={{
                      width: `${((passageIndex + 1) / activeThread.passages.length) * 100}%`,
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Passage content */}
              <div
                className="min-h-[300px] relative touch-pan-y"
                onTouchStart={(e) => {
                  (e.currentTarget as any)._touchX = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  const startX = (e.currentTarget as any)._touchX;
                  if (startX == null) return;
                  const diff = e.changedTouches[0].clientX - startX;
                  if (Math.abs(diff) > 50) {
                    if (diff < 0) goNext();
                    if (diff > 0) goPrev();
                  }
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={passageIndex}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="glass-card"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          voiceColors[currentPassage.voice] || "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {currentPassage.voice}
                      </span>
                      <span className="text-xs text-gray-500 italic">
                        {currentPassage.resonance}
                      </span>
                    </div>

                    <p className="text-lg sm:text-xl leading-relaxed text-gray-200 dark:text-gray-200 font-light mb-8">
                      {currentPassage.text}
                    </p>

                    {/* Reflect button */}
                    <button
                      onClick={() => setShowJournalPrompt(!showJournalPrompt)}
                      className={`flex items-center gap-2 text-sm font-medium transition-all ${
                        showJournalPrompt
                          ? "text-brand-400"
                          : "text-gray-500 hover:text-brand-400"
                      }`}
                    >
                      <PenTool className="w-4 h-4" />
                      {showJournalPrompt ? "Close Reflection" : "Reflect"}
                    </button>

                    <AnimatePresence>
                      {showJournalPrompt && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-white/5">
                            <p className="text-xs text-brand-400 font-medium mb-2">
                              Journal Prompt
                            </p>
                            <p className="text-sm text-gray-400 leading-relaxed">
                              {currentPassage.journalPrompt}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={goPrev}
                  disabled={passageIndex === 0}
                  className="btn-outline flex items-center gap-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {/* Passage dots */}
                <div className="flex gap-1.5">
                  {activeThread.passages.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Go to passage ${i + 1}`}
                      onClick={() => {
                        setPassageIndex(i);
                        setShowJournalPrompt(false);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === passageIndex
                          ? "bg-brand-500 w-6"
                          : i < passageIndex
                            ? "bg-brand-500/40"
                            : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={goNext}
                  disabled={passageIndex === activeThread.passages.length - 1}
                  className="btn-outline flex items-center gap-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ──── GENERATOR VIEW ──── */}
          {view === "generate" && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setView("browse")}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="font-display text-lg font-semibold">
                  Create a Thread
                </h2>
                <div className="w-16" />
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-4">
                  Choose a Theme
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {GENERATOR_THEMES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setGenTheme(t)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        genTheme === t
                          ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                          : "glass hover:bg-brand-500/10"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-2">
                  Personal Intention{" "}
                  <span className="text-xs text-gray-500 font-normal">
                    (optional)
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  A sentence about what you are working through or hoping to
                  receive.
                </p>
                <textarea
                  value={genIntention}
                  onChange={(e) => setGenIntention(e.target.value)}
                  placeholder="e.g., I am learning to trust myself again after a difficult year."
                  rows={3}
                  className="w-full glass rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                />
              </div>

              {genError && (
                <p className="text-sm text-red-400 text-center bg-red-500/10 rounded-lg py-2 px-4">
                  {genError}
                </p>
              )}

              <button
                onClick={generateThread}
                disabled={!genTheme || generating}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Weaving your
                    thread...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Generate Healing Thread
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* ──── BROWSE VIEW ──── */}
          {view === "browse" && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Action buttons */}
              <div className="flex gap-3 mb-10">
                <button
                  onClick={() => setView("generate")}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4" /> Create Custom Thread
                </button>
              </div>

              {/* Pre-built threads */}
              <div className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-5 h-5 text-brand-400" />
                  <h2 className="font-display text-xl font-bold">
                    Healing Threads
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PREBUILT_THREADS.map((thread, idx) => (
                    <motion.button
                      key={thread.id}
                      {...fadeUp}
                      transition={{ duration: 0.5, delay: idx * 0.08 }}
                      onClick={() => openThread(thread)}
                      className="glass-card text-left group"
                    >
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
                          themeColors[thread.theme] || "from-brand-500/20 to-violet-500/5"
                        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-brand-400">
                            {themeIcons[thread.theme] || (
                              <Feather className="w-4 h-4" />
                            )}
                          </span>
                          <span className="text-xs text-gray-500">
                            {thread.theme}
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-semibold mb-2">
                          {thread.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                          {thread.passages.length} passages
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.from(
                            new Set(thread.passages.map((p) => p.voice))
                          ).map((voice) => (
                            <span
                              key={voice}
                              className={`text-[10px] px-2 py-0.5 rounded-full ${
                                voiceColors[voice] || "bg-gray-500/10 text-gray-400"
                              }`}
                            >
                              {voice}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Saved threads */}
              {savedThreads.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Save className="w-5 h-5 text-brand-400" />
                    <h2 className="font-display text-xl font-bold">
                      Saved Threads
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedThreads.map((thread, idx) => (
                      <motion.div
                        key={thread.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.06 }}
                        className="glass-card relative group"
                      >
                        <button
                          onClick={() => openThread(thread)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            {thread.isGenerated ? (
                              <Sparkles className="w-4 h-4 text-brand-400" />
                            ) : (
                              <span className="text-brand-400">
                                {themeIcons[thread.theme] || (
                                  <Feather className="w-4 h-4" />
                                )}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {thread.theme}
                            </span>
                            {thread.isGenerated && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400">
                                Custom
                              </span>
                            )}
                          </div>
                          <h3 className="font-display text-lg font-semibold mb-2">
                            {thread.title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {thread.passages.length} passages
                          </p>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSaved(thread.id);
                          }}
                          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          aria-label="Remove saved thread"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
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
