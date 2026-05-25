import { prisma } from '@/app/lib/db'
import { verifyStaff } from '@/app/lib/dal'
import UserApprovalRow from './user-approval-row'
import UsersRefresh from './users-refresh'

export default async function UsersPage() {
  await verifyStaff()

  const [pending, approved] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'USER', approved: false, loginRequested: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        approved: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: 'USER', approved: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        approved: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <UsersRefresh />
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">จัดการผู้ใช้</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          รออนุมัติ {pending.length} คน · อนุมัติแล้ว {approved.length} คน
        </p>
      </div>

      {/* Pending — always visible */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          {pending.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
          <h2 className={`text-sm font-medium ${pending.length > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
            รออนุมัติ ({pending.length})
          </h2>
        </div>
        {pending.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-8 text-center">
            <p className="text-zinc-600 text-sm">ไม่มีผู้ใช้รอการอนุมัติ</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-amber-900/40 rounded-2xl overflow-hidden divide-y divide-zinc-800/60">
            {pending.map((u) => (
              <UserApprovalRow key={u.id} user={u} />
            ))}
          </div>
        )}
      </section>

      {/* Approved */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-400">อนุมัติแล้ว ({approved.length})</h2>
        {approved.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-zinc-600 text-sm">ยังไม่มีผู้ใช้ที่ถูกอนุมัติ</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/60">
            {approved.map((u) => (
              <UserApprovalRow key={u.id} user={u} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
