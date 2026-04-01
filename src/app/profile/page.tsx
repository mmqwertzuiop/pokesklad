'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, User, Download, Trash2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [tier, setTier] = useState('free')
  const [memberSince, setMemberSince] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setEmail(user.email || '')
      setMemberSince(user.created_at)

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, tier')
        .eq('id', user.id)
        .single()

      if (profile) {
        setDisplayName(profile.display_name || '')
        setTier(profile.tier || 'free')
      }

      setLoading(false)
    }

    loadProfile()
  }, [router, supabase])

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', user.id)

    if (error) {
      toast.error('Nepodarilo sa uložiť zmeny.')
    } else {
      toast.success('Profil bol aktualizovaný.')
    }

    setSaving(false)
  }

  async function handleExport() {
    setExporting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, watchlistRes, notificationsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('watchlist').select('*').eq('user_id', user.id),
      supabase.from('notifications').select('*').eq('user_id', user.id),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      profile: profileRes.data,
      watchlist: watchlistRes.data || [],
      notifications: notificationsRes.data || [],
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mmpokebot-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Dáta boli exportované.')
    setExporting(false)
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const tierLabels: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    premium: 'Premium',
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1" style={{ background: '#080412' }}>
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#8b5cf6]" />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1" style={{ background: '#080412' }}>
        <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
          <h1 className="mb-8 font-heading text-3xl text-white">PROFIL</h1>

          {/* Profile Info */}
          <div className="rounded-xl p-6 card-v">
            <div className="mb-5 flex items-center gap-2">
              <User className="h-4 w-4 text-[#8b5cf6]" />
              <span className="font-heading text-lg text-white">OSOBNÉ ÚDAJE</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block font-label text-[10px] uppercase tracking-wider text-[#64748b]">EMAIL</label>
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="h-10 text-sm opacity-60"
                  style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.15)', color: '#e2e8f0' }}
                />
              </div>

              <div>
                <label className="mb-1 block font-label text-[10px] uppercase tracking-wider text-[#64748b]">ZOBRAZOVANÉ MENO</label>
                <Input
                  type="text"
                  placeholder="Tvoje meno"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-10 text-sm"
                  style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.15)', color: '#e2e8f0' }}
                />
              </div>

              <div className="flex items-center gap-4" style={{ borderTop: '1px solid rgba(139,92,246,0.1)', paddingTop: '1rem' }}>
                <div>
                  <span className="font-label text-[10px] uppercase tracking-wider text-[#64748b]">TIER</span>
                  <div className="mt-1">
                    <Badge className="bg-[rgba(139,92,246,0.2)] text-[#a78bfa] border-[rgba(139,92,246,0.3)]">
                      {tierLabels[tier] || tier}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="font-label text-[10px] uppercase tracking-wider text-[#64748b]">ČLEN OD</span>
                  <p className="mt-1 text-sm text-[#e2e8f0]">{formatDate(memberSince)}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 w-full font-label text-[10px] uppercase tracking-wider bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
            >
              {saving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
              ULOŽIŤ ZMENY
            </Button>
          </div>

          {/* Export Data */}
          <div className="mt-6 rounded-xl p-6 card-v">
            <div className="mb-3 flex items-center gap-2">
              <Download className="h-4 w-4 text-[#8b5cf6]" />
              <span className="font-heading text-lg text-white">MOJE DÁTA</span>
            </div>
            <p className="mb-4 text-xs text-[#64748b]">
              Stiahni si kópiu svojich dát vrátane profilu, watchlistu a notifikácií.
            </p>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
              className="gap-2 font-label text-[10px] uppercase tracking-wider text-[#a78bfa]"
              style={{ borderColor: 'rgba(139,92,246,0.2)' }}
            >
              {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              EXPORTOVAŤ MOJE DÁTA
            </Button>
          </div>

          {/* Delete Account */}
          <div className="mt-6 rounded-xl p-6 card-v" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
            <div className="mb-3 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-400" />
              <span className="font-heading text-lg text-white">ZMAZAŤ ÚČET</span>
            </div>
            <p className="mb-4 text-xs text-[#64748b]">
              Táto akcia je nevratná. Všetky tvoje dáta budú trvalo odstránené.
            </p>

            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-2 font-label text-[10px] uppercase tracking-wider text-red-400"
                style={{ borderColor: 'rgba(239,68,68,0.2)' }}
              >
                <Trash2 className="h-3 w-3" />ZMAZAŤ ÚČET
              </Button>
            ) : (
              <div className="rounded-lg p-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-semibold text-red-400">Naozaj chceš zmazať účet?</span>
                </div>
                <p className="mb-4 text-xs text-[#94a3b8]">
                  Pre zmazanie účtu nás kontaktuj na email uvedený v sekcii Ochrana súkromia, alebo použi možnosť zmazania v nastaveniach Supabase.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="font-label text-[10px] uppercase tracking-wider text-[#64748b]"
                    style={{ borderColor: 'rgba(139,92,246,0.15)' }}
                  >
                    ZRUŠIŤ
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
