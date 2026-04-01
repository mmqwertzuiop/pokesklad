'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Nesprávny email alebo heslo'); setLoading(false); return }
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
        <h1 className="mb-6 text-center font-heading text-2xl text-white">PRIHLÁSENIE</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="h-10 text-sm" style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.15)', color: '#e2e8f0' }} />
          <Input type="password" placeholder="Heslo" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="h-10 text-sm" style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.15)', color: '#e2e8f0' }} />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" className="w-full font-label text-xs uppercase tracking-wider bg-[#8b5cf6] hover:bg-[#7c3aed] text-white" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}PRIHLÁSIŤ SA
          </Button>
          <div className="mt-2 text-right">
            <Link href="/reset-password" className="text-sm text-purple-400 hover:text-purple-300 underline">
              Zabudnuté heslo?
            </Link>
          </div>
        </form>
        <p className="mt-4 text-center text-xs text-[#64748b]">
          Nemáš účet? <Link href="/register" className="text-[#a78bfa] hover:underline">Zaregistruj sa</Link>
        </p>
      </div>
    </div>
  )
}
