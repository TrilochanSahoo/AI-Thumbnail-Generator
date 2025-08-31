"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type BillingPeriod = "monthly" | "yearly"

type Plan = {
  name: string
  priceMonthly: number
  description?: string
  features: string[]
  popular?: boolean
  badge?: string
  accent?: "mint" | "sky" | "rose"
}

const accentMap = {
  mint: "bg-emerald-200 text-slate-900",
  sky: "bg-sky-200 text-slate-900",
  rose: "bg-rose-200 text-slate-900",
} as const

interface PricingCardProps extends Plan {
  billing: BillingPeriod
  onSelect?: (plan: string) => void
}

export default function PricingCard({
  name,
  priceMonthly,
  description,
  features,
  popular,
  badge,
  accent = "mint",
  billing,
  onSelect,
}: PricingCardProps) {
  // yearly = 10% off
  const price = billing === "monthly" ? priceMonthly : Math.round(priceMonthly * 12 * 0.9)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      className={cn(
        "relative rounded-xl border bg-card text-card-foreground shadow-sm",
        popular && "ring-2 ring-emerald-300",
      )}
    >
      {popular ? (
        <div className="absolute -top-3 right-3">
          <span className="inline-flex items-center rounded-full bg-emerald-200 px-3 py-1 text-xs font-medium text-slate-900">
            {badge || "Popular"}
          </span>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{name}</h3>
          <span className={cn("rounded-md px-2 py-1 text-xs font-medium", accentMap[accent])}>
            {billing === "yearly" ? "Yearly" : "Monthly"}
          </span>
        </div>

        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}

        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-bold leading-none">${price.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">/ {billing === "yearly" ? "year" : "month"}</span>
        </div>

        <Button
          className={cn(
            "mt-2 w-full",
            popular
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-emerald-500 text-white hover:bg-emerald-600",
          )}
          onClick={() => onSelect?.(name)}
          aria-label={`Choose ${name} plan`}
        >
          {popular ? "Get Advanced" : `Get ${name}`}
        </Button>

        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Free features</p>
          <ul className="space-y-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
