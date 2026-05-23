'use client'

import { useCart } from '@/app/lib/cart-context'

export default function CartNavButton() {
  const { totalItems, openCart } = useCart()

  return (
    <button
      onClick={openCart}
      className="relative p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
      aria-label="ตะกร้าสินค้า"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-zinc-100 text-zinc-900 text-[10px] font-bold rounded-full flex items-center justify-center px-1 tabular-nums">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  )
}
