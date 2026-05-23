type Props = { stock: number; minStock: number }

export default function StockBadge({ stock, minStock }: Props) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-950 text-red-400 border border-red-800/60">
        หมด
      </span>
    )
  }
  if (stock <= minStock) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800/60">
        ใกล้หมด
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
      พร้อมขาย
    </span>
  )
}
