import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { getSession } from '@/app/lib/session'

type ClearTarget = 'orders' | 'stocklogs' | 'products' | 'all'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { target } = (await req.json()) as { target: ClearTarget }

  try {
    if (target === 'orders' || target === 'all') {
      await prisma.orderItem.deleteMany()
      await prisma.order.deleteMany()
    }
    if (target === 'stocklogs' || target === 'all') {
      await prisma.stockLog.deleteMany()
    }
    if (target === 'products' || target === 'all') {
      await prisma.orderItem.deleteMany()
      await prisma.order.deleteMany()
      await prisma.stockLog.deleteMany()
      await prisma.product.deleteMany()
    }

    const labels: Record<ClearTarget, string> = {
      orders:    'คำสั่งซื้อ',
      stocklogs: 'ประวัติ Stock',
      products:  'สินค้า',
      all:       'ข้อมูลทั้งหมด',
    }

    return NextResponse.json({ message: `ล้าง${labels[target]}สำเร็จ` })
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 })
  }
}
