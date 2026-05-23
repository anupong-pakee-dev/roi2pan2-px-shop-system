import { verifySession } from '@/app/lib/dal'
import Navbar from '@/app/ui/navbar'
import CartDrawer from '@/app/ui/cart-drawer'
import { CartProvider } from '@/app/lib/cart-context'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()

  return (
    <CartProvider>
      <div className="flex flex-col bg-zinc-950">
        <Navbar session={session} />
        <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </main>
      </div>
      <CartDrawer />
    </CartProvider>
  )
}
