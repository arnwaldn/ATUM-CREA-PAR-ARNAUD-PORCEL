'use client'

import { useState } from 'react'
import { Search, Calendar, Clock, Tag, ArrowRight, Mail, Rss, Menu, X } from 'lucide-react'
import { cn, formatDate, type Post } from '@/lib/utils'

const posts: Post[] = [
  {
    slug: 'introduction-to-nextjs-15',
    title: 'Introduction à Next.js 15 : Nouveautés et meilleures pratiques',
    excerpt: 'Découvrez les nouvelles fonctionnalités de Next.js 15 et comment les utiliser efficacement dans vos projets.',
    content: '',
    date: new Date('2024-01-15'),
    author: { name: 'Marie Dupont', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    category: 'Développement',
    tags: ['Next.js', 'React', 'JavaScript'],
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    readingTime: 8,
  },
  {
    slug: 'tailwindcss-best-practices',
    title: 'TailwindCSS : Les bonnes pratiques pour un code maintenable',
    excerpt: 'Apprenez à structurer votre code TailwindCSS pour des projets scalables et faciles à maintenir.',
    content: '',
    date: new Date('2024-01-10'),
    author: { name: 'Thomas Martin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    category: 'CSS',
    tags: ['TailwindCSS', 'CSS', 'Design'],
    image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
    readingTime: 6,
  },
  {
    slug: 'typescript-advanced-types',
    title: 'TypeScript : Maîtriser les types avancés',
    excerpt: 'Plongez dans les types avancés de TypeScript : generics, conditional types, et mapped types.',
    content: '',
    date: new Date('2024-01-05'),
    author: { name: 'Marie Dupont', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    category: 'TypeScript',
    tags: ['TypeScript', 'JavaScript', 'Types'],
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    readingTime: 12,
  },
  {
    slug: 'react-server-components',
    title: 'React Server Components expliqués simplement',
    excerpt: 'Comprendre le fonctionnement des React Server Components et quand les utiliser.',
    content: '',
    date: new Date('2024-01-01'),
    author: { name: 'Pierre Bernard', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    category: 'React',
    tags: ['React', 'RSC', 'Next.js'],
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    readingTime: 10,
  },
]

const categories = ['Tous', 'Développement', 'CSS', 'TypeScript', 'React', 'Design']

export default function Blog() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [searchQuery, setSearchQuery] = useState('')
  const [email, setEmail] = useState('')

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'Tous' || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredPost = posts[0]
  const recentPosts = posts.slice(1)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-serif font-bold">Le Blog</span>

            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Articles</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Catégories</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">À propos</a>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Rss className="w-5 h-5" />
              </button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero / Featured Post */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-rose-500 font-medium text-sm uppercase tracking-wider">
                Article à la une
              </span>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mt-4 mb-6 leading-tight">
                {featuredPost.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={featuredPost.author.avatar}
                  alt={featuredPost.author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{featuredPost.author.name}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(featuredPost.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readingTime} min
                    </span>
                  </div>
                </div>
              </div>
              <a
                href={`/post/${featuredPost.slug}`}
                className="inline-flex items-center gap-2 text-rose-500 font-medium hover:text-rose-600 transition-colors"
              >
                Lire l'article
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <div className="relative">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full aspect-[4/3] object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 px-4 border-y dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    selectedCategory === cat
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-serif font-bold mb-8">Articles récents</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.slug}
                className="group"
              >
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 text-sm font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readingTime} min
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold mb-2 group-hover:text-rose-500 transition-colors">
                  <a href={`/post/${post.slug}`}>{post.title}</a>
                </h3>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                  {post.excerpt}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="w-12 h-12 mx-auto mb-6 text-rose-400" />
          <h2 className="text-3xl font-serif font-bold mb-4">Newsletter</h2>
          <p className="text-gray-400 mb-8">
            Recevez les derniers articles directement dans votre boîte mail.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
            <button className="px-6 py-3 bg-rose-500 hover:bg-rose-600 font-medium rounded-lg transition-colors">
              S'inscrire
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-2xl font-serif font-bold">Le Blog</span>
          <p className="text-gray-500 mt-4">
            © {new Date().getFullYear()} Le Blog. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
