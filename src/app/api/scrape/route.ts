import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runAllScrapers } from '@/lib/scrapers'
import { processNotifications } from '@/lib/notifications'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.API_SECRET_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const results = await runAllScrapers(supabase)
  const notificationResult = await processNotifications(supabase)

  return Response.json({
    results,
    notifications: notificationResult,
  })
}
