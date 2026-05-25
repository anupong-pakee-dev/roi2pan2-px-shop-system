'use client'

import * as React from 'react'
import Icon, { type IconName } from './icon-svg'

type Option<V extends string> = {
  value: V
  label?: React.ReactNode
  icon?: IconName
}

export default function Segmented<V extends string>({
  value,
  onChange,
  options,
  size = 'md',
}: {
  value: V
  onChange: (v: V) => void
  options: Option<V>[]
  size?: 'sm' | 'md'
}) {
  const heightCls = size === 'sm' ? 'h-[34px]' : 'h-[40px]'
  const btnH = size === 'sm' ? 'h-7' : 'h-8'
  const btnPad = size === 'sm' ? 'px-2.5 text-xs' : 'px-3.5 text-[13px]'
  return (
    <div className={[
      'inline-flex bg-surface-lo border border-line rounded-md p-[3px]',
      heightCls,
    ].join(' ')}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={[
              'inline-flex items-center justify-center gap-1.5 rounded-[7px] font-medium',
              'transition-[background,color,border-color] border',
              btnH, btnPad,
              active
                ? 'text-ink bg-surface-hi border-line shadow-[0_1px_0_oklch(1_0_0/0.03),0_1px_2px_oklch(0_0_0/0.4)]'
                : 'text-ink-3 border-transparent hover:text-ink-2',
            ].join(' ')}
          >
            {o.icon && <Icon name={o.icon} size={14} />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
