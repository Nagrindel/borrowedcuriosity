import { Express, Request, Response } from "express";
import Groq from "groq-sdk";
import { db } from "./db.js";
import { orders } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { calculateServerProfile, profileToPromptContext } from "./numerology.js";

let groq: Groq | null = null;

function getGroq(): Groq | null {
  if (groq) return groq;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  groq = new Groq({ apiKey });
  return groq;
}

const REPORT_SYSTEM_PROMPT = `You are Alta, an expert numerologist writing a personalized, multi-page numerology report for a paying client of Borrowed Curiosity LLC. Nicole (the owner) uses you to generate professional reports that she can review and send to customers.

WRITING STYLE:
- Write as a knowledgeable, warm human numerologist. This should read like a personal letter, not a textbook.
- Be specific and insightful. Connect the numbers to real personality traits, challenges, and strengths.
- Use a conversational but professional tone. Smart, occasionally witty, never cheesy.
- NEVER use em dashes. Use commas, periods, or rewrite instead.
- NEVER use emojis.
- Each section should be 2-4 paragraphs with genuine depth and personal insight.
- Connect numbers to each other. Show how Life Path interacts with Expression, how Soul Urge reveals hidden motivations behind the Personality mask.
- Include practical guidance: what to lean into, what to watch out for, how to grow.
- End with a personalized summary that ties everything together.

REPORT STRUCTURE (follow this exactly):
1. OPENING - A warm, personalized greeting addressing the client by first name. Set the tone.
2. LIFE PATH NUMBER - The most important number. Detailed analysis of their core life purpose and journey.
3. EXPRESSION NUMBER - Their natural talents and abilities. How the world sees their potential.
4. SOUL URGE NUMBER - Their deepest desires and inner motivations. What truly drives them.
5. PERSONALITY NUMBER - The mask they wear. How others perceive them on first impression.
6. BIRTHDAY NUMBER - A special talent or gift they carry. The flavor of their Life Path.
7. MATURITY NUMBER - What emerges in the second half of life. Where they're heading.
8. HIDDEN PASSION - The driving force behind the scenes. What they're naturally drawn to.
9. KARMIC LESSONS - Missing energies they're here to develop. Growth areas for this lifetime.
10. BALANCE & SUBCONSCIOUS SELF - How they handle crisis and what inner resources they have.
11. NUMBER INTERACTIONS - How their numbers work together. Harmonies and tensions in their chart.
12. RESEARCH INTERESTS - Based on their profile, suggest 4-5 topics/subjects they would naturally be drawn to study or explore. Frame these as "fuel for your curiosity" not career advice.
13. CLOSING - A meaningful summary that ties their numbers into a cohesive story. Encouraging but honest.

FORMAT:
- Use HTML formatting for the report.
- Wrap the entire report in a <div class="report"> tag.
- Use <h2> for section titles, <p> for paragraphs.
- Keep section titles simple and clear (e.g., "Life Path 7: The Seeker").
- Do NOT include any CSS or styling. Just clean semantic HTML.`;

export function registerAdminAltaRoutes(app: Express) {
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || "borrowed2026";

  function adminAuth(req: any, res: any, next: any) {
    const token = req.headers["x-admin-token"];
    if (token !== ADMIN_PASS) return res.status(401).json({ error: "Unauthorized" });
    next();
  }

  app.post("/api/admin/generate-report", adminAuth, async (req: Request, res: Response) => {
    const client = getGroq();
    if (!client) {
      return res.status(503).json({ error: "Groq API key not configured. Set GROQ_API_KEY." });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const order = db.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.orderType !== "service" && order.orderType !== "mixed") {
      return res.status(400).json({ error: "This order doesn't include a report service" });
    }

    let notes: any[] = [];
    try { notes = JSON.parse(order.customerNotes || "[]"); } catch {}
    if (!notes.length) {
      return res.status(400).json({ error: "No customer details found on this order" });
    }

    const detail = notes[0];
    const { fullName, birthDate, specialRequests } = detail;

    if (!fullName || !birthDate) {
      return res.status(400).json({ error: "Customer name or birth date missing" });
    }

    try {
      const profile = calculateServerProfile(fullName, birthDate);
      const profileContext = profileToPromptContext(profile, fullName, birthDate);

      const userPrompt = `Generate a complete, professional numerology report for this client.

${profileContext}

${specialRequests ? `CLIENT'S SPECIAL REQUEST: "${specialRequests}"\nPlease weave this focus throughout the report where relevant.` : ""}

Write the full report now. Make it personal, insightful, and worth every penny of the $55 they paid. This should feel like a gift, not a printout.`;

      console.log(`[admin-alta] Generating report for ${fullName} (Order #${orderId})`);

      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: REPORT_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.85,
        max_tokens: 4096,
      });

      const reportContent = completion.choices[0]?.message?.content || "";

      if (!reportContent.trim()) {
        return res.status(500).json({ error: "Alta generated an empty report. Try again." });
      }

      const [yr, mo, dy] = birthDate.split("-").map(Number);
      const displayDate = new Date(yr, mo - 1, dy).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

      const fullReport = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Numerology Report - ${fullName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Georgia','Times New Roman',serif;background:#fafafa;color:#1a1a1a;line-height:1.8;padding:40px 20px}
.wrapper{max-width:720px;margin:0 auto}
.header{text-align:center;padding:40px 0 32px;border-bottom:2px solid #6366f1}
.header h1{font-size:2em;color:#6366f1;margin-bottom:8px;letter-spacing:1px}
.header .subtitle{font-size:1em;color:#666}
.header .meta{font-size:0.85em;color:#999;margin-top:8px}
.report h2{font-size:1.3em;color:#4f46e5;margin:32px 0 12px;padding-bottom:6px;border-bottom:1px solid #e5e7eb}
.report p{margin-bottom:14px;font-size:1em;color:#333}
.numbers-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin:20px 0}
.number-card{background:#f0f0ff;border-radius:12px;padding:16px;text-align:center}
.number-card .num{font-size:2em;font-weight:bold;color:#6366f1}
.number-card .label{font-size:0.8em;color:#666;margin-top:4px}
.footer{text-align:center;padding:40px 0 20px;border-top:2px solid #6366f1;margin-top:40px;color:#999;font-size:0.85em}
@media print{body{padding:20px}@page{margin:1in}}
</style>
</head>
<body>
<div class="wrapper">
<div class="header">
<h1>Numerology Report</h1>
<p class="subtitle">${fullName}</p>
<p class="meta">Born ${displayDate} | Pythagorean System</p>
</div>

<div class="numbers-grid">
<div class="number-card"><div class="num">${profile.lifePath}</div><div class="label">Life Path</div></div>
<div class="number-card"><div class="num">${profile.expression}</div><div class="label">Expression</div></div>
<div class="number-card"><div class="num">${profile.soulUrge}</div><div class="label">Soul Urge</div></div>
<div class="number-card"><div class="num">${profile.personality}</div><div class="label">Personality</div></div>
<div class="number-card"><div class="num">${profile.birthDay}</div><div class="label">Birthday</div></div>
<div class="number-card"><div class="num">${profile.maturity}</div><div class="label">Maturity</div></div>
<div class="number-card"><div class="num">${profile.hiddenPassion}</div><div class="label">Hidden Passion</div></div>
<div class="number-card"><div class="num">${profile.subconscious}/9</div><div class="label">Subconscious</div></div>
</div>

<div class="report">
${reportContent}
</div>

<div class="footer">
<p>Prepared exclusively for ${fullName}</p>
<p>Borrowed Curiosity LLC &copy; ${new Date().getFullYear()}</p>
<p style="margin-top:4px">Borrow the curiosity. Keep the wisdom.</p>
</div>
</div>
</body>
</html>`;

      db.update(orders)
        .set({ generatedReport: fullReport, status: order.status === "paid" ? "processing" : order.status })
        .where(eq(orders.id, orderId))
        .run();

      console.log(`[admin-alta] Report generated for ${fullName} (Order #${orderId}) - ${reportContent.length} chars`);

      res.json({
        success: true,
        report: fullReport,
        profile: {
          lifePath: profile.lifePath,
          expression: profile.expression,
          soulUrge: profile.soulUrge,
          personality: profile.personality,
          birthDay: profile.birthDay,
          maturity: profile.maturity,
          hiddenPassion: profile.hiddenPassion,
          karmicLessons: profile.karmicLessons,
          balance: profile.balance,
          subconscious: profile.subconscious,
        },
      });
    } catch (err: any) {
      console.error("[admin-alta] Report generation error:", err.message);
      res.status(500).json({ error: "Report generation failed. Try again." });
    }
  });

  app.put("/api/admin/orders/:id/report", adminAuth, (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { generatedReport } = req.body;
    if (!generatedReport) return res.status(400).json({ error: "Report content required" });
    db.update(orders).set({ generatedReport }).where(eq(orders.id, id)).run();
    res.json({ success: true });
  });

  app.get("/api/admin/orders/:id/report", adminAuth, (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const order = db.select().from(orders).where(eq(orders.id, id)).get();
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ report: order.generatedReport || null });
  });

  app.post("/api/admin/test-order", adminAuth, (_req: Request, res: Response) => {
    const testNotes = JSON.stringify([{
      productName: "Hand-Written Numerology Report",
      fullName: "Nicole Grindel",
      birthDate: "1990-07-15",
      email: "nicole@borrowedcuriosity.com",
      specialRequests: "I would love insights into my creative potential and what areas of study might spark my curiosity."
    }]);

    db.insert(orders).values({
      customerName: "Nicole Grindel",
      customerEmail: "nicole@borrowedcuriosity.com",
      items: JSON.stringify([{ name: "Hand-Written Numerology Report", price: 55, quantity: 1 }]),
      total: 55,
      status: "paid",
      orderType: "service",
      customerNotes: testNotes,
      paymentMethod: "test",
    }).run();

    res.json({ success: true, message: "Test service order created" });
  });
}
