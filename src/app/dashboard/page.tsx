'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  TrendingUp,
  Zap,
  Store,
  Package,
  ExternalLink,
  Clock,
  ArrowRight,
  Filter,
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Heart,
  Flame,
} from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants'
import type { Product, Shop } from '@/types/product'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'práve teraz'
  if (min < 60) return `pred ${min} min`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `pred ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `pred ${days}d`
}

function StatCard({ icon: Icon, value, label, color }: { icon: any; value: string; label: string; color: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border/20 bg-gradient-to-br ${color} p-5`}>
      <Icon className="absolute -right-2 -top-2 h-16 w-16 text-foreground/[0.03]" />
      <div className="relative">
        <span className="text-3xl font-extrabold tracking-tight">{value}</span>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function RestockItem({ product }: { product: Product & { shop?: any } }) {
  const categoryColor = CATEGORY_COLORS[product.category] || ''
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border/20 bg-card/30 p-3 transition-all hover:border-primary/20 hover:bg-card/60">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted/20">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-contain p-1" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center text-lg text-muted-foreground/20">?</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <h4 className="truncate text-sm font-semibold">{product.name}</h4>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{product.shop?.name}</span>
          <span className="text-border">|</span>
          <Badge variant="outline" className={`h-4 px-1.5 text-[9px] ${categoryColor}`}>
            {CATEGORY_LABELS[product.category] || product.category}
          </Badge>
          <span className="text-border">|</span>
          <span>{timeAgo(product.updated_at)}</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <span className="text-lg font-bold">{product.current_price?.toFixed(2)}<span className="text-xs text-muted-foreground">€</span></span>
      </div>
      <Button variant="ghost" size="icon" className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" render={<a href={product.url} target="_blank" rel="noopener noreferrer" />}>
        <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  )
}

function ProductCard({ product }: { product: Product & { shop?: any } }) {
  const categoryColor = CATEGORY_COLORS[product.category] || ''
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/20 bg-card/30 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_40px_-8px] hover:shadow-primary/10">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-muted/10 to-transparent">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-contain p-5 transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 25vw" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-muted-foreground/10">?</div>
          )}
          <div className="absolute left-2.5 top-2.5">
            <Badge variant="outline" className={`text-[9px] font-semibold backdrop-blur-md ${categoryColor}`}>
              {CATEGORY_LABELS[product.category] || product.category}
            </Badge>
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
          <Store className="h-2.5 w-2.5" />
          {product.shop?.name}
          <span className="ml-auto"><Clock className="mr-0.5 inline h-2.5 w-2.5" />{timeAgo(product.updated_at)}</span>
        </div>
        <Link href={`/product/${product.id}`}>
          <h3 className="mb-auto line-clamp-2 text-[13px] font-semibold leading-snug hover:text-primary">{product.name}</h3>
        </Link>
        <div className="mt-3 flex items-end justify-between border-t border-border/10 pt-3">
          <span className="text-xl font-extrabold tracking-tight">
            {product.current_price?.toFixed(2)}<span className="ml-0.5 text-xs font-normal text-muted-foreground">€</span>
          </span>
          <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px]" render={<a href={product.url} target="_blank" rel="noopener noreferrer" />}>
            <ExternalLink className="h-2.5 w-2.5" />Kúpiť
          </Button>
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
  const [shops, setShops] = useState<Shop[]>([])
  const [shopFilter, setShopFilter] = useState('all')

  // Stats
  const [inStockCount, setInStockCount] = useState(0)
  const [totalTracked, setTotalTracked] = useState(0)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams({ page: page.toString(), status: 'in_stock', sort, order: 'desc' })
    if (category !== 'all') params.set('category', category)
    if (shopFilter !== 'all') params.set('shop', shopFilter)
    if (search) params.set('search', search)

    const res = await fetch(`/api/products?${params}`)
    if (res.ok) {
      const data = await res.json()
      setProducts(data.products || [])
      setTotalPages(data.total_pages || 1)
      setTotal(data.total || 0)
      setInStockCount(data.total || 0)
    }
    setIsLoading(false)
  }, [page, category, search, sort, shopFilter])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { setPage(1) }, [category, search, sort, shopFilter])

  // Load total tracked count
  useEffect(() => {
    fetch('/api/products?limit=1&status=all').then(r => r.json()).then(d => {
      setTotalTracked(d.total || 0)
      const shopMap = new Map<string, Shop>()
      d.products?.forEach((p: Product) => { if (p.shop) shopMap.set((p.shop as Shop).id, p.shop as Shop) })
      setShops(Array.from(shopMap.values()))
    }).catch(() => {})
  }, [])

  const recentRestocks = products.slice(0, 5)
  const gridProducts = products

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-background to-background">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

          {/* Stats Row */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={Package} value={String(inStockCount)} label="Produktov skladom" color="from-emerald-500/10 to-emerald-500/5" />
            <StatCard icon={Eye} value={String(totalTracked)} label="Celkom sledovaných" color="from-blue-500/10 to-blue-500/5" />
            <StatCard icon={Store} value="8" label="Retail e-shopov" color="from-purple-500/10 to-purple-500/5" />
            <StatCard icon={RefreshCw} value="5 min" label="Interval kontroly" color="from-amber-500/10 to-amber-500/5" />
          </div>

          {/* Live Restock Feed */}
          {recentRestocks.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-primary/80">Práve skladom</h2>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground/50">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </div>
              </div>
              <div className="space-y-2">
                {recentRestocks.map((p) => (
                  <RestockItem key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
              <Input
                placeholder="Hľadať produkt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 border-border/20 bg-card/30 pl-9 text-sm"
              />
            </div>
            <Select value={category} onValueChange={(v) => setCategory(v ?? 'all')}>
              <SelectTrigger className="h-9 w-full border-border/20 bg-card/30 text-sm sm:w-44">
                <SelectValue placeholder="Kategória" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všetky kategórie</SelectItem>
                <SelectItem value="etb">Elite Trainer Box</SelectItem>
                <SelectItem value="booster_box">Booster Box</SelectItem>
                <SelectItem value="booster_pack">Booster Pack</SelectItem>
                <SelectItem value="booster_bundle">Booster Bundle</SelectItem>
                <SelectItem value="collection_box">Collection Box</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v ?? 'updated_at')}>
              <SelectTrigger className="h-9 w-full border-border/20 bg-card/30 text-sm sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated_at">Najnovšie</SelectItem>
                <SelectItem value="current_price">Najlacnejšie</SelectItem>
                <SelectItem value="name">Názov A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Grid */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/40">Všetky produkty skladom</h2>
            <span className="text-xs text-muted-foreground/40">{total} výsledkov</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-border/10 bg-card/20">
                  <div className="aspect-[4/3] bg-muted/10" />
                  <div className="space-y-2 p-4">
                    <div className="h-3 w-3/4 rounded bg-muted/10" />
                    <div className="h-3 w-1/2 rounded bg-muted/10" />
                    <div className="h-5 w-20 rounded bg-muted/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : gridProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/20 py-20">
              <Package className="mb-3 h-10 w-10 text-muted-foreground/15" />
              <h3 className="text-lg font-semibold text-muted-foreground/40">Žiadne produkty</h3>
              <p className="mt-1 text-sm text-muted-foreground/25">Skúste zmeniť filtre</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {gridProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" className="h-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="mr-1 h-3 w-3" />Späť
              </Button>
              <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" className="h-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Ďalej<ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-12 rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/5 to-transparent p-8 text-center">
            <h3 className="text-lg font-bold">Chceš vedieť o doskladnení ako prvý?</h3>
            <p className="mt-1 text-sm text-muted-foreground">Zaregistruj sa a dostaneš notifikáciu do 5 minút od doskladnenia.</p>
            <Button size="lg" className="mt-5 h-10 gap-2 px-6" render={<Link href="/register" />}>
              Registrovať sa zadarmo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
