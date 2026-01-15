'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, LogOut, Trash2, MapPin, Users, Calendar } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { format } from 'date-fns'

interface Event {
  id: string
  title: string
  description: string | null
  eventDate: Date
  venue: string | null
  capacity: number | null
  eventType: string | null
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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
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
        router.push(`/events/${event.id}`)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to create event:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <span className="text-lg font-semibold text-slate-900">Event Layout Planner</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{user.name || user.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Events</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>

        {initialEvents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded border border-slate-200">
            <p className="text-slate-600 mb-4">No events yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-sm text-slate-900 font-medium hover:underline"
            >
              Create your first event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialEvents.map((event) => (
              <div key={event.id} className="bg-white rounded border border-slate-200 overflow-hidden group">
                <Link href={`/events/${event.id}`} className="block p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-slate-900 group-hover:text-slate-600 transition-colors">
                      {event.title}
                    </h3>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {event.eventType}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{event.description}</p>
                  )}
                  <div className="space-y-1.5 text-sm text-slate-500">
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
                </Link>
                <div className="border-t border-slate-100 px-5 py-3 flex justify-between items-center">
                  <span className="text-xs text-slate-400">{event._count.elements} elements</span>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">New Event</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  placeholder="Annual Conference 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="conference">Conference</option>
                    <option value="wedding">Wedding</option>
                    <option value="concert">Concert</option>
                    <option value="exhibition">Exhibition</option>
                    <option value="corporate">Corporate</option>
                    <option value="party">Party</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  placeholder="Grand Ballroom, City Hotel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  placeholder="100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 disabled:bg-slate-400 transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
