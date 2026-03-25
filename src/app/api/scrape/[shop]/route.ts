import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runSingleScraper } from '@/lib/scrapers'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shop: string }> }
) {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.API_SECRET_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { shop } = await params
  const supabase = createAdminClient()

  try {
    const result = await runSingleScraper(supabase, shop)
    return Response.json(result)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 400 }
    )
  }
}
