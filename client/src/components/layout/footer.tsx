import { Link } from "wouter";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="glass-strong mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/logo.png"
                alt="Borrowed Curiosity"
                className="w-10 h-10 object-contain dark:mix-blend-screen dark:brightness-[2.5] dark:drop-shadow-[0_0_6px_rgba(139,92,246,0.4)] mix-blend-multiply brightness-0 dark:brightness-[2.5]"
              />
              <span className="font-display font-bold text-lg">
                Borrowed <span className="text-gradient">Curiosity</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Curiosity borrowed. Wisdom earned.
              Where handcrafted goods, numerology, and creative
              exploration meet.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/blog", label: "Blog" },
                { href: "/store", label: "Store" },
                { href: "/gallery", label: "Gallery" },
                { href: "/threads", label: "Threads" },
                { href: "/gematria", label: "Gematria" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-500 transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Learn
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/calculator", label: "Numerology Calculator" },
                { href: "/compatibility", label: "Compatibility" },
                { href: "/daily", label: "Daily Numerology" },
                { href: "/word-lookup", label: "Word Lookup" },
                { href: "/courses", label: "Free Courses" },
                { href: "/crystals", label: "Crystal Guide" },
                { href: "/gematria", label: "Gematria" },
                { href: "/frequencies", label: "Frequency Generator" },
                { href: "/ask-alta", label: "Ask Alta" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-500 transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/refund-policy", label: "Refund Policy" },
                { href: "/disclaimer", label: "Disclaimer" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-500 transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200/30 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Borrowed Curiosity LLC. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400" /> and a healthy dose of curiosity
          </p>
        </div>
      </div>
    </footer>
  );
}
