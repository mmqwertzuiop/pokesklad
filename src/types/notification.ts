export type NotificationType = 'restock' | 'price_drop' | 'new_product' | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  product_id: string | null
  is_read: boolean
  sent_at: string
}

export interface NotificationPreferences {
  notify_in_app: boolean
  notify_categories: string[]
  notify_shops: string[] | null
}
