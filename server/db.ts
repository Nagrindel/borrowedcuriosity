import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import * as schema from "../shared/schema.js";

const dbDir = path.resolve("data");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const sqlite = new Database(path.join(dbDir, "borrowed.db"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    reading_time TEXT NOT NULL,
    gradient TEXT NOT NULL,
    image_url TEXT,
    published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_type TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    gradient TEXT NOT NULL,
    image_url TEXT,
    in_stock INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS gallery_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    gradient TEXT NOT NULL,
    media_url TEXT,
    download_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    gradient TEXT NOT NULL,
    image_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT
  );

  CREATE TABLE IF NOT EXISTS threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS thread_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS numerology_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    system TEXT NOT NULL,
    life_path INTEGER NOT NULL,
    expression INTEGER NOT NULL,
    soul_urge INTEGER NOT NULL,
    personality INTEGER NOT NULL,
    birth_day INTEGER NOT NULL,
    maturity INTEGER NOT NULL,
    hidden_passion INTEGER NOT NULL,
    karmic_lesson INTEGER NOT NULL,
    balance INTEGER NOT NULL,
    subconscious INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS daily_numerology (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    energy_of_day INTEGER NOT NULL,
    month_focus INTEGER NOT NULL,
    intentional_action INTEGER NOT NULL,
    biblical_verse TEXT,
    verse_reference TEXT,
    verse_numerical_value INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS relationship_compatibility (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner1_name TEXT NOT NULL,
    partner2_name TEXT NOT NULL,
    partner1_life_path INTEGER NOT NULL,
    partner2_life_path INTEGER NOT NULL,
    harmony_score INTEGER NOT NULL,
    attraction_potential INTEGER NOT NULL,
    compatibility_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

try { sqlite.exec("ALTER TABLE courses ADD COLUMN image_url TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE orders ADD COLUMN stripe_session_id TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE orders ADD COLUMN stripe_payment_intent_id TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE products ADD COLUMN product_type TEXT NOT NULL DEFAULT 'physical'"); } catch {}
try { sqlite.exec("ALTER TABLE orders ADD COLUMN order_type TEXT NOT NULL DEFAULT 'physical'"); } catch {}
try { sqlite.exec("ALTER TABLE orders ADD COLUMN customer_notes TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE orders ADD COLUMN shipping_address TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE orders ADD COLUMN customer_phone TEXT"); } catch {}

export const db = drizzle(sqlite, { schema });
