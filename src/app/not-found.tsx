import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: '#080412' }}>
      <div className="text-center">
        <div className="mb-4 font-heading text-8xl text-[#8b5cf6]">404</div>
        <h1 className="mb-2 font-heading text-3xl text-white">TÁTO STRÁNKA NEEXISTUJE</h1>
        <p className="mb-8 text-sm text-[#64748b]">
          Vyzerá to, že si sa stratil v tall grass. Táto stránka nebola nájdená.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-lg px-6 py-2.5 font-label text-xs uppercase tracking-wider bg-[#8b5cf6] text-white transition-colors hover:bg-[#7c3aed]"
        >
          SPÄŤ NA DASHBOARD
        </Link>
      </div>
    </div>
  )
}
