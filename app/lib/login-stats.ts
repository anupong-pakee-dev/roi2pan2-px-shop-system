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

  const [productCount, stockAgg, activeOrderCount, rawStockDays, rawOrderDays] = await Promise.all([
    prisma.product.count(),
    prisma.product.aggregate({ _sum: { stock: true } }),
    prisma.order.count({
      where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] } },
    }),
    // Net stock change per day (SUM of after-before per log entry)
    prisma.$queryRaw<{ day: string; net: number }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') AS day,
        SUM("after" - "before")::int AS net
      FROM "StockLog"
      WHERE "createdAt" >= ${sixDaysAgo}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY day ASC
    `,
    // Orders created per day
    prisma.$queryRaw<{ day: string; count: number }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS count
      FROM "Order"
      WHERE "createdAt" >= ${sixDaysAgo}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY day ASC
    `,
  ])

  const totalStock = stockAgg._sum.stock ?? 0

  // 7-day key array: index 0 = 6 days ago, index 6 = today
  const dayKeys = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })

  // Stock spark: reconstruct running total walking backwards from current total
  const netByDay = new Map(rawStockDays.map((r) => [r.day, r.net]))
  const stockSpark: number[] = Array(7).fill(0)
  stockSpark[6] = totalStock
  for (let i = 5; i >= 0; i--) {
    const nextDayNet = netByDay.get(dayKeys[i + 1]) ?? 0
    stockSpark[i] = Math.max(0, stockSpark[i + 1] - nextDayNet)
  }

  // Order spark: daily new order count
  const orderByDay = new Map(rawOrderDays.map((r) => [r.day, r.count]))
  const orderSpark = dayKeys.map((d) => orderByDay.get(d) ?? 0)

  return { productCount, totalStock, activeOrderCount, stockSpark, orderSpark }
}
