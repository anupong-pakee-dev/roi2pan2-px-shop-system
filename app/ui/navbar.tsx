'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import type { SessionPayload } from '@/app/lib/definitions'
import CartNavButton from '@/app/ui/cart-nav-button'
import Icon from '@/app/ui/icon-svg'
import PXMark from '@/app/ui/px-mark'

type Tab = { href: string; label: string; icon: string; match: (p: string) => boolean }

const SHOP_TABS: Tab[] = [
  { href: '/products', label: 'สินค้า',      icon: 'store', match: (p) => p.startsWith('/products') },
  { href: '/orders',   label: 'คำสั่งซื้อ',   icon: 'bag',   match: (p) => p === '/orders' || p.startsWith('/orders/') },
]

const STAFF_TABS: Tab[] = [
  { href: '/dashboard',         label: 'Dashboard', icon: 'chart', match: (p) => p === '/dashboard' },
  { href: '/dashboard/stock',   label: 'Stock',     icon: 'box',   match: (p) => p.startsWith('/dashboard/stock') },
  { href: '/dashboard/orders',  label: 'ออเดอร์',    icon: 'truck', match: (p) => p.startsWith('/dashboard/orders') },
  { href: '/dashboard/users',   label: 'ผู้ใช้',     icon: 'users', match: (p) => p.startsWith('/dashboard/users') },
]

const ROLE_LABEL: Record<string, { label: string; tone: string }> = {
  ADMIN: { label: 'Admin', tone: 'text-violet-soft-fg' },
  STAFF: { label: 'Staff', tone: 'text-info-soft-fg' },
  USER:  { label: 'User',  tone: 'text-ink-3' },
}

function TabLink({ tab, pathname }: { tab: Tab; pathname: string }) {
  const active = tab.match(pathname)
  return (
    <Link
      href={tab.href}
      className={[
        'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px] font-medium whitespace-nowrap',
        'transition-[background,color,border-color] border',
        active
          ? 'text-ink bg-surface-hi border-line'
          : 'text-ink-3 border-transparent hover:text-ink',
      ].join(' ')}
    >
      <Icon name={tab.icon} size={15} />
      {tab.label}
    </Link>
  )
}

export default function Navbar({ session }: { session: SessionPayload }) {
  const pathname = usePathname()
  const isStaff = session.role === 'ADMIN' || session.role === 'STAFF'
  const role = ROLE_LABEL[session.role] ?? ROLE_LABEL.USER

  return (
    <header className="sticky top-0 z-30 border-b border-line backdrop-blur-[10px]"
      style={{ background: 'color-mix(in oklch, var(--bg) 85%, transparent)' }}
    >
      <div className="max-w-[1440px] mx-auto px-6 h-[60px] flex items-center gap-3.5 overflow-x-auto scroll-thin">
        <Link href="/products" className="flex-shrink-0"><PXMark /></Link>
        <span className="w-px h-5 bg-line flex-shrink-0" />

        <nav className="flex gap-0.5 flex-shrink-0">
          {SHOP_TABS.map((t) => <TabLink key={t.href} tab={t} pathname={pathname} />)}
        </nav>

        {isStaff && (
          <>
            <span className="w-px h-5 bg-line flex-shrink-0" />
            <nav className="flex gap-0.5 flex-shrink-0">
              {STAFF_TABS.map((t) => <TabLink key={t.href} tab={t} pathname={pathname} />)}
            </nav>
          </>
        )}

        <div className="flex-1 min-w-3" />

        <CartNavButton />

        <div className="inline-flex items-center gap-2.5 pr-2 pl-1 py-1 rounded-full border border-line bg-surface-lo flex-shrink-0">
          <span className="w-7 h-7 rounded-full bg-surface-hi text-ink-2 inline-flex items-center justify-center font-semibold text-xs">
            {session.username.slice(0, 1).toUpperCase()}
          </span>
          <div className="leading-tight">
            <div className="text-[12.5px] font-medium text-ink">{session.username}</div>
            <div className={['text-[10.5px]', role.tone].join(' ')}>{role.label}</div>
          </div>
        </div>

        <form action={logout}>
          <button
            type="submit"
            title="ออกจากระบบ"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-ink-2 hover:bg-surface-hi hover:text-ink border border-transparent transition-colors"
          >
            <Icon name="logout" size={18} />
          </button>
        </form>
      </div>
    </header>
  )
}
