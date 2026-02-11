'use client'

import { useState } from 'react'
import { Camera, Instagram, Mail, ChevronLeft, ChevronRight, X, Menu } from 'lucide-react'
import { cn, type Photo, type Category, categories } from '@/lib/utils'

const photos: Photo[] = [
  { id: '1', src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', alt: 'Wedding', width: 4, height: 3, category: 'wedding' },
  { id: '2', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', alt: 'Portrait', width: 3, height: 4, category: 'portrait' },
  { id: '3', src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', alt: 'Landscape', width: 16, height: 9, category: 'landscape' },
  { id: '4', src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800', alt: 'Fashion', width: 3, height: 4, category: 'fashion' },
  { id: '5', src: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800', alt: 'Product', width: 1, height: 1, category: 'product' },
  { id: '6', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', alt: 'Event', width: 16, height: 9, category: 'event' },
  { id: '7', src: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800', alt: 'Wedding 2', width: 4, height: 3, category: 'wedding' },
  { id: '8', src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800', alt: 'Portrait 2', width: 3, height: 4, category: 'portrait' },
  { id: '9', src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800', alt: 'Landscape 2', width: 16, height: 9, category: 'landscape' },
  { id: '10', src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', alt: 'Fashion 2', width: 3, height: 4, category: 'fashion' },
  { id: '11', src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', alt: 'Product 2', width: 1, height: 1, category: 'product' },
  { id: '12', src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800', alt: 'Event 2', width: 16, height: 9, category: 'event' },
]

export default function Photography() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filteredPhotos = selectedCategory === 'all'
    ? photos
    : photos.filter(p => p.category === selectedCategory)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const nextPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)
    }
  }
  const prevPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Camera className="w-6 h-6" />
              <span className="text-lg font-medium tracking-tight">STUDIO NOIR</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#portfolio" className="text-sm hover:text-gray-500 transition-colors">Portfolio</a>
              <a href="#about" className="text-sm hover:text-gray-500 transition-colors">À propos</a>
              <a href="#services" className="text-sm hover:text-gray-500 transition-colors">Services</a>
              <a href="#contact" className="text-sm hover:text-gray-500 transition-colors">Contact</a>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="h-screen flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl md:text-8xl font-light tracking-tight mb-6">
            STUDIO NOIR
          </h1>
          <p className="text-lg md:text-xl text-white/70 tracking-widest uppercase">
            Photographie d'art & Lifestyle
          </p>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-light text-center mb-12 tracking-tight">Portfolio</h2>

          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-4 py-2 text-sm uppercase tracking-wider transition-colors',
                selectedCategory === 'all'
                  ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              Tout
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-4 py-2 text-sm uppercase tracking-wider transition-colors',
                  selectedCategory === cat
                    ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="mb-4 break-inside-avoid cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest text-sm">
                      Voir
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={prevPhoto}
            className="absolute left-6 text-white/70 hover:text-white"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>
          <img
            src={filteredPhotos[lightboxIndex].src}
            alt={filteredPhotos[lightboxIndex].alt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          <button
            onClick={nextPhoto}
            className="absolute right-6 text-white/70 hover:text-white"
          >
            <ChevronRight className="w-12 h-12" />
          </button>
          <div className="absolute bottom-6 text-white/50 text-sm">
            {lightboxIndex + 1} / {filteredPhotos.length}
          </div>
        </div>
      )}

      {/* About */}
      <section id="about" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600"
              alt="Photographer"
              className="w-full aspect-[3/4] object-cover"
            />
          </div>
          <div>
            <h2 className="text-4xl font-light mb-6 tracking-tight">À propos</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Photographe professionnel depuis 10 ans, je capture les moments qui comptent
              avec une approche artistique et authentique. Spécialisé dans le portrait,
              le mariage et la mode.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Mon travail a été publié dans Vogue, Elle, et de nombreuses galeries
              internationales. Chaque projet est une nouvelle histoire à raconter.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-light text-center mb-12 tracking-tight">Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Portrait', desc: 'Séances individuelles ou en famille, studio ou extérieur' },
              { title: 'Mariage', desc: 'Couverture complète de votre jour J' },
              { title: 'Mode & Editorial', desc: 'Shooting pour marques et publications' },
            ].map((service) => (
              <div key={service.title} className="text-center p-8 border dark:border-gray-800">
                <h3 className="text-xl font-light mb-4 tracking-tight">{service.title}</h3>
                <p className="text-gray-500 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4 bg-black text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-light mb-6 tracking-tight">Contact</h2>
          <p className="text-gray-400 mb-8">
            Discutons de votre prochain projet
          </p>
          <a
            href="mailto:hello@studionoir.fr"
            className="inline-flex items-center gap-2 text-lg hover:text-gray-300 transition-colors"
          >
            <Mail className="w-5 h-5" />
            hello@studionoir.fr
          </a>
          <div className="mt-8">
            <a href="#" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
              @studionoir
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t dark:border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Camera className="w-5 h-5" />
            <span className="text-sm tracking-wider">STUDIO NOIR</span>
          </div>
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} Studio Noir. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
