import * as React from 'react'

/* Striped placeholder for missing product images.
   `hue` shifts the gradient so cards in a list don't all look identical. */
export default function ImagePlaceholder({
  hue = 200,
  label,
  className,
  style,
}: {
  hue?: number
  label?: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={['placeholder-stripes relative overflow-hidden rounded-md', className].filter(Boolean).join(' ')} style={style}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(140deg, oklch(0.60 0.10 ${hue} / 0.18), oklch(0.50 0.10 ${hue + 40} / 0.05))`,
        }}
      />
      {label && (
        <div className="absolute inset-0 flex items-center justify-center mono text-[10px] uppercase tracking-wider text-ink-3">
          {label}
        </div>
      )}
    </div>
  )
}

/* Hash a product id/name to a stable hue */
export function hueFor(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  return Math.abs(h) % 360
}
