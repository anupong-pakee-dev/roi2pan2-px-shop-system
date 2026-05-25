'use client'

import { useCart, type CartItem } from '@/app/lib/cart-context'
import Button from '@/app/ui/button'
import Icon from '@/app/ui/icon-svg'

type Product = Omit<CartItem, 'quantity'>

export default function AddToCartButton({ product }: { product: Product }) {
  const { getQuantity, addToCart, updateQuantity, removeFromCart } = useCart()
  const qty = getQuantity(product.productId)
  const outOfStock = product.maxStock === 0

  if (outOfStock) {
    return <Button variant="secondary" size="sm" full disabled>หมดสต็อก</Button>
  }

  if (qty === 0) {
    return (
      <Button variant="primary" size="sm" full icon="plus" onClick={() => addToCart(product, 1)}>
        เพิ่มลงตะกร้า
      </Button>
    )
  }

  return (
    <div className="inline-flex items-center bg-surface-lo border border-line rounded-md overflow-hidden h-8 w-full">
      <button
        onClick={() =>
          qty === 1 ? removeFromCart(product.productId) : updateQuantity(product.productId, qty - 1)
        }
        className="w-8 h-8 inline-flex items-center justify-center text-ink-2 border-r border-line hover:bg-surface-hi"
      >
        <Icon name="minus" size={14} />
      </button>
      <div className="num flex-1 text-center font-semibold text-ink text-sm">{qty}</div>
      <button
        onClick={() => addToCart(product, 1)}
        disabled={qty >= product.maxStock}
        className="w-8 h-8 inline-flex items-center justify-center text-ink-2 border-l border-line hover:bg-surface-hi disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Icon name="plus" size={14} />
      </button>
    </div>
  )
}
