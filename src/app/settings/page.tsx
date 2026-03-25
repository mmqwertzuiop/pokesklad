'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
    async function loadPrefs() {
      const res = await fetch('/api/notifications/preferences')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setNotifyInApp(data.notify_in_app ?? true)
          setSelectedCategories(data.notify_categories ?? CATEGORIES)
        }
      }
    }
    loadPrefs()
  }, [])

  async function handleSave() {
    setLoading(true)
    setSaved(false)

    await fetch('/api/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notify_in_app: notifyInApp,
        notify_categories: selectedCategories,
        notify_shops: null,
      }),
    })

    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <h1 className="mb-8 text-2xl font-bold">
            <span className="text-gradient">Nastavenia</span>
          </h1>

          {/* Notifications */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-primary" />
                Notifikácie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">In-app notifikácie</p>
                  <p className="text-sm text-muted-foreground">
                    Dostávaj notifikácie priamo v aplikácii
                  </p>
                </div>
                <Switch checked={notifyInApp} onCheckedChange={setNotifyInApp} />
              </div>

              <Separator />

              <div>
                <p className="mb-3 font-medium">Sledované kategórie</p>
                <p className="mb-4 text-sm text-muted-foreground">
                  Vyber kategórie o ktorých chceš byť informovaný pri doskladnení
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <Badge
                      key={cat}
                      variant={selectedCategories.includes(cat) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${
                        selectedCategories.includes(cat)
                          ? 'bg-primary text-primary-foreground'
                          : 'border-border/50 text-muted-foreground hover:border-primary/30'
                      }`}
                      onClick={() => toggleCategory(cat)}
                    >
                      {CATEGORY_LABELS[cat]}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {saved ? 'Uložené!' : 'Uložiť nastavenia'}
              </Button>
            </CardContent>
          </Card>

          {/* Account */}
          <Card className="mt-6 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Účet</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Odhlásiť sa
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
