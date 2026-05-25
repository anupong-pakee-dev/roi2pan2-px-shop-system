'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'

type Props = {
  isAdmin: boolean
  isStaff: boolean
  isStaffOrAdmin: boolean
}

function NavItem({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/products' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
        active ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'
      }`}
    >
      {children}
    </Link>
  )
}

export default function NavMobileMenu({ isAdmin, isStaff, isStaffOrAdmin }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        aria-label="เมนู"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Slide-down overlay — mobile only */}
      {open && (
        <div className="sm:hidden fixed inset-0 top-14 bg-zinc-950 z-50 overflow-y-auto flex flex-col">
          <nav className="flex-1 px-3 pt-3 pb-4 space-y-0.5">
            {/* Role badge */}
            <div className="px-4 pb-3 pt-1">
              <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${
                isAdmin
                  ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                  : isStaff
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {isAdmin ? 'Admin' : isStaff ? 'Staff' : 'User'}
              </span>
            </div>

            <div className="h-px bg-zinc-800/60 mx-1 mb-2" />

            <NavItem href="/products" onClick={close}>สินค้า</NavItem>
            <NavItem href="/orders" onClick={close}>คำสั่งซื้อ</NavItem>

            {isStaffOrAdmin && (
              <>
                <div className="h-px bg-zinc-800/60 mx-1 my-2" />
                <p className="px-4 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Management</p>
                <NavItem href="/dashboard" onClick={close}>Dashboard</NavItem>
                <NavItem href="/dashboard/stock" onClick={close}>ภาพรวม Stock</NavItem>
                <NavItem href="/dashboard/orders" onClick={close}>จัดการออเดอร์</NavItem>
                <NavItem href="/dashboard/users" onClick={close}>จัดการผู้ใช้</NavItem>
                <NavItem href="/dashboard/addresses" onClick={close}>ที่อยู่จัดส่ง</NavItem>
                <NavItem href="/dashboard/daily" onClick={close}>ยอดรายวัน</NavItem>
              </>
            )}

            {isAdmin && (
              <NavItem href="/dashboard/data" onClick={close}>จัดการข้อมูล</NavItem>
            )}
          </nav>

          {/* Logout */}
          <div className="px-3 pb-6 border-t border-zinc-800 pt-4">
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/40 border border-red-900/40 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                ออกจากระบบ
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
