export interface Profile {
  id: string
  email: string
  display_name: string | null
  tier: 'free' | 'premium' | 'pro'
  notify_in_app: boolean
  notify_categories: string[]
  notify_shops: string[] | null
  created_at: string
  updated_at: string
}

export interface WatchlistItem {
  id: string
  user_id: string
  product_id: string
  notify_on_restock: boolean
  notify_on_price_drop: boolean
  target_price: number | null
  created_at: string
}
