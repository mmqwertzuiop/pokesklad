import { Package } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-background/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-gradient">PokeSklad</span>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          PokeSklad nie je pridružený k Nintendo, The Pokémon Company alebo ich dcérskym spoločnostiam. Všetky ochranné známky patria ich príslušným vlastníkom.
        </p>
      </div>
    </footer>
  )
}
