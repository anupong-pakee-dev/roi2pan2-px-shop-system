'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createOrder } from '@/app/actions/orders'
import { useCart } from '@/app/lib/cart-context'

type Product = {
  id: string
  name: string
  sku: string
  price: string
  stock: number
  category: string | null
  imageUrl: string | null
}

type DeliveryAddress = {
  id: string
  label: string
  detail: string
  shippingFee: number
}

type Props = { products: Product[]; addresses: DeliveryAddress[] }

const inputCls =
  'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition'

export default function OrderClient({ products, addresses }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { items: cartItems, clearCart } = useCart()

  const [cart, setCart] = useState<Record<string, number>>({})
  const [addressId, setAddressId] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  // Pre-fill from cart context once on mount
  useEffect(() => {
    if (cartItems.length > 0) {
      const initial: Record<string, number> = {}
      cartItems.forEach((item) => { if (item.quantity > 0) initial[item.productId] = item.quantity })
      setCart(initial)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Only show products that are in the cart (qty > 0)
  const selectedProducts = useMemo(
    () => products.filter((p) => (cart[p.id] ?? 0) > 0),
    [products, cart]
  )

  const selectedAddress = addresses.find((a) => a.id === addressId)

  const orderItems = useMemo(
    () =>
      selectedProducts.map((p) => ({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        unitPrice: Number(p.price),
        quantity: cart[p.id]!,
        subtotal: Number(p.price) * cart[p.id]!,
      })),
    [selectedProducts, cart]
  )

  const subtotal = orderItems.reduce((s, i) => s + i.subtotal, 0)
  const shippingFee = selectedAddress?.shippingFee ?? 0
  const total = subtotal + shippingFee

  function setQty(productId: string, qty: number, max: number) {
    if (qty <= 0) {
      setCart((prev) => { const next = { ...prev }; delete next[productId]; return next })
    } else {
      setCart((prev) => ({ ...prev, [productId]: Math.min(qty, max) }))
    }
  }

  function handleSubmit() {
    if (!orderItems.length || !addressId) return
    setError('')
    startTransition(async () => {
      const result = await createOrder({
        items: orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        addressId,
        note: note || undefined,
      })
      if ('error' in result) {
        setError(result.error)
        return
      }
      clearCart()
      router.push(`/orders/${result.orderId}`)
    })
  }

  const canSubmit = orderItems.length > 0 && addressId !== ''

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Selected items list */}
      <div className="flex-1 space-y-3">
        {selectedProducts.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center space-y-3">
            <svg className="w-10 h-10 text-zinc-700 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-zinc-500 text-sm">ยังไม่ได้เลือกสินค้า</p>
            <Link
              href="/products"
              className="inline-block text-sm text-zinc-300 hover:text-white underline transition-colors"
            >
              ← กลับไปเลือกสินค้า
            </Link>
          </div>
        ) : (
          selectedProducts.map((p) => {
            const qty = cart[p.id] ?? 0
            return (
              <div
                key={p.id}
                className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex items-center gap-4"
              >
                {/* Image */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.sku}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    ฿{Number(p.price).toLocaleString('th-TH', { minimumFractionDigits: 2 })} / ชิ้น
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setQty(p.id, qty - 1, p.stock)}
                    className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 text-sm font-bold transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={p.stock}
                    value={qty}
                    onChange={(e) => setQty(p.id, parseInt(e.target.value) || 0, p.stock)}
                    className="w-12 text-center bg-zinc-800 border border-zinc-700 rounded-lg py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={() => setQty(p.id, qty + 1, p.stock)}
                    disabled={qty >= p.stock}
                    className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <p className="text-sm font-semibold text-zinc-200 tabular-nums flex-shrink-0 w-24 text-right">
                  ฿{(Number(p.price) * qty).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )
          })
        )}

        {selectedProducts.length > 0 && (
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors mt-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มสินค้าอื่น
          </Link>
        )}
      </div>

      {/* Order summary */}
      <div className="w-full lg:w-80 lg:sticky lg:top-20">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-zinc-200">สรุปคำสั่งซื้อ</h2>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              ที่อยู่จัดส่ง <span className="text-red-500">*</span>
            </label>
            <select
              value={addressId}
              onChange={(e) => setAddressId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <option value="">-- เลือกที่อยู่ --</option>
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} {a.shippingFee > 0 ? `(+฿${a.shippingFee})` : '(ฟรี)'}
                </option>
              ))}
            </select>
            {selectedAddress?.detail && (
              <p className="text-xs text-zinc-600 mt-1">{selectedAddress.detail}</p>
            )}
          </div>

          <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-zinc-400">
              <span>ยอดสินค้า</span>
              <span>฿{subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>ค่าจัดส่ง</span>
              <span>{shippingFee === 0 ? 'ฟรี' : `฿${shippingFee.toLocaleString('th-TH')}`}</span>
            </div>
            <div className="flex justify-between font-semibold text-zinc-100 text-base border-t border-zinc-800 pt-2 mt-1">
              <span>รวมทั้งหมด</span>
              <span>฿{total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">หมายเหตุ (ไม่บังคับ)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="ระบุข้อความเพิ่มเติม..."
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className="w-full bg-zinc-100 text-zinc-900 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'กำลังส่งคำสั่งซื้อ...' : 'ส่งคำสั่งซื้อ'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full text-sm text-zinc-600 hover:text-zinc-400 py-1 transition-colors"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  )
}
