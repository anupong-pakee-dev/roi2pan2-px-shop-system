'use client'

import { useCart, type CartItem } from '@/app/lib/cart-context'

type Product = Omit<CartItem, 'quantity'>

export default function AddToCartButton({ product }: { product: Product }) {
  const { getQuantity, addToCart, updateQuantity, removeFromCart } = useCart()
  const qty = getQuantity(product.productId)
  const outOfStock = product.maxStock === 0

  if (outOfStock) {
    return (
      <div className="w-full text-center text-xs text-zinc-600 border border-zinc-800 rounded-lg py-2">
        สินค้าหมด
      </div>
    )
  }

  if (qty === 0) {
    return (
      <button
        onClick={() => addToCart(product, 1)}
        className="w-full flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-lg py-2 text-xs font-medium transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        ใส่ตะกร้า
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() =>
          qty === 1 ? removeFromCart(product.productId) : updateQuantity(product.productId, qty - 1)
        }
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 font-bold transition-colors text-sm"
      >
        −
      </button>
      <span className="flex-1 text-center text-sm font-semibold text-zinc-100 tabular-nums">
        {qty}
      </span>
      <button
        onClick={() => addToCart(product, 1)}
        disabled={qty >= product.maxStock}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
      >
        +
      </button>
    </div>
  )
}
