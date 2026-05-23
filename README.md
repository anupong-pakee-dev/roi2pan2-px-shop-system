# PX Shop

ระบบจัดการสต็อกและสั่งซื้อสินค้าภายในองค์กร สร้างด้วย Next.js 16 + PostgreSQL (Supabase)

---

## สิ่งที่ทำได้

| บทบาท | สิทธิ์ |
|---|---|
| **Admin** | ทุกอย่าง รวมถึงจัดการข้อมูล export/import |
| **Staff** | จัดการ stock, อนุมัติ user, จัดการออเดอร์, ที่อยู่จัดส่ง, ยอดรายวัน |
| **User** | สั่งซื้อสินค้า ดูออเดอร์ของตัวเอง |

> **หมายเหตุ:** User ทุกคนต้องรอ Staff/Admin อนุมัติทุกครั้งที่ login — ถ้าไม่ได้รับอนุมัติใน 30 วินาที จะออกจากระบบอัตโนมัติ

---

## Stack

- **Next.js 16** App Router + React 19 Server Components
- **Prisma 7** + `@prisma/adapter-pg`
- **PostgreSQL** via Supabase
- **Tailwind CSS 4** dark theme
- **jose** — JWT session (stateless, cookie-based)
- **Cloudinary** — อัปโหลดรูปภาพ (fallback เป็น `public/uploads/` ถ้าไม่ได้ตั้งค่า)
- **SheetJS (xlsx)** — export Excel
- **Zod 4** — validation

---

## เริ่มต้นใช้งาน

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ที่ root โปรเจกต์:

```env
# ─── Database ──────────────────────────────────────────────────────────────
# Pooler URL (port 6543) → ใช้สำหรับ app ตอน runtime
DATABASE_URL=postgresql://postgres.xxxxx:[password]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres

# Direct URL (port 5432) → ใช้สำหรับ prisma migrate เท่านั้น
# ถ้า ISP บล็อก IPv6 ให้ใช้ Session mode pooler (port 5432 บน pooler host แทน)
DIRECT_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres

# ─── Session ───────────────────────────────────────────────────────────────
# สุ่ม string ยาวๆ ใช้เป็น JWT secret
SESSION_SECRET=your-super-secret-key-at-least-32-chars

# ─── Cloudinary (optional — ถ้าไม่ใส่ รูปจะเก็บที่ public/uploads/ แทน) ────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> หา Supabase URL ได้ที่ **Dashboard → Project Settings → Database → Connection string**

### 3. Migrate ฐานข้อมูล

```bash
npm run db:migrate
```

### 4. Seed ข้อมูลเริ่มต้น

สร้าง Admin, Staff, User ตัวอย่าง + ที่อยู่จัดส่ง 6 แห่ง:

```bash
npm run db:seed
```

บัญชีที่ได้:

| Username | Password | Role |
|---|---|---|
| `admin` | `t.get1234` | Admin |
| `staff` | `staff1234` | Staff |
| `user` | `user1234` | User |

### 5. รัน dev server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

---

## คำสั่งที่ใช้บ่อย

```bash
npm run dev           # รัน development server
npm run build         # build สำหรับ production
npm run start         # รัน production server
npm run db:migrate    # migrate schema ที่เปลี่ยนแปลง
npm run db:seed       # seed ข้อมูลเริ่มต้น
npm run db:studio     # เปิด Prisma Studio ดู/แก้ไข DB ผ่าน browser UI
```

---

## โครงสร้างโปรเจกต์

```
app/
├── (auth)/
│   ├── login/            หน้า login
│   └── pending/          หน้ารอ approval (แสดงหลัง user login)
│
├── (protected)/          ทุกหน้าต้อง login ก่อน
│   ├── products/         รายการสินค้า + ตะกร้า
│   ├── orders/           ประวัติและสร้างคำสั่งซื้อ
│   └── dashboard/
│       ├── page.tsx          ภาพรวม stock
│       ├── orders/           จัดการออเดอร์ (Staff/Admin)
│       ├── users/            อนุมัติ user (Staff/Admin)
│       ├── addresses/        จัดการที่อยู่จัดส่ง (Staff/Admin)
│       ├── daily/            สรุปยอดรายวัน + export Excel
│       └── data/             backup / import / clear DB (Admin only)
│
├── actions/              Server Actions ทั้งหมด
├── api/                  API Routes (upload รูป, export Excel, backup)
├── lib/                  session, DAL, cart context
└── ui/                   shared components (navbar, stepper, badge ฯลฯ)
│
prisma/
├── schema.prisma         โมเดลทั้งหมด
├── migrations/           migration history
└── seed.ts               ข้อมูลเริ่มต้น
```

---

## User Approval Flow

```
User กด Login
     │
     ▼
ระบบ reset approved = false → redirect ไป /pending
     │
     ▼
Staff/Admin เห็นชื่อขึ้นใน /dashboard/users
     │
     ├─ กด "อนุมัติ" ─→ User เข้าระบบได้ทันที
     │
     └─ ไม่อนุมัติใน 30 วิ ─→ Logout อัตโนมัติ
```

---

## การอัปโหลดรูปภาพ

ระบบเลือกโหมดอัตโนมัติตาม env:

| สถานการณ์ | พฤติกรรม |
|---|---|
| ตั้งค่า Cloudinary ครบ | อัปโหลดไป Cloudinary (แนะนำสำหรับ production) |
| ไม่ได้ตั้งค่า Cloudinary | บันทึกที่ `public/uploads/` บน server โดยตรง |

> โหมด local **ไม่เหมาะ** กับ Vercel หรือ serverless เพราะ filesystem เป็น read-only

---

## Database Schema (สรุป)

| Model | ใช้สำหรับ |
|---|---|
| `User` | บัญชีผู้ใช้ มี role + approved flag |
| `Product` | สินค้า มี stock, ราคา, รูปภาพ |
| `StockLog` | ประวัติการเปลี่ยนแปลง stock |
| `Order` | คำสั่งซื้อ มีสถานะ 6 ขั้น (PENDING → DELIVERED / CANCELLED) |
| `OrderItem` | รายการสินค้าในแต่ละออเดอร์ |
| `Address` | ที่อยู่จัดส่ง เพิ่ม/ลบ/ปิดใช้งานได้โดย Staff/Admin |
