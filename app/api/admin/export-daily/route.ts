import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { prisma } from '@/app/lib/db'
import { getSession } from '@/app/lib/session'

function isoDate(d: Date) {
  const bkk = new Date(d.getTime() + 7 * 3600 * 1000)
  return bkk.toISOString().slice(0, 10)
}

function thDate(d: Date) {
  return d.toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok',
  })
}

export async function GET() {
  const session = await getSession()
  if (!session?.userId || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    include: { items: true, user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
  })

  // ── Sheet 1: Daily summary ──────────────────────────────────────────
  type DayRow = {
    วันที่: string
    ออเดอร์: number
    จำนวนชิ้น: number
    ยอดสินค้า: number
    ค่าจัดส่ง: number
    ยอดรวม: number
    ยกเลิก: number
  }

  const summaryMap = new Map<string, DayRow>()

  for (const o of orders) {
    const key = isoDate(o.createdAt)
    if (!summaryMap.has(key)) {
      summaryMap.set(key, {
        วันที่: thDate(o.createdAt),
        ออเดอร์: 0,
        จำนวนชิ้น: 0,
        ยอดสินค้า: 0,
        ค่าจัดส่ง: 0,
        ยอดรวม: 0,
        ยกเลิก: 0,
      })
    }
    const row = summaryMap.get(key)!
    if (o.status === 'CANCELLED') {
      row.ยกเลิก++
    } else {
      row.ออเดอร์++
      row.จำนวนชิ้น += o.items.reduce((s, i) => s + i.quantity, 0)
      row.ยอดสินค้า += Number(o.subtotal)
      row.ค่าจัดส่ง += Number(o.shippingFee)
      row.ยอดรวม += Number(o.total)
    }
  }

  const summaryRows = Array.from(summaryMap.values())

  // Grand total footer row
  summaryRows.push({
    วันที่: 'รวมทั้งหมด',
    ออเดอร์: summaryRows.reduce((s, r) => s + r.ออเดอร์, 0),
    จำนวนชิ้น: summaryRows.reduce((s, r) => s + r.จำนวนชิ้น, 0),
    ยอดสินค้า: summaryRows.reduce((s, r) => s + r.ยอดสินค้า, 0),
    ค่าจัดส่ง: summaryRows.reduce((s, r) => s + r.ค่าจัดส่ง, 0),
    ยอดรวม: summaryRows.reduce((s, r) => s + r.ยอดรวม, 0),
    ยกเลิก: summaryRows.reduce((s, r) => s + r.ยกเลิก, 0),
  })

  // ── Sheet 2: Order detail per day ───────────────────────────────────
  const detailRows = orders.map((o) => ({
    วันที่: thDate(o.createdAt),
    รหัสออเดอร์: o.id.slice(-8).toUpperCase(),
    ผู้สั่ง: o.user.username,
    ที่อยู่: o.addressLabel,
    สถานะ: o.status,
    ยอดสินค้า: Number(o.subtotal),
    ค่าจัดส่ง: Number(o.shippingFee),
    ยอดรวม: Number(o.total),
    หมายเหตุ: o.note ?? '',
  }))

  // ── Sheet 3: Product breakdown per day ──────────────────────────────
  type ProductRow = { วันที่: string; ชื่อสินค้า: string; SKU: string; จำนวน: number; ยอดรวม: number }
  const productMap = new Map<string, ProductRow>()

  for (const o of orders) {
    if (o.status === 'CANCELLED') continue
    const dayKey = isoDate(o.createdAt)
    for (const item of o.items) {
      const key = `${dayKey}|${item.sku}`
      if (!productMap.has(key)) {
        productMap.set(key, {
          วันที่: thDate(o.createdAt),
          ชื่อสินค้า: item.productName,
          SKU: item.sku,
          จำนวน: 0,
          ยอดรวม: 0,
        })
      }
      const row = productMap.get(key)!
      row.จำนวน += item.quantity
      row.ยอดรวม += Number(item.subtotal)
    }
  }

  const productRows = Array.from(productMap.values())

  // ── Build workbook ──────────────────────────────────────────────────
  const wb = XLSX.utils.book_new()

  const summaryWs = XLSX.utils.json_to_sheet(summaryRows)
  // Style the header row (bold) — basic column width hints
  summaryWs['!cols'] = [{ wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, summaryWs, 'สรุปรายวัน')

  const detailWs = XLSX.utils.json_to_sheet(detailRows)
  detailWs['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 24 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, detailWs, 'รายการออเดอร์')

  const productWs = XLSX.utils.json_to_sheet(productRows)
  productWs['!cols'] = [{ wch: 18 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, productWs, 'สินค้าขายรายวัน')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const today = new Date().toISOString().slice(0, 10)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="daily_summary_${today}.xlsx"`,
    },
  })
}
