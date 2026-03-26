'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ArrowRight, Bell, ChevronRight, Check, X, ExternalLink, Store, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import type { Product } from '@/types/product'

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }} className={className}>{children}</motion.div>
}

function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="particle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 6}s`, animationDuration: `${4 + Math.random() * 4}s` }} />
      ))}
    </div>
  )
}

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => { if (!inView) return; let s = 0; const step = Math.ceil(target / 35); const t = setInterval(() => { s += step; if (s >= target) { setVal(target); clearInterval(t) } else setVal(s) }, 25); return () => clearInterval(t) }, [inView, target])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

function timeAgo(date: string) { const d = Date.now() - new Date(date).getTime(); const m = Math.floor(d/60000); if(m<60) return `${m}m`; const h = Math.floor(m/60); if(h<24) return `${h}h`; return `${Math.floor(h/24)}d` }

const COMPARISONS = [
  { name: 'Prismatic Evolutions ETB', retail: 49.99, resell: 199 },
  { name: 'Pokémon 151 ETB', retail: 49.99, resell: 389 },
  { name: 'Ascended Heroes ETB', retail: 59.99, resell: 139 },
  { name: 'Perfect Order ETB', retail: 59.99, resell: 99 },
]

const FAQ = [
  { q: 'Ako rýchlo dostanem notifikáciu?', a: 'Premium: do 5 minút od doskladnenia. Free: dashboard s 30 min oneskorením.' },
  { q: 'Ktoré e-shopy sledujete?', a: 'Alza, Nekonečno, iHrysko, Dráčik, Smarty, Brloh, Xzone, Pompo.sk, Pompo.cz, Bambule a Knihy Dobrovský.' },
  { q: 'Prečo len retail?', a: 'Retail shopy predávajú za MSRP. Reselleri navyšujú 2-3x. My sledujeme len retail.' },
  { q: 'Čo sledujete?', a: 'Sealed TCG: ETB, Booster Boxy, Packy, Bundle, Collection Boxy, Tins.' },
]

export default function LandingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/products?status=in_stock&limit=8&sort=updated_at&order=desc')
      .then(r => r.json()).then(d => { setProducts(d.products || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* HERO */}
        <section className="relative overflow-hidden bg-glow">
          <Particles />
          <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-16 sm:px-6 sm:pt-24">
            <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-label text-[10px] uppercase tracking-wider card-v" style={{ color: '#22c55e' }}>
                <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" /></span>
                MONITORING 11 E-SHOPOV
              </div>

              <h1 className="font-heading text-5xl text-white sm:text-6xl lg:text-7xl">
                KÚP ZA{' '}
                <span className="price-green">RETAIL</span>
                <br />
                NIE ZA{' '}
                <span className="price-red line-through decoration-2">RESELL</span>
              </h1>

              <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-[#94a3b8]">
                Kontrolujeme 11 slovenských a českých e-shopov každých 5 minút.
                Keď sa vypredaný produkt objaví skladom, dostaneš notifikáciu.
              </p>

              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" className="h-12 gap-2 px-8 font-label text-xs uppercase tracking-wider bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-lg shadow-[#8b5cf6]/20" render={<Link href="/register" />}>
                  <Bell className="h-3.5 w-3.5" /> CHCEM NOTIFIKÁCIE
                </Button>
                <Button size="lg" variant="outline" className="h-12 gap-2 px-6 font-label text-xs uppercase tracking-wider text-[#a78bfa] hover:text-white" style={{ borderColor: 'rgba(139,92,246,0.25)' }} render={<Link href="/dashboard" />}>
                  POZRIEŤ DASHBOARD <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* LIVE PRODUCTS */}
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" /></span>
              <span className="font-label text-[10px] uppercase tracking-wider text-[#22c55e]">PRÁVE SKLADOM</span>
            </div>
            <Link href="/dashboard" className="flex items-center gap-1 font-label text-[10px] uppercase tracking-wider text-[#64748b] hover:text-[#a78bfa]">
              VŠETKY <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl card-v"><div className="aspect-[4/3]" style={{ background: 'rgba(139,92,246,0.04)' }} /><div className="p-3 space-y-2"><div className="h-3 w-3/4 rounded" style={{ background: 'rgba(139,92,246,0.06)' }} /><div className="h-4 w-16 rounded" style={{ background: 'rgba(139,92,246,0.06)' }} /></div></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {products.slice(0, 8).map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.05}>
                  <div className="group overflow-hidden rounded-xl card-v card-v-hover transition-all duration-300">
                    <div className="relative aspect-[4/3] overflow-hidden" style={{ background: 'rgba(139,92,246,0.03)' }}>
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" sizes="25vw" unoptimized />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl text-[#8b5cf6]/10">?</div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="mb-1 flex items-center gap-1 font-label text-[8px] uppercase tracking-wider text-[#64748b]">
                        <Store className="h-2 w-2" />{(p.shop as any)?.name}
                      </div>
                      <h3 className="line-clamp-2 text-[11px] font-semibold leading-snug text-[#e2e8f0]">{p.name}</h3>
                      <div className="mt-2 flex items-end justify-between">
                        <span className="text-lg font-black tabular-nums price-green">{p.current_price?.toFixed(2)}<span className="text-[9px] font-normal text-[#64748b]">€</span></span>
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-md px-2 py-1 font-label text-[8px] uppercase tracking-wider text-[#a78bfa] transition-colors hover:bg-[rgba(139,92,246,0.15)]">
                          KÚPIŤ <ExternalLink className="h-2 w-2" />
                        </a>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </section>

        {/* PRICE COMPARISON */}
        <section style={{ borderTop: '1px solid rgba(139,92,246,0.08)', borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <FadeIn>
              <p className="mb-2 text-center font-label text-[10px] uppercase tracking-[0.2em] text-[#8b5cf6]">PREČO TO POTREBUJEŠ</p>
              <h2 className="font-heading text-center text-3xl text-white sm:text-4xl text-glow">KOĽKO SI UŽ PREPLATIL?</h2>
            </FadeIn>

            <div className="mt-10 space-y-2">
              {COMPARISONS.map((p, i) => (
                <FadeIn key={p.name} delay={i * 0.06}>
                  <div className="flex items-center gap-3 rounded-lg px-4 py-3 card-v card-v-hover transition-all">
                    <div className="min-w-0 flex-1 text-sm font-semibold text-[#e2e8f0]">{p.name}</div>
                    <div className="flex items-center gap-3 shrink-0 tabular-nums">
                      <div className="text-right"><div className="font-label text-[8px] uppercase tracking-wider text-[#64748b]">RETAIL</div><div className="text-base font-black price-green">{p.retail}€</div></div>
                      <span className="text-[#8b5cf6]/20">→</span>
                      <div className="text-right"><div className="font-label text-[8px] uppercase tracking-wider text-[#64748b]">RESELL</div><div className="text-base font-black price-red line-through">{p.resell}€</div></div>
                      <span className="hidden rounded-md px-2 py-1 font-label text-[10px] font-bold sm:inline price-green" style={{ background: 'rgba(34,197,94,0.1)' }}>
                        -{Math.round(p.resell - p.retail)}€
                      </span>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.3}>
              <div className="mt-6 rounded-lg p-5 text-center" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <span className="font-label text-[10px] uppercase tracking-wider text-[#64748b]">CELKOVÁ ÚSPORA</span>
                <span className="ml-3 font-heading text-3xl price-green"><Counter target={606} />€</span>
                <span className="ml-3 font-label text-[10px] text-[#64748b]">= {Math.round(606 / 4.99)} MESIACOV PREMIUM</span>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="relative bg-glow-bottom">
          <Particles />
          <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <FadeIn>
              <p className="mb-2 text-center font-label text-[10px] uppercase tracking-[0.2em] text-[#8b5cf6]">RÝCHLOSŤ ROZHODUJE</p>
              <h2 className="font-heading text-center text-3xl text-white sm:text-4xl text-glow">23 MINÚT. TOĽKO MÁŠ ČAS.</h2>
            </FadeIn>
            <div className="relative mt-12">
              <div className="absolute left-7 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, rgba(34,197,94,0.3), rgba(139,92,246,0.3), rgba(239,68,68,0.3))' }} />
              {[
                { time: '14:02', text: 'E-shop doskladní produkt za retail cenu', c: 'rgba(34,197,94,0.08)', bc: 'rgba(34,197,94,0.2)', tc: '#22c55e' },
                { time: '14:04', text: 'MMpokebot pošle notifikáciu', c: 'rgba(139,92,246,0.08)', bc: 'rgba(139,92,246,0.2)', tc: '#a78bfa', ring: true },
                { time: '14:25', text: 'Vypredané. Resell: 2-3x viac.', c: 'rgba(239,68,68,0.06)', bc: 'rgba(239,68,68,0.15)', tc: '#ef4444' },
              ].map((t, i) => (
                <FadeIn key={i} delay={i * 0.12}>
                  <div className="relative flex gap-4 pb-4">
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={{ background: t.c, border: `1px solid ${t.bc}` }}>
                      <span className="font-label text-[10px] font-bold" style={{ color: t.tc }}>{t.time}</span>
                    </div>
                    <div className="flex flex-1 items-center rounded-lg px-4 py-3" style={{ background: t.c, border: `1px solid ${t.bc}`, boxShadow: t.ring ? '0 0 20px rgba(139,92,246,0.1)' : 'none' }}>
                      <p className="text-sm font-medium" style={{ color: t.tc }}>{t.text}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* SHOPS */}
        <section style={{ borderTop: '1px solid rgba(139,92,246,0.08)', borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 text-center">
            <p className="mb-4 font-label text-[9px] uppercase tracking-[0.25em] text-[#475569]">11 RETAIL E-SHOPOV</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {['Alza', 'Nekonečno', 'iHrysko', 'Dráčik', 'Smarty', 'Brloh', 'Xzone', 'Pompo.sk', 'Pompo.cz', 'Bambule', 'Knihy Dobrovský'].map(s => (
                <span key={s} className="rounded-full px-3 py-1 font-label text-[10px] text-[#64748b] card-v transition-colors hover:text-[#a78bfa]">{s}</span>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <FadeIn>
            <p className="mb-2 text-center font-label text-[10px] uppercase tracking-[0.2em] text-[#8b5cf6]">CENNÍK</p>
            <h2 className="font-heading text-center text-3xl text-white sm:text-4xl text-glow">JEDEN RESTOCK A MÁŠ TO SPÄŤ</h2>
          </FadeIn>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <FadeIn>
              <div className="h-full rounded-xl p-6 card-v">
                <h3 className="font-heading text-2xl text-white">FREE</h3>
                <p className="mb-4 font-label text-[10px] text-[#64748b]">PRE ZVEDAVÝCH</p>
                <div className="mb-5 font-heading text-4xl text-white">0€</div>
                <ul className="space-y-2 text-[13px]">
                  {['Dashboard – čo je skladom', 'Filtrovanie podľa kategórie'].map(f => <li key={f} className="flex items-start gap-2 text-[#94a3b8]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#475569]" />{f}</li>)}
                  {['Notifikácie', 'Watchlist', '5 min kontrola'].map(f => <li key={f} className="flex items-start gap-2 text-[#334155]"><X className="mt-0.5 h-3.5 w-3.5 shrink-0" />{f}</li>)}
                </ul>
                <Button variant="outline" className="mt-6 w-full font-label text-[10px] uppercase tracking-wider text-[#a78bfa]" style={{ borderColor: 'rgba(139,92,246,0.2)' }} render={<Link href="/register" />}>ZAČAŤ ZADARMO</Button>
              </div>
            </FadeIn>
            <FadeIn delay={0.08}>
              <div className="relative h-full rounded-xl p-6 glow-v" style={{ background: 'linear-gradient(to bottom, rgba(139,92,246,0.12), rgba(139,92,246,0.04))', border: '1px solid rgba(139,92,246,0.25)' }}>
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#8b5cf6] px-3 py-0.5 font-label text-[9px] font-bold text-white">ODPORÚČANÉ</div>
                <h3 className="font-heading text-2xl text-white">PREMIUM</h3>
                <p className="mb-4 font-label text-[10px] text-[#64748b]">PRE ZBERATEĽOV</p>
                <div className="mb-5"><span className="font-heading text-4xl text-white">4.99€</span><span className="text-xs text-[#64748b]">/mesiac</span></div>
                <ul className="space-y-2 text-[13px]">
                  {['Notifikácie do 5 min', 'Kontrola každých 5 minút', 'Neobmedzený watchlist', 'Cenová história'].map(f => <li key={f} className="flex items-start gap-2 text-[#e2e8f0]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8b5cf6]" />{f}</li>)}
                </ul>
                <Button className="mt-6 w-full font-label text-[10px] uppercase tracking-wider bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-lg shadow-[#8b5cf6]/20" render={<Link href="/register" />}>
                  ZÍSKAŤ PREMIUM <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ borderTop: '1px solid rgba(139,92,246,0.08)' }}>
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
            <FadeIn><h2 className="mb-8 text-center font-heading text-3xl text-white">OTÁZKY</h2></FadeIn>
            <div className="space-y-1">
              {FAQ.map((item, i) => (
                <FadeIn key={i} delay={i * 0.04}>
                  <div className="rounded-lg card-v transition-colors hover:bg-[rgba(139,92,246,0.1)]">
                    <button className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-[#e2e8f0]" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      {item.q}
                      <motion.div animate={{ rotate: openFaq === i ? 90 : 0 }} transition={{ duration: 0.15 }}>
                        <ChevronRight className="h-3 w-3 text-[#64748b]" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                          <div className="px-4 pb-4 pt-1 text-sm text-[#94a3b8]" style={{ borderTop: '1px solid rgba(139,92,246,0.08)' }}>{item.a}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <FadeIn>
            <div className="relative overflow-hidden rounded-xl p-10 text-center sm:p-14" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <Particles />
              <div className="relative">
                <h2 className="font-heading text-3xl text-white sm:text-4xl text-glow">ĎALŠIE DOSKLADNENIE PRÍDE.</h2>
                <p className="mt-2 text-sm text-[#94a3b8]">Otázka je, či sa to dozvieš včas.</p>
                <Button size="lg" className="mt-7 h-12 gap-2 px-8 font-label text-xs uppercase tracking-wider bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-lg shadow-[#8b5cf6]/20" render={<Link href="/register" />}>
                  ZAČAŤ SLEDOVAŤ <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </FadeIn>
        </section>
      </main>
      <Footer />
    </>
  )
}
