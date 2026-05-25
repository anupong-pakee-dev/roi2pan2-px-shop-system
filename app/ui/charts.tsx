import * as React from 'react'

/* Mini bar sparkline */
export function SparkBar({
  data,
  height = 28,
  color = 'var(--brand)',
}: {
  data: number[]
  height?: number
  color?: string
}) {
  const max = Math.max(1, ...data)
  return (
    <div className="flex items-end gap-px" style={{ height }}>
      {data.map((v, i) => {
        const h = (v / max) * height
        const isLast = i === data.length - 1
        return (
          <span
            key={i}
            className="flex-1 min-w-[2px] rounded-[1px] transition-[height]"
            style={{
              height: Math.max(2, h),
              background: isLast ? color : `color-mix(in oklch, ${color} 35%, transparent)`,
            }}
          />
        )
      })}
    </div>
  )
}

/* Smooth line sparkline w/ gradient fill */
export function SparkLine({
  data,
  height = 36,
  color = 'var(--brand)',
}: {
  data: number[]
  height?: number
  color?: string
}) {
  const max = Math.max(1, ...data)
  const min = Math.min(0, ...data)
  const range = max - min || 1
  const W = 100
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = height - ((v - min) / range) * (height - 4) - 2
    return [x, y] as const
  })
  const d = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ')
  const fillD = `${d} L ${W} ${height} L 0 ${height} Z`
  const gid = React.useId()
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" className="block">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2" fill={color} />
    </svg>
  )
}

/* Donut chart with center label */
export function Donut({
  segments,
  size = 120,
  thickness = 14,
  center,
}: {
  segments: { value: number; color: string }[]
  size?: number
  thickness?: number
  center?: React.ReactNode
}) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const r = size / 2 - thickness / 2
  const C = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-lo)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * C
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
            />
          )
          offset += len
          return el
        })}
      </svg>
      {center && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">{center}</div>
      )}
    </div>
  )
}
