'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: '#080412' }}>
      <div className="text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-[#8b5cf6]" />
        <h1 className="mb-2 font-heading text-3xl text-white">NIEČO SA POKAZILO</h1>
        <p className="mb-2 text-sm text-[#64748b]">
          Nastala neočakávaná chyba. Skúste to prosím znova.
        </p>
        {error.message && (
          <p className="mb-6 text-xs text-[#475569]">{error.message}</p>
        )}
        <Button
          onClick={reset}
          className="font-label text-xs uppercase tracking-wider bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
        >
          SKÚSIŤ ZNOVA
        </Button>
      </div>
    </div>
  )
}
