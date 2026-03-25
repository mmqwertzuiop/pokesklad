import * as cheerio from 'cheerio'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { RawProduct, StockStatus } from '@/types/product'
import { BaseScraper } from './base-scraper'

export class DracikScraper extends BaseScraper {
  constructor(
    config: { shop_id: string; shop_slug: string; base_url: string; scrape_url: string },
    supabase: SupabaseClient
  ) {
    super(config, supabase)
  }

  async fetchProducts(): Promise<RawProduct[]> {
    const products: RawProduct[] = []

    try {
      const html = await this.fetchPage(this.scrapeUrl)

      // Try parsing from dataLayer first
      const dataLayerProducts = this.parseDataLayer(html)
      if (dataLayerProducts.length > 0) {
        return dataLayerProducts
      }

      // Fallback to HTML parsing
      const $ = cheerio.load(html)
      const items = $(
        '.product-list .product, .product-item, [class*="product"], .item'
      ).toArray()

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
            null

          const priceText = $item
            .find('.price, [class*="price"]')
            .first()
            .text()
            .trim()
          const price = this.parseSlovakPrice(priceText)

          const stockText = $item
            .find('[class*="avail"], [class*="stock"], .availability')
            .first()
            .text()
            .trim()

          const status = this.parseStockStatusText(stockText)

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
    } catch (err) {
      throw new Error(
        `Dracik scraper failed: ${err instanceof Error ? err.message : String(err)}`
      )
    }

    return products
  }

  private parseDataLayer(html: string): RawProduct[] {
    const products: RawProduct[] = []

    // Extract dataLayer push calls with product data
    const regex = /dataLayer\.push\(\s*(\{[\s\S]*?\})\s*\)/g
    let match

    while ((match = regex.exec(html)) !== null) {
      try {
        // Try to parse the JSON-like structure
        const jsonStr = match[1]
          .replace(/'/g, '"')
          .replace(/(\w+)\s*:/g, '"$1":')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')

        const data = JSON.parse(jsonStr)

        if (data.ecommerce?.items) {
          for (const item of data.ecommerce.items) {
            const name = item.item_name || item.name
            const price = item.price || item.price_vat
            const id = item.item_id || item.id
            const stockCond = item.stock_cond

            if (!name) continue

            products.push({
              name,
              url: `${this.baseUrl}/product/${id || ''}`,
              image_url: null,
              price: typeof price === 'number' ? price : this.parseSlovakPrice(String(price)),
              stock_status: stockCond === 'in_stock' ? 'in_stock' : 'out_of_stock',
              stock_quantity: null,
              raw_status_text: stockCond || 'unknown',
              external_id: id ? String(id) : undefined,
            })
          }
        }
      } catch {
        // JSON parse failed, try next match
      }
    }

    return products
  }

  private parseStockStatusText(text: string): StockStatus {
    const lower = text.toLowerCase()
    if (lower.includes('skladom') || lower.includes('in_stock') || lower.includes('dostupn')) {
      return 'in_stock'
    }
    if (lower.includes('vypredané') || lower.includes('vypredane') || lower.includes('nedostupn')) {
      return 'out_of_stock'
    }
    return 'unknown'
  }
}
