'use client'

import { useState, useRef } from 'react'

type ClearTarget = 'orders' | 'stocklogs' | 'products' | 'all'

const CLEAR_OPTIONS: { id: ClearTarget; label: string; desc: string; color: string }[] = [
  { id: 'orders',    label: 'ล้างคำสั่งซื้อ',      desc: 'ลบคำสั่งซื้อและรายการทั้งหมด',  color: 'text-amber-400' },
  { id: 'stocklogs', label: 'ล้างประวัติ Stock',    desc: 'ลบ Log การเปลี่ยนแปลงสต็อก',   color: 'text-orange-400' },
  { id: 'products',  label: 'ล้างสินค้าทั้งหมด',   desc: 'ลบสินค้าทั้งหมด (คำสั่งซื้อจะถูกลบด้วย)', color: 'text-red-400' },
  { id: 'all',       label: 'ล้างข้อมูลทั้งหมด',   desc: 'ลบทุกอย่าง ยกเว้นบัญชีผู้ใช้', color: 'text-red-600' },
]

export default function DataClient() {
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [clearing, setClearing] = useState(false)
  const [clearMsg, setClearMsg] = useState('')
  const [clearTarget, setClearTarget] = useState<ClearTarget | null>(null)
  const [confirm, setConfirm] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExcelExport() {
    const res = await fetch('/api/admin/export-excel')
    if (!res.ok) { alert('Export ไม่สำเร็จ'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `px_shop_export_${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleBackup() {
    const res = await fetch('/api/admin/backup')
    if (!res.ok) { alert('Backup ไม่สำเร็จ'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `px_shop_backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportMsg('')

    try {
      const text = await file.text()
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: text,
      })
      const data = await res.json()
      setImportMsg(res.ok ? `นำเข้าสำเร็จ: ${data.message}` : `ผิดพลาด: ${data.error}`)
    } catch {
      setImportMsg('เกิดข้อผิดพลาดในการอ่านไฟล์')
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleClear() {
    if (!clearTarget || confirm !== 'ยืนยัน') return
    setClearing(true)
    setClearMsg('')

    const res = await fetch('/api/admin/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: clearTarget }),
    })
    const data = await res.json()
    setClearMsg(res.ok ? data.message : `ผิดพลาด: ${data.error}`)
    setClearing(false)
    setClearTarget(null)
    setConfirm('')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Export Excel */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-zinc-200">Export Excel</h3>
            <p className="text-xs text-zinc-500 mt-0.5">ดาวน์โหลดข้อมูลสินค้า คำสั่งซื้อ และ Log เป็นไฟล์ .xlsx</p>
          </div>
        </div>
        <button
          onClick={handleExcelExport}
          className="w-full bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          ดาวน์โหลด Excel
        </button>
      </div>

      {/* Backup */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-zinc-200">สำรองข้อมูล</h3>
            <p className="text-xs text-zinc-500 mt-0.5">ดาวน์โหลดข้อมูลทั้งหมดเป็นไฟล์ JSON สำหรับสำรอง</p>
          </div>
        </div>
        <button
          onClick={handleBackup}
          className="w-full bg-blue-700 hover:bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          ดาวน์โหลด Backup
        </button>
      </div>

      {/* Import */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-950/60 border border-violet-800/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-zinc-200">นำเข้าข้อมูล</h3>
            <p className="text-xs text-zinc-500 mt-0.5">นำเข้าสินค้าจากไฟล์ Backup JSON (Upsert ตาม SKU)</p>
          </div>
        </div>
        <label className="block">
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
            disabled={importing}
          />
          <span
            onClick={() => fileRef.current?.click()}
            className="block w-full text-center bg-violet-700 hover:bg-violet-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer"
          >
            {importing ? 'กำลังนำเข้า...' : 'เลือกไฟล์ JSON'}
          </span>
        </label>
        {importMsg && (
          <p className={`text-xs px-3 py-2 rounded-lg border ${importMsg.startsWith('นำเข้า') ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' : 'text-red-400 bg-red-950/40 border-red-800/40'}`}>
            {importMsg}
          </p>
        )}
      </div>

      {/* Clear */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-zinc-200">ล้างฐานข้อมูล</h3>
            <p className="text-xs text-zinc-500 mt-0.5">ลบข้อมูลที่เลือก ไม่สามารถกู้คืนได้</p>
          </div>
        </div>

        <div className="space-y-2">
          {CLEAR_OPTIONS.map((opt) => (
            <label key={opt.id} className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="clearTarget"
                value={opt.id}
                checked={clearTarget === opt.id}
                onChange={() => { setClearTarget(opt.id); setConfirm('') }}
                className="mt-0.5"
              />
              <div>
                <p className={`text-sm font-medium ${opt.color}`}>{opt.label}</p>
                <p className="text-xs text-zinc-600">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {clearTarget && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-400">พิมพ์ <span className="font-mono text-zinc-200">ยืนยัน</span> เพื่อดำเนินการ</p>
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="ยืนยัน"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-700"
            />
          </div>
        )}

        <button
          onClick={handleClear}
          disabled={!clearTarget || confirm !== 'ยืนยัน' || clearing}
          className="w-full bg-red-700 hover:bg-red-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {clearing ? 'กำลังล้างข้อมูล...' : 'ล้างข้อมูล'}
        </button>

        {clearMsg && (
          <p className={`text-xs px-3 py-2 rounded-lg border ${clearMsg.startsWith('ล้าง') || clearMsg.includes('สำเร็จ') ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' : 'text-red-400 bg-red-950/40 border-red-800/40'}`}>
            {clearMsg}
          </p>
        )}
      </div>
    </div>
  )
}
