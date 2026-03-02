'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, LogOut, Trash2, MapPin, Users, Calendar, Pencil, Globe } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { format } from 'date-fns'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
} from '@/components/ui/alert-dialog'
import { EventDetailsDialog } from '@/components/EventDetailsDialog'

interface Event {
  id: string
  title: string
  description: string | null
  eventDate: Date
  venue: string | null
  capacity: number | null
  eventType: string | null
  isPublic: boolean
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
}

export function DashboardClient({ initialEvents, user }: Props) {
  const router = useRouter()
  const [events, setEvents] = useState(initialEvents)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    capacity: '',
    eventType: 'conference',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const { event } = await response.json()
        setShowCreateModal(false)
        toast.success('Event created successfully')
        router.push(`/events/${event.id}`)
        router.refresh()
      } else {
        toast.error('Failed to create event')
      }
    } catch (error) {
      console.error('Failed to create event:', error)
      toast.error('An error occurred while creating the event')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId))
        toast.success('Event deleted successfully')
      } else {
        toast.error('Failed to delete event')
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error('An error occurred while deleting the event')
    }
  }

  const handleEventUpdated = (updated: Event) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      venue: '',
      capacity: '',
      eventType: 'conference',
    })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <nav className="bg-background border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <span className="text-lg font-semibold">Event Layout Planner</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Events</h1>
          <Dialog open={showCreateModal} onOpenChange={(open) => {
            setShowCreateModal(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                    {isCreating ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {events.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <p className="text-muted-foreground mb-4">No events yet</p>
              <Button variant="link" onClick={() => setShowCreateModal(true)}>
                Create your first event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <Card key={event.id} className="group overflow-hidden">
                <Link href={`/events/${event.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium group-hover:text-muted-foreground transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        {event.isPublic && (
                          <Badge className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Published
                          </Badge>
                        )}
                        <Badge variant="secondary">
                          {event.eventType}
                        </Badge>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{format(new Date(event.eventDate), 'MMM d, yyyy')}</span>
                      </div>
                      {event.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.venue}</span>
                        </div>
                      )}
                      {event.capacity && (
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          <span>{event.capacity} people</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Link>
                <CardFooter className="border-t pt-3 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{event._count.elements} elements</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setEditingEvent(event)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Event</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{event.title}&quot;? This action cannot be undone.
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
          onOpenChange={(open) => { if (!open) setEditingEvent(null) }}
          onEventUpdated={(updated) => {
            handleEventUpdated(updated as unknown as Event)
            setEditingEvent(null)
          }}
        />
      )}
    </div>
  )
}
