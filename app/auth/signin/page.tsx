"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Terminal, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
      setError("An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-black font-mono text-white selection:bg-white selection:text-black">
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
          <div className="flex h-8 w-8 items-center justify-center border border-white text-sm font-bold shadow-[2px_2px_0_0_#fff]">
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
          <h1 className="mb-6 text-6xl leading-none font-bold tracking-tighter text-white uppercase">
            DESIGN
            <br />
            <span className="text-[#999]">BEAUTIFUL</span>
            <br />
            EVENT SPACES
          </h1>
          <div className="space-y-2 text-xs leading-loose tracking-widest text-[#999] uppercase">
            <p>{">"} SIGN IN TO ACCESS YOUR DASHBOARD</p>
            <p>{">"} MANAGE YOUR EVENTS AND FLOOR PLANS</p>
            <p>{">"} SECURE CONNECTION ESTABLISHED</p>
          </div>
        </div>

        <div className="z-10 flex items-end justify-between border-t border-[#333] pt-6">
          <div className="text-right text-[10px] tracking-widest text-[#666] uppercase">
            V 2.0.4 <br /> EVENT_PLANNER
          </div>
        </div>
      </div>

      <div className="relative flex w-full flex-col justify-center bg-black px-8 py-12 lg:w-1/2 lg:px-24 xl:px-32">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-12 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center border border-white text-sm font-bold shadow-[2px_2px_0_0_#fff]">
              V
            </div>
            <span className="text-lg font-bold tracking-widest uppercase">EVENT PLANNER</span>
          </div>

          <div className="mb-8 flex items-center gap-3 border-b border-[#333] pb-4 text-[#0055ff]">
            <Terminal className="h-5 w-5" />
            <h2 className="text-base font-bold tracking-widest uppercase">SIGN IN</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="NAME@COMPANY.COM"
                className="h-12 rounded-none border-[#333] bg-transparent font-mono text-sm tracking-widest text-white uppercase shadow-none transition-all placeholder:text-[#333] focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] tracking-widest text-[#999] uppercase">
                Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-12 rounded-none border-[#333] bg-transparent font-mono text-sm tracking-widest text-white shadow-none transition-all placeholder:text-[#333] focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-none border border-white bg-white text-xs font-bold tracking-widest text-black uppercase shadow-[4px_4px_0_0_#333] transition-all hover:bg-white hover:text-[#0055ff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> SIGNING IN...
                  </span>
                ) : (
                  "SIGN IN"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-12 border-t border-[#333] pt-6 text-center">
            <p className="text-[10px] tracking-widest text-[#666] uppercase">
              DON'T HAVE AN ACCOUNT?{" "}
              <Link
                href="/auth/signup"
                className="ml-2 font-bold text-white underline underline-offset-4 hover:text-[#0055ff]"
              >
                SIGN UP
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
