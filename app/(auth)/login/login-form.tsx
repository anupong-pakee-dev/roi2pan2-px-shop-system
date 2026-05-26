'use client'

import { useActionState, useState } from 'react'
import { login } from '@/app/actions/auth'
import Button from '@/app/ui/button'
import { Input, Field } from '@/app/ui/input'
import Icon from '@/app/ui/icon-svg'
import PXMark from '@/app/ui/px-mark'

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined)
  const [showPw, setShowPw] = useState(false)

  return (
    <div className="p-8 sm:p-12 flex flex-col justify-center">
      <div className="max-w-sm w-full mx-auto">
        <div className="lg:hidden mb-8"><PXMark size={24} /></div>
        <div className="kicker">เข้าสู่ระบบ</div>
        <h2 className="mt-1.5 mb-1 text-2xl font-semibold tracking-tight text-ink">ยินดีต้อนรับกลับ</h2>
        <p className="m-0 text-ink-3 text-[13.5px]">ใช้บัญชีพนักงานสำหรับเข้าระบบ</p>

        <form action={formAction} className="mt-7 flex flex-col gap-3.5">
          <Field label="ชื่อผู้ใช้">
            <Input name="username" placeholder="กรอกชื่อผู้ใช้" autoFocus icon="user" />
          </Field>
          <Field label="รหัสผ่าน">
            <Input
              name="password"
              placeholder="กรอกรหัสผ่าน"
              type={showPw ? 'text' : 'password'}
              addonRight={
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="p-1.5 text-ink-3 hover:text-ink-2"
                >
                  <Icon name={showPw ? 'eyeOff' : 'eye'} size={15} />
                </button>
              }
            />
          </Field>

          {state?.message && (
            <div className="flex items-center gap-2 p-2.5 text-[12.5px] bg-danger-soft text-danger-soft-fg rounded-md">
              <Icon name="warn" size={15} /> {state.message}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" full disabled={pending} iconRight={pending ? undefined : 'arrowR'}>
            {pending ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
          </Button>
        </form>

        <p className="mt-6 text-[11.5px] text-ink-3 text-center mono">
          หากยังไม่มีบัญชี ติดต่อ admin
        </p>
      </div>
    </div>
  )
}
