'use client'

import { useState } from 'react'
import ImageUpload from '@/app/ui/image-upload'

type Props = {
  action: (formData: FormData) => void
  defaultValues?: {
    name?: string
    sku?: string
    description?: string
    price?: number | string
    stock?: number
    minStock?: number
    category?: string
    imageUrl?: string
  }
  isEdit?: boolean
  state?: { errors?: Record<string, string[]>; message?: string }
  pending?: boolean
}

const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition'
const labelCls = 'block text-sm font-medium text-zinc-300 mb-1'

export default function ProductForm({ action, defaultValues = {}, isEdit = false, state, pending }: Props) {
  const [imageUrl, setImageUrl] = useState<string>(defaultValues.imageUrl ?? '')

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>
            ชื่อสินค้า <span className="text-red-500">*</span>
          </label>
          <input name="name" defaultValue={defaultValues.name} className={inputCls} placeholder="เช่น กาแฟสด" />
          {state?.errors?.name && <p className="text-xs text-red-400 mt-1">{state.errors.name[0]}</p>}
        </div>

        <div>
          <label className={labelCls}>
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            name="sku"
            defaultValue={defaultValues.sku}
            readOnly={isEdit}
            className={`${inputCls} ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="เช่น COFFEE-001"
          />
          {state?.errors?.sku && <p className="text-xs text-red-400 mt-1">{state.errors.sku[0]}</p>}
        </div>

        <div>
          <label className={labelCls}>ราคา (บาท)</label>
          <input name="price" type="number" min="0" step="0.01" defaultValue={defaultValues.price ?? 0} className={inputCls} />
          {state?.errors?.price && <p className="text-xs text-red-400 mt-1">{state.errors.price[0]}</p>}
        </div>

        <div>
          <label className={labelCls}>หมวดหมู่</label>
          <input name="category" defaultValue={defaultValues.category} className={inputCls} placeholder="เช่น เครื่องดื่ม" />
        </div>

        {!isEdit && (
          <div>
            <label className={labelCls}>จำนวน Stock เริ่มต้น</label>
            <input name="stock" type="number" min="0" defaultValue={defaultValues.stock ?? 0} className={inputCls} />
            {state?.errors?.stock && <p className="text-xs text-red-400 mt-1">{state.errors.stock[0]}</p>}
          </div>
        )}

        <div>
          <label className={labelCls}>Stock ขั้นต่ำ (แจ้งเตือน)</label>
          <input name="minStock" type="number" min="0" defaultValue={defaultValues.minStock ?? 5} className={inputCls} />
          {state?.errors?.minStock && <p className="text-xs text-red-400 mt-1">{state.errors.minStock[0]}</p>}
        </div>
      </div>

      <div>
        <label className={labelCls}>คำอธิบาย</label>
        <textarea
          name="description"
          defaultValue={defaultValues.description}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="รายละเอียดสินค้า (ไม่บังคับ)"
        />
      </div>

      <div>
        <label className={labelCls}>รูปสินค้า</label>
        <ImageUpload currentUrl={defaultValues.imageUrl} onUpload={setImageUrl} />
      </div>

      {state?.message && (
        <p className="text-sm text-red-400 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-zinc-100 text-zinc-900 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
      </button>
    </form>
  )
}
