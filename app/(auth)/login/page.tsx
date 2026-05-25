'use client'

import { useActionState, useState } from 'react'
import { login } from '@/app/actions/auth'
import Button from '@/app/ui/button'
import { Input, Field } from '@/app/ui/input'
import Icon from '@/app/ui/icon-svg'
import PXMark from '@/app/ui/px-mark'
import { SparkBar } from '@/app/ui/charts'
import LiveTicker from '@/app/ui/live-ticker'

const HERO_STATS = [
  { kicker: 'สินค้า',   value: '20',  unit: 'ชนิด',  spark: [12, 14, 13, 16, 18, 17, 20] },
  { kicker: 'สต็อก',    value: '852', unit: 'ชิ้น',  spark: [620, 680, 700, 720, 780, 820, 852] },
  { kicker: 'ออเดอร์',   value: '6',   unit: 'รายการ', spark: [2, 3, 1, 4, 3, 5, 6] },
]

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined)
  const [showPw, setShowPw] = useState(false)

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
            ระบบสต็อกและสั่งซื้อ<br />ภายในองค์กร
          </h1>
          <p className="mt-4 text-ink-3 text-base max-w-md leading-relaxed">
            จัดการสินค้า สั่งซื้อ และดูแลคลังจากที่เดียว ทุกการเปลี่ยนแปลงถูกบันทึกอัตโนมัติ
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
            {HERO_STATS.map((s) => (
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
      <div className="p-8 sm:p-12 flex flex-col justify-center">
        <div className="max-w-sm w-full mx-auto">
          <div className="lg:hidden mb-8"><PXMark size={24} /></div>
          <div className="kicker">เข้าสู่ระบบ</div>
          <h2 className="mt-1.5 mb-1 text-2xl font-semibold tracking-tight text-ink">ยินดีต้อนรับกลับ</h2>
          <p className="m-0 text-ink-3 text-[13.5px]">ใช้บัญชีพนักงานสำหรับเข้าระบบ</p>

          <form action={formAction} className="mt-7 flex flex-col gap-3.5">
            <Field label="ชื่อผู้ใช้">
              <Input name="username" placeholder="กรอกชื่อผู้ใช้" autoFocus icon="user" />
            </Field>
            <Field label="รหัสผ่าน">
              <Input
                name="password"
                placeholder="กรอกรหัสผ่าน"
                type={showPw ? 'text' : 'password'}
                addonRight={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="p-1.5 text-ink-3 hover:text-ink-2"
                  >
                    <Icon name={showPw ? 'eyeOff' : 'eye'} size={15} />
                  </button>
                }
              />
            </Field>

            {state?.message && (
              <div className="flex items-center gap-2 p-2.5 text-[12.5px] bg-danger-soft text-danger-soft-fg rounded-md">
                <Icon name="warn" size={15} /> {state.message}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" full disabled={pending} iconRight={pending ? undefined : 'arrowR'}>
              {pending ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          <p className="mt-6 text-[11.5px] text-ink-3 text-center mono">
            หากยังไม่มีบัญชี ติดต่อ admin
          </p>
        </div>
      </div>
    </div>
  )
}
