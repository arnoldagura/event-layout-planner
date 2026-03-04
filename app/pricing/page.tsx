import { auth } from "@/auth"
import { getUserPlan } from "@/lib/plans"
import { PricingPage } from "@/components/landing/PricingPage"

export default async function Pricing() {
  const session = await auth()
  const isLoggedIn = Boolean(session?.user?.id)
  const currentPlan = isLoggedIn ? await getUserPlan(session!.user!.id!) : "free"

  return <PricingPage isLoggedIn={isLoggedIn} currentPlan={currentPlan} />
}
