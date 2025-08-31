import Link from "next/link"
import { Sparkles } from "lucide-react"
import { AuthForm } from "@/components/auth-form"

export default function SignUpPage() {
  return (
    <main className="min-h-dvh bg-sky-50">
      <div className="mx-auto grid min-h-dvh max-w-md place-items-center px-4 py-10">
        <div className="flex w-full flex-col items-center gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-300 text-emerald-950">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-semibold text-emerald-900">PixelForge</span>
          </Link>

          <AuthForm mode="sign-up" />

          <p className="text-sm text-emerald-800/80">
            Already have an account?{" "}
            <Link className="font-medium text-emerald-700 hover:underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
