'use client'

import { Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/notification'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    loadNotifications()
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const n = payload.new as Notification
          setNotifications(prev => [n, ...prev])
        }
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadNotifications() {
    const res = await fetch('/api/notifications')
    if (res.ok) {
      const data = await res.json()
      setNotifications(data.notifications || [])
    }
  }

  async function markAsRead(id: string) {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'all' }) })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  function handleNotificationClick(n: Notification) {
    if (!n.is_read) {
      markAsRead(n.id)
    }
    if (n.product_id) {
      router.push(`/product/${n.product_id}`)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative text-[#64748b] hover:text-[#a78bfa]" />}>
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#8b5cf6] text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" style={{ background: '#0d0820', border: '1px solid rgba(139,92,246,0.15)' }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
          <h3 className="font-label text-[10px] uppercase tracking-wider text-[#a78bfa]">NOTIFIKACIE</h3>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="font-label text-[9px] uppercase tracking-wider text-[#64748b] hover:text-[#a78bfa]">OZNACIT</button>
          )}
        </div>
        <ScrollArea className="max-h-72">
          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center text-xs text-[#475569]">Zatial ziadne notifikacie</div>
          ) : (
            <div>
              {notifications.slice(0, 10).map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`cursor-pointer px-4 py-3 transition-colors hover:bg-[rgba(139,92,246,0.08)] ${!n.is_read ? 'bg-purple-900/30' : ''}`}
                  style={{ borderBottom: '1px solid rgba(139,92,246,0.05)' }}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8b5cf6]" />}
                    <div>
                      <p className="text-xs font-semibold text-[#e2e8f0]">{n.title}</p>
                      <p className="mt-0.5 text-[10px] text-[#64748b]">{n.body}</p>
                      <p className="mt-1 text-[9px] text-[#475569]">{new Date(n.sent_at).toLocaleString('sk-SK')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
