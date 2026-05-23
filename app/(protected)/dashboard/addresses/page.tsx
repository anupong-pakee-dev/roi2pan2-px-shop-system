import { prisma } from '@/app/lib/db'
import { verifyStaff } from '@/app/lib/dal'
import AddressRow from './address-row'
import AddAddressForm from './add-address-form'

export default async function AddressesPage() {
  await verifyStaff()

  const addresses = await prisma.address.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })

  const serialized = addresses.map((a) => ({ ...a, shippingFee: String(a.shippingFee) }))

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">ที่อยู่จัดส่ง</h1>
        <p className="text-sm text-zinc-500 mt-0.5">จัดการที่อยู่สำหรับผู้ใช้เลือกตอนสั่งของ</p>
      </div>

      <AddAddressForm />

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-400">รายการที่อยู่ ({addresses.length})</h2>
        {addresses.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-zinc-600 text-sm">ยังไม่มีที่อยู่ กรุณาเพิ่มอย่างน้อย 1 รายการ</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/60">
            {serialized.map((a) => (
              <AddressRow key={a.id} address={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
