'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/lib/db'
import { verifySession, verifyAdmin, verifyStaff } from '@/app/lib/dal'
import type { OrderCreateInput } from '@/app/lib/definitions'
import type { OrderStatus } from '@prisma/client'

export async function createOrder(
  input: OrderCreateInput
): Promise<{ error: string } | { orderId: string }> {
  const session = await verifySession()

  const address = await prisma.address.findFirst({
    where: { id: input.addressId, isActive: true },
  })
  if (!address) return { error: 'ที่อยู่ไม่ถูกต้อง' }
  if (!input.items.length) return { error: 'กรุณาเลือกสินค้าอย่างน้อย 1 ชนิด' }

  const productIds = input.items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })

  const productMap = new Map(products.map((p) => [p.id, p]))

  for (const item of input.items) {
    const product = productMap.get(item.productId)
    if (!product) return { error: `ไม่พบสินค้า (${item.productId})` }
    if (product.stock < item.quantity) {
      return { error: `สินค้า "${product.name}" มีสต็อกไม่เพียงพอ (มี ${product.stock} ชิ้น)` }
    }
  }

  const subtotal = input.items.reduce((sum, item) => {
    const price = Number(productMap.get(item.productId)!.price)
    return sum + price * item.quantity
  }, 0)
  const shippingFee = Number(address.shippingFee)
  const total = subtotal + shippingFee

  let orderId: string

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: session.userId,
          addressId: input.addressId,
          addressLabel: address.label,
          subtotal,
          shippingFee,
          total,
          note: input.note,
          items: {
            create: input.items.map((item) => {
              const product = productMap.get(item.productId)!
              const unitPrice = Number(product.price)
              return {
                productId: item.productId,
                productName: product.name,
                sku: product.sku,
                quantity: item.quantity,
                unitPrice,
                subtotal: unitPrice * item.quantity,
              }
            }),
          },
        },
      })

      for (const item of input.items) {
        const product = productMap.get(item.productId)!
        const before = product.stock
        const after = before - item.quantity

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: after },
        })

        await tx.stockLog.create({
          data: {
            productId: item.productId,
            type: 'SUBTRACT',
            quantity: item.quantity,
            before,
            after,
            note: `คำสั่งซื้อ #${created.id.slice(-6).toUpperCase()}`,
            userId: session.userId,
          },
        })
      }

      return created
    })

    orderId = order.id
  } catch {
    return { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }
  }

  revalidatePath('/orders')
  revalidatePath('/products')
  revalidatePath('/dashboard')
  return { orderId }
}

export async function cancelOrder(orderId: string) {
  const session = await verifySession()

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) return { error: 'ไม่พบคำสั่งซื้อ' }
  if (order.userId !== session.userId && session.role !== 'ADMIN') {
    return { error: 'ไม่มีสิทธิ์ยกเลิกคำสั่งซื้อนี้' }
  }
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    return { error: 'ไม่สามารถยกเลิกคำสั่งซื้อในสถานะนี้ได้' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } })

      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        if (!product) continue
        const before = product.stock
        const after = before + item.quantity

        await tx.product.update({ where: { id: item.productId }, data: { stock: after } })
        await tx.stockLog.create({
          data: {
            productId: item.productId,
            type: 'ADD',
            quantity: item.quantity,
            before,
            after,
            note: `ยกเลิกคำสั่งซื้อ #${orderId.slice(-6).toUpperCase()}`,
            userId: session.userId,
          },
        })
      }
    })
  } catch {
    return { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }
  }

  revalidatePath('/orders')
  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/products')
  revalidatePath('/dashboard')
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const session = await verifyStaff()

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })
  if (!order) return { error: 'ไม่พบคำสั่งซื้อ' }
  if (order.status === 'CANCELLED') return { error: 'ไม่สามารถเปลี่ยนสถานะคำสั่งซื้อที่ยกเลิกแล้ว' }

  try {
    if (status === 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id: orderId }, data: { status } })

        for (const item of order.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } })
          if (!product) continue
          const before = product.stock
          const after = before + item.quantity
          await tx.product.update({ where: { id: item.productId }, data: { stock: after } })
          await tx.stockLog.create({
            data: {
              productId: item.productId,
              type: 'ADD',
              quantity: item.quantity,
              before,
              after,
              note: `Admin ยกเลิกคำสั่งซื้อ #${orderId.slice(-6).toUpperCase()}`,
              userId: session.userId,
            },
          })
        }
      })
    } else {
      await prisma.order.update({ where: { id: orderId }, data: { status } })
    }
  } catch {
    return { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }
  }

  revalidatePath('/dashboard/orders')
  revalidatePath(`/dashboard/orders/${orderId}`)
  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/products')
}
