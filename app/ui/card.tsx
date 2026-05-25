import * as React from 'react'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean
  hover?: boolean
}

export default function Card({ padded = true, hover, className, children, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={[
        'bg-surface border border-line rounded-[14px] transition-[border-color,transform]',
        padded ? 'p-5' : '',
        hover ? 'hover:border-line-hi hover:-translate-y-px' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}

/* ----- Common helpers ----- */
export function CardTitle({ kicker, title, action }: { kicker?: string; title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3.5">
      <div>
        {kicker && <div className="kicker">{kicker}</div>}
        <div className="font-semibold text-ink text-[16px] mt-1">{title}</div>
      </div>
      {action}
    </div>
  )
}
