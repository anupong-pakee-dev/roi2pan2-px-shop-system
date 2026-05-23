'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/app/lib/db'
import { createSession, deleteSession } from '@/app/lib/session'
import { LoginSchema, type FormState } from '@/app/lib/definitions'

export async function login(
  state: FormState<{ username?: string[]; password?: string[] }>,
  formData: FormData
) {
  const validated = LoginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { username, password } = validated.data

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) {
    return { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    return { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
  }

  // USER ต้องรอ approval ทุกครั้งที่ login
  if (user.role === 'USER') {
    await prisma.user.update({ where: { id: user.id }, data: { approved: false } })
    await createSession(user.id, user.role)
    redirect('/pending')
  }

  await createSession(user.id, user.role)
  redirect('/products')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
