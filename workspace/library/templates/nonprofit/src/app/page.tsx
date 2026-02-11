'use client'

import { useState } from 'react'
import { Heart, Menu, X, Users, Calendar, Target, ArrowRight, Mail, MapPin, Phone, HandHeart, Globe, Award, ChevronRight, Play } from 'lucide-react'
import { cn, formatCurrency, formatDate, calculateProgress, type Campaign, type Event, type ImpactStat, type DonationTier } from '@/lib/utils'

const impactStats: ImpactStat[] = [
  { value: 50000, label: 'Personnes aidées', suffix: '+' },
  { value: 150, label: 'Projets réalisés' },
  { value: 25, label: 'Pays couverts' },
  { value: 98, label: 'Taux de réussite', suffix: '%' },
]

const campaigns: Campaign[] = [
  {
    id: '1',
    title: 'Éducation pour tous',
    description: 'Offrons l\'accès à l\'éducation aux enfants défavorisés dans les zones rurales.',
    image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800',
    goal: 50000,
    raised: 32500,
    donors: 245,
    daysLeft: 15,
    category: 'Éducation',
  },
  {
    id: '2',
    title: 'Eau potable au Sahel',
    description: 'Construction de puits pour fournir de l\'eau potable aux communautés isolées.',
    image: 'https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=800',
    goal: 75000,
    raised: 68000,
    donors: 412,
    daysLeft: 8,
    category: 'Eau',
  },
  {
    id: '3',
    title: 'Urgence alimentaire',
    description: 'Distribution de repas aux familles touchées par la crise économique.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    goal: 25000,
    raised: 18750,
    donors: 189,
    daysLeft: 22,
    category: 'Alimentation',
  },
]

const events: Event[] = [
  {
    id: '1',
    title: 'Gala de charité annuel',
    description: 'Une soirée exceptionnelle pour soutenir nos projets éducatifs.',
    date: new Date('2025-03-15'),
    location: 'Paris, Hôtel de Ville',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    type: 'fundraiser',
  },
  {
    id: '2',
    title: 'Marathon solidaire',
    description: 'Courez pour une bonne cause lors de notre marathon annuel.',
    date: new Date('2025-04-20'),
    location: 'Lyon, Parc de la Tête d\'Or',
    image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800',
    type: 'fundraiser',
  },
  {
    id: '3',
    title: 'Journée des bénévoles',
    description: 'Rejoignez notre équipe pour une journée d\'action terrain.',
    date: new Date('2025-02-28'),
    location: 'Marseille',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
    type: 'volunteer',
  },
]

const donationTiers: DonationTier[] = [
  { amount: 20, label: 'Soutien', impact: 'Fournit des fournitures scolaires à un enfant' },
  { amount: 50, label: 'Généreux', impact: 'Finance un mois d\'eau potable pour une famille' },
  { amount: 100, label: 'Champion', impact: 'Offre 50 repas à des personnes dans le besoin' },
  { amount: 250, label: 'Héros', impact: 'Parraine la scolarité d\'un enfant pendant 6 mois' },
]

export default function Nonprofit() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number>(50)
  const [customAmount, setCustomAmount] = useState('')
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-emerald-600 fill-emerald-600" />
              <span className="text-xl font-bold">Espoir</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#mission" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">Notre mission</a>
              <a href="#campaigns" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">Campagnes</a>
              <a href="#events" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">Événements</a>
              <a href="#volunteer" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">Bénévolat</a>
              <a href="#donate" className="impact-gradient text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity">
                Faire un don
              </a>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 sm:py-40">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Ensemble, construisons un avenir meilleur
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Depuis 15 ans, nous œuvrons pour un monde plus juste. Chaque don compte,
              chaque action fait la différence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#donate" className="impact-gradient text-white px-8 py-4 rounded-full font-medium inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <Heart className="w-5 h-5" />
                Faire un don
              </a>
              <a href="#mission" className="px-8 py-4 rounded-full font-medium border-2 border-white/30 hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Notre histoire
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 px-4 bg-emerald-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {impactStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-5xl font-bold">
                  {stat.value.toLocaleString()}{stat.suffix}
                </p>
                <p className="text-emerald-100 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-emerald-600 font-medium text-sm uppercase tracking-wider">Notre mission</span>
              <h2 className="text-4xl font-bold mt-4 mb-6">Agir pour ceux qui en ont le plus besoin</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                Notre association se consacre à améliorer les conditions de vie des communautés
                vulnérables à travers le monde. Nous intervenons dans trois domaines prioritaires :
              </p>
              <div className="space-y-4">
                {[
                  { icon: Award, title: 'Éducation', desc: 'Accès à l\'école pour tous les enfants' },
                  { icon: Globe, title: 'Eau & Santé', desc: 'Eau potable et soins médicaux' },
                  { icon: HandHeart, title: 'Alimentation', desc: 'Sécurité alimentaire durable' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800"
                alt="Our mission"
                className="rounded-2xl"
              />
              <div className="absolute -bottom-8 -left-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
                <p className="text-3xl font-bold text-emerald-600">15 ans</p>
                <p className="text-gray-600 dark:text-gray-400">d'engagement solidaire</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns */}
      <section id="campaigns" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Campagnes en cours</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choisissez la cause qui vous tient à cœur et contribuez à changer des vies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {campaigns.map((campaign) => (
              <article key={campaign.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="relative">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full aspect-[16/10] object-cover"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-gray-900/90 text-sm font-medium rounded-full">
                    {campaign.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{campaign.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{campaign.description}</p>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{formatCurrency(campaign.raised)}</span>
                      <span className="text-gray-500">sur {formatCurrency(campaign.goal)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full impact-gradient rounded-full transition-all duration-500"
                        style={{ width: `${calculateProgress(campaign.raised, campaign.goal)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {campaign.donors} donateurs
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {campaign.daysLeft} jours restants
                    </span>
                  </div>

                  <button className="w-full py-3 impact-gradient text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                    Contribuer
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Événements à venir</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Rejoignez-nous lors de nos événements et agissez concrètement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {events.map((event) => (
              <article key={event.id} className="group">
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={cn(
                    'absolute top-4 right-4 px-3 py-1 text-white text-sm font-medium rounded-full',
                    event.type === 'fundraiser' ? 'bg-amber-500' : 'bg-emerald-500'
                  )}>
                    {event.type === 'fundraiser' ? 'Collecte' : 'Bénévolat'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(event.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-600 transition-colors">
                  {event.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{event.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer CTA */}
      <section id="volunteer" className="py-20 px-4 bg-emerald-50 dark:bg-emerald-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Devenez bénévole</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                Rejoignez notre communauté de plus de 500 bénévoles actifs.
                Que vous ayez 2 heures ou 2 jours par mois, votre engagement compte.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  'Actions terrain et logistique',
                  'Communication et événementiel',
                  'Compétences spécialisées (médical, juridique, etc.)',
                  'Parrainage et mentorat',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <ChevronRight className="w-5 h-5 text-emerald-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <a href="#" className="impact-gradient text-white px-8 py-4 rounded-full font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
                Rejoindre l'équipe
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400"
                alt="Volunteers"
                className="rounded-2xl"
              />
              <img
                src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400"
                alt="Volunteers"
                className="rounded-2xl mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section id="donate" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Faites un don</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Chaque euro compte. 100% de votre don est utilisé pour nos programmes.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {donationTiers.map((tier) => (
                <button
                  key={tier.amount}
                  onClick={() => {
                    setSelectedAmount(tier.amount)
                    setCustomAmount('')
                  }}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-center',
                    selectedAmount === tier.amount && !customAmount
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                  )}
                >
                  <p className="text-2xl font-bold">{tier.amount}€</p>
                  <p className="text-sm text-gray-500">{tier.label}</p>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Montant personnalisé</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Autre montant"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setSelectedAmount(0)
                  }}
                  className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              </div>
            </div>

            {(selectedAmount > 0 || customAmount) && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg mb-6">
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  <Target className="w-4 h-4 inline mr-2" />
                  Impact : {donationTiers.find(t => t.amount === selectedAmount)?.impact || 'Votre générosité contribue directement à nos missions'}
                </p>
              </div>
            )}

            <button className="w-full py-4 impact-gradient text-white rounded-lg font-medium text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <Heart className="w-5 h-5" />
              Faire un don de {customAmount || selectedAmount}€
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Don sécurisé • Reçu fiscal • Déductible à 66%
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="w-12 h-12 mx-auto mb-6 text-emerald-400" />
          <h2 className="text-3xl font-bold mb-4">Restez informé</h2>
          <p className="text-gray-400 mb-8">
            Recevez nos actualités et l'impact de vos dons directement dans votre boîte mail.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <button className="px-6 py-3 impact-gradient font-medium rounded-lg hover:opacity-90 transition-opacity">
              S'inscrire
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-emerald-600 fill-emerald-600" />
                <span className="text-xl font-bold">Espoir</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Association reconnue d'utilité publique depuis 2010.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> contact@espoir.org</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +33 1 23 45 67 89</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Paris, France</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Liens utiles</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-emerald-600">Notre équipe</a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-emerald-600">Rapports annuels</a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-emerald-600">Partenaires</a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-emerald-600">Presse</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-emerald-600">Mentions légales</a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-emerald-600">Confidentialité</a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-emerald-600">CGU</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t dark:border-gray-800 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Espoir. Tous droits réservés. Association loi 1901.
          </div>
        </div>
      </footer>
    </div>
  )
}
