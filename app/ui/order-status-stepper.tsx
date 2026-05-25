import type { OrderStatus } from '@prisma/client'
import Icon from '@/app/ui/icon-svg'

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING',   label: 'รอยืนยัน' },
  { status: 'CONFIRMED', label: 'ยืนยันแล้ว' },
  { status: 'PREPARING', label: 'เตรียมของ' },
  { status: 'SHIPPED',   label: 'จัดส่งแล้ว' },
  { status: 'DELIVERED', label: 'ถึงแล้ว' },
]
const STEP_ORDER: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED']

export default function OrderStatusStepper({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className="bg-danger-soft border border-line rounded-[14px] px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-danger-soft border border-danger/40 inline-flex items-center justify-center flex-shrink-0 text-danger">
          <Icon name="close" size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold text-danger-soft-fg m-0">คำสั่งซื้อถูกยกเลิก</p>
          <p className="text-xs text-danger-soft-fg/70 mt-0.5 m-0">สต็อกสินค้าถูกคืนกลับแล้ว</p>
        </div>
      </div>
    )
  }

  const currentIdx = STEP_ORDER.indexOf(status)

  return (
    <div className="bg-surface border border-line rounded-[14px] p-5">
      {/* Desktop */}
      <div className="hidden sm:flex items-start justify-between gap-2">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx
          const active = idx === currentIdx
          return (
            <div key={step.status} className="flex-1 relative flex flex-col items-center gap-2">
              <div
                className={[
                  'w-8 h-8 rounded-full inline-flex items-center justify-center font-bold text-[13px]',
                  done || active
                    ? 'bg-brand text-ink-on-brand'
                    : 'bg-surface-lo border border-line text-ink-3',
                  active && 'shadow-[0_0_0_4px_color-mix(in_oklch,var(--brand)_25%,transparent)]',
                ].filter(Boolean).join(' ')}
                style={{ zIndex: 1, position: 'relative' }}
              >
                {done ? <Icon name="check" size={14} strokeWidth={3} /> : idx + 1}
              </div>
              <div
                className={[
                  'text-xs text-center',
                  active ? 'font-semibold text-ink' : done ? 'text-ink' : 'text-ink-3',
                ].join(' ')}
              >
                {step.label}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={['absolute top-4 left-1/2 right-[-50%] h-0.5 -z-0', idx < currentIdx ? 'bg-brand' : 'bg-surface-lo'].join(' ')}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile vertical */}
      <div className="flex sm:hidden flex-col">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx
          const active = idx === currentIdx
          return (
            <div key={step.status} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={[
                  'w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-xs',
                  done || active ? 'bg-brand text-ink-on-brand' : 'bg-surface-lo border border-line text-ink-3',
                ].join(' ')}>
                  {done ? <Icon name="check" size={12} strokeWidth={3} /> : idx + 1}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={['w-0.5 h-6 mt-0.5', idx < currentIdx ? 'bg-brand' : 'bg-surface-lo'].join(' ')} />
                )}
              </div>
              <div className="pb-4 pt-0.5">
                <p className={['text-xs font-medium m-0', done || active ? 'text-ink' : 'text-ink-3'].join(' ')}>
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
