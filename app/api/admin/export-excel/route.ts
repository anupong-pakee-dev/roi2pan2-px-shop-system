import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { prisma } from '@/app/lib/db'
import { getSession } from '@/app/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session?.userId || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [products, orders, orderItems, stockLogs] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
    prisma.order.findMany({
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.orderItem.findMany({ include: { order: { select: { id: true } } } }),
    prisma.stockLog.findMany({
      include: { product: { select: { name: true, sku: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      products.map((p) => ({
        ID: p.id,
        ชื่อสินค้า: p.name,
        SKU: p.sku,
        คำอธิบาย: p.description ?? '',
        ราคา: Number(p.price),
        สต็อก: p.stock,
        สต็อกขั้นต่ำ: p.minStock,
        หมวดหมู่: p.category ?? '',
        รูปภาพ: p.imageUrl ?? '',
        วันที่เพิ่ม: p.createdAt.toLocaleDateString('th-TH'),
      }))
    ),
    'สินค้า'
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      orders.map((o) => ({
        ID: o.id.slice(-8).toUpperCase(),
        ผู้สั่ง: o.user.username,
        ที่อยู่: o.addressLabel,
        ยอดสินค้า: Number(o.subtotal),
        ค่าจัดส่ง: Number(o.shippingFee),
        รวมทั้งหมด: Number(o.total),
        สถานะ: o.status,
        หมายเหตุ: o.note ?? '',
        วันที่สั่ง: o.createdAt.toLocaleDateString('th-TH'),
      }))
    ),
    'คำสั่งซื้อ'
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      orderItems.map((i) => ({
        คำสั่งซื้อ: i.orderId.slice(-8).toUpperCase(),
        ชื่อสินค้า: i.productName,
        SKU: i.sku,
        จำนวน: i.quantity,
        ราคาต่อหน่วย: Number(i.unitPrice),
        ยอดรวม: Number(i.subtotal),
      }))
    ),
    'รายการสินค้า'
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      stockLogs.map((l) => ({
        สินค้า: l.product.name,
        SKU: l.product.sku,
        ประเภท: l.type,
        จำนวน: l.quantity,
        ก่อน: l.before,
        หลัง: l.after,
        หมายเหตุ: l.note ?? '',
        วันที่: l.createdAt.toLocaleDateString('th-TH'),
      }))
    ),
    'ประวัติ Stock'
  )

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="px_shop_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  })
}
