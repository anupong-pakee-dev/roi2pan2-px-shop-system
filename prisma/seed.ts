import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminPass = await bcrypt.hash('t.get1234', 10)
  const staffPass = await bcrypt.hash('staff1234', 10)
  const userPass  = await bcrypt.hash('user1234', 10)

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: adminPass, role: 'ADMIN', approved: true },
  })

  await prisma.user.upsert({
    where: { username: 'staff' },
    update: {},
    create: { username: 'staff', password: staffPass, role: 'STAFF', approved: true },
  })

  await prisma.user.upsert({
    where: { username: 'user' },
    update: {},
    create: { username: 'user', password: userPass, role: 'USER', approved: true },
  })

  const products = [
    { name: 'กาแฟสด',    sku: 'COF-001', price: 45, stock: 100, minStock: 20, category: 'เครื่องดื่ม' },
    { name: 'ชานม',      sku: 'TEA-001', price: 40, stock: 80,  minStock: 20, category: 'เครื่องดื่ม' },
    { name: 'น้ำเปล่า',  sku: 'WAT-001', price: 10, stock: 200, minStock: 50, category: 'เครื่องดื่ม' },
    { name: 'ขนมปัง',    sku: 'BRD-001', price: 25, stock: 4,   minStock: 10, category: 'อาหาร' },
    { name: 'ครัวซองต์', sku: 'BRD-002', price: 35, stock: 0,   minStock: 5,  category: 'อาหาร' },
    { name: 'แก้วกาแฟ',  sku: 'CUP-001', price: 55, stock: 500, minStock: 100, category: 'อุปกรณ์' },
    { name: 'หลอดกาแฟ',  sku: 'STW-001', price: 5,  stock: 1000, minStock: 200, category: 'อุปกรณ์' },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    })
  }

  // ─── Seed 150 users (3 หมวด × 50 ลำดับ) ────────────────────────────────
  // username: XYY  (X = หมวด 1-3, YY = ลำดับ 01-50)  เช่น 101, 232, 350
  // password: "22" + username                          เช่น 22101, 22232, 22350
  console.log('Seeding 150 users...')

  // สร้าง list ทั้งหมดก่อน
  const userEntries: { username: string; password: string }[] = []
  for (let cat = 1; cat <= 3; cat++) {
    for (let seq = 1; seq <= 50; seq++) {
      const username = `${cat}${String(seq).padStart(2, '0')}`
      userEntries.push({ username, password: `22${username}` })
    }
  }

  // Hash ทุก password พร้อมกัน (parallel) ให้เร็ว
  const hashedUsers = await Promise.all(
    userEntries.map(async ({ username, password }) => ({
      username,
      password: await bcrypt.hash(password, 10),
      role: 'USER' as const,
      approved: false,
    }))
  )

  // Insert ทีเดียว (skipDuplicates = รัน seed ซ้ำได้ปลอดภัย)
  const { count } = await prisma.user.createMany({
    data: hashedUsers,
    skipDuplicates: true,
  })
  console.log(`Seeded ${count} new users (skipped ${hashedUsers.length - count} existing)`)

  // ─── Seed default delivery addresses
  const defaultAddresses = [
    { label: 'สำนักงานใหญ่ (รับเอง)', detail: '123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110', shippingFee: 0, sortOrder: 0 },
    { label: 'สาขานนทบุรี', detail: '456 ถ.รัตนาธิเบศร์ ต.บางกระสอ อ.เมืองนนทบุรี จ.นนทบุรี 11000', shippingFee: 50, sortOrder: 1 },
    { label: 'สาขาปทุมธานี', detail: '789 ถ.พหลโยธิน ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี 12120', shippingFee: 80, sortOrder: 2 },
    { label: 'สาขาสมุทรปราการ', detail: '321 ถ.เทพารักษ์ ต.เทพารักษ์ อ.เมืองสมุทรปราการ จ.สมุทรปราการ 10270', shippingFee: 60, sortOrder: 3 },
    { label: 'สาขาชลบุรี', detail: '654 ถ.สุขุมวิท ต.บ้านสวน อ.เมืองชลบุรี จ.ชลบุรี 20000', shippingFee: 120, sortOrder: 4 },
    { label: 'สาขาระยอง', detail: '987 ถ.สุขุมวิท ต.เชิงเนิน อ.เมืองระยอง จ.ระยอง 21000', shippingFee: 150, sortOrder: 5 },
  ]

  // Only seed addresses if none exist yet
  const existingCount = await prisma.address.count()
  if (existingCount === 0) {
    await prisma.address.createMany({ data: defaultAddresses })
    console.log(`Seeded ${defaultAddresses.length} addresses`)
  }

  console.log('Seed completed!')
  console.log('Admin : admin  / t.get1234')
  console.log('Staff : staff  / staff1234')
  console.log('Users : 101–150 / 22101–22150')
  console.log('        201–250 / 22201–22250')
  console.log('        301–350 / 22301–22350')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
