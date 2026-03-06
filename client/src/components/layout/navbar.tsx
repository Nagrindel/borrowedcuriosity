import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/context/theme";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/calculator", label: "Calculator" },
  { href: "/compatibility", label: "Compatibility" },
  { href: "/daily", label: "Daily" },
  { href: "/word-lookup", label: "Words" },
  { href: "/blog", label: "Blog" },
  { href: "/store", label: "Store" },
  { href: "/courses", label: "Courses" },
  { href: "/crystals", label: "Crystals" },
  { href: "/ask-alta", label: "Alta" },
];

const mobileOnlyLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/threads", label: "Threads" },
  { href: "/gematria", label: "Gematria" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const cart = useCart();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          {navLinks.map((link) => (
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
            <div className="px-6 py-4 space-y-1">
              {[...navLinks, ...mobileOnlyLinks].map((link) => (
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
