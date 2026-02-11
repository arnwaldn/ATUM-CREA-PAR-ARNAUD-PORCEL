import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, CreditCard } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "9€",
    current: false,
    features: ["5 projets", "1 000 requêtes/mois", "Support email"],
  },
  {
    name: "Pro",
    price: "29€",
    current: true,
    features: ["Projets illimités", "50 000 requêtes/mois", "Support prioritaire", "API access"],
  },
  {
    name: "Enterprise",
    price: "99€",
    current: false,
    features: ["Tout Pro +", "Requêtes illimitées", "Support dédié", "SLA garanti"],
  },
]

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Facturation</h1>
        <p className="text-muted-foreground">Gérez votre abonnement et vos paiements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plan Actuel
          </CardTitle>
          <CardDescription>Vous êtes actuellement sur le plan Pro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">29€<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
              <p className="text-sm text-muted-foreground">Prochain paiement le 1er janvier 2025</p>
            </div>
            <button className="border px-4 py-2 rounded-lg hover:bg-accent">
              Gérer l&apos;abonnement
            </button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Changer de plan</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.current ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {plan.current && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Actuel
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>/mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2 rounded-lg font-medium ${
                    plan.current
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? "Plan actuel" : "Passer à ce plan"}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "1 déc 2024", amount: "29€", status: "Payé" },
              { date: "1 nov 2024", amount: "29€", status: "Payé" },
              { date: "1 oct 2024", amount: "29€", status: "Payé" },
            ].map((payment, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{payment.date}</p>
                  <p className="text-sm text-muted-foreground">Abonnement Pro</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{payment.amount}</p>
                  <p className="text-sm text-green-500">{payment.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
