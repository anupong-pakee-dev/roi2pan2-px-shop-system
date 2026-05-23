'use client'

import { deleteProduct } from '@/app/actions/products'
import { useTransition } from 'react'

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`ยืนยันการลบ "${name}"?`)) return
    startTransition(async () => {
      await deleteProduct(id)
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="text-sm px-3 py-1.5 border border-red-800/60 rounded-lg text-red-400 hover:bg-red-950 transition-colors disabled:opacity-40"
    >
      {pending ? 'กำลังลบ...' : 'ลบ'}
    </button>
  )
}
