'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ProductGrid } from '@/components/products/product-grid'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart } from 'lucide-react'
import type { Product } from '@/types/product'

export default function WatchlistPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [watchlistedIds, setWatchlistedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/watchlist')
      if (res.ok) {
        const data = await res.json()
        const prods = data.watchlist?.map((w: any) => w.product).filter(Boolean) || []
        setProducts(prods)
        setWatchlistedIds(new Set(prods.map((p: Product) => p.id)))
      }
      setIsLoading(false)
    }
    load()
  }, [])

  function handleToggleWatchlist(productId: string) {
    setWatchlistedIds((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
        setProducts((p) => p.filter((prod) => prod.id !== productId))
        fetch(`/api/watchlist/${productId}`, { method: 'DELETE' })
      }
      return next
    })
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="mb-8">
            <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
              <Heart className="h-7 w-7 text-red-400" />
              <span className="text-gradient">Watchlist</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              Tvoje sledované produkty
            </p>
          </div>

          <ProductGrid
            products={products}
            watchlistedIds={watchlistedIds}
            onToggleWatchlist={handleToggleWatchlist}
            isLoading={isLoading}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
