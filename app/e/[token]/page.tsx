import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PublicEventView } from "./PublicEventView"

interface Props {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props) {
  const { token } = await params
  const event = await prisma.event.findFirst({
    where: { shareToken: token, isPublic: true },
    select: { title: true, description: true, venue: true },
  })

  if (!event) return { title: "Event Not Found" }

  return {
    title: event.title,
    description:
      event.description ??
      `View the layout for ${event.title}${event.venue ? ` at ${event.venue}` : ""}`,
  }
}

export default async function PublicEventPage({ params }: Props) {
  const { token } = await params

  const event = await prisma.event.findFirst({
    where: { shareToken: token, isPublic: true },
    select: {
      id: true,
      title: true,
      description: true,
      eventDate: true,
      startTime: true,
      endTime: true,
      venue: true,
      capacity: true,
      eventType: true,
      shareExpiresAt: true,
      elements: {
        select: {
          id: true,
          type: true,
          name: true,
          x: true,
          y: true,
          width: true,
          height: true,
          rotation: true,
          properties: true,
        },
      },
    },
  })

  if (!event) notFound()

  if (event.shareExpiresAt && new Date() > event.shareExpiresAt) {
    notFound()
  }

  const serialized = {
    ...event,
    eventDate: event.eventDate.toISOString(),
    shareExpiresAt: undefined,
    elements: event.elements.map((el) => ({
      ...el,
      properties: (el.properties as Record<string, unknown>) ?? null,
    })),
  }

  return <PublicEventView event={serialized} shareToken={token} />
}
