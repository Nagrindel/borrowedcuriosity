import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Subscribers (email sign-up) ───
export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Blog Posts ───
export const blogPosts = sqliteTable("blog_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  readingTime: text("reading_time").notNull(),
  gradient: text("gradient").notNull(),
  imageUrl: text("image_url"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Comments (shared across blog, gallery, courses) ───
export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  targetType: text("target_type").notNull(), // "blog" | "gallery" | "course"
  targetId: integer("target_id").notNull(),
  author: text("author").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Products ───
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  category: text("category").notNull(), // "salve" | "jewelry" | "service"
  productType: text("product_type").notNull().default("physical"), // "physical" | "service" | "digital"
  gradient: text("gradient").notNull(),
  imageUrl: text("image_url"),
  inStock: integer("in_stock", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Orders (for tracking purchases) ───
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  items: text("items").notNull(), // JSON stringified array
  total: real("total").notNull(),
  status: text("status").notNull().default("pending"), // pending | paid | processing | shipped | delivered | completed
  orderType: text("order_type").notNull().default("physical"), // "physical" | "service" | "mixed"
  customerNotes: text("customer_notes"), // JSON: birth details, special requests, etc.
  shippingAddress: text("shipping_address"), // JSON: Stripe shipping details
  customerPhone: text("customer_phone"),
  paymentMethod: text("payment_method"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Gallery Items ───
export const galleryItems = sqliteTable("gallery_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "photo" | "video" | "download"
  gradient: text("gradient").notNull(),
  mediaUrl: text("media_url"),
  downloadUrl: text("download_url"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Courses ───
export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  gradient: text("gradient").notNull(),
  imageUrl: text("image_url"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Lessons ───
export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").notNull(),
  orderIndex: integer("order_index").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content"), // full lesson content (markdown)
});

// ─── Threads ───
export const threads = sqliteTable("threads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  topic: text("topic").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const threadCards = sqliteTable("thread_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  threadId: integer("thread_id").notNull(),
  orderIndex: integer("order_index").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
});

// ─── Numerology Profiles ───
export const numerologyProfiles = sqliteTable("numerology_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull(),
  birthDate: text("birth_date").notNull(),
  system: text("system").notNull(),
  lifePath: integer("life_path").notNull(),
  expression: integer("expression").notNull(),
  soulUrge: integer("soul_urge").notNull(),
  personality: integer("personality").notNull(),
  birthDay: integer("birth_day").notNull(),
  maturity: integer("maturity").notNull(),
  hiddenPassion: integer("hidden_passion").notNull(),
  karmicLesson: integer("karmic_lesson").notNull(),
  balance: integer("balance").notNull(),
  subconscious: integer("subconscious").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Daily Numerology ───
export const dailyNumerology = sqliteTable("daily_numerology", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  energyOfDay: integer("energy_of_day").notNull(),
  monthFocus: integer("month_focus").notNull(),
  intentionalAction: integer("intentional_action").notNull(),
  biblicalVerse: text("biblical_verse"),
  verseReference: text("verse_reference"),
  verseNumericalValue: integer("verse_numerical_value"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Relationship Compatibility ───
export const relationshipCompatibility = sqliteTable("relationship_compatibility", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  partner1Name: text("partner1_name").notNull(),
  partner2Name: text("partner2_name").notNull(),
  partner1LifePath: integer("partner1_life_path").notNull(),
  partner2LifePath: integer("partner2_life_path").notNull(),
  harmonyScore: integer("harmony_score").notNull(),
  attractionPotential: integer("attraction_potential").notNull(),
  compatibilityNotes: text("compatibility_notes"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Zod schemas for validation ───
export const insertSubscriberSchema = createInsertSchema(subscribers).pick({ email: true });
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertGalleryItemSchema = createInsertSchema(galleryItems).omit({ id: true, createdAt: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true });
export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true });
export const insertThreadSchema = createInsertSchema(threads).omit({ id: true, createdAt: true });
export const insertThreadCardSchema = createInsertSchema(threadCards).omit({ id: true });
export const insertNumerologyProfileSchema = createInsertSchema(numerologyProfiles).omit({ id: true, createdAt: true });
export const insertDailyNumerologySchema = createInsertSchema(dailyNumerology).omit({ id: true, createdAt: true });
export const insertRelationshipCompatibilitySchema = createInsertSchema(relationshipCompatibility).omit({ id: true, createdAt: true });

// ─── Types ───
export type Subscriber = typeof subscribers.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type GalleryItem = typeof galleryItems.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Thread = typeof threads.$inferSelect;
export type ThreadCard = typeof threadCards.$inferSelect;
export type NumerologyProfileRow = typeof numerologyProfiles.$inferSelect;
export type DailyNumerologyRow = typeof dailyNumerology.$inferSelect;
export type RelationshipCompatibilityRow = typeof relationshipCompatibility.$inferSelect;
