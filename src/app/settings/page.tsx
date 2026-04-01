'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Bell, Save, Loader2, LogOut, User } from 'lucide-react'
import { CATEGORY_LABELS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['etb', 'booster_box', 'booster_pack', 'booster_bundle', 'collection_box']

export default function SettingsPage() {
  const [notifyInApp, setNotifyInApp] = useState(true)
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [notifyPriceDrop, setNotifyPriceDrop] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(CATEGORIES)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetch('/api/notifications/preferences').then(r => r.json()).then(data => {
      if (data) {
        setNotifyInApp(data.notify_in_app ?? true)
        setNotifyEmail(data.notify_email ?? false)
        setNotifyPriceDrop(data.notify_price_drop ?? false)
        setSelectedCategories(data.notify_categories ?? CATEGORIES)
      }
    }).catch(() => {})
  }, [])

  async function handleSave() {
    setLoading(true); setSaved(false)
    await fetch('/api/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notify_in_app: notifyInApp,
        notify_email: notifyEmail,
        notify_price_drop: notifyPriceDrop,
        notify_categories: selectedCategories,
        notify_shops: null,
      }),
    })
    setLoading(false); setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  function toggleCategory(cat: string) { setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]) }

  async function handleLogout() { await supabase.auth.signOut(); router.push('/'); router.refresh() }

  return (
    <>
      <Navbar />
      <main className="flex-1" style={{ background: '#080412' }}>
        <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
          <h1 className="mb-8 font-heading text-3xl text-white">NASTAVENIA</h1>

          {/* Notifikacie section */}
          <div className="rounded-xl p-6 card-v">
            <div className="mb-5 flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#8b5cf6]" />
              <span className="font-heading text-lg text-white">NOTIFIKACIE</span>
            </div>

            <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
              <div><p className="text-sm font-semibold text-[#e2e8f0]">In-app notifikacie</p><p className="text-xs text-[#64748b]">Notifikacie priamo v aplikacii</p></div>
              <Switch checked={notifyInApp} onCheckedChange={setNotifyInApp} />
            </div>

            <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
              <div><p className="text-sm font-semibold text-[#e2e8f0]">Emailove notifikacie</p><p className="text-xs text-[#64748b]">Notifikacie na email</p></div>
              <Switch checked={notifyEmail} onCheckedChange={setNotifyEmail} />
            </div>

            <div className="flex items-center justify-between py-3">
              <div><p className="text-sm font-semibold text-[#e2e8f0]">Pokles ceny</p><p className="text-xs text-[#64748b]">Notifikacia pri poklese ceny</p></div>
              <Switch checked={notifyPriceDrop} onCheckedChange={setNotifyPriceDrop} />
            </div>
          </div>

          {/* Kategorie section */}
          <div className="mt-6 rounded-xl p-6 card-v">
            <div className="mb-5 flex items-center gap-2">
              <span className="font-heading text-lg text-white">KATEGORIE</span>
            </div>

            <p className="mb-3 text-sm font-semibold text-[#e2e8f0]">Sledovane kategorie</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => toggleCategory(cat)}
                  className="rounded-lg px-3 py-1.5 font-label text-[10px] uppercase tracking-wider transition-all"
                  style={{
                    background: selectedCategories.includes(cat) ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.05)',
                    border: `1px solid ${selectedCategories.includes(cat) ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.1)'}`,
                    color: selectedCategories.includes(cat) ? '#a78bfa' : '#64748b',
                  }}>
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} className="mt-6 w-full font-label text-[10px] uppercase tracking-wider bg-[#8b5cf6] hover:bg-[#7c3aed] text-white">
            {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
            {saved ? 'ULOZENE' : 'ULOZIT'}
          </Button>

          {/* Ucet section */}
          <div className="mt-6 rounded-xl p-6 card-v">
            <div className="mb-5 flex items-center gap-2">
              <User className="h-4 w-4 text-[#8b5cf6]" />
              <span className="font-heading text-lg text-white">UCET</span>
            </div>

            <Link
              href="/profile"
              className="mb-4 block text-sm text-[#a78bfa] hover:text-[#c4b5fd] underline"
            >
              Spravovat profil
            </Link>

            <Button variant="outline" onClick={handleLogout} className="gap-2 font-label text-[10px] uppercase tracking-wider text-[#a78bfa]" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
              <LogOut className="h-3 w-3" />ODHLASIT SA
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
