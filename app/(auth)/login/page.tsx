import PXMark from '@/app/ui/px-mark'
import { SparkBar } from '@/app/ui/charts'
import LiveTicker from '@/app/ui/live-ticker'
import LoginForm from './login-form'
import { getLoginStats } from '@/app/lib/login-stats'

export default async function LoginPage() {
  const stats = await getLoginStats().catch(() => null)

  const heroStats = [
    {
      kicker: 'สินค้า',
      value: stats ? stats.productCount.toLocaleString() : '—',
      unit: 'ชนิด',
      spark: stats ? Array(7).fill(stats.productCount) : [0, 0, 0, 0, 0, 0, 0],
    },
    {
      kicker: 'สต็อก',
      value: stats ? stats.totalStock.toLocaleString() : '—',
      unit: 'ชิ้น',
      spark: stats ? stats.stockSpark : [0, 0, 0, 0, 0, 0, 0],
    },
    {
      kicker: 'ออเดอร์',
      value: stats ? stats.activeOrderCount.toLocaleString() : '—',
      unit: 'รายการ',
      spark: stats ? stats.orderSpark : [0, 0, 0, 0, 0, 0, 0],
    },
  ]

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_480px] bg-bg">
      {/* Left — hero */}
      <div className="relative bg-surface border-r border-line p-10 lg:p-14 flex flex-col justify-between overflow-hidden hidden lg:flex">
        {/* Decorative bg */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, color-mix(in oklch, var(--brand) 18%, transparent), transparent 50%),
              radial-gradient(circle at 80% 70%, color-mix(in oklch, var(--brand) 8%, transparent), transparent 50%)
            `,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          }}
        />

        <div className="relative"><PXMark size={28} /></div>

        <div className="relative">
          <div className="kicker text-brand-soft-fg mb-3.5">Internal · Inventory & Orders</div>
          <h1 className="m-0 text-[44px] font-semibold tracking-tight text-ink leading-[1.05] max-w-xl">
            ระบบสต็อกและสั่งซื้อ<br />ภายในองค์กร ร้านครูเก็ท
          </h1>
          <p className="mt-4 text-ink-3 text-base max-w-md leading-relaxed">
            จัดการสินค้า สั่งซื้อ และดูแลคลังจากที่เดียว ทุกการเปลี่ยนแปลงถูกบันทึกอัตโนมัติ
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
            {heroStats.map((s) => (
              <div
                key={s.kicker}
                className="p-3.5 rounded-[14px] border border-line backdrop-blur-md"
                style={{ background: 'color-mix(in oklch, var(--bg) 30%, transparent)' }}
              >
                <div className="kicker">{s.kicker}</div>
                <div className="num mono mt-1.5 text-[22px] font-semibold text-ink tracking-tight">
                  {s.value}{' '}
                  <span className="text-[11px] text-ink-3 font-normal">{s.unit}</span>
                </div>
                <div className="mt-2 h-4">
                  <SparkBar data={s.spark} height={16} />
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-5 max-w-lg px-3.5 py-2.5 rounded-[14px] border border-line backdrop-blur-md flex items-center gap-3.5 mono text-[11px]"
            style={{ background: 'color-mix(in oklch, var(--bg) 50%, transparent)' }}
          >
            <span className="inline-flex items-center gap-1.5 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-brand anim-pulse" />
              <span className="text-brand-soft-fg">ONLINE</span>
            </span>
            <span className="w-px h-3.5 bg-line flex-shrink-0" />
            <LiveTicker />
          </div>
        </div>

        <div className="relative mono text-[11px] text-ink-3 tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
          <span>build 1.4.2</span><span>·</span><span>internal use only</span>
        </div>
      </div>

      {/* Right — form */}
      <LoginForm />
    </div>
  )
}
