import { prisma } from '@/app/lib/db'
import { verifySession } from '@/app/lib/dal'
import OrderClient from './order-client'

export default async function NewOrderPage() {
  await verifySession()

  const [products, addresses] = await Promise.all([
    prisma.product.findMany({
      where: { stock: { gt: 0 } },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, sku: true, price: true, stock: true, category: true, imageUrl: true },
    }),
    prisma.address.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
  ])

  const serializedProducts = products.map((p) => ({ ...p, price: p.price.toString() }))
  const serializedAddresses = addresses.map((a) => ({
    id: a.id,
    label: a.label,
    detail: a.detail,
    shippingFee: Number(a.shippingFee),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">สั่งซื้อสินค้า</h1>
        <p className="text-sm text-zinc-500 mt-0.5">เลือกสินค้าและที่อยู่จัดส่ง</p>
      </div>
      <OrderClient products={serializedProducts} addresses={serializedAddresses} />
    </div>
  )
}
