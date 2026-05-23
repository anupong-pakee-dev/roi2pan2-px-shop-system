import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import type { SessionPayload } from '@/app/lib/definitions'
import CartNavButton from '@/app/ui/cart-nav-button'
import NavMobileMenu from '@/app/ui/nav-mobile-menu'

type Props = { session: SessionPayload }

export default function Navbar({ session }: Props) {
  const isAdmin = session.role === 'ADMIN'
  const isStaff = session.role === 'STAFF'
  const isStaffOrAdmin = isAdmin || isStaff

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Left: Logo + desktop nav */}
          <div className="flex items-center gap-4">
            <Link href="/products" className="font-bold text-zinc-100 text-lg tracking-tight flex-shrink-0">
              PX Shop
            </Link>

            {/* Desktop nav — hidden on mobile */}
            <nav className="hidden sm:flex items-center gap-1">
              <Link href="/products" className="px-3 py-1.5 text-sm text-zinc-400 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                สินค้า
              </Link>
              <Link href="/orders" className="px-3 py-1.5 text-sm text-zinc-400 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                คำสั่งซื้อ
              </Link>

              {isStaffOrAdmin && (
                <>
                  <Link href="/dashboard" className="px-3 py-1.5 text-sm text-zinc-400 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/orders" className="px-3 py-1.5 text-sm text-zinc-400 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                    ออเดอร์
                  </Link>
                  <Link href="/dashboard/users" className="px-3 py-1.5 text-sm text-zinc-400 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                    ผู้ใช้
                  </Link>
                  <Link href="/dashboard/addresses" className="px-3 py-1.5 text-sm text-zinc-400 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                    ที่อยู่
                  </Link>
                  <Link href="/dashboard/daily" className="px-3 py-1.5 text-sm text-zinc-400 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                    ยอดรายวัน
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link href="/dashboard/data" className="px-3 py-1.5 text-sm text-zinc-400 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                  ข้อมูล
                </Link>
              )}
            </nav>
          </div>

          {/* Right: Cart + role badge + logout (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-2">
            <CartNavButton />

            {/* Role badge — desktop only */}
            {isAdmin ? (
              <span className="hidden sm:inline-flex bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded text-xs font-medium">
                Admin
              </span>
            ) : isStaff ? (
              <span className="hidden sm:inline-flex bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-xs font-medium">
                Staff
              </span>
            ) : (
              <span className="hidden sm:inline-flex bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded text-xs font-medium">
                User
              </span>
            )}

            {/* Logout button — desktop only */}
            <form action={logout} className="hidden sm:block">
              <button type="submit" className="text-sm text-zinc-500 hover:text-zinc-200 px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                ออกจากระบบ
              </button>
            </form>

            {/* Hamburger — mobile only */}
            <NavMobileMenu isAdmin={isAdmin} isStaff={isStaff} isStaffOrAdmin={isStaffOrAdmin} />
          </div>

        </div>
      </div>
    </header>
  )
}
