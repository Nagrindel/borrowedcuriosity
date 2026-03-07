export const PYTHAGOREAN_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

export const CHALDEAN_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2,
  S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7,
};

export type System = "pythagorean" | "chaldean";

export function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = String(num).split("").reduce((s, d) => s + parseInt(d), 0);
  }
  return num;
}

function letterValues(text: string, system: System) {
  const vals = system === "chaldean" ? CHALDEAN_VALUES : PYTHAGOREAN_VALUES;
  return text.toUpperCase().split("").filter(c => /[A-Z]/.test(c)).map(c => ({ char: c, value: vals[c] || 0 }));
}

function sumLetters(text: string, system: System): number {
  return letterValues(text, system).reduce((s, v) => s + v.value, 0);
}

export function calculateLifePath(birthDate: string): number {
  const [yearStr, monthStr, dayStr] = birthDate.split("-");
  const month = parseInt(monthStr, 10);
  const dayNum = parseInt(dayStr, 10);
  const yearDigitSum = yearStr.split("").reduce((s, c) => s + parseInt(c, 10), 0);
  const m = reduceToSingleDigit(month);
  const d = reduceToSingleDigit(dayNum);
  const y = reduceToSingleDigit(yearDigitSum);
  return reduceToSingleDigit(m + d + y);
}

export function calculateExpression(name: string, system: System): number {
  return reduceToSingleDigit(sumLetters(name.replace(/[^a-zA-Z]/g, ""), system));
}

export function calculateSoulUrge(name: string, system: System): number {
  return reduceToSingleDigit(sumLetters(name.replace(/[^aeiouAEIOU]/g, ""), system));
}

export function calculatePersonality(name: string, system: System): number {
  return reduceToSingleDigit(sumLetters(name.replace(/[aeiouAEIOU\s]/g, ""), system));
}

export interface NumerologyProfile {
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

export function calculateProfile(name: string, birthDate: string, system: System): NumerologyProfile {
  const lifePath = calculateLifePath(birthDate);
  const expression = calculateExpression(name, system);
  const soulUrge = calculateSoulUrge(name, system);
  const personality = calculatePersonality(name, system);
  const birthDay = reduceToSingleDigit(parseInt(birthDate.split("-")[2], 10));
  const maturity = reduceToSingleDigit(lifePath + expression);

  const counts: Record<number, number> = {};
  letterValues(name.replace(/[^a-zA-Z]/g, ""), system).forEach(l => {
    counts[l.value] = (counts[l.value] || 0) + 1;
  });
  const hiddenPassion = parseInt(Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || "1");

  const present = new Set(letterValues(name.replace(/[^a-zA-Z]/g, ""), system).map(l => l.value));
  const karmicLessons: number[] = [];
  for (let i = 1; i <= 9; i++) if (!present.has(i)) karmicLessons.push(i);

  const balance = reduceToSingleDigit(lifePath + personality);
  const subconscious = 9 - karmicLessons.length;

  return { lifePath, expression, soulUrge, personality, birthDay, maturity, hiddenPassion, karmicLessons, balance, subconscious };
}

export function getMeaning(n: number): string {
  const m: Record<number, string> = {
    1: "Leadership, independence, pioneering spirit. You're wired to blaze trails and start things.",
    2: "Cooperation, harmony, sensitivity, partnership. You're the glue that holds everything together.",
    3: "Creativity, self-expression, communication, joy. Your inner artist has been rattling the cage.",
    4: "Stability, hard work, practicality, foundation. You are the blueprint and the builder.",
    5: "Freedom, adventure, versatility, change. You're a five-star explorer in a world of routine.",
    6: "Nurturing, responsibility, healing, love. You make everyone around you feel like they belong.",
    7: "Spirituality, introspection, analysis, wisdom. You're the philosopher nobody invited but everyone's glad showed up.",
    8: "Material success, authority, achievement, power. You've got CEO energy whether you run a company or a household.",
    9: "Universal love, humanitarian, completion, service. You've leveled up in the game of life.",
    11: "Master Number: Intuition, inspiration, enlightenment. You feel things before they happen.",
    22: "Master Number: Practical idealism, large endeavors. You turn visions into skyscrapers.",
    33: "Master Number: Compassionate service, healing. You teach by existing.",
  };
  return m[n] || "A unique vibration that defies easy categorization.";
}

export function getDetailedLifePath(n: number): string {
  const d: Record<number, string> = {
    1: "You're the initiator. While everyone's waiting for permission, you've already started. Your life theme is independence, learning to lead without steamrolling.",
    2: "You're the diplomat. You feel the room before you enter it. Your life theme is balance and partnership, learning that strength lives in softness.",
    3: "You're the communicator. Words, art, and laughter are your currencies. Your life theme is creative self-expression. The world literally needs your voice.",
    4: "You're the architect. While others dream, you draw up blueprints. Your life theme is building something that outlasts you.",
    5: "You're the adventurer. Routine is your kryptonite. Your life theme is freedom through experience. You learn by living, not by reading the manual.",
    6: "You're the healer. People feel safe around you and they can't always explain why. Your life theme is nurturing, home, family, and making things beautiful.",
    7: "You're the seeker. You ask the questions nobody else thinks to ask. Your life theme is inner wisdom. The answers are inside, but you'll check everywhere else first.",
    8: "You're the powerhouse. Abundance follows you when you align with your purpose. Your life theme is mastering the material world without letting it master you.",
    9: "You're the old soul. You've been here before (metaphorically, at least). Your life theme is compassion and completion, letting go so new things can arrive.",
    11: "Master Number 11: You're the intuitive channel. You feel what others can't see. Your life theme is spiritual illumination, bridging the seen and unseen worlds.",
    22: "Master Number 22: You're the master builder. You don't just dream, you manifest on a scale that intimidates normal numbers. Your life theme is turning vision into reality.",
    33: "Master Number 33: You're the master teacher. You heal through presence alone. Your life theme is selfless service, the highest vibration in numerology.",
  };
  return d[n] || getMeaning(n);
}

export function getDetailedExpression(n: number): string {
  const d: Record<number, string> = {
    1: "Your talent is originality. You create from nothing and make it look easy.",
    2: "Your talent is mediation. You find the middle ground in places nobody knew had one.",
    3: "Your talent is inspiration. You light up rooms and sentences with equal charm.",
    4: "Your talent is organization. Chaos becomes structure wherever you walk.",
    5: "Your talent is adaptability. You thrive in change that would break most people.",
    6: "Your talent is caretaking. You improve every space and person you touch.",
    7: "Your talent is analysis. You see the pattern behind the pattern.",
    8: "Your talent is execution. You make things happen that others just talk about.",
    9: "Your talent is empathy. You understand people at a frequency most can't tune into.",
    11: "Your talent is vision. You see what's coming before it arrives.",
    22: "Your talent is manifestation at scale. What you build, the world uses.",
    33: "Your talent is unconditional love expressed through creative mastery.",
  };
  return d[n] || getMeaning(n);
}

export function generateReportHTML(profile: NumerologyProfile, name: string, birthDate: string, system: string): string {
  const sections = [
    { label: "Life Path", value: profile.lifePath, detail: getDetailedLifePath(profile.lifePath) },
    { label: "Expression", value: profile.expression, detail: getDetailedExpression(profile.expression) },
    { label: "Soul Urge", value: profile.soulUrge, detail: getMeaning(profile.soulUrge) },
    { label: "Personality", value: profile.personality, detail: getMeaning(profile.personality) },
    { label: "Birth Day", value: profile.birthDay, detail: getMeaning(profile.birthDay) },
    { label: "Maturity", value: profile.maturity, detail: getMeaning(profile.maturity) },
    { label: "Hidden Passion", value: profile.hiddenPassion, detail: getMeaning(profile.hiddenPassion) },
    { label: "Balance", value: profile.balance, detail: getMeaning(profile.balance) },
  ];
  const colors = ["#6366f1","#8b5cf6","#a855f7","#22c55e","#ec4899","#f59e0b","#ef4444","#06b6d4"];
  const karmicHTML = profile.karmicLessons.length > 0
    ? profile.karmicLessons.map(k => `<div style="display:inline-block;background:#f97316;color:white;border-radius:50%;width:36px;height:36px;line-height:36px;text-align:center;font-weight:bold;margin:0 6px;">${k}</div>`).join("") +
      `<p style="margin-top:12px;color:#555;">These numbers are missing from your name. Energies you're here to develop.</p>`
    : `<p style="color:#555;">No karmic lessons. Your name contains all numbers 1 through 9. That's rare.</p>`;

  const [yr, mo, dy] = birthDate.split("-").map(Number);
  const displayDate = new Date(yr, mo - 1, dy).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Numerology Report - ${name}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#6366f1,#8b5cf6);min-height:100vh;padding:40px 20px}.c{max-width:800px;margin:0 auto}.h{text-align:center;color:white;margin-bottom:32px}.h h1{font-size:2.2em;margin-bottom:8px}.h p{opacity:.85}.card{background:white;border-radius:16px;padding:28px;margin-bottom:20px;box-shadow:0 8px 30px rgba(0,0,0,.12)}.card h2{font-size:1.2em;margin-bottom:16px;color:#4f46e5;border-bottom:2px solid #e5e7eb;padding-bottom:8px}.nr{display:flex;align-items:center;margin-bottom:18px}.ci{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:1.1em;flex-shrink:0;margin-right:16px}.nr h3{font-size:.95em;color:#111;margin-bottom:2px}.nr p{font-size:.85em;color:#555;line-height:1.5}.f{text-align:center;color:white;margin-top:32px;opacity:.8;font-size:.85em}@media print{body{background:white;padding:20px}.h{color:#4f46e5}.f{color:#888}}</style></head><body><div class="c"><div class="h"><h1>Numerology Report</h1><p>${name} &bull; Born ${displayDate} &bull; ${system.charAt(0).toUpperCase()+system.slice(1)}</p></div><div class="card"><h2>Core Numbers</h2>${sections.map((s,i)=>`<div class="nr"><div class="ci" style="background:${colors[i%colors.length]}">${s.value}</div><div><h3>${s.label}</h3><p>${s.detail}</p></div></div>`).join("")}</div><div class="card"><h2>Karmic Lessons</h2>${karmicHTML}</div><div class="card"><h2>Subconscious Self: ${profile.subconscious}/9</h2><p style="color:#555">${profile.subconscious>=7?"You handle crises with confidence. When pressure hits, you've got most tools in your belt.":profile.subconscious>=5?"Solid foundation for handling challenges, with growth edges that keep things interesting.":"You may feel uncertain under sudden pressure. This is where your karmic lessons ask you to grow."}</p></div><div class="f"><p>Borrowed Curiosity LLC &copy; ${new Date().getFullYear()}</p><p style="margin-top:4px">Borrow the curiosity. Keep the wisdom.</p></div></div></body></html>`;
}
