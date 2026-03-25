import * as cheerio from 'cheerio'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { RawProduct, StockStatus } from '@/types/product'
import { BaseScraper } from './base-scraper'

export class PlayingcardshopScraper extends BaseScraper {
  constructor(
    config: { shop_id: string; shop_slug: string; base_url: string; scrape_url: string },
    supabase: SupabaseClient
  ) {
    super(config, supabase)
  }

  async fetchProducts(): Promise<RawProduct[]> {
    const products: RawProduct[] = []
    let page = 1
    const maxPages = 10

    while (page <= maxPages) {
      const url = page === 1 ? this.scrapeUrl : `${this.scrapeUrl}?p=${page}`

      try {
        const html = await this.fetchPage(url)
        const $ = cheerio.load(html)
        const items = $('[class*="product-item"], [class*="product"]').toArray()

        if (items.length === 0) break

        let found = 0
        for (const item of items) {
          try {
            const $item = $(item)
            const nameEl = $item.find('a[class*="name"], h3 a, .product-name a, .product-item-link, a.title').first()
            const name = nameEl.text().trim()
            const href = nameEl.attr('href')

            if (!name || !href) continue
            found++

            const url = href.startsWith('http') ? href : this.resolveUrl(href)
            const imageUrl = $item.find('img').attr('src') || $item.find('img').attr('data-src') || null
            const priceText = $item.find('[class*="price"]').first().text().trim()
            const price = this.parseSlovakPrice(priceText)

            const hasAddToCart = $item.find('button[class*="tocart"], .addtocart, [class*="add-to-cart"]').length > 0
            const outOfStockLabel = $item.find('[class*="out-of-stock"], [class*="unavailable"]').length > 0
            const stockText = outOfStockLabel ? 'Out of stock' : (hasAddToCart ? 'In stock' : 'Unknown')

            products.push({
              name, url,
              image_url: imageUrl,
              price,
              stock_status: outOfStockLabel ? 'out_of_stock' : (hasAddToCart ? 'in_stock' : 'unknown'),
              stock_quantity: null,
              raw_status_text: stockText,
            })
          } catch { /* skip */ }
        }

        if (found === 0) break
        page++
        await this.delay(2000 + Math.random() * 1000)
      } catch { break }
    }
    return products
  }
}
