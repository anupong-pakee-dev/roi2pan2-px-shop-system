'use client'

import { useActionState, useState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">PX Shop</h1>
          <p className="text-zinc-500 text-sm mt-2">ระบบช้อปปิ้ง/จัดการสต็อก</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
          <h2 className="text-base font-semibold text-zinc-200 mb-6">เข้าสู่ระบบ</h2>

          <form action={action} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">ชื่อผู้ใช้</label>
              <input
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition"
                placeholder="กรอกชื่อผู้ใช้"
              />
              {state?.errors?.username && (
                <p className="text-xs text-red-400 mt-1">{state.errors.username[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 pr-10 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition"
                  placeholder="กรอกรหัสผ่าน"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {state?.errors?.password && (
                <p className="text-xs text-red-400 mt-1">{state.errors.password[0]}</p>
              )}
            </div>

            {state?.message && (
              <div className="bg-red-950/60 border border-red-800/60 rounded-lg px-3 py-2.5">
                <p className="text-sm text-red-400">{state.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-zinc-100 text-zinc-900 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {pending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
