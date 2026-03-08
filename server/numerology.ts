const PYTHAGOREAN: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

function reduce(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = String(num).split("").reduce((s, d) => s + parseInt(d), 0);
  }
  return num;
}

function sumLetters(text: string): number {
  return text.toUpperCase().split("").filter(c => /[A-Z]/.test(c)).map(c => PYTHAGOREAN[c] || 0).reduce((s, v) => s + v, 0);
}

function letterValues(text: string): { char: string; value: number }[] {
  return text.toUpperCase().split("").filter(c => /[A-Z]/.test(c)).map(c => ({ char: c, value: PYTHAGOREAN[c] || 0 }));
}

export interface ServerNumerologyProfile {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  birthDay: number;
  maturity: number;
  hiddenPassion: number;
  karmicLessons: number[];
  balance: number;
  subconscious: number;
}

export function calculateServerProfile(name: string, birthDate: string): ServerNumerologyProfile {
  const [yearStr, monthStr, dayStr] = birthDate.split("-");
  const month = parseInt(monthStr, 10);
  const dayNum = parseInt(dayStr, 10);
  const yearDigitSum = yearStr.split("").reduce((s, c) => s + parseInt(c, 10), 0);
  const lifePath = reduce(reduce(month) + reduce(dayNum) + reduce(yearDigitSum));

  const cleanName = name.replace(/[^a-zA-Z]/g, "");
  const expression = reduce(sumLetters(cleanName));
  const soulUrge = reduce(sumLetters(name.replace(/[^aeiouAEIOU]/g, "")));
  const personality = reduce(sumLetters(name.replace(/[aeiouAEIOU\s]/g, "")));
  const birthDay = reduce(dayNum);
  const maturity = reduce(lifePath + expression);

  const counts: Record<number, number> = {};
  letterValues(cleanName).forEach(l => { counts[l.value] = (counts[l.value] || 0) + 1; });
  const hiddenPassion = parseInt(Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || "1");

  const present = new Set(letterValues(cleanName).map(l => l.value));
  const karmicLessons: number[] = [];
  for (let i = 1; i <= 9; i++) if (!present.has(i)) karmicLessons.push(i);

  const balance = reduce(lifePath + personality);
  const subconscious = 9 - karmicLessons.length;

  return { lifePath, expression, soulUrge, personality, birthDay, maturity, hiddenPassion, karmicLessons, balance, subconscious };
}

const MEANINGS: Record<number, string> = {
  1: "Leadership, independence, pioneering spirit",
  2: "Cooperation, harmony, sensitivity, partnership",
  3: "Creativity, self-expression, communication, joy",
  4: "Stability, hard work, practicality, foundation",
  5: "Freedom, adventure, versatility, change",
  6: "Nurturing, responsibility, healing, love",
  7: "Spirituality, introspection, analysis, wisdom",
  8: "Material success, authority, achievement, power",
  9: "Universal love, humanitarian, completion, service",
  11: "Master Number: Intuition, inspiration, enlightenment",
  22: "Master Number: Practical idealism, large endeavors",
  33: "Master Number: Compassionate service, healing",
};

export function profileToPromptContext(profile: ServerNumerologyProfile, name: string, birthDate: string): string {
  const [yr, mo, dy] = birthDate.split("-").map(Number);
  const displayDate = new Date(yr, mo - 1, dy).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return `CLIENT NUMEROLOGY PROFILE:
Name: ${name}
Date of Birth: ${displayDate}
System: Pythagorean

CORE NUMBERS:
- Life Path: ${profile.lifePath} (${MEANINGS[profile.lifePath] || ""})
- Expression: ${profile.expression} (${MEANINGS[profile.expression] || ""})
- Soul Urge: ${profile.soulUrge} (${MEANINGS[profile.soulUrge] || ""})
- Personality: ${profile.personality} (${MEANINGS[profile.personality] || ""})
- Birthday Number: ${profile.birthDay} (${MEANINGS[profile.birthDay] || ""})
- Maturity Number: ${profile.maturity} (${MEANINGS[profile.maturity] || ""})
- Hidden Passion: ${profile.hiddenPassion} (${MEANINGS[profile.hiddenPassion] || ""})
- Karmic Lessons: ${profile.karmicLessons.length > 0 ? profile.karmicLessons.join(", ") : "None (all numbers 1-9 present in name)"}
- Balance Number: ${profile.balance} (${MEANINGS[profile.balance] || ""})
- Subconscious Self: ${profile.subconscious}/9

KEY INTERACTIONS:
- Life Path + Expression = Maturity ${profile.maturity}: This reveals what emerges in the second half of life.
- ${profile.karmicLessons.length > 0 ? `Missing energies (${profile.karmicLessons.join(", ")}) represent growth areas this lifetime.` : "No karmic lessons means a well-rounded energetic signature."}
- Hidden Passion ${profile.hiddenPassion} shows the deepest driving force behind the scenes.`;
}
