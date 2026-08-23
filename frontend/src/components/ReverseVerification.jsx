import Panel from './Panel'

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
    <Panel
      index="06"
      eyebrow="Verify numbers"
      title="📞 Reverse Verification — call the REAL number, not theirs"
      description="Scammers tell you to call the number THEY gave you. Always verify through an official number below instead."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {CONTACTS.map((contact) => (
          <li
            key={contact.name}
            style={{
              border: '1px solid var(--line)',
              borderRadius: '10px',
              padding: '16px',
            }}
          >
            <div className="wk-eyebrow">{contact.name}</div>
            <a
              href={contact.href}
              {...(contact.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="mt-2 block break-all"
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--ink)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              {contact.value}
            </a>
            <p style={{ fontSize: '14px', color: 'var(--slate)', marginTop: '8px' }}>
              {contact.description}
            </p>
          </li>
        ))}
      </ul>

      <p
        style={{
          border: '2px solid var(--amber-dk)',
          background: 'rgb(244 163 64 / 0.12)',
          borderRadius: '10px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--ink)',
        }}
      >
        ⚠ No real agency — CBI, ED, Police, RBI, TRAI — will ever ask you to
        pay money to a 'verification' or 'safe' account. If they do, it is a
        scam.
      </p>
    </Panel>
  )
}
