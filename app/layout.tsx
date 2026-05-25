import type { Metadata } from 'next'
import { IBM_Plex_Sans_Thai, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import Footer from '@/app/ui/footer'
import './globals.css'

const plexThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plex-thai',
  display: 'swap',
})
const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
})
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PX Shop',
  description: 'ระบบจัดการสต็อกและสั่งซื้อสินค้าภายในองค์กร',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${plexThai.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="bg-bg text-ink antialiased min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
