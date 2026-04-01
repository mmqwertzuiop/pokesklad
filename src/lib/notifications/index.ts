import type { SupabaseClient } from '@supabase/supabase-js'
import { sendEmail } from '../email'
import { restockEmailTemplate, priceDropEmailTemplate } from '../email/templates'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokesklad.sk'

export async function processNotifications(supabase: SupabaseClient) {
  // Get unprocessed stock transitions (restocks only)
  const { data: transitions } = await supabase
    .from('stock_transitions')
    .select('*, product:products(*)')
    .eq('notification_sent', false)
    .order('transitioned_at', { ascending: false })

  if (!transitions || transitions.length === 0) return { sent: 0 }

  let sent = 0

  for (const transition of transitions) {
    const product = transition.product
    if (!product || !product.is_tracked) continue

    const isRestock = transition.new_status === 'in_stock' && transition.previous_status !== 'in_stock'
    const isPriceDrop =
      transition.previous_price != null &&
      transition.new_price != null &&
      transition.new_price < transition.previous_price

    if (!isRestock && !isPriceDrop) {
      // Nothing to notify about, just mark as sent
      await supabase
        .from('stock_transitions')
        .update({ notification_sent: true })
        .eq('id', transition.id)
      continue
    }

    // Check deduplication: no notification for same product + type in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    if (isRestock) {
      const { data: recentNotifs } = await supabase
        .from('notifications')
        .select('id')
        .eq('product_id', product.id)
        .eq('type', 'restock')
        .gte('sent_at', oneHourAgo)
        .limit(1)

      if (recentNotifs && recentNotifs.length > 0) {
        await supabase
          .from('stock_transitions')
          .update({ notification_sent: true })
          .eq('id', transition.id)
        continue
      }
    }

    if (isPriceDrop) {
      const { data: recentPriceNotifs } = await supabase
        .from('notifications')
        .select('id')
        .eq('product_id', product.id)
        .eq('type', 'price_drop')
        .gte('sent_at', oneHourAgo)
        .limit(1)

      if (recentPriceNotifs && recentPriceNotifs.length > 0 && !isRestock) {
        await supabase
          .from('stock_transitions')
          .update({ notification_sent: true })
          .eq('id', transition.id)
        continue
      }
    }

    // Find users who should be notified
    // 1. Users who have this product in their watchlist
    const { data: watchlistUsers } = await supabase
      .from('watchlist')
      .select('user_id')
      .eq('product_id', product.id)
      .eq('notify_on_restock', true)

    // 2. Users with matching category preferences
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id, email, notify_email, notify_price_drop')
      .eq('notify_in_app', true)
      .contains('notify_categories', [product.category])

    // Build profile lookup for email info
    const profileMap = new Map<string, { email: string; notify_email: boolean; notify_price_drop: boolean }>()
    allProfiles?.forEach((p) =>
      profileMap.set(p.id, {
        email: p.email,
        notify_email: p.notify_email,
        notify_price_drop: p.notify_price_drop,
      })
    )

    // Combine user lists
    const userIds = new Set<string>()
    watchlistUsers?.forEach((w) => userIds.add(w.user_id))
    allProfiles?.forEach((p) => userIds.add(p.id))

    // For watchlist users not in allProfiles, fetch their profile info
    const missingUserIds = Array.from(userIds).filter((id) => !profileMap.has(id))
    if (missingUserIds.length > 0) {
      const { data: missingProfiles } = await supabase
        .from('profiles')
        .select('id, email, notify_email, notify_price_drop')
        .in('id', missingUserIds)

      missingProfiles?.forEach((p) =>
        profileMap.set(p.id, {
          email: p.email,
          notify_email: p.notify_email,
          notify_price_drop: p.notify_price_drop,
        })
      )
    }

    // ─── Restock notifications ───
    if (isRestock) {
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

      // Send restock emails to users with notify_email=true
      const shopName = product.shop_name || ''
      for (const userId of userIds) {
        const profile = profileMap.get(userId)
        if (!profile || !profile.notify_email) continue

        const html = restockEmailTemplate(
          product.name,
          shopName,
          product.current_price,
          product.url,
          SITE_URL
        )
        await sendEmail(profile.email, `${product.name} je opäť skladom!`, html)
      }
    }

    // ─── Price drop notifications ───
    if (isPriceDrop) {
      const priceDiffText = `${transition.previous_price} € → ${transition.new_price} €`
      const priceDropNotifications = Array.from(userIds)
        .filter((userId) => {
          const profile = profileMap.get(userId)
          return profile?.notify_price_drop !== false
        })
        .map((userId) => ({
          user_id: userId,
          type: 'price_drop' as const,
          title: `Zníženie ceny: ${product.name}`,
          body: `Cena sa zmenila: ${priceDiffText}.`,
          product_id: product.id,
        }))

      if (priceDropNotifications.length > 0) {
        await supabase.from('notifications').insert(priceDropNotifications)
        sent += priceDropNotifications.length
      }

      // Send price drop emails to users with notify_email=true AND notify_price_drop=true
      const shopName = product.shop_name || ''
      for (const userId of userIds) {
        const profile = profileMap.get(userId)
        if (!profile || !profile.notify_email || !profile.notify_price_drop) continue

        const html = priceDropEmailTemplate(
          product.name,
          shopName,
          transition.previous_price,
          transition.new_price,
          product.url,
          SITE_URL
        )
        await sendEmail(profile.email, `Zníženie ceny: ${product.name}`, html)
      }
    }

    // Mark transition as processed
    await supabase
      .from('stock_transitions')
      .update({ notification_sent: true })
      .eq('id', transition.id)
  }

  return { sent }
}
