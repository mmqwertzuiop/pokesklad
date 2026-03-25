import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runAllScrapers } from '@/lib/scrapers'
import { processNotifications } from '@/lib/notifications'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const results = await runAllScrapers(supabase)
  const notificationResult = await processNotifications(supabase)

  return Response.json({
    ok: true,
    results,
    notifications: notificationResult,
  })
}
