import * as React from 'react'

type Tone = 'neutral' | 'brand' | 'danger' | 'warn' | 'info' | 'violet' | 'success'

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-hi text-ink-2 border-line',
  brand:   'bg-brand-soft text-brand-soft-fg border-transparent',
  success: 'bg-brand-soft text-brand-soft-fg border-transparent',
  danger:  'bg-danger-soft text-danger-soft-fg border-transparent',
  warn:    'bg-warn-soft text-warn-soft-fg border-transparent',
  info:    'bg-info-soft text-info-soft-fg border-transparent',
  violet:  'bg-violet-soft text-violet-soft-fg border-transparent',
}

const SIZES = {
  sm: 'text-[10.5px] h-[18px] px-1.5',
  md: 'text-[11.5px] h-[22px] px-2',
}

export default function Badge({
  children,
  tone = 'neutral',
  size = 'md',
  dot,
  className,
}: {
  children: React.ReactNode
  tone?: Tone
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}) {
  return (
    <span className={[
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      TONES[tone],
      SIZES[size],
      className,
    ].filter(Boolean).join(' ')}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-90" />}
      {children}
    </span>
  )
}

/* ----- StockBadge ----- */
export function StockBadge({ stock, minStock, showCount }: { stock: number; minStock: number; showCount?: boolean }) {
  if (stock === 0) return <Badge tone="danger" dot>หมด</Badge>
  if (stock <= minStock) return <Badge tone="warn" dot>ใกล้หมด{showCount ? ` · ${stock}` : ''}</Badge>
  return <Badge tone="success" dot>พร้อมขาย</Badge>
}

/* ----- OrderStatusBadge ----- */
import type { OrderStatus } from '@prisma/client'

const ORDER_TONES: Record<OrderStatus, { label: string; tone: Tone }> = {
  PENDING:   { label: 'รอยืนยัน',       tone: 'warn' },
  CONFIRMED: { label: 'ยืนยันแล้ว',      tone: 'info' },
  PREPARING: { label: 'กำลังเตรียมของ',  tone: 'info' },
  SHIPPED:   { label: 'จัดส่งแล้ว',      tone: 'violet' },
  DELIVERED: { label: 'ส่งถึงแล้ว',      tone: 'success' },
  CANCELLED: { label: 'ยกเลิก',          tone: 'danger' },
}

export function OrderStatusBadge({ status, size = 'md' }: { status: OrderStatus; size?: 'sm' | 'md' }) {
  const cfg = ORDER_TONES[status]
  return <Badge tone={cfg.tone} dot size={size}>{cfg.label}</Badge>
}

export { ORDER_TONES }
