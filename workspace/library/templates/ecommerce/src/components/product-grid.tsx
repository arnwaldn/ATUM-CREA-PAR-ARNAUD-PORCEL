'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

const products = [
  { id: '1', name: 'Produit 1', price: 29.99, image: '/placeholder.jpg' },
  { id: '2', name: 'Produit 2', price: 49.99, image: '/placeholder.jpg' },
  { id: '3', name: 'Produit 3', price: 19.99, image: '/placeholder.jpg' },
  { id: '4', name: 'Produit 4', price: 79.99, image: '/placeholder.jpg' },
]

export function ProductGrid() {
  const { addItem } = useCart()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="group">
          <Link href={`/products/${product.id}`}>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Image</span>
              </div>
            </div>
          </Link>
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-gray-600 mb-2">{product.price.toFixed(2)} €</p>
          <button
            onClick={() => addItem({ ...product, quantity: 1 })}
            className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Ajouter au panier
          </button>
        </div>
      ))}
    </div>
  )
}
