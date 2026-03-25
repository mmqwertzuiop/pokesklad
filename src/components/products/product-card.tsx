'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AvailabilityBadge } from './availability-badge'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants'
import type { Product } from '@/types/product'

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
    <Card className="group relative overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:glow-yellow">
      <CardContent className="p-0">
        {/* Image */}
        <Link href={`/product/${product.id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl text-muted-foreground/30">
                ?
              </div>
            )}

            {/* Shop badge */}
            {product.shop && (
              <div className="absolute right-2 top-2">
                <Badge variant="secondary" className="bg-background/80 text-xs backdrop-blur-sm">
                  {product.shop.name}
                </Badge>
              </div>
            )}

            {/* Category badge */}
            <div className="absolute left-2 top-2">
              <Badge variant="outline" className={`text-xs ${categoryColor}`}>
                {categoryLabel}
              </Badge>
            </div>
          </div>
        </Link>

        {/* Info */}
        <div className="space-y-3 p-4">
          <Link href={`/product/${product.id}`}>
            <h3 className="line-clamp-2 text-sm font-medium leading-snug transition-colors hover:text-primary">
              {product.name}
            </h3>
          </Link>

          {product.set_name && (
            <p className="text-xs text-muted-foreground">{product.set_name}</p>
          )}

          <div className="flex items-center justify-between">
            <div>
              {product.current_price != null ? (
                <span className="text-lg font-bold text-foreground">
                  {product.current_price.toFixed(2)} €
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Cena neuvedená</span>
              )}
            </div>
            <AvailabilityBadge
              status={product.current_stock_status}
              quantity={product.current_stock_quantity}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              render={<a href={product.url} target="_blank" rel="noopener noreferrer" />}
            >
              <ExternalLink className="mr-1.5 h-3 w-3" />
              Otvoriť v shope
            </Button>
            {onToggleWatchlist && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isWatchlisted ? 'text-red-400' : 'text-muted-foreground'}`}
                onClick={() => onToggleWatchlist(product.id)}
              >
                {isWatchlisted ? (
                  <Heart className="h-4 w-4 fill-current" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          {/* Last checked */}
          <p className="text-[10px] text-muted-foreground/50">
            Aktualizované: {new Date(product.updated_at).toLocaleString('sk-SK')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
