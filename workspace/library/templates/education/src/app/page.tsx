'use client'

import { useState } from 'react'
import {
  BookOpen, Play, Users, Award, Clock, Star, Search,
  ChevronRight, GraduationCap, Laptop, BarChart, Menu, X
} from 'lucide-react'
import { cn, formatPrice, type Course } from '@/lib/utils'

const courses: Course[] = [
  {
    id: '1',
    title: 'React & Next.js de A à Z',
    description: 'Maîtrisez React et Next.js pour créer des applications web modernes',
    instructor: 'Marie Dupont',
    duration: '24h',
    level: 'intermediate',
    category: 'Développement Web',
    lessons: 120,
    students: 5420,
    rating: 4.8,
    price: 89,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
  },
  {
    id: '2',
    title: 'Python pour Data Science',
    description: 'Apprenez Python et ses bibliothèques pour l\'analyse de données',
    instructor: 'Thomas Martin',
    duration: '30h',
    level: 'beginner',
    category: 'Data Science',
    lessons: 85,
    students: 8230,
    rating: 4.9,
    price: 79,
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
  },
  {
    id: '3',
    title: 'UI/UX Design Masterclass',
    description: 'Créez des interfaces utilisateur exceptionnelles avec Figma',
    instructor: 'Sophie Bernard',
    duration: '18h',
    level: 'beginner',
    category: 'Design',
    lessons: 64,
    students: 3150,
    rating: 4.7,
    price: 69,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
  },
  {
    id: '4',
    title: 'Machine Learning Avancé',
    description: 'Deep Learning, NLP et Vision par ordinateur',
    instructor: 'Pierre Durand',
    duration: '40h',
    level: 'advanced',
    category: 'Data Science',
    lessons: 150,
    students: 2100,
    rating: 4.9,
    price: 149,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400',
  },
]

const categories = ['Tous', 'Développement Web', 'Data Science', 'Design', 'Marketing', 'Business']

const stats = [
  { icon: Users, value: '50K+', label: 'Étudiants' },
  { icon: BookOpen, value: '200+', label: 'Cours' },
  { icon: Award, value: '15K+', label: 'Certificats' },
  { icon: Star, value: '4.8', label: 'Note moyenne' },
]

export default function Education() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'Tous' || course.category === selectedCategory
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const levelColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold">LearnHub</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#courses" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">Cours</a>
              <a href="#categories" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">Catégories</a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">Tarifs</a>
              <button className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg">Connexion</button>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">S'inscrire</button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Développez vos compétences avec des cours de qualité
            </h1>
            <p className="text-xl text-purple-100 mb-8">
              Accédez à plus de 200 cours créés par des experts. Apprenez à votre rythme et obtenez des certificats reconnus.
            </p>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Que voulez-vous apprendre ?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Cours populaires</h2>
            <p className="text-gray-600 dark:text-gray-400">Découvrez nos formations les plus suivies</p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-full font-medium transition-colors',
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Course grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-40">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={cn('px-2 py-1 text-xs font-medium rounded', levelColors[course.level])}>
                      {course.level === 'beginner' ? 'Débutant' : course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-purple-600 text-sm font-medium mb-2">{course.category}</p>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{course.instructor}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      {course.lessons} leçons
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{course.students.toLocaleString()} étudiants</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                    <span className="text-2xl font-bold text-purple-600">{formatPrice(course.price)}</span>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
                      S'inscrire
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Pourquoi nous choisir ?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Laptop, title: 'Apprenez partout', desc: 'Accédez à vos cours sur tous vos appareils, même hors ligne' },
              { icon: Award, title: 'Certificats reconnus', desc: 'Obtenez des certificats valorisés par les entreprises' },
              { icon: BarChart, title: 'Suivez vos progrès', desc: 'Tableau de bord détaillé pour mesurer votre avancement' },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-8">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à commencer votre apprentissage ?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Rejoignez plus de 50 000 étudiants et développez vos compétences dès aujourd'hui.
          </p>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors">
            Créer mon compte gratuit
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <GraduationCap className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold">LearnHub</span>
          </div>
          <p className="text-gray-400 mb-6">
            La plateforme d'apprentissage en ligne de référence.
          </p>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} LearnHub. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
