'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Bell, ChevronRight, ChevronDown, Check, X,
  Store, Zap, Clock, Shield, TrendingUp, Eye, RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

// Typed text animation
const WORDS = ['Prismatic Evolutions', 'Ascended Heroes ETB', 'Perfect Order', 'Booster Boxy', 'Mega Evolution']
function TypedText() {
  const [i, setI] = useState(0)
  const [t, setT] = useState('')
  const [del, setDel] = useState(false)
  useEffect(() => {
    const w = WORDS[i]
    const timer = setTimeout(() => {
      if (!del) { setT(w.substring(0, t.length + 1)); if (t.length === w.length) setTimeout(() => setDel(true), 2200) }
      else { setT(w.substring(0, t.length - 1)); if (t.length === 0) { setDel(false); setI(x => (x + 1) % WORDS.length) } }
    }, del ? 35 : 75)
    return () => clearTimeout(timer)
  }, [t, del, i])
  return <span className="text-gradient">{t}<span className="animate-pulse text-primary/40">|</span></span>
}

// Animate on scroll
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  )
}

// Live notification simulation
function LiveFeed() {
  const [active, setActive] = useState(0)
  const items = [
    { name: 'Prismatic Evolutions ETB', shop: 'Nekonečno', price: '95.99', ago: '2 min' },
    { name: 'Perfect Order Booster Bundle', shop: 'Bambule', price: '35.99', ago: '8 min' },
    { name: 'Ascended Heroes Mini Tin', shop: 'iHrysko', price: '19.99', ago: '14 min' },
    { name: 'Journey Together ETB', shop: 'Dráčik', price: '49.99', ago: '23 min' },
  ]
  useEffect(() => { const t = setInterval(() => setActive(a => (a + 1) % items.length), 3000); return () => clearInterval(t) }, [])
  return (
    <div className="space-y-2.5">
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          animate={{ opacity: idx <= active ? 1 : 0.3, scale: idx === active ? 1.02 : 1, borderColor: idx === active ? 'oklch(0.88 0.17 88 / 0.25)' : 'oklch(1 0 0 / 0.05)' }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 rounded-xl border bg-card/30 p-3.5 backdrop-blur-sm"
        >
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${idx === active ? 'bg-primary/15' : 'bg-muted/10'}`}>
            <Zap className={`h-4 w-4 ${idx === active ? 'text-primary' : 'text-muted-foreground/30'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold">{item.name}</p>
            <p className="text-[11px] text-muted-foreground/60">{item.shop} · pred {item.ago}</p>
          </div>
          <span className="shrink-0 text-base font-bold tabular-nums">{item.price}<span className="text-xs text-muted-foreground/50">€</span></span>
        </motion.div>
      ))}
    </div>
  )
}

// Counter animation
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = Math.ceil(target / 40)
    const t = setInterval(() => { start += step; if (start >= target) { setVal(target); clearInterval(t) } else setVal(start) }, 30)
    return () => clearInterval(t)
  }, [inView, target])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

const COMPARISONS = [
  { name: 'Prismatic Evolutions ETB', retail: 49.99, resell: 199 },
  { name: 'Ascended Heroes ETB', retail: 59.99, resell: 139 },
  { name: 'Pokémon 151 ETB', retail: 49.99, resell: 389 },
  { name: 'Perfect Order ETB', retail: 59.99, resell: 99 },
]

const TIMELINE = [
  { time: '14:02', text: 'Nekonečno doskladní Prismatic Evolutions ETB za 49.99€', type: 'restock' },
  { time: '14:03', text: 'MMpokebot detekuje zmenu stavu', type: 'detect' },
  { time: '14:04', text: 'Premium používatelia dostanú notifikáciu', type: 'notify' },
  { time: '14:07', text: 'Produkt sa začína vypredávať', type: 'warn' },
  { time: '14:25', text: 'Vypredané. Resell cena: 199€', type: 'sold' },
]

const FAQ = [
  { q: 'Ako rýchlo sa dozviem o doskladnení?', a: 'Premium používatelia dostanú notifikáciu do 5 minút. Free používatelia vidia dashboard s 30 min oneskorením.' },
  { q: 'Ktoré e-shopy sledujete?', a: '10 najväčších retail e-shopov: Nekonečno, iHrysko, Dráčik, Smarty, Brloh, Xzone, Pompo.sk, Pompo.cz, Bambule a Knihy Dobrovský.' },
  { q: 'Prečo len retail?', a: 'Retail shopy predávajú za MSRP. Keď doskladnia, kúpite za normálnu cenu - nie za 2-3x od resellerov.' },
  { q: 'Aké produkty sledujete?', a: 'Len sealed TCG: ETB, Booster Boxy, Packy, Bundle a Collection Boxy. Žiadne plyšáky ani príslušenstvo.' },
]

const SHOPS = ['Nekonečno', 'iHrysko', 'Dráčik', 'Smarty', 'Brloh', 'Xzone', 'Pompo.sk', 'Pompo.cz', 'Bambule', 'Knihy Dobrovský']

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,oklch(0.88_0.17_88_/_0.06),transparent)]" />
          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" /></span>
                  Monitorujeme 10 e-shopov práve teraz
                </div>

                <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.75rem]">
                  Buď prvý pri<br />doskladnení <TypedText />
                </h1>

                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  Sledujeme 10 slovenských a českých retail e-shopov každých 5 minút.
                  Keď sa vypredaný produkt objaví na sklade,
                  <strong className="text-foreground"> dostaneš notifikáciu</strong>.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="h-11 gap-2 px-7 text-sm font-bold shadow-lg shadow-primary/15" render={<Link href="/dashboard" />}>
                    Pozrieť čo je skladom <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-11 gap-2 px-6 text-sm" render={<Link href="/register" />}>
                    <Bell className="h-3.5 w-3.5" /> Zapnúť notifikácie
                  </Button>
                </div>

                <p className="mt-4 text-[11px] text-muted-foreground/40">Zadarmo. Bez kreditnej karty.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/8 via-transparent to-blue-500/5 blur-2xl" />
                  <div className="relative rounded-2xl border border-border/15 bg-card/40 p-5 backdrop-blur-sm">
                    <div className="mb-4 flex items-center gap-2 text-[11px] text-muted-foreground/50">
                      <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" /></span>
                      Live notifikácie
                    </div>
                    <LiveFeed />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-y border-border/10">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { icon: Store, val: 10, suffix: '', label: 'Retail e-shopov' },
                { icon: RefreshCw, val: 5, suffix: ' min', label: 'Interval kontroly' },
                { icon: Eye, val: 300, suffix: '+', label: 'Sledovaných produktov' },
                { icon: Clock, val: 24, suffix: '/7', label: 'Non-stop monitoring' },
              ].map((s, i) => {
                const Icon = s.icon
                return (
                  <FadeIn key={s.label} delay={i * 0.1} className="text-center">
                    <Icon className="mx-auto mb-2 h-4 w-4 text-primary/40" />
                    <div className="text-2xl font-extrabold"><Counter target={s.val} suffix={s.suffix} /></div>
                    <div className="text-[11px] text-muted-foreground/50">{s.label}</div>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </section>

        {/* PRICE COMPARISON */}
        <FadeIn>
          <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/50">Prečo to potrebuješ</p>
            <h2 className="mb-4 text-center text-2xl font-extrabold sm:text-3xl">Koľko si už preplatil?</h2>
            <p className="mx-auto mb-12 max-w-md text-center text-sm text-muted-foreground">
              Retail shopy doskladnia za normálnu cenu. Kto príde neskoro, kúpi od resellera za dvojnásobok.
            </p>

            <div className="space-y-2.5">
              {COMPARISONS.map((p, i) => (
                <FadeIn key={p.name} delay={i * 0.08}>
                  <div className="flex items-center gap-4 rounded-xl border border-border/10 bg-card/20 p-4 transition-colors hover:bg-card/40">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold">{p.name}</h3>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground/30">Retail</div>
                        <div className="text-base font-extrabold text-emerald-400">{p.retail}€</div>
                      </div>
                      <div className="text-muted-foreground/15">→</div>
                      <div className="text-right">
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground/30">Resell</div>
                        <div className="text-base font-extrabold text-red-400">{p.resell}€</div>
                      </div>
                      <div className="hidden rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 sm:block">
                        -{p.resell - p.retail}€
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.4}>
              <div className="mt-8 rounded-xl border border-primary/15 bg-primary/5 p-6 text-center">
                <p className="text-xs text-muted-foreground">Celková úspora pri kúpe za retail</p>
                <p className="mt-1 text-4xl font-extrabold text-primary"><Counter target={606} />€</p>
                <p className="mt-1 text-[11px] text-muted-foreground/40">To je {Math.round(606 / 4.99)} mesiacov Premium zadarmo</p>
              </div>
            </FadeIn>
          </section>
        </FadeIn>

        {/* TIMELINE */}
        <section className="border-y border-border/10 bg-card/5">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
            <FadeIn>
              <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/50">Rýchlosť rozhoduje</p>
              <h2 className="mb-4 text-center text-2xl font-extrabold sm:text-3xl">23 minút. Toľko máš čas.</h2>
              <p className="mx-auto mb-14 max-w-md text-center text-sm text-muted-foreground">
                Od doskladnenia po vypredanie. Bez nás sa to nedozvieš včas.
              </p>
            </FadeIn>

            <div className="relative">
              <div className="absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/20 via-primary/20 to-red-500/20" />
              {TIMELINE.map((t, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="relative flex gap-5 pb-5">
                    <div className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border ${
                      t.type === 'restock' ? 'border-emerald-500/20 bg-emerald-500/5' :
                      t.type === 'detect' ? 'border-blue-500/20 bg-blue-500/5' :
                      t.type === 'notify' ? 'border-primary/20 bg-primary/5' :
                      t.type === 'warn' ? 'border-amber-500/20 bg-amber-500/5' :
                      'border-red-500/20 bg-red-500/5'
                    }`}>
                      <span className="text-[11px] font-bold text-muted-foreground/70">{t.time}</span>
                    </div>
                    <div className={`flex flex-1 items-center rounded-xl border p-4 ${
                      t.type === 'notify' ? 'border-primary/15 bg-primary/5' :
                      t.type === 'sold' ? 'border-red-500/15 bg-red-500/5' :
                      'border-border/10 bg-card/20'
                    }`}>
                      <p className={`text-sm ${t.type === 'sold' ? 'font-bold text-red-400' : t.type === 'notify' ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                        {t.text}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <FadeIn>
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/50">Ako to funguje</p>
            <h2 className="mb-14 text-center text-2xl font-extrabold sm:text-3xl">Tri kroky k úspešnému nákupu</h2>
          </FadeIn>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: RefreshCw, title: 'Skenujeme', desc: 'Každých 5 minút automaticky kontrolujeme 10 retailových e-shopov. Non-stop, 24/7.' },
              { icon: Zap, title: 'Detekujeme', desc: 'Keď produkt zmení stav z vypredané na skladom, okamžite zachytíme restock.' },
              { icon: Bell, title: 'Notifikujeme', desc: 'Dostaneš notifikáciu s produktom, cenou a odkazom. Klikneš a kúpiš.' },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <FadeIn key={s.title} delay={i * 0.15}>
                  <div className="relative rounded-2xl border border-border/10 bg-card/10 p-7">
                    <div className="absolute -top-3.5 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</div>
                    <Icon className="mb-4 h-5 w-5 text-primary/50" />
                    <h3 className="mb-2 font-bold">{s.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </section>

        {/* SHOPS */}
        <section className="border-y border-border/10 bg-card/5">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
            <FadeIn>
              <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/30">10 sledovaných retail e-shopov</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SHOPS.map(s => (
                  <span key={s} className="rounded-full border border-border/10 bg-card/20 px-3.5 py-1.5 text-xs font-medium text-muted-foreground/60 transition-colors hover:border-primary/15 hover:text-primary/60">{s}</span>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* PRICING */}
        <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <FadeIn>
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/50">Cenník</p>
            <h2 className="mb-3 text-center text-2xl font-extrabold sm:text-3xl">Jeden restock a máš to späť</h2>
            <p className="mx-auto mb-12 max-w-sm text-center text-sm text-muted-foreground">
              Premium sa zaplatí pri prvom úspešnom nákupe za retail cenu.
            </p>
          </FadeIn>

          <div className="grid gap-5 sm:grid-cols-2">
            <FadeIn delay={0}>
              <div className="h-full rounded-2xl border border-border/10 bg-card/10 p-7">
                <h3 className="text-lg font-bold">Free</h3>
                <p className="mb-5 text-xs text-muted-foreground/50">Pre zvedavých</p>
                <div className="mb-6"><span className="text-3xl font-extrabold">0€</span></div>
                <ul className="space-y-2.5 text-sm">
                  {['Dashboard - čo je skladom', 'Filtrovanie podľa kategórie', 'Kontrola každých 30 min'].map(f => (
                    <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/30" /><span className="text-muted-foreground">{f}</span></li>
                  ))}
                  {['Notifikácie pri doskladnení', 'Watchlist', 'Cenová história'].map(f => (
                    <li key={f} className="flex items-start gap-2 text-muted-foreground/20"><X className="mt-0.5 h-3.5 w-3.5 shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-7 w-full" size="lg" render={<Link href="/register" />}>Začať zadarmo</Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="relative h-full rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-7 shadow-xl shadow-primary/5">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground">Odporúčané</div>
                <h3 className="text-lg font-bold">Premium</h3>
                <p className="mb-5 text-xs text-muted-foreground/50">Pre zberateľov</p>
                <div className="mb-6"><span className="text-3xl font-extrabold">4.99€</span><span className="text-sm text-muted-foreground">/mesiac</span></div>
                <ul className="space-y-2.5 text-sm">
                  {['Všetko z Free', 'Notifikácie do 5 min od doskladnenia', 'Kontrola každých 5 minút', 'Neobmedzený watchlist', 'Cenová história', 'Prioritná podpora'].map(f => (
                    <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{f}</li>
                  ))}
                </ul>
                <Button className="mt-7 w-full font-bold shadow-lg shadow-primary/15" size="lg" render={<Link href="/register" />}>
                  Získať Premium <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
                <p className="mt-2.5 text-center text-[10px] text-muted-foreground/30">Zruš kedykoľvek. Bez záväzkov.</p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border/10">
          <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
            <FadeIn>
              <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/50">FAQ</p>
              <h2 className="mb-10 text-center text-2xl font-extrabold">Časté otázky</h2>
            </FadeIn>
            <div className="space-y-1.5">
              {FAQ.map((item, i) => (
                <FadeIn key={i} delay={i * 0.05}>
                  <div className="rounded-xl border border-border/8 bg-card/5 transition-colors hover:bg-card/15">
                    <button className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      {item.q}
                      <motion.div animate={{ rotate: openFaq === i ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                          <div className="border-t border-border/5 px-4 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <FadeIn>
            <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-10 text-center sm:p-14">
              <h2 className="text-2xl font-extrabold sm:text-3xl">Ďalšie doskladnenie môže prísť kedykoľvek.</h2>
              <p className="mt-3 text-sm text-muted-foreground">Otázka nie je či príde, ale či sa to dozvieš včas.</p>
              <Button size="lg" className="mt-7 h-11 gap-2 px-8 text-sm font-bold shadow-lg shadow-primary/15" render={<Link href="/register" />}>
                Začať sledovať doskladnenie <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </FadeIn>
        </section>
      </main>
      <Footer />
    </>
  )
}
