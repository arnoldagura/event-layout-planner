import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/app/generated/prisma/client"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; num: string }> }
) {
  try {
    const session = await auth()
    const { id: eventId, num } = await params
    const versionNum = parseInt(num, 10)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (isNaN(versionNum)) {
      return NextResponse.json({ error: "Invalid version number" }, { status: 400 })
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const version = await prisma.eventVersion.findUnique({
      where: { eventId_versionNum: { eventId, versionNum } },
    })

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    const snapshot = version.elements as Array<{
      type: string
      name: string
      x: number
      y: number
      width: number
      height: number
      rotation: number
      properties: Record<string, unknown> | null
    }>

    await prisma.$transaction([
      prisma.eventElement.deleteMany({ where: { eventId } }),
      prisma.eventElement.createMany({
        data: snapshot.map((el) => ({
          type: el.type,
          name: el.name,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          rotation: el.rotation,
          eventId,
          properties:
            el.properties !== null ? (el.properties as Prisma.InputJsonValue) : Prisma.JsonNull,
        })),
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Restore version error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to restore version" },
      { status: 500 }
    )
  }
}
