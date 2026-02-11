import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, CreditCard, TrendingUp } from "lucide-react"

const stats = [
  { title: "Revenu Total", value: "€12,450", change: "+12%", icon: CreditCard },
  { title: "Utilisateurs", value: "1,234", change: "+8%", icon: Users },
  { title: "Projets Actifs", value: "23", change: "+3", icon: BarChart3 },
  { title: "Taux de Conversion", value: "3.2%", change: "+0.4%", icon: TrendingUp },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenue sur votre tableau de bord</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{stat.change}</span> vs mois dernier
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>Vos dernières actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nouveau projet créé</p>
                    <p className="text-xs text-muted-foreground">Il y a {i} heure{i > 1 ? "s" : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prochaines Étapes</CardTitle>
            <CardDescription>Actions recommandées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input type="checkbox" className="h-4 w-4 rounded border" />
                <span className="text-sm">Compléter votre profil</span>
              </div>
              <div className="flex items-center gap-4">
                <input type="checkbox" className="h-4 w-4 rounded border" />
                <span className="text-sm">Créer votre premier projet</span>
              </div>
              <div className="flex items-center gap-4">
                <input type="checkbox" className="h-4 w-4 rounded border" />
                <span className="text-sm">Inviter des membres</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
