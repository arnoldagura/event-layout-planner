import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getUserPlan, PLAN_LIMITS } from "@/lib/plans"

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

    // Plan limit: free users max 3 events
    const plan = await getUserPlan(session.user.id)
    const eventCount = await prisma.event.count({ where: { userId: session.user.id } })
    if (plan === "free" && eventCount >= PLAN_LIMITS.free.maxEvents) {
      return NextResponse.json(
        { error: "Free plan is limited to 3 events. Upgrade to Pro for unlimited events." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, eventDate, endDate, startTime, endTime, venue, capacity, eventType } = body

    if (!title || !eventDate) {
      return NextResponse.json({ error: "Title and event date are required" }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventDate: new Date(eventDate),
        endDate: endDate ? new Date(endDate) : null,
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
