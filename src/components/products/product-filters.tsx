'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { Shop } from '@/types/product'

export interface FilterState {
  category: string
  shop: string
  status: string
  search: string
  sort: string
}

export function ProductFilters({
  filters,
  shops,
  onChange,
}: {
  filters: FilterState
  shops: Shop[]
  onChange: (filters: FilterState) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Hľadať produkty..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-9 bg-card border-border/50"
          />
        </div>

        {/* Category */}
        <Select
          value={filters.category}
          onValueChange={(v) => onChange({ ...filters, category: v ?? 'all' })}
        >
          <SelectTrigger className="w-full sm:w-48 bg-card border-border/50">
            <SelectValue placeholder="Kategória" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky kategórie</SelectItem>
            {Object.entries(CATEGORY_LABELS)
              .filter(([key]) => key !== 'excluded' && key !== 'unknown')
              .map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Shop */}
        <Select
          value={filters.shop}
          onValueChange={(v) => onChange({ ...filters, shop: v ?? 'all' })}
        >
          <SelectTrigger className="w-full sm:w-44 bg-card border-border/50">
            <SelectValue placeholder="E-shop" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky shopy</SelectItem>
            {shops.map((shop) => (
              <SelectItem key={shop.id} value={shop.id}>
                {shop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(v) => onChange({ ...filters, status: v ?? 'all' })}
        >
          <SelectTrigger className="w-full sm:w-40 bg-card border-border/50">
            <SelectValue placeholder="Dostupnosť" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in_stock">Skladom</SelectItem>
            <SelectItem value="preorder">Predobjednávka</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={filters.sort}
          onValueChange={(v) => onChange({ ...filters, sort: v ?? 'updated_at' })}
        >
          <SelectTrigger className="w-full sm:w-44 bg-card border-border/50">
            <SelectValue placeholder="Zoradiť" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Naposledy aktualizované</SelectItem>
            <SelectItem value="current_price_asc">Cena: najlacnejšie</SelectItem>
            <SelectItem value="current_price_desc">Cena: najdrahšie</SelectItem>
            <SelectItem value="name">Názov A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
