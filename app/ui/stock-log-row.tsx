import Badge from '@/app/ui/badge'

type Log = {
  id: string
  type: 'ADD' | 'SUBTRACT' | 'ADJUST'
  quantity: number
  before: number
  after: number
  note: string | null
  createdAt: Date
  product: { name: string; sku: string }
  author?: string | null
}

const PILL: Record<Log['type'], { sym: string; tone: string }> = {
  ADD:      { sym: '+', tone: 'bg-brand-soft text-brand-soft-fg' },
  SUBTRACT: { sym: '−', tone: 'bg-danger-soft text-danger-soft-fg' },
  ADJUST:   { sym: '=', tone: 'bg-info-soft text-info-soft-fg' },
}

export default function StockLogRow({
  log,
  isLast,
  delay = 0,
}: {
  log: Log
  isLast?: boolean
  delay?: number
}) {
  const p = PILL[log.type]
  const when = log.createdAt.toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  return (
    <tr
      className={['anim-stagger transition-colors hover:bg-surface-hi/50', !isLast && 'border-b border-line'].filter(Boolean).join(' ')}
      style={{ animationDelay: `${delay}ms` }}
    >
      <td className="px-4 py-2.5">
        <div className="font-medium text-ink">{log.product.name}</div>
        <div className="mono text-[10.5px] text-ink-3">{log.product.sku}</div>
      </td>
      <td className="px-4 py-2.5">
        <span className={['w-[30px] h-[30px] rounded-md inline-flex items-center justify-center text-sm font-bold', p.tone].join(' ')}>
          {p.sym}
        </span>
      </td>
      <td className="px-4 py-2.5 num font-semibold text-ink">
        {log.type === 'ADD' ? '+' : log.type === 'SUBTRACT' ? '−' : '='}{log.quantity}
      </td>
      <td className="px-4 py-2.5 num text-ink-3 text-xs">
        {log.before} → {log.after}
      </td>
      <td className="px-4 py-2.5 text-ink-3 text-xs">{when}</td>
      <td className="px-4 py-2.5">
        <Badge tone={log.author ? 'info' : 'neutral'} size="sm">{log.author ?? 'System'}</Badge>
      </td>
    </tr>
  )
}
