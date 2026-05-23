'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/lib/db'
import { verifyStaff } from '@/app/lib/dal'

export async function approveUser(userId: string) {
  await verifyStaff()
  await prisma.user.update({ where: { id: userId }, data: { approved: true } })
  revalidatePath('/dashboard/users')
}

export async function revokeUser(userId: string) {
  await verifyStaff()
  await prisma.user.update({ where: { id: userId }, data: { approved: false } })
  revalidatePath('/dashboard/users')
}
