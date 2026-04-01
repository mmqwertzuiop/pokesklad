'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Cookie } from 'lucide-react'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setVisible(true)
    }
  }, [])

  function handleAccept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  function handleDecline() {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div
            className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between"
            style={{
              background: 'rgba(13,8,32,0.95)',
              border: '1px solid rgba(139,92,246,0.2)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-start gap-3">
              <Cookie className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" />
              <p className="text-xs text-[#94a3b8]">
                Používame iba nevyhnutné cookies na zabezpečenie funkčnosti. Žiadne reklamné cookies.{' '}
                <a href="/privacy" className="text-[#a78bfa] hover:underline">Viac info</a>
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecline}
                className="h-7 font-label text-[10px] uppercase tracking-wider text-[#64748b]"
                style={{ borderColor: 'rgba(139,92,246,0.15)' }}
              >
                ODMIETNUŤ
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="h-7 font-label text-[10px] uppercase tracking-wider bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
              >
                SÚHLASÍM
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
