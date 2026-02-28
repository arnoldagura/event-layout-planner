'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Loader2, Calendar, MapPin, Users, Type, FileText, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EventDetails {
  id: string
  title: string
  description: string | null
  eventDate: Date
  venue: string | null
  capacity: number | null
  eventType: string | null
}

interface Props {
  event: EventDetails
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventUpdated?: (updatedEvent: EventDetails) => void
}

const EVENT_TYPES = [
  { value: 'conference', label: 'Conference', icon: '🎤' },
  { value: 'wedding', label: 'Wedding', icon: '💒' },
  { value: 'concert', label: 'Concert', icon: '🎵' },
  { value: 'exhibition', label: 'Exhibition', icon: '🖼️' },
  { value: 'workshop', label: 'Workshop', icon: '🛠️' },
  { value: 'corporate', label: 'Corporate', icon: '💼' },
  { value: 'party', label: 'Party', icon: '🎉' },
  { value: 'other', label: 'Other', icon: '📋' },
]

export function EventDetailsDialog({ event, open, onOpenChange, onEventUpdated }: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    venue: '',
    capacity: '',
    eventType: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form when dialog opens or event changes
  useEffect(() => {
    if (open && event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        eventDate: event.eventDate ? format(new Date(event.eventDate), 'yyyy-MM-dd') : '',
        venue: event.venue || '',
        capacity: event.capacity?.toString() || '',
        eventType: event.eventType || '',
      })
      setErrors({})
    }
  }, [open, event])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required'
    }

    if (formData.capacity && (isNaN(Number(formData.capacity)) || Number(formData.capacity) < 1)) {
      newErrors.capacity = 'Capacity must be a positive number'
    }

    if (formData.capacity && Number(formData.capacity) > 100000) {
      newErrors.capacity = 'Capacity seems too large'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          eventDate: formData.eventDate,
          venue: formData.venue.trim() || null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          eventType: formData.eventType || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update event')
      }

      const data = await response.json()

      toast.success('Event details updated')
      onOpenChange(false)

      if (onEventUpdated) {
        onEventUpdated(data.event)
      }

      router.refresh()
    } catch (error) {
      console.error('Failed to update event:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            Edit Event Details
          </DialogTitle>
          <DialogDescription>
            Update your event information. These details help the AI generate better layout suggestions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-zinc-500" />
              Event Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter event title"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-zinc-500" />
              Description
              <span className="text-xs text-zinc-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your event..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Date and Type row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate" className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                Event Date
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleChange('eventDate', e.target.value)}
                aria-invalid={!!errors.eventDate}
              />
              {errors.eventDate && (
                <p className="text-xs text-red-500">{errors.eventDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType" className="flex items-center gap-2">
                Event Type
              </Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => handleChange('eventType', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Venue and Capacity row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue" className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                Venue
                <span className="text-xs text-zinc-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                placeholder="Event location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity" className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                Capacity
                <span className="text-xs text-zinc-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                placeholder="Expected guests"
                aria-invalid={!!errors.capacity}
              />
              {errors.capacity && (
                <p className="text-xs text-red-500">{errors.capacity}</p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
