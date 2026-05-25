import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/app/lib/db'
import { verifyStaff } from '@/app/lib/dal'
import { StockBadge } from '@/app/ui/badge'
import PageHeader from '@/app/ui/page-header'
import Card from '@/app/ui/card'
import Button from '@/app/ui/button'
import Icon from '@/app/ui/icon-svg'
import ImagePlaceholder, { hueFor } from '@/app/ui/image-placeholder'

export default async function StockOverviewPage() {
  await verifyStaff()

  const products = await prisma.product.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  const groups = new Map<string, typeof products>()
  for (const p of products) {
    const key = p.category ?? 'ไม่ระบุหมวด'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(p)
  }

  const totalStock = products.reduce((s, p) => s + p.stock, 0)
  const outOfStockCount = products.filter((p) => p.stock === 0).length
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length

  return (
    <div className="max-w-[1440px] mx-auto px-6 pt-7 pb-16">
      <PageHeader
        kicker="คลังสินค้า"
        title="จัดการสต็อก"
        subtitle={`${products.length} รายการ · ${groups.size} หมวด · รวม ${totalStock.toLocaleString()} ชิ้น`}
        actions={
          <>
            <Button variant="secondary" icon="download">Export</Button>
            <Link href="/products/new">
              <Button variant="primary" icon="plus">เพิ่มสินค้า</Button>
            </Link>
          </>
        }
      />

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-[14px] overflow-hidden border border-line bg-line mb-4">
        {[
          { k: 'SKU ทั้งหมด',   v: products.length.toString(),    u: 'ชนิด', tone: 'text-ink' },
          { k: 'รวมสต็อก',      v: totalStock.toLocaleString(),    u: 'ชิ้น', tone: 'text-ink' },
          { k: 'ใกล้หมด',       v: lowStockCount.toString(),       u: 'ชนิด', tone: lowStockCount > 0 ? 'text-warn-soft-fg' : 'text-ink' },
          { k: 'หมด',           v: outOfStockCount.toString(),     u: 'ชนิด', tone: outOfStockCount > 0 ? 'text-danger' : 'text-ink' },
        ].map((s) => (
          <div key={s.k} className="p-4 bg-surface">
            <div className="kicker">{s.k}</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className={['num mono text-[22px] font-semibold tracking-[-0.5px]', s.tone].join(' ')}>{s.v}</span>
              <span className="text-[11px] text-ink-3">{s.u}</span>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-ink-3 text-sm">ยังไม่มีสินค้า</p>
            <Link href="/products/new" className="mt-2 inline-block text-sm text-ink-2 underline">
              เพิ่มสินค้าใหม่
            </Link>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {[...groups.entries()].map(([category, items]) => {
            const groupTotal = items.reduce((s, p) => s + p.stock, 0)
            const hasOut = items.some((p) => p.stock === 0)
            const hasLow = items.some((p) => p.stock > 0 && p.stock <= p.minStock)
            return (
              <Card key={category} padded={false}>
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-surface-lo/50">
                  <div>
                    <span className="font-semibold text-ink text-[15px]">{category}</span>
                    <span className="text-xs text-ink-3 ml-2">{items.length} ชนิด</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {(hasOut || hasLow) && (
                      <span
                        className={[
                          'hidden sm:inline-flex text-[10.5px] font-medium px-2 py-0.5 rounded-full',
                          hasOut ? 'bg-danger-soft text-danger-soft-fg' : 'bg-warn-soft text-warn-soft-fg',
                        ].join(' ')}
                      >
                        {hasOut ? 'มีสินค้าหมด' : 'ใกล้หมด'}
                      </span>
                    )}
                    <div className="text-right">
                      <p className="num text-xl font-semibold text-ink leading-none m-0">{groupTotal}</p>
                      <p className="text-[11px] text-ink-3 m-0">รวม</p>
                    </div>
                  </div>
                </div>
                <div>
                  {items.map((p, i) => {
                    const pct = Math.min(100, (p.stock / Math.max(1, p.minStock * 2)) * 100)
                    const barColor = p.stock === 0 ? 'var(--danger)' : p.stock <= p.minStock ? 'var(--warn)' : 'var(--brand)'
                    return (
                      <Link
                        key={p.id}
                        href={`/products/${p.id}`}
                        className={[
                          'flex items-center px-5 py-3 gap-3 transition-colors hover:bg-surface-hi/50',
                          i < items.length - 1 && 'border-b border-line',
                        ].filter(Boolean).join(' ')}
                      >
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            width={38}
                            height={38}
                            unoptimized
                            className="w-[38px] h-[38px] rounded-md object-cover flex-shrink-0"
                          />
                        ) : (
                          <ImagePlaceholder hue={hueFor(p.id)} className="w-[38px] h-[38px] flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate m-0">
                            {p.variantLabel ? (
                              <>
                                {p.variantLabel}{' '}
                                <span className="text-ink-4 font-normal text-xs">({p.name})</span>
                              </>
                            ) : p.name}
                          </p>
                          <p className="mono text-[10.5px] text-ink-3 mt-0.5 m-0">{p.sku}</p>
                        </div>
                        <div className="hidden sm:block w-[120px]">
                          <div className="h-1 bg-surface-lo rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                          </div>
                          <div className="num mono text-[10px] text-ink-4 mt-1">min {p.minStock}</div>
                        </div>
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <StockBadge stock={p.stock} minStock={p.minStock} />
                          <span
                            className={[
                              'num mono text-base font-semibold w-9 text-right',
                              p.stock === 0 ? 'text-danger' : 'text-ink',
                            ].join(' ')}
                          >
                            {p.stock}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
