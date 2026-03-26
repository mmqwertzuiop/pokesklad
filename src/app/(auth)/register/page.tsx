'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('Heslo musí mať aspoň 6 znakov')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md border-border/50 bg-card">
          <CardContent className="pt-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <Package className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold">Registrácia úspešná!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Skontroluj si email a potvrď registráciu. Potom sa môžeš prihlásiť.
            </p>
            <Button className="mt-6" render={<Link href="/login" />}>
              Prihlásiť sa
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/50 bg-card">
        <CardHeader className="text-center">
          <Link href="/" className="mb-4 inline-flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 glow-yellow">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-gradient">MMpokebot</span>
          </Link>
          <CardTitle>Registrácia</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Meno (nepovinné)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-muted/30 border-border/50"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted/30 border-border/50"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Heslo (min. 6 znakov)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-muted/30 border-border/50"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Vytvoriť účet
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Už máš účet?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Prihlásiť sa
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
