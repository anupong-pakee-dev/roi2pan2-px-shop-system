'use client'

import Link from 'next/link'
import Icon from '@/app/ui/icon-svg'
import { useCart } from '@/app/lib/cart-context'

export default function CartNavButton() {
  const { totalItems, openCart } = useCart()
  const has = totalItems > 0
  return (
    <button
      onClick={openCart}
      className={[
        'inline-flex items-center gap-1.5 h-9 px-3 rounded-md border text-[13px] font-medium flex-shrink-0',
        'transition-[background,color,border-color]',
        has
          ? 'bg-brand-soft text-brand-soft-fg border-transparent'
          : 'bg-transparent text-ink-2 border-line hover:bg-surface-hi',
      ].join(' ')}
    >
      <Icon name="cart" size={16} />
      <span>ตะกร้า</span>
      {has && (
        <span className="num inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-brand text-ink-on-brand text-[11px] font-semibold">
          {totalItems}
        </span>
      )}
    </button>
  )
}
