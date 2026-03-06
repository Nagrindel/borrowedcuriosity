import { Express } from "express";
import { db } from "./db.js";
import { numerologyProfiles, dailyNumerology, relationshipCompatibility } from "../shared/schema.js";
import { eq, desc } from "drizzle-orm";
import { getVerseByLifePath, getVerseByTheme, BIBLICAL_VERSES } from "./biblical-verses.js";

function reduce(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = String(num).split("").reduce((s, d) => s + parseInt(d), 0);
  }
  return num;
}

function compatNotes(lp1: number, lp2: number): string {
  const traits: Record<number, string> = {
    1: "Independent leader", 2: "Cooperative partner", 3: "Creative communicator",
    4: "Stable foundation", 5: "Freedom seeker", 6: "Nurturing caregiver",
    7: "Spiritual seeker", 8: "Material achiever", 9: "Universal lover",
    11: "Intuitive master", 22: "Master builder", 33: "Master teacher",
  };
  const harmony = reduce(lp1 + lp2);
  const t1 = traits[lp1] || "Unique individual";
  const t2 = traits[lp2] || "Unique individual";
  const level = harmony <= 3 ? "Strong foundation" : harmony <= 6 ? "Balanced harmony" : "Spiritual connection";
  return `${t1} with ${t2} creates ${level}. Harmony number ${harmony} indicates mutual growth potential.`;
}

export function registerNumerologyRoutes(app: Express) {

  // ─── Save Profile ───
  app.post("/api/numerology/profile", async (req, res) => {
    try {
      const d = req.body;
      const [row] = await db.insert(numerologyProfiles).values({
        fullName: d.fullName, birthDate: d.birthDate, system: d.system,
        lifePath: d.lifePath, expression: d.expression, soulUrge: d.soulUrge,
        personality: d.personality, birthDay: d.birthDay, maturity: d.maturity,
        hiddenPassion: d.hiddenPassion, karmicLesson: d.karmicLesson ?? 0,
        balance: d.balance, subconscious: d.subconscious,
      }).returning();
      res.status(201).json(row);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/numerology/profiles", async (_req, res) => {
    const rows = await db.select().from(numerologyProfiles).orderBy(desc(numerologyProfiles.createdAt)).limit(20);
    res.json(rows);
  });

  // ─── Daily Numerology ───
  app.get("/api/daily-numerology/:date", async (req, res) => {
    try {
      const date = req.params.date;
      const existing = await db.select().from(dailyNumerology).where(eq(dailyNumerology.date, date)).limit(1);
      if (existing.length > 0) return res.json(existing[0]);

      const d = new Date(date);
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();

      const profiles = await db.select().from(numerologyProfiles).limit(1);
      const lp = profiles.length > 0 ? profiles[0].lifePath : 7;

      const energyOfDay = reduce(lp + day + year);
      const monthFocus = reduce(Math.abs(lp + month - 11) || 1);
      const intentionalAction = reduce(day + 3);
      const verse = getVerseByLifePath(energyOfDay);

      const [row] = await db.insert(dailyNumerology).values({
        date, energyOfDay, monthFocus, intentionalAction,
        biblicalVerse: verse.text, verseReference: verse.reference,
        verseNumericalValue: verse.numericalValue,
      }).returning();
      res.json(row);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── Biblical Verses ───
  app.get("/api/biblical-verses", (req, res) => {
    const { lifePath, theme } = req.query;
    let verse;
    if (lifePath) verse = getVerseByLifePath(parseInt(lifePath as string));
    else if (theme) verse = getVerseByTheme(theme as string);
    else verse = BIBLICAL_VERSES[Math.floor(Math.random() * BIBLICAL_VERSES.length)];
    res.json(verse);
  });

  // ─── Relationship Compatibility ───
  app.post("/api/relationship-compatibility", async (req, res) => {
    try {
      const { partner1Name, partner2Name, partner1LifePath, partner2LifePath } = req.body;
      if (!partner1Name || !partner2Name || !partner1LifePath || !partner2LifePath) {
        return res.status(400).json({ error: "All fields required" });
      }
      const lp1 = parseInt(partner1LifePath);
      const lp2 = parseInt(partner2LifePath);
      const harmonyScore = reduce(lp1 + lp2);
      const attractionPotential = reduce(lp1 + lp2 + reduce(lp1 + lp2));
      const notes = compatNotes(lp1, lp2);

      const [row] = await db.insert(relationshipCompatibility).values({
        partner1Name, partner2Name, partner1LifePath: lp1, partner2LifePath: lp2,
        harmonyScore, attractionPotential, compatibilityNotes: notes,
      }).returning();
      res.status(201).json(row);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/relationship-compatibilities", async (_req, res) => {
    const rows = await db.select().from(relationshipCompatibility).orderBy(desc(relationshipCompatibility.createdAt)).limit(20);
    res.json(rows);
  });

  // ─── Dictionary Proxy (word lookup) ───
  app.get("/api/dictionary/:word", async (req, res) => {
    try {
      const word = req.params.word.toLowerCase();
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        return res.status(response.status === 404 ? 404 : 500).json({ error: "Word not found" });
      }
      const data: any[] = await response.json();
      if (!data?.length) return res.status(404).json({ error: "No definition found" });

      const w = data[0];
      const main = w.meanings?.[0];
      const def = main?.definitions?.[0];
      const synonyms = new Set<string>();
      const antonyms = new Set<string>();
      w.meanings?.forEach((m: any) => m.definitions?.forEach((d: any) => {
        d.synonyms?.forEach((s: string) => synonyms.add(s));
        d.antonyms?.forEach((a: string) => antonyms.add(a));
      }));

      res.json({
        word: w.word,
        pronunciation: w.phonetic || w.phonetics?.[0]?.text || "",
        partOfSpeech: main?.partOfSpeech || "noun",
        definition: def?.definition || "",
        etymology: w.origin || "",
        example: def?.example || "",
        synonyms: [...synonyms].slice(0, 8),
        antonyms: [...antonyms].slice(0, 6),
        meanings: w.meanings?.map((m: any) => ({
          partOfSpeech: m.partOfSpeech,
          definitions: m.definitions?.slice(0, 3).map((d: any) => ({ definition: d.definition, example: d.example })),
        })),
      });
    } catch {
      res.status(500).json({ error: "Dictionary lookup failed" });
    }
  });
}
