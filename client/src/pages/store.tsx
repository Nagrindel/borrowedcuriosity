import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, ShoppingCart, Plus, Minus, X, Loader2, Check, CreditCard,
  Lock, FileText, Sparkles, Calendar, User, Mail, MessageSquare
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useCart, type ServiceDetails } from "@/context/cart";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
const stagger = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

interface Product {
  id: number; name: string; description: string; price: number;
  category: string; productType: string; gradient: string; imageUrl: string | null;
}

type Filter = "all" | "salve" | "jewelry" | "service";
const categories: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "salve", label: "Salves" },
  { value: "jewelry", label: "Jewelry" },
  { value: "service", label: "Services" },
];

export default function Store() {
  const [activeCategory, setActiveCategory] = useState<Filter>("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [serviceModal, setServiceModal] = useState<Product | null>(null);
  const cart = useCart();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => apiRequest("/api/products"),
  });

  useEffect(() => {
    fetch("/api/stripe/config").then(r => r.json()).then(d => {
      setStripeReady(d.configured);
      setIsDemo(!!d.demo);
    }).catch(() => {});
  }, []);

  const filtered = activeCategory === "all" ? products : products.filter(p => p.category === activeCategory);

  const handleAdd = (p: Product) => {
    if (p.productType === "service") {
      setServiceModal(p);
      return;
    }
    cart.addItem({ id: p.id, name: p.name, price: p.price, productType: p.productType });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const handleServiceSubmit = (p: Product, details: ServiceDetails) => {
    cart.addItem({
      id: p.id,
      name: p.name,
      price: p.price,
      productType: "service",
      serviceDetails: details,
    });
    setServiceModal(null);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const handleCheckout = async () => {
    if (checkingOut || cart.items.length === 0) return;
    setCheckingOut(true);
    setCheckoutError(null);

    try {
      const freshProducts = await fetch("/api/products").then(r => r.json()).catch(() => products);
      const productMap = new Map(freshProducts.map((p: Product) => [p.id, p]));

      const serviceDetails = cart.items
        .filter(i => i.productType === "service" && i.serviceDetails)
        .map(i => ({
          productId: i.id,
          productName: i.name,
          ...i.serviceDetails,
        }));

      const lineItems = cart.items.map(item => {
        const isCustom = item.productType === "custom_salve";
        const prod = isCustom ? null : productMap.get(item.id);
        return {
          productId: item.id,
          name: prod?.name || item.name,
          price: prod?.price ?? item.price,
          quantity: item.quantity,
          imageUrl: prod?.imageUrl || null,
          productType: item.productType || "physical",
          ...(isCustom ? { custom: true } : {}),
        };
      });

      const hasService = lineItems.some(i => i.productType === "service");
      const hasPhysical = lineItems.some(i => i.productType !== "service");
      const orderType = hasService && hasPhysical ? "mixed" : hasService ? "service" : "physical";

      const firstEmail = serviceDetails[0]?.email;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lineItems,
          customerEmail: firstEmail,
          orderType,
          customerNotes: serviceDetails.length > 0 ? JSON.stringify(serviceDetails) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.url) {
        cart.clearCart();
        window.location.href = data.url;
      }
    } catch (err: any) {
      setCheckoutError(err.message || "Something went wrong. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  const productTypeBadge = (p: Product) => {
    if (p.productType === "service") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/20 text-violet-400 mb-2">
          <FileText className="w-3 h-3" /> Personalized Service
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen pt-16">
      <section className="section-padding min-h-[50vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-700/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div {...fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-500 mb-6">
              <ShoppingBag className="w-3.5 h-3.5" /> Handcrafted with intention
            </span>
          </motion.div>
          <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
            The <span className="text-gradient">Shop</span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            Salves, jewelry, and things that make you feel something. Each piece comes with a story. Because mass-produced is boring.
          </motion.p>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="flex flex-wrap items-center justify-between gap-4 mb-12">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeCategory === cat.value ? "btn-primary" : "btn-outline hover:border-brand-500/50"}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <button onClick={() => setCartOpen(true)} className="btn-outline flex items-center gap-2 relative">
              <ShoppingCart className="w-4 h-4" /> Cart
              {cart.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">{cart.itemCount}</span>
              )}
            </button>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product, i) => (
                <motion.div key={product.id} {...stagger} transition={{ duration: 0.5, delay: i * 0.08 }} className="glass-card group flex flex-col">
                  <div className={`aspect-square rounded-xl bg-gradient-to-br ${product.gradient} mb-4 group-hover:scale-[1.02] transition-transform duration-300 overflow-hidden relative`}>
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                    {product.productType === "service" && (
                      <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-brand-500" />
                      </div>
                    )}
                  </div>
                  {productTypeBadge(product)}
                  <h3 className="font-display text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-grow">{product.description}</p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-brand-500 font-display font-bold text-xl">${product.price}</span>
                    <button onClick={() => handleAdd(product)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                      {addedId === product.id ? <><Check className="w-4 h-4" /> Added!</> : (
                        product.productType === "service"
                          ? <><FileText className="w-4 h-4" /> Order Report</>
                          : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Service Details Modal */}
      <AnimatePresence>
        {serviceModal && (
          <ServiceDetailsModal
            product={serviceModal}
            onSubmit={(details) => handleServiceSubmit(serviceModal, details)}
            onClose={() => setServiceModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 bg-white dark:bg-gray-900 border-l border-white/10 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">Your Cart</h2>
                <button onClick={() => setCartOpen(false)} className="p-2 rounded-lg hover:bg-brand-500/10"><X className="w-5 h-5" /></button>
              </div>
              {cart.items.length === 0 ? (
                <p className="text-center text-gray-500 py-12">Your cart is empty. Go treat yourself.</p>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto space-y-4">
                    {cart.items.map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="p-3 rounded-xl glass">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">${item.price} each</p>
                          </div>
                          {item.productType !== "service" && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => cart.updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg glass flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                              <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                              <button onClick={() => cart.updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg glass flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                            </div>
                          )}
                          {item.productType === "service" && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">Service</span>
                          )}
                          <button onClick={() => cart.removeItem(item.id)} className="text-gray-400 hover:text-red-400"><X className="w-4 h-4" /></button>
                        </div>
                        {item.serviceDetails && (
                          <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                            <p className="text-[11px] text-gray-500">
                              <span className="text-gray-400">For:</span> {item.serviceDetails.fullName}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              <span className="text-gray-400">Born:</span> {item.serviceDetails.birthDate}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              <span className="text-gray-400">Email:</span> {item.serviceDetails.email}
                            </p>
                            {item.serviceDetails.specialRequests && (
                              <p className="text-[11px] text-gray-500">
                                <span className="text-gray-400">Notes:</span> {item.serviceDetails.specialRequests}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-semibold">Total</span>
                      <span className="font-display font-bold text-xl text-brand-500">${cart.total.toFixed(2)}</span>
                    </div>

                    {cart.hasServiceItems && (
                      <p className="text-[11px] text-violet-400/80 text-center bg-violet-500/10 rounded-lg py-1.5 px-3">
                        Your cart includes a personalized service. Nicole will hand-write your report and deliver it to the email provided (typically 3-5 business days).
                      </p>
                    )}

                    {checkoutError && (
                      <p className="text-xs text-red-400 text-center bg-red-500/10 rounded-lg py-2 px-3">{checkoutError}</p>
                    )}

                    {stripeReady ? (
                      <button
                        onClick={handleCheckout}
                        disabled={checkingOut}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {checkingOut ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                        ) : (
                          <><CreditCard className="w-4 h-4" /> {isDemo ? "Checkout (Demo)" : "Secure Checkout"}</>
                        )}
                      </button>
                    ) : (
                      <a href={`mailto:hello@borrowedcuriosity.com?subject=Order from Borrowed Curiosity&body=${encodeURIComponent(cart.items.map(i => `${i.quantity}x ${i.name} ($${i.price})`).join("\n") + `\n\nTotal: $${cart.total.toFixed(2)}`)}`}
                        className="btn-primary w-full flex items-center justify-center gap-2">
                        <ShoppingBag className="w-4 h-4" /> Checkout via Email
                      </a>
                    )}

                    {isDemo && (
                      <p className="text-[11px] text-amber-400/80 text-center bg-amber-500/10 rounded-lg py-1.5 px-3">
                        Demo mode: no real charges. Connect Stripe keys for live payments.
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                      <Lock className="w-3 h-3" />
                      <span>Secure checkout powered by Stripe</span>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-1">
                      <span className="text-[10px] text-gray-600">Visa</span>
                      <span className="text-[10px] text-gray-600">Mastercard</span>
                      <span className="text-[10px] text-gray-600">Amex</span>
                      <span className="text-[10px] text-gray-600">Apple Pay</span>
                      <span className="text-[10px] text-gray-600">Google Pay</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ServiceDetailsModal({
  product,
  onSubmit,
  onClose,
}: {
  product: Product;
  onSubmit: (details: ServiceDetails) => void;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required for the report";
    if (!birthDate) errs.birthDate = "Birth date is required for numerology calculations";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Valid email is required for delivery";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ fullName: fullName.trim(), birthDate, email: email.trim(), specialRequests: specialRequests.trim() || undefined });
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 z-50" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed z-50 inset-0 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-white/10 shadow-2xl w-full max-w-lg max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] overflow-y-auto pointer-events-auto">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold">Order Your Report</h2>
              <p className="text-sm text-gray-500 mt-1">{product.name} - ${product.price}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-500/10"><X className="w-5 h-5 text-gray-400" /></button>
          </div>

          <div className="glass rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">How it works</p>
                <ol className="text-xs text-gray-500 space-y-1 list-decimal ml-3.5">
                  <li>Provide your details below</li>
                  <li>Complete payment through Stripe</li>
                  <li>Nicole personally writes your report (3-5 business days)</li>
                  <li>Your finished report is delivered to your email</li>
                </ol>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" /> Full Legal Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="As it appears on your birth certificate"
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-brand-500/50 outline-none text-sm"
              />
              {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Date of Birth
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-brand-500/50 outline-none text-sm"
              />
              {errors.birthDate && <p className="text-xs text-red-400 mt-1">{errors.birthDate}</p>}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> Email for Delivery
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Where to send the finished report"
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-brand-500/50 outline-none text-sm"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400" /> Special Requests <span className="text-xs text-gray-500 font-normal">(optional)</span>
              </label>
              <textarea
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                placeholder="Anything specific you'd like Nicole to focus on?"
                rows={3}
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-brand-500/50 outline-none text-sm resize-y"
              />
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              <ShoppingCart className="w-4 h-4" /> Add to Cart - ${product.price}
            </button>
          </form>
        </div>
        </div>
      </motion.div>
    </>
  );
}
