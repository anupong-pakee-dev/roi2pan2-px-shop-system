'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/lib/db'
import { verifySession, verifyAdmin, verifyStaff } from '@/app/lib/dal'
import { ProductSchema, StockAdjustSchema, type FormState } from '@/app/lib/definitions'

export async function createProduct(
  state: FormState,
  formData: FormData
) {
  const session = await verifyAdmin()

  const validated = ProductSchema.safeParse({
    name: formData.get('name'),
    sku: formData.get('sku'),
    description: formData.get('description') || undefined,
    price: formData.get('price'),
    stock: formData.get('stock'),
    minStock: formData.get('minStock'),
    category: formData.get('category') || undefined,
    imageUrl: formData.get('imageUrl') || undefined,
    variantGroup: formData.get('variantGroup') || undefined,
    variantLabel: formData.get('variantLabel') || undefined,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const data = validated.data

  const existing = await prisma.product.findUnique({ where: { sku: data.sku } })
  if (existing) {
    return { message: `SKU "${data.sku}" มีอยู่แล้วในระบบ` }
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        price: data.price,
        stock: data.stock,
        minStock: data.minStock,
        category: data.category,
        imageUrl: data.imageUrl,
        variantGroup: data.variantGroup ?? null,
        variantLabel: data.variantLabel ?? null,
      },
    })

    if (data.stock > 0) {
      await prisma.stockLog.create({
        data: {
          productId: product.id,
          type: 'ADD',
          quantity: data.stock,
          before: 0,
          after: data.stock,
          note: 'สต็อกเริ่มต้น',
          userId: session.userId,
        },
      })
    }
  } catch {
    return { message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }
  }

  revalidatePath('/products')
  redirect('/products')
}

export async function updateProduct(
  id: string,
  state: FormState,
  formData: FormData
) {
  await verifyAdmin()

  const validated = ProductSchema.safeParse({
    name: formData.get('name'),
    sku: formData.get('sku'),
    description: formData.get('description') || undefined,
    price: formData.get('price'),
    stock: formData.get('stock'),
    minStock: formData.get('minStock'),
    category: formData.get('category') || undefined,
    imageUrl: formData.get('imageUrl') || undefined,
    variantGroup: formData.get('variantGroup') || undefined,
    variantLabel: formData.get('variantLabel') || undefined,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const data = validated.data

  const existing = await prisma.product.findUnique({ where: { sku: data.sku } })
  if (existing && existing.id !== id) {
    return { message: `SKU "${data.sku}" ถูกใช้งานโดยสินค้าอื่นแล้ว` }
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        price: data.price,
        minStock: data.minStock,
        category: data.category,
        imageUrl: data.imageUrl,
        variantGroup: data.variantGroup ?? null,
        variantLabel: data.variantLabel ?? null,
      },
    })
  } catch {
    return { message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }
  }

  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  redirect(`/products/${id}`)
}

export async function deleteProduct(id: string) {
  await verifyAdmin()

  try {
    await prisma.product.delete({ where: { id } })
  } catch {
    return { message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }
  }

  revalidatePath('/products')
  redirect('/products')
}

export async function adjustStock(
  productId: string,
  state: FormState,
  formData: FormData
) {
  const session = await verifyStaff()

  const validated = StockAdjustSchema.safeParse({
    type: formData.get('type'),
    quantity: formData.get('quantity'),
    note: formData.get('note') || undefined,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { type, quantity, note } = validated.data

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return { message: 'ไม่พบสินค้า' }

    const before = product.stock
    let after: number

    if (type === 'ADD') {
      after = before + quantity
    } else if (type === 'SUBTRACT') {
      after = Math.max(0, before - quantity)
    } else {
      after = quantity
    }

    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { stock: after },
      }),
      prisma.stockLog.create({
        data: {
          productId,
          type,
          quantity,
          before,
          after,
          note,
          userId: session.userId,
        },
      }),
    ])
  } catch {
    return { message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }
  }

  revalidatePath(`/products/${productId}`)
  revalidatePath('/products')
  revalidatePath('/dashboard')
}
