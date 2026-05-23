import { redirect } from 'next/navigation'
import { getSession } from '@/app/lib/session'
import { prisma } from '@/app/lib/db'
import { logout } from '@/app/actions/auth'
import PendingRefresh from './pending-refresh'

export default async function PendingPage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { username: true, approved: true, role: true },
  })

  if (!user) redirect('/login')

  // ADMIN/STAFF และ USER ที่ approved แล้ว → ไปหน้าหลัก
  if (user.role !== 'USER' || user.approved) redirect('/products')

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-amber-950/60 border border-amber-800/40 flex items-center justify-center">
            <svg className="w-9 h-9 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">รอการอนุมัติ</h1>
          <p className="text-sm text-zinc-500 mt-2">
            บัญชี <span className="text-zinc-300 font-medium">{user.username}</span> ยังไม่ได้รับการอนุมัติ
          </p>
          <p className="text-sm text-zinc-600 mt-1">
            กรุณารอ Admin หรือ Staff อนุมัติบัญชีของคุณก่อนใช้งาน
          </p>
        </div>

        {/* Auto-refresh component */}
        <PendingRefresh />

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            className="w-full text-sm text-zinc-600 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 rounded-lg px-4 py-2.5 transition-colors"
          >
            ออกจากระบบ
          </button>
        </form>
      </div>
    </div>
  )
}
