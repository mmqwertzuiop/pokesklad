import { Package } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center gap-1.5 text-sm">
          <Package className="h-3.5 w-3.5 text-primary/60" />
          <span className="font-medium text-foreground/60">MMpokebot</span>
        </div>
        <p className="text-center text-[11px] text-muted-foreground/40">
          Nie je pridružený k Nintendo alebo The Pokémon Company.
        </p>
      </div>
    </footer>
  )
}
