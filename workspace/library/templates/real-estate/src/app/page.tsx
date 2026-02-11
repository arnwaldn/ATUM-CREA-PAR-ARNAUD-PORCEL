'use client'

import { useState } from 'react'
import {
  Home, Search, MapPin, Bed, Bath, Square, Heart, Filter,
  ChevronDown, Phone, Mail, Menu, X, Building, Key
} from 'lucide-react'
import { cn, formatPrice, formatArea, type Property, type PropertyType, type TransactionType } from '@/lib/utils'

const properties: Property[] = [
  {
    id: '1',
    title: 'Appartement moderne centre-ville',
    type: 'apartment',
    transaction: 'sale',
    price: 450000,
    area: 85,
    rooms: 4,
    bedrooms: 2,
    bathrooms: 1,
    address: '15 Rue de la Paix',
    city: 'Paris',
    zipCode: '75002',
    description: 'Superbe appartement rénové avec goût',
    features: ['Balcon', 'Parking', 'Cave', 'Gardien'],
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    coordinates: { lat: 48.8566, lng: 2.3522 },
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Maison familiale avec jardin',
    type: 'house',
    transaction: 'sale',
    price: 680000,
    area: 150,
    rooms: 6,
    bedrooms: 4,
    bathrooms: 2,
    address: '8 Avenue des Roses',
    city: 'Lyon',
    zipCode: '69006',
    description: 'Belle maison avec grand jardin arboré',
    features: ['Jardin', 'Garage', 'Terrasse', 'Piscine'],
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
    coordinates: { lat: 45.7640, lng: 4.8357 },
    createdAt: new Date(),
  },
  {
    id: '3',
    title: 'Studio étudiant lumineux',
    type: 'studio',
    transaction: 'rent',
    price: 750,
    area: 25,
    rooms: 1,
    bedrooms: 0,
    bathrooms: 1,
    address: '42 Rue des Étudiants',
    city: 'Bordeaux',
    zipCode: '33000',
    description: 'Studio idéal pour étudiant, proche transports',
    features: ['Meublé', 'Internet', 'Proche métro'],
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    coordinates: { lat: 44.8378, lng: -0.5792 },
    createdAt: new Date(),
  },
  {
    id: '4',
    title: 'Loft industriel atypique',
    type: 'loft',
    transaction: 'sale',
    price: 520000,
    area: 120,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    address: '5 Rue de l\'Industrie',
    city: 'Marseille',
    zipCode: '13002',
    description: 'Loft unique dans ancienne usine réhabilitée',
    features: ['Hauteur sous plafond', 'Verrière', 'Parking'],
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
    coordinates: { lat: 43.2965, lng: 5.3698 },
    createdAt: new Date(),
  },
]

const propertyTypes: { value: PropertyType | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous types' },
  { value: 'apartment', label: 'Appartement' },
  { value: 'house', label: 'Maison' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'loft', label: 'Loft' },
]

export default function RealEstate() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [filters, setFilters] = useState({
    transaction: 'all' as TransactionType | 'all',
    type: 'all' as PropertyType | 'all',
    minPrice: '',
    maxPrice: '',
    city: '',
  })

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const filteredProperties = properties.filter((p) => {
    if (filters.transaction !== 'all' && p.transaction !== filters.transaction) return false
    if (filters.type !== 'all' && p.type !== filters.type) return false
    if (filters.city && !p.city.toLowerCase().includes(filters.city.toLowerCase())) return false
    if (filters.minPrice && p.price < parseInt(filters.minPrice)) return false
    if (filters.maxPrice && p.price > parseInt(filters.maxPrice)) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Building className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">ImmoExpert</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Acheter</a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Louer</a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Estimer</a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Contact</a>
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Search */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trouvez le bien de vos rêves
          </h1>
          <p className="text-xl text-blue-100 mb-10">
            Plus de 10 000 biens disponibles en France
          </p>

          {/* Search bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Transaction type */}
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filters.transaction}
                  onChange={(e) => setFilters({ ...filters, transaction: e.target.value as TransactionType | 'all' })}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">Acheter ou Louer</option>
                  <option value="sale">Acheter</option>
                  <option value="rent">Louer</option>
                </select>
              </div>

              {/* Property type */}
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value as PropertyType | 'all' })}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  {propertyTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ville ou code postal"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              {/* Search button */}
              <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {filteredProperties.length} biens disponibles
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Filter className="w-4 h-4" />
              Filtres
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Property grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="relative h-56">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => toggleFavorite(property.id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart
                      className={cn(
                        'w-5 h-5',
                        favorites.includes(property.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600'
                      )}
                    />
                  </button>
                  <div className="absolute bottom-4 left-4">
                    <span className={cn(
                      'px-3 py-1 text-sm font-medium rounded-full',
                      property.transaction === 'sale'
                        ? 'bg-blue-600 text-white'
                        : 'bg-green-600 text-white'
                    )}>
                      {property.transaction === 'sale' ? 'À vendre' : 'À louer'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {property.title}
                    </h3>
                  </div>

                  <p className="flex items-center gap-1 text-gray-600 dark:text-gray-400 mb-4">
                    <MapPin className="w-4 h-4" />
                    {property.city}, {property.zipCode}
                  </p>

                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Square className="w-4 h-4" />
                      {formatArea(property.area)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      {property.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      {property.bathrooms}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(property.price)}
                      {property.transaction === 'rent' && <span className="text-sm font-normal">/mois</span>}
                    </span>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Vous avez un projet immobilier ?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Nos experts sont à votre disposition pour vous accompagner
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+33123456789"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Phone className="w-5 h-5" />
              01 23 45 67 89
            </a>
            <a
              href="mailto:contact@immoexpert.fr"
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Mail className="w-5 h-5" />
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold">ImmoExpert</span>
            </div>
            <p className="text-gray-400">
              Votre partenaire de confiance pour tous vos projets immobiliers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Acheter</a></li>
              <li><a href="#" className="hover:text-white">Louer</a></li>
              <li><a href="#" className="hover:text-white">Vendre</a></li>
              <li><a href="#" className="hover:text-white">Estimation gratuite</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Villes</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Paris</a></li>
              <li><a href="#" className="hover:text-white">Lyon</a></li>
              <li><a href="#" className="hover:text-white">Marseille</a></li>
              <li><a href="#" className="hover:text-white">Bordeaux</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>01 23 45 67 89</li>
              <li>contact@immoexpert.fr</li>
              <li>Paris, France</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          © {new Date().getFullYear()} ImmoExpert. Tous droits réservés.
        </div>
      </footer>
    </div>
  )
}
