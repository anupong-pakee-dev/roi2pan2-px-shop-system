import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/app/lib/session'

const publicRoutes = ['/login']

/** Only ADMIN */
const adminOnlyRoutes = ['/dashboard/data']

/** ADMIN or STAFF */
const staffRoutes = ['/dashboard']

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(path)

  const cookie = req.cookies.get('session')?.value
  const session = await decrypt(cookie)

  if (!isPublicRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL('/products', req.nextUrl))
  }

  // Check admin-only pages first (more specific)
  if (adminOnlyRoutes.some((r) => path.startsWith(r)) && session?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/products', req.nextUrl))
  }

  // Check staff pages (ADMIN or STAFF)
  if (
    staffRoutes.some((r) => path.startsWith(r)) &&
    session?.role !== 'ADMIN' &&
    session?.role !== 'STAFF'
  ) {
    return NextResponse.redirect(new URL('/products', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|uploads|.*\\.png$|.*\\.svg$|.*\\.ico$).*)'],
}
