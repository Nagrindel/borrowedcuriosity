import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { CheckCircle, Package, ArrowRight, Loader2, XCircle, ShoppingBag } from "lucide-react";

interface OrderData {
  id: number;
  customerEmail: string;
  customerName: string;
  items: string;
  total: number;
  status: string;
  orderType: string;
  customerNotes: string | null;
  paymentMethod: string;
  createdAt: string;
}

interface ParsedItem {
  name: string;
  price: number;
  quantity: number;
}

export default function OrderSuccess() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setError(true);
      setLoading(false);
      return;
    }

    const demo = sessionId.startsWith("demo_");
    setIsDemo(demo);

    let attempts = 0;
    const maxAttempts = demo ? 3 : 10;

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/session/${sessionId}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setOrder(data);

        if (data.status === "pending" && attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
          return;
        }

        setLoading(false);
      } catch {
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setError(true);
          setLoading(false);
        }
      }
    };

    poll();
  }, []);

  const items: ParsedItem[] = order ? (() => {
    try { return JSON.parse(order.items); } catch { return []; }
  })() : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-gray-500">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold mb-3">Something went wrong</h1>
          <p className="text-gray-500 mb-6">
            We couldn't find your order. If you were charged, please contact us and we'll sort it out.
          </p>
          <Link href="/store">
            <span className="btn-primary inline-flex items-center gap-2 cursor-pointer">
              <ShoppingBag className="w-4 h-4" /> Back to Store
            </span>
          </Link>
        </motion.div>
      </div>
    );
  }

  const isPaid = order.status === "paid";

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="text-center mb-10">
          <div className={`w-20 h-20 rounded-full ${isPaid ? "bg-green-500/20" : "bg-amber-500/20"} flex items-center justify-center mx-auto mb-6`}>
            {isPaid ? (
              <CheckCircle className="w-10 h-10 text-green-400" />
            ) : (
              <Package className="w-10 h-10 text-amber-400" />
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
            {isPaid ? "Order Confirmed!" : "Order Processing"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {isPaid
              ? order.orderType === "service" || order.orderType === "mixed"
                ? "Thank you for your order! Nicole will personally craft your report and deliver it to your email within 3-5 business days."
                : "Thank you for your purchase! Your order has been received and we're getting it ready."
              : "Your payment is being processed. You'll receive a confirmation email shortly."}
          </p>
          {isDemo && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Demo Mode: No real payment was charged
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold">Order Details</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isPaid ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
              {isPaid ? "Paid" : "Processing"}
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="font-medium">#{order.id}</span>
            </div>
            {order.customerEmail !== "pending@checkout" && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{order.customerEmail}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
            </div>
          </div>

          <div className="h-px bg-white/5 mb-6" />

          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="h-px bg-white/5 my-6" />

          <div className="flex items-center justify-between">
            <span className="font-display font-semibold">Total</span>
            <span className="font-display font-bold text-xl text-brand-500">${order.total.toFixed(2)}</span>
          </div>

          {(order.orderType === "service" || order.orderType === "mixed") && order.customerNotes && (() => {
            try {
              const notes = JSON.parse(order.customerNotes);
              if (!Array.isArray(notes) || notes.length === 0) return null;
              return (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-sm font-medium mb-3 text-violet-400">Report Details Submitted</p>
                  {notes.map((n: any, i: number) => (
                    <div key={i} className="text-sm space-y-1">
                      <p><span className="text-gray-500">Name:</span> {n.fullName}</p>
                      <p><span className="text-gray-500">Birth Date:</span> {n.birthDate}</p>
                      <p><span className="text-gray-500">Delivery Email:</span> {n.email}</p>
                      {n.specialRequests && <p><span className="text-gray-500">Notes:</span> {n.specialRequests}</p>}
                    </div>
                  ))}
                </div>
              );
            } catch { return null; }
          })()}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/store">
            <span className="btn-outline inline-flex items-center gap-2 cursor-pointer">
              <ShoppingBag className="w-4 h-4" /> Continue Shopping
            </span>
          </Link>
          <Link href="/">
            <span className="btn-primary inline-flex items-center gap-2 cursor-pointer">
              Home <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
