import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; boothId: string }> }
) {
  try {
    const { token, boothId } = await params

    const event = await prisma.event.findFirst({
      where: { shareToken: token, isPublic: true },
      include: { elements: true },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.shareExpiresAt && event.shareExpiresAt < new Date()) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 410 })
    }

    // Find the booth element with matching boothId in properties
    const boothElement = event.elements.find((el) => {
      const props = el.properties as Record<string, unknown> | null
      return el.type === 'booth' && props?.boothId === boothId && props?.forRent === true
    })

    if (!boothElement) {
      return NextResponse.json({ error: 'Booth not found or not available for rent' }, { status: 404 })
    }

    const props = boothElement.properties as Record<string, unknown> | null
    if (props?.status === 'rented') {
      return NextResponse.json({ error: 'This booth has already been rented' }, { status: 409 })
    }

    const body = await request.json()
    const { vendorName, vendorEmail, amount, message } = body

    if (!vendorName?.trim()) {
      return NextResponse.json({ error: 'Vendor name is required' }, { status: 400 })
    }
    if (!vendorEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendorEmail)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Bid amount must be a positive number' }, { status: 400 })
    }

    const bid = await prisma.boothBid.create({
      data: {
        boothId,
        eventId: event.id,
        vendorName: vendorName.trim(),
        vendorEmail: vendorEmail.trim().toLowerCase(),
        amount: Number(amount),
        message: message?.trim() || null,
      },
      select: { id: true, boothId: true, amount: true, status: true, createdAt: true },
    })

    return NextResponse.json({ bid }, { status: 201 })
  } catch (error: any) {
    console.error('Submit bid error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit bid' },
      { status: 500 }
    )
  }
}
