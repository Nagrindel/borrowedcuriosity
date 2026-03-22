import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Dices, HelpCircle, Cake, RotateCcw, ChevronRight,
  Flame, Droplets, Wind, Mountain, Eye, Star, Shuffle,
} from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

type Element = "fire" | "water" | "air" | "earth" | "spirit";

interface OracleCard {
  name: string;
  element: Element;
  upright: string;
  reversed: string;
  symbol: string;
}

const ELEMENT_COLORS: Record<Element, string> = {
  fire: "from-orange-500 to-red-600",
  water: "from-cyan-400 to-blue-600",
  air: "from-violet-400 to-indigo-600",
  earth: "from-emerald-500 to-green-700",
  spirit: "from-amber-400 to-purple-600",
};

const ELEMENT_ICONS: Record<Element, typeof Flame> = {
  fire: Flame,
  water: Droplets,
  air: Wind,
  earth: Mountain,
  spirit: Star,
};

const ORACLE_DECK: OracleCard[] = [
  { name: "The Seeker", element: "air", symbol: "I", upright: "A new quest is calling you forward. Trust the pull of curiosity and step into the unknown with open eyes.", reversed: "You may be avoiding a truth that wants your attention. Stillness, not searching, holds your answer right now." },
  { name: "The Mirror", element: "water", symbol: "II", upright: "What you see in others reflects something within yourself. This is a time for honest self-examination.", reversed: "You are projecting your fears onto the world around you. Release judgment and look inward with compassion." },
  { name: "The Flame", element: "fire", symbol: "III", upright: "Passion and creative force are surging through you. Channel this energy with intention before it burns unchecked.", reversed: "Your inner fire has dimmed. Reconnect with what once lit you up and tend those embers gently." },
  { name: "The River", element: "water", symbol: "IV", upright: "Surrender to the natural flow of events. Resistance only creates suffering where none needs to exist.", reversed: "You have been drifting without direction. It is time to choose your course rather than letting the current decide." },
  { name: "The Mountain", element: "earth", symbol: "V", upright: "Stand firm in your convictions. You have the endurance and strength to weather what lies ahead.", reversed: "Stubbornness is masquerading as strength. Flexibility is not weakness; it is wisdom." },
  { name: "The Star", element: "spirit", symbol: "VI", upright: "Hope is well placed right now. A guiding light is visible if you lift your gaze above the immediate chaos.", reversed: "You have lost sight of your north star. Reconnect with your deepest values before moving forward." },
  { name: "The Shadow", element: "spirit", symbol: "VII", upright: "Something hidden is ready to be acknowledged. Facing your shadow brings integration and wholeness.", reversed: "You are running from a part of yourself that holds great power. What you deny controls you." },
  { name: "The Bridge", element: "air", symbol: "VIII", upright: "A connection between two worlds or two phases of life is forming. Walk across with confidence.", reversed: "You are standing between choices, paralyzed. One step in any direction is better than none." },
  { name: "The Garden", element: "earth", symbol: "IX", upright: "Your efforts are about to bear fruit. Continue tending to what you have planted with care and patience.", reversed: "Neglect has crept into something you once nurtured. Return your attention before the roots wither." },
  { name: "The Storm", element: "water", symbol: "X", upright: "Disruption clears the way for renewal. Let the old structures fall so new growth can emerge.", reversed: "You are creating unnecessary turmoil. Seek calm before the storm you are building consumes you." },
  { name: "The Anchor", element: "earth", symbol: "XI", upright: "Ground yourself in what is real and tangible. Stability is your greatest ally in this season.", reversed: "You are clinging to something that should be released. Security found in stagnation is an illusion." },
  { name: "The Compass", element: "air", symbol: "XII", upright: "Your inner guidance system is calibrated and clear. Trust the direction you feel drawn toward.", reversed: "Too many voices are influencing your path. Quiet the noise and find your own true north." },
  { name: "The Veil", element: "spirit", symbol: "XIII", upright: "A mystery is unfolding. Not everything needs to be understood right now; let revelation come in its own time.", reversed: "You are hiding from a truth in plain sight. Lift the veil and see what has been there all along." },
  { name: "The Crown", element: "spirit", symbol: "XIV", upright: "Step into your authority. You have earned the wisdom to lead and the right to claim your place.", reversed: "Ego is overshadowing genuine leadership. True sovereignty requires humility and service." },
  { name: "The Root", element: "earth", symbol: "XV", upright: "Return to your foundations. The answers you seek live in your origins and your deepest knowing.", reversed: "Unresolved ancestral patterns are repeating. Acknowledge the root to stop the cycle." },
  { name: "The Echo", element: "air", symbol: "XVI", upright: "A message from your past is resurfacing with new meaning. Listen closely to what it teaches now.", reversed: "You are caught in a loop, repeating old stories. Break the pattern by choosing a different response." },
  { name: "The Prism", element: "spirit", symbol: "XVII", upright: "One situation holds many perspectives. Step back and appreciate the full spectrum before deciding.", reversed: "You are seeing only one facet of a complex truth. Broaden your view before drawing conclusions." },
  { name: "The Chalice", element: "water", symbol: "XVIII", upright: "Emotional abundance is flowing toward you. Open your heart to receive the love and healing being offered.", reversed: "You have been pouring from an empty vessel. Replenish yourself before giving to others." },
  { name: "The Key", element: "air", symbol: "XIX", upright: "A solution or breakthrough is within reach. The obstacle you face has a specific, discoverable answer.", reversed: "You are trying to force a door that is not meant to open. Seek a different entrance." },
  { name: "The Threshold", element: "spirit", symbol: "XX", upright: "You stand at a doorway between who you were and who you are becoming. Cross over with courage.", reversed: "Fear of transformation is holding you in a space you have outgrown. Growth awaits on the other side." },
  { name: "The Spiral", element: "water", symbol: "XXI", upright: "You are revisiting a familiar lesson at a higher level. Trust the process; you are not going backward.", reversed: "Circular thinking is trapping you. Break free by approaching the problem from an entirely new angle." },
  { name: "The Feather", element: "air", symbol: "XXII", upright: "Lightness and grace are available to you. Release heaviness and let your spirit rise unencumbered.", reversed: "You are carrying burdens that are not yours to bear. Set them down and reclaim your freedom." },
  { name: "The Tower", element: "fire", symbol: "XXIII", upright: "A structure built on false premises must fall. This collapse, though painful, is ultimately liberating.", reversed: "You are clinging to something crumbling. Let go gracefully rather than being pulled down with it." },
  { name: "The Moon Pool", element: "water", symbol: "XXIV", upright: "Deep intuition and psychic clarity are heightened. Trust the messages rising from your subconscious.", reversed: "Illusions and wishful thinking are clouding your perception. Seek grounded truth over beautiful fantasies." },
  { name: "The Sun Gate", element: "fire", symbol: "XXV", upright: "Vitality, joy, and clarity are streaming in. Step into the warmth and let it illuminate your path.", reversed: "You are shielding yourself from joy you deserve. Allow brightness into the corners you have kept dark." },
  { name: "The Weaver", element: "earth", symbol: "XXVI", upright: "Every thread of your experience is being woven into something meaningful. Trust the pattern forming.", reversed: "You are trying to control outcomes too tightly. Loosen your grip and let the design reveal itself." },
  { name: "The Oracle", element: "spirit", symbol: "XXVII", upright: "Deep knowing is available to you right now. Speak your truth and trust the wisdom flowing through you.", reversed: "You are doubting your own inner voice. The answers you seek from others already live within." },
  { name: "The Phoenix", element: "fire", symbol: "XXVIII", upright: "Transformation through release. What is ending is creating space for a magnificent rebirth.", reversed: "You are resisting a necessary ending. Clinging to ashes prevents the new flame from igniting." },
  { name: "The Labyrinth", element: "earth", symbol: "XXIX", upright: "The journey inward is the journey forward. Walk the winding path with trust; it leads to your center.", reversed: "You feel lost, but you are not. Every turn has been purposeful. Keep walking." },
  { name: "The Seed", element: "earth", symbol: "XXX", upright: "Something precious is germinating beneath the surface. Nurture it with patience; growth takes time.", reversed: "An idea or intention was planted but forgotten. Revisit your dreams and give them the care they need." },
  { name: "The Harvest", element: "earth", symbol: "XXXI", upright: "The time of reaping has come. Celebrate your work and receive the abundance you have cultivated.", reversed: "You are harvesting too early or taking what is not yet ripe. Patience will yield greater rewards." },
  { name: "The Tide", element: "water", symbol: "XXXII", upright: "Natural rhythms are at work. Allow the ebb and flow without fighting the current phase.", reversed: "You are forcing action during a period meant for rest, or resting when action is called for. Realign with the rhythm." },
  { name: "The Lantern", element: "fire", symbol: "XXXIII", upright: "You are a light for others in this moment. Share your warmth and wisdom generously.", reversed: "Your light is dimming under the weight of self-neglect. Tend your own flame before illuminating others." },
  { name: "The Raven", element: "air", symbol: "XXXIV", upright: "A message is arriving from beyond ordinary perception. Pay attention to signs, synchronicities, and dreams.", reversed: "You are overthinking the signs. Not everything is a message; some things are simply what they are." },
  { name: "The Crystal", element: "earth", symbol: "XXXV", upright: "Clarity and precision are your gifts right now. See through confusion and act on what is clear.", reversed: "Rigid thinking is limiting your possibilities. Soften your perspective and allow nuance." },
  { name: "The Flame Keeper", element: "fire", symbol: "XXXVI", upright: "Sacred devotion and commitment sustain what matters most. Tend the fires of your deepest purpose.", reversed: "Burnout threatens your most sacred work. Step back, rest, and remember why you began." },
  { name: "The Dream Walker", element: "spirit", symbol: "XXXVII", upright: "The boundary between waking and dreaming is thin. Insights from the imaginal realm want to reach you.", reversed: "Fantasy is replacing action. Ground your visions in practical steps or they remain only dreams." },
  { name: "The Earth Song", element: "earth", symbol: "XXXVIII", upright: "Nature holds the medicine you need. Connect with the living world to restore balance and harmony.", reversed: "You have disconnected from the natural world and your own body. Return to the earth for healing." },
  { name: "The Wind Caller", element: "air", symbol: "XXXIX", upright: "Communication and new ideas are flowing freely. Share your voice and let your thoughts travel far.", reversed: "Scattered thoughts and careless words are creating confusion. Focus your message before speaking." },
  { name: "The Water Bearer", element: "water", symbol: "XL", upright: "You carry healing and emotional wisdom for others. Pour generously from your deep well of empathy.", reversed: "You are absorbing others' emotions at the cost of your own wellbeing. Establish boundaries with love." },
  { name: "The Light Bringer", element: "fire", symbol: "XLI", upright: "You are called to bring illumination where there is darkness. Your courage to shine inspires transformation.", reversed: "Fear of being seen is dimming your impact. The world needs your light even when it feels vulnerable to share." },
];

const TABS = [
  { id: "cards", label: "Card Draw", icon: Sparkles },
  { id: "dice", label: "Dice Oracle", icon: Dices },
  { id: "decision", label: "Decision Oracle", icon: HelpCircle },
  { id: "birth", label: "Birth Card", icon: Cake },
] as const;

type TabId = (typeof TABS)[number]["id"];

const DICE_MEANINGS: Record<string, string> = {
  "1": "Unity and new beginnings. The universe is aligning a fresh start for you.",
  "2": "Duality and balance. Seek harmony between two forces in your life.",
  "3": "Creative expression. The time is ripe to bring your vision into form.",
  "4": "Stability and foundation. Build on solid ground before reaching higher.",
  "5": "Change and freedom. Release what confines you and welcome transformation.",
  "6": "Harmony and responsibility. Nurture your relationships and honor your commitments.",
  "1,1": "Doubled initiation. A powerful new chapter begins with amplified energy.",
  "1,2": "The pioneer meets the peacemaker. Lead with courage but listen with empathy.",
  "1,3": "Inspired action. Your creative impulse deserves bold, immediate expression.",
  "1,4": "Visionary foundations. Your new idea needs structure to become real.",
  "1,5": "Adventurous beginnings. Take the leap; the net appears for those who dare.",
  "1,6": "Leadership through love. Guide others with both strength and compassion.",
  "2,2": "Deep partnership. A significant bond is forming or deepening.",
  "2,3": "Creative collaboration. Together you can build what neither could alone.",
  "2,4": "Patient partnership. Steady, shared effort builds something lasting.",
  "2,5": "Dynamic balance. Embrace change within your closest relationships.",
  "2,6": "Nurturing bonds. Pour love into your connections and watch them flourish.",
  "3,3": "Creative abundance. Your artistic and expressive powers are at their peak.",
  "3,4": "Manifesting dreams. Give your creative visions practical form.",
  "3,5": "Inspired change. Let creativity guide you through this period of transition.",
  "3,6": "Joyful service. Your gifts bring healing and happiness to those around you.",
  "4,4": "Immovable strength. You are building something that will endure for generations.",
  "4,5": "Structured freedom. Create a framework that supports rather than confines you.",
  "4,6": "Sacred duty. Your responsibilities carry deep meaning and spiritual weight.",
  "5,5": "Radical transformation. Everything is shifting; embrace the beautiful chaos.",
  "5,6": "Liberating love. Freedom and responsibility can coexist in perfect harmony.",
  "6,6": "Unconditional love. Open your heart fully; you are protected in this vulnerability.",
  "1,1,1": "Triple initiation. A once-in-a-lifetime new beginning of extraordinary power.",
  "2,2,2": "Sacred mirrors. Your relationships are reflecting your deepest truths back to you.",
  "3,3,3": "Creative mastery. You are channeling inspiration from a profound source.",
  "4,4,4": "Unshakeable ground. The universe is fortifying your foundations on every level.",
  "5,5,5": "Total metamorphosis. Surrender to the transformation; you emerge renewed.",
  "6,6,6": "Infinite compassion. Unconditional love is the answer to every question you hold.",
  "1,2,3": "Sequential awakening. Mind, heart, and spirit are aligning step by step.",
  "4,5,6": "Evolution through structure. Growth comes from honoring both discipline and freedom.",
  "1,3,5": "The adventurer's spark. Bold creativity and restless curiosity light your way.",
  "2,4,6": "The nurturer's path. Patience, devotion, and partnership define this season.",
};

const DECISION_RESPONSES = [
  { answer: "Yes, wholeheartedly", reasoning: "The energy surrounding your question carries a clear affirmative vibration. The path forward is open and the forces around you are supportive. Trust the momentum already building." },
  { answer: "Yes, but with patience", reasoning: "Your desired outcome is aligned, though the timing requires trust. What you seek is coming, but rushing it may diminish its fullness. Allow the process to unfold naturally." },
  { answer: "Yes, once you release a fear", reasoning: "Something within you already knows this is the right direction. The only barrier is an old fear still gripping your heart. Name it, honor it, and let it go." },
  { answer: "Not yet, but soon", reasoning: "The seeds of your answer have been planted, but they need more time beneath the surface. Continue tending your intention and the sprout will emerge when the soil is warm." },
  { answer: "The answer lives in stillness", reasoning: "Your mind is too active to receive the clarity you seek. Step away from analysis and sit in quiet presence. The answer will surface when you stop grasping for it." },
  { answer: "No, and that is a gift", reasoning: "What feels like denial is actually redirection. The universe is steering you toward something more aligned with your true path. Trust this closing of a door." },
  { answer: "No, not in this form", reasoning: "The essence of what you desire is valid, but the specific form you are imagining is not the right vessel. Reimagine your goal and a new avenue will open." },
  { answer: "Look deeper before deciding", reasoning: "There is a layer to this question you have not yet examined. Before seeking a yes or no, ask yourself what is truly driving the question. The real answer lies beneath." },
  { answer: "Yes, and others will follow", reasoning: "Your choice ripples outward. This decision does not only serve you; it creates a path for others who are watching and waiting for permission to do the same." },
  { answer: "Release the question entirely", reasoning: "The act of holding this question so tightly is creating the very tension you wish to resolve. Let go of needing an answer and watch how life rearranges itself." },
  { answer: "Trust your body's wisdom", reasoning: "Your intellect has been circling this question, but your body already holds the answer. Notice where you feel expansion or contraction when you imagine each outcome." },
  { answer: "Yes, with one condition", reasoning: "The path is open, but it requires you to leave behind a habit, belief, or attachment that no longer serves you. That release is the price of admission." },
  { answer: "Both paths serve you", reasoning: "You are framing this as binary when both directions contain growth. The real question is not which is right, but which lessons you are ready to learn next." },
  { answer: "Not for you to decide alone", reasoning: "This question involves energies beyond just your own. A conversation, a collaboration, or a moment of shared honesty is needed before the way forward becomes clear." },
  { answer: "Yes, and it has already begun", reasoning: "The shift you are asking about is not future tense. Look around you carefully and you will see that the answer is already manifesting in subtle ways." },
];

const MAJOR_ARCANA = [
  { number: 0, name: "The Fool", meaning: "You carry the archetype of the eternal beginner. Your spirit is adventurous, trusting, and drawn to leaping into the unknown. Your life path is one of faith over fear, embracing each moment with wonder." },
  { number: 1, name: "The Magician", meaning: "You are the conscious creator, possessing all the tools needed to manifest your vision. Your archetype channels willpower, skill, and focused intention to shape reality from pure potential." },
  { number: 2, name: "The High Priestess", meaning: "You embody deep intuition and the keeper of hidden knowledge. Your path is one of inner knowing, mystical perception, and honoring the wisdom that lives in silence and shadow." },
  { number: 3, name: "The Empress", meaning: "You are the nurturer and creative force. Abundance, beauty, and generative power flow through your archetype. Your purpose is to cultivate growth in all its forms." },
  { number: 4, name: "The Emperor", meaning: "You carry the energy of structure, authority, and protection. Your path involves creating order, establishing boundaries, and building foundations that endure." },
  { number: 5, name: "The Hierophant", meaning: "You are the spiritual teacher and keeper of sacred traditions. Your archetype bridges the visible and invisible worlds, sharing wisdom through established paths of learning." },
  { number: 6, name: "The Lovers", meaning: "Your archetype centers on sacred relationship, alignment of values, and meaningful choice. You navigate life through deep connection and the courage of authentic union." },
  { number: 7, name: "The Chariot", meaning: "You are the triumphant will in motion. Your path demands discipline, determination, and the mastery of opposing forces to move steadily toward your purpose." },
  { number: 8, name: "Strength", meaning: "Your archetype is gentle power and courageous compassion. You tame what is wild not through force but through patience, love, and unwavering inner resolve." },
  { number: 9, name: "The Hermit", meaning: "You walk the path of the solitary seeker. Wisdom comes to you through contemplation, withdrawal from noise, and the patient search for inner truth." },
  { number: 10, name: "The Wheel of Fortune", meaning: "You are attuned to the cycles of fate and fortune. Your archetype understands that all things turn, and your wisdom lies in riding the wheel with grace." },
  { number: 11, name: "Justice", meaning: "You carry the archetype of truth, fairness, and karmic balance. Your path demands honesty, accountability, and the courage to see clearly without bias." },
  { number: 12, name: "The Hanged One", meaning: "Your archetype embraces surrender and seeing from new perspectives. By releasing control and turning the world upside down, you discover truths invisible to others." },
  { number: 13, name: "Death", meaning: "You embody the power of transformation and sacred endings. Your archetype releases what no longer serves so that rebirth can occur in its fullest expression." },
  { number: 14, name: "Temperance", meaning: "You are the alchemist of balance, blending opposing forces into harmony. Your path is one of patience, moderation, and the sacred art of integration." },
  { number: 15, name: "The Devil", meaning: "Your archetype confronts bondage, shadow, and material attachment. Your greatest power comes from recognizing what chains you and choosing liberation through awareness." },
  { number: 16, name: "The Tower", meaning: "You carry the energy of sudden revelation and necessary destruction. Your archetype shatters illusions so that truth can stand unobstructed." },
  { number: 17, name: "The Star", meaning: "You are the bearer of hope and cosmic inspiration. Your archetype heals through faith, pouring light into darkness and reminding the world of its inherent beauty." },
  { number: 18, name: "The Moon", meaning: "Your path winds through the landscape of dreams, illusions, and deep emotional truth. Your archetype navigates the unconscious with courage and receptivity." },
  { number: 19, name: "The Sun", meaning: "You radiate vitality, clarity, and joyful authenticity. Your archetype illuminates everything it touches, bringing warmth and truth wherever shadows have gathered." },
  { number: 20, name: "Judgement", meaning: "You carry the call to awakening and spiritual reckoning. Your archetype answers the summons to rise, to evaluate, and to embrace your higher purpose." },
  { number: 21, name: "The World", meaning: "You embody completion, integration, and cosmic wholeness. Your archetype dances at the center of all creation, having gathered the lessons of every path into unity." },
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function hashQuestion(q: string): number {
  let hash = 0;
  const normalized = q.toLowerCase().replace(/[^a-z]/g, "");
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  hash ^= Date.now();
  return hash;
}

function reduceToBirthCard(dateStr: string): number {
  const digits = dateStr.replace(/\D/g, "");
  let sum = 0;
  for (const d of digits) sum += parseInt(d, 10);
  while (sum > 22) {
    let newSum = 0;
    for (const d of String(sum)) newSum += parseInt(d, 10);
    sum = newSum;
  }
  return sum;
}

function getDiceMeaning(values: number[]): string {
  const sorted = [...values].sort();
  const key = sorted.join(",");
  if (DICE_MEANINGS[key]) return DICE_MEANINGS[key];
  const total = sorted.reduce((a, b) => a + b, 0);
  const meanings: Record<number, string> = {
    2: "Duality and choice. Two paths are before you; trust your intuition to guide the way.",
    3: "The trinity of mind, body, and spirit is calling for alignment.",
    4: "Four corners of stability. Ground yourself before the next step.",
    5: "Five points of change. Transformation is in motion.",
    6: "Harmony and healing. Balance is restoring itself in your life.",
    7: "The sacred seven. Spiritual insight and inner wisdom are heightened.",
    8: "Infinite flow. Abundance is circulating toward and through you.",
    9: "Completion approaches. A cycle is reaching its natural end.",
    10: "A new cycle at a higher octave. You return to the beginning, but wiser.",
    11: "Master number of intuition. Your psychic awareness is sharpening.",
    12: "The cosmic clock. Timing is everything, and the hour is near.",
    13: "Transformation and rebirth. Let the old self dissolve into the new.",
    14: "Temperance and alchemy. Blend opposing forces with grace.",
    15: "Shadow and liberation. Face what binds you to set yourself free.",
    16: "Revelation through upheaval. What breaks open reveals what was hidden.",
    17: "Starlight and hope. The cosmos is whispering encouragement.",
    18: "The depths of intuition. Navigate by feeling rather than logic.",
  };
  return meanings[total] || `Your total of ${total} carries the vibration of deep personal power. Trust the energy this number brings to your current situation.`;
}

function CardDraw() {
  const [drawn, setDrawn] = useState<(OracleCard & { isReversed: boolean })[]>([]);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [drawing, setDrawing] = useState(false);

  const draw = useCallback((count: 1 | 3) => {
    setDrawn([]);
    setFlipped(new Set());
    setDrawing(true);
    setTimeout(() => {
      const shuffled = shuffleArray(ORACLE_DECK);
      const cards = shuffled.slice(0, count).map((c) => ({
        ...c,
        isReversed: Math.random() < 0.3,
      }));
      setDrawn(cards);
      setDrawing(false);
    }, 400);
  }, []);

  const flipCard = useCallback((idx: number) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <p className="text-foreground/70 max-w-xl mx-auto">
          Focus your mind on a question or simply open yourself to receive guidance.
          Draw one card for a focused answer, or three for past, present, and future.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="btn-primary gap-2" onClick={() => draw(1)} disabled={drawing}>
            <Sparkles className="w-4 h-4" /> Draw One
          </button>
          <button className="btn-outline gap-2" onClick={() => draw(3)} disabled={drawing}>
            <Shuffle className="w-4 h-4" /> Draw Three
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {drawing && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-violet-500" />
            </motion.div>
          </motion.div>
        )}

        {!drawing && drawn.length > 0 && (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid gap-6 ${drawn.length === 1 ? "max-w-sm mx-auto" : "grid-cols-1 md:grid-cols-3"}`}
          >
            {drawn.map((card, idx) => {
              const isFlipped = flipped.has(idx);
              const ElementIcon = ELEMENT_ICONS[card.element];
              const positionLabel = drawn.length === 3
                ? ["Past", "Present", "Future"][idx]
                : undefined;

              return (
                <motion.div
                  key={card.name + idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="perspective-1000"
                >
                  {positionLabel && (
                    <p className="text-center text-sm font-semibold text-violet-400 mb-2 tracking-wide uppercase">
                      {positionLabel}
                    </p>
                  )}
                  <div
                    className="relative cursor-pointer"
                    style={{ transformStyle: "preserve-3d", minHeight: "280px" }}
                    onClick={() => flipCard(idx)}
                  >
                    <AnimatePresence mode="wait">
                      {!isFlipped ? (
                        <motion.div
                          key="back"
                          initial={{ rotateY: 0 }}
                          exit={{ rotateY: 90 }}
                          transition={{ duration: 0.3 }}
                          className="glass-card flex flex-col items-center justify-center gap-4 absolute inset-0"
                          style={{ backfaceVisibility: "hidden" }}
                        >
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${ELEMENT_COLORS[card.element]} flex items-center justify-center`}>
                            <Eye className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-foreground/50 text-sm">Tap to reveal</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="front"
                          initial={{ rotateY: -90 }}
                          animate={{ rotateY: 0 }}
                          transition={{ duration: 0.3 }}
                          className="glass-card space-y-4"
                          style={{ backfaceVisibility: "hidden" }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs tracking-widest text-foreground/40 font-mono">
                              {card.symbol}
                            </span>
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${ELEMENT_COLORS[card.element]} text-white`}>
                              <ElementIcon className="w-3 h-3" />
                              {card.element}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-display font-bold text-gradient">
                              {card.name}
                            </h3>
                            {card.isReversed && (
                              <span className="text-xs text-rose-400 font-semibold tracking-wide">
                                REVERSED
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground/70 leading-relaxed">
                            {card.isReversed ? card.reversed : card.upright}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DiceOracle() {
  const [diceCount, setDiceCount] = useState<1 | 2 | 3>(1);
  const [values, setValues] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [rollFrames, setRollFrames] = useState<number[]>([]);

  const roll = useCallback(() => {
    setValues([]);
    setRolling(true);
    let frame = 0;
    const interval = setInterval(() => {
      setRollFrames(Array.from({ length: diceCount }, () => Math.ceil(Math.random() * 6)));
      frame++;
      if (frame > 12) {
        clearInterval(interval);
        const final = Array.from({ length: diceCount }, () => Math.ceil(Math.random() * 6));
        setValues(final);
        setRollFrames([]);
        setRolling(false);
      }
    }, 80);
  }, [diceCount]);

  const displayValues = rolling ? rollFrames : values;
  const meaning = values.length > 0 ? getDiceMeaning(values) : null;

  const DICE_FACES = ["", "\u2680", "\u2681", "\u2682", "\u2683", "\u2684", "\u2685"];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <p className="text-foreground/70 max-w-xl mx-auto">
          Hold your question in mind and choose how many dice to cast.
          The numbers that appear carry vibrations aligned with your inquiry.
        </p>
        <div className="flex gap-2 justify-center">
          {([1, 2, 3] as const).map((n) => (
            <button
              key={n}
              onClick={() => { setDiceCount(n); setValues([]); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                diceCount === n
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20"
                  : "glass text-foreground/70 hover:text-foreground"
              }`}
            >
              {n} {n === 1 ? "Die" : "Dice"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-6">
        {displayValues.map((v, i) => (
          <motion.div
            key={i}
            animate={rolling ? { rotate: [0, 15, -15, 10, -10, 0], scale: [1, 1.1, 0.95, 1.05, 1] } : {}}
            transition={{ duration: 0.2, repeat: rolling ? Infinity : 0 }}
            className="glass-card w-24 h-24 flex items-center justify-center"
          >
            <span className="text-5xl leading-none select-none">{DICE_FACES[v]}</span>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <button className="btn-primary gap-2" onClick={roll} disabled={rolling}>
          <Dices className="w-4 h-4" /> {rolling ? "Rolling..." : "Cast the Dice"}
        </button>
      </div>

      <AnimatePresence>
        {meaning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card max-w-lg mx-auto text-center space-y-3"
          >
            <p className="text-sm text-violet-400 font-semibold tracking-wide uppercase">
              {values.join(" + ")} = {values.reduce((a, b) => a + b, 0)}
            </p>
            <p className="text-foreground/80 leading-relaxed">{meaning}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DecisionOracle() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<typeof DECISION_RESPONSES[number] | null>(null);
  const [revealing, setRevealing] = useState(false);

  const ask = useCallback(() => {
    if (!question.trim() || revealing) return;
    setRevealing(true);
    setResponse(null);
    setTimeout(() => {
      const hash = hashQuestion(question);
      const idx = hash % DECISION_RESPONSES.length;
      setResponse(DECISION_RESPONSES[idx]);
      setRevealing(false);
    }, 1200);
  }, [question, revealing]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  }, [ask]);

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="text-center space-y-3">
        <p className="text-foreground/70">
          Frame your question as a yes or no inquiry. Speak it clearly in your mind,
          then type it below. The Oracle listens to the energy behind the words.
        </p>
      </div>

      <div className="space-y-4">
        <div className="glass-card space-y-3 !p-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here..."
            rows={3}
            className="w-full bg-transparent resize-none outline-none text-foreground placeholder:text-foreground/30"
          />
        </div>
        <div className="text-center">
          <button
            className="btn-primary gap-2"
            onClick={ask}
            disabled={!question.trim() || revealing}
          >
            {revealing ? (
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Consulting the Oracle...
              </motion.span>
            ) : (
              <>
                <Eye className="w-4 h-4" /> Ask the Oracle
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-display font-bold text-gradient">
              {response.answer}
            </h3>
            <p className="text-foreground/70 leading-relaxed">
              {response.reasoning}
            </p>
            <button
              className="btn-outline text-sm gap-1 mx-auto"
              onClick={() => { setResponse(null); setQuestion(""); }}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ask Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BirthCardCalculator() {
  const [birthday, setBirthday] = useState("");
  const [result, setResult] = useState<typeof MAJOR_ARCANA[number] | null>(null);
  const [calculating, setCalculating] = useState(false);

  const calculate = useCallback(() => {
    if (!birthday) return;
    setCalculating(true);
    setResult(null);
    setTimeout(() => {
      const num = reduceToBirthCard(birthday);
      const card = MAJOR_ARCANA.find((c) => c.number === num) || MAJOR_ARCANA[0];
      setResult(card);
      setCalculating(false);
    }, 800);
  }, [birthday]);

  const breakdownText = useMemo(() => {
    if (!birthday) return "";
    const digits = birthday.replace(/\D/g, "");
    const parts = digits.split("").map(Number);
    const sum = parts.reduce((a, b) => a + b, 0);
    let reduced = sum;
    const steps = [sum];
    while (reduced > 22) {
      let next = 0;
      for (const d of String(reduced)) next += parseInt(d, 10);
      reduced = next;
      steps.push(reduced);
    }
    return `${parts.join(" + ")} = ${steps.join(" then ")}`;
  }, [birthday]);

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="text-center space-y-3">
        <p className="text-foreground/70">
          Your birth date holds a numerological vibration that connects you to one of the
          22 Major Arcana archetypes. Enter your birthday to discover which card carries
          the energy of your soul's journey.
        </p>
      </div>

      <div className="glass-card !p-4 space-y-4">
        <label htmlFor="birth-date-input" className="block text-sm font-medium text-foreground/60">Date of Birth</label>
        <input
          id="birth-date-input"
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          title="Select your date of birth"
          className="w-full bg-transparent outline-none text-foreground border-b border-foreground/10 pb-2 focus:border-violet-500 transition-colors"
        />
        <button
          className="btn-primary w-full gap-2"
          onClick={calculate}
          disabled={!birthday || calculating}
        >
          {calculating ? (
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Calculating...
            </motion.span>
          ) : (
            <>
              <Cake className="w-4 h-4" /> Reveal My Birth Card
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card space-y-5"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-white font-mono">{result.number}</span>
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-gradient">
                  {result.name}
                </h3>
                <p className="text-xs text-foreground/50 font-mono mt-1">{breakdownText}</p>
              </div>
            </div>
            <p className="text-foreground/70 leading-relaxed">{result.meaning}</p>
            <button
              className="btn-outline text-sm gap-1"
              onClick={() => { setResult(null); setBirthday(""); }}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Calculate Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Oracle() {
  const [activeTab, setActiveTab] = useState<TabId>("cards");

  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fade} className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-violet-400 font-medium mb-2">
              <Eye className="w-4 h-4" />
              <span>Digital Oracle</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient">
              Seek and You Shall Find
            </h1>
            <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
              Draw oracle cards, cast sacred dice, consult the decision oracle,
              or discover the spiritual archetype encoded in your birth date.
            </p>
          </motion.div>

          <motion.div {...fade} transition={{ delay: 0.1 }}>
            <div className="flex gap-1 p-1 rounded-2xl glass mb-10 overflow-x-auto">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20"
                        : "text-foreground/50 hover:text-foreground/80"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "cards" && <CardDraw />}
              {activeTab === "dice" && <DiceOracle />}
              {activeTab === "decision" && <DecisionOracle />}
              {activeTab === "birth" && <BirthCardCalculator />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
