import Link from 'next/link'
import { prisma } from '@/app/lib/db'
import { verifyStaff } from '@/app/lib/dal'
import OrderStatusBadge from '@/app/ui/order-status-badge'
import type { OrderStatus } from '@prisma/client'

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'ทั้งหมด', value: 'ALL' },
  { label: 'รอยืนยัน', value: 'PENDING' },
  { label: 'ยืนยันแล้ว', value: 'CONFIRMED' },
  { label: 'กำลังเตรียมของ', value: 'PREPARING' },
  { label: 'จัดส่งแล้ว', value: 'SHIPPED' },
  { label: 'ส่งถึงแล้ว', value: 'DELIVERED' },
  { label: 'ยกเลิก', value: 'CANCELLED' },
]

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await verifyStaff()
  const { status } = await searchParams
  const filter = status && status !== 'ALL' ? (status as OrderStatus) : undefined

  const orders = await prisma.order.findMany({
    where: filter ? { status: filter } : undefined,
    include: {
      user: { select: { username: true } },
      items: { select: { productName: true, quantity: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">จัดการคำสั่งซื้อ</h1>
        <p className="text-sm text-zinc-500 mt-0.5">คำสั่งซื้อทั้งหมด {orders.length} รายการ</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/dashboard/orders?status=${opt.value}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (filter ?? 'ALL') === opt.value
                ? 'bg-zinc-200 text-zinc-900'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-500 text-sm">ไม่มีคำสั่งซื้อ</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-zinc-800/60">
            {orders.map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex items-start justify-between gap-3 px-4 py-4 hover:bg-zinc-800/40 transition-colors">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-zinc-400">#{order.id.slice(-8).toUpperCase()}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-zinc-500">{order.user.username} · {order.addressLabel}</p>
                  <p className="text-xs text-zinc-600 truncate">
                    {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-zinc-100 tabular-nums">
                    ฿{Number(order.total).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {order.createdAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 border-b border-zinc-800">
                  <th className="text-left px-5 py-3 font-medium">คำสั่งซื้อ</th>
                  <th className="text-left px-5 py-3 font-medium">ผู้สั่ง</th>
                  <th className="text-left px-5 py-3 font-medium">ที่อยู่</th>
                  <th className="text-center px-5 py-3 font-medium">สถานะ</th>
                  <th className="text-right px-5 py-3 font-medium">ยอดรวม</th>
                  <th className="text-right px-5 py-3 font-medium">วันที่</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/orders/${order.id}`} className="hover:underline">
                        <p className="text-zinc-300 font-mono text-xs">#{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-zinc-600 mt-0.5">
                          {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
                        </p>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-zinc-400 text-xs">{order.user.username}</td>
                    <td className="px-5 py-4 text-zinc-400 text-xs max-w-36 truncate">{order.addressLabel}</td>
                    <td className="px-5 py-4 text-center"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-5 py-4 text-right text-zinc-200 font-medium tabular-nums">
                      ฿{Number(order.total).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-right text-xs text-zinc-600 whitespace-nowrap">
                      {order.createdAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
