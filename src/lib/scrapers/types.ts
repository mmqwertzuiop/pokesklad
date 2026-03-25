import type { RawProduct, ScrapeResult } from '@/types/product'

export interface ScraperConfig {
  shop_id: string
  shop_slug: string
  base_url: string
  scrape_url: string
}

export interface IScraper {
  scrape(): Promise<ScrapeResult>
  fetchProducts(): Promise<RawProduct[]>
}
