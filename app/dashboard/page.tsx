import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getUserPlan } from "@/lib/plans"
import { DashboardClient } from "./DashboardClient"

export default async function Dashboard() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const events = await prisma.event.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      layouts: true,
      elements: {
        select: { type: true },
      },
      _count: {
        select: {
          elements: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const plan = await getUserPlan(session.user.id)

  return <DashboardClient initialEvents={events} user={session.user} plan={plan} />
}
