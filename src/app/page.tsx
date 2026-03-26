'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef } from 'react'
import {
  ArrowRight, Bell, ChevronRight, Check, X,
  ExternalLink, Store, Clock, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import type { Product } from '@/types/product'
import { CATEGORY_LABELS } from '@/lib/constants'

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45, delay, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  )
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min} min`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export default function LandingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/products?status=in_stock&limit=12&sort=updated_at&order=desc')
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const totalSavings = 606

  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* ===== HERO - straight to the point ===== */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,oklch(0.88_0.17_88_/_0.05),transparent)]" />
          <div className="relative mx-auto max-w-5xl px-4 pb-6 pt-14 sm:px-6 sm:pt-20">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-3 py-1 text-[11px] text-emerald-400">
                <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" /></span>
                Práve teraz monitorujeme 11 e-shopov
              </div>

              <h1 className="mx-auto max-w-2xl text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
                Kúp Pokémon TCG za retail,<br className="hidden sm:block" />
                nie za resell
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                Kontrolujeme 11 e-shopov každých 5 minút. Keď sa vypredaný
                produkt objaví skladom, dostaneš notifikáciu.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" className="h-11 gap-2 px-7 text-sm font-bold shadow-lg shadow-primary/15" render={<Link href="/register" />}>
                  <Bell className="h-3.5 w-3.5" /> Chcem notifikácie pri doskladnení
                </Button>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground/30">Zadarmo. Bez kreditnej karty.</p>
            </motion.div>
          </div>
        </section>

        {/* ===== LIVE PRODUCTS - real data, not mock ===== */}
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" /></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/70">Práve skladom</span>
            </div>
            <Link href="/dashboard" className="flex items-center gap-1 text-xs text-muted-foreground/40 transition-colors hover:text-primary">
              Všetky produkty <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-border/5 bg-card/10">
                  <div className="aspect-[4/3] bg-muted/5" />
                  <div className="space-y-2 p-3"><div className="h-3 w-3/4 rounded bg-muted/5" /><div className="h-4 w-16 rounded bg-muted/5" /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.slice(0, 8).map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.05}>
                  <div className="group overflow-hidden rounded-xl border border-border/8 bg-card/15 transition-all duration-300 hover:border-primary/15 hover:shadow-[0_0_30px_-8px] hover:shadow-primary/8">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-muted/5 to-transparent">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" sizes="25vw" unoptimized />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl text-muted-foreground/5">?</div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
                        <Store className="h-2.5 w-2.5" />{(p.shop as any)?.name}
                        <span className="ml-auto"><Clock className="mr-0.5 inline h-2.5 w-2.5" />{timeAgo(p.updated_at)}</span>
                      </div>
                      <h3 className="line-clamp-2 text-[12px] font-semibold leading-snug">{p.name}</h3>
                      <div className="mt-2 flex items-end justify-between">
                        <span className="text-lg font-extrabold tabular-nums">{p.current_price?.toFixed(2)}<span className="text-[10px] font-normal text-muted-foreground/40">€</span></span>
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/20">
                          Kúpiť <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}

          {!loading && products.length > 8 && (
            <div className="mt-5 text-center">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" render={<Link href="/dashboard" />}>
                Zobraziť všetkých {products.length}+ produktov <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </section>

        {/* ===== THE MATH - why it makes sense ===== */}
        <section className="border-y border-border/8 bg-card/5">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <FadeIn>
              <h2 className="text-center text-xl font-extrabold sm:text-2xl">
                Jeden úspešný nákup za retail a ušetríš viac<br className="hidden sm:block" /> než stojí rok Premium
              </h2>
            </FadeIn>

            <div className="mt-10 space-y-2">
              {[
                { name: 'Prismatic Evolutions ETB', retail: 49.99, resell: 199 },
                { name: 'Pokémon 151 ETB', retail: 49.99, resell: 389 },
                { name: 'Ascended Heroes ETB', retail: 59.99, resell: 139 },
                { name: 'Perfect Order ETB', retail: 59.99, resell: 99 },
              ].map((p, i) => (
                <FadeIn key={p.name} delay={i * 0.06}>
                  <div className="flex items-center gap-3 rounded-lg border border-border/5 bg-card/10 px-4 py-3 sm:gap-4">
                    <div className="min-w-0 flex-1 text-sm font-semibold">{p.name}</div>
                    <div className="flex items-center gap-3 shrink-0 tabular-nums">
                      <span className="text-sm font-bold text-emerald-400">{p.retail}€</span>
                      <span className="text-[10px] text-muted-foreground/20">vs</span>
                      <span className="text-sm font-bold text-red-400/70 line-through">{p.resell}€</span>
                      <span className="hidden rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 sm:inline">
                        -{Math.round(p.resell - p.retail)}€
                      </span>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.3}>
              <div className="mt-6 rounded-lg border border-primary/10 bg-primary/5 px-5 py-4 text-center">
                <span className="text-xs text-muted-foreground/50">Celková úspora</span>
                <span className="ml-2 text-2xl font-extrabold text-primary">{totalSavings}€</span>
                <span className="ml-2 text-xs text-muted-foreground/30">= {Math.round(totalSavings / 4.99)} mesiacov Premium</span>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ===== SPEED MATTERS - compact ===== */}
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <FadeIn>
            <h2 className="text-center text-xl font-extrabold sm:text-2xl">
              Od doskladnenia po vypredanie: 23 minút
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted-foreground">Bez automatického monitoringu sa to nedozvieš včas.</p>
          </FadeIn>

          <div className="relative mt-10">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/15 via-primary/15 to-red-500/15 sm:left-7" />
            {[
              { time: '14:02', text: 'E-shop doskladní produkt za retail cenu', color: 'border-emerald-500/15 bg-emerald-500/5' },
              { time: '14:04', text: 'MMpokebot detekuje a pošle notifikáciu', color: 'border-primary/15 bg-primary/5', highlight: true },
              { time: '14:25', text: 'Vypredané. Resell cena: 2-3x viac', color: 'border-red-500/15 bg-red-500/5' },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div className="relative flex gap-4 pb-4 sm:gap-5">
                  <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border sm:h-14 sm:w-14 ${t.color}`}>
                    <span className="text-[10px] font-bold text-muted-foreground/60">{t.time}</span>
                  </div>
                  <div className={`flex flex-1 items-center rounded-lg border px-4 py-3 ${t.color} ${t.highlight ? 'ring-1 ring-primary/10' : ''}`}>
                    <p className={`text-sm ${t.highlight ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>{t.text}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ===== SHOPS - compact ===== */}
        <section className="border-y border-border/8 bg-card/5">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 text-center">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/25">11 retail e-shopov</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {['Alza', 'Nekonečno', 'iHrysko', 'Dráčik', 'Smarty', 'Brloh', 'Xzone', 'Pompo.sk', 'Pompo.cz', 'Bambule', 'Knihy Dobrovský'].map(s => (
                <span key={s} className="rounded-full border border-border/8 px-3 py-1 text-[11px] text-muted-foreground/40">{s}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRICING - compact ===== */}
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <FadeIn>
            <h2 className="text-center text-xl font-extrabold sm:text-2xl">Jeden plán. Férová cena.</h2>
          </FadeIn>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <FadeIn>
              <div className="rounded-xl border border-border/8 bg-card/5 p-6">
                <h3 className="font-bold">Free</h3>
                <div className="mt-1 mb-5"><span className="text-2xl font-extrabold">0€</span></div>
                <ul className="space-y-2 text-[13px]">
                  {['Dashboard - čo je skladom', 'Filtrovanie podľa kategórie'].map(f => (
                    <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/25" /><span className="text-muted-foreground/60">{f}</span></li>
                  ))}
                  {['Notifikácie', 'Watchlist', '5 min kontrola'].map(f => (
                    <li key={f} className="flex items-start gap-2 text-muted-foreground/15"><X className="mt-0.5 h-3.5 w-3.5 shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-6 w-full text-xs" render={<Link href="/register" />}>Začať zadarmo</Button>
              </div>
            </FadeIn>
            <FadeIn delay={0.08}>
              <div className="relative rounded-xl border border-primary/15 bg-gradient-to-b from-primary/5 to-transparent p-6 shadow-lg shadow-primary/5">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-[9px] font-bold text-primary-foreground">Odporúčané</div>
                <h3 className="font-bold">Premium</h3>
                <div className="mt-1 mb-5"><span className="text-2xl font-extrabold">4.99€</span><span className="text-xs text-muted-foreground/40">/mesiac</span></div>
                <ul className="space-y-2 text-[13px]">
                  {['Notifikácie do 5 min od restocku', 'Kontrola každých 5 minút', 'Neobmedzený watchlist', 'Cenová história'].map(f => (
                    <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{f}</li>
                  ))}
                </ul>
                <Button className="mt-6 w-full text-xs font-bold shadow-md shadow-primary/10" render={<Link href="/register" />}>
                  Získať Premium <ChevronRight className="ml-0.5 h-3 w-3" />
                </Button>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="border-t border-border/8">
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
            <FadeIn><h2 className="mb-8 text-center text-xl font-extrabold">Otázky</h2></FadeIn>
            <div className="space-y-1">
              {[
                { q: 'Ako rýchlo dostanem notifikáciu?', a: 'Premium: do 5 minút od doskladnenia. Free: vidíš dashboard s 30 min oneskorením, bez notifikácií.' },
                { q: 'Prečo len retail shopy?', a: 'Retail shopy predávajú za MSRP. Keď doskladnia, kúpiš za normálnu cenu. Reselleri navyšujú 2-3x.' },
                { q: 'Čo presne sledujete?', a: 'Sealed TCG produkty: ETB, Booster Boxy, Booster Packy, Bundle, Collection Boxy, Tins. Žiadne plyšáky, obaly ani príslušenstvo.' },
                { q: 'Ktoré e-shopy?', a: 'Nekonečno, iHrysko, Dráčik, Smarty, Brloh, Xzone, Pompo.sk, Pompo.cz, Bambule a Knihy Dobrovský. Alza čoskoro.' },
              ].map((item, i) => (
                <div key={i} className="rounded-lg border border-border/5 transition-colors hover:bg-card/10">
                  <button className="flex w-full items-center justify-between p-3.5 text-left text-[13px] font-semibold" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {item.q}
                    <motion.div animate={{ rotate: openFaq === i ? 90 : 0 }} transition={{ duration: 0.15 }}>
                      <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/20" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <div className="border-t border-border/5 px-3.5 pb-3.5 pt-2.5 text-[13px] leading-relaxed text-muted-foreground/60">{item.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <FadeIn>
            <div className="rounded-xl border border-primary/8 bg-primary/3 p-8 text-center sm:p-12">
              <h2 className="text-xl font-extrabold sm:text-2xl">Ďalšie doskladnenie môže prísť kedykoľvek.</h2>
              <p className="mt-2 text-sm text-muted-foreground/50">Buď pripravený.</p>
              <Button size="lg" className="mt-6 h-11 gap-2 px-8 text-sm font-bold shadow-lg shadow-primary/10" render={<Link href="/register" />}>
                Začať sledovať <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </FadeIn>
        </section>
      </main>
      <Footer />
    </>
  )
}
