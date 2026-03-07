import { Express, Request, Response } from "express";
import Stripe from "stripe";
import express from "express";
import { db } from "./db.js";
import { orders, products } from "../shared/schema.js";
import { eq } from "drizzle-orm";

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
}

function isStripeConfigured(): boolean {
  const sk = process.env.STRIPE_SECRET_KEY;
  return !!sk && sk !== "sk_test_your_key_here";
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
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "AU", "NZ"],
        },
        phone_number_collection: { enabled: true },
        metadata: {
          items: JSON.stringify(items.map(i => ({ id: i.productId, name: i.name, price: i.price, qty: i.quantity }))),
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

      if (!sig || !webhookSecret || webhookSecret === "whsec_your_webhook_secret_here") {
        return res.status(400).json({ error: "Webhook not configured" });
      }

      let event: Stripe.Event;
      try {
        const s = getStripe();
        event = s.webhooks.constructEvent(req.body, sig as string, webhookSecret);
      } catch (err: any) {
        console.error("[stripe] webhook signature verification failed:", err.message);
        return res.status(400).json({ error: "Invalid signature" });
      }

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const email = session.customer_details?.email || session.customer_email || "unknown";
          const name = session.customer_details?.name || "Customer";
          const paymentIntent = typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id || null;

          db.update(orders)
            .set({
              status: "paid",
              customerEmail: email,
              customerName: name,
              stripePaymentIntentId: paymentIntent,
              paymentMethod: "stripe",
            })
            .where(eq(orders.stripeSessionId, session.id))
            .run();

          console.log(`[stripe] payment completed: ${session.id} - ${email}`);
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
        const email = session.customer_details?.email || session.customer_email || order.customerEmail;
        const name = session.customer_details?.name || order.customerName;
        const paymentIntent = typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null;

        db.update(orders)
          .set({
            status: "paid",
            customerEmail: email,
            customerName: name,
            stripePaymentIntentId: paymentIntent,
          })
          .where(eq(orders.stripeSessionId, sessionId))
          .run();

        return res.json({
          ...order,
          status: "paid",
          customerEmail: email,
          customerName: name,
          stripePaymentIntentId: paymentIntent,
        });
      }

      res.json(order);
    } catch {
      res.json(order);
    }
  });
}
