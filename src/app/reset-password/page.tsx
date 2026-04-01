'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password/update',
    })

    if (error) {
      toast.error('Nepodarilo sa odoslať email. Skúste to znova.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: '#080412' }}>
      <div className="w-full max-w-sm rounded-xl p-8 card-v">
        <Link href="/" className="mb-6 block text-center">
          <span className="text-2xl font-black text-white" style={{ fontFamily: 'Bebas Neue' }}>MM</span>
          <span className="text-2xl logo-outline" style={{ fontFamily: 'Bebas Neue' }}>POKEBOT</span>
        </Link>

        {sent ? (
          <div className="text-center">
            <CheckCircle className="mx-auto mb-4 h-10 w-10 text-[#8b5cf6]" />
            <h1 className="mb-2 font-heading text-2xl text-white">SKONTROLUJ SVOJ EMAIL</h1>
            <p className="mb-6 text-sm text-[#94a3b8]">
              Ak existuje účet s emailom <span className="text-[#a78bfa]">{email}</span>, poslali sme ti odkaz na obnovenie hesla.
            </p>
            <Link href="/login" className="inline-flex items-center gap-1 text-xs text-[#a78bfa] hover:underline">
              <ArrowLeft className="h-3 w-3" />Späť na prihlásenie
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-2 text-center font-heading text-2xl text-white">OBNOVENIE HESLA</h1>
            <p className="mb-6 text-center text-xs text-[#64748b]">
              Zadaj svoj email a pošleme ti odkaz na obnovenie hesla.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748b]" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 pl-9 text-sm"
                  style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.15)', color: '#e2e8f0' }}
                />
              </div>
              <Button
                type="submit"
                className="w-full font-label text-xs uppercase tracking-wider bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                ODOSLAŤ ODKAZ
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-[#64748b]">
              <Link href="/login" className="text-[#a78bfa] hover:underline">Späť na prihlásenie</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
