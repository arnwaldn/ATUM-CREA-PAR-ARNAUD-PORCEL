import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
            <span className="text-primary">Nouveau</span>
            <span className="mx-2">•</span>
            <span>{{APP_TAGLINE}}</span>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            {{APP_HEADLINE}}
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            {{APP_DESCRIPTION}}
          </p>
          
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-lg border px-6 py-3 font-medium hover:bg-accent"
            >
              En savoir plus
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.1),transparent)]" />
    </section>
  )
}
