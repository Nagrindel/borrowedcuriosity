import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles, ShoppingBag, BookOpen, GalleryVerticalEnd,
  MessageCircle, GraduationCap, ArrowRight, Heart, Calendar,
  Gem, Leaf, Zap, Hash, Calculator, Star, ChevronRight,
  Camera, Brain, Feather, Music,
} from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

const stagger = (delay: number) => ({
  ...fade,
  transition: { ...fade.transition, delay },
});

const FEATURES = [
  { icon: BookOpen, label: "Blog", href: "/blog", color: "from-blue-500 to-cyan-500", desc: "Free reads, real talk, open comments" },
  { icon: ShoppingBag, label: "Store", href: "/store", color: "from-brand-500 to-pink-500", desc: "Salves, jewelry, written reports" },
  { icon: GalleryVerticalEnd, label: "Gallery", href: "/gallery", color: "from-amber-500 to-orange-500", desc: "Photos, videos, downloads" },
  { icon: MessageCircle, label: "Threads", href: "/threads", color: "from-green-500 to-emerald-500", desc: "Bite-sized stories to flip through" },
  { icon: GraduationCap, label: "Courses", href: "/courses", color: "from-rose-500 to-red-500", desc: "Free lessons, no paywall" },
  { icon: Sparkles, label: "Alta", href: "/ask-alta", color: "from-violet-500 to-purple-600", desc: "Your personal numerology guide" },
];

const TOOLS = [
  { icon: Calculator, label: "Numerology Calculator", href: "/calculator", color: "from-brand-500 to-violet-600", desc: "10 core numbers with full interpretations. Both Pythagorean and Chaldean." },
  { icon: Heart, label: "Compatibility", href: "/compatibility", color: "from-rose-500 to-pink-600", desc: "Enter two birthdays. See the numerological harmony between any two people." },
  { icon: Calendar, label: "Daily Numerology", href: "/daily", color: "from-amber-500 to-orange-600", desc: "Daily energy numbers and a biblical verse matched to your vibration." },
  { icon: BookOpen, label: "Word Lookup", href: "/word-lookup", color: "from-cyan-500 to-blue-600", desc: "Dictionary definitions plus the numerological value of any word." },
  { icon: Gem, label: "Crystal Guide", href: "/crystals", color: "from-purple-500 to-fuchsia-600", desc: "12 crystals with properties, chakra connections, and honest descriptions." },
  { icon: Hash, label: "Gematria Calculator", href: "/gematria", color: "from-emerald-500 to-teal-600", desc: "Convert words to numbers. Compare phrases. Discover hidden connections." },
  { icon: Camera, label: "Crystal Identifier", href: "/identify", color: "from-violet-500 to-indigo-600", desc: "Upload a photo or describe a crystal. Get a full geological and metaphysical analysis." },
  { icon: Music, label: "Frequency Generator", href: "/frequencies", color: "from-teal-500 to-cyan-600", desc: "Solfeggio tones, binaural beats, and your personal frequency." },
  { icon: Feather, label: "Spiritual Journal", href: "/journal", color: "from-emerald-500 to-green-600", desc: "Personalized journal prompts based on mood and numerology." },
  { icon: BookOpen, label: "Sacred Stories", href: "/stories", color: "from-amber-500 to-yellow-600", desc: "Crystal mythology, biblical stones, and sacred traditions." },
  { icon: Brain, label: "Spiritual Quiz", href: "/quiz", color: "from-cyan-500 to-sky-600", desc: "Test your knowledge. Unique questions generated every time." },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[15%] left-[20%] w-[420px] h-[420px] bg-brand-500/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.08, 0.16, 0.08] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[10%] right-[15%] w-[350px] h-[350px] bg-gold-500/15 rounded-full blur-[100px]"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1 {...stagger(0)}
            className="font-display text-5xl sm:text-7xl lg:text-[5.5rem] font-bold leading-[1.05] mb-6 tracking-tight">
            Borrow the <span className="text-gradient">curiosity.</span>
            <br />
            Keep the <span className="text-gradient">wisdom.</span>
          </motion.h1>

          <motion.p {...stagger(0.2)}
            className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-xl mx-auto">
            Numerology, crystals, handcrafted goods, and smart tools
            for the spiritually curious. No gatekeeping, just good energy.
          </motion.p>

          <motion.div {...stagger(0.3)} className="flex flex-wrap justify-center gap-3">
            <Link href="/store">
              <span className="btn-primary cursor-pointer px-7 py-3.5">
                Explore the Store <ArrowRight className="w-4 h-4 ml-2" />
              </span>
            </Link>
            <Link href="/calculator">
              <span className="btn-outline cursor-pointer px-7 py-3.5">
                Free Calculator <Zap className="w-4 h-4 ml-2" />
              </span>
            </Link>
          </motion.div>

          <motion.div {...stagger(0.45)}
            className="mt-10 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-500">
            <span className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5 text-green-500" /> Handmade</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-brand-400" /> Numerology</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span className="flex items-center gap-1.5"><Gem className="w-3.5 h-3.5 text-rose-400" /> Crystals</span>
          </motion.div>
        </div>
      </section>

      {/* ─── Feature Grid ─── */}
      <section className="px-6 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade} className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-400 mb-3 font-medium">Everything in one place</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold">
              What lives on <span className="text-gradient">Borrowed Curiosity</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.label} {...stagger(i * 0.06)}>
                <Link href={f.href}>
                  <div className="glass rounded-2xl p-5 group cursor-pointer hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-0.5 h-full">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
                      <f.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-display font-semibold text-sm mb-1">{f.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-brand-400 mt-2 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Free Tools Showcase ─── */}
      <section className="px-6 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade} className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-400 mb-3 font-medium">Free, no sign-up</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold">
              Tools for the <span className="text-gradient">curious</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {TOOLS.map((tool, i) => (
              <motion.div key={tool.label} {...stagger(i * 0.04)}>
                <Link href={tool.href}>
                  <div className="glass rounded-xl p-4 group cursor-pointer hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-0.5 h-full">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
                      <tool.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-display font-semibold text-sm mb-1">{tool.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{tool.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Store Highlight ─── */}
      <section className="px-6 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade}
            className="glass rounded-3xl p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-brand-500/8 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gold-500/8 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-pink-500 flex items-center justify-center">
                    <ShoppingBag className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">The Store</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold mb-3 leading-tight">
                  Handcrafted with <span className="text-gradient">intention</span>
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5 max-w-md">
                  Healing salves, crystal jewelry, and personalized numerology reports
                  written by a real human. Each piece comes with a story.
                </p>
                <Link href="/store">
                  <span className="btn-primary cursor-pointer px-6 py-3 text-sm">
                    Visit the Store <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </span>
                </Link>
              </div>

              <div className="flex gap-3 sm:gap-4">
                {[
                  { icon: Leaf, name: "Healing Salve", price: "$24", color: "from-green-500/15 to-emerald-500/15" },
                  { icon: Gem, name: "Crystal Pendant", price: "$38", color: "from-brand-500/15 to-pink-500/15" },
                  { icon: Star, name: "Written Report", price: "$45", color: "from-gold-500/15 to-amber-500/15" },
                ].map((item, i) => (
                  <motion.div key={item.name} {...stagger(0.1 + i * 0.1)}
                    className="glass rounded-xl p-4 text-center w-[110px] sm:w-[130px] hover:-translate-y-1 transition-transform duration-300">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-2`}>
                      <item.icon className="w-5 h-5 text-brand-400" />
                    </div>
                    <p className="text-[11px] font-medium mb-0.5 truncate">{item.name}</p>
                    <p className="text-brand-400 font-display font-bold text-sm">{item.price}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Alta + Courses row ─── */}
      <section className="px-6 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div {...fade}>
            <Link href="/ask-alta">
              <div className="glass rounded-2xl p-6 h-full cursor-pointer group hover:border-brand-500/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <img
                    src="/logo.png"
                    alt="Alta"
                    className="w-11 h-11 object-contain shrink-0 dark:mix-blend-screen dark:brightness-[2.5] dark:drop-shadow-[0_0_4px_rgba(139,92,246,0.3)] mix-blend-multiply brightness-0 dark:brightness-[2.5]"
                  />
                  <div>
                    <p className="font-display font-semibold mb-1">Meet <span className="text-gradient">Alta</span></p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                      "Tell me what's on your mind, and I'll point you to your answers.
                      Or give me your birthday and I'll calculate your numbers right here."
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-brand-400 text-sm font-medium group-hover:gap-2.5 transition-all">
                      Chat with Alta <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div {...stagger(0.08)}>
            <Link href="/courses">
              <div className="glass rounded-2xl p-6 h-full cursor-pointer group hover:border-brand-500/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5.5 h-5.5 text-white" />
                  </div>
                  <div>
                    <p className="font-display font-semibold mb-1">Free <span className="text-gradient">Courses</span></p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                      Numerology, crystals, gematria, and self-discovery. No paywall,
                      no catch. Just borrowed wisdom, freely given.
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-brand-400 text-sm font-medium group-hover:gap-2.5 transition-all">
                      Start Learning <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Quote ─── */}
      <section className="px-6 py-12 sm:py-16">
        <motion.div {...fade} className="max-w-3xl mx-auto text-center">
          <div className="text-4xl text-brand-500/20 font-serif mb-3">"</div>
          <blockquote className="font-display text-lg sm:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-300">
            The universe doesn't hand out instruction manuals. But it does
            leave clues in your name, your birthday, and the things that
            make you lose track of time.
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="w-6 h-px bg-brand-500/40" />
            <p className="text-xs text-gray-500 dark:text-gray-500 tracking-wider uppercase">
              Borrowed Curiosity
            </p>
            <div className="w-6 h-px bg-brand-500/40" />
          </div>
        </motion.div>
      </section>
    </div>
  );
}
