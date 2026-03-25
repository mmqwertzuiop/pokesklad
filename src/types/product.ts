export type StockStatus = 'in_stock' | 'out_of_stock' | 'preorder' | 'unknown'

export type ProductCategory =
  | 'etb'
  | 'booster_box'
  | 'booster_pack'
  | 'booster_bundle'
  | 'collection_box'
  | 'unknown'
  | 'excluded'

export interface Shop {
  id: string
  name: string
  slug: string
  base_url: string
  scrape_url: string
  is_active: boolean
  scraper_type: 'html' | 'dataLayer' | 'api'
  last_scrape_at: string | null
  last_scrape_status: string | null
  created_at: string
}

export interface Product {
  id: string
  shop_id: string
  external_id: string | null
  name: string
  normalized_name: string | null
  url: string
  image_url: string | null
  category: ProductCategory
  set_name: string | null
  current_price: number | null
  current_stock_status: StockStatus
  current_stock_quantity: number | null
  first_seen_at: string
  last_seen_at: string
  last_in_stock_at: string | null
  is_tracked: boolean
  created_at: string
  updated_at: string
  shop?: Shop
}

export interface AvailabilityCheck {
  id: string
  product_id: string
  stock_status: StockStatus
  stock_quantity: number | null
  price: number | null
  raw_status_text: string | null
  checked_at: string
}

export interface StockTransition {
  id: string
  product_id: string
  previous_status: StockStatus
  new_status: StockStatus
  previous_price: number | null
  new_price: number | null
  transitioned_at: string
  notification_sent: boolean
  product?: Product
}

export interface RawProduct {
  name: string
  url: string
  image_url: string | null
  price: number | null
  stock_status: StockStatus
  stock_quantity: number | null
  raw_status_text: string
  external_id?: string
}

export interface ScrapeResult {
  shop_slug: string
  products_found: number
  products_updated: number
  new_restocks: number
  errors: string[]
  duration_ms: number
}
