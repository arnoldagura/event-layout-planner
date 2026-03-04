import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null

    const event = await prisma.event.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // If already published, update expiry and return existing token
    if (event.isPublic && event.shareToken) {
      await prisma.event.update({
        where: { id },
        data: { shareExpiresAt: expiresAt },
      })
      return NextResponse.json({ shareToken: event.shareToken })
    }

    const shareToken = randomBytes(32).toString("hex")

    const updated = await prisma.event.update({
      where: { id },
      data: {
        isPublic: true,
        shareToken,
        publishedAt: new Date(),
        shareExpiresAt: expiresAt,
      },
    })

    return NextResponse.json({ shareToken: updated.shareToken })
  } catch (error: any) {
    console.error("Publish event error:", error)
    return NextResponse.json({ error: error.message || "Failed to publish event" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const event = await prisma.event.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    await prisma.event.update({
      where: { id },
      data: {
        isPublic: false,
        shareToken: null,
        publishedAt: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unpublish event error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to unpublish event" },
      { status: 500 }
    )
  }
}
