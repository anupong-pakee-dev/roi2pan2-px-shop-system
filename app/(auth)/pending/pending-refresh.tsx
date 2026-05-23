'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { checkApprovalStatus } from '@/app/actions/pending'
import { logout } from '@/app/actions/auth'

export default function PendingRefresh() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [countdown, setCountdown] = useState(30)

  function doCheck() {
    startTransition(async () => {
      const approved = await checkApprovalStatus()
      if (approved) {
        router.push('/products')
      } else {
        // ยังไม่ถูกอนุมัติ → ออกจากระบบ
        await logout()
      }
    })
  }

  // Auto-check every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          doCheck()
          return 30
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 space-y-3">
      <p className="text-xs text-zinc-500">
        ระบบตรวจสอบสถานะอัตโนมัติทุก 30 วินาที — หากไม่ได้รับอนุมัติจะออกจากระบบอัตโนมัติ
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-600">
          {isPending ? 'กำลังตรวจสอบ...' : `ออกจากระบบอัตโนมัติใน ${countdown} วิ`}
        </span>
        <button
          onClick={() => { setCountdown(30); doCheck() }}
          disabled={isPending}
          className="text-xs text-zinc-400 hover:text-zinc-100 disabled:opacity-40 border border-zinc-700 hover:border-zinc-500 rounded-lg px-3 py-1.5 transition-colors"
        >
          {isPending ? '...' : 'ตรวจสอบเดี๋ยวนี้'}
        </button>
      </div>
      {!isPending && (
        <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-700 rounded-full transition-all duration-1000"
            style={{ width: `${((30 - countdown) / 30) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
