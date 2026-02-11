import Link from "next/link"
import { ArrowRight, Check, Zap, Shield, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Ultra Rapide",
    description: "Performance optimisée pour une expérience fluide",
  },
  {
    icon: Shield,
    title: "Sécurisé",
    description: "Vos données sont protégées avec les meilleurs standards",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Suivez vos métriques en temps réel",
  },
]

const plans = [
  {
    name: "Starter",
    price: "9€",
    features: ["5 projets", "1 000 requêtes/mois", "Support email"],
  },
  {
    name: "Pro",
    price: "29€",
    popular: true,
    features: ["Projets illimités", "50 000 requêtes/mois", "Support prioritaire", "API access"],
  },
  {
    name: "Enterprise",
    price: "99€",
    features: ["Tout Pro +", "Requêtes illimitées", "Support dédié", "SLA garanti"],
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="font-bold text-xl">{"{{APP_NAME}}"}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-muted-foreground hover:text-foreground">
              Connexion
            </Link>
            <Link
              href="/sign-up"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm mb-6">
            <span className="text-primary">Nouveau</span>
            <span className="mx-2">•</span>
            <span>{"{{APP_TAGLINE}}"}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {"{{APP_HEADLINE}}"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {"{{APP_DESCRIPTION}}"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90"
            >
              Démarrer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center border px-6 py-3 rounded-lg font-medium hover:bg-accent"
            >
              En savoir plus
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Fonctionnalités</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-background p-6 rounded-xl border">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Tarifs</h2>
          <p className="text-muted-foreground text-center mb-12">
            Choisissez le plan adapté à vos besoins
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-xl border ${
                  plan.popular ? "border-primary ring-2 ring-primary" : ""
                }`}
              >
                {plan.popular && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    Populaire
                  </span>
                )}
                <h3 className="text-xl font-semibold mt-4">{plan.name}</h3>
                <p className="text-3xl font-bold my-4">
                  {plan.price}<span className="text-base font-normal text-muted-foreground">/mois</span>
                </p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`block text-center py-2 rounded-lg font-medium ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border hover:bg-accent"
                  }`}
                >
                  Choisir {plan.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 {"{{APP_NAME}}"}. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
