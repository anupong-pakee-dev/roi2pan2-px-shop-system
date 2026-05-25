import * as z from 'zod'

export const LoginSchema = z.object({
  username: z.string().min(1, { error: 'กรุณากรอกชื่อผู้ใช้' }).trim(),
  password: z.string().min(1, { error: 'กรุณากรอกรหัสผ่าน' }).trim(),
})

export const ProductSchema = z.object({
  name: z.string().min(1, { error: 'กรุณากรอกชื่อสินค้า' }).trim(),
  sku: z.string().min(1, { error: 'กรุณากรอก SKU' }).trim(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { error: 'ราคาต้องไม่ติดลบ' }),
  stock: z.coerce.number().int().min(0, { error: 'จำนวน stock ต้องไม่ติดลบ' }),
  minStock: z.coerce.number().int().min(0, { error: 'ต้องไม่ติดลบ' }),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
  variantGroup: z.string().optional(),
  variantLabel: z.string().optional(),
})

export const StockAdjustSchema = z.object({
  type: z.enum(['ADD', 'SUBTRACT', 'ADJUST']),
  quantity: z.coerce.number().int().min(0, { error: 'ต้องไม่ติดลบ' }),
  note: z.string().optional(),
})

export type SessionPayload = {
  userId: string
  username: string
  role: string
  expiresAt: Date
}

export const OrderCreateSchema = z.object({
  addressId: z.string().min(1, { error: 'กรุณาเลือกที่อยู่จัดส่ง' }),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.coerce.number().int().min(1, { error: 'จำนวนต้องมากกว่า 0' }),
      })
    )
    .min(1, { error: 'กรุณาเลือกสินค้าอย่างน้อย 1 ชนิด' }),
})

export type OrderCreateInput = z.infer<typeof OrderCreateSchema>

export type FormState<T extends Record<string, unknown> = Record<string, string[]>> =
  | {
      errors?: Partial<T>
      message?: string
    }
  | undefined
