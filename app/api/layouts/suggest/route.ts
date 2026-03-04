import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { generateLayoutSuggestion } from "@/lib/gemini"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, eventType, capacity, venue, specialRequirements, existingElements } = body

    if (!eventId || !eventType || !capacity) {
      return NextResponse.json(
        { error: "Missing required fields: eventId, eventType, capacity" },
        { status: 400 }
      )
    }

    // Verify the event belongs to the user
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: session.user.id,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Generate AI layout suggestion
    const suggestion = await generateLayoutSuggestion({
      eventType,
      capacity,
      venue,
      specialRequirements,
      existingElements,
    })

    // Save the suggested layout
    const layout = await prisma.eventLayout.create({
      data: {
        eventId,
        name: `AI Suggested Layout - ${new Date().toLocaleString()}`,
        aiGenerated: true,
        aiPrompt: JSON.stringify({
          eventType,
          capacity,
          venue,
          specialRequirements,
        }),
        layoutData: JSON.parse(JSON.stringify(suggestion)),
        isActive: false,
      },
    })

    return NextResponse.json({
      success: true,
      layout,
      suggestion,
    })
  } catch (error) {
    console.error("Layout suggestion error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate layout suggestion" },
      { status: 500 }
    )
  }
}
