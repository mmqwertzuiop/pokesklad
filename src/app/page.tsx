'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Zap, Bell, ArrowRight, Shield, Clock, Eye, RefreshCw,
  ChevronRight, Star, Check, Store, TrendingUp, Users,
  Package, ExternalLink, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const TYPED_WORDS = ['Prismatic Evolutions', 'Ascended Heroes ETB', 'Perfect Order', 'Booster Boxy', 'Mega Evolution']

function TypedText() {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const word = TYPED_WORDS[index]
    const timer = setTimeout(() => {
      if (!deleting) {
        setText(word.substring(0, text.length + 1))
        if (text.length === word.length) setTimeout(() => setDeleting(true), 2000)
      } else {
        setText(word.substring(0, text.length - 1))
        if (text.length === 0) { setDeleting(false); setIndex((i) => (i + 1) % TYPED_WORDS.length) }
      }
    }, deleting ? 40 : 80)
    return () => clearTimeout(timer)
  }, [text, deleting, index])
  return <span className="text-gradient">{text}<span className="animate-pulse text-primary/50">|</span></span>
}

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  )
}

const SOCIAL_PROOF = [
  { icon: Users, value: '500+', label: 'Aktívnych používateľov' },
  { icon: Zap, value: '2,847', label: 'Detekovaných restockov' },
  { icon: Clock, value: '<5 min', label: 'Čas notifikácie' },
  { icon: Star, value: '4.9/5', label: 'Hodnotenie' },
]

const SHOPS_LIST = [
  'Nekonečno', 'iHrysko', 'Dráčik', 'Xzone', 'Pompo.sk', 'Pompo.cz', 'Bambule', 'Knihy Dobrovský'
]

const PRICING = [
  {
    name: 'Free',
    price: '0',
    desc: 'Pre zvedavých',
    features: ['Dashboard s produktami skladom', 'Filtrovanie podľa kategórie', 'Základné informácie', 'Kontrola každých 30 min'],
    cta: 'Začať zadarmo',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '4.99',
    desc: 'Pre serióznych zberateľov',
    features: ['Všetko z Free', 'Notifikácie pri doskladnení', 'Kontrola každých 5 minút', 'Watchlist neobmedzený', 'Cenová história', 'Prioritná podpora'],
    cta: 'Získať Premium',
    href: '/register',
    highlighted: true,
  },
]

const FAQ = [
  { q: 'Ako rýchlo sa dozviem o doskladnení?', a: 'Premium používatelia dostanú notifikáciu do 5 minút od momentu keď e-shop produkt naskladní. Free používatelia vidia dashboard s 30 minútovým oneskorením.' },
  { q: 'Ktoré e-shopy sledujete?', a: 'Sledujeme 8 najväčších retail e-shopov na Slovensku a v Česku: Nekonečno, iHrysko, Dráčik, Xzone, Pompo.sk, Pompo.cz, Bambule a Knihy Dobrovský. Žiadne resell obchody.' },
  { q: 'Prečo len retail?', a: 'Retail shopy predávajú za MSRP (odporúčanú maloobchodnú cenu). Keď sa produkt doskladní, kúpite ho za normálnu cenu - nie za 2-3x navýšenú od resellerov.' },
  { q: 'Aké produkty sledujete?', a: 'Len sealed TCG produkty: Elite Trainer Boxy, Booster Boxy, Booster Packy, Booster Bundle a Collection Boxy. Žiadne plyšáky, figúrky ani príslušenstvo.' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,oklch(0.88_0.17_88_/_0.07),transparent_60%)]" />
          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left */}
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-400">
                  <LiveDot />
                  Monitorujeme 8 e-shopov práve teraz
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  Buď prvý pri doskladnení{' '}
                  <TypedText />
                </h1>

                <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Automaticky sledujeme slovenské a české retail e-shopy každých 5 minút.
                  Keď sa vypredaný Pokémon TCG produkt objaví na sklade,
                  <strong className="text-foreground"> dostaneš okamžitú notifikáciu</strong>.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="h-12 gap-2 px-8 text-base font-bold shadow-lg shadow-primary/20" render={<Link href="/dashboard" />}>
                    Pozrieť dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 gap-2 px-6 text-base" render={<Link href="/register" />}>
                    <Bell className="h-4 w-4" />
                    Zapnúť notifikácie
                  </Button>
                </div>

                <p className="mt-4 text-xs text-muted-foreground/50">Zadarmo. Bez kreditnej karty. Zruš kedykoľvek.</p>
              </div>

              {/* Right - Mock notification */}
              <div className="relative hidden lg:block">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 blur-2xl" />
                <div className="relative space-y-3 rounded-2xl border border-border/20 bg-card/50 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <LiveDot />
                    <span>Live notifikácie</span>
                  </div>

                  {[
                    { name: 'Prismatic Evolutions ETB', shop: 'Nekonečno', price: '95.99', time: 'pred 2 min', hot: true },
                    { name: 'ME03 Perfect Order Booster Bundle', shop: 'Bambule', price: '35.99', time: 'pred 8 min', hot: true },
                    { name: 'Ascended Heroes Mini Tin', shop: 'iHrysko', price: '19.99', time: 'pred 14 min', hot: false },
                    { name: 'Journey Together ETB', shop: 'Dráčik', price: '49.99', time: 'pred 23 min', hot: false },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${item.hot ? 'border-primary/20 bg-primary/5' : 'border-border/10 bg-card/30'}`}>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.hot ? 'bg-primary/15' : 'bg-muted/20'}`}>
                        {item.hot ? <Sparkles className="h-4 w-4 text-primary" /> : <Package className="h-4 w-4 text-muted-foreground/50" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">{item.shop} · {item.time}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold">{item.price}€</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SOCIAL PROOF ===== */}
        <section className="border-y border-border/15 bg-card/10">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {SOCIAL_PROOF.map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="text-center">
                    <Icon className="mx-auto mb-2 h-5 w-5 text-primary/50" />
                    <div className="text-2xl font-extrabold">{s.value}</div>
                    <div className="text-[11px] text-muted-foreground">{s.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ===== SHOPS ===== */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground/40">Sledované retail e-shopy</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {SHOPS_LIST.map(s => (
              <div key={s} className="flex items-center gap-1.5 rounded-full border border-border/15 bg-card/20 px-4 py-1.5 text-sm text-muted-foreground/70">
                <Store className="h-3 w-3 text-primary/40" />
                {s}
              </div>
            ))}
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="border-y border-border/15 bg-card/5">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <p className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-primary/60">Ako to funguje</p>
            <h2 className="mb-14 text-center text-2xl font-extrabold sm:text-3xl">Tri kroky k úspešnému nákupu</h2>

            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { num: '1', icon: RefreshCw, title: 'Skenujeme non-stop', desc: 'Každých 5 minút automaticky skontrolujeme dostupnosť na všetkých 8 e-shopoch. 24 hodín denne, 7 dní v týždni.' },
                { num: '2', icon: Zap, title: 'Detekujeme restock', desc: 'Keď sa produkt zmení z "vypredané" na "skladom", okamžite to zachytíme. Žiadne falošné alerty.' },
                { num: '3', icon: Bell, title: 'Notifikujeme teba', desc: 'Do 5 minút dostaneš notifikáciu s názvom produktu, cenou a priamym odkazom na e-shop. Stačí kliknúť a kúpiť.' },
              ].map((step) => {
                const Icon = step.icon
                return (
                  <div key={step.num} className="relative rounded-2xl border border-border/15 bg-card/20 p-8">
                    <div className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{step.num}</div>
                    <Icon className="mb-4 h-6 w-6 text-primary/60" />
                    <h3 className="mb-2 text-base font-bold">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ===== WHY US ===== */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-primary/60">Prečo MMpokesklad</p>
          <h2 className="mb-14 text-center text-2xl font-extrabold sm:text-3xl">Výhody oproti manuálnemu hľadaniu</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Clock, title: 'Ušetri hodiny času', desc: 'Namiesto manuálneho kontrolovania 8 webstránok ti stačí jedna notifikácia.' },
              { icon: Shield, title: 'Len retail ceny', desc: 'Sledujeme výhradne retailové obchody. Žiadni reselleri s navýšenými cenami.' },
              { icon: TrendingUp, title: 'Nekupuj draho', desc: 'Kúp za MSRP keď e-shop doskladní, namiesto 2-3x ceny od resellerov.' },
              { icon: Eye, title: 'Len TCG sealed', desc: 'ETB, Booster Boxy, Packy, Bundle, Tins. Žiadne plyšáky ani príslušenstvo.' },
              { icon: Zap, title: 'Rýchlosť', desc: 'Kontrola každých 5 minút. Budeš medzi prvými kto sa dozvie o doskladnení.' },
              { icon: Store, title: 'SK + CZ pokrytie', desc: '8 najväčších retail e-shopov na Slovensku a v Česku na jednom mieste.' },
            ].map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="group rounded-2xl border border-border/10 bg-card/10 p-6 transition-all hover:border-primary/15 hover:bg-card/30">
                  <Icon className="mb-3 h-5 w-5 text-primary/50 transition-colors group-hover:text-primary" />
                  <h3 className="mb-1.5 text-sm font-bold">{f.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section className="border-y border-border/15 bg-card/5">
          <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
            <p className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-primary/60">Cenník</p>
            <h2 className="mb-4 text-center text-2xl font-extrabold sm:text-3xl">Jednoduchý a férový</h2>
            <p className="mb-12 text-center text-sm text-muted-foreground">Začni zadarmo. Upgradni keď budeš pripravený.</p>

            <div className="grid gap-6 sm:grid-cols-2">
              {PRICING.map((plan) => (
                <div key={plan.name} className={`relative rounded-2xl border p-8 ${plan.highlighted ? 'border-primary/30 bg-primary/5 shadow-xl shadow-primary/5' : 'border-border/15 bg-card/10'}`}>
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
                      Najpopulárnejšie
                    </div>
                  )}
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="mb-4 text-xs text-muted-foreground">{plan.desc}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold">{plan.price}€</span>
                    <span className="text-sm text-muted-foreground">/mesiac</span>
                  </div>
                  <ul className="mb-8 space-y-2.5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlighted ? 'text-primary' : 'text-muted-foreground/50'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.highlighted ? '' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`} size="lg" render={<Link href={plan.href} />}>
                    {plan.cta}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-primary/60">FAQ</p>
          <h2 className="mb-10 text-center text-2xl font-extrabold">Časté otázky</h2>

          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-xl border border-border/15 bg-card/10">
                <button
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold hover:text-primary"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.q}
                  <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="border-t border-border/10 px-5 pb-5 pt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="border-t border-border/15">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/8 via-card/60 to-card p-10 text-center sm:p-16">
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Nepremeškaj ďalšie doskladnenie
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Prismatic Evolutions, Ascended Heroes, Perfect Order - všetko sledujeme.
                Zaregistruj sa a buď prvý kto nakúpi za retail cenu.
              </p>
              <Button size="lg" className="mt-8 h-12 gap-2 px-10 text-base font-bold shadow-lg shadow-primary/20" render={<Link href="/register" />}>
                Registrovať sa zadarmo
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="mt-3 text-[11px] text-muted-foreground/40">Žiadna platba. Zruš kedykoľvek.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
