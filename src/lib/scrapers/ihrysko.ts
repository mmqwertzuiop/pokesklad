import * as cheerio from 'cheerio'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { RawProduct, StockStatus } from '@/types/product'
import { BaseScraper } from './base-scraper'

export class IhryskoScraper extends BaseScraper {
  constructor(
    config: { shop_id: string; shop_slug: string; base_url: string; scrape_url: string },
    supabase: SupabaseClient
  ) {
    super(config, supabase)
  }

  async fetchProducts(): Promise<RawProduct[]> {
    const products: RawProduct[] = []
    let page = 1
    const maxPages = 20

    while (page <= maxPages) {
      const url = `${this.scrapeUrl}&page=${page}`

      try {
        const html = await this.fetchPage(url)
        const $ = cheerio.load(html)
        const items = $(
          '.product-list .product, .product-item, [class*="listing"] > div, .product-card'
        ).toArray()

        if (items.length === 0) break

        for (const item of items) {
          try {
            const $item = $(item)
            const nameEl = $item
              .find('a[class*="name"], h3 a, .product-name a, a.title, h2 a')
              .first()
            const name = nameEl.text().trim()
            const href = nameEl.attr('href')

            if (!name || !href) continue

            const url = this.resolveUrl(href)
            const imageUrl =
              $item.find('img').attr('src') ||
              $item.find('img').attr('data-src') ||
              $item.find('img').attr('data-lazy') ||
              null

            const priceText = $item
              .find('.price, [class*="price"]')
              .first()
              .text()
              .trim()
            const price = this.parseSlovakPrice(priceText)

            const stockText = $item
              .find(
                '[class*="avail"], [class*="stock"], .availability, [class*="dostupn"]'
              )
              .first()
              .text()
              .trim()

            const { status, quantity } = this.parseStockStatus(stockText)

            products.push({
              name,
              url,
              image_url: imageUrl ? this.resolveUrl(imageUrl) : null,
              price,
              stock_status: status,
              stock_quantity: quantity,
              raw_status_text: stockText,
            })
          } catch {
            // Skip individual product errors
          }
        }

        page++
        // Batch 5 pages then longer delay
        if (page % 5 === 0) {
          await this.delay(3000 + Math.random() * 2000)
        } else {
          await this.delay(2000 + Math.random() * 1000)
        }
      } catch {
        break
      }
    }

    return products
  }

  private parseStockStatus(text: string): {
    status: StockStatus
    quantity: number | null
  } {
    const lower = text.toLowerCase()

    if (lower.includes('skladom') || lower.includes('odosielame')) {
      const qtyMatch = text.match(/posledn[ýé]\w*\s+(\d+)/i)
      return {
        status: 'in_stock',
        quantity: qtyMatch ? parseInt(qtyMatch[1], 10) : null,
      }
    }

    if (lower.includes('objednáme') || lower.includes('objedname')) {
      return { status: 'out_of_stock', quantity: null }
    }

    if (
      lower.includes('nedostupn') ||
      lower.includes('vypredané') ||
      lower.includes('vypredane')
    ) {
      return { status: 'out_of_stock', quantity: null }
    }

    return { status: 'unknown', quantity: null }
  }
}
