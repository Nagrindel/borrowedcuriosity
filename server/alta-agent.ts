import { Express, Request, Response } from "express";
import Groq from "groq-sdk";
import { db } from "./db.js";
import { eq, desc, sql } from "drizzle-orm";
import {
  blogPosts, products, galleryItems, courses, lessons,
  threads, threadCards, orders, comments, subscribers,
} from "../shared/schema.js";
import { calculateServerProfile, profileToPromptContext } from "./numerology.js";

let groq: Groq | null = null;
function getGroq(): Groq | null {
  if (groq) return groq;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  groq = new Groq({ apiKey });
  return groq;
}

const AGENT_SYSTEM = `You are Alta Agent, the intelligent content manager for Borrowed Curiosity LLC.
You help the site administrator manage the website through natural conversation.

You can:
- Create, edit, and delete blog posts
- Create, edit, and delete products in the store
- Create, edit, and delete gallery items
- Create courses and add lessons
- Create threads with flip cards
- View and manage orders with full intelligence
- Generate numerology reports for service orders
- Sync pending orders with Stripe to recover missing payments
- View site statistics and revenue tracking
- List and search existing content

ORDER INTELLIGENCE:
- Orders flow through these statuses: pending -> paid -> processing -> shipped/completed -> delivered
- "pending" means checkout started but payment not confirmed. Use sync_orders to check Stripe.
- "paid" means money received. Service orders need reports generated. Physical orders need shipping.
- "completed" means service order fulfilled (report generated and ready). Physical orders move to "shipped" then "delivered".
- When asked about orders, always include status, type, total, and whether a report has been generated.
- If orders seem missing, suggest using sync_orders to recover from Stripe.
- When generating a report, it auto-sets the order status to "completed".

PERSONALITY:
- You are the same Alta personality: witty, warm, helpful, direct.
- When creating content, write high quality text worthy of the site's spiritual/numerology focus.
- When asked to create a blog post, generate real, substantial content (500+ words) unless told otherwise.
- When creating products, write compelling descriptions.
- Always confirm what you did after performing an action.
- If a request is ambiguous, ask for clarification before acting.
- When listing items, format them clearly.

SLUG GENERATION:
- When creating blog posts, generate a URL-friendly slug from the title (lowercase, hyphens, no special chars).

IMAGE GENERATION:
- When creating blog posts, products, or gallery items, ALWAYS provide a descriptive imagePrompt.
- Write the imagePrompt like a photographer or artist: describe the scene, lighting, mood, colors, and objects.
- Good imagePrompt examples:
  - "glowing amethyst crystal cluster on dark velvet with soft purple bokeh lights, mystical spiritual photography"
  - "handcrafted healing salve in amber glass jar surrounded by dried lavender and rose petals, warm natural lighting"
  - "sacred geometry mandala with golden ratio spirals, deep indigo background with starlight, ethereal digital art"
  - "open journal with numerology calculations next to crystals and candles, cozy spiritual workspace, warm tones"
- Avoid generic prompts. Be specific and visual. Match the mood and topic of the content.

RULES:
- Never use em dashes. Use commas, periods, or rewrite instead.
- No emojis in any content you create.
- No "AI-Powered" or similar AI references in created content.
- Be specific about what you changed when editing.
- For deletions, confirm the item name/title before deleting.`;

const TOOLS: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "create_blog_post",
      description: "Create a new blog post on the site. Write high-quality spiritual/numerology content. Always provide an imagePrompt to generate a beautiful cover image.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Blog post title" },
          slug: { type: "string", description: "URL-friendly slug (lowercase, hyphens)" },
          excerpt: { type: "string", description: "Short summary (1-2 sentences)" },
          content: { type: "string", description: "Full HTML blog post content. Write substantial, real content." },
          category: { type: "string", description: "Category: numerology, crystals, spirituality, wellness, or general" },
          readingTime: { type: "string", description: "Estimated reading time, e.g. '5 min read'" },
          imagePrompt: { type: "string", description: "A descriptive prompt for the AI-generated cover image. Be visual and specific, e.g. 'mystical amethyst crystals glowing with purple light on dark velvet, spiritual healing aesthetic'" },
        },
        required: ["title", "slug", "excerpt", "content", "category", "readingTime", "imagePrompt"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_blog_post",
      description: "Update an existing blog post by its ID. Only provide fields that need changing.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number", description: "Blog post ID" },
          title: { type: "string" },
          excerpt: { type: "string" },
          content: { type: "string" },
          category: { type: "string" },
          published: { type: "boolean" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_blog_post",
      description: "Delete a blog post by its ID.",
      parameters: {
        type: "object",
        properties: { id: { type: "number", description: "Blog post ID to delete" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_blog_posts",
      description: "List all blog posts with their IDs, titles, categories, and published status.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_product",
      description: "Create a new product in the store. Always provide an imagePrompt for the product image.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Product name" },
          description: { type: "string", description: "Product description" },
          price: { type: "number", description: "Price in dollars (e.g. 24.00)" },
          category: { type: "string", description: "Category: salve, jewelry, service, crystal, or other" },
          productType: { type: "string", description: "Type: physical or service", enum: ["physical", "service"] },
          imagePrompt: { type: "string", description: "Descriptive prompt for product image, e.g. 'handcrafted healing salve in amber glass jar with lavender and crystals, product photography'" },
        },
        required: ["name", "description", "price", "category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_product",
      description: "Update an existing product by its ID.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number", description: "Product ID" },
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          inStock: { type: "boolean" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_product",
      description: "Delete a product by its ID.",
      parameters: {
        type: "object",
        properties: { id: { type: "number", description: "Product ID to delete" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_products",
      description: "List all products with IDs, names, prices, categories, and stock status.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_gallery_item",
      description: "Create a new gallery item (photo, video, or downloadable content). Provide imagePrompt for photo items.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          type: { type: "string", enum: ["photo", "video", "download"] },
          mediaUrl: { type: "string", description: "URL to the media" },
          imagePrompt: { type: "string", description: "Descriptive prompt for the gallery image" },
        },
        required: ["title", "description", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_gallery_item",
      description: "Delete a gallery item by its ID.",
      parameters: {
        type: "object",
        properties: { id: { type: "number" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_gallery",
      description: "List all gallery items with IDs, titles, and types.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_course",
      description: "Create a new course.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_lesson",
      description: "Add a lesson to a course.",
      parameters: {
        type: "object",
        properties: {
          courseId: { type: "number" },
          orderIndex: { type: "number", description: "Lesson order (0-based)" },
          title: { type: "string" },
          description: { type: "string" },
          content: { type: "string", description: "Full lesson content in HTML" },
        },
        required: ["courseId", "orderIndex", "title", "description", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_courses",
      description: "List all courses with IDs, titles, and lesson counts.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_thread",
      description: "Create a new thread (flip-card story). Returns the thread ID for adding cards.",
      parameters: {
        type: "object",
        properties: { topic: { type: "string" } },
        required: ["topic"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_thread_card",
      description: "Add a flip card to a thread.",
      parameters: {
        type: "object",
        properties: {
          threadId: { type: "number" },
          orderIndex: { type: "number" },
          title: { type: "string" },
          content: { type: "string" },
        },
        required: ["threadId", "orderIndex", "title", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_orders",
      description: "List orders with full details: IDs, customer info, totals, statuses, order type, whether report was generated, and customer notes. Use filter to show specific order states.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Number of orders to return (default 20)" },
          filter: { type: "string", description: "Filter: 'all' (default), 'paid', 'pending', 'needs-report', 'to-ship', 'completed', 'cancelled'" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_order_status",
      description: "Update an order's status. Valid statuses: pending, paid, processing, shipped, delivered, completed, cancelled.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number" },
          status: { type: "string", description: "New status: pending, paid, processing, shipped, delivered, completed, cancelled" },
        },
        required: ["id", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_report",
      description: "Generate a numerology report for a service order using Alta. Requires the order to have customer details (name and birth date). Auto-sets order status to completed.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "number", description: "The order ID to generate a report for" },
        },
        required: ["orderId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "sync_orders",
      description: "Sync all pending orders with Stripe to recover payments that were completed but not captured by webhooks. Also cleans up abandoned checkouts older than 2 hours.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "import_stripe_orders",
      description: "Import ALL historical completed orders from Stripe into the database. Use this to recover orders after a database reset or to pull in all past Stripe payments. Skips orders already in the database.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_site_stats",
      description: "Get site-wide statistics: counts of posts, products, orders, subscribers, revenue, pending actions, reports to generate, orders to ship.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Tool Executors                                                     */
/* ------------------------------------------------------------------ */

type ToolResult = { success: boolean; data?: any; error?: string };

function generateImageUrl(prompt: string, width = 1200, height = 630): string {
  const cleaned = prompt
    .replace(/[^a-zA-Z0-9\s,.-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 200);
  return `https://placeholdr.dev/${width}x${height}/${encodeURIComponent(cleaned)}?style=photographic`;
}

async function executeTool(name: string, args: Record<string, any>): Promise<ToolResult> {
  try {
    switch (name) {
      case "create_blog_post": {
        const gradient = "from-violet-600 to-purple-700";
        const imageUrl = args.imagePrompt
          ? generateImageUrl(args.imagePrompt)
          : generateImageUrl(args.title + " " + (args.category || "spiritual"));
        db.insert(blogPosts).values({
          title: args.title,
          slug: args.slug,
          excerpt: args.excerpt,
          content: args.content,
          category: args.category || "general",
          readingTime: args.readingTime || "5 min read",
          gradient,
          imageUrl,
          published: true,
        }).run();
        const post = db.select().from(blogPosts).where(eq(blogPosts.slug, args.slug)).get();
        return { success: true, data: { id: post?.id, title: args.title, slug: args.slug, imageUrl, message: "Blog post created and published with generated cover image" } };
      }

      case "update_blog_post": {
        const { id, ...fields } = args;
        const existing = db.select().from(blogPosts).where(eq(blogPosts.id, id)).get();
        if (!existing) return { success: false, error: `Blog post #${id} not found` };
        db.update(blogPosts).set(fields).where(eq(blogPosts.id, id)).run();
        return { success: true, data: { id, updated: Object.keys(fields), message: `Updated blog post "${existing.title}"` } };
      }

      case "delete_blog_post": {
        const existing = db.select().from(blogPosts).where(eq(blogPosts.id, args.id)).get();
        if (!existing) return { success: false, error: `Blog post #${args.id} not found` };
        db.delete(comments).where(sql`target_type = 'blog' AND target_id = ${args.id}`).run();
        db.delete(blogPosts).where(eq(blogPosts.id, args.id)).run();
        return { success: true, data: { id: args.id, title: existing.title, message: `Deleted blog post "${existing.title}"` } };
      }

      case "list_blog_posts": {
        const rows = db.select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          category: blogPosts.category,
          published: blogPosts.published,
          createdAt: blogPosts.createdAt,
        }).from(blogPosts).orderBy(desc(blogPosts.createdAt)).all();
        return { success: true, data: { count: rows.length, posts: rows } };
      }

      case "create_product": {
        const gradient = "from-amber-600 to-orange-700";
        const imageUrl = args.imagePrompt
          ? generateImageUrl(args.imagePrompt, 800, 800)
          : generateImageUrl(args.name + " " + (args.category || "product"), 800, 800);
        db.insert(products).values({
          name: args.name,
          description: args.description,
          price: String(args.price),
          category: args.category || "other",
          productType: args.productType || "physical",
          gradient,
          imageUrl,
          inStock: true,
        }).run();
        const prod = db.select().from(products).where(eq(products.name, args.name)).get();
        return { success: true, data: { id: prod?.id, name: args.name, price: args.price, imageUrl, message: `Product "${args.name}" created at $${args.price} with generated image` } };
      }

      case "update_product": {
        const { id, ...fields } = args;
        if (fields.price !== undefined) fields.price = String(fields.price);
        const existing = db.select().from(products).where(eq(products.id, id)).get();
        if (!existing) return { success: false, error: `Product #${id} not found` };
        db.update(products).set(fields).where(eq(products.id, id)).run();
        return { success: true, data: { id, updated: Object.keys(fields), message: `Updated product "${existing.name}"` } };
      }

      case "delete_product": {
        const existing = db.select().from(products).where(eq(products.id, args.id)).get();
        if (!existing) return { success: false, error: `Product #${args.id} not found` };
        db.delete(products).where(eq(products.id, args.id)).run();
        return { success: true, data: { id: args.id, name: existing.name, message: `Deleted product "${existing.name}"` } };
      }

      case "list_products": {
        const rows = db.select({
          id: products.id,
          name: products.name,
          price: products.price,
          category: products.category,
          inStock: products.inStock,
          productType: products.productType,
        }).from(products).orderBy(desc(products.id)).all();
        return { success: true, data: { count: rows.length, products: rows } };
      }

      case "create_gallery_item": {
        const gradient = "from-cyan-600 to-blue-700";
        const mediaUrl = args.mediaUrl
          || (args.imagePrompt ? generateImageUrl(args.imagePrompt, 1200, 900) : null);
        db.insert(galleryItems).values({
          title: args.title,
          description: args.description,
          type: args.type,
          gradient,
          mediaUrl,
        }).run();
        return { success: true, data: { title: args.title, type: args.type, mediaUrl, message: `Gallery item "${args.title}" created${mediaUrl ? " with generated image" : ""}` } };
      }

      case "delete_gallery_item": {
        const existing = db.select().from(galleryItems).where(eq(galleryItems.id, args.id)).get();
        if (!existing) return { success: false, error: `Gallery item #${args.id} not found` };
        db.delete(comments).where(sql`target_type = 'gallery' AND target_id = ${args.id}`).run();
        db.delete(galleryItems).where(eq(galleryItems.id, args.id)).run();
        return { success: true, data: { id: args.id, title: existing.title, message: `Deleted gallery item "${existing.title}"` } };
      }

      case "list_gallery": {
        const rows = db.select({
          id: galleryItems.id,
          title: galleryItems.title,
          type: galleryItems.type,
        }).from(galleryItems).orderBy(desc(galleryItems.id)).all();
        return { success: true, data: { count: rows.length, items: rows } };
      }

      case "create_course": {
        db.insert(courses).values({
          title: args.title,
          description: args.description,
          gradient: "from-rose-600 to-pink-700",
        }).run();
        const course = db.select().from(courses).where(eq(courses.title, args.title)).get();
        return { success: true, data: { id: course?.id, title: args.title, message: `Course "${args.title}" created. Use add_lesson to add lessons.` } };
      }

      case "add_lesson": {
        db.insert(lessons).values({
          courseId: args.courseId,
          orderIndex: args.orderIndex,
          title: args.title,
          description: args.description,
          content: args.content,
        }).run();
        return { success: true, data: { courseId: args.courseId, title: args.title, message: `Lesson "${args.title}" added to course #${args.courseId}` } };
      }

      case "list_courses": {
        const rows = db.select({
          id: courses.id,
          title: courses.title,
        }).from(courses).all();
        const withCounts = rows.map((c) => {
          const lessonList = db.select({ id: lessons.id }).from(lessons).where(eq(lessons.courseId, c.id)).all();
          return { ...c, lessonCount: lessonList.length };
        });
        return { success: true, data: { count: withCounts.length, courses: withCounts } };
      }

      case "create_thread": {
        db.insert(threads).values({ topic: args.topic }).run();
        const thread = db.select().from(threads).where(eq(threads.topic, args.topic)).get();
        return { success: true, data: { id: thread?.id, topic: args.topic, message: `Thread "${args.topic}" created. Use add_thread_card to add cards.` } };
      }

      case "add_thread_card": {
        db.insert(threadCards).values({
          threadId: args.threadId,
          orderIndex: args.orderIndex,
          title: args.title,
          content: args.content,
        }).run();
        return { success: true, data: { threadId: args.threadId, title: args.title, message: `Card "${args.title}" added to thread #${args.threadId}` } };
      }

      case "list_orders": {
        const limit = args.limit || 20;
        const filter = args.filter || "all";
        let allRows = db.select().from(orders).orderBy(desc(orders.createdAt)).all();

        if (filter === "paid") allRows = allRows.filter(o => o.status === "paid");
        else if (filter === "pending") allRows = allRows.filter(o => o.status === "pending");
        else if (filter === "needs-report") allRows = allRows.filter(o => (o.orderType === "service" || o.orderType === "mixed") && !o.generatedReport && o.status !== "cancelled" && o.status !== "pending");
        else if (filter === "to-ship") allRows = allRows.filter(o => (o.orderType === "physical" || o.orderType === "mixed") && (o.status === "paid" || o.status === "processing"));
        else if (filter === "completed") allRows = allRows.filter(o => o.status === "completed" || o.status === "delivered");
        else if (filter === "cancelled") allRows = allRows.filter(o => o.status === "cancelled");

        const rows = allRows.slice(0, limit).map(o => {
          let customerDetails = null;
          try { customerDetails = o.customerNotes ? JSON.parse(o.customerNotes) : null; } catch {}
          return {
            id: o.id,
            customerEmail: o.customerEmail,
            customerName: o.customerName,
            total: o.total,
            status: o.status,
            orderType: o.orderType,
            hasReport: !!o.generatedReport,
            hasShipping: !!o.shippingAddress,
            customerDetails: customerDetails?.[0] || null,
            createdAt: o.createdAt,
          };
        });
        return { success: true, data: { count: rows.length, totalInDB: allRows.length, filter, orders: rows } };
      }

      case "update_order_status": {
        const existing = db.select().from(orders).where(eq(orders.id, args.id)).get();
        if (!existing) return { success: false, error: `Order #${args.id} not found` };
        db.update(orders).set({ status: args.status }).where(eq(orders.id, args.id)).run();
        return { success: true, data: { id: args.id, oldStatus: existing.status, newStatus: args.status, message: `Order #${args.id} status changed from "${existing.status}" to "${args.status}"` } };
      }

      case "generate_report": {
        const order = db.select().from(orders).where(eq(orders.id, args.orderId)).get();
        if (!order) return { success: false, error: `Order #${args.orderId} not found` };
        if (order.orderType !== "service" && order.orderType !== "mixed") return { success: false, error: `Order #${args.orderId} is not a service order` };

        let notes: any[] = [];
        try { notes = JSON.parse(order.customerNotes || "[]"); } catch {}
        if (!notes.length) return { success: false, error: `Order #${args.orderId} has no customer details` };

        const { fullName, birthDate, specialRequests } = notes[0];
        if (!fullName || !birthDate) return { success: false, error: "Customer name or birth date missing on this order" };

        const client = getGroq();
        if (!client) return { success: false, error: "Groq API not configured" };

        const profile = calculateServerProfile(fullName, birthDate);
        const profileContext = profileToPromptContext(profile, fullName, birthDate);

        const reportPrompt = `Generate a complete, professional numerology report for this client.\n\n${profileContext}\n\n${specialRequests ? `CLIENT'S SPECIAL REQUEST: "${specialRequests}"` : ""}\n\nWrite the full report now. Make it personal, insightful, and worth every penny.`;

        try {
          const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are Alta, an expert numerologist writing personalized reports. Use HTML formatting (h2 for sections, p for paragraphs). Be warm, insightful, and specific. No em dashes. No emojis." },
              { role: "user", content: reportPrompt },
            ],
            temperature: 0.85,
            max_tokens: 4096,
          });

          const reportContent = completion.choices[0]?.message?.content || "";
          if (!reportContent.trim()) return { success: false, error: "Generated empty report, try again" };

          const [yr, mo, dy] = birthDate.split("-").map(Number);
          const displayDate = new Date(yr, mo - 1, dy).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
          const fullReport = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Numerology Report - ${fullName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Georgia',serif;background:#fafafa;color:#1a1a1a;line-height:1.8;padding:40px 20px}.wrapper{max-width:720px;margin:0 auto}.header{text-align:center;padding:40px 0 32px;border-bottom:2px solid #6366f1}.header h1{font-size:2em;color:#6366f1}.header .subtitle{color:#666}.report h2{font-size:1.3em;color:#4f46e5;margin:32px 0 12px;border-bottom:1px solid #e5e7eb;padding-bottom:6px}.report p{margin-bottom:14px;color:#333}.footer{text-align:center;padding:40px 0 20px;border-top:2px solid #6366f1;margin-top:40px;color:#999;font-size:0.85em}</style></head><body><div class="wrapper"><div class="header"><h1>Numerology Report</h1><p class="subtitle">${fullName}</p><p style="color:#999;font-size:0.85em">Born ${displayDate} | Pythagorean System</p></div><div class="report">${reportContent}</div><div class="footer"><p>Prepared for ${fullName}</p><p>Borrowed Curiosity LLC</p></div></div></body></html>`;

          db.update(orders).set({ generatedReport: fullReport, status: "completed" }).where(eq(orders.id, args.orderId)).run();

          return { success: true, data: { orderId: args.orderId, clientName: fullName, lifePath: profile.lifePath, message: `Report generated for ${fullName} (Life Path ${profile.lifePath}). Order #${args.orderId} marked as completed. The report is now available in the Orders tab for preview, editing, and download.` } };
        } catch (err: any) {
          return { success: false, error: `Report generation failed: ${err.message}` };
        }
      }

      case "sync_orders": {
        try {
          const port = process.env.PORT || 5000;
          const res = await fetch(`http://localhost:${port}/api/admin/sync-orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const data = await res.json();
          return {
            success: true,
            data: {
              synced: data.synced || 0,
              cancelled: data.cancelled || 0,
              cleaned: data.cleaned || 0,
              message: `Stripe sync complete. ${data.synced || 0} orders recovered as paid, ${data.cancelled || 0} expired sessions cancelled, ${data.cleaned || 0} stale checkouts cleaned up.`,
            },
          };
        } catch (err: any) {
          return { success: false, error: `Sync failed: ${err.message}` };
        }
      }

      case "import_stripe_orders": {
        try {
          const port = process.env.PORT || 5000;
          const res = await fetch(`http://localhost:${port}/api/admin/import-stripe-orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const data = await res.json();
          return {
            success: true,
            data: {
              imported: data.imported || 0,
              skipped: data.skipped || 0,
              message: data.message || `Imported ${data.imported || 0} orders from Stripe.`,
            },
          };
        } catch (err: any) {
          return { success: false, error: `Import failed: ${err.message}` };
        }
      }

      case "get_site_stats": {
        const postCount = db.select({ c: sql<number>`count(*)` }).from(blogPosts).get()?.c ?? 0;
        const productCount = db.select({ c: sql<number>`count(*)` }).from(products).get()?.c ?? 0;
        const galleryCount = db.select({ c: sql<number>`count(*)` }).from(galleryItems).get()?.c ?? 0;
        const courseCount = db.select({ c: sql<number>`count(*)` }).from(courses).get()?.c ?? 0;
        const threadCount = db.select({ c: sql<number>`count(*)` }).from(threads).get()?.c ?? 0;
        const subCount = db.select({ c: sql<number>`count(*)` }).from(subscribers).get()?.c ?? 0;
        const allOrders = db.select().from(orders).all();
        const orderCount = allOrders.length;
        const paidStatuses = ["paid", "processing", "shipped", "delivered", "completed"];
        const totalRevenue = allOrders.filter(o => paidStatuses.includes(o.status)).reduce((s, o) => s + o.total, 0);
        const pendingOrders = allOrders.filter(o => o.status === "pending").length;
        const needsAction = allOrders.filter(o => o.status === "paid").length;
        const reportsToGenerate = allOrders.filter(o => (o.orderType === "service" || o.orderType === "mixed") && !o.generatedReport && o.status !== "cancelled" && o.status !== "pending").length;
        const toShip = allOrders.filter(o => (o.orderType === "physical" || o.orderType === "mixed") && (o.status === "paid" || o.status === "processing")).length;
        const completedOrders = allOrders.filter(o => o.status === "completed" || o.status === "delivered").length;
        return {
          success: true,
          data: {
            blogPosts: postCount, products: productCount, gallery: galleryCount, courses: courseCount,
            threads: threadCount, subscribers: subCount, orders: orderCount, totalRevenue: `$${totalRevenue.toFixed(2)}`,
            pendingCheckouts: pendingOrders, needsAction, reportsToGenerate, toShip, completedOrders,
          },
        };
      }

      default:
        return { success: false, error: `Unknown tool: ${name}` };
    }
  } catch (err: any) {
    console.error(`[alta-agent] Tool "${name}" error:`, err.message);
    return { success: false, error: err.message };
  }
}

/* ------------------------------------------------------------------ */
/*  Route Registration                                                 */
/* ------------------------------------------------------------------ */

export function registerAltaAgentRoutes(app: Express) {
  app.post("/api/admin/alta-agent/chat", async (req: Request, res: Response) => {
    const adminToken = req.headers["x-admin-token"];
    const expectedToken = process.env.ADMIN_PASSWORD || "borrowed2026";
    if (adminToken !== expectedToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const client = getGroq();
    if (!client) {
      return res.status(503).json({ error: "Alta Agent needs GROQ_API_KEY." });
    }

    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      const conversation: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: AGENT_SYSTEM },
        ...messages.map((m: any) => ({
          role: m.role === "user" ? "user" as const : "assistant" as const,
          content: String(m.content),
        })),
      ];

      const MAX_TOOL_ROUNDS = 8;

      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const response = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: conversation,
          tools: TOOLS,
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens: 4096,
        });

        const choice = response.choices[0];
        if (!choice) break;

        const msg = choice.message;

        if (msg.tool_calls && msg.tool_calls.length > 0) {
          conversation.push({
            role: "assistant",
            content: msg.content || null,
            tool_calls: msg.tool_calls,
          } as any);

          for (const toolCall of msg.tool_calls) {
            const fnName = toolCall.function.name;
            let fnArgs: Record<string, any> = {};
            try {
              fnArgs = JSON.parse(toolCall.function.arguments);
            } catch {
              fnArgs = {};
            }

            console.log(`[alta-agent] Tool call: ${fnName}(${JSON.stringify(fnArgs)})`);

            const result = await executeTool(fnName, fnArgs);

            res.write(`data: ${JSON.stringify({
              type: "action",
              tool: fnName,
              args: fnArgs,
              result,
            })}\n\n`);

            conversation.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            } as any);
          }
          continue;
        }

        if (msg.content) {
          const stream = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: conversation,
            stream: true,
            temperature: 0.7,
            max_tokens: 2048,
          });

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ type: "content", content })}\n\n`);
            }
          }
        }

        break;
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err: any) {
      console.error("[alta-agent] Error:", err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: "Alta Agent had a moment. Try again." });
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", error: err.message })}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    }
  });
}
