import { prisma } from "@/lib/prisma"

export const PLAN_LIMITS = {
  free: {
    maxEvents: 3,
    hasAI: false,
    hasVersionHistory: false,
    hasExportPNG: false,
  },
  pro: {
    maxEvents: Infinity,
    hasAI: true,
    hasVersionHistory: true,
    hasExportPNG: true,
  },
}

export type Plan = keyof typeof PLAN_LIMITS

export async function getUserPlan(userId: string): Promise<Plan> {
  const sub = await prisma.subscription.findUnique({ where: { userId } })
  if (sub?.plan === "pro" && sub.status === "active") return "pro"
  return "free"
}
