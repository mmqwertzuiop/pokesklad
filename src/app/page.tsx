import Link from 'next/link'
import {
  Package,
  Zap,
  Bell,
  Store,
  ArrowRight,
  TrendingUp,
  Shield,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const FEATURES = [
  {
    icon: Store,
    title: '4 slovenské e-shopy',
    description:
      'Sledujeme Nekonečno, Xzone, iHrysko a Dráčik v reálnom čase.',
  },
  {
    icon: Zap,
    title: 'Okamžité notifikácie',
    description:
      'Dozvieš sa o doskladnení ihneď, ako sa produkt objaví na sklade.',
  },
  {
    icon: TrendingUp,
    title: 'Cenová história',
    description:
      'Sleduj vývoj cien a nakupuj v tom najlepšom momente.',
  },
  {
    icon: Shield,
    title: 'Len TCG produkty',
    description:
      'Žiadne plyšáky. Len ETB, Booster Boxy, Packy, Bundle a Collection Boxy.',
  },
]

const CATEGORIES = [
  { name: 'Elite Trainer Box', color: 'bg-purple-500/20 text-purple-400' },
  { name: 'Booster Box', color: 'bg-blue-500/20 text-blue-400' },
  { name: 'Booster Pack', color: 'bg-green-500/20 text-green-400' },
  { name: 'Booster Bundle', color: 'bg-orange-500/20 text-orange-400' },
  { name: 'Collection Box', color: 'bg-pink-500/20 text-pink-400' },
]

const SHOPS = [
  { name: 'Nekonečno', items: '239+' },
  { name: 'Xzone', items: '331+' },
  { name: 'iHrysko', items: '628+' },
  { name: 'Dráčik', items: '50+' },
]

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.88_0.17_88_/_0.08),transparent_60%)]" />
          <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/10 text-primary">
                <Clock className="mr-1.5 h-3 w-3" />
                Kontrolujeme každých 15 minút
              </Badge>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Nikdy nepremeskaj{' '}
                <span className="text-gradient">doskladnenie</span>{' '}
                Pokémon TCG
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Sleduj dostupnosť ETB, Booster Boxov a ďalších Pokémon TCG
                produktov na slovenských e-shopoch. Okamžitá notifikácia pri
                doskladnení.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="gap-2 text-base" render={<Link href="/dashboard" />}>
                  Otvoriť Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-base" render={<Link href="/register" />}>
                  <Bell className="h-4 w-4" />
                  Zapnúť notifikácie
                </Button>
              </div>
            </div>

            {/* Category badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <Badge key={cat.name} variant="outline" className={`${cat.color} border-current/20`}>
                  {cat.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Shops */}
        <section className="border-y border-border/50 bg-card/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Sledované e-shopy
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {SHOPS.map((shop) => (
                <div
                  key={shop.name}
                  className="flex flex-col items-center rounded-xl border border-border/50 bg-card/50 px-4 py-6 transition-colors hover:border-primary/30"
                >
                  <Store className="mb-3 h-8 w-8 text-primary/70" />
                  <span className="font-semibold">{shop.name}</span>
                  <span className="mt-1 text-sm text-muted-foreground">
                    {shop.items} produktov
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">
              Prečo <span className="text-gradient">PokeSklad</span>?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Všetko čo potrebuješ na jedno miesto
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className="border-border/50 bg-card/50 transition-all hover:border-primary/20 hover:glow-yellow"
                >
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12">
            <div className="relative mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Začni sledovať doskladnenie
              </h2>
              <p className="mt-3 text-muted-foreground">
                Zaregistruj sa zadarmo a zapni si notifikácie. Budeš prvý kto sa
                dozvie o nových dostupných produktoch.
              </p>
              <Button size="lg" className="mt-6 gap-2" render={<Link href="/register" />}>
                Registrovať sa zadarmo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
