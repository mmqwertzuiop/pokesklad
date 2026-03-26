'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Heart, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AvailabilityBadge } from './availability-badge'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants'
import type { Product } from '@/types/product'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Práve teraz'
  if (min < 60) return `${min} min`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export function ProductCard({
  product,
  isWatchlisted,
  onToggleWatchlist,
}: {
  product: Product & { shop?: { name: string; slug: string } }
  isWatchlisted?: boolean
  onToggleWatchlist?: (productId: string) => void
}) {
  const categoryColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.unknown
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/30 bg-card/50 transition-all duration-300 hover:border-primary/25 hover:shadow-[0_0_30px_-5px] hover:shadow-primary/10">
      {/* Image */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-muted/20 to-muted/5">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-5xl text-muted-foreground/10">?</span>
            </div>
          )}

          {/* Category pill - top left */}
          <div className="absolute left-3 top-3">
            <Badge variant="outline" className={`text-[10px] font-semibold backdrop-blur-md ${categoryColor}`}>
              {categoryLabel}
            </Badge>
          </div>

          {/* Watchlist - top right */}
          {onToggleWatchlist && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleWatchlist(product.id); }}
              className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                isWatchlisted
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-background/50 text-muted-foreground/50 hover:bg-background/70 hover:text-foreground'
              }`}
            >
              <Heart className={`h-4 w-4 ${isWatchlisted ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Shop + time */}
        <div className="mb-2 flex items-center justify-between">
          {product.shop && (
            <span className="text-[11px] font-medium text-muted-foreground/70">{product.shop.name}</span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
            <Clock className="h-2.5 w-2.5" />
            {timeAgo(product.updated_at)}
          </span>
        </div>

        {/* Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="mb-3 line-clamp-2 text-[13px] font-semibold leading-snug transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>

        {/* Spacer */}
        <div className="mt-auto" />

        {/* Price + stock */}
        <div className="mb-3 flex items-end justify-between">
          <div>
            {product.current_price != null ? (
              <span className="text-xl font-bold tracking-tight">
                {product.current_price.toFixed(2)}<span className="ml-0.5 text-sm font-medium text-muted-foreground">€</span>
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </div>
          <AvailabilityBadge
            status={product.current_stock_status}
            quantity={product.current_stock_quantity}
          />
        </div>

        {/* Buy button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs font-medium"
          render={<a href={product.url} target="_blank" rel="noopener noreferrer" />}
        >
          <ExternalLink className="h-3 w-3" />
          Kúpiť v {product.shop?.name || 'shope'}
        </Button>
      </div>
    </div>
  )
}
