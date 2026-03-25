import type { SupabaseClient } from '@supabase/supabase-js'

export async function processNotifications(supabase: SupabaseClient) {
  // Get unprocessed stock transitions (restocks only)
  const { data: transitions } = await supabase
    .from('stock_transitions')
    .select('*, product:products(*)')
    .eq('notification_sent', false)
    .eq('new_status', 'in_stock')
    .order('transitioned_at', { ascending: false })

  if (!transitions || transitions.length === 0) return { sent: 0 }

  let sent = 0

  for (const transition of transitions) {
    const product = transition.product
    if (!product || !product.is_tracked) continue

    // Check deduplication: no notification for same product in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recentNotifs } = await supabase
      .from('notifications')
      .select('id')
      .eq('product_id', product.id)
      .eq('type', 'restock')
      .gte('sent_at', oneHourAgo)
      .limit(1)

    if (recentNotifs && recentNotifs.length > 0) {
      // Already notified recently, just mark as sent
      await supabase
        .from('stock_transitions')
        .update({ notification_sent: true })
        .eq('id', transition.id)
      continue
    }

    // Find users who should be notified
    // 1. Users with matching category preferences
    // 2. Users who have this product in their watchlist
    const { data: watchlistUsers } = await supabase
      .from('watchlist')
      .select('user_id')
      .eq('product_id', product.id)
      .eq('notify_on_restock', true)

    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('notify_in_app', true)
      .contains('notify_categories', [product.category])

    // Combine user lists
    const userIds = new Set<string>()
    watchlistUsers?.forEach((w) => userIds.add(w.user_id))
    allProfiles?.forEach((p) => userIds.add(p.id))

    // Create in-app notifications
    const notifications = Array.from(userIds).map((userId) => ({
      user_id: userId,
      type: 'restock' as const,
      title: `${product.name} je opäť skladom!`,
      body: `Produkt je dostupný za ${product.current_price ? `${product.current_price} €` : 'neuvedená cena'}.`,
      product_id: product.id,
    }))

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications)
      sent += notifications.length
    }

    // Mark transition as processed
    await supabase
      .from('stock_transitions')
      .update({ notification_sent: true })
      .eq('id', transition.id)
  }

  return { sent }
}
