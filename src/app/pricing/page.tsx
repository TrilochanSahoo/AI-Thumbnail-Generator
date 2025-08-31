"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import PricingCard, { type BillingPeriod } from "@/components/pricing-card"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingPeriod>("monthly")

  const plans = useMemo(
    () => [
      {
        name: "Business",
        priceMonthly: 19,
        description: "For solo entrepreneurs",
        features: ["10 inventory locations", "24/7 chat support", "Localized global selling (3 markets)", "POS Lite"],
        accent: "sky" as const,
      },
      {
        name: "Advanced",
        priceMonthly: 299,
        description: "As your business scales",
        features: [
          "Custom reports and analytics",
          "100 inventory locations",
          "Enhanced 24/7 chat support",
          "Localized global selling (9 markets)",
          "3 additional staff accounts",
          "10x checkout capacity",
        ],
        popular: true,
        badge: "Popular",
        accent: "mint" as const,
      },
      {
        name: "Plus",
        priceMonthly: 2300,
        description: "For more complex businesses",
        features: [
          "Custom reports and analytics",
          "200 inventory locations",
          "Priority 24/7 phone support",
          "Localized global selling (50 markets)",
          "Unlimited staff accounts",
          "Fully customizable checkout",
        ],
        accent: "rose" as const,
      },
    ],
    [],
  )

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      {/* Breadcrumb + heading */}
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Settings</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="text-foreground">Plan</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-balance text-3xl font-semibold">Plan</h1>
            <p className="text-muted-foreground">Choose the plan that’s right for you</p>
          </div>

          {/* Billing toggle */}
          <div className="relative">
            <div className="relative inline-flex items-center rounded-full border bg-muted/60 p-1">
              <button
                className={cn(
                  "relative z-10 rounded-full px-4 py-2 text-sm transition-colors",
                  billing === "monthly" ? "text-slate-900 dark:text-slate-900" : "text-muted-foreground",
                )}
                onClick={() => setBilling("monthly")}
              >
                Monthly
              </button>
              <button
                className={cn(
                  "relative z-10 rounded-full px-4 py-2 text-sm transition-colors",
                  billing === "yearly" ? "text-slate-900 dark:text-slate-900" : "text-muted-foreground",
                )}
                onClick={() => setBilling("yearly")}
              >
                Yearly
                <span className="ml-1 rounded-full bg-emerald-200 px-2 py-0.5 text-xs text-slate-900">10% off</span>
              </button>

              <motion.span
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                  "pointer-events-none absolute inset-y-1 left-1 w-1/2 rounded-full bg-white shadow",
                  billing === "yearly" && "translate-x-[calc(100%+0.5rem)]",
                )}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
        }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {plans.map((p) => (
          <motion.div key={p.name} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
            <PricingCard
              {...p}
              billing={billing}
              onSelect={() => {
                // simple CTA route suggestion
                window.location.href = "/sign-up"
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Helper links */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>
          Need a custom plan?{" "}
          <Link href="/contact" className="text-emerald-700 underline hover:text-emerald-800">
            Contact sales
          </Link>
        </p>
        <p>All prices in USD, taxes may apply.</p>
      </div>
    </main>
  )
}
