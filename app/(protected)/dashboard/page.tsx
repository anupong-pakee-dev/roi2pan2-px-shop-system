import Link from 'next/link'
import { prisma } from '@/app/lib/db'
import { verifyStaff } from '@/app/lib/dal'
import StockBadge from '@/app/ui/stock-badge'

export default async function DashboardPage() {
  await verifyStaff()

  const [
    totalProducts,
    totalStockValue,
    outOfStock,
    lowStockRaw,
    recentLogs,
    categoryStats,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.aggregate({ _sum: { stock: true } }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.product.findMany({
      where: { stock: { gt: 0 } },
      select: { id: true, name: true, sku: true, stock: true, minStock: true },
      orderBy: { stock: 'asc' },
    }),
    prisma.stockLog.findMany({
      include: { product: { select: { name: true, sku: true } } },
      orderBy: { createdAt: 'desc' },
      take: 15,
    }),
    prisma.product.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { stock: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ])

  const lowStock = lowStockRaw.filter((p) => p.stock <= p.minStock)
  const totalItems = totalStockValue._sum.stock ?? 0

  const stats = [
    { label: 'สินค้าทั้งหมด', value: totalProducts, unit: 'ชนิด', color: 'bg-zinc-800 border-zinc-700', val: 'text-zinc-100' },
    { label: 'รวม Stock', value: totalItems.toLocaleString(), unit: 'ชิ้น', color: 'bg-blue-950/60 border-blue-900/50', val: 'text-blue-300' },
    { label: 'สินค้าหมด', value: outOfStock, unit: 'ชนิด', color: 'bg-red-950/60 border-red-900/50', val: 'text-red-400' },
    { label: 'ใกล้หมด', value: lowStock.length, unit: 'ชนิด', color: 'bg-amber-950/60 border-amber-900/50', val: 'text-amber-400' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">ภาพรวมสต็อกสินค้า</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 border ${s.color}`}>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-4xl font-bold mt-2 tabular-nums ${s.val}`}>{s.value}</p>
            <p className="text-xs text-zinc-600 mt-1">{s.unit}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-zinc-200">สินค้าใกล้หมด / หมดแล้ว</h2>
            <Link href="/products?status=low" className="text-xs text-zinc-600 hover:text-zinc-400 underline">
              ดูทั้งหมด
            </Link>
          </div>

          {lowStock.length === 0 && outOfStock === 0 ? (
            <p className="text-sm text-zinc-600 text-center py-8">ไม่มีสินค้าใกล้หมด</p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {lowStock.slice(0, 8).map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="flex items-center justify-between py-3 hover:bg-zinc-800/50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-300">{p.name}</p>
                    <p className="text-xs text-zinc-600">{p.sku}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-zinc-200 tabular-nums">{p.stock}</span>
                    <StockBadge stock={p.stock} minStock={p.minStock} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
          <h2 className="font-medium text-zinc-200 mb-4">หมวดหมู่สินค้า</h2>

          {categoryStats.length === 0 ? (
            <p className="text-sm text-zinc-600 text-center py-8">ยังไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-4">
              {categoryStats.map((c) => {
                const maxCount = categoryStats[0]._count.id
                const pct = Math.round((c._count.id / maxCount) * 100)
                return (
                  <div key={c.category ?? 'uncategorized'}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-zinc-300 font-medium">{c.category ?? 'ไม่มีหมวดหมู่'}</span>
                      <span className="text-zinc-500 text-xs">
                        {c._count.id} ชนิด · {(c._sum.stock ?? 0).toLocaleString()} ชิ้น
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
        <h2 className="font-medium text-zinc-200 mb-4">การเปลี่ยนแปลง Stock ล่าสุด</h2>

        {recentLogs.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-8">ยังไม่มีประวัติ</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-zinc-600 border-b border-zinc-800">
                    <th className="text-left pb-3 font-medium">สินค้า</th>
                    <th className="text-center pb-3 font-medium">ประเภท</th>
                    <th className="text-center pb-3 font-medium">จำนวน</th>
                    <th className="text-center pb-3 font-medium">ก่อน → หลัง</th>
                    <th className="text-left pb-3 font-medium">หมายเหตุ</th>
                    <th className="text-right pb-3 font-medium">วันเวลา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-800/30">
                      <td className="py-3 pr-3">
                        <Link href={`/products/${log.productId}`} className="hover:underline">
                          <p className="font-medium text-zinc-300">{log.product.name}</p>
                          <p className="text-xs text-zinc-600">{log.product.sku}</p>
                        </Link>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          log.type === 'ADD' ? 'bg-emerald-950 text-emerald-400'
                          : log.type === 'SUBTRACT' ? 'bg-red-950 text-red-400'
                          : 'bg-blue-950 text-blue-400'
                        }`}>
                          {log.type === 'ADD' ? '+' : log.type === 'SUBTRACT' ? '−' : '='}
                        </span>
                      </td>
                      <td className="py-3 text-center font-semibold text-zinc-200 tabular-nums">{log.quantity}</td>
                      <td className="py-3 text-center text-zinc-500 text-xs tabular-nums">{log.before} → {log.after}</td>
                      <td className="py-3 text-zinc-600 text-xs max-w-32 truncate">{log.note ?? '—'}</td>
                      <td className="py-3 text-right text-xs text-zinc-600 whitespace-nowrap">
                        {log.createdAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-zinc-800/60">
              {recentLogs.map((log) => (
                <Link key={log.id} href={`/products/${log.productId}`} className="flex items-start gap-3 py-3 hover:bg-zinc-800/30 -mx-2 px-2 rounded-lg transition-colors">
                  <span className={`mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    log.type === 'ADD' ? 'bg-emerald-950 text-emerald-400'
                    : log.type === 'SUBTRACT' ? 'bg-red-950 text-red-400'
                    : 'bg-blue-950 text-blue-400'
                  }`}>
                    {log.type === 'ADD' ? '+' : log.type === 'SUBTRACT' ? '−' : '='}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-300 truncate">{log.product.name}</p>
                    {log.note && <p className="text-xs text-zinc-600 truncate">{log.note}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-zinc-200 tabular-nums">
                      {log.type === 'ADD' ? '+' : log.type === 'SUBTRACT' ? '−' : ''}{log.quantity}
                    </p>
                    <p className="text-xs text-zinc-600 tabular-nums">{log.before}→{log.after}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
