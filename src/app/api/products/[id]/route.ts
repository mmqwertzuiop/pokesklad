import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createAdminClient()

  const [productResult, historyResult, transitionsResult] = await Promise.all([
    supabase
      .from('products')
      .select('*, shop:shops(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('availability_checks')
      .select('*')
      .eq('product_id', id)
      .order('checked_at', { ascending: false })
      .limit(100),
    supabase
      .from('stock_transitions')
      .select('*')
      .eq('product_id', id)
      .order('transitioned_at', { ascending: false })
      .limit(20),
  ])

  if (productResult.error) {
    return Response.json({ error: 'Product not found' }, { status: 404 })
  }

  // Find same product at other shops
  const { data: crossShop } = await supabase
    .from('products')
    .select('*, shop:shops(*)')
    .eq('normalized_name', productResult.data.normalized_name)
    .neq('id', id)
    .eq('is_tracked', true)

  return Response.json({
    product: productResult.data,
    history: historyResult.data || [],
    transitions: transitionsResult.data || [],
    cross_shop: crossShop || [],
  })
}
