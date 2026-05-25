import * as React from 'react'

export default function PXMark({ size = 22 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-semibold tracking-wide text-ink"
      style={{ fontSize: size * 0.78 }}>
      <span
        className="inline-flex items-center justify-center bg-brand text-ink-on-brand rounded-md font-bold mono"
        style={{ width: size, height: size, fontSize: size * 0.55, letterSpacing: -0.3 }}
      >PX</span>
      <span>Shop</span>
    </span>
  )
}
