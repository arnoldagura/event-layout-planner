import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/app/generated/prisma/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bidId: string }> }
) {
  try {
    const session = await auth()
    const { id: eventId, bidId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const bid = await prisma.boothBid.findFirst({
      where: { id: bidId, eventId },
    })

    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 })
    }

    const body = await request.json()
    const { status } = body

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'Status must be approved or rejected' }, { status: 400 })
    }

    if (status === 'approved') {
      // Find the booth element by boothId in properties
      const boothElements = await prisma.eventElement.findMany({
        where: { eventId, type: 'booth' },
      })
      const boothElement = boothElements.find((el) => {
        const props = el.properties as Record<string, unknown> | null
        return props?.boothId === bid.boothId
      })

      await prisma.$transaction(async (tx) => {
        // Approve this bid
        await tx.boothBid.update({ where: { id: bidId }, data: { status: 'approved' } })

        // Reject all other pending bids for the same booth
        await tx.boothBid.updateMany({
          where: { eventId, boothId: bid.boothId, status: 'pending', id: { not: bidId } },
          data: { status: 'rejected' },
        })

        // Update booth element status to 'rented' if found
        if (boothElement) {
          const existingProps = (boothElement.properties as Record<string, unknown>) ?? {}
          await tx.eventElement.update({
            where: { id: boothElement.id },
            data: {
              properties: { ...existingProps, status: 'rented' } as Prisma.InputJsonValue,
            },
          })
        }
      })
    } else {
      await prisma.boothBid.update({ where: { id: bidId }, data: { status: 'rejected' } })
    }

    const updatedBid = await prisma.boothBid.findUnique({ where: { id: bidId } })
    return NextResponse.json({ bid: updatedBid })
  } catch (error: any) {
    console.error('Update bid error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update bid' },
      { status: 500 }
    )
  }
}
