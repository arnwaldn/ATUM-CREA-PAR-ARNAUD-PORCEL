'use client'

import { useState } from 'react'
import {
  Dumbbell, Clock, Users, Calendar, ChevronRight, Play,
  Zap, Heart, Target, Award, Menu, X, Check, Star
} from 'lucide-react'
import { cn, formatPrice, type FitnessClass, type Membership } from '@/lib/utils'

const classes: FitnessClass[] = [
  { id: '1', name: 'HIIT Explosion', instructor: 'Sarah M.', duration: 45, level: 'advanced', time: '07:00', day: 'Lundi', spots: 5, maxSpots: 20, category: 'hiit' },
  { id: '2', name: 'Yoga Flow', instructor: 'Marie L.', duration: 60, level: 'beginner', time: '09:00', day: 'Lundi', spots: 8, maxSpots: 15, category: 'yoga' },
  { id: '3', name: 'Spinning Power', instructor: 'Thomas B.', duration: 50, level: 'intermediate', time: '12:00', day: 'Mardi', spots: 3, maxSpots: 25, category: 'cycling' },
  { id: '4', name: 'Musculation', instructor: 'Pierre D.', duration: 60, level: 'intermediate', time: '18:00', day: 'Mardi', spots: 10, maxSpots: 20, category: 'strength' },
  { id: '5', name: 'Cardio Dance', instructor: 'Julie R.', duration: 45, level: 'beginner', time: '19:00', day: 'Mercredi', spots: 12, maxSpots: 30, category: 'cardio' },
  { id: '6', name: 'CrossFit', instructor: 'Marc V.', duration: 60, level: 'advanced', time: '07:00', day: 'Jeudi', spots: 2, maxSpots: 15, category: 'hiit' },
]

const memberships: Membership[] = [
  {
    id: '1',
    name: 'Essential',
    price: 29,
    period: 'month',
    features: ['Accès salle musculation', 'Vestiaires', 'Parking gratuit'],
  },
  {
    id: '2',
    name: 'Premium',
    price: 49,
    period: 'month',
    features: ['Tout Essential +', 'Cours collectifs illimités', 'Sauna & Hammam', 'Coach virtuel'],
    popular: true,
  },
  {
    id: '3',
    name: 'Elite',
    price: 79,
    period: 'month',
    features: ['Tout Premium +', '4 séances coaching/mois', 'Nutrition personnalisée', 'Accès multi-clubs'],
  },
]

const stats = [
  { value: '2500+', label: 'Membres actifs' },
  { value: '50+', label: 'Cours par semaine' },
  { value: '15', label: 'Coachs certifiés' },
  { value: '98%', label: 'Satisfaction' },
]

export default function Fitness() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredClasses = selectedCategory === 'all'
    ? classes
    : classes.filter(c => c.category === selectedCategory)

  const levelColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-black text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-8 h-8 text-green-500" />
              <span className="text-xl font-bold">FitPower</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#cours" className="hover:text-green-400 transition-colors">Cours</a>
              <a href="#pricing" className="hover:text-green-400 transition-colors">Tarifs</a>
              <a href="#coachs" className="hover:text-green-400 transition-colors">Coachs</a>
              <a href="#contact" className="hover:text-green-400 transition-colors">Contact</a>
              <button className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors">
                Essai gratuit
              </button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-24 px-4 bg-black text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full text-green-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              Nouveau: Cours en plein air
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Dépassez vos <span className="text-green-500">limites</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Rejoignez la communauté FitPower et transformez votre corps avec nos coachs experts et équipements premium.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
                Commencer maintenant
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="flex items-center justify-center gap-2 px-8 py-4 border border-white/30 hover:bg-white/10 font-semibold rounded-lg transition-colors">
                <Play className="w-5 h-5" />
                Voir la vidéo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-green-500">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center text-white">
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-green-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Classes */}
      <section id="cours" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Planning des cours</h2>
            <p className="text-gray-600 dark:text-gray-400">Plus de 50 cours par semaine pour tous les niveaux</p>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {['all', 'cardio', 'strength', 'yoga', 'hiit', 'cycling'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-full font-medium transition-colors',
                  selectedCategory === cat
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                )}
              >
                {cat === 'all' ? 'Tous' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Classes grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{cls.name}</h3>
                    <p className="text-gray-500">avec {cls.instructor}</p>
                  </div>
                  <span className={cn('px-3 py-1 rounded-full text-xs font-medium', levelColors[cls.level])}>
                    {cls.level === 'beginner' ? 'Débutant' : cls.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {cls.day}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {cls.time} ({cls.duration}min)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm">
                    <Users className="w-4 h-4" />
                    {cls.spots} places restantes
                  </span>
                  <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors">
                    Réserver
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Nos abonnements</h2>
            <p className="text-gray-600 dark:text-gray-400">Choisissez la formule adaptée à vos objectifs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {memberships.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  'bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl relative',
                  plan.popular && 'ring-2 ring-green-500 scale-105'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                    Plus populaire
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-green-500">{formatPrice(plan.price)}</span>
                  <span className="text-gray-500">/mois</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={cn(
                    'w-full py-4 rounded-lg font-semibold transition-colors',
                    plan.popular
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-900 dark:text-white'
                  )}
                >
                  Choisir {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Award className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-6">Prêt à commencer ?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Profitez de 7 jours d'essai gratuit et découvrez tous nos équipements et cours.
          </p>
          <button className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
            Démarrer mon essai gratuit
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Dumbbell className="w-8 h-8 text-green-500" />
            <span className="text-xl font-bold">FitPower</span>
          </div>
          <p className="text-gray-400 mb-6">
            Le fitness autrement, pour tous les niveaux.
          </p>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} FitPower. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
