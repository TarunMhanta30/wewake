/**
 * Reverse Verification.
 *
 * Every impersonation scam depends on the victim trusting the number the
 * scammer handed them. These are the official published numbers to call
 * instead — static reference data, no API call, no state.
 */
const CONTACTS = [
  {
    name: 'Cyber Crime Helpline',
    value: '1930',
    href: 'tel:1930',
    external: false,
    description:
      'National 24x7 helpline for financial cyber fraud (I4C, Ministry of ' +
      'Home Affairs). Call immediately if money was lost.',
  },
  {
    name: 'Cyber Crime Portal',
    value: 'cybercrime.gov.in',
    href: 'https://cybercrime.gov.in',
    external: true,
    description: 'Official government portal to file a cyber fraud complaint.',
  },
  {
    name: 'RBI Helpline',
    value: '14440',
    href: 'tel:14440',
    external: false,
    description:
      'Reserve Bank of India helpline for fraudulent banking transactions.',
  },
  {
    name: 'TRAI / Spam SMS',
    value: '1909',
    href: 'tel:1909',
    external: false,
    description:
      'Report spam or fraudulent SMS. TRAI never calls about SIM/mobile ' +
      'disconnection — such calls are scams.',
  },
  {
    name: 'Report Suspicious Calls',
    value: 'Chakshu (Sanchar Saathi)',
    href: 'https://sancharsaathi.gov.in/sfc/',
    external: true,
    description:
      'Government platform to report suspected fraud calls and messages.',
  },
  {
    name: 'Police Helpline',
    value: '112',
    href: 'tel:112',
    external: false,
    description: 'National emergency police number.',
  },
  {
    name: 'Women Helpline',
    value: '181',
    href: 'tel:181',
    external: false,
    description: 'National helpline for women in distress.',
  },
]

export default function ReverseVerification() {
  return (
    <section className="space-y-4 border-t border-slate-300 pt-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          📞 Reverse Verification — call the REAL number, not theirs
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Scammers tell you to call the number THEY gave you. Always verify
          through an official number below instead.
        </p>
      </div>

      <ul className="space-y-2">
        {CONTACTS.map((contact) => (
          <li
            key={contact.name}
            className="rounded border border-slate-300 p-3"
          >
            <div className="text-sm font-semibold text-slate-900">
              {contact.name}
            </div>
            <a
              href={contact.href}
              {...(contact.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="mt-1 block break-all text-base font-bold text-blue-700 underline"
            >
              {contact.value}
            </a>
            <p className="mt-1 text-sm text-slate-700">{contact.description}</p>
          </li>
        ))}
      </ul>

      <p className="rounded border-2 border-amber-500 bg-amber-50 p-3 text-sm font-semibold text-slate-900">
        ⚠ No real agency — CBI, ED, Police, RBI, TRAI — will ever ask you to
        pay money to a 'verification' or 'safe' account. If they do, it is a
        scam.
      </p>
    </section>
  )
}
