import type { SupabaseClient } from '@supabase/supabase-js'
import type { RawProduct, ScrapeResult, StockStatus } from '@/types/product'
import { classifyProduct, extractSetName, normalizeProductName } from '../product-classifier'
import { SCRAPE_HEADERS } from '../constants'

export abstract class BaseScraper {
  protected shopId: string
  protected shopSlug: string
  protected baseUrl: string
  protected scrapeUrl: string
  protected supabase: SupabaseClient

  constructor(
    config: { shop_id: string; shop_slug: string; base_url: string; scrape_url: string },
    supabase: SupabaseClient
  ) {
    this.shopId = config.shop_id
    this.shopSlug = config.shop_slug
    this.baseUrl = config.base_url
    this.scrapeUrl = config.scrape_url
    this.supabase = supabase
  }

  abstract fetchProducts(): Promise<RawProduct[]>

  protected async fetchPage(url: string): Promise<string> {
    const response = await fetch(url, { headers: SCRAPE_HEADERS })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${url}`)
    }
    return response.text()
  }

  protected parseSlovakPrice(text: string): number | null {
    if (!text) return null
    const cleaned = text
      .replace(/[^\d,.\-]/g, '')
      .replace(',', '.')
    const num = parseFloat(cleaned)
    return isNaN(num) ? null : num
  }

  protected resolveUrl(path: string): string {
    if (path.startsWith('http')) return path
    return `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async scrape(): Promise<ScrapeResult> {
    const startTime = Date.now()
    const errors: string[] = []
    let productsFound = 0
    let productsUpdated = 0
    let newRestocks = 0

    // Log scrape start
    const { data: scrapeLog } = await this.supabase
      .from('scrape_logs')
      .insert({
        shop_id: this.shopId,
        status: 'running',
      })
      .select('id')
      .single()

    try {
      const rawProducts = await this.fetchProducts()
      productsFound = rawProducts.length

      for (const raw of rawProducts) {
        try {
          const classifiedCategory = classifyProduct(raw.name)
          if (classifiedCategory === 'excluded') continue
          const category = classifiedCategory

          const setName = extractSetName(raw.name)
          const normalizedName = normalizeProductName(raw.name)

          // Check existing product
          const { data: existing } = await this.supabase
            .from('products')
            .select('id, current_stock_status, current_price')
            .eq('shop_id', this.shopId)
            .eq('url', raw.url)
            .single()

          if (existing) {
            // Detect stock transition
            if (existing.current_stock_status !== raw.stock_status) {
              await this.supabase.from('stock_transitions').insert({
                product_id: existing.id,
                previous_status: existing.current_stock_status,
                new_status: raw.stock_status,
                previous_price: existing.current_price,
                new_price: raw.price,
              })

              if (
                raw.stock_status === 'in_stock' &&
                existing.current_stock_status === 'out_of_stock'
              ) {
                newRestocks++
              }
            }

            // Update product
            await this.supabase
              .from('products')
              .update({
                name: raw.name,
                normalized_name: normalizedName,
                image_url: raw.image_url,
                category,
                set_name: setName,
                current_price: raw.price,
                current_stock_status: raw.stock_status,
                current_stock_quantity: raw.stock_quantity,
                last_seen_at: new Date().toISOString(),
                last_in_stock_at:
                  raw.stock_status === 'in_stock'
                    ? new Date().toISOString()
                    : undefined,
                is_tracked: true,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id)

            productsUpdated++
          } else {
            // Insert new product
            const { data: newProduct } = await this.supabase
              .from('products')
              .insert({
                shop_id: this.shopId,
                external_id: raw.external_id || null,
                name: raw.name,
                normalized_name: normalizedName,
                url: raw.url,
                image_url: raw.image_url,
                category,
                set_name: setName,
                current_price: raw.price,
                current_stock_status: raw.stock_status,
                current_stock_quantity: raw.stock_quantity,
                last_in_stock_at:
                  raw.stock_status === 'in_stock'
                    ? new Date().toISOString()
                    : null,
                is_tracked: true,
              })
              .select('id')
              .single()

            if (newProduct && raw.stock_status === 'in_stock') {
              newRestocks++
            }

            productsUpdated++
          }

          // Log availability check
          const productId = existing?.id
          if (productId) {
            await this.supabase.from('availability_checks').insert({
              product_id: productId,
              stock_status: raw.stock_status,
              stock_quantity: raw.stock_quantity,
              price: raw.price,
              raw_status_text: raw.raw_status_text,
            })
          }
        } catch (err) {
          errors.push(`Product ${raw.name}: ${err instanceof Error ? err.message : String(err)}`)
        }
      }
    } catch (err) {
      errors.push(`Scraper error: ${err instanceof Error ? err.message : String(err)}`)
    }

    const durationMs = Date.now() - startTime

    // Update scrape log
    if (scrapeLog?.id) {
      await this.supabase
        .from('scrape_logs')
        .update({
          finished_at: new Date().toISOString(),
          status: errors.length > 0 ? 'error' : 'success',
          products_found: productsFound,
          products_updated: productsUpdated,
          new_restocks: newRestocks,
          errors: errors.length > 0 ? errors : null,
          duration_ms: durationMs,
        })
        .eq('id', scrapeLog.id)
    }

    // Update shop last_scrape
    await this.supabase
      .from('shops')
      .update({
        last_scrape_at: new Date().toISOString(),
        last_scrape_status: errors.length > 0 ? 'error' : 'success',
      })
      .eq('id', this.shopId)

    return {
      shop_slug: this.shopSlug,
      products_found: productsFound,
      products_updated: productsUpdated,
      new_restocks: newRestocks,
      errors,
      duration_ms: durationMs,
    }
  }
}
