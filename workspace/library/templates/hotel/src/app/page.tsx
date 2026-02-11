'use client'

import { useState } from 'react'
import {
  Bed, Calendar, Users, Wifi, Coffee, Waves, UtensilsCrossed,
  Sparkles, Star, ChevronRight, MapPin, Phone, Mail, Menu, X
} from 'lucide-react'
import { cn, formatPrice, formatDate, type Room } from '@/lib/utils'

const rooms: Room[] = [
  {
    id: '1',
    name: 'Chambre Classique',
    type: 'standard',
    price: 150,
    capacity: 2,
    size: 25,
    amenities: ['Wifi', 'TV', 'Minibar', 'Coffre-fort'],
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
    available: true,
  },
  {
    id: '2',
    name: 'Chambre Deluxe',
    type: 'deluxe',
    price: 250,
    capacity: 2,
    size: 35,
    amenities: ['Wifi', 'TV 55"', 'Minibar', 'Balcon', 'Vue mer'],
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
    available: true,
  },
  {
    id: '3',
    name: 'Suite Junior',
    type: 'suite',
    price: 400,
    capacity: 3,
    size: 50,
    amenities: ['Wifi', 'TV 65"', 'Salon', 'Balcon', 'Vue panoramique', 'Jacuzzi'],
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    available: true,
  },
  {
    id: '4',
    name: 'Suite Présidentielle',
    type: 'presidential',
    price: 800,
    capacity: 4,
    size: 100,
    amenities: ['Wifi', 'TV 75"', 'Salon', 'Terrasse', 'Vue 360°', 'Jacuzzi', 'Butler'],
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'],
    available: false,
  },
]

const amenities = [
  { icon: Waves, name: 'Piscine', desc: 'Piscine intérieure chauffée' },
  { icon: Sparkles, name: 'Spa', desc: 'Soins et massages' },
  { icon: UtensilsCrossed, name: 'Restaurant', desc: 'Cuisine gastronomique' },
  { icon: Coffee, name: 'Bar', desc: 'Cocktails et tapas' },
  { icon: Wifi, name: 'Wifi', desc: 'Haut débit gratuit' },
]

export default function Hotel() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [booking, setBooking] = useState({
    checkIn: '',
    checkOut: '',
    guests: '2',
    roomType: 'all',
  })

  const filteredRooms = booking.roomType === 'all'
    ? rooms
    : rooms.filter(r => r.type === booking.roomType)

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <span className="text-2xl font-serif text-white">Le Grand Palace</span>

            <div className="hidden md:flex items-center gap-8">
              <a href="#chambres" className="text-white/80 hover:text-amber-400 transition-colors">Chambres</a>
              <a href="#services" className="text-white/80 hover:text-amber-400 transition-colors">Services</a>
              <a href="#restaurant" className="text-white/80 hover:text-amber-400 transition-colors">Restaurant</a>
              <a href="#contact" className="text-white/80 hover:text-amber-400 transition-colors">Contact</a>
              <button className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors">
                Réserver
              </button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <p className="text-amber-400 font-serif text-xl mb-4 tracking-widest">BIENVENUE AU</p>
          <h1 className="text-5xl md:text-7xl font-serif mb-6">Le Grand Palace</h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
            Un havre de paix et de luxe au cœur de Paris
          </p>
          <div className="flex justify-center gap-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <a
            href="#chambres"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors"
          >
            Découvrir nos chambres
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Booking Bar */}
      <section className="py-8 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-amber-400 text-sm mb-2">Arrivée</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={booking.checkIn}
                  onChange={(e) => setBooking({ ...booking, checkIn: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-white rounded focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-amber-400 text-sm mb-2">Départ</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={booking.checkOut}
                  onChange={(e) => setBooking({ ...booking, checkOut: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-white rounded focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-amber-400 text-sm mb-2">Voyageurs</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={booking.guests}
                  onChange={(e) => setBooking({ ...booking, guests: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-white rounded focus:ring-2 focus:ring-amber-500"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'adulte' : 'adultes'}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-amber-400 text-sm mb-2">Type de chambre</label>
              <select
                value={booking.roomType}
                onChange={(e) => setBooking({ ...booking, roomType: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Toutes</option>
                <option value="standard">Classique</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded transition-colors">
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms */}
      <section id="chambres" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 font-serif text-lg mb-2">Nos hébergements</p>
            <h2 className="text-4xl font-serif text-gray-900">Chambres & Suites</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white shadow-lg overflow-hidden group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={room.images[0]}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {!room.available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-medium">Complet</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-amber-600 text-white text-sm">
                    {room.type === 'standard' ? 'Classique' : room.type === 'deluxe' ? 'Deluxe' : room.type === 'suite' ? 'Suite' : 'Présidentielle'}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-serif text-gray-900 mb-2">{room.name}</h3>
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      {room.capacity} pers.
                    </span>
                    <span>{room.size} m²</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {room.amenities.slice(0, 4).map((amenity) => (
                      <span key={amenity} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-serif text-amber-600">{formatPrice(room.price)}</span>
                      <span className="text-gray-500">/nuit</span>
                    </div>
                    <button
                      disabled={!room.available}
                      className={cn(
                        'px-6 py-3 font-medium transition-colors',
                        room.available
                          ? 'bg-gray-900 hover:bg-gray-800 text-white'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section id="services" className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-400 font-serif text-lg mb-2">L'excellence</p>
            <h2 className="text-4xl font-serif">Nos Services</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {amenities.map((amenity) => (
              <div key={amenity.name} className="text-center">
                <div className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <amenity.icon className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="font-semibold mb-2">{amenity.name}</h3>
                <p className="text-gray-400 text-sm">{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif text-gray-900 mb-12">Nous contacter</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <MapPin className="w-8 h-8 text-amber-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Adresse</h3>
              <p className="text-gray-600">15 Avenue Montaigne<br />75008 Paris, France</p>
            </div>
            <div className="p-6">
              <Phone className="w-8 h-8 text-amber-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Téléphone</h3>
              <p className="text-gray-600">+33 1 23 45 67 89</p>
            </div>
            <div className="p-6">
              <Mail className="w-8 h-8 text-amber-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">contact@legrandpalace.fr</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black text-white text-center">
        <span className="text-2xl font-serif block mb-4">Le Grand Palace</span>
        <div className="flex justify-center gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Le Grand Palace. Tous droits réservés.
        </p>
      </footer>
    </div>
  )
}
