'use client'

import { useState, useTransition } from 'react'
import { cancelOrder } from '@/app/actions/orders'

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(false)

  function handleCancel() {
    setError('')
    startTransition(async () => {
      const result = await cancelOrder(orderId)
      if (result?.error) setError(result.error)
    })
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="w-full border border-red-800/50 text-red-400 hover:bg-red-950/30 rounded-lg px-4 py-2.5 text-sm transition-colors"
      >
        ยกเลิกคำสั่งซื้อ
      </button>
    )
  }

  return (
    <div className="bg-red-950/30 border border-red-800/50 rounded-2xl p-4 space-y-3">
      <p className="text-sm text-red-300">ยืนยันการยกเลิกคำสั่งซื้อนี้? สต็อกสินค้าจะถูกคืนกลับ</p>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {isPending ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิก'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors"
        >
          ไม่ยกเลิก
        </button>
      </div>
    </div>
  )
}
