# Template: Landing Page Complète

## Structure
```
landing/
├── components/
│   ├── hero.tsx
│   ├── features.tsx
│   ├── pricing.tsx
│   ├── testimonials.tsx
│   ├── faq.tsx
│   ├── cta.tsx
│   └── footer.tsx
└── page.tsx
```

## Hero Section
```tsx
// components/landing/hero.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(99,102,241,0.1),transparent)]" />

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-4">
            Nouveau: Version 2.0 disponible
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Créez des applications{" "}
            <span className="text-primary">incroyables</span>{" "}
            en un temps record
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            La plateforme tout-en-un pour développer, déployer et scaler vos
            projets. Rejoignez plus de 10,000 développeurs satisfaits.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto">
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Play className="mr-2 h-4 w-4" />
              Voir la démo
            </Button>
          </div>

          {/* Social proof */}
          <p className="mt-6 text-sm text-muted-foreground">
            Pas de carte de crédit requise. 14 jours d'essai gratuit.
          </p>
        </div>

        {/* Hero image */}
        <div className="mt-16 sm:mt-24">
          <div className="relative rounded-xl border bg-background p-2 shadow-2xl">
            <img
              src="/dashboard-preview.png"
              alt="Dashboard Preview"
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

## Features Section
```tsx
// components/landing/features.tsx
import {
  Zap, Shield, BarChart3, Users,
  Globe, Smartphone
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Ultra rapide",
    description: "Performances optimisées avec mise en cache intelligente et CDN global."
  },
  {
    icon: Shield,
    title: "Sécurisé",
    description: "Chiffrement end-to-end, 2FA, et conformité RGPD inclus."
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Tableaux de bord en temps réel pour suivre vos métriques clés."
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Travaillez en équipe avec des rôles et permissions granulaires."
  },
  {
    icon: Globe,
    title: "Multi-langue",
    description: "Support de 50+ langues avec détection automatique."
  },
  {
    icon: Smartphone,
    title: "Mobile first",
    description: "Applications responsives optimisées pour tous les appareils."
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Des fonctionnalités puissantes pour booster votre productivité
          </p>
        </div>

        {/* Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative rounded-2xl border p-8 hover:border-primary/50 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

## Pricing Section
```tsx
// components/landing/pricing.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    description: "Pour les projets personnels",
    price: { monthly: 0, yearly: 0 },
    features: [
      "3 projets",
      "1 000 requêtes/mois",
      "Support communauté",
      "Analytics basiques"
    ],
    cta: "Commencer gratuitement",
    popular: false
  },
  {
    name: "Pro",
    description: "Pour les équipes en croissance",
    price: { monthly: 29, yearly: 290 },
    features: [
      "Projets illimités",
      "100 000 requêtes/mois",
      "Support prioritaire",
      "Analytics avancés",
      "API access",
      "Intégrations"
    ],
    cta: "Essai gratuit 14 jours",
    popular: true
  },
  {
    name: "Enterprise",
    description: "Pour les grandes organisations",
    price: { monthly: 99, yearly: 990 },
    features: [
      "Tout dans Pro",
      "Requêtes illimitées",
      "Support dédié 24/7",
      "SLA garanti",
      "SSO / SAML",
      "Audit logs",
      "On-premise disponible"
    ],
    cta: "Contacter les ventes",
    popular: false
  }
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-20 sm:py-32 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tarifs simples et transparents
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choisissez le plan qui correspond à vos besoins
          </p>

          {/* Toggle */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className={cn(!annual && "text-primary font-medium")}>Mensuel</span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={cn(annual && "text-primary font-medium")}>
              Annuel <span className="text-xs text-green-600">(-20%)</span>
            </span>
          </div>
        </div>

        {/* Plans */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border bg-background p-8",
                plan.popular && "border-primary shadow-lg scale-105"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                    Plus populaire
                  </span>
                </div>
              )}

              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-6">
                <span className="text-4xl font-bold">
                  {plan.price[annual ? "yearly" : "monthly"]}€
                </span>
                <span className="text-muted-foreground">
                  /{annual ? "an" : "mois"}
                </span>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-8 w-full"
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

## Testimonials Section
```tsx
// components/landing/testimonials.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    content: "Cette plateforme a transformé notre façon de travailler. Nous avons réduit notre temps de développement de 50%.",
    author: "Marie Dupont",
    role: "CTO, TechStartup",
    avatar: "/avatars/marie.jpg"
  },
  {
    content: "Le meilleur investissement que nous ayons fait cette année. Le support client est exceptionnel.",
    author: "Pierre Martin",
    role: "Fondateur, AgenceWeb",
    avatar: "/avatars/pierre.jpg"
  },
  {
    content: "Simple, efficace, et incroyablement puissant. Je recommande à tous les développeurs.",
    author: "Sophie Bernard",
    role: "Lead Developer, BigCorp",
    avatar: "/avatars/sophie.jpg"
  }
];

export function Testimonials() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ce que disent nos clients
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Rejoignez des milliers d'utilisateurs satisfaits
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="rounded-2xl border p-6"
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mt-4 text-muted-foreground">"{testimonial.content}"</p>
              <div className="mt-6 flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} />
                  <AvatarFallback>{testimonial.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

## FAQ Section
```tsx
// components/landing/faq.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Comment fonctionne l'essai gratuit ?",
    answer: "L'essai gratuit dure 14 jours et vous donne accès à toutes les fonctionnalités du plan Pro. Aucune carte de crédit n'est requise pour commencer."
  },
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement et sont proratisés."
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Absolument. Nous utilisons un chiffrement AES-256 pour toutes les données, avec des sauvegardes quotidiennes et une conformité RGPD complète."
  },
  {
    question: "Proposez-vous un support technique ?",
    answer: "Oui, tous les plans incluent un support. Le plan Starter a accès à la communauté, Pro au support prioritaire, et Enterprise à un support dédié 24/7."
  },
  {
    question: "Puis-je exporter mes données ?",
    answer: "Oui, vous pouvez exporter toutes vos données à tout moment en format JSON ou CSV depuis les paramètres de votre compte."
  }
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-32 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tout ce que vous devez savoir pour démarrer
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
```

## CTA Final
```tsx
// components/landing/cta.tsx
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-20 sm:px-12 sm:py-28">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Prêt à commencer ?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Rejoignez plus de 10,000 développeurs qui utilisent notre plateforme
              pour créer des applications exceptionnelles.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary">
                Démarrer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Parler à un expert
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

## Page Complète
```tsx
// app/page.tsx
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
  );
}
```
