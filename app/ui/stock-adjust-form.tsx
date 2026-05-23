'use client'

import { useActionState, useState } from 'react'
import { adjustStock } from '@/app/actions/products'

type Props = {
  productId: string
  currentStock: number
  productName: string
}

export default function StockAdjustForm({ productId, currentStock, productName }: Props) {
  const [type, setType] = useState<'ADD' | 'SUBTRACT' | 'ADJUST'>('ADD')
  const [quantity, setQuantity] = useState(1)

  const action = adjustStock.bind(null, productId)
  const [state, formAction, pending] = useActionState(action, undefined)

  const previewStock = () => {
    if (type === 'ADD') return currentStock + quantity
    if (type === 'SUBTRACT') return Math.max(0, currentStock - quantity)
    return quantity
  }

  const preview = previewStock()

  return (
    <form action={formAction} className="space-y-4">
      <div className="text-center py-5 bg-zinc-800/60 rounded-xl border border-zinc-700/50">
        <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Stock ปัจจุบัน</p>
        <p className="text-5xl font-bold text-zinc-100 tabular-nums">{currentStock}</p>
        <p className="text-xs text-zinc-600 mt-1">{productName}</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">ประเภทการปรับ</label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: 'ADD', label: 'เพิ่ม', icon: '+', activeClass: 'border-emerald-500/70 bg-emerald-950/70 text-emerald-400' },
              { value: 'SUBTRACT', label: 'ลด', icon: '−', activeClass: 'border-red-500/70 bg-red-950/70 text-red-400' },
              { value: 'ADJUST', label: 'ตั้งค่า', icon: '=', activeClass: 'border-blue-500/70 bg-blue-950/70 text-blue-400' },
            ] as const
          ).map((t) => (
            <label
              key={t.value}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 cursor-pointer transition-all text-xs font-semibold ${
                type === t.value
                  ? t.activeClass
                  : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
              }`}
            >
              <input
                type="radio"
                name="type"
                value={t.value}
                checked={type === t.value}
                onChange={() => setType(t.value)}
                className="sr-only"
              />
              <span className="text-xl font-bold leading-none">{t.icon}</span>
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
          {type === 'ADJUST' ? 'ตั้งค่าเป็น' : 'จำนวน'}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(0, q - 1))}
            className="w-11 h-11 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 text-xl font-bold transition-colors"
          >
            −
          </button>
          <input
            name="quantity"
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-center text-2xl font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 tabular-nums"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="w-11 h-11 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 text-xl font-bold transition-colors"
          >
            +
          </button>
        </div>
        {state?.errors?.quantity && <p className="text-xs text-red-400 mt-1">{state.errors.quantity[0]}</p>}
      </div>

      <div className="flex items-center justify-between p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/50">
        <span className="text-sm text-zinc-400">ผลลัพธ์</span>
        <span className={`font-bold text-2xl tabular-nums ${
          preview === 0 ? 'text-red-400' : preview <= 5 ? 'text-amber-400' : 'text-emerald-400'
        }`}>
          {preview}
        </span>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">หมายเหตุ (ไม่บังคับ)</label>
        <input
          name="note"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          placeholder="เช่น รับของจากซัพพลายเออร์"
        />
      </div>

      {state?.message && (
        <p className="text-sm text-red-400 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-zinc-100 text-zinc-900 rounded-lg px-4 py-3 text-sm font-semibold hover:bg-white disabled:opacity-40 transition-colors"
      >
        {pending ? 'กำลังบันทึก...' : 'ยืนยันการปรับ Stock'}
      </button>
    </form>
  )
}
