import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/context/theme";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, ShoppingBag, ChevronDown } from "lucide-react";
import { useCart } from "@/context/cart";

const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/calculator", label: "Calculator" },
  { href: "/blog", label: "Blog" },
  { href: "/store", label: "Store" },
  { href: "/courses", label: "Courses" },
  { href: "/crystals", label: "Crystals" },
  { href: "/ask-alta", label: "Alta" },
];

const moreLinks = [
  { href: "/compatibility", label: "Compatibility" },
  { href: "/daily", label: "Daily Numerology" },
  { href: "/word-lookup", label: "Word Lookup" },
  { href: "/frequencies", label: "Frequencies" },
  { href: "/identify", label: "Crystal Identifier" },
  { href: "/journal", label: "Spiritual Journal" },
  { href: "/stories", label: "Sacred Stories" },
  { href: "/quiz", label: "Spiritual Quiz" },
  { href: "/oracle", label: "Digital Oracle" },
  { href: "/library", label: "Spiral Library" },
  { href: "/yoga", label: "Yoga Flows" },
  { href: "/worksheets", label: "Worksheets" },
  { href: "/creator", label: "Content Creator" },
  { href: "/transformation", label: "Transformation" },
  { href: "/salve-builder", label: "Salve Builder" },
  { href: "/oil-quiz", label: "Oil Quiz" },
  { href: "/mirror", label: "Pattern Mirror" },
  { href: "/healing-threads", label: "Healing Threads" },
  { href: "/remedies", label: "Botanical Remedies" },
  { href: "/gallery", label: "Gallery" },
  { href: "/threads", label: "Threads" },
  { href: "/gematria", label: "Gematria" },
];

const allLinks = [...primaryNav, ...moreLinks];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const cart = useCart();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isMoreActive = moreLinks.some(l => location === l.href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <img
              src="/logo.png"
              alt="Borrowed Curiosity"
              className="w-10 h-10 object-contain transition-all dark:mix-blend-screen dark:brightness-[2.5] dark:drop-shadow-[0_0_6px_rgba(139,92,246,0.4)] mix-blend-multiply brightness-0 dark:brightness-[2.5]"
            />
            <span className="font-display font-bold text-lg hidden sm:block">
              Borrowed <span className="text-gradient">Curiosity</span>
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {primaryNav.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  location === link.href
                    ? "text-brand-500 bg-brand-500/10"
                    : "text-gray-600 dark:text-gray-400 hover:text-brand-500 hover:bg-brand-500/5"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}

          <div ref={moreRef} className="relative">
            <button onClick={() => setMoreOpen(!moreOpen)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isMoreActive ? "text-brand-500 bg-brand-500/10" : "text-gray-600 dark:text-gray-400 hover:text-brand-500 hover:bg-brand-500/5"
              }`}>
              More <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {moreOpen && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 shadow-2xl py-2 overflow-hidden bg-white dark:bg-gray-900">
                  {moreLinks.map(link => (
                    <Link key={link.href} href={link.href}>
                      <span onClick={() => setMoreOpen(false)}
                        className={`block px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                          location === link.href ? "text-brand-500 bg-brand-500/10" : "text-gray-600 dark:text-gray-400 hover:text-brand-500 hover:bg-brand-500/5"
                        }`}>
                        {link.label}
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/store">
            <span className="p-2 rounded-lg hover:bg-brand-500/10 transition-colors cursor-pointer relative">
              <ShoppingBag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </span>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-brand-500/10 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-gold-400" />
            ) : (
              <Moon className="w-5 h-5 text-brand-600" />
            )}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-brand-500/10 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-white/5 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1 max-h-[70vh] overflow-y-auto">
              {allLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      location === link.href
                        ? "text-brand-500 bg-brand-500/10"
                        : "text-gray-600 dark:text-gray-400 hover:text-brand-500"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
