import { ProductGrid } from '@/components/product-grid'
import { Hero } from '@/components/hero'
import { Categories } from '@/components/categories'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Produits populaires</h2>
        <ProductGrid />
      </section>
    </>
  )
}
