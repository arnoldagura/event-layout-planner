import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const event = await prisma.event.findFirst({
      where: {
        shareToken: token,
        isPublic: true,
      },
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
        publishedAt: true,
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

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check expiry if set
    if (event.shareExpiresAt && new Date() > event.shareExpiresAt) {
      return NextResponse.json({ error: "This link has expired" }, { status: 410 })
    }

    return NextResponse.json(
      { event },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (error: any) {
    console.error("Public event fetch error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch event" }, { status: 500 })
  }
}
