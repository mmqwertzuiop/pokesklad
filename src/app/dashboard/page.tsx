'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Store, Package, ExternalLink, Clock, ArrowRight, Search,
  ChevronLeft, ChevronRight, Zap, Eye, RefreshCw, Bell,
} from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types/product'

function timeAgo(date: string) {
  const d = Date.now() - new Date(date).getTime()
  const m = Math.floor(d / 60000)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function secondsAgo(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / 1000)
}

function ProductCard({ product: p }: { product: Product }) {
  return (
    <div className="group overflow-hidden rounded-xl transition-all duration-300 card-v card-v-hover">
      <Link href={`/product/${p.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden" style={{ background: 'rgba(139,92,246,0.03)' }}>
          {p.image_url ? (
            <Image src={p.image_url} alt={p.name} fill className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" sizes="25vw" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl" style={{ color: 'rgba(139,92,246,0.1)' }}>?</div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <div className="mb-1 flex items-center gap-1 font-label text-[8px] uppercase tracking-wider text-[#64748b]">
          <Store className="h-2 w-2" />{(p.shop as any)?.name}
          <span className="ml-auto"><Clock className="mr-0.5 inline h-2 w-2" />{timeAgo(p.updated_at)}</span>
        </div>
        <Link href={`/product/${p.id}`}>
          <h3 className="line-clamp-2 text-[11px] font-semibold leading-snug text-[#e2e8f0] hover:text-[#a78bfa]">{p.name}</h3>
        </Link>
        <div className="mt-2 flex items-end justify-between">
          <span className="text-lg font-black tabular-nums text-white">{p.current_price?.toFixed(2)}<span className="text-[9px] font-normal text-[#64748b]">€</span></span>
          <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-md px-2 py-1 font-label text-[8px] uppercase tracking-wider text-[#a78bfa] transition-colors hover:bg-[rgba(139,92,246,0.15)]">
            KUPIT <ExternalLink className="h-2 w-2" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('updated_at')
  const [totalTracked, setTotalTracked] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [lastUpdateLabel, setLastUpdateLabel] = useState('Aktualizovane prave teraz')

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams({ page: page.toString(), status: 'in_stock', sort, order: sort === 'current_price' ? 'asc' : 'desc' })
    if (category !== 'all') params.set('category', category)
    if (search) params.set('search', search)
    const res = await fetch(`/api/products?${params}`)
    if (res.ok) {
      const data = await res.json()
      setProducts(data.products || [])
      setTotalPages(data.total_pages || 1)
      setTotal(data.total || 0)
      setLastUpdate(new Date())
    }
    setIsLoading(false)
  }, [page, category, search, sort])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { setPage(1) }, [category, search, sort])
  useEffect(() => {
    fetch('/api/products?limit=1&status=all').then(r => r.json()).then(d => setTotalTracked(d.total || 0)).catch(() => {})
  }, [])

  // Supabase realtime subscription for product changes
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, () => {
        fetchProducts()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, () => {
        fetchProducts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProducts])

  // Update the "last update" label every 30 seconds
  useEffect(() => {
    function updateLabel() {
      const secs = secondsAgo(lastUpdate)
      if (secs < 10) {
        setLastUpdateLabel('Aktualizovane prave teraz')
      } else if (secs < 60) {
        setLastUpdateLabel(`Aktualizovane pred ${secs} s`)
      } else {
        const mins = Math.floor(secs / 60)
        setLastUpdateLabel(`Aktualizovane pred ${mins} min`)
      }
    }
    updateLabel()
    const interval = setInterval(updateLabel, 30000)
    return () => clearInterval(interval)
  }, [lastUpdate])

  return (
    <>
      <Navbar />
      <main className="flex-1" style={{ background: '#080412' }}>
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Package, val: total, label: 'SKLADOM' },
              { icon: Eye, val: totalTracked, label: 'SLEDOVANYCH' },
              { icon: Store, val: 11, label: 'E-SHOPOV' },
              { icon: RefreshCw, val: '5min', label: 'INTERVAL' },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="rounded-xl p-4 card-v">
                  <Icon className="mb-1 h-3.5 w-3.5 text-[#8b5cf6]/40" />
                  <div className="text-xl font-black text-white">{s.val}</div>
                  <div className="font-label text-[8px] uppercase tracking-wider text-[#64748b]">{s.label}</div>
                </div>
              )
            })}
          </div>

          {/* Filters */}
          <div className="mb-5 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748b]" />
              <Input placeholder="Hladat produkt..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 text-sm" style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.15)', color: '#e2e8f0' }} />
            </div>
            <Select value={category} onValueChange={(v) => setCategory(v ?? 'all')}>
              <SelectTrigger className="h-9 w-full text-xs sm:w-40" style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.15)', color: '#e2e8f0' }}>
                <SelectValue placeholder="Kategoria" />
              </SelectTrigger>
              <SelectContent><SelectItem value="all">Vsetky</SelectItem><SelectItem value="etb">ETB</SelectItem><SelectItem value="booster_box">Booster Box</SelectItem><SelectItem value="booster_pack">Booster Pack</SelectItem><SelectItem value="booster_bundle">Booster Bundle</SelectItem><SelectItem value="collection_box">Collection Box</SelectItem></SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v ?? 'updated_at')}>
              <SelectTrigger className="h-9 w-full text-xs sm:w-36" style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.15)', color: '#e2e8f0' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent><SelectItem value="updated_at">Najnovsie</SelectItem><SelectItem value="current_price">Najlacnejsie</SelectItem><SelectItem value="name">Nazov</SelectItem></SelectContent>
            </Select>
          </div>

          {/* Products */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8b5cf6] opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" /></span>
              <span className="font-label text-[9px] uppercase tracking-wider text-[#a78bfa]">PRAVE SKLADOM</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-label text-[9px] text-[#475569]">{lastUpdateLabel}</span>
              <span className="font-label text-[9px] text-[#475569]">{total} VYSLEDKOV</span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl card-v"><div className="aspect-[4/3]" style={{ background: 'rgba(139,92,246,0.03)' }} /><div className="p-3 space-y-2"><div className="h-3 w-3/4 rounded" style={{ background: 'rgba(139,92,246,0.06)' }} /><div className="h-4 w-16 rounded" style={{ background: 'rgba(139,92,246,0.06)' }} /></div></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl py-20 card-v">
              <Package className="mb-3 h-8 w-8" style={{ color: 'rgba(139,92,246,0.15)' }} />
              <h3 className="font-heading text-xl text-[#64748b]">ZIADNE PRODUKTY</h3>
              <p className="mt-1 text-xs text-[#475569]">Skuste zmenit filtre</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" className="h-8 font-label text-[10px] text-[#a78bfa]" style={{ borderColor: 'rgba(139,92,246,0.2)' }} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="mr-1 h-3 w-3" />SPAT
              </Button>
              <span className="font-label text-[10px] text-[#475569]">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" className="h-8 font-label text-[10px] text-[#a78bfa]" style={{ borderColor: 'rgba(139,92,246,0.2)' }} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                DALEJ<ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 rounded-xl p-6 text-center card-v">
            <h3 className="font-heading text-xl text-white">CHCES VEDIET O DOSKLADNENI AKO PRVY?</h3>
            <p className="mt-1 text-xs text-[#64748b]">Zaregistruj sa a dostanes notifikaciu do 5 minut.</p>
            <Button className="mt-4 font-label text-[10px] uppercase tracking-wider bg-[#8b5cf6] hover:bg-[#7c3aed] text-white" render={<Link href="/register" />}>
              REGISTROVAT SA <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
