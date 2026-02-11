import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">{{APP_NAME}}</h3>
            <p className="text-gray-400">{{APP_TAGLINE}}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Boutique</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/products">Produits</Link></li>
              <li><Link href="/categories">Catégories</Link></li>
              <li><Link href="/promotions">Promotions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/livraison">Livraison</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/cgv">CGV</Link></li>
              <li><Link href="/privacy">Confidentialité</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          © 2025 {{APP_NAME}}. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
