'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  UtensilsCrossed, Clock, MapPin, Phone, Mail,
  Calendar, Users, ChevronRight, Star, Instagram,
  Facebook, Menu, X
} from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'

const menuCategories = [
  {
    name: 'Entrees',
    items: [
      { name: 'Foie gras maison', description: 'Chutney de figues, pain brioché toasté', price: 18 },
      { name: 'Tartare de saumon', description: 'Avocat, agrumes, huile de sésame', price: 16 },
      { name: 'Velouté de saison', description: 'Légumes du marché, crème fraîche', price: 12 },
    ]
  },
  {
    name: 'Plats',
    items: [
      { name: 'Filet de boeuf', description: 'Sauce au poivre, gratin dauphinois', price: 32 },
      { name: 'Dos de cabillaud', description: 'Risotto crémeux, émulsion citronnée', price: 28 },
      { name: 'Magret de canard', description: 'Miel et épices, légumes rôtis', price: 26 },
    ]
  },
  {
    name: 'Desserts',
    items: [
      { name: 'Fondant au chocolat', description: 'Coeur coulant, glace vanille', price: 12 },
      { name: 'Tarte tatin', description: 'Pommes caramélisées, crème fraîche', price: 10 },
      { name: 'Assiette de fromages', description: 'Sélection affinée, confiture', price: 14 },
    ]
  },
]

const openingHours = [
  { day: 'Lundi', hours: 'Fermé' },
  { day: 'Mardi - Vendredi', hours: '12h00 - 14h30 / 19h00 - 22h30' },
  { day: 'Samedi', hours: '19h00 - 23h00' },
  { day: 'Dimanche', hours: '12h00 - 15h00' },
]

export default function Restaurant() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Entrees')
  const [reservationData, setReservationData] = useState({
    date: '',
    time: '19:00',
    guests: '2',
    name: '',
    phone: '',
    email: '',
  })

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Réservation envoyée ! Nous vous confirmerons par email.')
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-8 h-8 text-amber-500" />
              <span className="text-2xl font-serif text-white">La Table d'Or</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {['Menu', 'Réservation', 'Horaires', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-white/80 hover:text-amber-400 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 py-4">
            {['Menu', 'Réservation', 'Horaires', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block px-6 py-3 text-white/80 hover:text-amber-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <p className="text-amber-400 font-serif text-xl mb-4">Bienvenue chez</p>
          <h1 className="text-5xl md:text-7xl font-serif mb-6">La Table d'Or</h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
            Une expérience culinaire d'exception au cœur de la ville
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#reservation"
              className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
            >
              Réserver une table
            </a>
            <a
              href="#menu"
              className="px-8 py-4 border-2 border-white/50 hover:border-white text-white font-semibold rounded-lg transition-colors"
            >
              Voir le menu
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-8 h-8 text-white rotate-90" />
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 font-serif text-lg mb-2">Découvrez</p>
            <h2 className="text-4xl font-serif text-gray-900 dark:text-white">Notre Carte</h2>
          </div>

          {/* Category tabs */}
          <div className="flex justify-center gap-4 mb-12">
            {menuCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={cn(
                  'px-6 py-2 rounded-full font-medium transition-all',
                  activeCategory === cat.name
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu items */}
          <div className="grid md:grid-cols-2 gap-8">
            {menuCategories
              .find((c) => c.name === activeCategory)
              ?.items.map((item) => (
                <div
                  key={item.name}
                  className="flex justify-between items-start p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <h3 className="text-xl font-serif text-gray-900 dark:text-white mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>
                  <span className="text-2xl font-serif text-amber-600">
                    {formatPrice(item.price)}
                  </span>
                </div>
              ))}
          </div>

          {/* QR Code */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Scannez pour voir le menu complet
            </p>
            <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
              <QRCodeSVG value="https://restaurant.com/menu" size={120} />
            </div>
          </div>
        </div>
      </section>

      {/* Reservation */}
      <section id="réservation" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 font-serif text-lg mb-2">Réservez</p>
            <h2 className="text-4xl font-serif text-gray-900 dark:text-white">Votre Table</h2>
          </div>

          <form onSubmit={handleReservation} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={reservationData.date}
                  onChange={(e) => setReservationData({ ...reservationData, date: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Heure
                </label>
                <select
                  value={reservationData.time}
                  onChange={(e) => setReservationData({ ...reservationData, time: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  {['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="inline w-4 h-4 mr-2" />
                  Nombre de personnes
                </label>
                <select
                  value={reservationData.guests}
                  onChange={(e) => setReservationData({ ...reservationData, guests: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'personne' : 'personnes'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={reservationData.name}
                  onChange={(e) => setReservationData({ ...reservationData, name: e.target.value })}
                  placeholder="Votre nom"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  required
                  value={reservationData.phone}
                  onChange={(e) => setReservationData({ ...reservationData, phone: e.target.value })}
                  placeholder="06 12 34 56 78"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={reservationData.email}
                  onChange={(e) => setReservationData({ ...reservationData, email: e.target.value })}
                  placeholder="email@exemple.com"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
            >
              Confirmer la réservation
            </button>
          </form>
        </div>
      </section>

      {/* Hours & Contact */}
      <section id="horaires" className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Hours */}
          <div>
            <h3 className="text-2xl font-serif text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-600" />
              Horaires d'ouverture
            </h3>
            <div className="space-y-4">
              {openingHours.map((item) => (
                <div key={item.day} className="flex justify-between py-3 border-b dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-white">{item.day}</span>
                  <span className="text-gray-600 dark:text-gray-400">{item.hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div id="contact">
            <h3 className="text-2xl font-serif text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-amber-600" />
              Nous trouver
            </h3>
            <div className="space-y-4">
              <p className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                123 Avenue des Champs-Élysées<br />75008 Paris, France
              </p>
              <p className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-amber-600" />
                +33 1 23 45 67 89
              </p>
              <p className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-amber-600" />
                contact@latabledore.fr
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <a href="#" className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-amber-100 transition-colors">
                <Instagram className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </a>
              <a href="#" className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-amber-100 transition-colors">
                <Facebook className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-black text-white text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <UtensilsCrossed className="w-6 h-6 text-amber-500" />
          <span className="text-xl font-serif">La Table d'Or</span>
        </div>
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-white/60 text-sm">
          © {new Date().getFullYear()} La Table d'Or. Tous droits réservés.
        </p>
      </footer>
    </div>
  )
}
