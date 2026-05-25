'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { StockBadge } from '@/app/ui/badge'
import AddToCartButton from '@/app/ui/add-to-cart-button'
import ImagePlaceholder, { hueFor } from '@/app/ui/image-placeholder'

export type VariantItem = {
  id: string
  name: string
  sku: string
  price: number
  imageUrl: string | null
  stock: number
  minStock: number
  variantLabel: string | null
}

export default function ProductVariantCard({
  groupName,
  variants,
}: {
  groupName: string
  variants: VariantItem[]
}) {
  const [selectedId, setSelectedId] = useState(
    variants.find((v) => v.stock > 0)?.id ?? variants[0].id,
  )
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0]

  return (
    <div className="group bg-surface rounded-[14px] border border-line overflow-hidden flex flex-col hover:border-line-hi hover:-translate-y-px transition-[border-color,transform]">
      <Link href={`/products/${selected.id}`} className="block">
        <div className="relative p-3 pb-0">
          {selected.imageUrl ? (
            <Image
              src={selected.imageUrl}
              alt={groupName}
              width={300}
              height={150}
              unoptimized
              className="w-full h-[150px] object-cover rounded-md group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <ImagePlaceholder hue={hueFor(selected.id)} label="product shot" className="w-full h-[150px]" />
          )}
          <span
            className="absolute top-5 left-5 text-[10.5px] px-2 h-[18px] inline-flex items-center rounded-full mono border border-line text-ink-2"
            style={{
              background: 'color-mix(in oklch, var(--bg) 70%, transparent)',
              backdropFilter: 'blur(6px)',
            }}
          >
            {variants.length} ตัวเลือก
          </span>
        </div>
        <div className="px-3.5 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-[11.5px] text-ink-3 tracking-wide">{groupName}</div>
              <div className="text-sm font-medium text-ink mt-0.5">{selected.variantLabel ?? selected.name}</div>
            </div>
            <StockBadge stock={selected.stock} minStock={selected.minStock} />
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="text-lg font-semibold text-ink tracking-tight">
              ฿{selected.price.toLocaleString('th-TH', { minimumFractionDigits: selected.price % 1 === 0 ? 0 : 2 })}
            </div>
            <div className="num text-[11.5px] text-ink-3">
              คงเหลือ <span className="text-ink-2 font-medium">{selected.stock}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Variant chips */}
      <div className="px-3 pt-2.5 flex flex-wrap gap-1.5">
        {variants.map((v) => {
          const active = v.id === selectedId
          const out = v.stock === 0
          return (
            <button
              key={v.id}
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelectedId(v.id) }}
              className={[
                'px-2.5 py-1 rounded-full text-[11.5px] font-medium transition-[background,color,border-color] border',
                active
                  ? 'bg-ink text-bg border-ink'
                  : out
                  ? 'bg-surface-lo text-ink-4 border-line line-through'
                  : 'bg-surface-lo text-ink-2 border-line hover:text-ink',
              ].join(' ')}
            >
              {v.variantLabel ?? v.name}
            </button>
          )
        })}
      </div>

      <div className="p-3 mt-2.5 mt-auto">
        <AddToCartButton
          product={{
            productId: selected.id,
            productName: selected.name,
            sku: selected.sku,
            price: selected.price,
            imageUrl: selected.imageUrl,
            maxStock: selected.stock,
          }}
        />
      </div>
    </div>
  )
}
