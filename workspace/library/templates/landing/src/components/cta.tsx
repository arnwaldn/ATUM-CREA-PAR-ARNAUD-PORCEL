import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-2xl bg-primary p-8 text-center md:p-16">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
            Prêt à commencer ?
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/80">
            Rejoignez des milliers d'utilisateurs satisfaits.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center rounded-lg bg-background px-8 py-3 font-medium text-foreground hover:bg-background/90"
          >
            Créer un compte gratuit
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
