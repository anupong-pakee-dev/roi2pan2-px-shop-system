'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'

type Props = {
  categories: string[]
  currentQ?: string
  currentCategory?: string
  currentStatus?: string
}

export default function ProductSearch({ categories, currentQ, currentCategory, currentStatus }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v)
    }
    const qs = sp.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  function navigate(params: Record<string, string | undefined>) {
    startTransition(() => {
      router.push(buildUrl(params))
    })
  }

  const statusFilters = [
    { label: 'ทั้งหมด', value: '' },
    { label: 'ใกล้หมด', value: 'low' },
    { label: 'หมดสต็อก', value: 'out' },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        type="search"
        defaultValue={currentQ}
        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 min-w-48"
        placeholder="ค้นหาชื่อสินค้า หรือ SKU..."
        autoComplete="off"
        onChange={(e) => {
          navigate({ q: e.target.value || undefined, category: currentCategory, status: currentStatus })
        }}
      />

      <div className="flex items-center gap-1 flex-wrap">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => navigate({ q: currentQ, category: currentCategory, status: f.value || undefined })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (currentStatus ?? '') === f.value
                ? 'bg-zinc-100 text-zinc-900'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
            }`}
          >
            {f.label}
          </button>
        ))}

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              navigate({
                q: currentQ,
                category: currentCategory === cat ? undefined : cat,
                status: currentStatus,
              })
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentCategory === cat
                ? 'bg-violet-600 text-white'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
