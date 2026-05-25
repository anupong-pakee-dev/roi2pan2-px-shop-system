import * as React from 'react'
import Icon, { type IconName } from './icon-svg'

const inputBase = [
  'w-full bg-surface-lo border border-line rounded-md',
  'px-3 py-2 text-sm text-ink outline-none',
  'transition-[border-color,background] placeholder:text-ink-4',
  'focus:border-brand',
].join(' ')

export function Input({
  icon,
  addonRight,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: IconName
  addonRight?: React.ReactNode
}) {
  if (icon || addonRight) {
    return (
      <div className="relative">
        {icon && (
          <Icon
            name={icon}
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none"
          />
        )}
        <input
          {...rest}
          className={[
            inputBase,
            icon ? 'pl-9' : '',
            addonRight ? 'pr-10' : '',
            className,
          ].filter(Boolean).join(' ')}
        />
        {addonRight && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{addonRight}</div>
        )}
      </div>
    )
  }
  return <input {...rest} className={[inputBase, className].filter(Boolean).join(' ')} />
}

export function Select({
  children,
  className,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...rest}
        className={[
          inputBase,
          'appearance-none pr-8 cursor-pointer',
          className,
        ].filter(Boolean).join(' ')}
      >
        {children}
      </select>
      <Icon
        name="chevronD"
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none"
      />
    </div>
  )
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      {label && (
        <div className="text-[12.5px] font-medium text-ink-2 mb-1.5">{label}</div>
      )}
      {children}
      {hint && !error && <div className="text-[11.5px] text-ink-3 mt-1">{hint}</div>}
      {error && <div className="text-[11.5px] text-danger mt-1">{error}</div>}
    </label>
  )
}
