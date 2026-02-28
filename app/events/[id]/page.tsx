import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EventEditorClient } from './EventEditorClient'

export default async function EventEditor({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  if (!session?.user?.id) {
    redirect('/auth/signin')
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
    redirect('/dashboard')
  }

  return <EventEditorClient event={event} />
}
