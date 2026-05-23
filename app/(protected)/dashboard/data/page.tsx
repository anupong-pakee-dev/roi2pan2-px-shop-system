import { verifyAdmin } from '@/app/lib/dal'
import DataClient from './data-client'

export default async function DataManagementPage() {
  await verifyAdmin()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">จัดการข้อมูล</h1>
        <p className="text-sm text-zinc-500 mt-0.5">สำรอง นำเข้า ล้าง และ Export ข้อมูล</p>
      </div>
      <DataClient />
    </div>
  )
}
