'use client'

import { useEffect, useState } from 'react'

const MESSAGES = [
  'sync ok',
  '+12 น้ำดื่มสิงห์ รับเข้า',
  'order #A38F9C21 รอเตรียม',
  '−6 ขนมเลย์ ซาวร์ครีม ขายไป',
  '+24 ยาสีฟัน รับล็อตใหม่',
  'sync 14:32 ok',
]

export default function LiveTicker() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % MESSAGES.length), 2400)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex-1 text-ink-3 whitespace-nowrap overflow-hidden text-ellipsis tracking-wide">
      <span key={i} className="anim-fade">› {MESSAGES[i]}</span>
    </div>
  )
}
