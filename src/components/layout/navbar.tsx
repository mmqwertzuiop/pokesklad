'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, LayoutDashboard, Heart, Settings, Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { NotificationBell } from '@/components/notifications/notification-bell'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Skladom', icon: LayoutDashboard },
]

export function Navbar({ user }: { user?: { email: string } | null }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <span className="text-base font-bold tracking-tight">
            <span className="text-gradient">MM</span><span className="text-foreground/80">pokebot</span>
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <Link href="/watchlist" className="hidden text-muted-foreground hover:text-foreground md:block">
                <Heart className="h-4 w-4" />
              </Link>
              <Link href="/settings" className="hidden text-muted-foreground hover:text-foreground md:block">
                <Settings className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" className="text-xs" render={<Link href="/login" />}>
                Prihlásiť sa
              </Button>
              <Button size="sm" className="text-xs" render={<Link href="/register" />}>
                Registrácia
              </Button>
            </div>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden" render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-background">
              <SheetTitle className="text-gradient">MMpokebot</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
                  Skladom
                </Link>
                {!user && (
                  <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                    <Button variant="ghost" size="sm" render={<Link href="/login" onClick={() => setOpen(false)} />}>
                      Prihlásiť sa
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
