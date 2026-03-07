import { db } from "./db.js";
import { blogPosts, products, galleryItems, courses, lessons, threads, threadCards } from "../shared/schema.js";
import { eq } from "drizzle-orm";

const IMAGE_VERSION = 3;

function migrateImages() {
  const versionKey = "__image_version";
  try {
    const row = db.select().from(blogPosts).all()[0] as any;
    if (!row) return;
  } catch { return; }

  const blogImageMap: Record<string, string> = {
    "life-path-number-not-personality-test": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    "numerology-of-names": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
    "crystals-vs-placebo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    "handcrafting-salves": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    "moon-phase-bracelet-design": "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=800&q=80",
    "gematria-when-letters-become-numbers": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80",
    "master-numbers-overachievers": "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=80",
    "placebo-effect-is-real": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
  };
  for (const [slug, url] of Object.entries(blogImageMap)) {
    db.update(blogPosts).set({ imageUrl: url }).where(eq(blogPosts.slug, slug)).run();
  }

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

  const nicolePosts = [
    {
      title: "The Mysterious Influence of Your Name: Unraveling the Secrets of Numerology and Identity Shifts",
      slug: "mysterious-influence-of-your-name",
      excerpt: "Names hold remarkable power and meaning, serving as more than just labels. They reflect our identity and resonate with vibrational frequencies that can shape various aspects of our lives.",
      content: `Names hold remarkable power and meaning, serving as more than just labels. They reflect our identity and resonate with vibrational frequencies that can shape various aspects of our lives.\n\nUnderstanding Numerology: A Brief Overview\n\nNumerology is an ancient practice that studies the significance of numbers and their bond with the universe. Each number carries unique vibrational traits, influencing personality, life paths, and opportunities. By translating names into numbers, numerology helps individuals uncover insights about themselves.\n\nUsing the Pythagorean chart, each letter corresponds to a number between 1 and 9:\n\nA, J, S = 1 | B, K, T = 2 | C, L, U = 3 | D, M, V = 4 | E, N, W = 5 | F, O, X = 6 | G, P, Y = 7 | H, Q, Z = 8 | I, R = 9\n\nThe Vibration of Your Name\n\nNames resonate at specific frequencies that can influence our lives profoundly. Each individual's name interacts with energies based on its letters. According to numerology, these vibrations can harmonize with the universe, impacting personality, relationships, career paths, and life experiences.\n\nWhen someone speaks your name, it creates a sound that resonates within you and those who hear it. This vibrational imprinting forges an energetic bond between an individual and their environment. Our names evoke emotions, trigger memories, and shape perceptions.\n\nResearch indicates that names can affect our life experiences. A 2020 survey revealed that 30% of hiring managers admitted they formed biases based merely on a candidate's name. By recognizing the vibrational imprint of our names, we can become more intentional about how we embody them.\n\nIdentity Shifts and Personal Transformation\n\nAs we evolve, we may feel the urge to change our names or the way we use them. Understanding the numerological implications of a name change is crucial. A new name can carry different vibrations that may open fresh opportunities.\n\nBy exploring the numerology of both old and new names, individuals can comprehend the energies they are embracing and how these may influence their life path.\n\nHow to Uncover the Vibration of Your Name\n\n1. Calculate Your Name Number: Begin by calculating your name's numerical value using the chart above. Reduce this total to a single-digit number between 1 and 9, known as your "Expression Number."\n\n2. Explore the Meaning of Your Expression Number: Each number carries specific meanings and attributes. Research the significance of your number to gain insights into your personality, strengths, weaknesses, and potential life path.\n\n3. Reflect on Your Current Identity: Think about how your name resonates with you. Does it represent who you are or who you want to be?\n\n4. Consider Potential Name Changes: If your name feels misaligned, contemplate a new name that better reflects your identity. Calculate the vibrational significance of any potential names to ensure they match your aspirations.\n\nThe connection between your name, its vibrational imprint, and your identity is a captivating journey worth exploring. Let your name transcend mere identification. Use it as a guide to your essence, leading you toward growth and fulfillment.`,
      category: "Numerology",
      readingTime: "8 min read",
      gradient: "from-violet-400 to-purple-700",
      imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
    },
    {
      title: "Cracking the Code: Unleashing Your True Luck Potential through Number Patterns and Frequency Alignment",
      slug: "cracking-the-code-luck-potential",
      excerpt: "Luck often seems random, like flipping a coin and hoping for heads. But what if you could create the right environment for good fortune?",
      content: `Luck often seems random, like flipping a coin and hoping for heads. But what if you could create the right environment for good fortune? By understanding signs of synchronicity, raising your personal frequency, and following the cycles of time, you can shape your luck.\n\nThe Mystique of Luck: Understanding Hidden Patterns\n\nWe've all had moments that felt like pure chance, like running into an old friend just when you needed advice. These instances, often regarded as coincidences, hold deeper meanings.\n\nRecognizing number patterns is your first step in unlocking this potential. Many cultures have long attributed mystical significance to numbers.\n\nNumber patterns refer to sequences or repetitions that appear often in your life. This might be seeing 555 on the clock, encountering a significant date multiple times, or noting a recurring number in various aspects of your day-to-day experiences.\n\nBy being aware of these patterns, you can make choices that align with these universal signals instead of passively drifting through life.\n\nThe Energy Shift: Raising Your Frequency for Luck\n\nLuck is not just about external events; it stems from your inner state. Raising your frequency means adopting a mindset and lifestyle that attracts positivity.\n\nIn spiritual terms, frequency refers to your vibrational energy and how it harmonizes with the energy around you. When you operate at a higher frequency, you draw in positive circumstances and people.\n\nHow to raise your frequency:\n\n1. Meditation: Spend even just five minutes daily meditating. Studies show that meditation can reduce stress by up to 40%, boosting overall well-being.\n\n2. Gratitude Practices: Keep a gratitude journal. Write down at least three things you appreciate each day.\n\n3. Surround Yourself with Positive Influences: Spend time with uplifting people and engage with inspiring media.\n\n4. Engage in Activities You Love: Pursue hobbies that bring you joy. Engaging in passions increases your vibrational energy and naturally invites luck into your life.\n\nThe Cycles of Time: Timing is Everything\n\nUnderstanding the right timing for actions can significantly impact their outcomes. Life functions in rhythms, whether it's the moon's phases or seasonal changes.\n\nKeep a simple journal to track your mood and energy. Note when you feel proactive and when you want to pause and reflect. This practice enhances your intuition, helping you discern the right moments to act or hold back.\n\nPractical Steps to Harness Your Luck:\n\n1. Weekly Number Patterns Check: Start each week by reflecting on any number patterns from the last week.\n\n2. Morning Frequency Ritual: Allocate a few minutes each morning to raise your frequency through meditation, gratitude, or even a brief walk in nature.\n\n3. Plan Around Cycles: Use a planner to mark significant dates, upcoming moon phases, or your personal high-energy days.\n\nHarnessing luck is not about controlling outcomes; it's about aligning with life's flow and seizing universal opportunities. When you actively shape your destiny and align with the universe's energies, luck transforms from something you wait for into a natural part of your intentional life.`,
      category: "Spirituality",
      readingTime: "7 min read",
      gradient: "from-emerald-400 to-teal-700",
      imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
    },
    {
      title: "The Secret Symphony: The Mysteries of Numerology, Frequency, and Reality Formation",
      slug: "secret-symphony-numerology-frequency",
      excerpt: "Imagine a world where everything around you is woven together by invisible threads of numbers, sounds, and energies. Each number resonates with unique frequencies that shape our reality.",
      content: `Imagine a world where everything around you is woven together by invisible threads of numbers, sounds, and energies. Each number resonates with unique frequencies, and these vibrations shape the very fabric of our reality.\n\nUnderstanding Numerology: The Language of Numbers\n\nNumerology is the study of the mystical significance of numbers and how they influence our lives. Each number has unique vibrations and meanings.\n\n1: Leadership and new beginnings. Those with a strong 1 presence often find themselves starting new projects.\n2: Balance and partnership. This vibration leads towards successful collaborations.\n3: Creativity and self-expression. Many artists and writers are influenced by this number.\n4: Stability and pragmatism, building strong foundations.\n5: Adventure and change, encouraging exploration.\n6: Nurturing and responsibility.\n7: Introspection and spirituality.\n8: Power and success.\n9: Compassion and humanitarianism.\n11: Master Number. Intuition and spiritual awakening.\n22: Master Builder. Vision and manifesting dreams.\n33: Master Teacher. Healing and compassion.\n\nEvery number vibrates at its distinct frequency. This frequency can significantly affect our emotional and physical states. The number 3 is often associated with joy and creativity. Research shows individuals who focus on creative endeavors report a 30% increase in overall satisfaction when aligned with this vibration.\n\nUnlocking Frequencies: Sound and Vibration\n\nJust as numbers hold unique meanings, so do sounds. Sound waves, measured in hertz (Hz), indicate the number of vibrations per second. The human body operates on frequencies ranging between 62 to 72 MHz.\n\nThe frequency of 432 Hz is believed to correspond with the universe's natural frequencies, promoting relaxation and inner peace. Listening to music tuned to this frequency can lead to a reported 20% increase in mood and emotional health.\n\nSound healing utilizes these vibrational properties. Instruments like singing bowls, gongs, and tuning forks provide vibrations that foster healing. Studies show sound therapy can reduce anxiety levels by up to 50%.\n\nThe Interplay of Energy in Reality Formation\n\nCombining numerology and frequency science leads us to a vital understanding: the role of energy in shaping our reality. The Law of Attraction proposes that like attracts like. When we radiate positive energies through our thoughts and intentions, we draw experiences that resonate with those frequencies.\n\nIn quantum physics, particles exist in potential states until observed. Consciousness plays a significant role in manifesting reality. Our thoughts and feelings contribute to a broader energy matrix, subtly tuning into the universe's fabric.\n\nPractical Applications:\n\n1. Meditative Practices: Focus on a number that resonates with you deeply. Visualize that number's energy surrounding you. Pair meditation with sound therapy using music tuned to specific frequencies.\n\n2. Journaling with Numbers: Keep a journal dedicated to exploring numerological insights. Reflect on important dates, significant experiences, and recurring numbers.\n\nThe interplay of numerology, frequency, and energy reveals an intriguing tapestry woven into our reality. You have the power to create your own symphony within this grand universe. Tune into your inner frequencies, explore the wisdom of numbers, and allow the energy of reality to guide your journey.`,
      category: "Numerology",
      readingTime: "10 min read",
      gradient: "from-amber-400 to-orange-700",
      imageUrl: "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=80",
    },
  ];

  for (const post of nicolePosts) {
    const exists = db.select().from(blogPosts).where(eq(blogPosts.slug, post.slug)).get();
    if (!exists) {
      db.insert(blogPosts).values(post).run();
      console.log(`[seed] Added blog post: ${post.title}`);
    }
  }
}

export function seedDatabase() {
  migrateImages();

  const postCount = db.select().from(blogPosts).all().length;
  if (postCount > 0) return;

  console.log("[seed] Seeding database...");

  db.insert(blogPosts).values([
    {
      title: "Why Your Life Path Number Isn't a Personality Test",
      slug: "life-path-number-not-personality-test",
      excerpt: "Spoiler: it's more like a GPS for your soul. We break down why reducing numerology to a BuzzFeed quiz does everyone a disservice.",
      content: `Your Life Path number is not a personality test. It's not a horoscope. It's not a label.\n\nIt's a trajectory. A theme. A road your soul chose before you showed up here and started making questionable life decisions.\n\nThe problem with treating it like a personality quiz is that you flatten something multidimensional into a single trait. "Oh, I'm a 7, so I'm introspective." Sure. But you're also stubborn, deeply intuitive, and probably overthinking this article right now.\n\nYour Life Path number speaks to your life's purpose, not your personality. Personality is Expression, Soul Urge, Personality number. Life Path is about the journey itself.\n\nThink of it this way: your personality is how you drive. Your Life Path is the road. Same car, different experience depending on where you're headed.\n\nWant to know yours? The free calculator gives you all ten core numbers in seconds.`,
      category: "Numerology",
      readingTime: "6 min read",
      gradient: "from-brand-400 to-brand-700",
      imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    },
    {
      title: "The Numerology of Names: What's in Yours?",
      slug: "numerology-of-names",
      excerpt: "Your name carries more than just your parents' hopes and dreams. Here's what the numbers say about the letters you answer to.",
      content: `Every letter in your name has a numerical value. When you add them up and reduce them, you get numbers that describe your Expression, Soul Urge, and Personality.\n\nYour Expression number (the full name) reveals your natural abilities and potential. Your Soul Urge (the vowels) reveals your inner desires, the things that drive you when nobody's watching. Your Personality number (the consonants) shows how others perceive you.\n\nThe fun part? If you've changed your name, married, or go by a nickname, those all carry different vibrations. Your birth name is your baseline. Everything else is a variation on the theme.\n\nSo next time someone asks "what's in a name?" you can tell them: quite literally everything.`,
      category: "Numerology",
      readingTime: "8 min read",
      gradient: "from-violet-400 to-purple-600",
      imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
    },
    {
      title: "Crystals vs. Placebo: A Skeptic's Guide",
      slug: "crystals-vs-placebo",
      excerpt: "We love our crystals. We also love science. Can both be true? A surprisingly nuanced take from someone who owns too many rocks.",
      content: `Let's get this out of the way: there is no peer-reviewed scientific evidence that crystals have healing powers.\n\nNow let's get this out of the way too: the placebo effect is one of the most powerful and well-documented phenomena in medicine. If believing something helps you feel better, you genuinely feel better. That's not fake. That's neuroscience.\n\nSo here's our take: crystals are beautiful, they encourage mindfulness, and they serve as physical reminders of intentions you've set. Is that "healing"? Maybe not in the clinical sense. But it's not nothing.\n\nThe key is honesty. Don't skip your medication for an amethyst. But also don't dismiss the real psychological benefits of ritual, beauty, and intention.\n\nWe sell crystals. We also sell honesty. Both are in stock.`,
      category: "Curiosity",
      readingTime: "5 min read",
      gradient: "from-amber-400 to-orange-600",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    },
    {
      title: "Handcrafting Salves: Why We Do It Wrong (On Purpose)",
      slug: "handcrafting-salves",
      excerpt: "There's a reason our salves don't look like they came from a factory. Intentional imperfection and the art of the handmade.",
      content: `Our salves aren't perfect. They're not uniform. Sometimes the color varies batch to batch. Sometimes there's a slight texture difference.\n\nThat's not a bug. That's the entire point.\n\nWhen you make something by hand, you accept that each batch is unique. The ingredients are natural, the process is manual, and the result is something that carries the energy of being made with attention.\n\nFactory products are consistent because machines don't care. Handmade products are inconsistent because humans do.\n\nEvery jar we sell was stirred by hand, poured with intention, and tested on the person who made it. If that's "wrong," we'll keep doing it wrong.`,
      category: "Making",
      readingTime: "7 min read",
      gradient: "from-emerald-500 to-teal-700",
      imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    },
    {
      title: "The Moon Phase Bracelet: Design Notes",
      slug: "moon-phase-bracelet-design",
      excerpt: "How we turned a celestial obsession into something you can wear. Plus: why tracking the moon matters more than you think.",
      content: `The Moon Phase Bracelet started as a sketch on a napkin. Literally. We were at a coffee shop, looking at the moon, and wondering why nobody made jewelry that tracked it properly.\n\nMost moon jewelry is decorative. Ours is functional. Each bead represents a phase, and the arrangement follows the actual lunar cycle. You can look down at your wrist and know where you are in the month.\n\nWhy does that matter? Because the moon has been humanity's original calendar for thousands of years. Farmers planted by it. Sailors navigated by it. And whether you believe in its influence or not, there's something grounding about paying attention to a cycle bigger than your to-do list.\n\nThe bracelet comes in silver and obsidian. Both look incredible. We're not biased at all.`,
      category: "Jewelry",
      readingTime: "4 min read",
      gradient: "from-rose-400 to-pink-600",
      imageUrl: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=800&q=80",
    },
    {
      title: "Gematria: When Letters Become Numbers",
      slug: "gematria-when-letters-become-numbers",
      excerpt: "An ancient practice that turns words into numbers and finds meaning in the math. Here's why it's more fascinating than it sounds.",
      content: `Gematria is one of those things that sounds complicated until you try it. Then it sounds even more complicated. But stick with me.\n\nThe basic idea: every letter has a numerical value. Add up the letters in a word, get a number. If two words add up to the same number, there's a connection. That's it. That's the whole system.\n\nExcept it's not, because humans have been finding layers in this for thousands of years. Kabbalists used gematria to decode hidden meanings in the Torah. Greek scholars did it with their own alphabet. Even today, people use it to find connections between names, intentions, and sacred texts.\n\nWe built a free gematria calculator on the site. Try your name. Try your partner's name. Try "pizza." No judgment on what you explore first.`,
      category: "Tools",
      readingTime: "5 min read",
      gradient: "from-cyan-400 to-blue-600",
      imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80",
    },
    {
      title: "Master Numbers: The Overachievers of Numerology",
      slug: "master-numbers-overachievers",
      excerpt: "11, 22, and 33 aren't just numbers. They're invitations to a harder, more rewarding path. No pressure.",
      content: `In numerology, most numbers get reduced to a single digit. 15 becomes 6. 28 becomes 1. But three numbers refuse to be reduced: 11, 22, and 33.\n\nThese are the Master Numbers, and they earned the title.\n\n11 is the Intuitive Illuminator. Double 1, double independence, double vision. People with 11 prominent in their chart often feel like they're receiving signals others can't hear.\n\n22 is the Master Builder. The ability to turn dreams into reality on a massive scale.\n\n33 is the Master Teacher. Compassion at a cosmic level.\n\nIf you have a Master Number, you didn't get the easy route. You got the scenic one. The views are better, but so are the hills.`,
      category: "Numerology",
      readingTime: "6 min read",
      gradient: "from-gold-400 to-amber-600",
      imageUrl: "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=80",
    },
    {
      title: "The Placebo Effect is Real (And That's a Good Thing)",
      slug: "placebo-effect-is-real",
      excerpt: "Science says believing something helps can actually help. So what does that mean for crystals, numerology, and everything we do here?",
      content: `The placebo effect is one of the most well-documented phenomena in medicine. Give someone a sugar pill, tell them it's medicine, and measurable healing occurs. Their brain does the work.\n\nThis isn't fake healing. This is your nervous system responding to belief, intention, and ritual. Neuroscientists have mapped the exact pathways. It's real. It's measurable. It's powerful.\n\nWe're not here to prove crystals are medicine. We're here to offer tools for reflection, intention, and curiosity. If those tools work because you believe in them, that's not a weakness. That's your brain being extraordinary.`,
      category: "Curiosity",
      readingTime: "5 min read",
      gradient: "from-teal-400 to-cyan-600",
      imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
    },
  ]).run();

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
