import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/app/lib/db'
import { verifySession } from '@/app/lib/dal'
import { StockBadge } from '@/app/ui/badge'
import Button from '@/app/ui/button'
import Icon from '@/app/ui/icon-svg'
import PageHeader from '@/app/ui/page-header'
import ProductSearch from './product-search'
import AddToCartButton from '@/app/ui/add-to-cart-button'
import ProductVariantCard, { type VariantItem } from '@/app/ui/product-variant-card'
import ImagePlaceholder, { hueFor } from '@/app/ui/image-placeholder'
import EmptyState, { EmptyArt } from '@/app/ui/empty-state'

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

  // Group products by variantGroup
  const variantMap = new Map<string, typeof products>()
  for (const p of products) {
    if (p.variantGroup) {
      if (!variantMap.has(p.variantGroup)) variantMap.set(p.variantGroup, [])
      variantMap.get(p.variantGroup)!.push(p)
    }
  }

  type CardEntry =
    | { type: 'standalone'; p: (typeof products)[0] }
    | { type: 'group'; key: string; variants: (typeof products)[0][] }

  const cards: CardEntry[] = []
  const seenGroups = new Set<string>()
  for (const p of products) {
    if (!p.variantGroup) {
      cards.push({ type: 'standalone', p })
    } else if (!seenGroups.has(p.variantGroup)) {
      seenGroups.add(p.variantGroup)
      cards.push({ type: 'group', key: p.variantGroup, variants: variantMap.get(p.variantGroup)! })
    }
  }

  const totalStock = allProducts.reduce((s, p) => s + p.stock, 0)
  const lowCount = allProducts.filter((p) => p.stock > 0 && p.stock <= p.minStock).length
  const outCount = allProducts.filter((p) => p.stock === 0).length

  const hasFilters = sp.q || sp.category || sp.status

  return (
    <div className="max-w-[1240px] mx-auto px-6 pt-7 pb-16">
      <PageHeader
        kicker="แคตตาล็อก"
        title="สินค้าทั้งหมด"
        subtitle={`${cards.length} รายการ · ${categories.length} หมวด`}
        actions={
          isAdmin && (
            <Link href="/products/new">
              <Button variant="primary" icon="plus">เพิ่มสินค้า</Button>
            </Link>
          )
        }
      />

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-[14px] overflow-hidden border border-line bg-line mb-4">
        {[
          { k: 'รายการทั้งหมด', v: allProducts.length, u: 'ชนิด', tone: '' },
          { k: 'สต็อกรวม',      v: totalStock.toLocaleString(), u: 'ชิ้น', tone: '' },
          { k: 'ใกล้หมด',       v: lowCount, u: 'ชนิด', tone: lowCount > 0 ? 'text-warn-soft-fg' : 'text-ink' },
          { k: 'หมด',           v: outCount, u: 'ชนิด', tone: outCount > 0 ? 'text-danger' : 'text-ink' },
        ].map((s, i) => (
          <div key={i} className="p-4 bg-surface">
            <div className="kicker">{s.k}</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className={['num mono text-[22px] font-semibold tracking-[-0.5px]', s.tone || 'text-ink'].join(' ')}>{s.v}</span>
              <span className="text-[11px] text-ink-3">{s.u}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <ProductSearch
        initialQuery={sp.q ?? ''}
        initialCategory={sp.category ?? ''}
        initialStatus={sp.status ?? 'all'}
        categories={categories.map((c) => c.category ?? '').filter(Boolean) as string[]}
      />

      {cards.length === 0 ? (
        <EmptyState
          illustration={<EmptyArt kind="search" />}
          title={hasFilters ? 'ไม่พบสินค้าตามตัวกรอง' : 'ยังไม่มีสินค้า'}
          description={hasFilters ? 'ลองปรับคำค้นหาหรือล้างตัวกรอง' : undefined}
          action={
            hasFilters ? (
              <Link href="/products">
                <Button variant="secondary">ล้างตัวกรอง</Button>
              </Link>
            ) : isAdmin ? (
              <Link href="/products/new">
                <Button variant="primary" icon="plus">เพิ่มสินค้า</Button>
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {cards.map((card, i) =>
            card.type === 'group' ? (
              <div
                key={card.key}
                className="anim-stagger"
                style={{ animationDelay: `${Math.min(i * 25, 400)}ms` }}
              >
                <ProductVariantCard
                  groupName={card.key}
                  variants={card.variants.map(
                    (p): VariantItem => ({
                      id: p.id,
                      name: p.name,
                      sku: p.sku,
                      price: Number(p.price),
                      imageUrl: p.imageUrl,
                      stock: p.stock,
                      minStock: p.minStock,
                      variantLabel: p.variantLabel,
                    }),
                  )}
                />
              </div>
            ) : (
              <ProductCard key={card.p.id} p={card.p} delay={Math.min(i * 25, 400)} />
            ),
          )}
        </div>
      )}
    </div>
  )
}

function ProductCard({ p, delay = 0 }: { p: any; delay?: number }) {
  const out = p.stock === 0
  const price = Number(p.price)
  return (
    <div
      className="anim-stagger group bg-surface rounded-[14px] border border-line overflow-hidden flex flex-col hover:border-line-hi hover:-translate-y-px transition-[border-color,transform]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Link href={`/products/${p.id}`} className="block">
        <div className="p-3 pb-0">
          {p.imageUrl ? (
            <Image src={p.imageUrl} alt={p.name} width={300} height={150} unoptimized
              className="w-full h-[150px] object-cover rounded-md group-hover:scale-105 transition-transform duration-200" />
          ) : (
            <ImagePlaceholder hue={hueFor(p.id)} label="product shot" className="w-full h-[150px]" />
          )}
        </div>
        <div className="px-3.5 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="mono text-[10.5px] text-ink-3 tracking-wide">{p.sku}</div>
              <div className="text-sm font-medium text-ink mt-0.5 line-clamp-1">{p.name}</div>
            </div>
            <StockBadge stock={p.stock} minStock={p.minStock} />
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="text-lg font-semibold text-ink tracking-tight">
              ฿{price.toLocaleString('th-TH', { minimumFractionDigits: price % 1 === 0 ? 0 : 2 })}
            </div>
            <div className="num text-[11.5px] text-ink-3">
              คงเหลือ <span className="text-ink-2 font-medium">{p.stock}</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="p-3 mt-2.5 mt-auto">
        <AddToCartButton
          product={{
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            price,
            imageUrl: p.imageUrl,
            maxStock: p.stock,
          }}
        />
      </div>
    </div>
  )
}
