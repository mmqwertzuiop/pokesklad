'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Bell, ChevronRight, ExternalLink, Clock,
  ArrowDown, Check, X, Store, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const PRICE_COMPARISONS = [
  { name: 'Prismatic Evolutions ETB', retail: 49.99, resell: 199, savings: 149, img: '🔥' },
  { name: 'Ascended Heroes ETB', retail: 59.99, resell: 139, savings: 79, img: '⚡' },
  { name: 'Pokémon 151 ETB', retail: 49.99, resell: 389, savings: 339, img: '💎' },
  { name: 'Perfect Order ETB', retail: 59.99, resell: 99, savings: 39, img: '✨' },
]

const TIMELINE = [
  { time: '14:02', event: 'Nekonečno doskladní Prismatic Evolutions ETB za 49.99€', type: 'restock' },
  { time: '14:03', event: 'MMpokesklad detekuje zmenu', type: 'detect' },
  { time: '14:04', event: 'Premium používatelia dostanú notifikáciu', type: 'notify' },
  { time: '14:07', event: 'Produkt sa začína vypredávať', type: 'selling' },
  { time: '14:25', event: 'Vypredané. Resell cena: 149€', type: 'soldout' },
]

export default function LandingPage() {
  const [savings, setSavings] = useState(3)

  const totalSaved = PRICE_COMPARISONS.slice(0, savings).reduce((sum, p) => sum + p.savings, 0)

  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* ===== HERO - The hook ===== */}
        <section className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.88_0.17_88_/_0.05),transparent_50%)]" />
          <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Prismatic Evolutions ETB.<br />
              Retail cena: <span className="text-emerald-400">49.99€</span><br />
              Resell cena: <span className="text-red-400 line-through decoration-2">199€</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Rozdiel? <strong className="text-foreground">5 minút.</strong> Kto prišiel neskoro, zaplatil 3x viac.
              My ti dáme vedieť včas.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="h-12 gap-2 px-8 text-base font-bold shadow-lg shadow-primary/20" render={<Link href="/register" />}>
                Chcem vedieť o doskladnení
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground/60">
              <span>✓ Zadarmo na vyskúšanie</span>
              <span>✓ 8 retail e-shopov</span>
              <span>✓ Kontrola každých 5 min</span>
            </div>

            <div className="mt-16">
              <ArrowDown className="mx-auto h-5 w-5 animate-bounce text-muted-foreground/20" />
            </div>
          </div>
        </section>

        {/* ===== THE PROBLEM ===== */}
        <section className="border-y border-border/15 bg-card/5">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
            <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
              Koľko si už preplatil?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground">
              Keď Pokémon TCG produkt vyjde, retail shopy ho predávajú za normálnu cenu.
              Ale vypredá sa za minúty. Potom ho nájdeš len u resellerov - za dvojnásobok.
            </p>

            <div className="mt-12 space-y-3">
              {PRICE_COMPARISONS.map((p) => (
                <div key={p.name} className="flex items-center gap-4 rounded-xl border border-border/15 bg-card/20 p-4 sm:p-5">
                  <span className="text-2xl">{p.img}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold sm:text-base">{p.name}</h3>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground/40">Retail</div>
                        <div className="text-lg font-extrabold text-emerald-400">{p.retail}€</div>
                      </div>
                      <div className="text-muted-foreground/20">vs</div>
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground/40">Resell</div>
                        <div className="text-lg font-extrabold text-red-400">{p.resell}€</div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden shrink-0 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-bold text-emerald-400 sm:block">
                    -{p.savings}€
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
              <p className="text-sm text-muted-foreground">Keby si tieto 4 produkty kúpil za retail namiesto resell, ušetríš</p>
              <p className="mt-1 text-4xl font-extrabold text-primary">{PRICE_COMPARISONS.reduce((s, p) => s + p.savings, 0)}€</p>
              <p className="mt-1 text-xs text-muted-foreground/60">To je {Math.round(PRICE_COMPARISONS.reduce((s, p) => s + p.savings, 0) / 4.99)} mesiacov Premium zadarmo.</p>
            </div>
          </div>
        </section>

        {/* ===== HOW FAST IT HAPPENS ===== */}
        <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
            23 minút. Toľko máš čas.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground">
            Od doskladnenia po vypredanie. Tak rýchlo to ide. Bez nás sa to nedozvieš včas.
          </p>

          <div className="relative mt-12">
            <div className="absolute left-[27px] top-0 bottom-0 w-px bg-border/20 sm:left-[31px]" />
            <div className="space-y-0">
              {TIMELINE.map((t, i) => (
                <div key={i} className="relative flex gap-4 pb-6 sm:gap-5">
                  <div className={`relative z-10 flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full border-2 sm:h-[64px] sm:w-[64px] ${
                    t.type === 'restock' ? 'border-emerald-500/30 bg-emerald-500/10' :
                    t.type === 'detect' ? 'border-blue-500/30 bg-blue-500/10' :
                    t.type === 'notify' ? 'border-primary/30 bg-primary/10' :
                    t.type === 'selling' ? 'border-amber-500/30 bg-amber-500/10' :
                    'border-red-500/30 bg-red-500/10'
                  }`}>
                    <span className="text-xs font-bold text-muted-foreground">{t.time}</span>
                  </div>
                  <div className={`flex flex-1 items-center rounded-xl border p-4 ${
                    t.type === 'soldout' ? 'border-red-500/20 bg-red-500/5' :
                    t.type === 'notify' ? 'border-primary/20 bg-primary/5' :
                    'border-border/15 bg-card/20'
                  }`}>
                    <p className={`text-sm font-medium ${t.type === 'soldout' ? 'text-red-400' : t.type === 'notify' ? 'text-primary' : ''}`}>
                      {t.event}
                    </p>
                    {t.type === 'notify' && <Bell className="ml-auto h-4 w-4 text-primary" />}
                    {t.type === 'soldout' && <X className="ml-auto h-4 w-4 text-red-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Naši používatelia mali <strong className="text-foreground">21 minút</strong> na nákup.
              Bez nás by sa to dozvedeli z Instagramu - keď už bolo neskoro.
            </p>
          </div>
        </section>

        {/* ===== WHAT WE MONITOR ===== */}
        <section className="border-y border-border/15 bg-card/5">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
            <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
              Čo presne sledujeme
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground">
              Len sealed TCG produkty z retailových obchodov. Žiadne resell obchody, žiadne plyšáky.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { name: 'Elite Trainer Box', hot: true },
                { name: 'Booster Box', hot: true },
                { name: 'Booster Bundle', hot: false },
                { name: 'Booster Pack', hot: false },
                { name: 'Collection Box', hot: false },
                { name: 'Tin / Mini Tin', hot: false },
              ].map(c => (
                <div key={c.name} className={`rounded-xl border p-4 text-center text-sm font-semibold ${c.hot ? 'border-primary/20 bg-primary/5 text-primary' : 'border-border/15 bg-card/20'}`}>
                  {c.hot && <span className="mr-1">🔥</span>}
                  {c.name}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground/40">Sledované retail e-shopy</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Nekonečno', 'iHrysko', 'Dráčik', 'Xzone', 'Pompo.sk', 'Pompo.cz', 'Bambule', 'Knihy Dobrovský'].map(s => (
                  <span key={s} className="rounded-full border border-emerald-500/15 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-400/70">{s}</span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {['Smarty', 'Brloh', 'Alza'].map(s => (
                  <span key={s} className="rounded-full border border-amber-500/15 bg-amber-500/5 px-3 py-1 text-xs text-amber-400/70">{s} - čoskoro</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
            4.99€ mesačne. Jeden restock a zarobíš to späť.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-sm text-muted-foreground">
            Kúpiš jedno ETB za retail namiesto resell a ušetríš 50-100€. Premium sa zaplatí pri prvom úspešnom nákupe.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border border-border/15 bg-card/10 p-8">
              <h3 className="text-lg font-bold">Free</h3>
              <div className="mb-6 mt-2">
                <span className="text-3xl font-extrabold">0€</span>
              </div>
              <ul className="space-y-3 text-sm">
                {['Dashboard - čo je práve skladom', 'Filtrovanie podľa kategórie a shopu', 'Kontrola každých 30 min'].map(f => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />{f}</li>
                ))}
                {['Notifikácie pri doskladnení', 'Watchlist', 'Cenová história'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-muted-foreground/30"><X className="mt-0.5 h-4 w-4 shrink-0" />{f}</li>
                ))}
              </ul>
              <Button variant="outline" className="mt-8 w-full" size="lg" render={<Link href="/register" />}>
                Začať zadarmo
              </Button>
            </div>

            {/* Premium */}
            <div className="relative rounded-2xl border border-primary/25 bg-gradient-to-b from-primary/5 to-transparent p-8 shadow-xl shadow-primary/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                Odporúčané
              </div>
              <h3 className="text-lg font-bold">Premium</h3>
              <div className="mb-6 mt-2">
                <span className="text-3xl font-extrabold">4.99€</span>
                <span className="text-sm text-muted-foreground">/mesiac</span>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  'Všetko z Free',
                  'Notifikácie do 5 minút od doskladnenia',
                  'Kontrola každých 5 minút',
                  'Neobmedzený watchlist',
                  'Cenová história produktov',
                  'Prioritná podpora',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>
                ))}
              </ul>
              <Button className="mt-8 w-full font-bold shadow-lg shadow-primary/20" size="lg" render={<Link href="/register" />}>
                Získať Premium
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground/40">Zruš kedykoľvek. Bez záväzkov.</p>
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="border-t border-border/15">
          <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Ďalšie doskladnenie môže prísť kedykoľvek.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Otázka nie je či príde, ale či sa to dozvieš včas.
            </p>
            <Button size="lg" className="mt-8 h-12 gap-2 px-10 text-base font-bold shadow-lg shadow-primary/20" render={<Link href="/register" />}>
              Začať sledovať doskladnenie
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
