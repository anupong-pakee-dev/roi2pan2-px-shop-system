'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/app/lib/cart-context'

export default function CartDrawer() {
  const { items, totalItems, totalPrice, isOpen, closeCart, removeFromCart, updateQuantity, clearCart } =
    useCart()

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-zinc-950 border-l border-zinc-800 z-40 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="font-semibold text-zinc-100">ตะกร้าสินค้า</h2>
            {totalItems > 0 && (
              <span className="bg-zinc-700 text-zinc-200 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-600 px-5">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-sm">ตะกร้าว่างเปล่า</p>
              <button
                onClick={closeCart}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline transition-colors"
              >
                เลือกสินค้า
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 px-5 py-4">
                  {/* Image */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-700">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{item.productName}</p>
                    <p className="text-xs text-zinc-500">{item.sku}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      ฿{item.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })} / ชิ้น
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 text-sm font-bold transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-zinc-100 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                      <span className="text-xs text-zinc-600 ml-1">
                        เหลือ {item.maxStock}
                      </span>
                    </div>
                  </div>

                  {/* Subtotal + remove */}
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-zinc-700 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-sm font-semibold text-zinc-200 tabular-nums">
                      ฿{(item.price * item.quantity).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-800 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">ยอดรวมสินค้า</span>
              <span className="text-lg font-bold text-zinc-100">
                ฿{totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-zinc-600">* ยังไม่รวมค่าจัดส่ง</p>

            <Link
              href="/orders/new"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full bg-zinc-100 text-zinc-900 rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              ดำเนินการสั่งซื้อ
            </Link>

            <button
              onClick={clearCart}
              className="w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-1"
            >
              ล้างตะกร้า
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
