import * as React from 'react'
import Icon, { type IconName } from './icon-svg'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand-soft' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: IconName
  iconRight?: IconName
  full?: boolean
}

const VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:      'bg-brand text-ink-on-brand hover:bg-brand-hi border border-transparent',
  secondary:    'bg-surface-hi text-ink border border-line hover:border-line-hi',
  ghost:        'bg-transparent text-ink-2 hover:bg-surface-hi hover:text-ink',
  danger:       'bg-transparent text-danger border border-line hover:bg-danger-soft hover:border-transparent',
  'brand-soft': 'bg-brand-soft text-brand-soft-fg hover:brightness-110 border border-transparent',
  outline:      'bg-transparent text-ink border border-line-hi hover:bg-surface-hi',
}

const SIZES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-2.5 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2.5',
}

export default function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  full,
  className,
  children,
  ...rest
}: ButtonProps) {
  const iconSize = size === 'sm' ? 14 : 16
  return (
    <button
      {...rest}
      className={[
        'inline-flex items-center justify-center font-medium rounded-md whitespace-nowrap',
        'transition-[background,color,border-color,transform] active:translate-y-px',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0',
        VARIANTS[variant],
        SIZES[size],
        full && 'w-full',
        className,
      ].filter(Boolean).join(' ')}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </button>
  )
}

export function IconButton({
  icon,
  size = 36,
  iconSize = 18,
  title,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName
  size?: number
  iconSize?: number
}) {
  return (
    <button
      {...rest}
      title={title}
      aria-label={title}
      style={{ width: size, height: size }}
      className={[
        'inline-flex items-center justify-center rounded-md text-ink-2',
        'hover:bg-surface-hi hover:text-ink border border-transparent',
        'transition-[background,color,border-color]',
        className,
      ].filter(Boolean).join(' ')}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  )
}
