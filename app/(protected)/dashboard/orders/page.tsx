import Link from 'next/link'
import { prisma } from '@/app/lib/db'
import { verifyStaff } from '@/app/lib/dal'
import { OrderStatusBadge } from '@/app/ui/badge'
import PageHeader from '@/app/ui/page-header'
import Card from '@/app/ui/card'
import Icon from '@/app/ui/icon-svg'
import EmptyState, { EmptyArt } from '@/app/ui/empty-state'
import Button from '@/app/ui/button'
import type { OrderStatus } from '@prisma/client'

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'ทั้งหมด',          value: 'ALL' },
  { label: 'รอยืนยัน',          value: 'PENDING' },
  { label: 'ยืนยันแล้ว',         value: 'CONFIRMED' },
  { label: 'กำลังเตรียมของ',     value: 'PREPARING' },
  { label: 'จัดส่งแล้ว',         value: 'SHIPPED' },
  { label: 'ส่งถึงแล้ว',         value: 'DELIVERED' },
  { label: 'ยกเลิก',             value: 'CANCELLED' },
]

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await verifyStaff()
  const { status } = await searchParams
  const filter = status && status !== 'ALL' ? (status as OrderStatus) : undefined

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: filter ? { status: filter } : undefined,
      include: {
        user: { select: { username: true } },
        items: { select: { productName: true, quantity: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
  ])

  const countMap = new Map(counts.map((c) => [c.status, c._count.id]))
  const totalAll = counts.reduce((s, c) => s + c._count.id, 0)

  return (
    <div className="max-w-[1440px] mx-auto px-6 pt-7 pb-16">
      <PageHeader
        kicker="จัดการ"
        title="ออเดอร์ทั้งหมด"
        subtitle={`${orders.length} รายการ${filter ? ` · กรองโดยสถานะ` : ''}`}
        actions={<Button variant="secondary" icon="download">Export</Button>}
      />

      {/* Status pills */}
      <div className="flex gap-2 overflow-x-auto scroll-thin pb-1 mb-4">
        {STATUS_OPTIONS.map((opt) => {
          const active = (filter ?? 'ALL') === opt.value
          const count = opt.value === 'ALL' ? totalAll : (countMap.get(opt.value as OrderStatus) ?? 0)
          return (
            <Link
              key={opt.value}
              href={`/dashboard/orders?status=${opt.value}`}
              className={[
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 border',
                'text-[12.5px] font-medium transition-colors',
                active
                  ? 'bg-ink text-bg border-ink'
                  : 'bg-surface text-ink-2 border-line hover:text-ink',
              ].join(' ')}
            >
              {opt.label}
              <span
                className={[
                  'num text-[10.5px] px-1.5 py-px rounded-full',
                  active ? 'bg-white/15' : 'bg-surface-hi',
                ].join(' ')}
              >
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {orders.length === 0 ? (
        <Card>
          <EmptyState
            illustration={<EmptyArt kind="check" />}
            title="ไม่มีคำสั่งซื้อ"
            description="ในสถานะนี้ยังไม่มีรายการ"
          />
        </Card>
      ) : (
        <Card padded={false}>
          {/* Mobile */}
          <div className="sm:hidden">
            {orders.map((order, i) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className={[
                  'flex items-start justify-between gap-3 px-4 py-4 transition-colors hover:bg-surface-hi/50',
                  i < orders.length - 1 && 'border-b border-line',
                ].filter(Boolean).join(' ')}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="mono text-xs text-ink-2">#{order.id.slice(-8).toUpperCase()}</span>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                  <p className="text-xs text-ink-3 m-0">{order.user.username} · {order.addressLabel}</p>
                  <p className="text-xs text-ink-4 truncate m-0">
                    {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="num text-sm font-semibold text-ink m-0">
                    ฿{Number(order.total).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-ink-4 mt-0.5 m-0">
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
                <tr>
                  {['คำสั่งซื้อ', 'ผู้สั่ง', 'ที่อยู่', 'สถานะ', 'ยอดรวม', 'วันที่'].map((h, i) => (
                    <th
                      key={h}
                      className={[
                        'kicker font-medium border-b border-line bg-surface-lo',
                        'px-5 py-3 text-left',
                        (i === 3) && 'text-center',
                        (i === 4 || i === 5) && '!text-right',
                      ].filter(Boolean).join(' ')}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr
                    key={order.id}
                    className={[
                      'transition-colors hover:bg-surface-hi/50',
                      i < orders.length - 1 && 'border-b border-line',
                    ].filter(Boolean).join(' ')}
                  >
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/orders/${order.id}`} className="hover:underline">
                        <p className="mono text-ink-2 text-xs m-0">#{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-ink-4 mt-0.5 m-0 max-w-[300px] truncate">
                          {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
                        </p>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-ink-2 text-xs">{order.user.username}</td>
                    <td className="px-5 py-4 text-ink-3 text-xs max-w-36 truncate">{order.addressLabel}</td>
                    <td className="px-5 py-4 text-center"><OrderStatusBadge status={order.status} size="sm" /></td>
                    <td className="px-5 py-4 text-right num font-medium text-ink">
                      ฿{Number(order.total).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-right text-xs text-ink-3 whitespace-nowrap">
                      {order.createdAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
