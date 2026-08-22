import { useState } from 'react'

const BLANK = '[TO BE FILLED]'
const DIVIDER = '----------------------------------------'

const FIELDS = [
  { key: 'name', label: 'Your full name' },
  { key: 'mobile', label: 'Your mobile number' },
  { key: 'bank', label: 'Your bank name' },
  { key: 'account', label: 'Your bank account number (or UPI ID)' },
  { key: 'amount', label: 'Amount lost (₹)' },
  { key: 'datetime', label: 'Date & time of the transaction' },
  { key: 'txnId', label: 'Transaction ID / UTR / UPI reference number' },
  {
    key: 'beneficiary',
    label: 'Money was sent to (UPI ID / account number of the fraudster, if known)',
  },
  { key: 'fraudsterContact', label: "Fraudster's phone number / email (if any)" },
  { key: 'description', label: 'Short description of what happened' },
]

const EMPTY_FORM = Object.fromEntries(FIELDS.map((field) => [field.key, '']))

/** A blank field becomes [TO BE FILLED] so nothing is silently omitted. */
function orBlank(value) {
  const trimmed = (value || '').trim()
  return trimmed === '' ? BLANK : trimmed
}

/**
 * Build the complaint document. Exported so the exact output can be
 * checked without driving the UI.
 */
export function buildComplaint(form, generatedAt = new Date()) {
  return `${DIVIDER}
CYBER FINANCIAL FRAUD COMPLAINT
Prepared for filing at cybercrime.gov.in / Helpline 1930
Generated: ${generatedAt.toLocaleString()}

COMPLAINANT
Name: ${orBlank(form.name)}
Mobile: ${orBlank(form.mobile)}
Bank: ${orBlank(form.bank)}
Account / UPI ID: ${orBlank(form.account)}

TRANSACTION DETAILS
Amount lost: ₹${orBlank(form.amount)}
Date & time: ${orBlank(form.datetime)}
Transaction ID / UTR / UPI Ref: ${orBlank(form.txnId)}
Money sent to: ${orBlank(form.beneficiary)}

FRAUDSTER DETAILS
Phone / email used: ${orBlank(form.fraudsterContact)}

DESCRIPTION OF INCIDENT
${orBlank(form.description)}

EVIDENCE TO ATTACH WHEN FILING
- Bank debit SMS alert(s)
- Screenshot(s) of the transaction
- The fraudster's phone number / UPI ID / links
- Any chat or call logs with the fraudster

DECLARATION
The above information is true to the best of my knowledge.
${DIVIDER}`
}

/**
 * Evidence File Generator.
 *
 * Most victims never report because the form feels insurmountable. This
 * collects what NCRP asks for and hands back a document they can paste
 * straight into cybercrime.gov.in. Nothing is sent anywhere — the text
 * never leaves the browser.
 */
export default function EvidenceFile() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [complaint, setComplaint] = useState('')
  const [status, setStatus] = useState('')

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function generate(e) {
    e.preventDefault()
    setComplaint(buildComplaint(form))
    setStatus('')
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(complaint)
      setStatus('Copied to clipboard.')
    } catch {
      setStatus('Could not copy — select the text and copy manually.')
    }
  }

  function download() {
    const blob = new Blob([complaint], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'wewake_complaint.txt'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
    setStatus('Downloaded wewake_complaint.txt')
  }

  return (
    <section className="space-y-4 border-t border-slate-300 pt-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          📄 Evidence File — build your complaint
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Fill what you know. We format a ready-to-file complaint for 1930 and
          cybercrime.gov.in. Blank fields are marked so you can complete them.
        </p>
      </div>

      <form onSubmit={generate} className="space-y-3">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label
              htmlFor={`evidence-${field.key}`}
              className="block text-sm font-medium text-slate-900"
            >
              {field.label}
            </label>
            <input
              id={`evidence-${field.key}`}
              type="text"
              value={form[field.key]}
              onChange={(e) => update(field.key, e.target.value)}
              className="mt-1 w-full rounded border border-slate-400 p-2 text-base text-slate-900"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full rounded bg-slate-900 py-3 text-base font-medium text-white"
        >
          Generate Complaint
        </button>
      </form>

      {complaint && (
        <div className="space-y-3">
          <textarea
            readOnly
            value={complaint}
            rows={26}
            className="w-full rounded border border-slate-400 p-2 font-mono text-xs text-slate-900"
          />

          <div className="space-y-2">
            <button
              type="button"
              onClick={copy}
              className="w-full rounded border border-slate-400 py-3 text-base font-medium text-slate-900"
            >
              Copy to clipboard
            </button>
            <button
              type="button"
              onClick={download}
              className="w-full rounded border border-slate-400 py-3 text-base font-medium text-slate-900"
            >
              Download as .txt
            </button>
          </div>

          {status && <p className="text-sm text-slate-700">{status}</p>}

          <p className="text-sm text-slate-800">
            When ready, file it here:{' '}
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-700 underline"
            >
              cybercrime.gov.in
            </a>{' '}
            or call{' '}
            <a href="tel:1930" className="font-bold text-blue-700 underline">
              1930
            </a>
          </p>
        </div>
      )}
    </section>
  )
}
