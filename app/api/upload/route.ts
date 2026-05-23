import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getSession } from '@/app/lib/session'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'px_shop',
        resource_type: 'image',
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'webp' }],
      },
      (error, result) => {
        if (error || !result) reject(error ?? new Error('Upload failed'))
        else resolve(result.secure_url)
      }
    )
    stream.end(buffer)
  })
}

async function saveLocally(buffer: Buffer, originalName: string): Promise<string> {
  const ext = path.extname(originalName) || '.jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), buffer)
  return `/uploads/${filename}`
}

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'ไฟล์ต้องเป็นรูปภาพ (jpg, png, webp, gif)' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const cloudinaryReady = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )

  try {
    if (cloudinaryReady) {
      // ─── Cloudinary (production) ───────────────────────────────────
      const url = await uploadToCloudinary(buffer)
      return NextResponse.json({ url })
    } else {
      // ─── Local fallback (dev / no Cloudinary) ─────────────────────
      const url = await saveLocally(buffer, file.name)
      return NextResponse.json({ url, local: true })
    }
  } catch (err) {
    console.error('[upload] error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `อัปโหลดไม่สำเร็จ: ${message}` }, { status: 500 })
  }
}
