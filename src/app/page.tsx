"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, LogIn, UserPlus } from "lucide-react"

// Simple Navbar for the landing page
function Navbar() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span aria-hidden className="inline-block h-6 w-6 rounded-md border border-slate-300 bg-emerald-200" />
          <span className="font-semibold tracking-tight text-slate-900">PixelForge</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-700 md:flex">
          <a href="/playground" className="hover:text-slate-900">
            Get Started
          </a>
          <a href="/pricing" className="hover:text-slate-900">
            Pricing
          </a>
          <a href="#contact" className="hover:text-slate-900">
            Contact
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-emerald-200 px-3 py-2 text-sm text-slate-900 hover:bg-emerald-300"
          >
            <UserPlus className="h-4 w-4" />
            Sign up
          </Link>
        </div>
      </div>
    </header>
  )
}

type CardData = { src: string; label: string; tint: string; rotate: number }

function ArtCard({ src, label, tint, rotate, i }: CardData & { i: number }) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 18, rotate }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true }}
      transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 120, damping: 16 }}
      whileHover={{ y: -8, rotate: rotate + 2, scale: 1.03 }}
      className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border border-slate-300 shadow-md"
      aria-label={label}
      role="img"
    >
      <div className={`absolute inset-0 hover:shadow-[0_4px_20px_3px_${tint}] transition-shadow`} />
      <img
        src={src || "/placeholder.svg"}
        alt={label}
        className="h-full w-full object-cover mix-blend-multiply"
        crossOrigin="anonymous"
      />
      <figcaption className="pointer-events-none absolute bottom-2 left-2 rounded-md border border-slate-300 bg-white/85 px-2 py-1 text-xs text-slate-800">
        {label}
      </figcaption>
    </motion.figure>
  )
}

export default function LandingPage() {
  // Five-card rail; images come from placeholders and will be tinted with soft pastels
  const cards: CardData[] = [
    { src: "/gemini-native-image1.png", label: "@coplin", tint: "#bae6fd", rotate: -6 }, // sky-200
    { src: "/gemini-native-image2.png", label: "Poster", tint: "#fecaca", rotate: -2 }, // rose-200
    { src: "/gemini-native-image3.png", label: "Cover", tint: "#bbf7d0", rotate: 0 }, // mint-200
    { src: "/gemini-native-image4.png", label: "Concept", tint: "#e2e8f0", rotate: 6 }, // slate-200 (neutral)
    { src: "/gemini-native-image5.png", label: "@andrea", tint: "#bae6fd", rotate: 10 }, // sky-200
  ]

  return (
    <main className="min-h-dvh bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pt-16 pb-24">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-balance text-center text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl"
        >
          Generate & Share AI Images Instantly.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.06, duration: 0.6, ease: "easeOut" }}
          className="mx-auto mt-5 max-w-2xl text-center leading-relaxed text-slate-600"
        >
          Turn your ideas into stunning visuals with Gemini-powered AI and Cloudinary hosting. Fast, reliable, and ready to share anywhere.
        </motion.p>

        {/* Animated card rail */}
        <div className="mt-12 flex w-full justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 md:gap-6"
          >
            {cards.map((c, i) => (
              <ArtCard key={i} i={i} {...c} />
            ))}
          </motion.div>
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          {/* <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-emerald-200 px-5 py-3 text-slate-900 hover:bg-emerald-300"
          >
            Join for $9.99/m
            <ArrowRight className="h-4 w-4" />
          </Link> */}
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-slate-800 hover:bg-slate-50"
          >
            Sign in
          </Link>
        </motion.div>
      </section>

      {/* Optional: show provided mock as reference using the Source URL (as requested) */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-xl border border-slate-200 bg-sky-200/20 p-4">
          <p className="mb-3 text-sm text-slate-600">Step in and track your prompts, view generated images, and manage your uploads in one simple interface.</p>
          <img
            src="image.png"
            className="w-full rounded-lg border border-slate-200"
          />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} PixelForge</span>
          <div className="flex gap-4">
            <Link href="/sign-in" className="hover:text-slate-700">
              Sign in
            </Link>
            <Link href="/sign-up" className="hover:text-slate-700">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
