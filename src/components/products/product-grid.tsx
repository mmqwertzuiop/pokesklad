'use client'

import { ProductCard } from './product-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/types/product'

export function ProductGrid({
  products,
  watchlistedIds,
  onToggleWatchlist,
  isLoading,
}: {
  products: Product[]
  watchlistedIds?: Set<string>
  onToggleWatchlist?: (productId: string) => void
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border/50 bg-card">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/50 px-4 py-16">
        <div className="text-4xl">📦</div>
        <h3 className="mt-4 text-lg font-semibold">Žiadne produkty</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Skúste zmeniť filtre alebo vyhľadávanie
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWatchlisted={watchlistedIds?.has(product.id)}
          onToggleWatchlist={onToggleWatchlist}
        />
      ))}
    </div>
  )
}
