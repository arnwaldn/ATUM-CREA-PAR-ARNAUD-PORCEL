'use client'

import { useState } from 'react'
import { ArrowRight, Menu, X, Sparkles, Code2, Palette, TrendingUp, Users, Award, ChevronRight, Mail, Phone, MapPin, Linkedin, Twitter, Instagram } from 'lucide-react'
import { cn, type Service, type CaseStudy, type TeamMember, type PricingPlan } from '@/lib/utils'

const services: Service[] = [
  {
    id: 'design',
    title: 'Design UI/UX',
    description: 'Créez des expériences utilisateur mémorables avec un design moderne et intuitif.',
    icon: 'Palette',
    features: ['Design System', 'Prototypage', 'User Research', 'Tests utilisateurs'],
  },
  {
    id: 'dev',
    title: 'Développement Web',
    description: 'Applications web performantes avec les dernières technologies.',
    icon: 'Code2',
    features: ['React / Next.js', 'Applications SaaS', 'E-commerce', 'API & Backend'],
  },
  {
    id: 'strategy',
    title: 'Stratégie Digitale',
    description: 'Accompagnement stratégique pour votre transformation digitale.',
    icon: 'TrendingUp',
    features: ['Audit digital', 'Roadmap produit', 'Growth marketing', 'Analytics'],
  },
  {
    id: 'branding',
    title: 'Branding',
    description: 'Construisez une identité de marque forte et cohérente.',
    icon: 'Sparkles',
    features: ['Logo & Identité', 'Charte graphique', 'Direction artistique', 'Brand guidelines'],
  },
]

const caseStudies: CaseStudy[] = [
  {
    id: '1',
    title: 'Refonte e-commerce Luxe',
    client: 'Maison Éléonore',
    category: 'E-commerce',
    description: 'Refonte complète de la plateforme e-commerce avec une expérience d\'achat premium.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    results: [
      { label: 'Conversion', value: '+180%' },
      { label: 'Panier moyen', value: '+45%' },
      { label: 'Temps sur site', value: '+120%' },
    ],
    tags: ['E-commerce', 'UX Design', 'Next.js'],
  },
  {
    id: '2',
    title: 'Application SaaS B2B',
    client: 'DataFlow',
    category: 'SaaS',
    description: 'Conception et développement d\'une plateforme d\'analyse de données.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    results: [
      { label: 'Utilisateurs', value: '10K+' },
      { label: 'NPS Score', value: '72' },
      { label: 'Rétention', value: '94%' },
    ],
    tags: ['SaaS', 'Dashboard', 'React'],
  },
  {
    id: '3',
    title: 'Identité & Site Vitrine',
    client: 'Atelier Verde',
    category: 'Branding',
    description: 'Création de l\'identité visuelle et du site web pour un studio d\'architecture.',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
    results: [
      { label: 'Leads', value: '+300%' },
      { label: 'Brand recall', value: '85%' },
      { label: 'Engagement', value: '+200%' },
    ],
    tags: ['Branding', 'Web Design', 'Motion'],
  },
]

const team: TeamMember[] = [
  {
    id: '1',
    name: 'Sophie Laurent',
    role: 'CEO & Creative Director',
    bio: '15 ans d\'expérience en design digital.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    social: { linkedin: '#', twitter: '#' },
  },
  {
    id: '2',
    name: 'Marc Dubois',
    role: 'Lead Developer',
    bio: 'Expert React & architecture cloud.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    social: { linkedin: '#', twitter: '#' },
  },
  {
    id: '3',
    name: 'Julie Chen',
    role: 'UX Designer',
    bio: 'Spécialiste recherche utilisateur.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    social: { linkedin: '#', twitter: '#' },
  },
  {
    id: '4',
    name: 'Thomas Martin',
    role: 'Strategy Director',
    bio: 'Growth et transformation digitale.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    social: { linkedin: '#', twitter: '#' },
  },
]

const pricing: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Pour les projets ponctuels',
    price: 2500,
    period: 'projet',
    features: ['Landing page', '1 révision', 'Livraison 2 semaines', 'Support email'],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Pour les entreprises en croissance',
    price: 5000,
    period: 'mois',
    features: ['Site complet', 'Design system', '3 révisions', 'Support prioritaire', 'Maintenance incluse'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Solution sur mesure',
    price: 0,
    period: 'sur devis',
    features: ['Équipe dédiée', 'Architecture complexe', 'SLA garanti', 'Consulting inclus', 'Formation équipes'],
  },
]

const IconComponent = ({ name }: { name: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Palette: <Palette className="w-6 h-6" />,
    Code2: <Code2 className="w-6 h-6" />,
    TrendingUp: <TrendingUp className="w-6 h-6" />,
    Sparkles: <Sparkles className="w-6 h-6" />,
  }
  return <>{icons[name]}</>
}

export default function Agency() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeCase, setActiveCase] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <span className="text-2xl font-bold gradient-text">Studio</span>

            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Services</a>
              <a href="#work" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Réalisations</a>
              <a href="#team" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Équipe</a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Tarifs</a>
              <a href="#contact" className="gradient-bg text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity">
                Contact
              </a>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Agence digitale créative
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
              Nous créons des
              <span className="gradient-text"> expériences digitales</span> mémorables
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl">
              Design, développement et stratégie pour des marques qui veulent se démarquer.
              Transformons ensemble vos idées en réalité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contact" className="gradient-bg text-white px-8 py-4 rounded-full font-medium inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                Démarrer un projet
                <ArrowRight className="w-5 h-5" />
              </a>
              <a href="#work" className="px-8 py-4 rounded-full font-medium border-2 border-gray-200 dark:border-gray-800 hover:border-purple-500 transition-colors inline-flex items-center justify-center gap-2">
                Voir nos réalisations
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-10 border-t dark:border-gray-800">
            {[
              { value: '150+', label: 'Projets livrés' },
              { value: '50+', label: 'Clients satisfaits' },
              { value: '12', label: 'Experts créatifs' },
              { value: '8 ans', label: 'D\'expérience' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nos services</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Une approche complète pour répondre à tous vos besoins digitaux
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 hover:shadow-xl transition-shadow group"
              >
                <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center text-white mb-6">
                  <IconComponent name={service.icon} />
                </div>
                <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <ChevronRight className="w-4 h-4 text-purple-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="work" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nos réalisations</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Découvrez comment nous avons aidé nos clients à atteindre leurs objectifs
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {caseStudies.map((study) => (
              <article
                key={study.id}
                className="group cursor-pointer"
                onMouseEnter={() => setActiveCase(study.id)}
                onMouseLeave={() => setActiveCase(null)}
              >
                <div className="relative overflow-hidden rounded-2xl mb-6">
                  <img
                    src={study.image}
                    alt={study.title}
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={cn(
                    'absolute inset-0 gradient-bg opacity-0 group-hover:opacity-90 transition-opacity duration-300 p-6 flex flex-col justify-end',
                  )}>
                    <div className="text-white">
                      <div className="flex gap-4 mb-4">
                        {study.results.map((result) => (
                          <div key={result.label}>
                            <p className="text-2xl font-bold">{result.value}</p>
                            <p className="text-sm opacity-80">{result.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-purple-500 font-medium">{study.category}</span>
                <h3 className="text-xl font-bold mt-2 mb-1">{study.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{study.client}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Notre équipe</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Des experts passionnés au service de votre réussite
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.id} className="text-center group">
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-4">
                    <a href={member.social.linkedin} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-purple-100 transition-colors">
                      <Linkedin className="w-5 h-5 text-gray-900" />
                    </a>
                    <a href={member.social.twitter} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-purple-100 transition-colors">
                      <Twitter className="w-5 h-5 text-gray-900" />
                    </a>
                  </div>
                </div>
                <h3 className="text-lg font-bold">{member.name}</h3>
                <p className="text-purple-500 text-sm font-medium">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nos formules</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Des solutions adaptées à vos besoins et votre budget
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  'rounded-2xl p-8 border-2 transition-all',
                  plan.popular
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 relative'
                    : 'border-gray-200 dark:border-gray-800 hover:border-purple-300'
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 gradient-bg text-white text-sm font-medium rounded-full">
                    Populaire
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{plan.description}</p>
                <div className="mb-6">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold">Sur mesure</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">{plan.price}€</span>
                      <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <ChevronRight className="w-4 h-4 text-purple-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={cn(
                    'w-full py-3 rounded-full font-medium transition-colors',
                    plan.popular
                      ? 'gradient-bg text-white hover:opacity-90'
                      : 'border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500'
                  )}
                >
                  {plan.price === 0 ? 'Nous contacter' : 'Démarrer'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Parlons de votre <span className="gradient-text">projet</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Nous sommes impatients de découvrir votre vision et de vous aider à la concrétiser.
              </p>
              <div className="space-y-4">
                <a href="mailto:hello@studio.com" className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                  hello@studio.com
                </a>
                <a href="tel:+33123456789" className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                  +33 1 23 45 67 89
                </a>
                <p className="flex items-center gap-4 text-gray-300">
                  <MapPin className="w-5 h-5" />
                  123 Avenue des Champs-Élysées, Paris
                </p>
              </div>
              <div className="flex gap-4 mt-8">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Nom"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <input
                type="text"
                placeholder="Sujet"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <textarea
                placeholder="Votre message"
                rows={5}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <button className="w-full gradient-bg py-4 rounded-lg font-medium hover:opacity-90 transition-opacity">
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xl font-bold gradient-text">Studio</span>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Studio. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
