'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useMemo } from 'react'
import { Input, Select } from '@/app/ui/input'
import Segmented from '@/app/ui/segmented'
import Badge from '@/app/ui/badge'
import Icon from '@/app/ui/icon-svg'

export default function ProductSearch({
  initialQuery,
  initialCategory,
  initialStatus,
  categories,
}: {
  initialQuery: string
  initialCategory: string
  initialStatus: string
  categories: string[]
}) {
  const router = useRouter()
  const sp = useSearchParams()
  const [pending, start] = useTransition()
  const [q, setQ] = useState(initialQuery)

  function update(next: Partial<{ q: string; category: string; status: string }>) {
    const u = new URLSearchParams(sp?.toString() ?? '')
    const apply = (k: string, v?: string) => {
      if (v === undefined) return
      if (v === '' || v === 'all') u.delete(k)
      else u.set(k, v)
    }
    apply('q', next.q ?? q)
    apply('category', next.category)
    apply('status', next.status)
    const qs = u.toString()
    start(() => router.push(qs ? `/products?${qs}` : '/products'))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    update({ q })
  }

  const hasFilters = useMemo(
    () => Boolean(initialQuery || initialCategory || (initialStatus && initialStatus !== 'all')),
    [initialQuery, initialCategory, initialStatus],
  )

  return (
    <div className="mb-4">
      <form
        onSubmit={onSubmit}
        className="flex flex-wrap items-center gap-2.5 bg-surface border border-line rounded-[14px] p-3"
      >
        <div className="flex-1 min-w-[220px]">
          <Input
            icon="search"
            placeholder="ค้นหาชื่อสินค้า หรือ SKU…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => update({ q })}
          />
        </div>
        <Select
          value={initialCategory}
          onChange={(e) => update({ category: e.target.value })}
          style={{ width: 180 }}
        >
          <option value="">ทุกหมวด</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Segmented
          size="sm"
          value={initialStatus || 'all'}
          onChange={(v) => update({ status: v })}
          options={[
            { value: 'all', label: 'ทั้งหมด' },
            { value: 'low', label: 'ใกล้หมด' },
            { value: 'out', label: 'หมด' },
          ]}
        />
      </form>

      {hasFilters && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-ink-3">กำลังกรอง:</span>
          {initialQuery && (
            <Badge tone="neutral">
              ค้นหา: {initialQuery}
              <button type="button" onClick={() => { setQ(''); update({ q: '' }) }} className="ml-1 text-ink-3">
                <Icon name="close" size={11} />
              </button>
            </Badge>
          )}
          {initialCategory && (
            <Badge tone="neutral">
              {initialCategory}
              <button type="button" onClick={() => update({ category: '' })} className="ml-1 text-ink-3">
                <Icon name="close" size={11} />
              </button>
            </Badge>
          )}
          {initialStatus && initialStatus !== 'all' && (
            <Badge tone={initialStatus === 'out' ? 'danger' : 'warn'}>
              {initialStatus === 'out' ? 'สินค้าหมด' : 'ใกล้หมด'}
              <button type="button" onClick={() => update({ status: 'all' })} className="ml-1">
                <Icon name="close" size={11} />
              </button>
            </Badge>
          )}
          <button
            type="button"
            onClick={() => { setQ(''); update({ q: '', category: '', status: 'all' }) }}
            className="text-xs text-ink-3 underline ml-1"
          >
            ล้างทั้งหมด
          </button>
          {pending && <span className="text-xs text-ink-3 anim-fade">กำลังกรอง…</span>}
        </div>
      )}
    </div>
  )
}
