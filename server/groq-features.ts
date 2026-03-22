import { Express, Request, Response } from "express";
import Groq from "groq-sdk";
import multer from "multer";
import path from "path";
import fs from "fs";

let groq: Groq | null = null;
function getGroq(): Groq | null {
  if (groq) return groq;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  groq = new Groq({ apiKey });
  return groq;
}

const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `crystal-${Date.now()}${ext}`);
  },
});
const crystalUpload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

export function registerGroqFeatureRoutes(app: Express) {

  // ── Crystal Identifier ──
  app.post("/api/crystal/identify", crystalUpload.single("image"), async (req: Request, res: Response) => {
    const client = getGroq();
    if (!client) return res.status(503).json({ error: "AI not connected. Set GROQ_API_KEY." });

    const description = req.body?.description || "";
    const imageFile = req.file;

    let prompt = `You are an expert crystal and mineral identifier with deep knowledge of geology, metaphysical properties, chakra systems, and sacred mythology.

Analyze the crystal described below and return a JSON object with this EXACT structure (no markdown, no backticks, just raw JSON):
{
  "name": "Crystal Name",
  "scientificName": "Scientific/mineral name",
  "confidence": 85,
  "geological": {
    "hardness": "7 (Mohs scale)",
    "crystalSystem": "Hexagonal",
    "composition": "SiO2",
    "formation": "How it forms in nature",
    "locations": ["Brazil", "Madagascar"]
  },
  "metaphysical": {
    "chakras": ["Third Eye", "Crown"],
    "element": "Water",
    "zodiac": ["Pisces", "Aquarius"],
    "vibration": 3,
    "properties": ["Intuition", "Calm", "Spiritual awareness"],
    "healingUses": "Calms the mind, enhances meditation, aids sleep and dream recall.",
    "emotionalUses": "Releases anxiety, grief, and addictive patterns.",
    "spiritualUses": "Opens psychic abilities, deepens meditation, connects to higher self."
  },
  "sacredStories": {
    "biblical": "Any biblical references or connections to this stone.",
    "mythology": "Greek, Roman, Egyptian, or other mythological connections.",
    "cultural": "How different cultures have used or revered this stone.",
    "folklore": "Folk beliefs, legends, or traditional uses."
  },
  "careGuide": {
    "cleansing": ["Moonlight", "Smoke cleansing"],
    "charging": ["Full moon", "Sunlight (brief)"],
    "avoid": ["Prolonged sunlight", "Saltwater"],
    "pairsWith": ["Clear Quartz", "Rose Quartz"]
  },
  "marketValue": {
    "priceRange": "$5-$50 per specimen (varies by quality, size, and origin)",
    "rarity": "Common/Uncommon/Rare/Very Rare",
    "collectibility": "Low/Moderate/High/Museum Grade",
    "factors": ["Color saturation", "Clarity", "Size", "Origin", "Crystal formation quality"],
    "investmentNotes": "Brief notes on whether this stone holds or appreciates in value and what makes a premium specimen."
  },
  "numerologyLink": {
    "number": 7,
    "reason": "Why this crystal resonates with this Life Path number."
  },
  "funFact": "An interesting or surprising fact about this crystal."
}`;

    if (description) {
      prompt += `\n\nUser description of the crystal: "${description}"`;
    }

    if (imageFile) {
      const base64 = fs.readFileSync(imageFile.path).toString("base64");
      const mimeType = imageFile.mimetype || "image/jpeg";

      try {
        const response = await client.chat.completions.create({
          model: "llama-3.2-90b-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
              ],
            },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        });

        const text = response.choices[0]?.message?.content || "";
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
          return res.json(parsed);
        } catch {
          return res.json({ raw: text, error: "Could not parse structured response" });
        }
      } catch (err: any) {
        console.error("[crystal] vision error:", err.message);
        return res.status(500).json({ error: "Failed to analyze image. Try describing the crystal instead." });
      }
    }

    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2048,
      });

      const text = response.choices[0]?.message?.content || "";
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        return res.json(parsed);
      } catch {
        return res.json({ raw: text, error: "Could not parse structured response" });
      }
    } catch (err: any) {
      console.error("[crystal] text error:", err.message);
      return res.status(500).json({ error: "Analysis failed. Try again." });
    }
  });

  // ── Journal Prompt Generator ──
  app.post("/api/journal/generate", async (req: Request, res: Response) => {
    const client = getGroq();
    if (!client) return res.status(503).json({ error: "AI not connected. Set GROQ_API_KEY." });

    const { theme, mood, lifePathNumber, depth } = req.body;

    const prompt = `You are a spiritual journal prompt creator for Borrowed Curiosity, a numerology and self-discovery platform.

Generate 7 unique, thoughtful journal prompts based on these inputs:
- Theme: ${theme || "self-discovery"}
- Current mood: ${mood || "reflective"}
- Life Path Number: ${lifePathNumber || "unknown"}
- Depth: ${depth || "medium"}

Return ONLY a JSON array (no markdown, no backticks):
[
  {
    "prompt": "The actual journal prompt question",
    "followUp": "A gentle follow-up question to dig deeper",
    "affirmation": "A related positive affirmation",
    "category": "one of: reflection, gratitude, shadow-work, manifestation, relationships, purpose, healing"
  }
]

Make them:
- Genuinely insightful, not generic
- Mix of comfortable and gently challenging
- Connected to numerology/spirituality when the Life Path number is known
- Avoid em dashes
- Witty but warm, like a smart friend asking great questions`;

    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        max_tokens: 2048,
      });

      const text = response.choices[0]?.message?.content || "";
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        return res.json({ prompts: parsed });
      } catch {
        return res.json({ raw: text, error: "Could not parse prompts" });
      }
    } catch (err: any) {
      console.error("[journal] error:", err.message);
      return res.status(500).json({ error: "Failed to generate prompts." });
    }
  });

  // ── Spiritual Quiz Generator ──
  app.post("/api/quiz/generate", async (req: Request, res: Response) => {
    const client = getGroq();
    if (!client) return res.status(503).json({ error: "AI not connected. Set GROQ_API_KEY." });

    const { topic, questionCount } = req.body;
    const count = Math.min(Math.max(questionCount || 5, 3), 15);

    const prompt = `You are a quiz creator for Borrowed Curiosity, a numerology and spirituality platform.

Create a ${count}-question quiz about: "${topic || "numerology basics"}"

Return ONLY a JSON object (no markdown, no backticks):
{
  "title": "Quiz title",
  "description": "One sentence describing the quiz",
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct, with interesting context"
    }
  ]
}

Make questions:
- Educational and interesting, not trivially easy
- Mix difficulty levels
- Cover numerology, crystals, gematria, chakras, spirituality as relevant
- Explanations should teach something new
- Avoid em dashes`;

    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 3000,
      });

      const text = response.choices[0]?.message?.content || "";
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        return res.json(parsed);
      } catch {
        return res.json({ raw: text, error: "Could not parse quiz" });
      }
    } catch (err: any) {
      console.error("[quiz] error:", err.message);
      return res.status(500).json({ error: "Failed to generate quiz." });
    }
  });

  // ── Sacred Stories ──
  app.get("/api/stories", async (_req: Request, res: Response) => {
    res.json({ stories: SACRED_STORIES });
  });

  app.get("/api/stories/:slug", async (req: Request, res: Response) => {
    const story = SACRED_STORIES.find(s => s.slug === req.params.slug);
    if (!story) return res.status(404).json({ error: "Story not found" });

    const client = getGroq();
    if (!client) return res.json({ ...story, expanded: null });

    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `You are a spiritual storyteller for Borrowed Curiosity. Expand on this sacred story with rich detail, historical context, and spiritual significance. Keep it engaging and educational. 2-3 paragraphs. No em dashes.

Title: ${story.title}
Summary: ${story.content}
Category: ${story.category}`,
        }],
        temperature: 0.8,
        max_tokens: 1024,
      });

      const expanded = response.choices[0]?.message?.content || null;
      return res.json({ ...story, expanded });
    } catch {
      return res.json({ ...story, expanded: null });
    }
  });

  // ── Worksheet Generator ──
  app.post("/api/worksheets/generate", async (req: Request, res: Response) => {
    const client = getGroq();
    if (!client) return res.status(503).json({ error: "Service unavailable. Set GROQ_API_KEY." });
    const { type, topic, ageGroup, tone, questionCount } = req.body;
    if (!type || !topic) return res.status(400).json({ error: "Type and topic are required." });
    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `Create a ${type} about "${topic}" for ${ageGroup || "adults"} in a ${tone || "thoughtful"} tone with ${questionCount || 10} questions/prompts. Format with ## for section headers, ** for bold, and - for bullet points. Make it substantive, educational, and genuinely useful. No em dashes. No emojis. Include an introduction, the main content, and a closing reflection.`,
        }],
        temperature: 0.8,
        max_tokens: 2048,
      });
      const content = response.choices[0]?.message?.content || "";
      res.json({ content });
    } catch (err: any) {
      console.error("[worksheets] error:", err.message);
      res.status(500).json({ error: "Failed to generate worksheet." });
    }
  });

  // ── Content Creator ──
  app.post("/api/creator/generate", async (req: Request, res: Response) => {
    const client = getGroq();
    if (!client) return res.status(503).json({ error: "Service unavailable. Set GROQ_API_KEY." });
    const { contentType, topic, tone, additionalContext } = req.body;
    if (!contentType || !topic) return res.status(400).json({ error: "Content type and topic are required." });
    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `You are a professional content creator for Borrowed Curiosity, a spiritual and wellness brand. Generate a ${contentType} about "${topic}" in a ${tone || "warm"} tone. ${additionalContext ? `Additional context: ${additionalContext}` : ""} Make it polished, authentic, and ready to use. No em dashes. No emojis. Format with ## for headers if needed, ** for bold, and - for bullet points.`,
        }],
        temperature: 0.85,
        max_tokens: 2048,
      });
      const content = response.choices[0]?.message?.content || "";
      res.json({ content });
    } catch (err: any) {
      console.error("[creator] error:", err.message);
      res.status(500).json({ error: "Failed to generate content." });
    }
  });

  // ── Transformation: Belief Rewriter ──
  app.post("/api/transform/rewrite", async (req: Request, res: Response) => {
    const client = getGroq();
    if (!client) return res.status(503).json({ error: "Service unavailable. Set GROQ_API_KEY." });
    const { belief } = req.body;
    if (!belief) return res.status(400).json({ error: "Belief is required." });
    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `A person holds the limiting belief: "${belief}". Provide a JSON response with exactly these four fields (no markdown, no backticks, just raw JSON):
{
  "rewrite": "A powerful, empowering rewrite of this belief",
  "explanation": "2-3 sentences explaining why the old belief held them back and how the new one opens doors",
  "affirmation": "A daily affirmation they can repeat to reinforce the new belief",
  "practice": "A specific daily practice (2-3 sentences) they can do to embody the new belief"
}
No em dashes. No emojis. Be genuine and psychologically grounded.`,
        }],
        temperature: 0.8,
        max_tokens: 1024,
      });
      const raw = response.choices[0]?.message?.content || "{}";
      const cleaned = raw.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      res.json(parsed);
    } catch (err: any) {
      console.error("[transform/rewrite] error:", err.message);
      res.status(500).json({ error: "Failed to rewrite belief." });
    }
  });

  // ── Transformation: Spiritual Insight ──
  app.post("/api/transform/insight", async (req: Request, res: Response) => {
    const client = getGroq();
    if (!client) return res.status(503).json({ error: "Service unavailable. Set GROQ_API_KEY." });
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required." });
    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `Write a deep, thoughtful exploration of "${topic}" from a spiritual perspective. 4-5 paragraphs. Cover what it is, why it matters for personal growth, common misconceptions, and practical ways to work with this concept. Be grounded, insightful, and specific. No em dashes. No emojis. No generic spiritual platitudes.`,
        }],
        temperature: 0.85,
        max_tokens: 1500,
      });
      const content = response.choices[0]?.message?.content || "";
      res.json({ content });
    } catch (err: any) {
      console.error("[transform/insight] error:", err.message);
      res.status(500).json({ error: "Failed to generate insight." });
    }
  });

  // ── Pattern Mirror ──
  app.post("/api/mirror/analyze", async (req: Request, res: Response) => {
    const client = getGroq();
    if (!client) return res.status(503).json({ error: "Service unavailable. Set GROQ_API_KEY." });
    const { type, content } = req.body;
    if (!type || !content) return res.status(400).json({ error: "Type and content are required." });

    const prompts: Record<string, string> = {
      journal: `Analyze this journal entry for recurring patterns, emotional themes, and growth opportunities. Be specific and insightful. Return JSON with: { "patterns": ["pattern1", "pattern2", ...], "themes": ["theme1", ...], "insight": "2-3 paragraph analysis", "question": "A powerful follow-up question for deeper reflection" }. No em dashes. No emojis.`,
      symbol: `Interpret this symbol or dream element from psychological and spiritual perspectives. Return JSON with: { "psychological": "Jungian/psychological interpretation (2-3 sentences)", "spiritual": "Spiritual/archetypal meaning (2-3 sentences)", "message": "What this symbol might be telling the person (2-3 sentences)", "suggestion": "A practical way to work with this symbol's energy" }. No em dashes. No emojis.`,
    };

    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `${prompts[type] || prompts.journal}\n\nContent to analyze:\n"${content}"`,
        }],
        temperature: 0.8,
        max_tokens: 1500,
      });
      const raw = response.choices[0]?.message?.content || "{}";
      const cleaned = raw.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      res.json(parsed);
    } catch (err: any) {
      console.error("[mirror] error:", err.message);
      res.status(500).json({ error: "Analysis failed. Try again." });
    }
  });

  // ── Salve Builder recommendation ──
  app.post("/api/salve/recommend", async (req: Request, res: Response) => {
    const client = getGroq();
    if (!client) return res.status(503).json({ error: "Service unavailable. Set GROQ_API_KEY." });
    const { answers } = req.body;
    if (!answers) return res.status(400).json({ error: "Assessment answers required." });
    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `Based on this wellness assessment: ${JSON.stringify(answers)}, recommend a personalized healing combination. Return JSON (no markdown, no backticks): { "oils": [{"name":"oil name","benefit":"why this oil"}], "crystals": [{"name":"crystal name","benefit":"why this crystal"}], "frequency": {"hz": number, "name":"frequency name","benefit":"why this frequency"}, "salveRecipe": {"name":"creative recipe name","ingredients":["ingredient1","ingredient2"],"instructions":"how to make it"}, "summary": "2-3 sentence personalized wellness summary" }. Use real essential oils, real crystals, and real solfeggio frequencies. No em dashes. No emojis.`,
        }],
        temperature: 0.8,
        max_tokens: 1500,
      });
      const raw = response.choices[0]?.message?.content || "{}";
      const cleaned = raw.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      res.json(parsed);
    } catch (err: any) {
      console.error("[salve] error:", err.message);
      res.status(500).json({ error: "Failed to generate recommendation." });
    }
  });

  // ── Healing Thread generation ──
  app.post("/api/healing-thread/generate", async (req: Request, res: Response) => {
    const client = getGroq();
    if (!client) return res.status(503).json({ error: "Service unavailable. Set GROQ_API_KEY." });
    const { theme, intention } = req.body;
    if (!theme) return res.status(400).json({ error: "Theme is required." });
    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `Create a healing thread (a series of 5-7 short, connected passages) on the theme of "${theme}". ${intention ? `The reader's intention: "${intention}".` : ""} Each passage should be 2-4 sentences, written in a poetic but grounded voice. They should be nonlinear, meaning each can stand alone but together they form a deeper meaning. Return JSON (no markdown, no backticks): { "title": "thread title", "passages": [{"text": "passage text", "voice": "voice label (e.g. Higher Self, Inner Child, Future Self, The Observer, The Healer)", "resonance": "one-word energy quality"}] }. No em dashes. No emojis.`,
        }],
        temperature: 0.9,
        max_tokens: 1500,
      });
      const raw = response.choices[0]?.message?.content || "{}";
      const cleaned = raw.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      res.json(parsed);
    } catch (err: any) {
      console.error("[healing-thread] error:", err.message);
      res.status(500).json({ error: "Failed to generate healing thread." });
    }
  });

}

const SACRED_STORIES = [
  {
    slug: "breastplate-of-aaron",
    title: "The Breastplate of Aaron",
    category: "biblical",
    content: "The High Priest's breastplate held 12 stones representing the 12 tribes of Israel. Each stone carried specific spiritual properties and divine connections that guided the nation.",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80",
  },
  {
    slug: "amethyst-dionysus",
    title: "Amethyst and Dionysus",
    category: "mythology",
    content: "Greek mythology tells of Dionysus pouring wine over a crystal maiden named Amethystos, turning her purple. The stone has been associated with sobriety and clear thinking ever since.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  },
  {
    slug: "jade-emperor",
    title: "The Jade Emperor",
    category: "cultural",
    content: "In Chinese tradition, jade is more valuable than gold. The Jade Emperor rules heaven itself. For thousands of years, jade has symbolized virtue, beauty, and immortality across East Asia.",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80",
  },
  {
    slug: "philosophers-stone",
    title: "The Philosopher's Stone",
    category: "alchemy",
    content: "Alchemists spent centuries searching for a stone that could transmute lead into gold and grant immortality. The real transformation, many later realized, was spiritual, not material.",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&q=80",
  },
  {
    slug: "crystals-of-atlantis",
    title: "The Crystals of Atlantis",
    category: "mythology",
    content: "Edgar Cayce described Atlantean technology powered by massive crystals. Whether literal or metaphorical, the idea that crystals can channel and amplify energy persists across spiritual traditions.",
    image: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=600&q=80",
  },
  {
    slug: "native-american-quartz",
    title: "Quartz in Native Traditions",
    category: "cultural",
    content: "Many Native American traditions consider clear quartz a living entity. Cherokee healers called them 'living rocks' and used them in ceremonies for clarity, healing, and communication with spirits.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
  },
  {
    slug: "egyptian-lapis",
    title: "Lapis Lazuli and the Pharaohs",
    category: "cultural",
    content: "Ancient Egyptians ground lapis lazuli into powder for Cleopatra's eyeshadow and buried it with pharaohs as a key to the afterlife. They believed it held the soul of the gods.",
    image: "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=600&q=80",
  },
  {
    slug: "seven-chakra-stones",
    title: "The Seven Chakra Stones",
    category: "spiritual",
    content: "Hindu tradition maps seven energy centers along the spine, each resonating with specific crystals. From red jasper at the root to amethyst at the crown, stones become tools for energetic alignment.",
    image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&q=80",
  },
  {
    slug: "moonstone-travelers",
    title: "Moonstone: The Traveler's Stone",
    category: "folklore",
    content: "Roman travelers carried moonstone believing it held captured moonlight that would protect them on journeys. In India, it's considered sacred and is only displayed on yellow cloth.",
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80",
  },
  {
    slug: "pythagoras-music-spheres",
    title: "Pythagoras and the Music of the Spheres",
    category: "spiritual",
    content: "Pythagoras believed the universe operates on mathematical harmony. Crystals, with their perfect geometric lattices, were seen as physical proof that nature thinks in numbers. Sound familiar?",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80",
  },
];
