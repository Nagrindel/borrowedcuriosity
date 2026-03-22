import { Express, Request, Response } from "express";
import Groq from "groq-sdk";
import { db } from "./db.js";
import { eq, desc, sql } from "drizzle-orm";
import {
  blogPosts, products, galleryItems, courses, lessons,
  threads, threadCards, orders, comments,
} from "../shared/schema.js";

let groq: Groq | null = null;
function getGroq(): Groq | null {
  if (groq) return groq;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  groq = new Groq({ apiKey });
  return groq;
}

const AGENT_SYSTEM = `You are Alta Agent, the intelligent content manager for Borrowed Curiosity LLC.
You help the site administrator (Nicole) manage the website through natural conversation.

You can:
- Create, edit, and delete blog posts
- Create, edit, and delete products in the store
- Create, edit, and delete gallery items
- Create courses and add lessons
- Create threads with flip cards
- View orders and site statistics
- List and search existing content

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
      description: "Create a new blog post on the site. Write high-quality spiritual/numerology content.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Blog post title" },
          slug: { type: "string", description: "URL-friendly slug (lowercase, hyphens)" },
          excerpt: { type: "string", description: "Short summary (1-2 sentences)" },
          content: { type: "string", description: "Full HTML blog post content. Write substantial, real content." },
          category: { type: "string", description: "Category: numerology, crystals, spirituality, wellness, or general" },
          readingTime: { type: "string", description: "Estimated reading time, e.g. '5 min read'" },
        },
        required: ["title", "slug", "excerpt", "content", "category", "readingTime"],
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
      description: "Create a new product in the store.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Product name" },
          description: { type: "string", description: "Product description" },
          price: { type: "number", description: "Price in dollars (e.g. 24.00)" },
          category: { type: "string", description: "Category: salve, jewelry, service, crystal, or other" },
          productType: { type: "string", description: "Type: physical or service", enum: ["physical", "service"] },
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
      description: "Create a new gallery item (photo, video, or downloadable content).",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          type: { type: "string", enum: ["photo", "video", "download"] },
          mediaUrl: { type: "string", description: "URL to the media" },
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
      description: "List recent orders with IDs, customer info, totals, and statuses.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Number of orders to return (default 20)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_order_status",
      description: "Update an order's status (e.g. paid, processing, shipped, completed).",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number" },
          status: { type: "string", description: "New status: paid, processing, shipped, completed, cancelled" },
        },
        required: ["id", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_site_stats",
      description: "Get site-wide statistics: counts of posts, products, orders, subscribers, etc.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Tool Executors                                                     */
/* ------------------------------------------------------------------ */

type ToolResult = { success: boolean; data?: any; error?: string };

function executeTool(name: string, args: Record<string, any>): ToolResult {
  try {
    switch (name) {
      case "create_blog_post": {
        const gradient = "from-violet-600 to-purple-700";
        db.insert(blogPosts).values({
          title: args.title,
          slug: args.slug,
          excerpt: args.excerpt,
          content: args.content,
          category: args.category || "general",
          readingTime: args.readingTime || "5 min read",
          gradient,
          published: true,
        }).run();
        const post = db.select().from(blogPosts).where(eq(blogPosts.slug, args.slug)).get();
        return { success: true, data: { id: post?.id, title: args.title, slug: args.slug, message: "Blog post created and published" } };
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
        db.insert(products).values({
          name: args.name,
          description: args.description,
          price: String(args.price),
          category: args.category || "other",
          productType: args.productType || "physical",
          gradient,
          inStock: true,
        }).run();
        const prod = db.select().from(products).where(eq(products.name, args.name)).get();
        return { success: true, data: { id: prod?.id, name: args.name, price: args.price, message: `Product "${args.name}" created at $${args.price}` } };
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
        db.insert(galleryItems).values({
          title: args.title,
          description: args.description,
          type: args.type,
          gradient,
          mediaUrl: args.mediaUrl || null,
        }).run();
        return { success: true, data: { title: args.title, type: args.type, message: `Gallery item "${args.title}" created` } };
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
        const rows = db.select({
          id: orders.id,
          customerEmail: orders.customerEmail,
          customerName: orders.customerName,
          total: orders.total,
          status: orders.status,
          orderType: orders.orderType,
          createdAt: orders.createdAt,
        }).from(orders).orderBy(desc(orders.createdAt)).limit(limit).all();
        return { success: true, data: { count: rows.length, orders: rows } };
      }

      case "update_order_status": {
        const existing = db.select().from(orders).where(eq(orders.id, args.id)).get();
        if (!existing) return { success: false, error: `Order #${args.id} not found` };
        db.update(orders).set({ status: args.status }).where(eq(orders.id, args.id)).run();
        return { success: true, data: { id: args.id, oldStatus: existing.status, newStatus: args.status, message: `Order #${args.id} updated to "${args.status}"` } };
      }

      case "get_site_stats": {
        const postCount = db.select({ c: sql<number>`count(*)` }).from(blogPosts).get()?.c ?? 0;
        const productCount = db.select({ c: sql<number>`count(*)` }).from(products).get()?.c ?? 0;
        const orderCount = db.select({ c: sql<number>`count(*)` }).from(orders).get()?.c ?? 0;
        const galleryCount = db.select({ c: sql<number>`count(*)` }).from(galleryItems).get()?.c ?? 0;
        const courseCount = db.select({ c: sql<number>`count(*)` }).from(courses).get()?.c ?? 0;
        const threadCount = db.select({ c: sql<number>`count(*)` }).from(threads).get()?.c ?? 0;
        return {
          success: true,
          data: { blogPosts: postCount, products: productCount, orders: orderCount, gallery: galleryCount, courses: courseCount, threads: threadCount },
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

            const result = executeTool(fnName, fnArgs);

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
