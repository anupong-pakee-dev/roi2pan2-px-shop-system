import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/db'
import { verifyStaff } from '@/app/lib/dal'
import OrderStatusBadge from '@/app/ui/order-status-badge'
import OrderStatusStepper from '@/app/ui/order-status-stepper'
import StatusActions from './status-actions'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await verifyStaff()

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { username: true } },
    },
  })

  if (!order) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/orders" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          ← กลับ
        </Link>
        <h1 className="text-xl font-semibold text-zinc-100">
          คำสั่งซื้อ #{order.id.slice(-8).toUpperCase()}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <OrderStatusStepper status={order.status} />

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <h2 className="font-medium text-zinc-200 text-sm">ข้อมูลคำสั่งซื้อ</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-zinc-500 text-xs mb-0.5">ผู้สั่ง</p>
            <p className="text-zinc-200">{order.user.username}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs mb-0.5">วันที่สั่ง</p>
            <p className="text-zinc-200">
              {order.createdAt.toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-zinc-500 text-xs mb-0.5">ที่อยู่จัดส่ง</p>
            <p className="text-zinc-200">{order.addressLabel}</p>
          </div>
          {order.note && (
            <div className="col-span-2">
              <p className="text-zinc-500 text-xs mb-0.5">หมายเหตุ</p>
              <p className="text-zinc-300">{order.note}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h2 className="font-medium text-zinc-200 text-sm">รายการสินค้า</h2>
        <div className="divide-y divide-zinc-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-zinc-200">{item.productName}</p>
                <p className="text-xs text-zinc-500">{item.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-300">
                  {item.quantity} × ฿{Number(item.unitPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-zinc-500">
                  ฿{Number(item.subtotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>ยอดสินค้า</span>
            <span>฿{Number(order.subtotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>ค่าจัดส่ง</span>
            <span>
              {Number(order.shippingFee) === 0
                ? 'ฟรี'
                : `฿${Number(order.shippingFee).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-zinc-100 text-base border-t border-zinc-800 pt-2">
            <span>รวมทั้งหมด</span>
            <span>฿{Number(order.total).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
        <StatusActions orderId={order.id} currentStatus={order.status} />
      )}
    </div>
  )
}
