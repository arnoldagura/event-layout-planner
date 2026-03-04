"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Eye, EyeOff, CalendarDays, Sparkles, Download } from "lucide-react"
import { Cormorant_Garamond } from "next/font/google"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

const playfair = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
})

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel ── */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-[45%]"
        style={{
          background: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 25% 65%, rgba(245,158,11,0.14) 0%, transparent 55%), radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "auto, 26px 26px",
        }}
      >
        {/* Amber accent bar */}
        <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-amber-500/60 to-transparent" />

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-lg shadow-amber-900/40">
            <span className="text-base font-bold text-white">E</span>
          </div>
          <span className={`${playfair.className} text-xl font-bold text-white`}>EventPlanner</span>
        </div>

        {/* Quote */}
        <div>
          <p className={`${playfair.className} text-4xl font-normal italic leading-tight text-white/90`}>
            Design your event
            <br />
            <span className="text-amber-400">spaces</span> with
            <br />
            precision.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: CalendarDays, label: "Floor plans for any event type" },
              { icon: Sparkles, label: "AI-generated layout suggestions" },
              { icon: Download, label: "Export to PNG in one click" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5">
                  <Icon className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <span className="text-sm text-zinc-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} EventPlanner. All rights reserved.
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-1 items-center justify-center bg-white px-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <span className={`${playfair.className} text-lg font-bold text-zinc-900`}>
              EventPlanner
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-zinc-900">Welcome back</h2>
          <p className="mt-1 text-sm text-zinc-500">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="border-zinc-200 focus-visible:ring-amber-500/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="border-zinc-200 pr-10 focus-visible:ring-amber-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-500 text-white hover:bg-amber-400"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
