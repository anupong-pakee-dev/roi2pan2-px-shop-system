import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { getSession } from '@/app/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session?.userId || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [products, orders, orderItems, stockLogs] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.order.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.orderItem.findMany(),
    prisma.stockLog.findMany({ orderBy: { createdAt: 'asc' } }),
  ])

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    products: products.map((p) => ({ ...p, price: p.price.toString() })),
    orders: orders.map((o) => ({
      ...o,
      subtotal: o.subtotal.toString(),
      shippingFee: o.shippingFee.toString(),
      total: o.total.toString(),
    })),
    orderItems: orderItems.map((i) => ({
      ...i,
      unitPrice: i.unitPrice.toString(),
      subtotal: i.subtotal.toString(),
    })),
    stockLogs,
  }

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="px_shop_backup_${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
