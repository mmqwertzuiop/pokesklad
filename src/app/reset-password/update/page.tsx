'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Heslo musí mať aspoň 6 znakov.')
      return
    }

    if (password !== confirmPassword) {
      setError('Heslá sa nezhodujú.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error('Nepodarilo sa zmeniť heslo. Skúste to znova.')
      setLoading(false)
      return
    }

    toast.success('Heslo bolo úspešne zmenené!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: '#080412' }}>
      <div className="w-full max-w-sm rounded-xl p-8 card-v">
        <Link href="/" className="mb-6 block text-center">
          <span className="text-2xl font-black text-white" style={{ fontFamily: 'Bebas Neue' }}>MM</span>
          <span className="text-2xl logo-outline" style={{ fontFamily: 'Bebas Neue' }}>POKEBOT</span>
        </Link>
        <h1 className="mb-2 text-center font-heading text-2xl text-white">NOVÉ HESLO</h1>
        <p className="mb-6 text-center text-xs text-[#64748b]">
          Zadaj svoje nové heslo.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748b]" />
            <Input
              type="password"
              placeholder="Nové heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10 pl-9 text-sm"
              style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.15)', color: '#e2e8f0' }}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748b]" />
            <Input
              type="password"
              placeholder="Potvrď nové heslo"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-10 pl-9 text-sm"
              style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.15)', color: '#e2e8f0' }}
            />
          </div>
          <p className="text-[10px] text-[#475569]">Minimálne 6 znakov</p>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button
            type="submit"
            className="w-full font-label text-xs uppercase tracking-wider bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            ZMENIŤ HESLO
          </Button>
        </form>
      </div>
    </div>
  )
}
