import { Check } from "lucide-react"

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    description: "Pour découvrir",
    features: ["3 projets", "100 Mo stockage", "Support communauté"],
  },
  {
    name: "Pro",
    price: "29€",
    period: "/mois",
    description: "Pour les professionnels",
    features: ["Projets illimités", "10 Go stockage", "Support prioritaire", "API access", "Intégrations"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Sur mesure",
    description: "Pour les grandes équipes",
    features: ["Tout de Pro", "Stockage illimité", "SSO", "SLA garanti", "Account manager", "Formation"],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="bg-secondary/30 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Tarifs simples et transparents
          </h2>
          <p className="text-lg text-muted-foreground">
            Choisissez le plan adapté à vos besoins.
          </p>
        </div>
        
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border bg-background p-8 ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                  Populaire
                </div>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="mt-1 text-muted-foreground">{plan.description}</p>
              <div className="my-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
              <ul className="mb-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full rounded-lg py-3 font-medium ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border hover:bg-accent"
                }`}
              >
                {plan.price === "Sur mesure" ? "Nous contacter" : "Commencer"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
