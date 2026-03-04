import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/app/generated/prisma/client'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch original event + its elements (ownership check included)
    const original = await prisma.event.findFirst({
      where: { id, userId: session.user.id },
      include: { elements: true },
    })

    if (!original) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Create the duplicate in a transaction
    const copy = await prisma.$transaction(async (tx) => {
      const newEvent = await tx.event.create({
        data: {
          title:       `${original.title} (Copy)`,
          description: original.description,
          eventDate:   original.eventDate,
          startTime:   original.startTime,
          endTime:     original.endTime,
          venue:       original.venue,
          capacity:    original.capacity,
          eventType:   original.eventType,
          userId:      session.user!.id!,
          // isPublic / shareToken intentionally NOT copied — copy starts unpublished
        },
      })

      if (original.elements.length > 0) {
        await tx.eventElement.createMany({
          data: original.elements.map((el) => {
            // Give booths a fresh stable boothId so bids don't cross over
            const props = (el.properties ?? {}) as Record<string, unknown>
            const freshProps =
              el.type === 'booth'
                ? { ...props, boothId: crypto.randomUUID(), status: 'available' }
                : props

            return {
              eventId:    newEvent.id,
              type:       el.type,
              name:       el.name,
              x:          el.x,
              y:          el.y,
              width:      el.width,
              height:     el.height,
              rotation:   el.rotation,
              properties: freshProps as Prisma.InputJsonValue,
            }
          }),
        })
      }

      // Return the new event with element count for the dashboard
      return tx.event.findUniqueOrThrow({
        where: { id: newEvent.id },
        include: {
          elements: { select: { type: true } },
          _count: { select: { elements: true } },
        },
      })
    })

    return NextResponse.json({ event: copy }, { status: 201 })
  } catch (error: unknown) {
    console.error('Duplicate event error:', error)
    return NextResponse.json({ error: 'Failed to duplicate event' }, { status: 500 })
  }
}
