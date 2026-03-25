import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('notify_in_app, notify_categories, notify_shops')
    .eq('id', user.id)
    .single()

  return Response.json(profile)
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { notify_in_app, notify_categories, notify_shops } = body

  const { error } = await supabase
    .from('profiles')
    .update({
      notify_in_app,
      notify_categories,
      notify_shops,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
