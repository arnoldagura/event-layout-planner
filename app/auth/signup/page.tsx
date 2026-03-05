"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Terminal, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
        return
      }

      router.push("/auth/signin?registered=true")
    } catch {
      setError("An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="flex min-h-screen bg-black font-mono text-white selection:bg-white selection:text-black">
      {/* ── Left panel ── */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-[#333] p-12 lg:flex">
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-white text-lg leading-none font-bold shadow-[2px_2px_0_0_#fff]">
            V
          </div>
          <div className="flex flex-col">
            <div className="mb-1 text-[10px] leading-none tracking-[0.2em] text-[#999] uppercase">
              Event Layout
            </div>
            <div className="text-lg leading-none font-bold tracking-tight uppercase">Planner</div>
          </div>
        </Link>

        <div className="z-10">
          <h1 className="mb-6 text-6xl leading-none font-bold tracking-tighter text-[#999] uppercase">
            CREATE
            <br />
            <span className="text-white">YOUR</span>
            <br />
            ACCOUNT
          </h1>
          <div className="space-y-2 text-xs leading-loose tracking-widest text-[#666] uppercase">
            <p>{">"} SECURE REGISTRATION PROCESS</p>
            <p>{">"} DATA IS ENCRYPTED AND PROTECTED</p>
          </div>
        </div>

        <div className="z-10 flex items-end justify-between border-t border-[#333] pt-6">
          <div className="text-right text-[10px] tracking-widest text-[#666] uppercase">
            V 2.0.4 <br /> EVENT_PLANNER
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="relative flex w-full flex-col justify-center bg-black px-8 py-12 lg:w-1/2 lg:px-24 xl:px-32">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-12 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center border border-white text-sm font-bold shadow-[2px_2px_0_0_#fff]">
              V
            </div>
            <span className="text-lg font-bold tracking-widest uppercase">EVENT PLANNER</span>
          </div>

          <div className="mb-8 flex items-center gap-3 border-b border-[#333] pb-4 text-white">
            <Terminal className="h-5 w-5 text-[#ffb300]" />
            <h2 className="text-base font-bold tracking-widest uppercase">SIGN UP</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 border border-[#cc0000] bg-[#cc0000]/10 p-4">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#ff3333]" />
                <p className="text-[11px] font-bold tracking-widest text-[#ff3333] uppercase">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-[10px] tracking-widest text-[#999] uppercase">
                Full Name
              </label>
              <Input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="JOHN DOE"
                className="h-12 rounded-none border-[#333] bg-transparent font-mono text-sm tracking-widest text-white uppercase shadow-none transition-all placeholder:text-[#333] focus-visible:ring-1 focus-visible:ring-white"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] tracking-widest text-[#999] uppercase">
                Email Address
              </label>
              <Input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="NAME@COMPANY.COM"
                className="h-12 rounded-none border-[#333] bg-transparent font-mono text-sm tracking-widest text-white uppercase shadow-none transition-all placeholder:text-[#333] focus-visible:ring-1 focus-visible:ring-white"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] tracking-widest text-[#999] uppercase">
                Password
              </label>
              <Input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="h-12 rounded-none border-[#333] bg-transparent font-mono text-sm tracking-widest text-white shadow-none transition-all placeholder:text-[#333] focus-visible:ring-1 focus-visible:ring-white"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] tracking-widest text-[#999] uppercase">
                Confirm Password
              </label>
              <Input
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="h-12 rounded-none border-[#333] bg-transparent font-mono text-sm tracking-widest text-white shadow-none transition-all placeholder:text-[#333] focus-visible:ring-1 focus-visible:ring-white"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-none border border-white bg-white text-xs font-bold tracking-widest text-black uppercase shadow-[4px_4px_0_0_#333] transition-all hover:bg-white hover:text-[#009944] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> CREATING ACCOUNT...
                  </span>
                ) : (
                  "SIGN UP"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-12 border-t border-[#333] pt-6 text-center">
            <p className="text-[10px] tracking-widest text-[#666] uppercase">
              ALREADY HAVE AN ACCOUNT?{" "}
              <Link
                href="/auth/signin"
                className="ml-2 font-bold text-white underline underline-offset-4 hover:text-[#0055ff]"
              >
                SIGN IN
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
