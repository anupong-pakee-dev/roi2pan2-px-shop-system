import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/db'
import { verifySession } from '@/app/lib/dal'
import StockBadge from '@/app/ui/stock-badge'
import StockAdjustForm from '@/app/ui/stock-adjust-form'
import DeleteButton from '@/app/ui/delete-button'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await verifySession()
  const isAdmin = session.role === 'ADMIN'
  const canAdjustStock = session.role === 'ADMIN' || session.role === 'STAFF'

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      stockLogs: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!product) notFound()

  // Fetch siblings if this product is part of a variant group
  const siblings = product.variantGroup
    ? await prisma.product.findMany({
        where: { variantGroup: product.variantGroup },
        select: { id: true, variantLabel: true, name: true, stock: true },
        orderBy: { name: 'asc' },
      })
    : []

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header — wraps gracefully on mobile */}
      <div className="mb-6">
        <Link href="/products" className="text-zinc-600 hover:text-zinc-300 transition-colors text-sm">
          ← กลับ
        </Link>
        <div className="flex items-start justify-between gap-3 mt-2">
          <div className="min-w-0">
            {product.variantGroup && (
              <p className="text-xs text-zinc-500 mb-0.5">{product.variantGroup}</p>
            )}
            <h1 className="text-xl font-semibold text-zinc-100 leading-snug">
              {product.variantLabel ?? product.name}
            </h1>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href={`/products/${id}/edit`}
                className="text-sm px-3 py-1.5 border border-zinc-700 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              >
                แก้ไข
              </Link>
              <DeleteButton id={id} name={product.name} />
            </div>
          )}
        </div>

        {/* Variant siblings selector */}
        {siblings.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-zinc-500">รส / ขนาด:</span>
            {siblings.map((s) => (
              <Link
                key={s.id}
                href={`/products/${s.id}`}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  s.id === product.id
                    ? 'bg-zinc-100 text-zinc-900'
                    : s.stock === 0
                    ? 'bg-zinc-800 text-zinc-600 border border-zinc-800 line-through'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
                }`}
              >
                {s.variantLabel ?? s.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Layout:
          Mobile (1 col): stock form first (first in DOM), then product info + history
          Desktop (3 cols): explicit placement — content cols 1-2, form col 3 */}
      <div className={`grid grid-cols-1 gap-5 ${canAdjustStock ? 'lg:grid-cols-3' : ''}`}>

        {/* Stock adjust form — first in DOM = first on mobile; col 3 on desktop */}
        {canAdjustStock && (
          <div className="lg:col-start-3 lg:row-start-1">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
              <h3 className="font-medium text-zinc-200 mb-4">ปรับ Stock</h3>
              <StockAdjustForm
                productId={product.id}
                currentStock={product.stock}
                productName={product.variantLabel ?? product.name}
              />
            </div>
          </div>
        )}

        {/* Product info + history — second in DOM = below form on mobile; cols 1-2 on desktop */}
        <div className={`space-y-5 ${canAdjustStock ? 'lg:col-span-2 lg:col-start-1 lg:row-start-1' : ''}`}>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 sm:p-5">
            <div className="flex gap-4">
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-zinc-100 text-base sm:text-lg">{product.name}</h2>
                    <p className="text-sm text-zinc-600 mt-0.5">SKU: {product.sku}</p>
                  </div>
                  <StockBadge stock={product.stock} minStock={product.minStock} />
                </div>

                {product.description && (
                  <p className="text-sm text-zinc-500 mt-2">{product.description}</p>
                )}

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-5 mt-4">
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider">ราคา</p>
                    <p className="font-semibold text-zinc-100 mt-0.5">
                      ฿{Number(product.price).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider">หมวดหมู่</p>
                    <p className="font-medium text-zinc-300 mt-0.5">{product.category ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider">Stock ขั้นต่ำ</p>
                    <p className="font-medium text-zinc-300 mt-0.5">{product.minStock}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider">คงเหลือ</p>
                    <p className="font-bold text-3xl text-zinc-100 leading-none mt-0.5 tabular-nums">{product.stock}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {canAdjustStock && (
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 sm:p-5">
              <h3 className="font-medium text-zinc-200 mb-4">ประวัติการเปลี่ยนแปลง Stock</h3>

              {product.stockLogs.length === 0 ? (
                <p className="text-sm text-zinc-600 text-center py-8">ยังไม่มีประวัติ</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {product.stockLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-3 gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          log.type === 'ADD'
                            ? 'bg-emerald-950 text-emerald-400'
                            : log.type === 'SUBTRACT'
                            ? 'bg-red-950 text-red-400'
                            : 'bg-blue-950 text-blue-400'
                        }`}>
                          {log.type === 'ADD' ? '+' : log.type === 'SUBTRACT' ? '−' : '='}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-zinc-300">
                            {log.type === 'ADD'
                              ? `+${log.quantity}`
                              : log.type === 'SUBTRACT'
                              ? `-${log.quantity}`
                              : `ตั้งเป็น ${log.quantity}`}
                            <span className="text-zinc-600 ml-2 text-xs tabular-nums">{log.before} → {log.after}</span>
                          </p>
                          {log.note && <p className="text-xs text-zinc-600 mt-0.5 truncate">{log.note}</p>}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-600 flex-shrink-0">
                        {log.createdAt.toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
