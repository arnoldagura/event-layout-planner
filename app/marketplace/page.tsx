import { prisma } from '@/lib/prisma'
import { MarketplaceClient } from './MarketplaceClient'

export const metadata = {
  title: 'Booth Marketplace',
  description: 'Discover and bid on available booths at upcoming events.',
}

export interface MarketplaceEvent {
  id: string
  title: string
  description: string | null
  eventDate: string
  venue: string | null
  eventType: string | null
  shareToken: string
  availableBooths: number
  minPrice: number | null
  maxPrice: number | null
  categories: string[]
}

export default async function MarketplacePage() {
  const now = new Date()

  // Fetch all public non-expired events with their booth elements
  const events = await prisma.event.findMany({
    where: {
      isPublic: true,
      OR: [{ shareExpiresAt: null }, { shareExpiresAt: { gt: now } }],
    },
    select: {
      id: true,
      title: true,
      description: true,
      eventDate: true,
      venue: true,
      eventType: true,
      shareToken: true,
      elements: {
        where: { type: 'booth' },
        select: { properties: true },
      },
    },
    orderBy: { eventDate: 'asc' },
  })

  // Build summary per event; only keep events with ≥1 available for-rent booth
  const marketplaceEvents: MarketplaceEvent[] = []

  for (const event of events) {
    if (!event.shareToken) continue

    const forRentBooths = event.elements.filter((el) => {
      const p = (el.properties ?? {}) as Record<string, unknown>
      return p.forRent === true && p.status !== 'rented'
    })

    if (forRentBooths.length === 0) continue

    const prices = forRentBooths
      .map((el) => {
        const p = (el.properties ?? {}) as Record<string, unknown>
        return typeof p.askingPrice === 'number' ? p.askingPrice : null
      })
      .filter((p): p is number => p !== null)

    const categories = Array.from(
      new Set(
        forRentBooths
          .map((el) => {
            const p = (el.properties ?? {}) as Record<string, unknown>
            return typeof p.category === 'string' && p.category ? p.category : null
          })
          .filter((c): c is string => c !== null)
      )
    )

    marketplaceEvents.push({
      id: event.id,
      title: event.title,
      description: event.description,
      eventDate: event.eventDate.toISOString(),
      venue: event.venue,
      eventType: event.eventType,
      shareToken: event.shareToken,
      availableBooths: forRentBooths.length,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      maxPrice: prices.length > 0 ? Math.max(...prices) : null,
      categories,
    })
  }

  return <MarketplaceClient events={marketplaceEvents} />
}
