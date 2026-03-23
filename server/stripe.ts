import { Express, Request, Response } from "express";
import Stripe from "stripe";
import express from "express";
import { db } from "./db.js";
import { orders, products } from "../shared/schema.js";
import { eq, and, lt, inArray } from "drizzle-orm";

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key === "sk_test_your_key_here") {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    stripe = new Stripe(key);
  }
  return stripe;
}

interface LineItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  custom?: boolean;
}

function isStripeConfigured(): boolean {
  const sk = process.env.STRIPE_SECRET_KEY;
  return !!sk && sk !== "sk_test_your_key_here";
}

function fulfillOrder(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email || session.customer_email || "unknown";
  const name = session.customer_details?.name || "Customer";
  const paymentIntent = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id || null;
  const { shippingAddress, customerPhone } = extractShippingFromSession(session);

  const result = db.update(orders)
    .set({
      status: "paid",
      customerEmail: email,
      customerName: name,
      stripePaymentIntentId: paymentIntent,
      paymentMethod: "stripe",
      ...(shippingAddress ? { shippingAddress } : {}),
      ...(customerPhone ? { customerPhone } : {}),
    })
    .where(eq(orders.stripeSessionId, session.id))
    .run();

  console.log(`[stripe] order fulfilled: ${session.id} - ${email} (rows: ${result.changes})`);
  return result.changes > 0;
}

function extractShippingFromSession(session: Stripe.Checkout.Session) {
  const shipping = session.shipping_details || (session as any).shipping;
  if (!shipping?.address) return { shippingAddress: null, customerPhone: null };

  const addr = shipping.address;
  const shippingAddress = JSON.stringify({
    name: shipping.name || session.customer_details?.name || "",
    line1: addr.line1 || "",
    line2: addr.line2 || "",
    city: addr.city || "",
    state: addr.state || "",
    postal_code: addr.postal_code || "",
    country: addr.country || "",
  });

  const customerPhone = session.customer_details?.phone || null;

  return { shippingAddress, customerPhone };
}

export function registerStripeRoutes(app: Express) {

  app.get("/api/stripe/config", (_req, res) => {
    const live = isStripeConfigured();
    const pk = process.env.STRIPE_PUBLISHABLE_KEY;
    res.json({
      publishableKey: live && pk ? pk : null,
      configured: true,
      demo: !live,
    });
  });

  app.post("/api/checkout", async (req: Request, res: Response) => {
    try {
      const { items, customerEmail, orderType, customerNotes } = req.body as {
        items: LineItem[];
        customerEmail?: string;
        orderType?: string;
        customerNotes?: string;
      };

      if (!items?.length) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      for (const item of items) {
        if (item.custom) {
          if (item.price <= 0 || item.price > 500) {
            return res.status(400).json({ error: `Invalid price for custom item "${item.name}"` });
          }
          continue;
        }
        const product = db.select().from(products).where(eq(products.id, item.productId)).get();
        if (!product) {
          return res.status(400).json({ error: `Product "${item.name}" not found` });
        }
        if (Math.abs(product.price - item.price) > 0.01) {
          return res.status(400).json({ error: `Price mismatch for "${item.name}"` });
        }
      }

      const origin = `${req.protocol}://${req.get("host")}`;
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const hasPhysical = (orderType !== "service");

      if (!isStripeConfigured()) {
        const demoSessionId = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

        db.insert(orders).values({
          customerEmail: customerEmail || "demo@borrowedcuriosity.com",
          customerName: "Demo Customer",
          items: JSON.stringify(items.map(i => ({ id: i.productId, name: i.name, price: i.price, quantity: i.quantity }))),
          total,
          status: "paid",
          orderType: orderType || "physical",
          customerNotes: customerNotes || null,
          shippingAddress: hasPhysical ? JSON.stringify({ name: "Demo Customer", line1: "123 Demo St", line2: "", city: "Anytown", state: "CA", postal_code: "90210", country: "US" }) : null,
          customerPhone: hasPhysical ? "+1 555-0100" : null,
          paymentMethod: "stripe (demo)",
          stripeSessionId: demoSessionId,
        }).run();

        console.log(`[stripe-demo] order created: ${demoSessionId} - $${total.toFixed(2)}`);
        return res.json({
          sessionId: demoSessionId,
          url: `${origin}/order-success?session_id=${demoSessionId}`,
          demo: true,
        });
      }

      const s = getStripe();

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            ...(item.imageUrl ? { images: [item.imageUrl.startsWith("http") ? item.imageUrl : `${origin}${item.imageUrl}`] } : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: "payment",
        line_items: lineItems,
        success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/store`,
        ...(hasPhysical ? {
          shipping_address_collection: {
            allowed_countries: ["US", "CA", "GB", "AU", "NZ"],
          },
        } : {}),
        phone_number_collection: { enabled: true },
        metadata: {
          items: JSON.stringify(items.map(i => ({ id: i.productId, name: i.name, price: i.price, qty: i.quantity }))),
          orderType: orderType || "physical",
        },
        ...(customerEmail ? { customer_email: customerEmail } : {}),
      };

      const session = await s.checkout.sessions.create(sessionParams);

      db.insert(orders).values({
        customerEmail: customerEmail || "pending@checkout",
        customerName: "Pending Checkout",
        items: JSON.stringify(items.map(i => ({ id: i.productId, name: i.name, price: i.price, quantity: i.quantity }))),
        total,
        status: "pending",
        orderType: orderType || "physical",
        customerNotes: customerNotes || null,
        paymentMethod: "stripe",
        stripeSessionId: session.id,
      }).run();

      res.json({ sessionId: session.id, url: session.url });
    } catch (err: any) {
      console.error("[stripe] checkout error:", err.message);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const hasSecret = webhookSecret && webhookSecret !== "whsec_your_webhook_secret_here";

      let event: Stripe.Event;
      try {
        const s = getStripe();
        if (hasSecret && sig) {
          event = s.webhooks.constructEvent(req.body, sig as string, webhookSecret as string);
        } else {
          console.warn("[stripe] webhook secret not configured, parsing raw body (less secure)");
          const body = typeof req.body === "string" ? req.body : req.body.toString("utf8");
          event = JSON.parse(body) as Stripe.Event;
        }
      } catch (err: any) {
        console.error("[stripe] webhook parse error:", err.message);
        return res.status(400).json({ error: "Invalid webhook payload" });
      }

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          fulfillOrder(session);
          break;
        }

        case "checkout.session.expired": {
          const session = event.data.object as Stripe.Checkout.Session;
          db.update(orders)
            .set({ status: "cancelled" })
            .where(eq(orders.stripeSessionId, session.id))
            .run();
          console.log(`[stripe] session expired: ${session.id}`);
          break;
        }
      }

      res.json({ received: true });
    }
  );

  app.get("/api/orders/session/:sessionId", async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    const order = db.select().from(orders).where(eq(orders.stripeSessionId, sessionId)).get();
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (sessionId.startsWith("demo_")) {
      return res.json(order);
    }

    try {
      const s = getStripe();
      const session = await s.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid" && order.status === "pending") {
        fulfillOrder(session);
        const updated = db.select().from(orders).where(eq(orders.stripeSessionId, sessionId)).get();
        return res.json(updated || order);
      }

      res.json(order);
    } catch {
      res.json(order);
    }
  });

  // Sync all pending orders with Stripe (admin use)
  app.post("/api/admin/sync-orders", async (req: Request, res: Response) => {
    if (!isStripeConfigured()) {
      return res.json({ synced: 0, message: "Stripe not configured" });
    }

    const pendingOrders = db.select().from(orders)
      .where(eq(orders.status, "pending"))
      .all()
      .filter(o => o.stripeSessionId && !o.stripeSessionId.startsWith("demo_"));

    if (pendingOrders.length === 0) {
      return res.json({ synced: 0, cleaned: 0, message: "No pending orders to sync" });
    }

    const s = getStripe();
    let synced = 0;
    let cancelled = 0;

    for (const order of pendingOrders) {
      try {
        const session = await s.checkout.sessions.retrieve(order.stripeSessionId!);
        if (session.payment_status === "paid") {
          fulfillOrder(session);
          synced++;
        } else if (session.status === "expired") {
          db.update(orders)
            .set({ status: "cancelled" })
            .where(eq(orders.id, order.id))
            .run();
          cancelled++;
        }
      } catch (err: any) {
        console.warn(`[sync] failed for order #${order.id}: ${err.message}`);
      }
    }

    // Clean up very old pending orders (no Stripe session or older than 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const staleOrders = db.select().from(orders)
      .where(eq(orders.status, "pending"))
      .all()
      .filter(o => o.createdAt < twoHoursAgo && (!o.stripeSessionId || o.customerEmail === "pending@checkout"));

    let cleaned = 0;
    for (const stale of staleOrders) {
      db.update(orders)
        .set({ status: "cancelled" })
        .where(eq(orders.id, stale.id))
        .run();
      cleaned++;
    }

    console.log(`[sync] synced: ${synced}, cancelled: ${cancelled}, cleaned: ${cleaned}`);
    res.json({ synced, cancelled, cleaned, total: pendingOrders.length });
  });

  // Import all historical orders from Stripe
  app.post("/api/admin/import-stripe-orders", async (req: Request, res: Response) => {
    if (!isStripeConfigured()) {
      return res.status(400).json({ imported: 0, error: "Stripe not configured" });
    }

    const s = getStripe();
    let imported = 0;
    let skipped = 0;
    let hasMore = true;
    let startingAfter: string | undefined;

    try {
      while (hasMore) {
        const params: Stripe.Checkout.SessionListParams = {
          limit: 100,
          status: "complete",
          expand: ["data.line_items"],
        };
        if (startingAfter) params.starting_after = startingAfter;

        const sessions = await s.checkout.sessions.list(params);

        for (const session of sessions.data) {
          if (session.payment_status !== "paid") continue;

          const existing = db.select().from(orders)
            .where(eq(orders.stripeSessionId, session.id))
            .get();

          if (existing) {
            skipped++;
            continue;
          }

          const email = session.customer_details?.email || session.customer_email || "unknown";
          const name = session.customer_details?.name || "Customer";
          const total = (session.amount_total || 0) / 100;
          const paymentIntent = typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id || null;

          let lineItems: { name: string; price: number; quantity: number }[] = [];
          try {
            const li = (session as any).line_items;
            if (li?.data) {
              lineItems = li.data.map((item: any) => ({
                name: item.description || item.price?.product?.name || "Item",
                price: (item.amount_total || 0) / 100 / (item.quantity || 1),
                quantity: item.quantity || 1,
              }));
            }
          } catch {}

          if (lineItems.length === 0) {
            lineItems = [{ name: "Stripe Order", price: total, quantity: 1 }];
          }

          const { shippingAddress, customerPhone } = extractShippingFromSession(session);

          const isService = lineItems.some(i =>
            i.name.toLowerCase().includes("report") ||
            i.name.toLowerCase().includes("numerology") ||
            i.name.toLowerCase().includes("service")
          );

          const orderType = isService ? "service" : "physical";

          const customerNotes = session.metadata?.customerNotes || null;

          db.insert(orders).values({
            customerEmail: email,
            customerName: name,
            items: JSON.stringify(lineItems),
            total,
            status: "paid",
            orderType,
            customerNotes,
            shippingAddress: shippingAddress || null,
            customerPhone: customerPhone || null,
            paymentMethod: "stripe",
            stripeSessionId: session.id,
            stripePaymentIntentId: paymentIntent,
          }).run();

          imported++;
        }

        hasMore = sessions.has_more;
        if (sessions.data.length > 0) {
          startingAfter = sessions.data[sessions.data.length - 1].id;
        } else {
          hasMore = false;
        }
      }

      console.log(`[import] Stripe orders imported: ${imported}, skipped (already exist): ${skipped}`);
      res.json({ imported, skipped, message: `Imported ${imported} orders from Stripe. ${skipped} already existed.` });
    } catch (err: any) {
      console.error("[import] Stripe import error:", err.message);
      res.status(500).json({ imported, skipped, error: `Import partially failed: ${err.message}` });
    }
  });
}
