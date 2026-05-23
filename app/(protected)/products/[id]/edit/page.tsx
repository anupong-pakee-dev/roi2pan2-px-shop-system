import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/db'
import { verifyAdmin } from '@/app/lib/dal'
import EditProductClient from './edit-client'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await verifyAdmin()
  const { id } = await params

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/products/${id}`} className="text-zinc-600 hover:text-zinc-300 transition-colors text-sm">
          ← กลับ
        </Link>
        <h1 className="text-xl font-semibold text-zinc-100">แก้ไขสินค้า</h1>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <EditProductClient
          id={id}
          defaultValues={{
            name: product.name,
            sku: product.sku,
            description: product.description ?? undefined,
            price: Number(product.price),
            stock: product.stock,
            minStock: product.minStock,
            category: product.category ?? undefined,
            imageUrl: product.imageUrl ?? undefined,
          }}
        />
      </div>
    </div>
  )
}
