'use client'

import { useEffect, useState } from 'react'
import Icon from '@/app/ui/icon-svg'

const MESSAGES = [
  'sync · ok',
  'order pipeline · 3 active',
  'stock adjust · synced',
  'session active',
  'cloudinary · ok',
]

export default function Footer() {
  const [time, setTime] = useState<string>('')
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      )
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % MESSAGES.length), 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <footer className="border-t border-line backdrop-blur-[10px] mt-auto"
      style={{ background: 'color-mix(in oklch, var(--bg) 88%, transparent)' }}>
      <div className="max-w-[1440px] mx-auto px-6 h-8 flex items-center gap-3.5 mono text-[10.5px] text-ink-3 tracking-wide">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand anim-pulse" />
          <span className="text-brand-soft-fg">ONLINE</span>
        </span>
        <span className="w-px h-3 bg-line" />
        <span>{time || '--:--:--'}</span>
        <span className="w-px h-3 bg-line hidden sm:inline-block" />
        <span className="hidden sm:inline-flex items-center gap-1">
          <Icon name="info" size={11} />
          <span className="anim-fade" key={msgIdx}>{MESSAGES[msgIdx]}</span>
        </span>
        <span className="flex-1" />
        <span className="hidden md:inline">PX Shop v1.4.2</span>
      </div>
    </footer>
  )
}
