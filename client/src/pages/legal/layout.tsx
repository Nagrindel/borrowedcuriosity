import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, type LucideIcon } from "lucide-react";

const fade = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

interface LegalLayoutProps {
  icon: LucideIcon;
  title: string;
  updated: string;
  children: React.ReactNode;
}

export default function LegalLayout({ icon: Icon, title, updated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fade}>
            <Link href="/">
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-400 transition-colors cursor-pointer mb-8">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
              </span>
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold">{title}</h1>
                <p className="text-xs text-gray-500">Last updated: {updated}</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 sm:p-8 space-y-8">
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                This document applies to the website and services operated by Borrowed Curiosity LLC.
                By using our website, you agree to the terms outlined below.
              </p>
              {children}
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-xs text-gray-500">
              <Link href="/privacy"><span className="hover:text-brand-400 transition-colors cursor-pointer">Privacy Policy</span></Link>
              <span className="text-gray-700">|</span>
              <Link href="/terms"><span className="hover:text-brand-400 transition-colors cursor-pointer">Terms of Service</span></Link>
              <span className="text-gray-700">|</span>
              <Link href="/refund-policy"><span className="hover:text-brand-400 transition-colors cursor-pointer">Refund Policy</span></Link>
              <span className="text-gray-700">|</span>
              <Link href="/disclaimer"><span className="hover:text-brand-400 transition-colors cursor-pointer">Disclaimer</span></Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
