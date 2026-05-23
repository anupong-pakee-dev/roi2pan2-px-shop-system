'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

type Props = {
  currentUrl?: string
  onUpload: (url: string) => void
}

export default function ImageUpload({ currentUrl, onUpload }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setLoading(true)
    const form = new FormData()
    form.append('file', file)

    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'อัปโหลดไม่สำเร็จ')
    } else {
      setPreview(data.url)
      onUpload(data.url)
    }
    setLoading(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      <div
        className="relative border-2 border-dashed border-zinc-700 rounded-xl overflow-hidden bg-zinc-900 hover:border-zinc-500 transition-colors cursor-pointer"
        style={{ minHeight: 160 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative w-full h-40">
            <Image
              src={preview}
              alt="Product"
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-zinc-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-zinc-500">คลิกหรือลากรูปมาวางที่นี่</p>
            <p className="text-xs text-zinc-600">JPG, PNG, WebP (สูงสุด 10MB)</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-zinc-950/70 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {preview && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs text-zinc-500 hover:text-zinc-300 underline"
        >
          เปลี่ยนรูป
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
