import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/app/generated/prisma/client"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const { id: eventId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, name, x, y, width, height, rotation, properties } = body

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: session.user.id,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const element = await prisma.eventElement.create({
      data: {
        eventId,
        type,
        name,
        x: parseFloat(x),
        y: parseFloat(y),
        width: parseFloat(width),
        height: parseFloat(height),
        rotation: rotation ? parseFloat(rotation) : 0,
        properties: properties || {},
      },
    })

    return NextResponse.json({ element }, { status: 201 })
  } catch (error: any) {
    console.error("Create element error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create element" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const { id: eventId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { elementId, ...updates } = body

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: session.user.id,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const element = await prisma.eventElement.update({
      where: { id: elementId },
      data: {
        ...updates,
        x: updates.x ? parseFloat(updates.x) : undefined,
        y: updates.y ? parseFloat(updates.y) : undefined,
        width: updates.width ? parseFloat(updates.width) : undefined,
        height: updates.height ? parseFloat(updates.height) : undefined,
        rotation: updates.rotation !== undefined ? parseFloat(updates.rotation) : undefined,
      },
    })

    return NextResponse.json({ element })
  } catch (error: any) {
    console.error("Update element error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update element" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: eventId } = await params
    const { searchParams } = new URL(request.url)
    const elementId = searchParams.get("elementId")

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!elementId) {
      return NextResponse.json({ error: "Element ID required" }, { status: 400 })
    }

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: session.user.id,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    await prisma.eventElement.delete({
      where: { id: elementId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete element error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete element" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await request.json()
    const elements: Array<{
      type: string
      name: string
      x: number
      y: number
      width: number
      height: number
      rotation: number
      properties?: Record<string, unknown> | null
    }> = body.elements ?? []

    await prisma.$transaction([
      prisma.eventElement.deleteMany({ where: { eventId } }),
      prisma.eventElement.createMany({
        data: elements.map((el) => ({
          type: el.type,
          name: el.name,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          rotation: el.rotation ?? 0,
          eventId,
          properties:
            el.properties != null ? (el.properties as Prisma.InputJsonValue) : Prisma.JsonNull,
        })),
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Replace elements error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to replace elements" },
      { status: 500 }
    )
  }
}
