import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        layouts: true,
        _count: {
          select: {
            elements: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ events })
  } catch (error: any) {
    console.error("Get events error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, eventDate, startTime, endTime, venue, capacity, eventType } = body

    if (!title || !eventDate) {
      return NextResponse.json({ error: "Title and event date are required" }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventDate: new Date(eventDate),
        startTime,
        endTime,
        venue,
        capacity: capacity ? parseInt(capacity) : null,
        eventType,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error: any) {
    console.error("Create event error:", error)
    return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 })
  }
}
