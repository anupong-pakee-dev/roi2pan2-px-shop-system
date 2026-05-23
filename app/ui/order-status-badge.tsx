import type { OrderStatus } from '@prisma/client'

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string }> = {
  PENDING:   { label: 'รอยืนยัน',       cls: 'bg-amber-950/60 text-amber-400 border-amber-800/50' },
  CONFIRMED: { label: 'ยืนยันแล้ว',      cls: 'bg-blue-950/60 text-blue-400 border-blue-800/50' },
  PREPARING: { label: 'กำลังเตรียมของ',  cls: 'bg-orange-950/60 text-orange-400 border-orange-800/50' },
  SHIPPED:   { label: 'จัดส่งแล้ว',      cls: 'bg-violet-950/60 text-violet-400 border-violet-800/50' },
  DELIVERED: { label: 'ส่งถึงแล้ว',      cls: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' },
  CANCELLED: { label: 'ยกเลิก',          cls: 'bg-red-950/60 text-red-400 border-red-800/50' },
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, cls } = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center border px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}
