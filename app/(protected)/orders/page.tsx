import Link from 'next/link'
import { prisma } from '@/app/lib/db'
import { verifySession } from '@/app/lib/dal'
import OrderStatusBadge from '@/app/ui/order-status-badge'

export default async function OrdersPage() {
  const session = await verifySession()

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: { select: { productName: true, quantity: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">คำสั่งซื้อของฉัน</h1>
          <p className="text-sm text-zinc-500 mt-0.5">ประวัติการสั่งซื้อทั้งหมด</p>
        </div>
        <Link
          href="/orders/new"
          className="bg-zinc-100 text-zinc-900 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-white transition-colors"
        >
          + สั่งซื้อสินค้า
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-500 text-sm">ยังไม่มีคำสั่งซื้อ</p>
          <Link href="/orders/new" className="text-zinc-400 hover:text-zinc-100 text-sm underline mt-2 inline-block">
            เริ่มสั่งซื้อสินค้า
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-mono">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-zinc-400">{order.addressLabel}</p>
                  <p className="text-xs text-zinc-600">
                    {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-semibold text-zinc-100">
                    ฿{Number(order.total).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {order.createdAt.toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
