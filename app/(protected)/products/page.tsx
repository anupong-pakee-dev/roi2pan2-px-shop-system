import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/app/lib/db'
import { verifySession } from '@/app/lib/dal'
import StockBadge from '@/app/ui/stock-badge'
import ProductSearch from './product-search'
import AddToCartButton from '@/app/ui/add-to-cart-button'

type SearchParams = { q?: string; category?: string; status?: string }

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await verifySession()
  const sp = await searchParams
  const isAdmin = session.role === 'ADMIN'

  const allProducts = await prisma.product.findMany({
    where: {
      AND: [
        sp.q
          ? {
              OR: [
                { name: { contains: sp.q, mode: 'insensitive' } },
                { sku: { contains: sp.q, mode: 'insensitive' } },
              ],
            }
          : {},
        sp.category ? { category: sp.category } : {},
      ],
    },
    orderBy: { updatedAt: 'desc' },
  })

  const products = allProducts.filter((p) => {
    if (sp.status === 'out') return p.stock === 0
    if (sp.status === 'low') return p.stock > 0 && p.stock <= p.minStock
    return true
  })

  const categories = await prisma.product.groupBy({
    by: ['category'],
    where: { category: { not: null } },
    orderBy: { category: 'asc' },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">สินค้าทั้งหมด</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{products.length} รายการ</p>
        </div>
        {isAdmin && (
          <Link
            href="/products/new"
            className="bg-zinc-100 text-zinc-900 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-white transition-colors flex items-center gap-1.5"
          >
            <span>+</span> เพิ่มสินค้า
          </Link>
        )}
      </div>

      <ProductSearch
        categories={categories.map((c) => c.category!)}
        currentQ={sp.q}
        currentCategory={sp.category}
        currentStatus={sp.status}
      />

      {products.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <p className="text-lg">ไม่พบสินค้า</p>
          {isAdmin && (
            <Link href="/products/new" className="text-sm text-zinc-400 underline mt-2 block">
              เพิ่มสินค้าใหม่
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden flex flex-col"
            >
              {/* Clickable area → product detail */}
              <Link href={`/products/${p.id}`} className="block group">
                <div className="relative h-36 bg-zinc-800">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="px-3 pt-3 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-100 text-sm truncate group-hover:text-white transition-colors">
                        {p.name}
                      </p>
                      <p className="text-xs text-zinc-600 mt-0.5">{p.sku}</p>
                    </div>
                    <StockBadge stock={p.stock} minStock={p.minStock} />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-semibold text-zinc-200">
                      ฿{Number(p.price).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-zinc-600 tabular-nums">
                      คงเหลือ {p.stock}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Add to cart — separate from Link to avoid nested interaction */}
              <div className="px-3 pb-3 mt-auto">
                <AddToCartButton
                  product={{
                    productId: p.id,
                    productName: p.name,
                    sku: p.sku,
                    price: Number(p.price),
                    imageUrl: p.imageUrl,
                    maxStock: p.stock,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
