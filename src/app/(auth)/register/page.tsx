'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (password.length < 6) { setError('Heslo musí mať aspoň 6 znakov'); setLoading(false); return }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: '#080412' }}>
        <div className="w-full max-w-sm rounded-xl p-8 text-center card-v">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(139,92,246,0.15)' }}>
            <Check className="h-6 w-6 text-[#8b5cf6]" />
          </div>
          <h2 className="font-heading text-2xl text-white">REGISTRÁCIA ÚSPEŠNÁ</h2>
          <p className="mt-2 text-sm text-[#94a3b8]">Skontroluj email a potvrď registráciu.</p>
          <Button className="mt-6 font-label text-xs uppercase tracking-wider bg-[#8b5cf6] text-white" render={<Link href="/login" />}>PRIHLÁSIŤ SA</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: '#080412' }}>
      <div className="w-full max-w-sm rounded-xl p-8 card-v">
        <Link href="/" className="mb-6 block text-center">
          <span className="text-2xl font-black text-white" style={{ fontFamily: 'Bebas Neue' }}>MM</span>
          <span className="text-2xl logo-outline" style={{ fontFamily: 'Bebas Neue' }}>POKEBOT</span>
        </Link>
        <h1 className="mb-6 text-center font-heading text-2xl text-white">REGISTRÁCIA</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input type="text" placeholder="Meno (nepovinné)" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            className="h-10 text-sm" style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.15)', color: '#e2e8f0' }} />
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="h-10 text-sm" style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.15)', color: '#e2e8f0' }} />
          <Input type="password" placeholder="Heslo (min. 6 znakov)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            className="h-10 text-sm" style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.15)', color: '#e2e8f0' }} />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" className="w-full font-label text-xs uppercase tracking-wider bg-[#8b5cf6] hover:bg-[#7c3aed] text-white" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}VYTVORIŤ ÚČET
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-[#64748b]">
          Už máš účet? <Link href="/login" className="text-[#a78bfa] hover:underline">Prihlásiť sa</Link>
        </p>
      </div>
    </div>
  )
}
