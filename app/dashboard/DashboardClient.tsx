"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, Trash2, Copy, Plus, Terminal, Cpu, Database } from "lucide-react"
import { signOut } from "next-auth/react"
import { format } from "date-fns"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/ThemeToggle"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EventDetailsDialog } from "@/components/EventDetailsDialog"

interface Event {
  id: string
  title: string
  description: string | null
  eventDate: Date
  venue: string | null
  capacity: number | null
  eventType: string | null
  isPublic: boolean
  elements: { type: string }[]
  _count: {
    elements: number
  }
}

interface Props {
  initialEvents: Event[]
  user: {
    name?: string | null
    email?: string | null
  }
  plan: "free" | "pro"
}

export function DashboardClient({ initialEvents, user, plan }: Props) {
  const router = useRouter()
  const [events, setEvents] = useState(initialEvents)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  // Removed timeStr state and effect per user request

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    capacity: "",
    eventType: "conference",
  })

  // Data fetching / Mutations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (response.ok) {
        setShowCreateModal(false)
        router.push(`/events/${data.event.id}`)
        router.refresh()
      } else {
        toast.error(data.error || "Failed to create event")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, { method: "DELETE" })
      if (response.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId))
        toast.success("Event deleted")
      } else {
        toast.error("Failed to delete event")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleDuplicate = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/duplicate`, { method: "POST" })
      if (res.ok) {
        const { event } = await res.json()
        setEvents((prev) => [event, ...prev])
        toast.success("Event duplicated")
      } else {
        toast.error("Failed to duplicate event")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      venue: "",
      capacity: "",
      eventType: "conference",
    })
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background font-sans text-foreground selection:bg-foreground selection:text-background">
      {/* Top Navigation Bar */}
      <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6 font-mono text-[10px] tracking-widest uppercase">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-foreground text-lg leading-none font-bold shadow-sm">
              V
            </div>
            <div className="hidden sm:block">
              <div className="mb-1 font-mono text-[9px] leading-none tracking-[0.2em] text-muted-foreground uppercase">
                Event Layout
              </div>
              <div className="text-sm leading-none font-bold tracking-tight uppercase text-foreground">Planner</div>
            </div>
          </Link>

          <div className="hidden h-6 w-[1px] bg-border md:block" />

          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="group relative flex items-center gap-2 font-bold tracking-widest text-foreground uppercase"
            >
              <Database className="h-3.5 w-3.5" />
              <span>Events</span>
              <div className="absolute -bottom-[19px] left-0 h-[2px] w-full bg-foreground" />
            </Link>
            <Link
              href="/marketplace"
              className="group flex items-center gap-2 tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              <Cpu className="h-3.5 w-3.5 transition-colors group-hover:text-foreground" />
              <span>Marketplace</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-muted-foreground">PLAN:</span>
            <span
              className={`border px-1.5 py-0.5 font-bold ${plan === "pro" ? "border-warning bg-warning/10 text-warning" : "border-muted-foreground text-muted-foreground"} tracking-widest`}
            >
              {plan}
            </span>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-muted-foreground">USER:</span>
            <span className="max-w-[120px] truncate border-b border-foreground font-bold text-foreground select-all lg:max-w-none">
              {user.email || user.name}
            </span>
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="flex items-center gap-2 border-l border-border py-1 pl-2 tracking-widest text-muted-foreground uppercase transition-colors hover:text-destructive"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">LOG OUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Canvas */}
      <main className="relative w-full flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header Area */}
          <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
            <div>
              <h1 className="mb-1 text-3xl font-bold tracking-tighter uppercase text-foreground">Events</h1>
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                Total Events: {events.length} {plan === "free" && `(MAX 3)`}
              </p>
            </div>

            {/* Initialize Dialog */}
            <Dialog
              open={showCreateModal}
              onOpenChange={(open) => {
                setShowCreateModal(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button className="h-10 rounded-none border border-border bg-foreground px-5 font-mono text-xs tracking-widest text-background uppercase shadow-none transition-all hover:bg-foreground/80 hover:shadow-sm">
                  + Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl overflow-hidden rounded-none border-2 border-border p-0 shadow-lg bg-card">
                <div className="flex items-center justify-between border-b border-border bg-foreground px-6 py-4 text-background">
                  <DialogTitle className="font-mono text-sm tracking-widest text-background uppercase">
                    New Event
                  </DialogTitle>
                  <Terminal className="h-4 w-4 text-warning" />
                </div>
                <div className="max-h-[80vh] overflow-y-auto px-6 py-6 text-foreground bg-card">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                          Event Name *
                        </label>
                        <Input
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="h-10 rounded-none border-input font-mono text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                          placeholder="Annual Tech Conference 2026"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                          Type
                        </label>
                        <Select
                          value={formData.eventType}
                          onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                        >
                          <SelectTrigger className="h-10 rounded-none border-input font-mono text-sm uppercase">
                            <SelectValue placeholder="SELECT TYPE" />
                          </SelectTrigger>
                          <SelectContent className="rounded-none border-input bg-card font-mono text-xs uppercase">
                            {[
                              "conference",
                              "wedding",
                              "concert",
                              "exhibition",
                              "corporate",
                              "party",
                            ].map((t) => (
                              <SelectItem
                                key={t}
                                value={t}
                                className="cursor-pointer rounded-none focus:bg-foreground focus:text-background"
                              >
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                          Start Date *
                        </label>
                        <Input
                          type="date"
                          required
                          value={formData.eventDate}
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                          className="h-10 rounded-none border-input font-mono text-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                          Start Time
                        </label>
                        <Input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          className="h-10 rounded-none border-input font-mono text-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                          Expected Capacity
                        </label>
                        <Input
                          type="number"
                          value={formData.capacity}
                          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                          className="h-10 rounded-none border-input font-mono text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                          placeholder="e.g. 500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                          Location / Venue
                        </label>
                        <Input
                          value={formData.venue}
                          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                          className="h-10 rounded-none border-input font-mono text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                          placeholder="e.g. Main Hall B"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateModal(false)}
                        className="h-12 flex-1 rounded-none border-input font-mono text-xs tracking-widest uppercase hover:bg-muted"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isCreating}
                        className="h-12 flex-1 rounded-none border border-foreground bg-foreground font-mono text-xs tracking-widest text-background uppercase transition-all shadow-sm hover:bg-foreground/80"
                      >
                        {isCreating ? "Saving..." : "Create Event"}
                      </Button>
                    </div>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Grid display */}
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-border bg-card p-12 text-center">
              <Terminal className="mb-4 h-8 w-8 text-muted-foreground" />
              <p className="mb-6 font-mono text-sm tracking-widest text-muted-foreground uppercase">
                No events found.
              </p>
              <Button
                variant="outline"
                className="rounded-none border-foreground text-foreground font-mono text-xs tracking-widest uppercase hover:bg-muted"
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Event
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group flex flex-col border border-border bg-card shadow-sm transition-colors hover:border-foreground"
                >
                  {/* Top status line */}
                  <div
                    className={`h-1 w-full ${event.isPublic ? "bg-success" : "bg-muted group-hover:bg-info"}`}
                  />

                  <Link href={`/events/${event.id}`} className="block flex-1 p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="mb-1 max-w-[80%] overflow-hidden font-mono text-[10px] tracking-widest text-ellipsis whitespace-nowrap text-muted-foreground uppercase">
                        ID: {event.id.split("-")[0]}
                      </div>
                      {event.isPublic && (
                        <div
                          className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_currentColor] text-success"
                          title="Published"
                        />
                      )}
                    </div>
                    <h3 className="mb-4 line-clamp-2 text-lg font-bold tracking-tight uppercase transition-colors text-foreground group-hover:text-info">
                      {event.title}
                    </h3>

                    <div className="my-4 h-[1px] w-full bg-border" />

                    <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2 font-mono text-xs">
                      <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
                        DATE
                      </span>
                      <span className="text-right font-medium text-foreground">
                        {format(new Date(event.eventDate), "yyyy.MM.dd")}
                      </span>

                      <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
                        TYPE
                      </span>
                      <span className="truncate text-right text-foreground">
                        {event.eventType?.toUpperCase() || "UNKNOWN"}
                      </span>

                      <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
                        ELEMENTS
                      </span>
                      <span className="text-right font-medium text-foreground">{event._count.elements}</span>
                    </div>
                  </Link>

                  {/* Actions Bar */}
                  <div className="flex h-10 divide-x divide-border border-t border-border bg-muted/20">
                    <Link
                      href={`/events/${event.id}`}
                      className="flex flex-1 items-center justify-center font-mono text-[10px] tracking-widest text-muted-foreground uppercase transition-colors hover:bg-foreground hover:text-background"
                    >
                      OPEN
                    </Link>
                    <button
                      onClick={() => handleDuplicate(event.id)}
                      className="flex w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="flex w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md overflow-hidden rounded-none border-2 border-foreground p-0 shadow-[8px_8px_0_0_currentColor] bg-card text-foreground">
                        <div className="border-b border-border bg-destructive px-5 py-3 text-destructive-foreground">
                          <AlertDialogTitle className="font-mono text-xs font-bold tracking-widest uppercase">
                            Delete Event
                          </AlertDialogTitle>
                        </div>
                        <div className="bg-card p-6">
                          <AlertDialogDescription className="mb-6 font-mono text-sm text-foreground">
                            Are you sure you want to delete "{event.title.toUpperCase()}"?
                            <br />
                            <br />
                            <span className="text-muted-foreground">
                              This action cannot be undone. All event elements and data will be
                              removed.
                            </span>
                          </AlertDialogDescription>
                          <AlertDialogFooter className="space-x-4 sm:space-x-4">
                            <AlertDialogCancel className="mt-0 h-10 w-full rounded-none border border-border bg-background font-mono text-xs tracking-widest uppercase text-foreground hover:bg-muted sm:w-1/2">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(event.id)}
                              className="h-10 w-full rounded-none border border-destructive bg-destructive font-mono text-xs tracking-widest text-destructive-foreground uppercase shadow-[2px_2px_0px_currentColor] hover:bg-destructive/90 sm:w-1/2"
                            >
                              Confirm Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Keeping EventDetailsDialog as is for now, but will likely require its own tactical reskin next */}
      {editingEvent && (
        <EventDetailsDialog
          event={editingEvent}
          open={!!editingEvent}
          onOpenChange={(open) => {
            if (!open) setEditingEvent(null)
          }}
          onEventUpdated={(updated) => {
            setEvents((prev) =>
              prev.map((e) => (e.id === updated.id ? { ...e, ...(updated as Event) } : e))
            )
            setEditingEvent(null)
          }}
        />
      )}
    </div>
  )
}
