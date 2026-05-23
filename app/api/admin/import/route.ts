import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { getSession } from '@/app/lib/session'

type BackupProduct = {
  id: string
  name: string
  sku: string
  description?: string | null
  price: string
  stock: number
  minStock: number
  category?: string | null
  imageUrl?: string | null
  createdAt: string
  updatedAt: string
}

type BackupFile = {
  version: number
  products: BackupProduct[]
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: BackupFile
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON ไม่ถูกต้อง' }, { status: 400 })
  }

  if (!body.products || !Array.isArray(body.products)) {
    return NextResponse.json({ error: 'รูปแบบไฟล์ไม่ถูกต้อง (ต้องมี products array)' }, { status: 400 })
  }

  let imported = 0
  let updated = 0

  for (const p of body.products) {
    if (!p.sku || !p.name) continue

    const existing = await prisma.product.findUnique({ where: { sku: p.sku } })
    if (existing) {
      await prisma.product.update({
        where: { sku: p.sku },
        data: {
          name: p.name,
          description: p.description ?? undefined,
          price: parseFloat(p.price) || 0,
          stock: p.stock ?? 0,
          minStock: p.minStock ?? 5,
          category: p.category ?? undefined,
          imageUrl: p.imageUrl ?? undefined,
        },
      })
      updated++
    } else {
      await prisma.product.create({
        data: {
          name: p.name,
          sku: p.sku,
          description: p.description ?? undefined,
          price: parseFloat(p.price) || 0,
          stock: p.stock ?? 0,
          minStock: p.minStock ?? 5,
          category: p.category ?? undefined,
          imageUrl: p.imageUrl ?? undefined,
        },
      })
      imported++
    }
  }

  return NextResponse.json({
    message: `เพิ่มใหม่ ${imported} รายการ, อัปเดต ${updated} รายการ`,
  })
}
