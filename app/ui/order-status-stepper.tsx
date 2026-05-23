import type { OrderStatus } from '@prisma/client'

const STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'PENDING',   label: 'รอยืนยัน',       desc: 'ส่งคำสั่งซื้อแล้ว' },
  { status: 'CONFIRMED', label: 'ยืนยันแล้ว',      desc: 'ได้รับคำสั่งซื้อ' },
  { status: 'PREPARING', label: 'เตรียมของ',        desc: 'กำลังจัดเตรียม' },
  { status: 'SHIPPED',   label: 'จัดส่งแล้ว',      desc: 'อยู่ระหว่างส่ง' },
  { status: 'DELIVERED', label: 'ถึงแล้ว',          desc: 'ส่งถึงผู้รับ' },
]

const STEP_ORDER: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED']

export default function OrderStatusStepper({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className="bg-red-950/40 border border-red-800/40 rounded-2xl px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-red-950 border border-red-800/60 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-red-400">คำสั่งซื้อถูกยกเลิก</p>
          <p className="text-xs text-red-700 mt-0.5">สต็อกสินค้าถูกคืนกลับแล้ว</p>
        </div>
      </div>
    )
  }

  const currentIdx = STEP_ORDER.indexOf(status)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      {/* Desktop stepper */}
      <div className="hidden sm:flex items-start">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx
          const active = idx === currentIdx
          return (
            <div key={step.status} className="flex items-start flex-1 min-w-0">
              <div className="flex flex-col items-center flex-1 min-w-0">
                {/* Circle + line */}
                <div className="flex items-center w-full">
                  {idx > 0 && (
                    <div className={`flex-1 h-0.5 transition-colors ${done || active ? 'bg-zinc-400' : 'bg-zinc-800'}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                    done
                      ? 'bg-zinc-200 text-zinc-900'
                      : active
                      ? 'bg-zinc-100 text-zinc-900 ring-2 ring-zinc-400 ring-offset-2 ring-offset-zinc-900'
                      : 'bg-zinc-800 text-zinc-600'
                  }`}>
                    {done ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 transition-colors ${done ? 'bg-zinc-400' : 'bg-zinc-800'}`} />
                  )}
                </div>
                {/* Label */}
                <div className="mt-2 text-center px-1">
                  <p className={`text-xs font-medium transition-colors ${
                    done || active ? 'text-zinc-200' : 'text-zinc-600'
                  }`}>
                    {step.label}
                  </p>
                  {active && (
                    <p className="text-[10px] text-zinc-500 mt-0.5 whitespace-nowrap">{step.desc}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical list */}
      <div className="flex sm:hidden flex-col gap-0">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx
          const active = idx === currentIdx
          return (
            <div key={step.status} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  done
                    ? 'bg-zinc-200 text-zinc-900'
                    : active
                    ? 'bg-zinc-100 text-zinc-900 ring-2 ring-zinc-400 ring-offset-1 ring-offset-zinc-900'
                    : 'bg-zinc-800 text-zinc-600'
                }`}>
                  {done ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : idx + 1}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-0.5 h-6 mt-0.5 ${done ? 'bg-zinc-500' : 'bg-zinc-800'}`} />
                )}
              </div>
              <div className="pb-4 pt-0.5">
                <p className={`text-xs font-medium ${done || active ? 'text-zinc-200' : 'text-zinc-600'}`}>
                  {step.label}
                </p>
                {active && <p className="text-[10px] text-zinc-500 mt-0.5">{step.desc}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
