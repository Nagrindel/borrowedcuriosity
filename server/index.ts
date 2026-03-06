import "dotenv/config";
import express from "express";
import path from "path";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";
import { registerAltaRoutes } from "./alta.js";
import { registerNumerologyRoutes } from "./numerology-routes.js";
import { registerStripeRoutes } from "./stripe.js";
import { seedDatabase } from "./seed.js";

const app = express();

app.use((req, res, next) => {
  if (req.originalUrl === "/api/stripe/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

registerStripeRoutes(app);

registerRoutes(app);
registerAltaRoutes(app);
registerNumerologyRoutes(app);
seedDatabase();

const server = createServer(app);

if (process.env.NODE_ENV === "development") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const staticPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

const port = parseInt(process.env.PORT || "3000", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`[borrowed-curiosity] running on http://localhost:${port}`);
  console.log(`[env] GROQ_API_KEY: ${process.env.GROQ_API_KEY ? "set" : "MISSING"}`);
  console.log(`[env] ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD ? "set" : "MISSING"}`);
  console.log(`[env] NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
});
