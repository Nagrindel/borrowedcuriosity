import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library as LibraryIcon,
  BookOpen,
  X,
  BookmarkPlus,
  BookmarkCheck,
  Search,
  Sparkles,
  Star,
  ChevronRight,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

type Category =
  | "All"
  | "Numerology"
  | "Crystals"
  | "Spirituality"
  | "Meditation"
  | "Mysticism"
  | "Sacred Geometry";

interface Book {
  id: number;
  title: string;
  author: string;
  category: Exclude<Category, "All">;
  description: string;
  teachings: string[];
  whyItMatters: string;
  gradient: string;
}

const categoryColors: Record<Exclude<Category, "All">, string> = {
  Numerology: "from-violet-500/80 to-indigo-600/80",
  Crystals: "from-emerald-500/80 to-teal-600/80",
  Spirituality: "from-amber-500/80 to-orange-600/80",
  Meditation: "from-sky-500/80 to-blue-600/80",
  Mysticism: "from-rose-500/80 to-pink-600/80",
  "Sacred Geometry": "from-fuchsia-500/80 to-purple-600/80",
};

const categoryAccent: Record<Exclude<Category, "All">, string> = {
  Numerology: "text-violet-400",
  Crystals: "text-emerald-400",
  Spirituality: "text-amber-400",
  Meditation: "text-sky-400",
  Mysticism: "text-rose-400",
  "Sacred Geometry": "text-fuchsia-400",
};

const books: Book[] = [
  {
    id: 1,
    title: "The Complete Book of Numerology",
    author: "David A. Phillips",
    category: "Numerology",
    description:
      "A foundational guide revealing the science of numbers and how they shape every aspect of life. Phillips decodes birth dates, names, and personal cycles through the Pythagorean system of numerology.",
    teachings: [
      "The Ruling Number derived from your birth date reveals your core purpose",
      "Each letter of your name carries a specific numerical vibration",
      "Personal Year cycles move in repeating nine-year patterns",
      "The Arrows of Pythagoras chart maps strengths and weaknesses",
    ],
    whyItMatters:
      "This is one of the most accessible entry points into serious numerological study. Phillips bridges ancient Pythagorean wisdom with practical modern application, giving readers a system they can use immediately to understand themselves and the people around them.",
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    id: 2,
    title: "The Crystal Bible",
    author: "Judy Hall",
    category: "Crystals",
    description:
      "The definitive reference guide to over 200 crystals and their healing properties. Hall provides detailed descriptions of each stone's formation, mythology, and therapeutic applications.",
    teachings: [
      "Every crystal has a unique energetic signature tied to its mineral structure",
      "Proper cleansing and programming amplifies a stone's effectiveness",
      "Crystal placement on the body corresponds to the chakra system",
      "Color, opacity, and formation type influence how a crystal channels energy",
    ],
    whyItMatters:
      "Judy Hall spent decades cataloging crystal knowledge from geological science and metaphysical traditions alike. This volume remains the go-to desk reference for anyone working with stones, from curious beginners to practicing healers.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: 3,
    title: "The Power of Now",
    author: "Eckhart Tolle",
    category: "Meditation",
    description:
      "A transformative work on the nature of consciousness and the liberation found in present-moment awareness. Tolle draws from Zen Buddhism, Sufism, and Christian mysticism to illuminate the path beyond ego.",
    teachings: [
      "The mind creates suffering through identification with past and future",
      "The 'pain body' is an accumulated field of old emotional pain",
      "True identity exists beyond thought in the space of pure awareness",
      "Surrender to the present moment dissolves resistance and fear",
    ],
    whyItMatters:
      "Tolle wrote this after a profound inner transformation that dissolved years of depression overnight. The book has helped millions recognize the difference between their thinking mind and their deeper being, offering practical doorways into presence.",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    id: 4,
    title: "Sacred Geometry: Deciphering the Code",
    author: "Stephen Skinner",
    category: "Sacred Geometry",
    description:
      "An exploration of the geometric patterns underlying nature, art, and architecture across civilizations. Skinner traces sacred proportions from Egyptian temples to Gothic cathedrals to the structure of DNA.",
    teachings: [
      "The Golden Ratio appears throughout nature from nautilus shells to galaxy spirals",
      "Platonic solids represent the fundamental building blocks of matter in ancient cosmology",
      "Sacred architecture encodes mathematical relationships meant to harmonize human consciousness",
      "The Flower of Life pattern contains the blueprint for every atomic and molecular structure",
    ],
    whyItMatters:
      "Skinner reveals that geometry is far more than abstract mathematics. It is the visual language of creation itself. Understanding these patterns changes how you see everything from a pine cone to a cathedral ceiling.",
    gradient: "from-fuchsia-500 to-purple-600",
  },
  {
    id: 5,
    title: "The Kybalion",
    author: "Three Initiates",
    category: "Mysticism",
    description:
      "A study of the Hermetic philosophy of ancient Egypt and Greece, presenting seven universal principles that govern all planes of existence. Published anonymously in 1908, it distills millennia of esoteric teaching.",
    teachings: [
      "The Principle of Mentalism: The Universe is mental, held in the Mind of the All",
      "The Principle of Correspondence: As above, so below; as below, so above",
      "The Principle of Vibration: Nothing rests, everything moves and vibrates",
      "The Principle of Polarity: Everything has its pair of opposites",
    ],
    whyItMatters:
      "The Kybalion is the Rosetta Stone of Western esotericism. Its seven principles appear embedded in every major occult, alchemical, and metaphysical tradition. Understanding them provides a unified framework for all spiritual study.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    id: 6,
    title: "Autobiography of a Yogi",
    author: "Paramahansa Yogananda",
    category: "Spirituality",
    description:
      "The life story of one of the first great Indian masters to live and teach in the West. Yogananda recounts miraculous encounters with saints, describes the science of Kriya Yoga, and bridges Eastern mysticism with Western understanding.",
    teachings: [
      "Kriya Yoga accelerates spiritual evolution through breath and energy control",
      "The guru-disciple relationship operates through direct transmission of consciousness",
      "Miracles are not supernatural but expressions of higher natural law",
      "Self-realization is the knowing, in body, mind, and soul, that we are one with God",
    ],
    whyItMatters:
      "This book was the only one found on Steve Jobs's iPad, and it has been a gateway text for Western seekers since 1946. Yogananda's narrative makes the extraordinary feel intimate and possible, and his lineage of Kriya Yoga masters continues to this day.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: 7,
    title: "The Book of Stones",
    author: "Robert Simmons & Naisha Ahsian",
    category: "Crystals",
    description:
      "A comprehensive guide to the spiritual and healing qualities of 455 crystals, minerals, and gemstones. Each entry details the stone's properties, chakra correspondences, and emotional and physical applications.",
    teachings: [
      "Stones communicate through subtle vibrations that interact with the human energy field",
      "Combining specific stones creates synergistic effects greater than individual use",
      "Meditation with stones can open channels to higher guidance and intuition",
      "The elemental composition of each stone determines its metaphysical properties",
    ],
    whyItMatters:
      "Where The Crystal Bible provides breadth, The Book of Stones provides depth. Simmons and Ahsian offer two independent perspectives on every stone, giving readers a richer and more nuanced understanding of crystal energy work.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: 8,
    title: "Numerology and the Divine Triangle",
    author: "Faith Javane & Dusty Bunker",
    category: "Numerology",
    description:
      "A pioneering synthesis of numerology, astrology, and the Tarot. Javane and Bunker map all 78 Tarot cards to numerological values and astrological correspondences, creating an integrated divination system.",
    teachings: [
      "Each number 1 through 78 corresponds to a specific Tarot card and life lesson",
      "The Personal Year number reveals the dominant theme and challenge of each year",
      "Numerological charts can be overlaid with natal astrology for deeper insight",
      "The Divine Triangle method connects birth data to Tarot archetypes",
    ],
    whyItMatters:
      "This book transformed numerology from a standalone system into something that speaks directly to astrology and Tarot. For anyone who studies multiple divination systems, Javane and Bunker provide the connective tissue between them.",
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    id: 9,
    title: "The Secret Doctrine",
    author: "Helena Blavatsky",
    category: "Mysticism",
    description:
      "Blavatsky's magnum opus synthesizes science, religion, and philosophy into a sweeping cosmological framework. Drawing from Hindu, Buddhist, and Egyptian sources, she outlines the evolution of consciousness across vast cosmic cycles.",
    teachings: [
      "Seven root races represent stages in humanity's spiritual evolution",
      "An omnipresent, eternal, boundless principle underlies all existence",
      "Cycles of involution and evolution govern both cosmic and human development",
      "Ancient wisdom traditions share a common esoteric source",
    ],
    whyItMatters:
      "Despite its density, The Secret Doctrine sparked the entire modern esoteric revival. Blavatsky's synthesis influenced everyone from Kandinsky and Mondrian to the founders of the Golden Dawn. It remains the bedrock text of Theosophical thought.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    id: 10,
    title: "Light on Yoga",
    author: "B.K.S. Iyengar",
    category: "Meditation",
    description:
      "The definitive modern guide to yoga practice, featuring over 200 asanas with detailed instructions and photographs. Iyengar connects physical postures to pranayama and the philosophical framework of Patanjali's Yoga Sutras.",
    teachings: [
      "Precise alignment in asanas creates pathways for prana to flow freely",
      "Pranayama practice directly influences the state of the mind and nervous system",
      "The eight limbs of yoga form a complete system for spiritual development",
      "Consistent practice transforms the body into a stable vessel for meditation",
    ],
    whyItMatters:
      "Iyengar brought yogic discipline to the modern world with unprecedented precision. His insistence on alignment and his use of props made yoga accessible to all body types while preserving the depth of its spiritual purpose.",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    id: 11,
    title: "The Celestine Prophecy",
    author: "James Redfield",
    category: "Spirituality",
    description:
      "A narrative adventure following nine key insights discovered in an ancient Peruvian manuscript. Redfield weaves spiritual teachings into a thriller format, exploring synchronicity, energy fields, and humanity's next evolutionary step.",
    teachings: [
      "Synchronicities are not random but meaningful guideposts on the spiritual path",
      "Humans unconsciously compete for energy through four control dramas",
      "Learning to perceive and project energy consciously transforms relationships",
      "Humanity is evolving toward a culture that sustains itself on mystical energy",
    ],
    whyItMatters:
      "Redfield made abstract metaphysical concepts feel tangible and urgent. The novel format allowed millions of readers to experience spiritual awakening as an adventure rather than an academic exercise, and its insights about energy dynamics remain profoundly relevant.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: 12,
    title: "Many Lives, Many Masters",
    author: "Brian Weiss",
    category: "Mysticism",
    description:
      "A psychiatrist's account of using past-life regression to heal a patient's deep-seated phobias. Weiss, a Yale-trained skeptic, documents how his patient channeled messages from spiritual entities he calls the Masters.",
    teachings: [
      "The soul reincarnates across many lifetimes to learn specific lessons",
      "Phobias and recurring patterns often trace back to unresolved past-life trauma",
      "Between incarnations, the soul reviews its progress with guiding beings",
      "Death is a transition, not an ending, and need not be feared",
    ],
    whyItMatters:
      "Weiss risked his entire medical career to publish this account. His clinical credentials gave past-life therapy a credibility it had never had in the West, and the book has since opened millions of people to the possibility of reincarnation.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    id: 13,
    title: "The Four Agreements",
    author: "Don Miguel Ruiz",
    category: "Spirituality",
    description:
      "Rooted in ancient Toltec wisdom, Ruiz distills a practical code of conduct for personal freedom and authentic living. The four agreements serve as tools for breaking self-limiting beliefs inherited from culture and upbringing.",
    teachings: [
      "Be impeccable with your word: speak with integrity and truth",
      "Do not take anything personally: nothing others do is because of you",
      "Do not make assumptions: find the courage to ask questions",
      "Always do your best: your best will change from moment to moment",
    ],
    whyItMatters:
      "Ruiz compressed an entire Toltec warrior's path into four deceptively simple principles. These agreements function as living practices that, when applied consistently, dismantle the domestication and fear-based conditioning most people carry unconsciously.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: 14,
    title: "A New Earth",
    author: "Eckhart Tolle",
    category: "Meditation",
    description:
      "Tolle's follow-up to The Power of Now expands on ego identification and the emergence of a new, awakened consciousness. He examines how the ego operates through roles, grievances, and the need to be right.",
    teachings: [
      "The ego is not who you are but a mental construct built from identification",
      "The pain body feeds on negativity and unconscious emotional reactions",
      "Awakening happens when awareness separates from the stream of thinking",
      "A critical mass of awakened individuals can shift collective human consciousness",
    ],
    whyItMatters:
      "Where The Power of Now provided the map, A New Earth provides the compass for navigating modern life without losing presence. Tolle's analysis of ego structures is among the most precise and compassionate in contemporary spiritual literature.",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    id: 15,
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Spirituality",
    description:
      "The allegorical tale of Santiago, an Andalusian shepherd boy who travels from Spain to the Egyptian pyramids in search of treasure. Along the way he discovers that the real treasure is the journey of following one's Personal Legend.",
    teachings: [
      "When you want something, the entire universe conspires to help you achieve it",
      "The Soul of the World connects all living things in a universal language",
      "Fear of suffering causes more pain than the suffering itself",
      "Your Personal Legend is the path your soul chose before you were born",
    ],
    whyItMatters:
      "Coelho's fable has been translated into 80 languages because its message is universal. It reminds readers that the pursuit of one's deepest calling is not selfish but sacred, and that the omens guiding us are always present if we learn to read them.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: 16,
    title: "Siddhartha",
    author: "Hermann Hesse",
    category: "Mysticism",
    description:
      "The story of a young Brahmin in ancient India who leaves his privileged life to seek the nature of reality. Through asceticism, sensual indulgence, and finally the wisdom of a river, Siddhartha discovers that truth cannot be taught but only experienced.",
    teachings: [
      "Wisdom cannot be communicated through words, only discovered through experience",
      "Every path, including paths of excess, can lead toward understanding",
      "The river teaches that time is an illusion and all things exist simultaneously",
      "True peace comes from accepting the unity and wholeness of all existence",
    ],
    whyItMatters:
      "Hesse wrote Siddhartha during his own spiritual crisis, and the novel's honesty about the limits of doctrine and teaching makes it timeless. It validates the seeker who has tried many paths and reminds us that the search itself is the finding.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    id: 17,
    title: "The Ancient Secret of the Flower of Life",
    author: "Drunvalo Melchizedek",
    category: "Sacred Geometry",
    description:
      "A deep dive into the Flower of Life symbol and the sacred geometrical patterns that underlie all creation. Melchizedek connects Egyptian mystery schools, Mer-Ka-Ba meditation, and the geometry of consciousness.",
    teachings: [
      "The Flower of Life contains the patterns for every element, molecule, and life form",
      "The Mer-Ka-Ba is a light-body vehicle activated through geometric meditation",
      "Human consciousness follows geometric ratios in its evolution",
      "Ancient civilizations encoded advanced knowledge in their sacred architecture",
    ],
    whyItMatters:
      "Melchizedek bridges sacred geometry with practical meditation techniques in a way few authors have managed. This two-volume work has become essential reading for anyone exploring the intersection of consciousness, geometry, and spiritual practice.",
    gradient: "from-fuchsia-500 to-purple-600",
  },
];

const categories: Category[] = [
  "All",
  "Numerology",
  "Crystals",
  "Spirituality",
  "Meditation",
  "Mysticism",
  "Sacred Geometry",
];

const STORAGE_KEY = "borrowed-curiosity-reading-list";

function loadReadingList(): number[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function Library() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingList, setReadingList] = useState<number[]>(loadReadingList);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readingList));
  }, [readingList]);

  const toggleReadingList = (id: number) => {
    setReadingList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filtered = useMemo(() => {
    let result = books;
    if (activeCategory !== "All") {
      result = result.filter((b) => b.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, searchQuery]);

  const readingListBooks = useMemo(
    () => books.filter((b) => readingList.includes(b.id)),
    [readingList]
  );

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="section-padding min-h-[40vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div {...fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-500 mb-6">
              <LibraryIcon className="w-3.5 h-3.5" /> Curated wisdom
            </span>
          </motion.div>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
          >
            The Spiral <span className="text-gradient">Library</span>
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl"
          >
            A hand-picked collection of books that have shaped seekers, mystics,
            and curious minds for generations. Browse, save to your reading list,
            and begin your next chapter.
          </motion.p>
        </div>
      </section>

      {/* Reading List Banner */}
      {readingListBooks.length > 0 && (
        <section className="px-6 md:px-8 lg:px-12 xl:px-20 pb-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center">
                  <BookmarkCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm">
                    Your Reading List
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {readingListBooks.length} book
                    {readingListBooks.length !== 1 && "s"} saved
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                {readingListBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs font-medium hover:border-violet-500/30 transition-colors"
                  >
                    <span
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${book.gradient}`}
                    />
                    {book.title.length > 25
                      ? book.title.slice(0, 25) + "..."
                      : book.title}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Filters & Search */}
      <section className="section-padding pt-4 pb-0">
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...fadeUp}
            className="flex flex-col md:flex-row gap-4 mb-12"
          >
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    activeCategory === cat ? "btn-primary" : "btn-outline"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative md:ml-auto md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search books or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-sm outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Book Grid */}
      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-display text-gray-500">
                No books found matching your search.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((book, i) => (
                  <motion.div
                    key={book.id}
                    {...stagger}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="group"
                  >
                    <div
                      className="glass-card flex flex-col h-full cursor-pointer"
                      onClick={() => setSelectedBook(book)}
                    >
                      <div
                        className={`h-3 rounded-t-xl -mx-6 -mt-6 mb-4 bg-gradient-to-r ${book.gradient}`}
                      />

                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide uppercase bg-gradient-to-r ${
                            categoryColors[book.category]
                          } text-white`}
                        >
                          {book.category}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReadingList(book.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                          title={
                            readingList.includes(book.id)
                              ? "Remove from reading list"
                              : "Add to reading list"
                          }
                        >
                          {readingList.includes(book.id) ? (
                            <BookmarkCheck className="w-4 h-4 text-violet-400" />
                          ) : (
                            <BookmarkPlus className="w-4 h-4 text-gray-400 group-hover:text-violet-400 transition-colors" />
                          )}
                        </button>
                      </div>

                      <h3 className="font-display font-bold text-base leading-snug mb-1 group-hover:text-violet-400 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        by {book.author}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 mb-4 flex-1">
                        {book.description}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs font-medium text-violet-400 mt-auto">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read more</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedBook(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative glass-card w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            >
              <div
                className={`h-4 rounded-t-2xl -mx-6 -mt-6 mb-6 bg-gradient-to-r ${selectedBook.gradient}`}
              />

              <button
                onClick={() => setSelectedBook(null)}
                aria-label="Close book details"
                className="absolute top-4 right-4 p-2 rounded-xl glass hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start justify-between gap-3 mb-1">
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase bg-gradient-to-r ${
                    categoryColors[selectedBook.category]
                  } text-white`}
                >
                  {selectedBook.category}
                </span>
                <button
                  onClick={() => toggleReadingList(selectedBook.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    readingList.includes(selectedBook.id)
                      ? "btn-primary"
                      : "btn-outline"
                  }`}
                >
                  {readingList.includes(selectedBook.id) ? (
                    <>
                      <BookmarkCheck className="w-4 h-4" /> Saved
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" /> Save to List
                    </>
                  )}
                </button>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold mt-4 mb-1">
                {selectedBook.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                by {selectedBook.author}
              </p>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                {selectedBook.description}
              </p>

              <div className="mb-8">
                <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <Sparkles
                    className={`w-5 h-5 ${categoryAccent[selectedBook.category]}`}
                  />
                  Key Teachings
                </h3>
                <ul className="space-y-3">
                  {selectedBook.teachings.map((t, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <Star
                        className={`w-4 h-4 mt-0.5 shrink-0 ${categoryAccent[selectedBook.category]}`}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {t}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="glass rounded-xl p-5">
                <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                  <BookOpen
                    className={`w-5 h-5 ${categoryAccent[selectedBook.category]}`}
                  />
                  Why This Book Matters
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {selectedBook.whyItMatters}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
