import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/app/lib/session'
import { prisma } from '@/app/lib/db'

export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  // ADMIN and STAFF are always allowed through
  if (session.role !== 'USER') return session

  // USER must be approved
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { approved: true },
  })
  if (!user?.approved) redirect('/pending')

  return session
})

/** ADMIN only */
export const verifyAdmin = cache(async () => {
  const session = await verifySession()
  if (session.role !== 'ADMIN') redirect('/products')
  return session
})

/** ADMIN or STAFF */
export const verifyStaff = cache(async () => {
  const session = await verifySession()
  if (session.role !== 'ADMIN' && session.role !== 'STAFF') redirect('/products')
  return session
})
