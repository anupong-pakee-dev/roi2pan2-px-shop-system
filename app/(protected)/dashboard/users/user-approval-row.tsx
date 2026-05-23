'use client'

import { useTransition } from 'react'
import { approveUser, revokeUser } from '@/app/actions/users'

type User = {
  id: string
  username: string
  approved: boolean
  createdAt: Date
  _count: { orders: number }
}

export default function UserApprovalRow({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      if (user.approved) await revokeUser(user.id)
      else await approveUser(user.id)
    })
  }

  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          user.approved
            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
            : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
        }`}>
          {user.username[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-200">{user.username}</p>
          <p className="text-xs text-zinc-600">
            สมัครเมื่อ {user.createdAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' · '}
            {user._count.orders} ออเดอร์
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
          user.approved
            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
            : 'bg-amber-950/60 text-amber-400 border-amber-800/40'
        }`}>
          {user.approved ? 'อนุมัติแล้ว' : 'รออนุมัติ'}
        </span>

        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-40 transition-colors ${
            user.approved
              ? 'bg-red-950/40 text-red-400 hover:bg-red-950/70 border border-red-800/40'
              : 'bg-emerald-700 text-white hover:bg-emerald-600 border border-emerald-600'
          }`}
        >
          {isPending ? '...' : user.approved ? 'ยกเลิกสิทธิ์' : 'อนุมัติ'}
        </button>
      </div>
    </div>
  )
}
