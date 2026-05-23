'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/lib/db'
import { verifyStaff } from '@/app/lib/dal'

export async function createAddress(formData: FormData) {
  await verifyStaff()

  const label = (formData.get('label') as string)?.trim()
  const detail = (formData.get('detail') as string)?.trim() ?? ''
  const shippingFee = parseFloat(formData.get('shippingFee') as string)

  if (!label) return { error: 'กรุณากรอกชื่อที่อยู่' }
  if (isNaN(shippingFee) || shippingFee < 0) return { error: 'ค่าจัดส่งต้องไม่ติดลบ' }

  const maxSort = await prisma.address.aggregate({ _max: { sortOrder: true } })
  const sortOrder = (maxSort._max.sortOrder ?? 0) + 1

  await prisma.address.create({ data: { label, detail, shippingFee, sortOrder } })
  revalidatePath('/dashboard/addresses')
  revalidatePath('/orders/new')
}

export async function deleteAddress(id: string) {
  await verifyStaff()
  await prisma.address.delete({ where: { id } })
  revalidatePath('/dashboard/addresses')
  revalidatePath('/orders/new')
}

export async function toggleAddress(id: string, isActive: boolean) {
  await verifyStaff()
  await prisma.address.update({ where: { id }, data: { isActive } })
  revalidatePath('/dashboard/addresses')
  revalidatePath('/orders/new')
}
