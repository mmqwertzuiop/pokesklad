import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('watchlist')
    .select('*, product:products(*, shop:shops(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return Response.json({ watchlist: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { product_id, target_price } = body

  const { data, error } = await supabase
    .from('watchlist')
    .upsert(
      {
        user_id: user.id,
        product_id,
        target_price: target_price || null,
        notify_on_restock: true,
        notify_on_price_drop: true,
      },
      { onConflict: 'user_id,product_id' }
    )
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
