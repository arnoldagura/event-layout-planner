import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const userEmail = session.user.email ?? undefined

  // Get or create Stripe customer
  let sub = await prisma.subscription.findUnique({ where: { userId } })
  let customerId = sub?.stripeCustomerId ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({ email: userEmail, metadata: { userId } })
    customerId = customer.id
    // Upsert subscription row with customer id
    sub = await prisma.subscription.upsert({
      where: { userId },
      update: { stripeCustomerId: customerId },
      create: { userId, stripeCustomerId: customerId, plan: "free", status: "active" },
    })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { userId },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
