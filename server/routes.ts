import { Express } from "express";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "./db.js";
import { eq, desc, and } from "drizzle-orm";
import {
  subscribers, blogPosts, comments, products, orders, galleryItems, courses, lessons,
  threads, threadCards,
  insertSubscriberSchema, insertCommentSchema, insertOrderSchema,
  insertBlogPostSchema, insertProductSchema, insertGalleryItemSchema,
  insertCourseSchema, insertLessonSchema, insertThreadSchema, insertThreadCardSchema,
} from "../shared/schema.js";

const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

export function registerRoutes(app: Express) {
  app.use("/uploads", express.static(uploadsDir));

  // ─── Health ───
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", name: "Borrowed Curiosity" });
  });

  // ─── File Upload ───
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  // ─── Subscribers ───
  app.post("/api/subscribers", (req, res) => {
    const parsed = insertSubscriberSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Valid email required" });
    try {
      db.insert(subscribers).values(parsed.data).run();
      res.status(201).json({ message: "Subscribed!" });
    } catch (e: any) {
      if (e.message?.includes("UNIQUE")) return res.status(409).json({ error: "Already subscribed" });
      res.status(500).json({ error: "Server error" });
    }
  });

  // ─── Blog Posts ───
  app.get("/api/blog", (_req, res) => {
    const posts = db.select().from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.createdAt)).all();
    res.json(posts);
  });

  app.get("/api/blog/:slug", (req, res) => {
    const post = db.select().from(blogPosts).where(eq(blogPosts.slug, req.params.slug)).get();
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  });

  // ─── Comments ───
  app.get("/api/comments/:type/:id", (req, res) => {
    const { type, id } = req.params;
    const result = db.select().from(comments)
      .where(and(eq(comments.targetType, type), eq(comments.targetId, parseInt(id))))
      .orderBy(desc(comments.createdAt)).all();
    res.json(result);
  });

  app.post("/api/comments", (req, res) => {
    const parsed = insertCommentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid comment data" });
    db.insert(comments).values(parsed.data).run();
    const latest = db.select().from(comments).orderBy(desc(comments.id)).limit(1).get();
    res.status(201).json(latest);
  });

  // ─── Products ───
  app.get("/api/products", (_req, res) => {
    const result = db.select().from(products).where(eq(products.inStock, true)).all();
    res.json(result);
  });

  app.get("/api/products/:id", (req, res) => {
    const product = db.select().from(products).where(eq(products.id, parseInt(req.params.id))).get();
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  });

  // ─── Orders ───
  app.post("/api/orders", (req, res) => {
    const parsed = insertOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid order data" });
    db.insert(orders).values({ ...parsed.data, items: JSON.stringify(parsed.data.items) }).run();
    const latest = db.select().from(orders).orderBy(desc(orders.id)).limit(1).get();
    res.status(201).json(latest);
  });

  // ─── Gallery ───
  app.get("/api/gallery", (_req, res) => {
    const result = db.select().from(galleryItems).orderBy(desc(galleryItems.createdAt)).all();
    res.json(result);
  });

  // ─── Courses & Lessons ───
  app.get("/api/courses", (_req, res) => {
    const allCourses = db.select().from(courses).all();
    const allLessons = db.select().from(lessons).all();
    const result = allCourses.map(c => ({
      ...c,
      lessons: allLessons.filter(l => l.courseId === c.id).sort((a, b) => a.orderIndex - b.orderIndex),
      lessonCount: allLessons.filter(l => l.courseId === c.id).length,
    }));
    res.json(result);
  });

  // ─── Threads ───
  app.get("/api/threads", (_req, res) => {
    const allThreads = db.select().from(threads).all();
    const allCards = db.select().from(threadCards).all();
    const result = allThreads.map(t => ({
      ...t,
      cards: allCards.filter(c => c.threadId === t.id).sort((a, b) => a.orderIndex - b.orderIndex),
    }));
    res.json(result);
  });

  // ═══════════════════════════════════════════
  // ADMIN ROUTES (password-protected)
  // ═══════════════════════════════════════════

  const ADMIN_PASS = process.env.ADMIN_PASSWORD || "borrowed2026";

  function adminAuth(req: any, res: any, next: any) {
    const token = req.headers["x-admin-token"];
    if (token !== ADMIN_PASS) return res.status(401).json({ error: "Unauthorized" });
    next();
  }

  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASS) return res.json({ token: ADMIN_PASS });
    res.status(401).json({ error: "Wrong password" });
  });

  // ─── Admin Stats ───
  app.get("/api/admin/stats", adminAuth, (_req, res) => {
    const postCount = db.select().from(blogPosts).all().length;
    const productCount = db.select().from(products).all().length;
    const galleryCount = db.select().from(galleryItems).all().length;
    const courseCount = db.select().from(courses).all().length;
    const threadCount = db.select().from(threads).all().length;
    const subCount = db.select().from(subscribers).all().length;
    const commentCount = db.select().from(comments).all().length;

    const allOrders = db.select().from(orders).all();
    const orderCount = allOrders.length;
    const paidStatuses = ["paid", "processing", "shipped", "delivered", "completed"];
    const paidOrders = allOrders.filter(o => paidStatuses.includes(o.status));
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = allOrders.filter(o => o.status === "pending").length;
    const needsAction = allOrders.filter(o => o.status === "paid").length;
    const reportsToGenerate = allOrders.filter(o =>
      (o.orderType === "service" || o.orderType === "mixed") &&
      (o.status === "paid" || o.status === "processing") &&
      !o.generatedReport
    ).length;
    const toShip = allOrders.filter(o =>
      (o.orderType === "physical" || o.orderType === "mixed") &&
      (o.status === "paid" || o.status === "processing")
    ).length;
    const completedOrders = allOrders.filter(o => o.status === "completed" || o.status === "delivered").length;
    const recentOrders = allOrders
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)
      .map(o => ({
        id: o.id,
        customerName: o.customerName,
        total: o.total,
        status: o.status,
        orderType: o.orderType,
        createdAt: o.createdAt,
        hasReport: !!o.generatedReport,
      }));

    res.json({
      postCount, productCount, galleryCount, courseCount, threadCount, subCount, orderCount, commentCount,
      totalRevenue, pendingOrders, needsAction, reportsToGenerate, toShip, completedOrders, recentOrders,
    });
  });

  // ─── Admin Blog CRUD ───
  app.get("/api/admin/blog", adminAuth, (_req, res) => {
    res.json(db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)).all());
  });
  app.post("/api/admin/blog", adminAuth, (req, res) => {
    const parsed = insertBlogPostSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error.flatten() });
    db.insert(blogPosts).values(parsed.data).run();
    res.status(201).json({ message: "Post created" });
  });
  app.put("/api/admin/blog/:id", adminAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.body;
    db.update(blogPosts).set(data).where(eq(blogPosts.id, id)).run();
    res.json({ message: "Post updated" });
  });
  app.delete("/api/admin/blog/:id", adminAuth, (req, res) => {
    db.delete(blogPosts).where(eq(blogPosts.id, parseInt(req.params.id))).run();
    db.delete(comments).where(and(eq(comments.targetType, "blog"), eq(comments.targetId, parseInt(req.params.id)))).run();
    res.json({ message: "Post deleted" });
  });

  // ─── Admin Products CRUD ───
  app.get("/api/admin/products", adminAuth, (_req, res) => {
    res.json(db.select().from(products).orderBy(desc(products.createdAt)).all());
  });
  app.post("/api/admin/products", adminAuth, (req, res) => {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error.flatten() });
    db.insert(products).values(parsed.data).run();
    res.status(201).json({ message: "Product created" });
  });
  app.put("/api/admin/products/:id", adminAuth, (req, res) => {
    db.update(products).set(req.body).where(eq(products.id, parseInt(req.params.id))).run();
    res.json({ message: "Product updated" });
  });
  app.delete("/api/admin/products/:id", adminAuth, (req, res) => {
    db.delete(products).where(eq(products.id, parseInt(req.params.id))).run();
    res.json({ message: "Product deleted" });
  });

  // ─── Admin Gallery CRUD ───
  app.get("/api/admin/gallery", adminAuth, (_req, res) => {
    res.json(db.select().from(galleryItems).orderBy(desc(galleryItems.createdAt)).all());
  });
  app.post("/api/admin/gallery", adminAuth, (req, res) => {
    const parsed = insertGalleryItemSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error.flatten() });
    db.insert(galleryItems).values(parsed.data).run();
    res.status(201).json({ message: "Gallery item created" });
  });
  app.put("/api/admin/gallery/:id", adminAuth, (req, res) => {
    db.update(galleryItems).set(req.body).where(eq(galleryItems.id, parseInt(req.params.id))).run();
    res.json({ message: "Gallery item updated" });
  });
  app.delete("/api/admin/gallery/:id", adminAuth, (req, res) => {
    db.delete(galleryItems).where(eq(galleryItems.id, parseInt(req.params.id))).run();
    db.delete(comments).where(and(eq(comments.targetType, "gallery"), eq(comments.targetId, parseInt(req.params.id)))).run();
    res.json({ message: "Gallery item deleted" });
  });

  // ─── Admin Courses CRUD ───
  app.get("/api/admin/courses", adminAuth, (_req, res) => {
    const allCourses = db.select().from(courses).all();
    const allLessons = db.select().from(lessons).all();
    res.json(allCourses.map(c => ({ ...c, lessons: allLessons.filter(l => l.courseId === c.id).sort((a, b) => a.orderIndex - b.orderIndex) })));
  });
  app.post("/api/admin/courses", adminAuth, (req, res) => {
    const parsed = insertCourseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data" });
    db.insert(courses).values(parsed.data).run();
    const latest = db.select().from(courses).orderBy(desc(courses.id)).limit(1).get();
    res.status(201).json(latest);
  });
  app.put("/api/admin/courses/:id", adminAuth, (req, res) => {
    db.update(courses).set(req.body).where(eq(courses.id, parseInt(req.params.id))).run();
    res.json({ message: "Course updated" });
  });
  app.delete("/api/admin/courses/:id", adminAuth, (req, res) => {
    const id = parseInt(req.params.id);
    db.delete(lessons).where(eq(lessons.courseId, id)).run();
    db.delete(courses).where(eq(courses.id, id)).run();
    db.delete(comments).where(and(eq(comments.targetType, "course"), eq(comments.targetId, id))).run();
    res.json({ message: "Course deleted" });
  });

  // ─── Admin Lessons CRUD ───
  app.post("/api/admin/lessons", adminAuth, (req, res) => {
    const parsed = insertLessonSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data" });
    db.insert(lessons).values(parsed.data).run();
    res.status(201).json({ message: "Lesson created" });
  });
  app.put("/api/admin/lessons/:id", adminAuth, (req, res) => {
    db.update(lessons).set(req.body).where(eq(lessons.id, parseInt(req.params.id))).run();
    res.json({ message: "Lesson updated" });
  });
  app.delete("/api/admin/lessons/:id", adminAuth, (req, res) => {
    db.delete(lessons).where(eq(lessons.id, parseInt(req.params.id))).run();
    res.json({ message: "Lesson deleted" });
  });

  // ─── Admin Threads CRUD ───
  app.get("/api/admin/threads", adminAuth, (_req, res) => {
    const allThreads = db.select().from(threads).all();
    const allCards = db.select().from(threadCards).all();
    res.json(allThreads.map(t => ({ ...t, cards: allCards.filter(c => c.threadId === t.id).sort((a, b) => a.orderIndex - b.orderIndex) })));
  });
  app.post("/api/admin/threads", adminAuth, (req, res) => {
    const parsed = insertThreadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data" });
    db.insert(threads).values(parsed.data).run();
    const latest = db.select().from(threads).orderBy(desc(threads.id)).limit(1).get();
    res.status(201).json(latest);
  });
  app.put("/api/admin/threads/:id", adminAuth, (req, res) => {
    db.update(threads).set(req.body).where(eq(threads.id, parseInt(req.params.id))).run();
    res.json({ message: "Thread updated" });
  });
  app.delete("/api/admin/threads/:id", adminAuth, (req, res) => {
    const id = parseInt(req.params.id);
    db.delete(threadCards).where(eq(threadCards.threadId, id)).run();
    db.delete(threads).where(eq(threads.id, id)).run();
    res.json({ message: "Thread deleted" });
  });

  // ─── Admin Thread Cards CRUD ───
  app.post("/api/admin/thread-cards", adminAuth, (req, res) => {
    const parsed = insertThreadCardSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data" });
    db.insert(threadCards).values(parsed.data).run();
    res.status(201).json({ message: "Card created" });
  });
  app.put("/api/admin/thread-cards/:id", adminAuth, (req, res) => {
    db.update(threadCards).set(req.body).where(eq(threadCards.id, parseInt(req.params.id))).run();
    res.json({ message: "Card updated" });
  });
  app.delete("/api/admin/thread-cards/:id", adminAuth, (req, res) => {
    db.delete(threadCards).where(eq(threadCards.id, parseInt(req.params.id))).run();
    res.json({ message: "Card deleted" });
  });

  // ─── Admin Subscribers ───
  app.get("/api/admin/subscribers", adminAuth, (_req, res) => {
    res.json(db.select().from(subscribers).orderBy(desc(subscribers.createdAt)).all());
  });
  app.delete("/api/admin/subscribers/:id", adminAuth, (req, res) => {
    db.delete(subscribers).where(eq(subscribers.id, parseInt(req.params.id))).run();
    res.json({ message: "Subscriber removed" });
  });

  // ─── Admin Orders ───
  app.get("/api/admin/orders", adminAuth, (_req, res) => {
    res.json(db.select().from(orders).orderBy(desc(orders.createdAt)).all());
  });
  app.put("/api/admin/orders/:id", adminAuth, (req, res) => {
    db.update(orders).set(req.body).where(eq(orders.id, parseInt(req.params.id))).run();
    res.json({ message: "Order updated" });
  });

  // ─── Admin Comments ───
  app.get("/api/admin/comments", adminAuth, (_req, res) => {
    res.json(db.select().from(comments).orderBy(desc(comments.createdAt)).all());
  });
  app.delete("/api/admin/comments/:id", adminAuth, (req, res) => {
    db.delete(comments).where(eq(comments.id, parseInt(req.params.id))).run();
    res.json({ message: "Comment deleted" });
  });
}
