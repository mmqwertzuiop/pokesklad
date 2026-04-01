import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto" style={{ borderTop: '1px solid rgba(139,92,246,0.08)' }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 sm:px-6">
        <span className="text-xs font-label text-[#64748b]">MMPOKEBOT</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-[10px] text-[#64748b] hover:text-[#a78bfa] transition-colors">
            Ochrana sukromia
          </Link>
          <span className="text-[10px] text-[#475569]">|</span>
          <Link href="/terms" className="text-[10px] text-[#64748b] hover:text-[#a78bfa] transition-colors">
            Podmienky
          </Link>
        </div>
        <p className="text-[10px] text-[#475569]">
          &copy; 2026 PokeSklad. Vsetky prava vyhradene.
        </p>
        <p className="text-[10px] text-[#475569]">
          Nie je pridruzeny k Nintendo alebo The Pokemon Company.
        </p>
      </div>
    </footer>
  )
}
