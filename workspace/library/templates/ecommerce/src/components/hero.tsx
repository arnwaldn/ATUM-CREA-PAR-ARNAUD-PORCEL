import Link from 'next/link'

export function Hero() {
  return (
    <section className="bg-gray-900 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">{{APP_HEADLINE}}</h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          {{APP_TAGLINE}}
        </p>
        <Link
          href="/products"
          className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
        >
          Découvrir nos produits
        </Link>
      </div>
    </section>
  )
}
