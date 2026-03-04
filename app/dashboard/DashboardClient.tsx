"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  LogOut,
  Trash2,
  MapPin,
  Users,
  Calendar,
  Pencil,
  Globe,
  Copy,
  ArrowUpDown,
  ShoppingBag,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { format } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

const TYPE_COLORS: Record<string, string> = {
  stage: "bg-blue-100 text-blue-700",
  table: "bg-amber-100 text-amber-700",
  chair: "bg-zinc-100 text-zinc-600",
  booth: "bg-teal-100 text-teal-700",
  entrance: "bg-emerald-100 text-emerald-700",
  exit: "bg-red-100 text-red-700",
  restroom: "bg-slate-100 text-slate-600",
  bar: "bg-orange-100 text-orange-700",
  registration: "bg-cyan-100 text-cyan-700",
}

function elementTypeSummary(elements: { type: string }[]) {
  const counts: Record<string, number> = {}
  for (const el of elements) counts[el.type] = (counts[el.type] ?? 0) + 1
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

interface Props {
  initialEvents: Event[]
  user: {
    name?: string | null
    email?: string | null
  }
}

export function DashboardClient({ initialEvents, user }: Props) {
  const router = useRouter()
  const [events, setEvents] = useState(initialEvents)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "event-date" | "title">("newest")
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "unpublished">("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    capacity: "",
    eventType: "conference",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const { event } = await response.json()
        setShowCreateModal(false)
        toast.success("Event created successfully")
        router.push(`/events/${event.id}`)
        router.refresh()
      } else {
        toast.error("Failed to create event")
      }
    } catch (error) {
      console.error("Failed to create event:", error)
      toast.error("An error occurred while creating the event")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId))
        toast.success("Event deleted successfully")
      } else {
        toast.error("Failed to delete event")
      }
    } catch (error) {
      console.error("Failed to delete event:", error)
      toast.error("An error occurred while deleting the event")
    }
  }

  const handleEventUpdated = (updated: Event) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      venue: "",
      capacity: "",
      eventType: "conference",
    })
  }

  const handleDuplicate = async (eventId: string) => {
    setDuplicatingId(eventId)
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
    } finally {
      setDuplicatingId(null)
    }
  }

  // Derive filtered + sorted list (client-side, no extra fetch)
  const visibleEvents = events
    .filter((e) => {
      if (filterStatus === "published" && !e.isPublic) return false
      if (filterStatus === "unpublished" && e.isPublic) return false
      if (filterType !== "all" && e.eventType !== filterType) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      if (sortBy === "oldest")
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      if (sortBy === "event-date")
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      if (sortBy === "title") return a.title.localeCompare(b.title)
      return 0
    })

  // Collect unique event types for the filter dropdown
  const eventTypes = Array.from(new Set(events.map((e) => e.eventType).filter(Boolean))) as string[]

  return (
    <div className="min-h-screen bg-muted/30">
      <nav className="border-b bg-background">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-14 items-center justify-between">
            <span className="text-lg font-semibold">Event Layout Planner</span>
            <div className="flex items-center gap-3">
              <Link
                href="/marketplace"
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ShoppingBag className="h-4 w-4" />
                Marketplace
              </Link>
              <span className="text-muted-foreground/40">|</span>
              <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Events</h1>
          <Dialog
            open={showCreateModal}
            onOpenChange={(open) => {
              setShowCreateModal(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Annual Conference 2024"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="Optional description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventType">Type</Label>
                    <Select
                      value={formData.eventType}
                      onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                    >
                      <SelectTrigger id="eventType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="concert">Concert</SelectItem>
                        <SelectItem value="exhibition">Exhibition</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="party">Party</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Grand Ballroom, City Hotel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="100"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sort / Filter bar */}
        {events.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="event-date">By event date</SelectItem>
                <SelectItem value="title">Title A–Z</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}
            >
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="unpublished">Unpublished</SelectItem>
              </SelectContent>
            </Select>

            {eventTypes.length > 1 && (
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {eventTypes.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {(filterStatus !== "all" || filterType !== "all") && (
              <button
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                onClick={() => {
                  setFilterStatus("all")
                  setFilterType("all")
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {visibleEvents.length === 0 && events.length > 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <p className="text-sm text-muted-foreground">No events match the current filters.</p>
            </CardContent>
          </Card>
        ) : visibleEvents.length === 0 ? (
          <Card className="py-16 text-center">
            <CardContent>
              <p className="mb-4 text-muted-foreground">No events yet</p>
              <Button variant="link" onClick={() => setShowCreateModal(true)}>
                Create your first event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((event) => (
              <Card key={event.id} className="group overflow-hidden">
                <Link href={`/events/${event.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium transition-colors group-hover:text-muted-foreground">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        {event.isPublic && (
                          <Badge className="flex items-center gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
                            <Globe className="h-3 w-3" />
                            Published
                          </Badge>
                        )}
                        <Badge variant="secondary">{event.eventType}</Badge>
                      </div>
                    </div>
                    {event.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(event.eventDate), "MMM d, yyyy")}</span>
                      </div>
                      {event.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{event.venue}</span>
                        </div>
                      )}
                      {event.capacity && (
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          <span>{event.capacity} people</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Link>
                <CardFooter className="flex flex-col gap-2 border-t pt-3">
                  {/* Element type breakdown */}
                  {event._count.elements > 0 ? (
                    <div className="flex w-full flex-wrap gap-1">
                      {elementTypeSummary(event.elements)
                        .slice(0, 4)
                        .map(([type, count]) => (
                          <span
                            key={type}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${TYPE_COLORS[type] ?? "bg-zinc-100 text-zinc-600"}`}
                          >
                            {count}× {type}
                          </span>
                        ))}
                      {elementTypeSummary(event.elements).length > 4 && (
                        <span className="px-1 text-[10px] text-muted-foreground">
                          +{elementTypeSummary(event.elements).length - 4} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="w-full text-xs text-muted-foreground">No elements yet</span>
                  )}

                  {/* Actions row */}
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {event._count.elements} elements
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground"
                        disabled={duplicatingId === event.id}
                        onClick={(e) => {
                          e.preventDefault()
                          handleDuplicate(event.id)
                        }}
                        title="Duplicate event"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setEditingEvent(event)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{event.title}&quot;? This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(event.id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {editingEvent && (
        <EventDetailsDialog
          event={editingEvent}
          open={!!editingEvent}
          onOpenChange={(open) => {
            if (!open) setEditingEvent(null)
          }}
          onEventUpdated={(updated) => {
            handleEventUpdated(updated as unknown as Event)
            setEditingEvent(null)
          }}
        />
      )}
    </div>
  )
}
