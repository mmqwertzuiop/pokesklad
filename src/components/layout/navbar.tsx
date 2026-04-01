'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Heart, Settings, Menu, Bell } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { NotificationBell } from '@/components/notifications/notification-bell'

export function Navbar({ user }: { user?: { email: string } | null }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-[#080412]/80 backdrop-blur-xl" style={{ borderColor: 'rgba(139,92,246,0.1)' }}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-xl font-black tracking-wide text-white" style={{ fontFamily: 'Bebas Neue' }}>MM</span>
          <span className="text-xl tracking-wide logo-outline" style={{ fontFamily: 'Bebas Neue' }}>POKEBOT</span>
        </Link>

        {/* Center */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/dashboard" className={`rounded-lg px-3 py-1.5 text-xs font-medium font-label transition-colors ${pathname.startsWith('/dashboard') ? 'bg-[rgba(139,92,246,0.15)] text-[#a78bfa]' : 'text-[#64748b] hover:text-[#94a3b8]'}`}>
            SKLADOM
          </Link>
          {user && (
            <Link href="/watchlist" className={`rounded-lg px-3 py-1.5 text-xs font-medium font-label transition-colors ${pathname.startsWith('/watchlist') ? 'bg-[rgba(139,92,246,0.15)] text-[#a78bfa]' : 'text-[#64748b] hover:text-[#94a3b8]'}`}>
              SLEDOVANE
            </Link>
          )}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <Link href="/settings" className="text-[#64748b] hover:text-[#a78bfa]"><Settings className="h-4 w-4" /></Link>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" className="text-xs font-label text-[#64748b]" render={<Link href="/login" />}>PRIHLASIT</Button>
              <Button size="sm" className="text-xs font-label bg-[#8b5cf6] hover:bg-[#7c3aed] text-white" render={<Link href="/register" />}>REGISTRACIA</Button>
            </div>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden" render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-5 w-5 text-[#64748b]" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64" style={{ background: '#0d0820' }}>
              <SheetTitle className="font-heading text-xl text-white">MMPOKEBOT</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-[#94a3b8] hover:text-white">Skladom</Link>
                {user && (
                  <Link href="/watchlist" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-[#94a3b8] hover:text-white">Sledovane</Link>
                )}
                {user && (
                  <Link href="/settings" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-[#94a3b8] hover:text-white">Nastavenia</Link>
                )}
                {!user && (
                  <div className="mt-4 flex flex-col gap-2 pt-4" style={{ borderTop: '1px solid rgba(139,92,246,0.15)' }}>
                    <Button variant="ghost" size="sm" render={<Link href="/login" onClick={() => setOpen(false)} />}>Prihlasit</Button>
                    <Button size="sm" className="bg-[#8b5cf6] text-white" render={<Link href="/register" onClick={() => setOpen(false)} />}>Registracia</Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
