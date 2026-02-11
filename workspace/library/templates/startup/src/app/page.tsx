'use client'

import { useState } from 'react'
import { ArrowRight, Menu, X, Sparkles, Check, Zap, Shield, BarChart3, Users, Clock, ChevronDown, Star, Play } from 'lucide-react'
import { cn, type Feature, type PricingTier, type Testimonial, type Stat, type FAQ } from '@/lib/utils'

const features: Feature[] = [
  { id: '1', title: 'Automatisation intelligente', description: 'Automatisez vos tâches répétitives et gagnez des heures chaque semaine.', icon: 'Zap' },
  { id: '2', title: 'Sécurité maximale', description: 'Vos données sont chiffrées et protégées selon les standards les plus stricts.', icon: 'Shield' },
  { id: '3', title: 'Analytics avancés', description: 'Tableaux de bord en temps réel pour prendre les meilleures décisions.', icon: 'BarChart3' },
  { id: '4', title: 'Collaboration d\'équipe', description: 'Travaillez ensemble efficacement, où que vous soyez.', icon: 'Users' },
  { id: '5', title: 'Temps réel', description: 'Synchronisation instantanée sur tous vos appareils.', icon: 'Clock' },
  { id: '6', title: 'IA intégrée', description: 'Suggestions intelligentes pour optimiser votre workflow.', icon: 'Sparkles' },
]

const pricing: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Pour les petites équipes',
    price: 0,
    period: 'mois',
    features: ['Jusqu\'à 5 utilisateurs', '10 projets', '5 Go stockage', 'Support email'],
    cta: 'Commencer gratuitement',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les entreprises en croissance',
    price: 29,
    period: 'mois',
    features: ['Utilisateurs illimités', 'Projets illimités', '100 Go stockage', 'Support prioritaire', 'API access', 'Intégrations avancées'],
    cta: 'Démarrer l\'essai gratuit',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Pour les grandes organisations',
    price: 'custom',
    period: 'sur devis',
    features: ['Tout de Pro', 'SSO / SAML', 'SLA 99.99%', 'Account manager dédié', 'On-premise possible', 'Formation personnalisée'],
    cta: 'Contacter les ventes',
  },
]

const testimonials: Testimonial[] = [
  {
    id: '1',
    content: 'Cette solution a transformé notre façon de travailler. Notre productivité a augmenté de 40% en seulement 3 mois.',
    author: 'Marie Dupont',
    role: 'CEO',
    company: 'TechCorp',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  },
  {
    id: '2',
    content: 'L\'interface est incroyablement intuitive. Notre équipe a été opérationnelle en quelques heures seulement.',
    author: 'Pierre Martin',
    role: 'CTO',
    company: 'InnovateLab',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  },
  {
    id: '3',
    content: 'Le meilleur investissement que nous ayons fait cette année. ROI positif dès le premier mois.',
    author: 'Sophie Bernard',
    role: 'COO',
    company: 'GrowthCo',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
  },
]

const stats: Stat[] = [
  { value: '10K+', label: 'Entreprises' },
  { value: '500K+', label: 'Utilisateurs' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'Note moyenne' },
]

const faqs: FAQ[] = [
  { question: 'Puis-je essayer gratuitement ?', answer: 'Oui, nous offrons un essai gratuit de 14 jours sans carte bancaire requise. Vous avez accès à toutes les fonctionnalités Pro pendant cette période.' },
  { question: 'Comment fonctionne la facturation ?', answer: 'Nous facturons mensuellement ou annuellement (avec 20% de réduction). Vous pouvez annuler à tout moment sans frais.' },
  { question: 'Mes données sont-elles sécurisées ?', answer: 'Absolument. Nous utilisons un chiffrement AES-256 et sommes certifiés SOC 2 Type II. Vos données sont hébergées en Europe.' },
  { question: 'Proposez-vous un support technique ?', answer: 'Oui, tous les plans incluent un support par email. Les plans Pro et Enterprise bénéficient d\'un support prioritaire avec temps de réponse garanti.' },
]

const IconComponent = ({ name }: { name: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Zap: <Zap className="w-6 h-6" />,
    Shield: <Shield className="w-6 h-6" />,
    BarChart3: <BarChart3 className="w-6 h-6" />,
    Users: <Users className="w-6 h-6" />,
    Clock: <Clock className="w-6 h-6" />,
    Sparkles: <Sparkles className="w-6 h-6" />,
  }
  return <>{icons[name]}</>
}

export default function Startup() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 hero-gradient">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold text-blue-600">Startup</span>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Tarifs</a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Témoignages</a>
              <a href="#faq" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">FAQ</a>
              <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Connexion</button>
              <a href="#waitlist" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Essai gratuit
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
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Nouveau: IA intégrée disponible
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 max-w-4xl mx-auto">
            La solution qui
            <span className="text-blue-600"> transforme</span> votre business
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Automatisez, collaborez et développez votre activité avec la plateforme tout-en-un
            utilisée par plus de 10 000 entreprises.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a href="#waitlist" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-medium inline-flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors glow">
              Démarrer gratuitement
              <ArrowRight className="w-5 h-5" />
            </a>
            <button className="px-8 py-4 rounded-xl font-medium border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors inline-flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              Voir la démo
            </button>
          </div>

          <p className="text-sm text-gray-500">
            ✓ Essai gratuit 14 jours · ✓ Sans carte bancaire · ✓ Annulation à tout moment
          </p>

          {/* Product Screenshot */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-b from-blue-100 to-transparent dark:from-blue-900/20 rounded-3xl p-4">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200"
                alt="Product dashboard"
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Logos */}
          <div className="mt-20">
            <p className="text-gray-500 text-sm mb-8">Ils nous font confiance</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
              {['Airbus', 'L\'Oréal', 'Michelin', 'Renault', 'Orange'].map((company) => (
                <span key={company} className="text-2xl font-bold text-gray-400">{company}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Une plateforme complète pour gérer et développer votre activité
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 hover:shadow-lg transition-shadow group"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <IconComponent name={feature.icon} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Tarifs simples et transparents</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Choisissez le plan adapté à vos besoins. Pas de frais cachés.
            </p>

            <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  billingPeriod === 'monthly' ? 'bg-white dark:bg-gray-700 shadow' : ''
                )}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  billingPeriod === 'yearly' ? 'bg-white dark:bg-gray-700 shadow' : ''
                )}
              >
                Annuel (-20%)
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  'rounded-2xl p-8 border-2 transition-all',
                  plan.popular
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 relative scale-105'
                    : 'border-gray-200 dark:border-gray-800'
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                    Le plus populaire
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{plan.description}</p>
                <div className="mb-6">
                  {plan.price === 'custom' ? (
                    <span className="text-3xl font-bold">Sur mesure</span>
                  ) : plan.price === 0 ? (
                    <span className="text-4xl font-bold">Gratuit</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">
                        {billingPeriod === 'yearly' ? Math.round(plan.price * 0.8) : plan.price}€
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-5 h-5 text-blue-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={cn(
                    'w-full py-3 rounded-lg font-medium transition-colors',
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:text-blue-500'
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ce que disent nos clients</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Des milliers d'entreprises nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Questions fréquentes</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Tout ce que vous devez savoir
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border dark:border-gray-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown className={cn(
                    'w-5 h-5 transition-transform',
                    openFaq === index ? 'rotate-180' : ''
                  )} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist / CTA */}
      <section id="waitlist" className="py-20 px-4 bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à transformer votre business ?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez plus de 10 000 entreprises qui nous font confiance.
            Commencez gratuitement, sans carte bancaire.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 focus:ring-2 focus:ring-white focus:border-transparent"
            />
            <button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
              Démarrer
            </button>
          </form>
          <p className="text-sm text-blue-200 mt-4">
            ✓ Essai gratuit 14 jours · ✓ Sans engagement
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xl font-bold text-blue-600">Startup</span>
            <div className="flex gap-8 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white">Confidentialité</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white">CGU</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white">Contact</a>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Startup. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
