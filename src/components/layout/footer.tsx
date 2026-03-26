export function Footer() {
  return (
    <footer className="mt-auto" style={{ borderTop: '1px solid rgba(139,92,246,0.08)' }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 sm:flex-row sm:justify-between sm:px-6">
        <span className="text-xs font-label text-[#64748b]">MMPOKEBOT</span>
        <p className="text-[10px] text-[#475569]">
          Nie je pridružený k Nintendo alebo The Pokémon Company.
        </p>
      </div>
    </footer>
  )
}
