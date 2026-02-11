'use client'

import Link from 'next/link'
import { ShoppingCart, User, Search } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export function Navbar() {
  const { items } = useCart()
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          {{APP_NAME}}
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/products" className="hover:text-gray-600">Produits</Link>
          <Link href="/categories" className="hover:text-gray-600">Catégories</Link>
          <Link href="/about" className="hover:text-gray-600">À propos</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Search className="w-5 h-5" />
          </button>
          <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full">
            <User className="w-5 h-5" />
          </Link>
          <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full relative">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
