'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  TrendingDown,
  TrendingUp,
  Clock,
  Store,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AvailabilityBadge } from '@/components/products/availability-badge'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants'
import type { Product, AvailabilityCheck, StockTransition } from '@/types/product'

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [history, setHistory] = useState<AvailabilityCheck[]>([])
  const [transitions, setTransitions] = useState<StockTransition[]>([])
  const [crossShop, setCrossShop] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/products/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data.product)
        setHistory(data.history)
        setTransitions(data.transitions)
        setCrossShop(data.cross_shop)
      }
      setIsLoading(false)
    }
    load()
  }, [id])

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <Skeleton className="mb-8 h-8 w-48" />
            <div className="grid gap-8 md:grid-cols-2">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
            <h1 className="text-2xl font-bold">Produkt nenájdený</h1>
            <Button className="mt-4" render={<Link href="/dashboard" />}>
              Späť na dashboard
            </Button>
          </div>
        </main>
      </>
    )
  }

  const shop = product.shop as any
  const categoryColor = CATEGORY_COLORS[product.category] || ''
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          {/* Back */}
          <Button variant="ghost" size="sm" className="mb-6" render={<Link href="/dashboard" />}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Späť na dashboard
          </Button>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Image */}
            <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
              <div className="relative aspect-square">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain p-8"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl text-muted-foreground/20">
                    ?
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className={categoryColor}>
                    {categoryLabel}
                  </Badge>
                  {product.set_name && (
                    <Badge variant="secondary">{product.set_name}</Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold">{product.name}</h1>
                {shop && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="h-4 w-4" />
                    {shop.name}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {product.current_price != null ? (
                  <span className="text-3xl font-bold">
                    {product.current_price.toFixed(2)} €
                  </span>
                ) : (
                  <span className="text-lg text-muted-foreground">Cena neuvedená</span>
                )}
                <AvailabilityBadge
                  status={product.current_stock_status}
                  quantity={product.current_stock_quantity}
                />
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" render={<a href={product.url} target="_blank" rel="noopener noreferrer" />}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Otvoriť v shope
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prvýkrát videné</span>
                  <span>{new Date(product.first_seen_at).toLocaleDateString('sk-SK')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Naposledy aktualizované</span>
                  <span>{new Date(product.updated_at).toLocaleString('sk-SK')}</span>
                </div>
                {product.last_in_stock_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Naposledy skladom</span>
                    <span>{new Date(product.last_in_stock_at).toLocaleString('sk-SK')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stock Transitions */}
          {transitions.length > 0 && (
            <Card className="mt-8 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">História zmien dostupnosti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transitions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/20 px-4 py-3"
                    >
                      {t.new_status === 'in_stock' ? (
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                      <div className="flex-1">
                        <span className="text-sm">
                          {t.previous_status === 'out_of_stock' && t.new_status === 'in_stock'
                            ? 'Doskladnené'
                            : t.new_status === 'out_of_stock'
                            ? 'Vypredané'
                            : `${t.previous_status} → ${t.new_status}`}
                        </span>
                        {t.new_price != null && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            za {Number(t.new_price).toFixed(2)} €
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {new Date(t.transitioned_at).toLocaleString('sk-SK')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cross-shop */}
          {crossShop.length > 0 && (
            <Card className="mt-8 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Rovnaký produkt v iných shopoch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {crossShop.map((p) => {
                    const pShop = p.shop as any
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{pShop?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.current_price != null
                                ? `${Number(p.current_price).toFixed(2)} €`
                                : 'Cena neuvedená'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <AvailabilityBadge status={p.current_stock_status} />
                          <Button variant="ghost" size="sm" render={<a href={p.url} target="_blank" rel="noopener noreferrer" />}>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
