import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/app/generated/prisma/client"
import { format } from "date-fns"
import { sendBidApprovedEmail, sendBidRejectedEmail } from "@/lib/email"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bidId: string }> }
) {
  try {
    const session = await auth()
    const { id: eventId, bidId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const bid = await prisma.boothBid.findFirst({
      where: { id: bidId, eventId },
    })

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 })
    }

    const body = await request.json()
    const { status } = body

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "Status must be approved or rejected" }, { status: 400 })
    }

    // Look up booth name for email subject (shared by both paths)
    const boothElements = await prisma.eventElement.findMany({
      where: { eventId, type: "booth" },
    })
    const boothElement = boothElements.find((el) => {
      const props = el.properties as Record<string, unknown> | null
      return props?.boothId === bid.boothId
    })
    const boothName = boothElement?.name ?? bid.boothId.slice(0, 8)

    if (status === "approved") {
      // Fetch other pending bids BEFORE the transaction so we can email them after
      const otherPendingBids = await prisma.boothBid.findMany({
        where: { eventId, boothId: bid.boothId, status: "pending", id: { not: bidId } },
        select: { vendorName: true, vendorEmail: true },
      })

      await prisma.$transaction(async (tx) => {
        // Approve this bid
        await tx.boothBid.update({ where: { id: bidId }, data: { status: "approved" } })

        // Reject all other pending bids for the same booth
        await tx.boothBid.updateMany({
          where: { eventId, boothId: bid.boothId, status: "pending", id: { not: bidId } },
          data: { status: "rejected" },
        })

        // Update booth element status to 'rented' if found
        if (boothElement) {
          const existingProps = (boothElement.properties as Record<string, unknown>) ?? {}
          await tx.eventElement.update({
            where: { id: boothElement.id },
            data: {
              properties: { ...existingProps, status: "rented" } as Prisma.InputJsonValue,
            },
          })
        }
      })

      // Fire-and-forget emails — don't block the response
      const eventDate = format(new Date(event.eventDate), "MMMM d, yyyy")
      sendBidApprovedEmail({
        vendorName: bid.vendorName,
        vendorEmail: bid.vendorEmail,
        boothName,
        eventTitle: event.title,
        eventDate,
        eventVenue: event.venue,
      }).catch((err) => console.error("Failed to send approval email:", err))

      for (const rejected of otherPendingBids) {
        sendBidRejectedEmail({
          vendorName: rejected.vendorName,
          vendorEmail: rejected.vendorEmail,
          boothName,
          eventTitle: event.title,
        }).catch((err) => console.error("Failed to send rejection email:", err))
      }
    } else {
      await prisma.boothBid.update({ where: { id: bidId }, data: { status: "rejected" } })

      sendBidRejectedEmail({
        vendorName: bid.vendorName,
        vendorEmail: bid.vendorEmail,
        boothName,
        eventTitle: event.title,
      }).catch((err) => console.error("Failed to send rejection email:", err))
    }

    const updatedBid = await prisma.boothBid.findUnique({ where: { id: bidId } })
    return NextResponse.json({ bid: updatedBid })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update bid"
    console.error("Update bid error:", error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
