'use server'

import { getSession } from '@/app/lib/session'
import { prisma } from '@/app/lib/db'

/** Returns true if the current user has been approved. */
export async function checkApprovalStatus(): Promise<boolean> {
  const session = await getSession()
  if (!session?.userId) return false
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { approved: true },
  })
  return user?.approved ?? false
}
