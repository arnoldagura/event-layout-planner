import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        layouts: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        elements: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error: any) {
    console.error('Get event error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...body,
        eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
        capacity: body.capacity ? parseInt(body.capacity) : undefined,
      },
    })

    return NextResponse.json({ event: updatedEvent })
  } catch (error: any) {
    console.error('Update event error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update event' },
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
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete event error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete event' },
      { status: 500 }
    )
  }
}
