'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

export type CartItem = {
  productId: string
  productName: string
  sku: string
  price: number
  imageUrl: string | null
  quantity: number
  maxStock: number
}

type CartContextType = {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addToCart: (product: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  clearCart: () => void
  getQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Hydrate from localStorage once on mount
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem('px_cart')
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  // Persist to localStorage whenever items change (after mount)
  useEffect(() => {
    if (mounted) localStorage.setItem('px_cart', JSON.stringify(items))
  }, [items, mounted])

  const addToCart = useCallback(
    (product: Omit<CartItem, 'quantity'>, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.productId)
        if (existing) {
          return prev.map((i) =>
            i.productId === product.productId
              ? { ...i, quantity: Math.min(i.quantity + qty, product.maxStock) }
              : i
          )
        }
        return [...prev, { ...product, quantity: Math.min(qty, product.maxStock) }]
      })
    },
    []
  )

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId))
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.min(qty, i.maxStock) }
            : i
        )
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])
  const getQuantity = useCallback(
    (productId: string) =>
      items.find((i) => i.productId === productId)?.quantity ?? 0,
    [items]
  )

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
