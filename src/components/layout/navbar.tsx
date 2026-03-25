'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, LayoutDashboard, Heart, Settings, Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { NotificationBell } from '@/components/notifications/notification-bell'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard?status=in_stock', label: 'Skladom', icon: Package },
]

const AUTH_ITEMS = [
  { href: '/watchlist', label: 'Watchlist', icon: Heart },
  { href: '/settings', label: 'Nastavenia', icon: Settings },
]

export function Navbar({ user }: { user?: { email: string } | null }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 glow-yellow">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-gradient">PokeSklad</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href.split('?')[0])
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <div className="hidden items-center gap-1 md:flex">
                {AUTH_ITEMS.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
              <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary md:flex">
                {user.email[0].toUpperCase()}
              </div>
            </>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Button variant="ghost" size="sm" render={<Link href="/login" />}>
                Prihlasiť sa
              </Button>
              <Button size="sm" render={<Link href="/register" />}>
                Registrácia
              </Button>
            </div>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden" render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background">
              <SheetTitle className="text-gradient">PokeSklad</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
                {user && AUTH_ITEMS.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
                {!user && (
                  <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                    <Button variant="ghost" size="sm" render={<Link href="/login" onClick={() => setOpen(false)} />}>
                      Prihlasiť sa
                    </Button>
                    <Button size="sm" render={<Link href="/register" onClick={() => setOpen(false)} />}>
                      Registrácia
                    </Button>
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
