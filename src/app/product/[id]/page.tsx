'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, Heart, TrendingUp, TrendingDown, Clock, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { Product, StockTransition } from '@/types/product'

function timeAgo(date: string) { const d = Date.now() - new Date(date).getTime(); const m = Math.floor(d/60000); if(m<60) return `${m} min`; const h = Math.floor(m/60); if(h<24) return `${h}h`; return `${Math.floor(h/24)}d` }

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [transitions, setTransitions] = useState<StockTransition[]>([])
  const [crossShop, setCrossShop] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/products/${id}`).then(r => r.json()).then(data => {
      setProduct(data.product); setTransitions(data.transitions); setCrossShop(data.cross_shop); setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [id])

  if (isLoading) return (
    <><Navbar /><main className="flex-1" style={{ background: '#080412' }}><div className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><Skeleton className="h-8 w-48 mb-8" /><div className="grid gap-8 md:grid-cols-2"><Skeleton className="aspect-square rounded-xl" /><div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-32" /></div></div></div></main></>
  )

  if (!product) return (
    <><Navbar /><main className="flex-1" style={{ background: '#080412' }}><div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6"><h1 className="font-heading text-3xl text-white">PRODUKT NENÁJDENÝ</h1><Button className="mt-4 bg-[#8b5cf6] text-white" render={<Link href="/dashboard" />}>DASHBOARD</Button></div></main></>
  )

  const shop = product.shop as any
  const isInStock = product.current_stock_status === 'in_stock'

  return (
    <>
      <Navbar />
      <main className="flex-1" style={{ background: '#080412' }}>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <Button variant="ghost" size="sm" className="mb-6 font-label text-[10px] uppercase tracking-wider text-[#64748b] hover:text-[#a78bfa]" render={<Link href="/dashboard" />}>
            <ArrowLeft className="mr-2 h-3 w-3" />SPÄŤ
          </Button>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-xl card-v">
              <div className="relative aspect-square" style={{ background: 'rgba(139,92,246,0.03)' }}>
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-contain p-8" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl" style={{ color: 'rgba(139,92,246,0.1)' }}>?</div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg px-2.5 py-1 font-label text-[9px] uppercase tracking-wider" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                  {CATEGORY_LABELS[product.category] || product.category}
                </span>
                {product.set_name && <span className="rounded-lg px-2.5 py-1 font-label text-[9px] uppercase tracking-wider card-v text-[#64748b]">{product.set_name}</span>}
              </div>

              <h1 className="text-xl font-bold text-white sm:text-2xl">{product.name}</h1>

              {shop && (
                <div className="flex items-center gap-2 font-label text-[10px] uppercase tracking-wider text-[#64748b]">
                  <Store className="h-3 w-3" />{shop.name}
                </div>
              )}

              <div className="flex items-center gap-4">
                {product.current_price != null ? (
                  <span className="font-heading text-4xl text-white">{product.current_price.toFixed(2)}€</span>
                ) : (
                  <span className="text-sm text-[#64748b]">Cena neuvedená</span>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    {isInStock && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8b5cf6] opacity-75" />}
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${isInStock ? 'bg-[#8b5cf6]' : 'bg-[#475569]'}`} />
                  </span>
                  <span className={`font-label text-[10px] uppercase tracking-wider ${isInStock ? 'text-[#a78bfa]' : 'text-[#475569]'}`}>
                    {isInStock ? 'SKLADOM' : 'VYPREDANÉ'}
                  </span>
                </div>
              </div>

              <Button className="w-full font-label text-xs uppercase tracking-wider bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-lg shadow-[#8b5cf6]/20" render={<a href={product.url} target="_blank" rel="noopener noreferrer" />}>
                <ExternalLink className="mr-2 h-3.5 w-3.5" />OTVORIŤ V {shop?.name?.toUpperCase() || 'SHOPE'}
              </Button>

              <div className="space-y-2 text-sm" style={{ borderTop: '1px solid rgba(139,92,246,0.1)', paddingTop: '1rem' }}>
                <div className="flex justify-between"><span className="text-[#64748b]">Prvýkrát videné</span><span className="text-[#94a3b8]">{new Date(product.first_seen_at).toLocaleDateString('sk-SK')}</span></div>
                <div className="flex justify-between"><span className="text-[#64748b]">Aktualizované</span><span className="text-[#94a3b8]">{timeAgo(product.updated_at)} ago</span></div>
                {product.last_in_stock_at && <div className="flex justify-between"><span className="text-[#64748b]">Naposledy skladom</span><span className="text-[#94a3b8]">{new Date(product.last_in_stock_at).toLocaleDateString('sk-SK')}</span></div>}
              </div>
            </div>
          </div>

          {transitions.length > 0 && (
            <div className="mt-8 rounded-xl p-6 card-v">
              <h2 className="mb-4 font-heading text-xl text-white">HISTÓRIA ZMIEN</h2>
              <div className="space-y-2">
                {transitions.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-lg p-3" style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.08)' }}>
                    {t.new_status === 'in_stock' ? <TrendingUp className="h-4 w-4 text-[#8b5cf6]" /> : <TrendingDown className="h-4 w-4 text-[#475569]" />}
                    <span className="flex-1 text-sm text-[#94a3b8]">
                      {t.previous_status === 'out_of_stock' && t.new_status === 'in_stock' ? 'Doskladnené' : t.new_status === 'out_of_stock' ? 'Vypredané' : `${t.previous_status} → ${t.new_status}`}
                      {t.new_price != null && <span className="ml-2 text-white">{Number(t.new_price).toFixed(2)}€</span>}
                    </span>
                    <span className="font-label text-[9px] text-[#475569]"><Clock className="mr-1 inline h-2.5 w-2.5" />{new Date(t.transitioned_at).toLocaleString('sk-SK')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {crossShop.length > 0 && (
            <div className="mt-8 rounded-xl p-6 card-v">
              <h2 className="mb-4 font-heading text-xl text-white">V INÝCH SHOPOCH</h2>
              <div className="space-y-2">
                {crossShop.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg p-3" style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.08)' }}>
                    <div className="flex items-center gap-2">
                      <Store className="h-3 w-3 text-[#64748b]" />
                      <span className="text-sm font-medium text-[#e2e8f0]">{(p.shop as any)?.name}</span>
                      <span className="text-sm text-white font-bold">{p.current_price != null ? `${Number(p.current_price).toFixed(2)}€` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-label text-[9px] uppercase ${p.current_stock_status === 'in_stock' ? 'text-[#a78bfa]' : 'text-[#475569]'}`}>
                        {p.current_stock_status === 'in_stock' ? 'SKLADOM' : 'VYPREDANÉ'}
                      </span>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[#64748b] hover:text-[#a78bfa]"><ExternalLink className="h-3 w-3" /></a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
