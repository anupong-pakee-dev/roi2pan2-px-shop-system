import Link from 'next/link'
import { prisma } from '@/app/lib/db'
import { verifyStaff } from '@/app/lib/dal'
import Card from '@/app/ui/card'
import Badge, { StockBadge } from '@/app/ui/badge'
import Button from '@/app/ui/button'
import Icon from '@/app/ui/icon-svg'
import ImagePlaceholder, { hueFor } from '@/app/ui/image-placeholder'
import { SparkBar, SparkLine, Donut } from '@/app/ui/charts'
import EmptyState, { EmptyArt } from '@/app/ui/empty-state'
import StockLogRow from '@/app/ui/stock-log-row'

const CAT_COLORS = [
  'oklch(0.72 0.17 145)',
  'oklch(0.72 0.15 230)',
  'oklch(0.78 0.16 75)',
  'oklch(0.72 0.17 290)',
  'oklch(0.72 0.18 25)',
]

const STAT_TONES = {
  brand:   { ring: 'bg-brand-soft text-brand-soft-fg',   spark: 'var(--brand)' },
  warn:    { ring: 'bg-warn-soft text-warn-soft-fg',     spark: 'var(--warn)' },
  danger:  { ring: 'bg-danger-soft text-danger-soft-fg', spark: 'var(--danger)' },
  neutral: { ring: 'bg-surface-hi text-ink-2',           spark: 'var(--brand)' },
} as const

type StatTone = keyof typeof STAT_TONES

export default async function DashboardPage() {
  const session = await verifyStaff()

  const [
    user,
    totalProducts,
    stockAgg,
    valueAgg,
    outOfStockCount,
    lowStockRaw,
    recentLogs,
    categoryStats,
    activeOrders,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, select: { username: true } }),
    prisma.product.count(),
    prisma.product.aggregate({ _sum: { stock: true } }),
    prisma.product.findMany({ select: { stock: true, price: true } }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.product.findMany({
      where: { stock: { gt: 0 } },
      select: { id: true, name: true, sku: true, stock: true, minStock: true, category: true, imageUrl: true },
      orderBy: { stock: 'asc' },
    }),
    prisma.stockLog.findMany({
      include: { product: { select: { name: true, sku: true } } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.product.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { stock: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    prisma.order.findMany({
      where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] } },
      include: { items: { select: { quantity: true } } },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
  ])

  const lowStock = lowStockRaw.filter((p) => p.stock <= p.minStock)
  const outOfStockList = await prisma.product.findMany({
    where: { stock: 0 },
    select: { id: true, name: true, sku: true, stock: true, minStock: true, imageUrl: true },
    take: 6,
  })

  const totalStock = stockAgg._sum.stock ?? 0
  const stockValue = valueAgg.reduce((s, p) => s + p.stock * Number(p.price), 0)

  const dateStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })

  const STATS: Array<{ kicker: string; value: string | number; unit: string; icon: string; tone: StatTone; trend?: string; spark: number[]; highlight?: boolean }> = [
    { kicker: 'สินค้าทั้งหมด', value: totalProducts,               unit: 'ชนิด',   icon: 'box',    tone: 'neutral', trend: '+3 สัปดาห์นี้',  spark: [86, 92, 88, 94, 102, 98, 110, totalProducts] },
    { kicker: 'รวมสต็อก',     value: totalStock.toLocaleString(), unit: 'ชิ้น',   icon: 'layers', tone: 'brand',   trend: '+124 ชิ้นวันนี้', spark: [12, 18, 22, 18, 24, 28, 32, 38], highlight: true },
    { kicker: 'ใกล้หมด',      value: lowStock.length,             unit: 'ชนิด',   icon: 'warn',   tone: 'warn',    trend: 'ต้องตรวจสอบ',   spark: [4, 6, 5, 7, 8, 6, 7, 6] },
    { kicker: 'หมดสต็อก',     value: outOfStockCount,             unit: 'ชนิด',   icon: 'bolt',   tone: 'danger',  trend: 'ต้องสั่งซื้อ',  spark: [2, 1, 3, 2, 2, 3, 4, 3] },
  ]

  return (
    <div className="max-w-[1440px] mx-auto px-6 pt-7 pb-16">
      {/* Editorial header */}
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="kicker mb-2 flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-soft text-brand-soft-fg">
              <span className="w-1.5 h-1.5 rounded-full bg-brand anim-pulse" />
              LIVE
            </span>
            <span>แดชบอร์ด · {dateStr}</span>
          </div>
          <h1 className="m-0 text-[32px] font-semibold tracking-tight text-ink leading-tight">
            สวัสดี, {user?.username} <span className="text-ink-3">·</span>{' '}
            <span className="text-ink-2 font-normal">ภาพรวมวันนี้</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="download">Export</Button>
          <Button variant="primary" icon="bolt">รับเข้าสต็อก</Button>
        </div>
      </div>

      {/* Hero metric + activity */}
      <div className="grid lg:grid-cols-[1.1fr_2fr] gap-3.5 mb-3.5">
        <div className="relative bg-surface border border-line rounded-[18px] p-5 overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: 'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              maskImage: 'radial-gradient(circle at 70% 100%, black, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(circle at 70% 100%, black, transparent 70%)',
            }}
          />
          <div className="relative">
            <div className="kicker">มูลค่าสต็อกรวม · STOCK VALUE</div>
            <div className="num mono mt-3.5 text-[52px] font-semibold text-ink leading-none tracking-[-1.5px]">
              ฿{Math.round(stockValue).toLocaleString()}
            </div>
            <div className="mt-2.5 flex items-center gap-2.5 text-xs">
              <span className="inline-flex items-center gap-1 text-brand-soft-fg font-medium">
                <Icon name="arrowUp" size={11} /> +8.4%
              </span>
              <span className="text-ink-3">เทียบ 14 วันที่แล้ว</span>
            </div>
            <div className="mt-4">
              <SparkLine data={[64, 68, 65, 72, 78, 74, 82, 86, 90, 88, 96, 102, 108, 115]} height={48} />
            </div>
            <div className="mt-4 pt-3.5 border-t border-line flex justify-between text-[11px] text-ink-3">
              <span>14 วันก่อน</span><span>วันนี้</span>
            </div>
          </div>
        </div>

        {/* Activity placeholder */}
        <Card>
          <div className="flex items-start justify-between mb-3.5">
            <div>
              <div className="kicker">กิจกรรมสต็อก · 14 วันล่าสุด</div>
              <div className="font-semibold text-ink text-base mt-1">การเคลื่อนไหวรับเข้า/ตัดออก</div>
            </div>
            <div className="flex gap-3.5 text-[11.5px]">
              <span className="inline-flex items-center gap-1.5 text-ink-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-brand" /> รับเข้า
              </span>
              <span className="inline-flex items-center gap-1.5 text-ink-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-danger" /> ตัดออก
              </span>
            </div>
          </div>
          <ActivityBars />
        </Card>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {STATS.map((s) => {
          const tone = STAT_TONES[s.tone]
          return (
            <div
              key={s.kicker}
              className={[
                'relative rounded-[14px] p-5 overflow-hidden transition-[border-color,transform]',
                s.highlight ? 'bg-brand-soft border border-transparent' : 'bg-surface border border-line hover:border-line-hi hover:-translate-y-px',
              ].join(' ')}
            >
              <div className="flex items-start justify-between">
                <div className={['kicker', s.highlight ? 'text-brand-soft-fg' : ''].join(' ')}>
                  {s.kicker}
                </div>
                <span className={['w-7 h-7 rounded-md inline-flex items-center justify-center', tone.ring].join(' ')}>
                  <Icon name={s.icon} size={15} />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className={[
                  'num mono font-semibold tracking-[-0.6px] leading-none text-[34px]',
                  s.highlight ? 'text-brand-soft-fg' : 'text-ink',
                ].join(' ')}>{s.value}</span>
                <span className={['text-[11.5px]', s.highlight ? 'text-brand-soft-fg opacity-80' : 'text-ink-3'].join(' ')}>
                  {s.unit}
                </span>
              </div>
              <div className="mt-3 h-6">
                <SparkBar data={s.spark} height={24} color={tone.spark} />
              </div>
              {s.trend && (
                <div className={[
                  'mt-2 text-[11.5px]',
                  s.highlight ? 'text-brand-soft-fg' : 'text-ink-3',
                ].join(' ')}>
                  {s.trend}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Low stock + Categories donut */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-3.5 mb-3.5">
        <Card>
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <div className="kicker">ต้องดูแล · ATTENTION</div>
              <div className="font-semibold text-ink text-base mt-1">สินค้าใกล้หมด & หมดแล้ว</div>
            </div>
            <Link href="/dashboard/stock" className="text-xs text-ink-3 hover:text-ink-2 inline-flex items-center gap-1">
              ดูทั้งหมด <Icon name="arrowR" size={12} />
            </Link>
          </div>

          {[...outOfStockList, ...lowStock].length === 0 ? (
            <EmptyState illustration={<EmptyArt kind="check" />} title="คลังครบทุกชิ้น" description="ไม่มีสินค้าที่ต้องดูแลตอนนี้" />
          ) : (
            <div className="flex flex-col gap-0.5">
              {[...outOfStockList, ...lowStock].slice(0, 6).map((p, i) => {
                const pct = Math.min(100, (p.stock / Math.max(1, (p.minStock ?? 0) * 2)) * 100)
                const colorVar = p.stock === 0 ? 'var(--danger)' : 'var(--warn)'
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="anim-stagger flex items-center gap-3 w-full px-2.5 py-2.5 rounded-md text-left transition-colors hover:bg-surface-hi/50"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <span className="num mono w-6 text-[11px] text-ink-4">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="w-[38px] h-[38px] rounded-md object-cover" />
                    ) : (
                      <ImagePlaceholder hue={hueFor(p.id)} className="w-[38px] h-[38px]" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-medium text-ink truncate">{p.name}</div>
                      <div className="mono text-[11px] text-ink-3 mt-0.5">{p.sku}</div>
                    </div>
                    <div className="w-[90px]">
                      <div className="h-1 bg-surface-lo rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colorVar }} />
                      </div>
                      <div className="num mono text-[10px] text-ink-3 mt-1">ขั้นต่ำ {p.minStock}</div>
                    </div>
                    <div className={[
                      'num mono w-11 text-right text-xl font-semibold',
                      p.stock === 0 ? 'text-danger' : 'text-warn-soft-fg',
                    ].join(' ')}>
                      {p.stock}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4">
            <div className="kicker">หมวดหมู่ · BREAKDOWN</div>
            <div className="font-semibold text-ink text-base mt-1">การกระจายของสินค้า</div>
          </div>

          <div className="flex items-center gap-4">
            <Donut
              segments={categoryStats.map((c, i) => ({
                value: c._count.id,
                color: CAT_COLORS[i % CAT_COLORS.length],
              }))}
              size={120}
              thickness={14}
              center={
                <>
                  <span className="num text-2xl font-semibold text-ink leading-none">{totalProducts}</span>
                  <span className="text-[10.5px] text-ink-3">ชนิด</span>
                </>
              }
            />
            <div className="flex-1 flex flex-col gap-2">
              {categoryStats.map((c, i) => (
                <div key={c.category ?? 'none'} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                  <span className="flex-1 text-ink-2">{c.category ?? 'ไม่ระบุ'}</span>
                  <span className="num text-ink font-medium">{c._count.id}</span>
                  <span className="num text-ink-4 text-[11px] w-10 text-right">
                    {Math.round((c._count.id / totalProducts) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Stock log + active orders */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-3.5">
        <Card padded={false}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <div>
              <div className="kicker">ล่าสุด · STOCK LOG</div>
              <div className="font-semibold text-ink text-base mt-1">การเปลี่ยนแปลงสต็อก</div>
            </div>
            <Link href="/dashboard/stock" className="text-xs text-ink-3 hover:text-ink-2 inline-flex items-center gap-1">
              ดูทั้งหมด <Icon name="arrowR" size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['สินค้า', 'ประเภท', 'จำนวน', 'ก่อน → หลัง', 'เวลา', 'ผู้ทำ'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 kicker font-medium bg-surface-lo border-b border-line">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log, i) => (
                  <StockLogRow key={log.id} log={log} isLast={i === recentLogs.length - 1} delay={i * 30} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <div className="kicker">ออเดอร์ · ACTIVE</div>
              <div className="font-semibold text-ink text-base mt-1">{activeOrders.length} กำลังดำเนินการ</div>
            </div>
            <Link href="/dashboard/orders" className="text-xs text-ink-3 hover:text-ink-2 inline-flex items-center gap-1">
              จัดการ <Icon name="arrowR" size={12} />
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {activeOrders.length === 0 && (
              <EmptyState illustration={<EmptyArt kind="check" />} title="ไม่มีออเดอร์ที่ค้าง" />
            )}
            {activeOrders.map((o, i) => (
              <Link
                key={o.id}
                href={`/dashboard/orders/${o.id}`}
                className="anim-stagger flex items-center gap-2.5 px-3 py-2.5 rounded-md border border-line bg-surface-lo hover:bg-surface-hi/50 transition-colors"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="mono text-[11.5px] text-ink-2">#{o.id.slice(-8).toUpperCase()}</span>
                    <Badge tone={o.status === 'PENDING' ? 'warn' : 'info'} size="sm" dot>{o.status}</Badge>
                  </div>
                  <div className="text-[11.5px] text-ink-3 mt-0.5">
                    {o.addressLabel} · {o.items.length} รายการ
                  </div>
                </div>
                <div className="num text-sm font-semibold text-ink">
                  ฿{Number(o.total).toLocaleString('th-TH')}
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

/* Lightweight stacked-bar activity chart (server-rendered, no interaction)
   Real interaction (hover tooltips) can be added by extracting to a client component. */
function ActivityBars() {
  const labels = ['11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24']
  const ins  = [42, 18, 24, 31, 12, 8, 56, 22, 19, 28, 14, 36, 88, 124]
  const outs = [28, 36, 14, 22, 38, 12, 18, 41, 26, 19, 22, 31, 44, 38]
  const max = Math.max(...ins.map((v, i) => v + outs[i]))
  const H = 170
  return (
    <>
      <div className="relative flex items-end gap-2" style={{ height: H }}>
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <div
              key={p}
              className="absolute left-0 right-0 bg-line"
              style={{ bottom: `${p * 100}%`, height: 1, opacity: p === 0 ? 1 : 0.35 }}
            />
          ))}
        </div>
        {labels.map((_, i) => {
          const hIn = (ins[i] / max) * (H - 8)
          const hOut = (outs[i] / max) * (H - 8)
          return (
            <div key={i} className="flex-1 h-full flex flex-col justify-end gap-px relative">
              <span style={{ height: hOut, background: 'color-mix(in oklch, var(--danger) 70%, transparent)', borderRadius: '2px 2px 0 0' }} />
              <span style={{ height: hIn, background: 'color-mix(in oklch, var(--brand) 70%, transparent)', borderRadius: hOut > 0 ? '0 0 2px 2px' : 2 }} />
            </div>
          )
        })}
      </div>
      <div className="flex gap-2 mt-2">
        {labels.map((d, i) => (
          <span key={i} className={[
            'num mono flex-1 text-center text-[10.5px]',
            i === labels.length - 1 ? 'text-ink-2' : 'text-ink-4',
          ].join(' ')}>
            {d}
          </span>
        ))}
      </div>
    </>
  )
}
