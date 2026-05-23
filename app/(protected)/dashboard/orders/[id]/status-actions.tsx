'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus } from '@/app/actions/orders'
import type { OrderStatus } from '@prisma/client'

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string; cls: string }>> = {
  PENDING:   { status: 'CONFIRMED', label: 'ยืนยันคำสั่งซื้อ',    cls: 'bg-blue-600 hover:bg-blue-500' },
  CONFIRMED: { status: 'PREPARING', label: 'เริ่มเตรียมของ',       cls: 'bg-orange-600 hover:bg-orange-500' },
  PREPARING: { status: 'SHIPPED',   label: 'ยืนยันจัดส่งแล้ว',     cls: 'bg-violet-600 hover:bg-violet-500' },
  SHIPPED:   { status: 'DELIVERED', label: 'ยืนยันส่งถึงแล้ว',     cls: 'bg-emerald-600 hover:bg-emerald-500' },
}

type Props = { orderId: string; currentStatus: OrderStatus }

export default function StatusActions({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)

  const next = NEXT_STATUS[currentStatus]

  function advance() {
    if (!next) return
    setError('')
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next.status)
      if (result?.error) setError(result.error)
    })
  }

  function cancel() {
    setError('')
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, 'CANCELLED')
      if (result?.error) { setError(result.error); return }
      setConfirmCancel(false)
    })
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
      <h2 className="font-medium text-zinc-200 text-sm">จัดการสถานะ</h2>
      {error && (
        <p className="text-xs text-red-400 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        {next && (
          <button
            onClick={advance}
            disabled={isPending}
            className={`flex-1 text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 transition-colors ${next.cls}`}
          >
            {isPending ? 'กำลังอัพเดต...' : next.label}
          </button>
        )}

        {!confirmCancel ? (
          <button
            onClick={() => setConfirmCancel(true)}
            className="flex-1 border border-red-800/50 text-red-400 hover:bg-red-950/30 rounded-lg px-4 py-2.5 text-sm transition-colors"
          >
            ยกเลิกคำสั่งซื้อ
          </button>
        ) : (
          <div className="flex-1 flex gap-2">
            <button
              onClick={cancel}
              disabled={isPending}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {isPending ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิก'}
            </button>
            <button
              onClick={() => setConfirmCancel(false)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2.5 text-sm transition-colors"
            >
              ไม่ยกเลิก
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
