import { db } from "./db.js";
import { blogPosts, products, galleryItems, courses, lessons, threads, threadCards } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { NICOLE_BLOG_POSTS } from "./nicole-posts.js";

const IMAGE_VERSION = 3;

function migrateImages() {
  const versionKey = "__image_version";
  try {
    const row = db.select().from(blogPosts).all()[0] as any;
    if (!row) return;
  } catch { return; }

  const productImageMap: Record<string, string> = {
    "Healing Salve": "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=600&q=80",
    "Lavender Dream": "https://images.unsplash.com/photo-1498998754966-9f72acbc85b2?w=600&q=80",
    "Forest Balm": "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
    "Citrus Restore": "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&q=80",
    "Amethyst Pendant": "https://images.unsplash.com/photo-1515562141589-67f0d569b6bc?w=600&q=80",
    "Crystal Ring": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80",
    "Moon Phase Bracelet": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
    "Rose Quartz Earrings": "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80",
    "Obsidian Shield Pendant": "https://images.unsplash.com/photo-1551122089-4e3e72477432?w=600&q=80",
    "Hand-Written Numerology Report": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80",
  };
  for (const [name, url] of Object.entries(productImageMap)) {
    db.update(products).set({ imageUrl: url }).where(eq(products.name, name)).run();
  }

  const courseImageMap: Record<string, string> = {
    "Introduction to Numerology": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80",
    "Self-Discovery Through Numbers": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=80",
    "Creative Journaling for the Curious": "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80",
    "Crystal Basics: The Honest Guide": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "Gematria and Sacred Numbers": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&q=80",
  };
  for (const [title, url] of Object.entries(courseImageMap)) {
    db.update(courses).set({ imageUrl: url }).where(eq(courses.title, title)).run();
  }

  console.log(`[seed] Image URLs migrated to v${IMAGE_VERSION}`);
}

export function seedDatabase() {
  migrateImages();

  const existingPosts = db.select().from(blogPosts).all();
  const hasNicolePosts = existingPosts.some(p => p.slug === "cracking-the-code-luck-potential");
  const hasOldPosts = existingPosts.some(p => p.slug === "life-path-number-not-personality-test");

  if (hasOldPosts || existingPosts.length === 0) {
    if (hasOldPosts) {
      db.delete(blogPosts).run();
      console.log("[seed] Cleared old placeholder blog posts");
    }
    for (const post of NICOLE_BLOG_POSTS) {
      db.insert(blogPosts).values(post).run();
    }
    console.log(`[seed] Added ${NICOLE_BLOG_POSTS.length} blog posts from Mindscapes`);
  } else if (hasNicolePosts && existingPosts.length < NICOLE_BLOG_POSTS.length) {
    const existingSlugs = new Set(existingPosts.map(p => p.slug));
    for (const post of NICOLE_BLOG_POSTS) {
      if (!existingSlugs.has(post.slug)) {
        db.insert(blogPosts).values(post).run();
      }
    }
    console.log("[seed] Synced missing blog posts");
  }

  const productCount = db.select().from(products).all().length;
  if (productCount > 0) return;

  console.log("[seed] Seeding products, gallery, courses, threads...");

  db.insert(products).values([
    { name: "Healing Salve", description: "Handcrafted with more love than your ex ever gave you. Real ingredients, real results, zero drama.", price: 24, category: "salve", gradient: "from-amber-400 to-orange-600", imageUrl: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=600&q=80" },
    { name: "Lavender Dream", description: "Because your stress levels deserve better than a generic candle. Calm in a jar, minus the woo-woo.", price: 18, category: "salve", gradient: "from-violet-400 to-purple-600", imageUrl: "https://images.unsplash.com/photo-1498998754966-9f72acbc85b2?w=600&q=80" },
    { name: "Forest Balm", description: "Smells like a walk in the woods, minus the mosquitoes. Earthy, grounding, and actually useful.", price: 22, category: "salve", gradient: "from-emerald-500 to-teal-700", imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80" },
    { name: "Citrus Restore", description: "When you need a wake-up call that doesn't involve caffeine. Bright, zesty, and surprisingly soothing.", price: 20, category: "salve", gradient: "from-yellow-400 to-orange-500", imageUrl: "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&q=80" },
    { name: "Amethyst Pendant", description: "A crystal that actually looks good on you. No promises about chakras, but it'll turn heads.", price: 38, category: "jewelry", gradient: "from-brand-400 to-brand-700", imageUrl: "https://images.unsplash.com/photo-1515562141589-67f0d569b6bc?w=600&q=80" },
    { name: "Crystal Ring", description: "Wear your intentions on your finger. Or just wear it because it's pretty. We don't judge.", price: 32, category: "jewelry", gradient: "from-rose-400 to-pink-600", imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80" },
    { name: "Moon Phase Bracelet", description: "Track the lunar cycle without checking your phone. Stylish and slightly witchy. The best combo.", price: 45, category: "jewelry", gradient: "from-slate-400 to-indigo-600", imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80" },
    { name: "Rose Quartz Earrings", description: "The love stone, now for your ears. Subtle enough for work, meaningful enough for you.", price: 28, category: "jewelry", gradient: "from-pink-300 to-rose-500", imageUrl: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80" },
    { name: "Obsidian Shield Pendant", description: "Protection you can wear. Black obsidian wrapped in silver. Looks sharp, feels grounding.", price: 42, category: "jewelry", gradient: "from-gray-600 to-gray-900", imageUrl: "https://images.unsplash.com/photo-1551122089-4e3e72477432?w=600&q=80" },
    { name: "Hand-Written Numerology Report", description: "A full multi-page numerology analysis written by an actual human. Not AI-generated. Your chart, decoded with care, insight, and the occasional witty observation.", price: 55, category: "salve", gradient: "from-brand-500 to-violet-700", imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80" },
  ]).run();

  db.insert(galleryItems).values([
    { title: "Moon Phase Study", description: "A 30-day timelapse that proves the moon has better consistency than my morning routine.", type: "photo", gradient: "from-violet-500 via-purple-600 to-indigo-700", mediaUrl: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=800&q=80" },
    { title: "Crystal Collection", description: "Our crystal collection laid out for your viewing pleasure. Yes, we organize our rocks by color.", type: "photo", gradient: "from-amber-500 via-orange-600 to-rose-600", mediaUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" },
    { title: "Life Path Cheat Sheet", description: "Printable PDF for when you need to explain numerology to your skeptical aunt at Thanksgiving.", type: "download", gradient: "from-emerald-500 via-teal-600 to-cyan-600", downloadUrl: "#", mediaUrl: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80" },
    { title: "Salve Making Process", description: "Behind-the-scenes of our handcrafted salves. Spoiler: it involves a lot of stirring and intention.", type: "photo", gradient: "from-rose-500 via-pink-600 to-fuchsia-600", mediaUrl: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=800&q=80" },
    { title: "Sacred Geometry Art", description: "Aesthetic wallpaper featuring sacred geometry patterns. Your laptop deserves better than stock photos.", type: "download", gradient: "from-slate-500 via-indigo-600 to-violet-700", downloadUrl: "#", mediaUrl: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&q=80" },
    { title: "Workshop Studio", description: "Where the magic (and occasional chaos) happens. Come see where we make the things.", type: "photo", gradient: "from-brand-500 via-violet-600 to-purple-700", mediaUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80" },
    { title: "Numerology 101 Workbook", description: "Free downloadable workbook. Because learning should be free, and so should your curiosity.", type: "download", gradient: "from-cyan-500 via-blue-600 to-indigo-600", downloadUrl: "#", mediaUrl: "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=80" },
    { title: "Sunset Meditation", description: "Five minutes of golden hour vibes. No talking, just vibes. Your mental health will thank you.", type: "photo", gradient: "from-gold-500 via-amber-600 to-orange-600", mediaUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80" },
  ]).run();

  db.insert(courses).values([
    { title: "Introduction to Numerology", description: "From zero to hero in the world of numbers. Learn the basics without the woo-woo overwhelm. Your birth date has stories to tell.", gradient: "from-brand-500 to-violet-600", imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80" },
    { title: "Self-Discovery Through Numbers", description: "Go deeper than 'what's my number?' Learn to use numerology as a mirror, one that doesn't judge your life choices. Mostly.", gradient: "from-rose-500 to-pink-600", imageUrl: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=80" },
    { title: "Creative Journaling for the Curious", description: "Journaling that doesn't feel like homework. Prompts, practices, and permission to be messy.", gradient: "from-amber-500 to-orange-600", imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80" },
    { title: "Crystal Basics: The Honest Guide", description: "Everything you actually need to know about crystals. What they are, what people believe, what science says.", gradient: "from-emerald-500 to-teal-600", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80" },
    { title: "Gematria and Sacred Numbers", description: "The ancient art of turning letters into numbers and finding meaning in the math. Decoded for curious minds.", gradient: "from-cyan-500 to-blue-600", imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&q=80" },
  ]).run();

  const courseRows = db.select().from(courses).all();
  const c1 = courseRows.find(c => c.title.includes("Introduction"))?.id ?? 1;
  const c2 = courseRows.find(c => c.title.includes("Self-Discovery"))?.id ?? 2;
  const c3 = courseRows.find(c => c.title.includes("Journaling"))?.id ?? 3;
  const c4 = courseRows.find(c => c.title.includes("Crystal"))?.id ?? 4;
  const c5 = courseRows.find(c => c.title.includes("Gematria"))?.id ?? 5;

  db.insert(lessons).values([
    { courseId: c1, orderIndex: 1, title: "What is Numerology, Really?", description: "A no-BS intro to why numbers have meaning beyond your math trauma." },
    { courseId: c1, orderIndex: 2, title: "Your Life Path Number", description: "The number that sums up your entire existence. No pressure." },
    { courseId: c1, orderIndex: 3, title: "Expression & Soul Urge", description: "What you show the world vs. what you actually want." },
    { courseId: c1, orderIndex: 4, title: "Master Numbers: 11, 22, 33", description: "The overachievers of numerology. Are you one of them?" },
    { courseId: c1, orderIndex: 5, title: "Putting It All Together", description: "How your numbers interact. It's like a personality cocktail." },
    { courseId: c1, orderIndex: 6, title: "Next Steps & Resources", description: "Where to go from here. Spoiler: we have more free stuff." },
    { courseId: c2, orderIndex: 1, title: "Why Self-Discovery Matters", description: "Because knowing yourself is the first step to not blaming everyone else." },
    { courseId: c2, orderIndex: 2, title: "Your Birth Chart Overview", description: "All nine core numbers, explained. Yes, nine." },
    { courseId: c2, orderIndex: 3, title: "Challenges & Karmic Lessons", description: "The numbers that make you go 'oh, that explains a lot.'" },
    { courseId: c2, orderIndex: 4, title: "Personal Year Cycles", description: "Why some years feel like a rollercoaster. It's not just you." },
    { courseId: c2, orderIndex: 5, title: "Compatibility & Relationships", description: "Do your numbers match? Should you care?" },
    { courseId: c2, orderIndex: 6, title: "Career & Life Purpose", description: "What your numbers say about your calling." },
    { courseId: c2, orderIndex: 7, title: "Journaling Prompts", description: "Questions to ask yourself. No wrong answers." },
    { courseId: c2, orderIndex: 8, title: "Integration & Practice", description: "Making it stick. Knowledge without action is just Wikipedia." },
    { courseId: c3, orderIndex: 1, title: "Why Journal?", description: "It's not just for teenagers and therapists. Though both approve." },
    { courseId: c3, orderIndex: 2, title: "Finding Your Style", description: "Bullet journal, stream of consciousness, or chaotic scribbles. All valid." },
    { courseId: c3, orderIndex: 3, title: "Prompts That Actually Work", description: "No more 'what did I do today?' We have better questions." },
    { courseId: c3, orderIndex: 4, title: "Combining Journaling & Numerology", description: "Use your numbers as journaling prompts. Mind = blown." },
    { courseId: c3, orderIndex: 5, title: "Building a Sustainable Practice", description: "How to actually keep doing this. Consistency > perfection." },
    { courseId: c4, orderIndex: 1, title: "What Are Crystals, Really?", description: "Minerals, rocks, and vibes. The geological truth behind the spiritual hype." },
    { courseId: c4, orderIndex: 2, title: "The Big 12", description: "Clear Quartz, Amethyst, Rose Quartz, and nine more. What each one does (allegedly)." },
    { courseId: c4, orderIndex: 3, title: "Chakras & Crystals", description: "Which stones pair with which energy centers. A color-coded guide." },
    { courseId: c4, orderIndex: 4, title: "Cleansing & Charging", description: "Moonlight, sunlight, sound, and other ways to reset your stones." },
    { courseId: c4, orderIndex: 5, title: "Science vs. Spiritual", description: "The honest conversation about placebo, piezoelectricity, and why intention matters." },
    { courseId: c4, orderIndex: 6, title: "Building a Collection", description: "How to buy crystals without getting scammed. Dyed glass is everywhere." },
    { courseId: c5, orderIndex: 1, title: "What is Gematria?", description: "Letters become numbers, numbers become meaning. The ancient system explained." },
    { courseId: c5, orderIndex: 2, title: "Hebrew Letter Values", description: "The original system: Aleph to Tav and their numerical assignments." },
    { courseId: c5, orderIndex: 3, title: "Pythagorean vs. Hebrew Systems", description: "Two approaches, different results. When to use which." },
    { courseId: c5, orderIndex: 4, title: "Finding Connections", description: "When two words share a number, what does it mean? Practice exercises." },
    { courseId: c5, orderIndex: 5, title: "Sacred Numbers in History", description: "7, 12, 26, 72, 144, and other numbers that keep showing up across traditions." },
  ]).run();

  db.insert(threads).values([
    { topic: "The Origin of Numerology" },
    { topic: "Why 7 is Everyone's Favorite" },
    { topic: "Crystals: A Beginner's Honest Guide" },
    { topic: "The Art of Asking Better Questions" },
    { topic: "The Placebo Effect is Your Superpower" },
    { topic: "Ancient Symbols, Modern Meaning" },
  ]).run();

  const threadRows = db.select().from(threads).all();
  const t1 = threadRows[0]?.id ?? 1;
  const t2 = threadRows[1]?.id ?? 2;
  const t3 = threadRows[2]?.id ?? 3;
  const t4 = threadRows[3]?.id ?? 4;
  const t5 = threadRows[4]?.id ?? 5;
  const t6 = threadRows[5]?.id ?? 6;

  db.insert(threadCards).values([
    { threadId: t1, orderIndex: 1, title: "Where It All Began", content: "Numerology didn't start with a TikTok trend. Pythagoras (yes, the triangle guy) believed numbers held the key to the universe. He was onto something. Or he had too much wine. History is unclear." },
    { threadId: t1, orderIndex: 2, title: "Ancient Babylon Says Hello", content: "Before Pythagoras, the Babylonians were already assigning meaning to numbers. They had a whole system. We just borrowed it, added some vibes, and called it a day. Classic human behavior." },
    { threadId: t1, orderIndex: 3, title: "Why Numbers, Though?", content: "Because words lie. Numbers don't. Your birth date doesn't care about your Instagram aesthetic. It just is. And that honesty is weirdly comforting." },
    { threadId: t2, orderIndex: 1, title: "The Lucky Number", content: "Seven appears everywhere: seven days, seven chakras, seven deadly sins (we don't judge), seven wonders. Coincidence? Probably. But it feels significant, and sometimes that's enough." },
    { threadId: t2, orderIndex: 2, title: "Science Has Opinions", content: "Psychologists call it the 'magical number seven'. Our brains can hold about seven items in working memory. So we're literally wired to love it. Your brain is basic. Embrace it." },
    { threadId: t2, orderIndex: 3, title: "Spiritual Vibes", content: "In numerology, 7 is the seeker, the mystic, the one who asks 'but why?' at parties. If that's you, congratulations, you're exhausting and also kind of brilliant." },
    { threadId: t2, orderIndex: 4, title: "The Bottom Line", content: "Whether it's luck, biology, or cosmic design, 7 has earned its reputation. We're not saying it'll change your life. We're just saying it's worth a second look." },
    { threadId: t3, orderIndex: 1, title: "First: They're Pretty", content: "Let's be real. You bought that amethyst because it looked good on your shelf. The 'energy' thing was a bonus. We see you. No judgment." },
    { threadId: t3, orderIndex: 2, title: "Placebo is Real", content: "If holding a rose quartz makes you feel calmer, that's valid. The placebo effect is scientifically proven. Your brain is powerful. Use it. Or use a crystal. Whatever works." },
    { threadId: t3, orderIndex: 3, title: "Do Your Research", content: "Some crystals contain actual minerals. Some are dyed glass. Know what you're buying. Your wallet and your vibes will thank you." },
    { threadId: t3, orderIndex: 4, title: "The Honest Truth", content: "Crystals won't fix your life. But they might remind you to slow down, breathe, and appreciate something beautiful. Sometimes that's enough." },
    { threadId: t3, orderIndex: 5, title: "Start Simple", content: "Clear quartz, amethyst, rose quartz. The holy trinity of beginner crystals. Get one. Put it somewhere you'll see it. See what happens. Worst case? You have a nice rock." },
    { threadId: t4, orderIndex: 1, title: "Why Questions Matter", content: "The quality of your life is determined by the quality of your questions. 'Why am I like this?' is a start. 'What would make today feel complete?' is better. You're welcome." },
    { threadId: t4, orderIndex: 2, title: "Open vs. Closed", content: "Closed: 'Did you have a good day?' (Yes/No. Conversation over.) Open: 'What made today interesting?' (Stories. Connection. Actual human interaction.) You get the idea." },
    { threadId: t4, orderIndex: 3, title: "The 'And What Else?' Trick", content: "When someone gives you an answer, ask 'And what else?' It's magic. It digs deeper. It makes people feel heard. Use it wisely. Don't be annoying." },
    { threadId: t4, orderIndex: 4, title: "Questions for Yourself", content: "Before bed: 'What am I grateful for today?' Before a decision: 'What would my best self do?' Before doom-scrolling: 'Do I actually want to do this?' Simple. Effective. Underrated." },
    { threadId: t5, orderIndex: 1, title: "Sugar Pills That Heal", content: "In clinical trials, placebos work about 30% of the time. That's not fake healing. That's your nervous system responding to belief. Your brain is the most powerful pharmacy you own." },
    { threadId: t5, orderIndex: 2, title: "Ritual is Medicine", content: "Lighting a candle, holding a crystal, setting an intention. The act of pausing and paying attention changes your neurochemistry. Whether the candle is magic doesn't matter. The pause is." },
    { threadId: t5, orderIndex: 3, title: "Intention Changes Behavior", content: "When you decide 'this crystal means confidence,' you start acting more confident. The crystal didn't do that. Your decision did. But the crystal reminded you. Tools matter." },
    { threadId: t5, orderIndex: 4, title: "Use It, Don't Abuse It", content: "The placebo effect is powerful, not unlimited. It's a complement, not a replacement. Use crystals alongside your meds, not instead of them. Common sense is also a superpower." },
    { threadId: t6, orderIndex: 1, title: "Symbols Survive Everything", content: "Empires fall. Languages die. But symbols persist. The Eye of Horus, the Om, the Flower of Life. Humans keep drawing the same shapes across cultures that never met. That's not coincidence. That's pattern." },
    { threadId: t6, orderIndex: 2, title: "Numbers as Symbols", content: "Before numbers were math, they were stories. 1 was unity. 2 was duality. 3 was creation. We turned them into spreadsheets, but the stories are still there if you look." },
    { threadId: t6, orderIndex: 3, title: "Your Name is a Symbol", content: "Every time someone says your name, they're invoking a vibration. Gematria maps that vibration to a number. Numerology reads the number. The symbol carries meaning whether you calculate it or not." },
    { threadId: t6, orderIndex: 4, title: "Modern Symbols", content: "Emojis are the new hieroglyphics. Logos are the new sigils. Hashtags are the new incantations. We never stopped using symbols. We just got faster at it." },
  ]).run();

  console.log("[seed] Done.");
}
