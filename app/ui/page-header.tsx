import * as React from 'react'

export default function PageHeader({
  kicker,
  title,
  subtitle,
  actions,
}: {
  kicker?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        {kicker && <div className="kicker mb-1.5">{kicker}</div>}
        <h1 className="m-0 text-[26px] font-semibold text-ink tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-ink-3 text-[13.5px]">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-shrink-0">{actions}</div>}
    </div>
  )
}
