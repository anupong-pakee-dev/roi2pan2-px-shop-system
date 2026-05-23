'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Silently refreshes the page every 15 seconds so new pending users appear. */
export default function UsersRefresh() {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 15_000)
    return () => clearInterval(id)
  }, [router])

  return null
}
