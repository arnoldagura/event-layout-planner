import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: eventId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Snapshot current elements (strip DB-managed fields)
    const currentElements = await prisma.eventElement.findMany({
      where: { eventId },
      select: { type: true, name: true, x: true, y: true, width: true, height: true, rotation: true, properties: true },
    })

    // Compute next version number
    const last = await prisma.eventVersion.findFirst({
      where: { eventId },
      orderBy: { versionNum: 'desc' },
      select: { versionNum: true },
    })
    const versionNum = (last?.versionNum ?? 0) + 1

    const version = await prisma.eventVersion.create({
      data: { eventId, versionNum, elements: currentElements },
      select: { id: true, versionNum: true, createdAt: true },
    })

    // Prune to max 20 versions
    const count = await prisma.eventVersion.count({ where: { eventId } })
    if (count > 20) {
      const oldest = await prisma.eventVersion.findFirst({
        where: { eventId },
        orderBy: { versionNum: 'asc' },
        select: { id: true },
      })
      if (oldest) {
        await prisma.eventVersion.delete({ where: { id: oldest.id } })
      }
    }

    return NextResponse.json({ version })
  } catch (error: any) {
    console.error('Create version error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create version' },
      { status: 500 }
    )
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: eventId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const versions = await prisma.eventVersion.findMany({
      where: { eventId },
      orderBy: { versionNum: 'desc' },
      select: { id: true, versionNum: true, createdAt: true },
    })

    return NextResponse.json({ versions })
  } catch (error: any) {
    console.error('List versions error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list versions' },
      { status: 500 }
    )
  }
}
