'use client'

import { useState, useEffect } from 'react'
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
  Eye,
  RefreshCw,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const TYPED_WORDS = ['ETB', 'Booster Boxy', 'Booster Packy', 'Collection Boxy', 'Tins', 'Booster Bundle']

function TypedText() {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = TYPED_WORDS[index]
    const timer = setTimeout(() => {
      if (!deleting) {
        setText(word.substring(0, text.length + 1))
        if (text.length === word.length) {
          setTimeout(() => setDeleting(true), 1500)
        }
      } else {
        setText(word.substring(0, text.length - 1))
        if (text.length === 0) {
          setDeleting(false)
          setIndex((i) => (i + 1) % TYPED_WORDS.length)
        }
      }
    }, deleting ? 50 : 100)
    return () => clearTimeout(timer)
  }, [text, deleting, index])

  return (
    <span className="text-gradient">{text}<span className="animate-pulse">|</span></span>
  )
}

const STATS = [
  { value: '8', label: 'E-shopov', icon: Store },
  { value: '5 min', label: 'Interval kontroly', icon: RefreshCw },
  { value: '300+', label: 'Produktov', icon: Package },
  { value: '24/7', label: 'Monitoring', icon: Eye },
]

const FEATURES = [
  {
    icon: Zap,
    title: 'Okamžitá detekcia',
    description: 'Scraper kontroluje e-shopy každých 5 minút. Keď sa produkt doskladní, okamžite to zaznamenáme.',
    color: 'from-yellow-500/20 to-yellow-600/5',
  },
  {
    icon: Store,
    title: 'Len retail ceny',
    description: 'Sledujeme výhradne retailové obchody - Nekonečno, iHrysko, Dráčik, Bambule a ďalšie. Žiadni reselleri.',
    color: 'from-blue-500/20 to-blue-600/5',
  },
  {
    icon: Shield,
    title: 'Len sealed TCG',
    description: 'Filtrujeme len ETB, Booster Boxy, Packy, Bundle a Collection Boxy. Žiadne plyšáky ani príslušenstvo.',
    color: 'from-emerald-500/20 to-emerald-600/5',
  },
  {
    icon: Bell,
    title: 'Notifikácie pri restocku',
    description: 'Zaregistruj sa a dostaneš okamžitú notifikáciu keď sa tvoj produkt objaví na sklade.',
    color: 'from-purple-500/20 to-purple-600/5',
  },
]

const SHOPS = [
  { name: 'Nekonečno', country: 'SK' },
  { name: 'iHrysko', country: 'SK' },
  { name: 'Dráčik', country: 'SK' },
  { name: 'Pompo', country: 'SK/CZ' },
  { name: 'Xzone', country: 'SK' },
  { name: 'Bambule', country: 'CZ' },
  { name: 'Knihy Dobrovský', country: 'CZ' },
  { name: 'Sparkys', country: 'CZ' },
]

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.88_0.17_88_/_0.06),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,oklch(0.55_0.18_255_/_0.06),transparent_50%)]" />
          <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pt-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Monitorujeme práve teraz
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Sleduj doskladnenie<br />
                <TypedText />
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Monitorujeme 8 slovenských a českých retail e-shopov každých 5 minút.
                Keď sa vypredaný produkt objaví na sklade, budeš prvý kto sa to dozvie.
              </p>

              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" className="h-12 gap-2 px-6 text-base font-semibold" render={<Link href="/dashboard" />}>
                  Pozrieť čo je skladom
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 gap-2 px-6 text-base" render={<Link href="/register" />}>
                  <Bell className="h-4 w-4" />
                  Zapnúť notifikácie
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="flex flex-col items-center rounded-2xl border border-border/40 bg-card/50 px-4 py-5 backdrop-blur-sm">
                    <Icon className="mb-2 h-5 w-5 text-primary/70" />
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Shops marquee */}
        <section className="border-y border-border/30 bg-card/20">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {SHOPS.map((shop) => (
                <div key={shop.name} className="flex items-center gap-2 text-sm text-muted-foreground/80">
                  <Store className="h-3.5 w-3.5" />
                  <span>{shop.name}</span>
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal opacity-60">
                    {shop.country}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-primary/70">
            Ako to funguje
          </div>
          <h2 className="mb-16 text-center text-3xl font-bold sm:text-4xl">
            Od vypredaného po notifikáciu za 5 minút
          </h2>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: '01', title: 'Skenujeme', desc: 'Každých 5 minút prejdeme všetkých 8 e-shopov a skontrolujeme dostupnosť každého TCG produktu.' },
              { step: '02', title: 'Detekujeme', desc: 'Keď produkt zmení stav z "vypredané" na "skladom", okamžite zaznamenáme restock.' },
              { step: '03', title: 'Notifikujeme', desc: 'Dostaneš okamžitú notifikáciu s názvom, cenou a odkazom na e-shop. Stačí kliknúť a kúpiť.' },
            ].map((item) => (
              <div key={item.step} className="group relative rounded-2xl border border-border/30 bg-card/30 p-8 transition-all hover:border-primary/20 hover:bg-card/50">
                <div className="mb-4 text-4xl font-black text-primary/15">{item.step}</div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-border/30 bg-card/10">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <div className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-primary/70">
              Funkcie
            </div>
            <h2 className="mb-16 text-center text-3xl font-bold sm:text-4xl">
              Prečo <span className="text-gradient">MMpokesklad</span>
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              {FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="group relative overflow-hidden rounded-2xl border border-border/30 bg-card/30 p-8 transition-all hover:border-primary/20"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity group-hover:opacity-100`} />
                    <div className="relative">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/8 via-card/80 to-card p-10 sm:p-16">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-blue-500/5 blur-3xl" />
            <div className="relative mx-auto max-w-lg text-center">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Nepremeškaj ďalšie doskladnenie
              </h2>
              <p className="mt-4 text-muted-foreground">
                Zaregistruj sa zadarmo a buď prvý kto sa dozvie o nových produktoch na sklade. Prismatic Evolutions, Journey Together a ďalšie.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" className="h-12 gap-2 px-8 text-base font-semibold" render={<Link href="/register" />}>
                  Registrovať sa zadarmo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground/60">
                Žiadna platba. Žiadny spam. Len notifikácie o doskladnení.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
