import type { SupabaseClient } from '@supabase/supabase-js'
import type { ScrapeResult } from '@/types/product'
import { NekonecnoScraper } from './nekonecno'
import { XzoneScraper } from './xzone'
import { IhryskoScraper } from './ihrysko'
import { DracikScraper } from './dracik'
import { BaseScraper } from './base-scraper'

const SCRAPER_MAP: Record<string, typeof BaseScraper> = {
  nekonecno: NekonecnoScraper as unknown as typeof BaseScraper,
  xzone: XzoneScraper as unknown as typeof BaseScraper,
  ihrysko: IhryskoScraper as unknown as typeof BaseScraper,
  dracik: DracikScraper as unknown as typeof BaseScraper,
}

export async function runAllScrapers(
  supabase: SupabaseClient
): Promise<ScrapeResult[]> {
  const { data: shops } = await supabase
    .from('shops')
    .select('*')
    .eq('is_active', true)

  if (!shops || shops.length === 0) {
    return []
  }

  const results: ScrapeResult[] = []

  for (const shop of shops) {
    const ScraperClass = SCRAPER_MAP[shop.slug]
    if (!ScraperClass) continue

    try {
      const scraper = new (ScraperClass as any)(
        {
          shop_id: shop.id,
          shop_slug: shop.slug,
          base_url: shop.base_url,
          scrape_url: shop.scrape_url,
        },
        supabase
      )
      const result = await scraper.scrape()
      results.push(result)
    } catch (err) {
      results.push({
        shop_slug: shop.slug,
        products_found: 0,
        products_updated: 0,
        new_restocks: 0,
        errors: [err instanceof Error ? err.message : String(err)],
        duration_ms: 0,
      })
    }
  }

  return results
}

export async function runSingleScraper(
  supabase: SupabaseClient,
  shopSlug: string
): Promise<ScrapeResult> {
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', shopSlug)
    .single()

  if (!shop) {
    throw new Error(`Shop ${shopSlug} not found`)
  }

  const ScraperClass = SCRAPER_MAP[shop.slug]
  if (!ScraperClass) {
    throw new Error(`No scraper for shop ${shopSlug}`)
  }

  const scraper = new (ScraperClass as any)(
    {
      shop_id: shop.id,
      shop_slug: shop.slug,
      base_url: shop.base_url,
      scrape_url: shop.scrape_url,
    },
    supabase
  )

  return scraper.scrape()
}
