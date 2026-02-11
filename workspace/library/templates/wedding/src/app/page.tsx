'use client'

import { useState, useEffect } from 'react'
import { Heart, Calendar, MapPin, Clock, Gift, Users, Camera, Mail, ChevronDown } from 'lucide-react'
import { cn, formatDate, getCountdown } from '@/lib/utils'

const weddingDate = new Date('2025-06-15T15:00:00')

const timeline = [
  { time: '14h30', event: 'Accueil des invités', icon: Users },
  { time: '15h00', event: 'Cérémonie', icon: Heart },
  { time: '16h00', event: 'Cocktail', icon: Gift },
  { time: '18h00', event: 'Photos de groupe', icon: Camera },
  { time: '19h30', event: 'Dîner', icon: Calendar },
  { time: '23h00', event: 'Soirée dansante', icon: Heart },
]

const gallery = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400',
  'https://images.unsplash.com/photo-1529636798458-92182e662485?w=400',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400',
  'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=400',
]

export default function Wedding() {
  const [countdown, setCountdown] = useState(getCountdown(weddingDate))
  const [rsvpData, setRsvpData] = useState({
    name: '',
    email: '',
    attending: '',
    guests: '1',
    dietary: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(weddingDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRsvp = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <p className="text-rose-200 text-lg mb-4 font-light tracking-widest">NOUS NOUS MARIONS</p>
          <h1 className="text-5xl md:text-7xl font-serif mb-6">Sophie & Thomas</h1>
          <p className="text-2xl md:text-3xl font-light mb-8">{formatDate(weddingDate)}</p>

          {/* Countdown */}
          <div className="flex justify-center gap-6 md:gap-10 mb-12">
            {[
              { value: countdown.days, label: 'Jours' },
              { value: countdown.hours, label: 'Heures' },
              { value: countdown.minutes, label: 'Minutes' },
              { value: countdown.seconds, label: 'Secondes' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-4xl md:text-5xl font-serif">{item.value}</div>
                <div className="text-sm text-rose-200 tracking-wider">{item.label}</div>
              </div>
            ))}
          </div>

          <a
            href="#rsvp"
            className="inline-block px-8 py-4 bg-rose-500/80 hover:bg-rose-500 text-white font-medium rounded-full transition-colors"
          >
            Confirmer ma présence
          </a>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white" />
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="w-10 h-10 text-rose-400 mx-auto mb-6" />
          <h2 className="text-4xl font-serif text-gray-800 mb-8">Notre Histoire</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Nous nous sommes rencontrés un soir d'été 2018 lors d'une soirée entre amis.
            Ce qui a commencé comme une simple conversation s'est transformé en une histoire d'amour
            qui nous mène aujourd'hui vers cette belle aventure.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Après 6 années à construire notre vie ensemble, nous sommes heureux de vous inviter
            à célébrer notre union entourés de ceux que nous aimons.
          </p>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-serif text-gray-800 text-center mb-12">Lieu & Programme</h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Ceremony */}
            <div className="text-center p-8 bg-rose-50 rounded-2xl">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-serif text-gray-800 mb-4">Cérémonie</h3>
              <p className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                Église Saint-Michel
              </p>
              <p className="text-gray-500">12 Rue de la Paix, Paris</p>
              <p className="flex items-center justify-center gap-2 text-gray-600 mt-4">
                <Clock className="w-4 h-4" />
                15h00
              </p>
            </div>

            {/* Reception */}
            <div className="text-center p-8 bg-amber-50 rounded-2xl">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-serif text-gray-800 mb-4">Réception</h3>
              <p className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                Château de la Rose
              </p>
              <p className="text-gray-500">Route des Vignes, Versailles</p>
              <p className="flex items-center justify-center gap-2 text-gray-600 mt-4">
                <Clock className="w-4 h-4" />
                À partir de 16h00
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-serif text-gray-800 text-center mb-12">Programme</h2>

          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={item.event} className="flex items-center gap-6">
                <div className="w-20 text-right">
                  <span className="text-2xl font-serif text-rose-500">{item.time}</span>
                </div>
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-rose-500" />
                </div>
                <div className="flex-1">
                  <span className="text-lg text-gray-700">{item.event}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif text-gray-800 text-center mb-12">Galerie</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((img, i) => (
              <div
                key={i}
                className={cn(
                  'overflow-hidden rounded-lg',
                  i === 0 && 'md:col-span-2 md:row-span-2'
                )}
              >
                <img
                  src={img}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RSVP */}
      <section id="rsvp" className="py-20 px-4 bg-rose-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-serif text-gray-800 text-center mb-4">Répondez s'il vous plaît</h2>
          <p className="text-center text-gray-600 mb-12">Avant le 1er mai 2025</p>

          {submitted ? (
            <div className="text-center p-12 bg-white rounded-2xl">
              <Heart className="w-16 h-16 text-rose-500 mx-auto mb-6" />
              <h3 className="text-2xl font-serif text-gray-800 mb-4">Merci !</h3>
              <p className="text-gray-600">Votre réponse a été enregistrée. Nous avons hâte de vous voir !</p>
            </div>
          ) : (
            <form onSubmit={handleRsvp} className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={rsvpData.name}
                    onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={rsvpData.email}
                    onChange={(e) => setRsvpData({ ...rsvpData, email: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500"
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serez-vous présent(e) ?</label>
                  <select
                    required
                    value={rsvpData.attending}
                    onChange={(e) => setRsvpData({ ...rsvpData, attending: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="yes">Oui, avec plaisir !</option>
                    <option value="no">Non, malheureusement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de personnes</label>
                  <select
                    value={rsvpData.guests}
                    onChange={(e) => setRsvpData({ ...rsvpData, guests: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restrictions alimentaires (optionnel)
                </label>
                <input
                  type="text"
                  value={rsvpData.dietary}
                  onChange={(e) => setRsvpData({ ...rsvpData, dietary: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Végétarien, allergies..."
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Un petit mot pour les mariés (optionnel)
                </label>
                <textarea
                  rows={3}
                  value={rsvpData.message}
                  onChange={(e) => setRsvpData({ ...rsvpData, message: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Vos mots..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors"
              >
                Envoyer ma réponse
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Gift Registry */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Gift className="w-10 h-10 text-amber-500 mx-auto mb-6" />
          <h2 className="text-4xl font-serif text-gray-800 mb-6">Liste de mariage</h2>
          <p className="text-gray-600 mb-8">
            Votre présence est le plus beau des cadeaux. Si vous souhaitez nous gâter,
            nous avons créé une cagnotte pour notre voyage de noces.
          </p>
          <a
            href="#"
            className="inline-block px-8 py-4 border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-medium rounded-full transition-colors"
          >
            Voir la liste
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Heart className="w-6 h-6 text-rose-400" />
        </div>
        <h3 className="text-2xl font-serif mb-4">Sophie & Thomas</h3>
        <p className="text-gray-400 mb-6">{formatDate(weddingDate)}</p>
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Mail className="w-4 h-4" />
          <a href="mailto:mariage@sophieetthomas.fr" className="hover:text-white">
            mariage@sophieetthomas.fr
          </a>
        </div>
      </footer>
    </div>
  )
}
