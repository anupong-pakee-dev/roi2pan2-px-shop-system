export type DeliveryAddress = {
  id: string
  label: string
  address: string
  shippingFee: number
}

export const DELIVERY_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'hq',
    label: 'สำนักงานใหญ่ (รับเอง)',
    address: '123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    shippingFee: 0,
  },
  {
    id: 'branch-nonthaburi',
    label: 'สาขานนทบุรี',
    address: '456 ถ.รัตนาธิเบศร์ ต.บางกระสอ อ.เมืองนนทบุรี จ.นนทบุรี 11000',
    shippingFee: 50,
  },
  {
    id: 'branch-pathum',
    label: 'สาขาปทุมธานี',
    address: '789 ถ.พหลโยธิน ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี 12120',
    shippingFee: 80,
  },
  {
    id: 'branch-samutprakarn',
    label: 'สาขาสมุทรปราการ',
    address: '321 ถ.เทพารักษ์ ต.เทพารักษ์ อ.เมืองสมุทรปราการ จ.สมุทรปราการ 10270',
    shippingFee: 60,
  },
  {
    id: 'branch-chonburi',
    label: 'สาขาชลบุรี',
    address: '654 ถ.สุขุมวิท ต.บ้านสวน อ.เมืองชลบุรี จ.ชลบุรี 20000',
    shippingFee: 120,
  },
  {
    id: 'branch-rayong',
    label: 'สาขาระยอง',
    address: '987 ถ.สุขุมวิท ต.เชิงเนิน อ.เมืองระยอง จ.ระยอง 21000',
    shippingFee: 150,
  },
]

export function getAddress(id: string): DeliveryAddress | undefined {
  return DELIVERY_ADDRESSES.find((a) => a.id === id)
}
