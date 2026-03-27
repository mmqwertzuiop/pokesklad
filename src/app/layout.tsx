import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "MMpokebot | Pokemon TCG Restock Tracker",
  description: "Sleduj dostupnosť Pokémon TCG produktov na 11 slovenských a českých retail e-shopoch. Notifikácia do 5 minút od doskladnenia. ETB, Booster Boxy, Booster Packy a viac.",
  keywords: ["pokemon", "tcg", "restock", "tracker", "slovensko", "česko", "etb", "booster box", "prismatic evolutions", "ascended heroes", "doskladnenie"],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'MMpokebot | Pokemon TCG Restock Tracker',
    description: 'Sleduj dostupnosť Pokémon TCG na 11 retail e-shopoch. Notifikácia do 5 minút.',
    type: 'website',
    images: [{ url: '/og.svg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MMpokebot | Pokemon TCG Restock Tracker',
    description: 'Sleduj dostupnosť Pokémon TCG na 11 retail e-shopoch.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sk" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter+Tight:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: '#080412' }}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
