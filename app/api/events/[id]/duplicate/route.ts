import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/app/generated/prisma/client"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const original = await prisma.event.findFirst({
      where: { id, userId: session.user.id },
      include: { elements: true },
    })

    if (!original) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const copy = await prisma.$transaction(async (tx) => {
      const newEvent = await tx.event.create({
        data: {
          title: `${original.title} (Copy)`,
          description: original.description,
          eventDate: original.eventDate,
          startTime: original.startTime,
          endTime: original.endTime,
          venue: original.venue,
          capacity: original.capacity,
          eventType: original.eventType,
          userId: session.user!.id!,
        },
      })

      if (original.elements.length > 0) {
        await tx.eventElement.createMany({
          data: original.elements.map((el) => {
            const props = (el.properties ?? {}) as Record<string, unknown>
            const freshProps =
              el.type === "booth"
                ? { ...props, boothId: crypto.randomUUID(), status: "available" }
                : props

            return {
              eventId: newEvent.id,
              type: el.type,
              name: el.name,
              x: el.x,
              y: el.y,
              width: el.width,
              height: el.height,
              rotation: el.rotation,
              properties: freshProps as Prisma.InputJsonValue,
            }
          }),
        })
      }

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
    console.error("Duplicate event error:", error)
    return NextResponse.json({ error: "Failed to duplicate event" }, { status: 500 })
  }
}
