import { Link } from "wouter";
import { Heart } from "lucide-react";

const footerLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/store", label: "Store" },
  { href: "/gallery", label: "Gallery" },
  { href: "/courses", label: "Courses" },
  { href: "/threads", label: "Threads" },
  { href: "/calculator", label: "Calculator" },
  { href: "/compatibility", label: "Compatibility" },
  { href: "/daily", label: "Daily" },
  { href: "/crystals", label: "Crystals" },
  { href: "/frequencies", label: "Frequencies" },
  { href: "/identify", label: "Crystal ID" },
  { href: "/journal", label: "Journal" },
  { href: "/stories", label: "Stories" },
  { href: "/quiz", label: "Quiz" },
  { href: "/gematria", label: "Gematria" },
  { href: "/word-lookup", label: "Words" },
  { href: "/ask-alta", label: "Alta" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refunds" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export default function Footer() {
  return (
    <footer className="glass-strong mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Borrowed Curiosity"
              className="w-8 h-8 object-contain dark:mix-blend-screen dark:brightness-[2.5] dark:drop-shadow-[0_0_6px_rgba(139,92,246,0.4)] mix-blend-multiply brightness-0 dark:brightness-[2.5]"
            />
            <span className="font-display font-bold">
              Borrowed <span className="text-gradient">Curiosity</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 sm:ml-auto">
            Curiosity borrowed. Wisdom earned.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-6">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span className="text-xs text-gray-500 dark:text-gray-400 hover:text-brand-500 transition-colors cursor-pointer">
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="pt-5 border-t border-gray-200/30 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-500 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Borrowed Curiosity LLC
          </p>
          <div className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className="text-[11px] text-gray-500 dark:text-gray-500 hover:text-brand-500 transition-colors cursor-pointer">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400" /> and curiosity
          </p>
        </div>
      </div>
    </footer>
  );
}
