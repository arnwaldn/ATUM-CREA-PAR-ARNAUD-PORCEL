'use client'

import { useState } from 'react'
import { ArrowRight, Phone, Mail, MapPin, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import { cn, type Project } from '@/lib/utils'

const projects: Project[] = [
  {
    id: '1',
    title: 'Appartement Haussmannien',
    category: 'Résidentiel',
    location: 'Paris 16ème',
    year: 2024,
    description: 'Rénovation complète d\'un appartement de 180m² avec préservation des moulures d\'origine',
    images: [
      { before: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', after: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800' }
    ],
    featured: true,
  },
  {
    id: '2',
    title: 'Loft Industriel',
    category: 'Résidentiel',
    location: 'Lyon',
    year: 2024,
    description: 'Transformation d\'un ancien atelier en loft contemporain de 250m²',
    images: [
      { before: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', after: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800' }
    ],
    featured: true,
  },
  {
    id: '3',
    title: 'Boutique Hotel',
    category: 'Hôtellerie',
    location: 'Bordeaux',
    year: 2023,
    description: 'Aménagement de 25 chambres et espaces communs d\'un hôtel 4 étoiles',
    images: [
      { before: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', after: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800' }
    ],
    featured: true,
  },
  {
    id: '4',
    title: 'Bureaux Créatifs',
    category: 'Commercial',
    location: 'Paris 11ème',
    year: 2023,
    description: 'Design d\'un espace de coworking de 500m² pour une agence créative',
    images: [
      { before: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', after: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800' }
    ],
    featured: false,
  },
]

const services = [
  { title: 'Conception', desc: 'Plans 3D et moodboards sur mesure' },
  { title: 'Direction', desc: 'Suivi complet des travaux' },
  { title: 'Décoration', desc: 'Sélection mobilier et accessoires' },
  { title: 'Conseil', desc: 'Accompagnement personnalisé' },
]

export default function InteriorDesign() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeProject, setActiveProject] = useState(0)
  const [showAfter, setShowAfter] = useState(false)

  const featuredProjects = projects.filter(p => p.featured)

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#f8f6f3]/90 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <span className="text-2xl font-serif tracking-tight text-stone-800">ATELIER D.</span>

            <div className="hidden md:flex items-center gap-10">
              <a href="#projets" className="text-sm uppercase tracking-widest text-stone-600 hover:text-stone-900">Projets</a>
              <a href="#services" className="text-sm uppercase tracking-widest text-stone-600 hover:text-stone-900">Services</a>
              <a href="#about" className="text-sm uppercase tracking-widest text-stone-600 hover:text-stone-900">À propos</a>
              <a href="#contact" className="text-sm uppercase tracking-widest text-stone-600 hover:text-stone-900">Contact</a>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="h-screen flex items-center justify-center relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <p className="text-sm uppercase tracking-[0.3em] mb-6 text-white/70">Architecture d'intérieur</p>
          <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">
            Créer des espaces qui vous ressemblent
          </h1>
          <a
            href="#projets"
            className="inline-flex items-center gap-3 text-sm uppercase tracking-widest border-b border-white/50 pb-2 hover:border-white transition-colors"
          >
            Découvrir nos projets
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projets" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-stone-500 mb-4">Portfolio</p>
            <h2 className="text-4xl font-serif text-stone-800">Projets récents</h2>
          </div>

          {/* Before/After Slider */}
          <div className="relative mb-12">
            <div className="aspect-[16/9] overflow-hidden bg-stone-200">
              <img
                src={showAfter ? featuredProjects[activeProject].images[0].after : featuredProjects[activeProject].images[0].before}
                alt={featuredProjects[activeProject].title}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
            </div>

            {/* Before/After toggle */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex bg-white/90 backdrop-blur-sm rounded-full overflow-hidden">
              <button
                onClick={() => setShowAfter(false)}
                className={cn(
                  'px-6 py-2 text-sm uppercase tracking-wider transition-colors',
                  !showAfter ? 'bg-stone-800 text-white' : 'text-stone-600'
                )}
              >
                Avant
              </button>
              <button
                onClick={() => setShowAfter(true)}
                className={cn(
                  'px-6 py-2 text-sm uppercase tracking-wider transition-colors',
                  showAfter ? 'bg-stone-800 text-white' : 'text-stone-600'
                )}
              >
                Après
              </button>
            </div>

            {/* Navigation */}
            <button
              onClick={() => setActiveProject(p => (p - 1 + featuredProjects.length) % featuredProjects.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveProject(p => (p + 1) % featuredProjects.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Project info */}
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm uppercase tracking-widest text-stone-500 mb-2">
              {featuredProjects[activeProject].category} — {featuredProjects[activeProject].location}
            </p>
            <h3 className="text-3xl font-serif text-stone-800 mb-4">
              {featuredProjects[activeProject].title}
            </h3>
            <p className="text-stone-600 mb-6">
              {featuredProjects[activeProject].description}
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-stone-800 border-b border-stone-300 pb-1 hover:border-stone-800 transition-colors"
            >
              Voir le projet
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Thumbnails */}
          <div className="flex justify-center gap-4 mt-12">
            {featuredProjects.map((project, i) => (
              <button
                key={project.id}
                onClick={() => { setActiveProject(i); setShowAfter(false); }}
                className={cn(
                  'w-20 h-20 overflow-hidden transition-opacity',
                  activeProject === i ? 'opacity-100 ring-2 ring-stone-800' : 'opacity-50 hover:opacity-75'
                )}
              >
                <img
                  src={project.images[0].after}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-4 bg-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-stone-500 mb-4">Expertise</p>
            <h2 className="text-4xl font-serif text-stone-800">Nos services</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {services.map((service, i) => (
              <div key={service.title} className="text-center p-8 bg-white">
                <div className="text-4xl font-serif text-stone-300 mb-6">0{i + 1}</div>
                <h3 className="text-xl font-serif text-stone-800 mb-4">{service.title}</h3>
                <p className="text-stone-600 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-stone-800 mb-8">Demander un devis</h2>
          <p className="text-stone-600 mb-10">
            Partagez-nous votre projet et recevez une estimation personnalisée sous 48h.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-3 px-8 py-4 bg-stone-800 text-white text-sm uppercase tracking-widest hover:bg-stone-700 transition-colors"
          >
            Nous contacter
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-4 bg-stone-800 text-white">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div>
            <Phone className="w-6 h-6 mx-auto mb-4 text-stone-400" />
            <p className="text-sm uppercase tracking-widest text-stone-400 mb-2">Téléphone</p>
            <p>+33 1 23 45 67 89</p>
          </div>
          <div>
            <Mail className="w-6 h-6 mx-auto mb-4 text-stone-400" />
            <p className="text-sm uppercase tracking-widest text-stone-400 mb-2">Email</p>
            <p>contact@atelierd.fr</p>
          </div>
          <div>
            <MapPin className="w-6 h-6 mx-auto mb-4 text-stone-400" />
            <p className="text-sm uppercase tracking-widest text-stone-400 mb-2">Adresse</p>
            <p>12 Rue du Design<br />75003 Paris</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-stone-200 text-center">
        <span className="text-xl font-serif text-stone-800">ATELIER D.</span>
        <p className="text-stone-400 text-sm mt-4">
          © {new Date().getFullYear()} Atelier D. Tous droits réservés.
        </p>
      </footer>
    </div>
  )
}
