import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080412' }}>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Link href="/" className="mb-8 block text-center">
          <span className="text-2xl font-black text-white" style={{ fontFamily: 'Bebas Neue' }}>MM</span>
          <span className="text-2xl logo-outline" style={{ fontFamily: 'Bebas Neue' }}>POKEBOT</span>
        </Link>

        <h1 className="mb-8 text-center font-heading text-3xl text-white">OCHRANA SÚKROMIA</h1>
        <p className="mb-8 text-center text-xs text-[#64748b]">Posledná aktualizácia: 31. marca 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 font-heading text-xl text-[#a78bfa]">AKÉ DÁTA ZBIERAME</h2>
            <div className="rounded-xl p-5 card-v">
              <ul className="space-y-2 text-sm text-[#94a3b8]">
                <li><strong className="text-[#e2e8f0]">Email adresa</strong> — potrebná na vytvorenie účtu a zasielanie notifikácií o doskladnení.</li>
                <li><strong className="text-[#e2e8f0]">Zobrazované meno</strong> — voliteľné, slúži na personalizáciu.</li>
                <li><strong className="text-[#e2e8f0]">Watchlist a preferencie</strong> — ukladáme zoznam produktov, ktoré sledujete, a vaše nastavenia notifikácií.</li>
                <li><strong className="text-[#e2e8f0]">Technické údaje</strong> — IP adresa, typ prehliadača a čas prístupu na účely bezpečnosti a diagnostiky.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-heading text-xl text-[#a78bfa]">PREČO ZBIERAME DÁTA</h2>
            <div className="rounded-xl p-5 card-v">
              <ul className="space-y-2 text-sm text-[#94a3b8]">
                <li>Poskytovanie služby sledovania dostupnosti Pokémon TCG produktov.</li>
                <li>Zasielanie notifikácií o doskladnení produktov, ktoré sledujete.</li>
                <li>Zlepšovanie a optimalizácia našej služby.</li>
                <li>Zabezpečenie ochrany pred zneužitím.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-heading text-xl text-[#a78bfa]">COOKIES</h2>
            <div className="rounded-xl p-5 card-v">
              <p className="text-sm text-[#94a3b8]">
                Používame iba nevyhnutné cookies na zabezpečenie funkčnosti prihlásenia a udržanie vašej relácie.
                Nepoužívame marketingové ani analytické cookies tretích strán. Súbory cookie relácie sa automaticky
                vymažú po odhlásení alebo zatvorení prehliadača.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-heading text-xl text-[#a78bfa]">VAŠE PRÁVA (GDPR)</h2>
            <div className="rounded-xl p-5 card-v">
              <p className="mb-3 text-sm text-[#94a3b8]">
                Podľa nariadenia GDPR máte nasledujúce práva:
              </p>
              <ul className="space-y-2 text-sm text-[#94a3b8]">
                <li><strong className="text-[#e2e8f0]">Právo na prístup</strong> — môžete si vyžiadať kópiu svojich osobných údajov.</li>
                <li><strong className="text-[#e2e8f0]">Právo na opravu</strong> — môžete požiadať o opravu nesprávnych údajov.</li>
                <li><strong className="text-[#e2e8f0]">Právo na vymazanie</strong> — môžete požiadať o vymazanie svojich údajov.</li>
                <li><strong className="text-[#e2e8f0]">Právo na prenosnosť</strong> — môžete si exportovať svoje dáta vo formáte JSON cez sekciu Profil.</li>
                <li><strong className="text-[#e2e8f0]">Právo namietať</strong> — môžete namietať proti spracovaniu svojich údajov.</li>
              </ul>
              <p className="mt-3 text-sm text-[#94a3b8]">
                Na uplatnenie svojich práv nás kontaktujte na emailovej adrese uvedenej nižšie.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-heading text-xl text-[#a78bfa]">KONTAKT</h2>
            <div className="rounded-xl p-5 card-v">
              <p className="text-sm text-[#94a3b8]">
                Ak máte otázky ohľadom ochrany súkromia alebo chcete uplatniť svoje práva, kontaktujte nás na:
              </p>
              <p className="mt-2 text-sm font-semibold text-[#a78bfa]">
                support@mmpokebot.sk
              </p>
            </div>
          </section>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-xs text-[#64748b] hover:text-[#a78bfa]">
            Späť na hlavnú stránku
          </Link>
        </div>
      </div>
    </div>
  )
}
