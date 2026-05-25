import * as React from 'react'

export default function EmptyState({
  illustration,
  title,
  description,
  action,
}: {
  illustration?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center px-4 py-16 text-ink-3">
      {illustration ? (
        <div className="flex justify-center mb-4">{illustration}</div>
      ) : null}
      <div className="text-ink-2 text-sm font-medium">{title}</div>
      {description && <div className="text-[12.5px] mt-1">{description}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* Geometric stroke-based illustrations */
export function EmptyArt({ kind = 'box', size = 96 }: { kind?: 'box' | 'cart' | 'search' | 'check'; size?: number }) {
  const variants: Record<string, React.ReactNode> = {
    box: (
      <svg width={size} height={size} viewBox="0 0 96 96" fill="none">
        <rect x="20" y="32" width="56" height="44" rx="3" stroke="var(--line-hi)" strokeWidth="1.5" />
        <path d="M20 44 L48 56 L76 44" stroke="var(--line-hi)" strokeWidth="1.5" />
        <path d="M48 56 L48 76" stroke="var(--line-hi)" strokeWidth="1.5" />
        <path d="M20 32 L48 20 L76 32" stroke="var(--brand)" strokeWidth="1.5" />
        <circle cx="48" cy="20" r="2" fill="var(--brand)" />
      </svg>
    ),
    cart: (
      <svg width={size} height={size} viewBox="0 0 96 96" fill="none">
        <rect x="24" y="28" width="48" height="40" rx="3" stroke="var(--line-hi)" strokeWidth="1.5" />
        <path d="M16 24 L24 28 M72 28 L80 24" stroke="var(--line-hi)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="36" cy="76" r="4" stroke="var(--brand)" strokeWidth="1.5" />
        <circle cx="60" cy="76" r="4" stroke="var(--brand)" strokeWidth="1.5" />
        <path d="M30 40 L66 40 M30 50 L54 50" stroke="var(--line-hi)" strokeWidth="1.5" />
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 96 96" fill="none">
        <circle cx="42" cy="42" r="20" stroke="var(--line-hi)" strokeWidth="1.5" />
        <path d="M56 56 L72 72" stroke="var(--line-hi)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M36 42 L48 42 M42 36 L42 48" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 96 96" fill="none">
        <circle cx="48" cy="48" r="28" stroke="var(--brand)" strokeWidth="1.5" />
        <path d="M36 48 L44 56 L60 40" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  }
  return <>{variants[kind] ?? variants.box}</>
}
