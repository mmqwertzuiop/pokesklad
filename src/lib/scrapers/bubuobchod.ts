import * as cheerio from 'cheerio'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { RawProduct, StockStatus } from '@/types/product'
import { BaseScraper } from './base-scraper'

export class BubuobchodScraper extends BaseScraper {
  constructor(
    config: { shop_id: string; shop_slug: string; base_url: string; scrape_url: string },
    supabase: SupabaseClient
  ) {
    super(config, supabase)
  }

  async fetchProducts(): Promise<RawProduct[]> {
    const products: RawProduct[] = []
    let page = 1
    const maxPages = 15

    while (page <= maxPages) {
      const url = page === 1 ? this.scrapeUrl : `${this.scrapeUrl}?page=${page}`

      try {
        const html = await this.fetchPage(url)
        const $ = cheerio.load(html)
        const items = $('[class*="product"]').toArray()

        if (items.length === 0) break

        let found = 0
        for (const item of items) {
          try {
            const $item = $(item)
            const nameEl = $item.find('a[class*="name"], h3 a, .product-name a, a.title, h2 a').first()
            const name = nameEl.text().trim()
            const href = nameEl.attr('href')

            if (!name || !href) continue
            found++

            const url = this.resolveUrl(href)
            const imageUrl = $item.find('img').attr('src') || $item.find('img').attr('data-src') || null
            const priceText = $item.find('[class*="price"]').first().text().trim()
            const price = this.parseSlovakPrice(priceText)
            const stockText = $item.find('[class*="avail"], [class*="stock"], .availability').first().text().trim()
            const { status, quantity } = this.parseStockStatus(stockText)

            products.push({
              name, url,
              image_url: imageUrl ? this.resolveUrl(imageUrl) : null,
              price, stock_status: status, stock_quantity: quantity,
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

  private parseStockStatus(text: string): { status: StockStatus; quantity: number | null } {
    const lower = text.toLowerCase()
    if (lower.includes('skladem') || lower.includes('in stock')) {
      const qtyMatch = text.match(/\((\d+)\s*ks\)/i) || text.match(/\(>?(\d+)\s*pcs?\)/i)
      return { status: 'in_stock', quantity: qtyMatch ? parseInt(qtyMatch[1], 10) : null }
    }
    if (lower.includes('není skladem') || lower.includes('vyprodáno') || lower.includes('vyprodano')) {
      return { status: 'out_of_stock', quantity: null }
    }
    if (lower.includes('na cestě') || lower.includes('předobjednávka')) {
      return { status: 'preorder', quantity: null }
    }
    return { status: 'unknown', quantity: null }
  }
}
