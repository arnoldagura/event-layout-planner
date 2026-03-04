import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const cs = event.data.object as Stripe.Checkout.Session
      const userId = cs.metadata?.userId
      if (!userId || !cs.subscription) break
      const stripeSub = await stripe.subscriptions.retrieve(cs.subscription as string)
      const sub = stripeSub as unknown as { id: string; items: { data: Array<{ price: { id: string } }> }; current_period_end: number }
      await prisma.subscription.upsert({
        where: { userId },
        update: {
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items.data[0]?.price.id,
          plan: "pro",
          status: "active",
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
        },
        create: {
          userId,
          stripeCustomerId: cs.customer as string,
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items.data[0]?.price.id,
          plan: "pro",
          status: "active",
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
        },
      })
      break
    }

    case "customer.subscription.updated": {
      const stripeSub = event.data.object as Stripe.Subscription
      const rawSub = stripeSub as unknown as { id: string; status: string; current_period_end?: number }
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: rawSub.id },
        data: {
          status: rawSub.status,
          plan: rawSub.status === "active" ? "pro" : "free",
          currentPeriodEnd: rawSub.current_period_end ? new Date(rawSub.current_period_end * 1000) : null,
        },
      })
      break
    }

    case "customer.subscription.deleted": {
      const stripeSub = event.data.object as Stripe.Subscription
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: stripeSub.id },
        data: { plan: "free", status: "canceled" },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
