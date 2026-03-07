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
    <div className="flex min-h-screen bg-background font-mono text-foreground selection:bg-foreground selection:text-background">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-border p-12 lg:flex">
        <div
          className="absolute inset-0 z-0 opacity-10 dark:opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center border border-foreground text-sm font-bold shadow-sm">
            V
          </div>
          <div className="flex flex-col">
            <div className="mb-1 text-[10px] leading-none tracking-[0.2em] text-muted-foreground uppercase">
              Event Layout
            </div>
            <div className="text-lg leading-none font-bold tracking-tight uppercase text-foreground">Planner</div>
          </div>
        </Link>

        <div className="z-10">
          <h1 className="mb-6 text-6xl leading-none font-bold tracking-tighter text-foreground uppercase">
            DESIGN
            <br />
            <span className="text-muted-foreground">BEAUTIFUL</span>
            <br />
            EVENT SPACES
          </h1>
          <div className="space-y-2 text-xs leading-loose tracking-widest text-muted-foreground uppercase">
            <p>{">"} SIGN IN TO ACCESS YOUR DASHBOARD</p>
            <p>{">"} MANAGE YOUR EVENTS AND FLOOR PLANS</p>
            <p>{">"} SECURE CONNECTION ESTABLISHED</p>
          </div>
        </div>

        <div className="z-10 flex items-end justify-between border-t border-border pt-6">
          <div className="text-right text-[10px] tracking-widest text-muted-foreground uppercase">
            V 2.0.4 <br /> EVENT_PLANNER
          </div>
        </div>
      </div>

      <div className="relative flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-24 xl:px-32">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-12 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center border border-foreground text-sm font-bold shadow-sm">
              V
            </div>
            <span className="text-lg font-bold tracking-widest uppercase">EVENT PLANNER</span>
          </div>

          <div className="mb-8 flex items-center gap-3 border-b border-border pb-4 text-primary">
            <Terminal className="h-5 w-5" />
            <h2 className="text-base font-bold tracking-widest uppercase">SIGN IN</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-3 border border-destructive bg-destructive/10 p-4">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-[11px] font-bold tracking-widest text-destructive uppercase">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-[10px] tracking-widest text-muted-foreground uppercase">
                Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="NAME@COMPANY.COM"
                className="h-12 rounded-none border-input bg-transparent font-mono text-sm tracking-widest text-foreground uppercase shadow-none transition-all placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-foreground"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] tracking-widest text-muted-foreground uppercase">
                Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-12 rounded-none border-input bg-transparent font-mono text-sm tracking-widest text-foreground shadow-none transition-all placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-foreground"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-none border border-foreground bg-foreground text-xs font-bold tracking-widest text-background uppercase shadow-sm transition-all hover:bg-foreground/80 hover:text-background"
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

          <div className="mt-12 border-t border-border pt-6 text-center">
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
              DON'T HAVE AN ACCOUNT?{" "}
              <Link
                href="/auth/signup"
                className="ml-2 font-bold text-foreground underline underline-offset-4 hover:text-primary"
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
