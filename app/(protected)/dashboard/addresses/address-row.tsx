'use client'

import { useTransition } from 'react'
import { deleteAddress, toggleAddress } from '@/app/actions/addresses'

type Address = {
  id: string
  label: string
  detail: string
  shippingFee: string
  isActive: boolean
}

export default function AddressRow({ address }: { address: Address }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className={`flex items-start justify-between px-5 py-4 gap-4 ${!address.isActive ? 'opacity-50' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-zinc-200">{address.label}</p>
          {!address.isActive && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-500">ปิดใช้งาน</span>
          )}
          <span className="text-xs text-zinc-400 font-medium">
            {Number(address.shippingFee) === 0 ? 'ฟรี' : `+฿${Number(address.shippingFee).toLocaleString('th-TH')}`}
          </span>
        </div>
        {address.detail && (
          <p className="text-xs text-zinc-600 mt-0.5 truncate">{address.detail}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          disabled={isPending}
          onClick={() => startTransition(() => toggleAddress(address.id, !address.isActive))}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors disabled:opacity-40 ${
            address.isActive
              ? 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
              : 'bg-emerald-900/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/70'
          }`}
        >
          {isPending ? '...' : address.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
        </button>
        <button
          disabled={isPending}
          onClick={() => {
            if (confirm(`ลบ "${address.label}" ใช่ไหม?`)) {
              startTransition(() => deleteAddress(address.id))
            }
          }}
          className="text-xs px-3 py-1.5 rounded-lg font-medium border bg-red-950/40 text-red-400 border-red-800/40 hover:bg-red-950/70 transition-colors disabled:opacity-40"
        >
          ลบ
        </button>
      </div>
    </div>
  )
}
