import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080412' }}>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Link href="/" className="mb-8 block text-center">
          <span className="text-2xl font-black text-white" style={{ fontFamily: 'Bebas Neue' }}>MM</span>
          <span className="text-2xl logo-outline" style={{ fontFamily: 'Bebas Neue' }}>POKEBOT</span>
        </Link>

        <h1 className="mb-8 text-center font-heading text-3xl text-white">PODMIENKY POUŽÍVANIA</h1>
        <p className="mb-8 text-center text-xs text-[#64748b]">Posledná aktualizácia: 31. marca 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 font-heading text-xl text-[#a78bfa]">POPIS SLUŽBY</h2>
            <div className="rounded-xl p-5 card-v">
              <p className="text-sm text-[#94a3b8]">
                MMpokebot je služba na sledovanie dostupnosti Pokémon TCG produktov na slovenských a českých
                e-shopoch. Pravidelne kontrolujeme dostupnosť produktov a informujeme vás o doskladnení
                prostredníctvom notifikácií v aplikácii.
              </p>
              <p className="mt-3 text-sm text-[#94a3b8]">
                Služba je poskytovaná &quot;tak ako je&quot; (as-is) bez záruky úplnosti alebo presnosti údajov
                o dostupnosti a cenách.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-heading text-xl text-[#a78bfa]">PODMIENKY POUŽITIA</h2>
            <div className="rounded-xl p-5 card-v">
              <ul className="space-y-2 text-sm text-[#94a3b8]">
                <li>Na používanie služby je potrebná registrácia s platnou emailovou adresou.</li>
                <li>Používateľ je zodpovedný za bezpečnosť svojho účtu a hesla.</li>
                <li>Je zakázané používať automatizované nástroje na prístup k službe (boty, scrapery).</li>
                <li>Jeden používateľ smie mať iba jeden účet.</li>
                <li>Vyhradzujeme si právo pozastaviť alebo zrušiť účet pri porušení týchto podmienok.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-heading text-xl text-[#a78bfa]">OBMEDZENIE ZODPOVEDNOSTI</h2>
            <div className="rounded-xl p-5 card-v">
              <ul className="space-y-2 text-sm text-[#94a3b8]">
                <li>Nenesieme zodpovednosť za presnosť cien a dostupnosti zobrazených na stránke. Tieto údaje pochádzajú z externých e-shopov a môžu sa líšiť od aktuálneho stavu.</li>
                <li>Negarantujeme nepretržitú dostupnosť služby.</li>
                <li>Nenesieme zodpovednosť za nákupy uskutočnené na externých e-shopoch prostredníctvom odkazov na našej stránke.</li>
                <li>Nezodpovedáme za oneskorené alebo nedoručené notifikácie.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-heading text-xl text-[#a78bfa]">DUŠEVNÉ VLASTNÍCTVO</h2>
            <div className="rounded-xl p-5 card-v">
              <p className="text-sm text-[#94a3b8]">
                MMpokebot nie je pridružený, spojený, schválený ani žiadnym spôsobom oficiálne prepojený
                s Nintendo, The Pokémon Company, ani žiadnou ich dcérskou spoločnosťou alebo pridruženou spoločnosťou.
              </p>
              <p className="mt-3 text-sm text-[#94a3b8]">
                Pokémon a všetky súvisiace názvy, značky a obrázky sú ochranné známky a autorské práva
                spoločností Nintendo, The Pokémon Company a Creatures Inc.
              </p>
              <p className="mt-3 text-sm text-[#94a3b8]">
                Obsah a dizajn služby MMpokebot sú chránené autorským právom. Je zakázané kopírovať, upravovať
                alebo distribuovať akúkoľvek časť služby bez predchádzajúceho písomného súhlasu.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-heading text-xl text-[#a78bfa]">ZMENY PODMIENOK</h2>
            <div className="rounded-xl p-5 card-v">
              <p className="text-sm text-[#94a3b8]">
                Vyhradzujeme si právo kedykoľvek upraviť tieto podmienky. O významných zmenách budeme
                informovať prostredníctvom emailu alebo oznámenia v aplikácii. Pokračovaním v používaní
                služby po zmene podmienok vyjadrujete súhlas s novými podmienkami.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4 text-xs text-[#64748b]">
          <Link href="/privacy" className="hover:text-[#a78bfa]">Ochrana súkromia</Link>
          <span>|</span>
          <Link href="/" className="hover:text-[#a78bfa]">Hlavná stránka</Link>
        </div>
      </div>
    </div>
  )
}
