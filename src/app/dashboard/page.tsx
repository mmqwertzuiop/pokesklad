'use client'

import { useState, useEffect, useCallback } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductFilters, type FilterState } from '@/components/products/product-filters'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product, Shop } from '@/types/product'

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [watchlistedIds, setWatchlistedIds] = useState<Set<string>>(new Set())

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    shop: 'all',
    status: 'all',
    search: '',
    sort: 'updated_at',
  })

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    params.set('page', page.toString())
    if (filters.category !== 'all') params.set('category', filters.category)
    if (filters.shop !== 'all') params.set('shop', filters.shop)
    if (filters.status !== 'all') params.set('status', filters.status)
    if (filters.search) params.set('search', filters.search)

    if (filters.sort.includes('_asc')) {
      params.set('sort', filters.sort.replace('_asc', ''))
      params.set('order', 'asc')
    } else if (filters.sort.includes('_desc')) {
      params.set('sort', filters.sort.replace('_desc', ''))
      params.set('order', 'desc')
    } else {
      params.set('sort', filters.sort)
    }

    try {
      const res = await fetch(`/api/products?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
        setTotalPages(data.total_pages || 1)
        setTotal(data.total || 0)
      }
    } catch {
      // Failed to fetch
    }
    setIsLoading(false)
  }, [page, filters])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Debounce search
  useEffect(() => {
    setPage(1)
  }, [filters])

  // Load shops for filter
  useEffect(() => {
    async function loadShops() {
      try {
        const res = await fetch('/api/products?limit=1')
        if (res.ok) {
          const data = await res.json()
          // Extract unique shops from products
          const shopMap = new Map<string, Shop>()
          data.products?.forEach((p: Product) => {
            if (p.shop) shopMap.set(p.shop.id, p.shop as Shop)
          })
          setShops(Array.from(shopMap.values()))
        }
      } catch {
        // ignore
      }
    }
    loadShops()
  }, [])

  function handleToggleWatchlist(productId: string) {
    setWatchlistedIds((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
        fetch(`/api/watchlist/${productId}`, { method: 'DELETE' })
      } else {
        next.add(productId)
        fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId }),
        })
      }
      return next
    })
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold sm:text-3xl">
              <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              {total} produktov sledovaných na {shops.length || 4} e-shopoch
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <ProductFilters
              filters={filters}
              shops={shops}
              onChange={setFilters}
            />
          </div>

          {/* Products Grid */}
          <ProductGrid
            products={products}
            watchlistedIds={watchlistedIds}
            onToggleWatchlist={handleToggleWatchlist}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Predchádzajúca
              </Button>
              <span className="text-sm text-muted-foreground">
                Strana {page} z {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Ďalšia
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
