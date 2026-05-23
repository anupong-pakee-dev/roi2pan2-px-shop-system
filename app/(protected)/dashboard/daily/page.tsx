import Link from 'next/link'
import { prisma } from '@/app/lib/db'
import { verifyStaff } from '@/app/lib/dal'

function thDate(d: Date) {
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' })
}

function isoDate(d: Date) {
  // ISO date string in Bangkok time
  const bkk = new Date(d.getTime() + 7 * 3600 * 1000)
  return bkk.toISOString().slice(0, 10)
}

export default async function DailySummaryPage() {
  await verifyStaff()

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  // Group by Bangkok date
  const map = new Map<string, {
    date: string
    thDate: string
    orderCount: number
    subtotal: number
    shippingFee: number
    total: number
    cancelledCount: number
    itemCount: number
  }>()

  for (const o of orders) {
    const key = isoDate(o.createdAt)
    if (!map.has(key)) {
      map.set(key, {
        date: key,
        thDate: thDate(o.createdAt),
        orderCount: 0,
        subtotal: 0,
        shippingFee: 0,
        total: 0,
        cancelledCount: 0,
        itemCount: 0,
      })
    }
    const row = map.get(key)!
    if (o.status === 'CANCELLED') {
      row.cancelledCount++
    } else {
      row.orderCount++
      row.subtotal += Number(o.subtotal)
      row.shippingFee += Number(o.shippingFee)
      row.total += Number(o.total)
      row.itemCount += o.items.reduce((s, i) => s + i.quantity, 0)
    }
  }

  const days = Array.from(map.values())

  const grandTotal = days.reduce((s, d) => s + d.total, 0)
  const grandOrders = days.reduce((s, d) => s + d.orderCount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">สรุปยอดรายวัน</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            รวมทั้งหมด {grandOrders} ออเดอร์ · ยอดรวม ฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <a
          href="/api/admin/export-daily"
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Export Excel
        </a>
      </div>

      {days.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-zinc-600 text-sm">ยังไม่มีข้อมูลออเดอร์</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1fr_80px_100px_100px_100px_72px] gap-3 px-5 py-3 border-b border-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wide">
            <span>วันที่</span>
            <span className="text-right">ออเดอร์</span>
            <span className="text-right">ยอดสินค้า</span>
            <span className="text-right">ค่าส่ง</span>
            <span className="text-right">รวม</span>
            <span className="text-right">ยกเลิก</span>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {days.map((d) => (
              <div
                key={d.date}
                className="grid grid-cols-1 sm:grid-cols-[1fr_80px_100px_100px_100px_72px] gap-1 sm:gap-3 px-5 py-3.5 hover:bg-zinc-800/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">{d.thDate}</p>
                  <p className="text-xs text-zinc-600 sm:hidden">
                    {d.orderCount} ออเดอร์ · {d.itemCount} ชิ้น
                    {d.cancelledCount > 0 && ` · ยกเลิก ${d.cancelledCount}`}
                  </p>
                </div>
                <p className="hidden sm:block text-sm text-zinc-300 text-right tabular-nums">{d.orderCount}</p>
                <p className="hidden sm:block text-sm text-zinc-300 text-right tabular-nums">
                  ฿{d.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </p>
                <p className="hidden sm:block text-sm text-zinc-300 text-right tabular-nums">
                  {d.shippingFee === 0 ? <span className="text-zinc-600">ฟรี</span> : `฿${d.shippingFee.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`}
                </p>
                <p className="hidden sm:block text-sm font-semibold text-zinc-100 text-right tabular-nums">
                  ฿{d.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </p>
                <p className="hidden sm:block text-sm text-right tabular-nums">
                  {d.cancelledCount > 0
                    ? <span className="text-red-400">{d.cancelledCount}</span>
                    : <span className="text-zinc-700">—</span>}
                </p>

                {/* Mobile totals row */}
                <div className="flex items-center justify-between sm:hidden text-xs text-zinc-500">
                  <span>ยอดรวม</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                    ฿{d.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer total */}
          <div className="hidden sm:grid grid-cols-[1fr_80px_100px_100px_100px_72px] gap-3 px-5 py-3.5 border-t border-zinc-700 bg-zinc-800/40">
            <span className="text-sm font-semibold text-zinc-300">รวมทั้งหมด</span>
            <span className="text-sm font-semibold text-zinc-200 text-right tabular-nums">{grandOrders}</span>
            <span className="text-sm font-semibold text-zinc-200 text-right tabular-nums">
              ฿{days.reduce((s, d) => s + d.subtotal, 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-semibold text-zinc-200 text-right tabular-nums">
              ฿{days.reduce((s, d) => s + d.shippingFee, 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-bold text-zinc-100 text-right tabular-nums">
              ฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
            <span />
          </div>
        </div>
      )}
    </div>
  )
}
