import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category')
  const shop = searchParams.get('shop')
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 100)
  const sort = searchParams.get('sort') || 'updated_at'
  const order = searchParams.get('order') || 'desc'

  const supabase = createAdminClient()

  let query = supabase
    .from('products')
    .select('*, shop:shops(*)', { count: 'exact' })
    .eq('is_tracked', true)
    .neq('category', 'excluded')

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (shop && shop !== 'all') {
    query = query.eq('shop_id', shop)
  }

  if (status && status !== 'all') {
    if (status === 'in_stock') {
      // Only show truly in-stock items, exclude unknown
      query = query.eq('current_stock_status', 'in_stock')
    } else {
      query = query.eq('current_stock_status', status)
    }
  } else {
    // Default: exclude unknown status products
    query = query.neq('current_stock_status', 'unknown')
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query
    .order(sort, { ascending: order === 'asc' })
    .range(from, to)

  const { data, count, error } = await query

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({
    products: data,
    total: count,
    page,
    limit,
    total_pages: Math.ceil((count || 0) / limit),
  })
}
