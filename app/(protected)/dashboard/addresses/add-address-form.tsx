'use client'

import { useRef, useTransition } from 'react'
import { createAddress } from '@/app/actions/addresses'

const inputCls =
  'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition'

export default function AddAddressForm() {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await createAddress(formData)
      formRef.current?.reset()
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-200">เพิ่มที่อยู่ใหม่</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs text-zinc-400 mb-1">ชื่อที่อยู่ / สาขา <span className="text-red-500">*</span></label>
          <input name="label" required placeholder="เช่น สาขากรุงเทพ" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-zinc-400 mb-1">ที่อยู่เต็ม</label>
          <input name="detail" placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">ค่าจัดส่ง (บาท) <span className="text-red-500">*</span></label>
          <input name="shippingFee" type="number" min="0" step="1" defaultValue="0" required className={inputCls} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-zinc-100 text-zinc-900 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-white disabled:opacity-40 transition-colors"
      >
        {isPending ? 'กำลังเพิ่ม...' : '+ เพิ่มที่อยู่'}
      </button>
    </form>
  )
}
