"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, LogIn, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type Mode = "sign-in" | "sign-up"

export function AuthForm({ mode }: { mode: Mode }) {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const title = mode === "sign-in" ? "Welcome back" : "Create your account"
  const cta = mode === "sign-in" ? "Sign in" : "Sign up"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast({ title: "Missing info", description: "Please enter email and password." })
      return
    }
    setLoading(true)
    try {
      // Simulate request; replace with your auth call
      await new Promise((r) => setTimeout(r, 900))
      toast({ title: `${cta} successful`, description: "You can now access the app." })
      // window.location.href = "/"
    } catch {
      toast({ title: "Something went wrong", description: "Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="rounded-xl border bg-emerald-50/70 p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-emerald-900">{title}</h1>
        <p className="mb-5 text-sm text-emerald-800/80">
          {mode === "sign-in" ? "Enter your credentials to continue." : "A few details to get you started."}
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-emerald-900">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700/70" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                className="pl-9 bg-white/90"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-emerald-900">
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700/70" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="pl-9 bg-white/90"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gap-2 bg-emerald-400 text-emerald-950 hover:bg-emerald-400/90"
            disabled={loading}
          >
            {mode === "sign-in" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {loading ? "Please wait..." : cta}
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
