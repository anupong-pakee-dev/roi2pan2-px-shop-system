import { prisma } from './db'

export interface LoginStats {
  productCount: number
  totalStock: number
  activeOrderCount: number
  stockSpark: number[]
  orderSpark: number[]
}

export async function getLoginStats(): Promise<LoginStats> {
  const sixDaysAgo = new Date()
  sixDaysAgo.setUTCDate(sixDaysAgo.getUTCDate() - 6)
  sixDaysAgo.setUTCHours(0, 0, 0, 0)

  const [productCount, stockAgg, activeOrderCount, stockLogs, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.aggregate({ _sum: { stock: true } }),
      prisma.order.count({
        where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] } },
      }),
      prisma.stockLog.findMany({
        where: { createdAt: { gte: sixDaysAgo } },
        select: { createdAt: true, before: true, after: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: sixDaysAgo } },
        select: { createdAt: true },
      }),
    ])

  const totalStock = stockAgg._sum.stock ?? 0

  // 7-day key array: index 0 = 6 days ago, index 6 = today
  const dayKeys = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })

  // Net stock change per day
  const netByDay = new Map<string, number>()
  for (const log of stockLogs) {
    const day = log.createdAt.toISOString().slice(0, 10)
    netByDay.set(day, (netByDay.get(day) ?? 0) + (Number(log.after) - Number(log.before)))
  }

  // Stock spark: reconstruct running total walking backwards from current total
  const stockSpark: number[] = Array(7).fill(0)
  stockSpark[6] = totalStock
  for (let i = 5; i >= 0; i--) {
    const nextDayNet = netByDay.get(dayKeys[i + 1]) ?? 0
    stockSpark[i] = Math.max(0, stockSpark[i + 1] - nextDayNet)
  }

  // Order spark: daily new order count
  const orderByDay = new Map<string, number>()
  for (const o of recentOrders) {
    const day = o.createdAt.toISOString().slice(0, 10)
    orderByDay.set(day, (orderByDay.get(day) ?? 0) + 1)
  }
  const orderSpark = dayKeys.map((d) => orderByDay.get(d) ?? 0)

  return { productCount, totalStock, activeOrderCount, stockSpark, orderSpark }
}
