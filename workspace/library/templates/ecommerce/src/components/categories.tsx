import Link from 'next/link'

const categories = [
  { name: 'Électronique', slug: 'electronique', icon: '📱' },
  { name: 'Vêtements', slug: 'vetements', icon: '👕' },
  { name: 'Maison', slug: 'maison', icon: '🏠' },
  { name: 'Sport', slug: 'sport', icon: '⚽' },
]

export function Categories() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-2xl font-bold mb-8">Catégories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="p-6 bg-gray-100 rounded-lg text-center hover:bg-gray-200"
          >
            <span className="text-4xl mb-2 block">{cat.icon}</span>
            <span className="font-medium">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
