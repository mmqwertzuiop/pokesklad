import * as cheerio from 'cheerio'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { RawProduct, StockStatus } from '@/types/product'
import { BaseScraper } from './base-scraper'

export class XzoneScraper extends BaseScraper {
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
      const url = `${this.scrapeUrl}&page=${page}`

      try {
        const html = await this.fetchPage(url)
        const $ = cheerio.load(html)
        const items = $(
          '.product-list .product, .product-item, [class*="product-card"], .item'
        ).toArray()

        if (items.length === 0) break

        for (const item of items) {
          try {
            const $item = $(item)
            const nameEl = $item.find('a[class*="name"], h3 a, .product-name a, a.title').first()
            const name = nameEl.text().trim()
            const href = nameEl.attr('href')

            if (!name || !href) continue

            const url = this.resolveUrl(href)
            const imageUrl =
              $item.find('img').attr('src') ||
              $item.find('img').attr('data-src') ||
              null

            const priceText = $item
              .find('.price, [class*="price"]')
              .first()
              .text()
              .trim()
            const price = this.parseSlovakPrice(priceText)

            const stockText = $item
              .find(
                '[class*="avail"], [class*="stock"], .availability, .badge'
              )
              .first()
              .text()
              .trim()

            const status = this.parseStockStatus(stockText)

            products.push({
              name,
              url,
              image_url: imageUrl ? this.resolveUrl(imageUrl) : null,
              price,
              stock_status: status,
              stock_quantity: null,
              raw_status_text: stockText,
            })
          } catch {
            // Skip individual product errors
          }
        }

        page++
        await this.delay(2000 + Math.random() * 1000)
      } catch {
        break
      }
    }

    return products
  }

  private parseStockStatus(text: string): StockStatus {
    const lower = text.toLowerCase()

    if (lower.includes('skladom') || lower.includes('in stock')) {
      return 'in_stock'
    }

    if (lower.includes('pripravujeme') || lower.includes('predobjednávka')) {
      return 'preorder'
    }

    if (
      lower.includes('vypredané') ||
      lower.includes('vypredane') ||
      lower.includes('nie je skladom') ||
      lower.includes('nedostupn')
    ) {
      return 'out_of_stock'
    }

    return 'unknown'
  }
}
