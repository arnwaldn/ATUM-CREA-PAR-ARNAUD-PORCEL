import { Zap, Shield, Sparkles, Globe, Clock, Users } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Ultra rapide",
    description: "Performance optimisée pour une expérience fluide.",
  },
  {
    icon: Shield,
    title: "Sécurisé",
    description: "Vos données sont protégées avec les derniers standards.",
  },
  {
    icon: Sparkles,
    title: "IA intégrée",
    description: "Intelligence artificielle pour automatiser vos tâches.",
  },
  {
    icon: Globe,
    title: "Multi-plateforme",
    description: "Accessible depuis n'importe quel appareil.",
  },
  {
    icon: Clock,
    title: "Temps réel",
    description: "Synchronisation instantanée de vos données.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Travaillez en équipe sans friction.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg text-muted-foreground">
            Des fonctionnalités pensées pour votre productivité.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
