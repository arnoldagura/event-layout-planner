import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const { id: eventId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const bids = await prisma.boothBid.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ bids })
  } catch (error: any) {
    console.error("List bids error:", error)
    return NextResponse.json({ error: error.message || "Failed to list bids" }, { status: 500 })
  }
}
