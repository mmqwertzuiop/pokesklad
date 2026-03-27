'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Bell, Save, Loader2, LogOut } from 'lucide-react'
import { CATEGORY_LABELS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['etb', 'booster_box', 'booster_pack', 'booster_bundle', 'collection_box']

export default function SettingsPage() {
  const [notifyInApp, setNotifyInApp] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(CATEGORIES)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetch('/api/notifications/preferences').then(r => r.json()).then(data => {
      if (data) { setNotifyInApp(data.notify_in_app ?? true); setSelectedCategories(data.notify_categories ?? CATEGORIES) }
    }).catch(() => {})
  }, [])

  async function handleSave() {
    setLoading(true); setSaved(false)
    await fetch('/api/notifications/preferences', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notify_in_app: notifyInApp, notify_categories: selectedCategories, notify_shops: null }) })
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

          <div className="rounded-xl p-6 card-v">
            <div className="mb-5 flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#8b5cf6]" />
              <span className="font-heading text-lg text-white">NOTIFIKÁCIE</span>
            </div>

            <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
              <div><p className="text-sm font-semibold text-[#e2e8f0]">In-app notifikácie</p><p className="text-xs text-[#64748b]">Notifikácie priamo v aplikácii</p></div>
              <Switch checked={notifyInApp} onCheckedChange={setNotifyInApp} />
            </div>

            <div className="mt-5">
              <p className="mb-3 text-sm font-semibold text-[#e2e8f0]">Sledované kategórie</p>
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
              {saved ? 'ULOŽENÉ' : 'ULOŽIŤ'}
            </Button>
          </div>

          <div className="mt-6 rounded-xl p-6 card-v">
            <span className="font-heading text-lg text-white">ÚČET</span>
            <Button variant="outline" onClick={handleLogout} className="mt-4 gap-2 font-label text-[10px] uppercase tracking-wider text-[#a78bfa]" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
              <LogOut className="h-3 w-3" />ODHLÁSIŤ SA
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
