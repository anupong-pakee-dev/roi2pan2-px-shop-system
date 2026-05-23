'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createProduct } from '@/app/actions/products'
import ProductForm from '@/app/ui/product-form'

export default function NewProductPage() {
  const [state, action, pending] = useActionState(createProduct, undefined)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/products" className="text-zinc-600 hover:text-zinc-300 transition-colors text-sm">
          ← กลับ
        </Link>
        <h1 className="text-xl font-semibold text-zinc-100">เพิ่มสินค้าใหม่</h1>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <ProductForm action={action} state={state} pending={pending} />
      </div>
    </div>
  )
}
