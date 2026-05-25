'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/app/lib/cart-context'
import Button from '@/app/ui/button'
import Icon from '@/app/ui/icon-svg'
import { EmptyArt } from '@/app/ui/empty-state'
import ImagePlaceholder, { hueFor } from '@/app/ui/image-placeholder'

export default function CartDrawer() {
  const { items, totalItems, totalPrice, isOpen, closeCart, removeFromCart, updateQuantity, clearCart } =
    useCart()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div onClick={closeCart} className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[4px] anim-fade" />
      <aside
        className="anim-drawer fixed top-0 right-0 bottom-0 z-50 w-[460px] max-w-full bg-bg border-l border-line flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div>
            <div className="kicker">ตะกร้า</div>
            <div className="text-[17px] font-semibold text-ink mt-0.5">
              {items.length === 0 ? 'ว่างเปล่า' : `${totalItems} ชิ้น · ${items.length} รายการ`}
            </div>
          </div>
          <button
            onClick={closeCart}
            title="ปิด"
            className="w-9 h-9 rounded-md inline-flex items-center justify-center text-ink-2 hover:bg-surface-hi hover:text-ink"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scroll-thin">
          {items.length === 0 ? (
            <div className="text-center px-6 py-14">
              <EmptyArt kind="cart" size={104} />
              <div className="mt-4 text-ink font-medium text-[15px]">ตะกร้าว่างเปล่า</div>
              <div className="mt-1 text-ink-3 text-[12.5px] max-w-[240px] mx-auto">
                กดเพิ่มสินค้าจากแคตตาล็อกเพื่อเริ่มสั่งซื้อ
              </div>
              <div className="mt-5">
                <Button variant="primary" icon="store" onClick={closeCart}>เลือกสินค้า</Button>
              </div>
            </div>
          ) : (
            <div className="px-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 py-3.5 border-b border-line">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      width={64}
                      height={64}
                      unoptimized
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <ImagePlaceholder hue={hueFor(item.productId)} className="w-16 h-16 rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-medium text-ink truncate">{item.productName}</div>
                        <div className="mono text-[10.5px] text-ink-3 mt-0.5">{item.sku}</div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-ink-3 hover:text-danger h-5"
                        title="ลบ"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      <div className="inline-flex items-center bg-surface-lo border border-line rounded-md overflow-hidden h-8">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 inline-flex items-center justify-center text-ink-2 border-r border-line hover:bg-surface-hi"
                        >
                          <Icon name="minus" size={14} />
                        </button>
                        <span className="num w-10 text-center font-semibold text-ink text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="w-8 h-8 inline-flex items-center justify-center text-ink-2 border-l border-line hover:bg-surface-hi disabled:opacity-30"
                        >
                          <Icon name="plus" size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="num text-[14.5px] font-semibold text-ink">
                          ฿{(item.price * item.quantity).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="num text-[11px] text-ink-3">
                          ฿{item.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })} × {item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-line bg-surface-lo">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-ink-3 text-[13px]">ยอดรวม</span>
              <span className="num text-[22px] font-semibold text-ink">
                ฿{totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[11px] text-ink-4 mb-3">* ยังไม่รวมค่าจัดส่ง</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={clearCart}>ล้าง</Button>
              <Link href="/orders/new" onClick={closeCart} className="flex-1">
                <Button variant="primary" full iconRight="arrowR">ดำเนินการสั่งซื้อ</Button>
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
