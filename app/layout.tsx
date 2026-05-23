import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Footer from '@/app/ui/footer'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'PX Stock',
  description: 'ระบบจัดการสต็อกสินค้า',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
