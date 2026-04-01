'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Heart, Store, Clock, ExternalLink, Package, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@/types/product'

function timeAgo(date: string) { const d = Date.now() - new Date(date).getTime(); const m = Math.floor(d/60000); if(m<60) return `${m}m`; const h = Math.floor(m/60); if(h<24) return `${h}h`; return `${Math.floor(h/24)}d` }

export default function WatchlistPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchWatchlist()
  }, [])

  function fetchWatchlist() {
    fetch('/api/watchlist').then(r => r.json()).then(data => {
      setProducts(data.watchlist?.map((w: any) => w.product).filter(Boolean) || [])
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }

  async function handleRemove(productId: string) {
    if (!window.confirm('Odstranit z watchlistu?')) return
    try {
      await fetch(`/api/watchlist/${productId}`, { method: 'DELETE' })
      setProducts(prev => prev.filter(p => p.id !== productId))
      toast('Odstranene zo sledovanych')
    } catch {
      toast('Chyba pri odstraneni')
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1" style={{ background: '#080412' }}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-8 flex items-center gap-3">
            <Heart className="h-5 w-5 text-[#8b5cf6]" />
            <h1 className="font-heading text-3xl text-white">SLEDOVANE ({products.length})</h1>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl card-v"><div className="aspect-[4/3]" style={{ background: 'rgba(139,92,246,0.03)' }} /><div className="p-3 space-y-2"><div className="h-3 w-3/4 rounded" style={{ background: 'rgba(139,92,246,0.06)' }} /></div></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl py-20 card-v">
              <Heart className="mb-3 h-8 w-8" style={{ color: 'rgba(139,92,246,0.15)' }} />
              <h3 className="font-heading text-xl text-[#64748b]">WATCHLIST JE PRAZDNY</h3>
              <p className="mt-1 text-xs text-[#475569]">Pridaj produkty z dashboardu</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <div key={p.id} className="group relative overflow-hidden rounded-xl card-v card-v-hover transition-all">
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#080412]/80 text-[#64748b] opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="relative aspect-[4/3] overflow-hidden" style={{ background: 'rgba(139,92,246,0.03)' }}>
                    {p.image_url && <Image src={p.image_url} alt={p.name} fill className="object-contain p-4" sizes="25vw" unoptimized />}
                  </div>
                  <div className="p-3">
                    <div className="mb-1 font-label text-[8px] uppercase tracking-wider text-[#64748b]"><Store className="mr-1 inline h-2 w-2" />{(p.shop as any)?.name}</div>
                    <Link href={`/product/${p.id}`}>
                      <h3 className="line-clamp-2 text-[11px] font-semibold text-[#e2e8f0] hover:text-[#a78bfa]">{p.name}</h3>
                    </Link>
                    <div className="mt-2 flex items-end justify-between">
                      <span className="text-lg font-black text-white">{p.current_price?.toFixed(2)}<span className="text-[9px] text-[#64748b]">€</span></span>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-label text-[8px] uppercase text-[#a78bfa] hover:underline">KUPIT</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
