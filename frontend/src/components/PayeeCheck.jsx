import { useState } from 'react'
import { checkPayee, reportPayee } from '../lib/api'

// Full class strings per risk so Tailwind's scanner keeps them.
const RISK_STYLES = {
  HIGH: 'bg-red-600 text-white',
  MEDIUM: 'bg-amber-400 text-black',
  NEW: 'bg-amber-400 text-black',
  LOW: 'bg-green-600 text-white',
  UNKNOWN: 'bg-slate-200 text-slate-900',
}

export default function PayeeCheck() {
  const [vpa, setVpa] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [failed, setFailed] = useState(false)

  // The id the current card describes, so reporting cannot drift to
  // whatever has since been typed into the input.
  const [checkedVpa, setCheckedVpa] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setFailed(false)
    setResult(null)
    try {
      setResult(await checkPayee(vpa))
      setCheckedVpa(vpa)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  async function onReport() {
    setReporting(true)
    setFailed(false)
    try {
      setResult(await reportPayee(checkedVpa))
    } catch {
      setFailed(true)
    } finally {
      setReporting(false)
    }
  }

  const riskStyle =
    (result && RISK_STYLES[result.risk]) || 'bg-slate-200 text-slate-900'

  return (
    <section className="space-y-4 border-t border-slate-300 pt-6">
      <h2 className="text-lg font-bold text-slate-900">
        First-Time Payee Check
      </h2>

      <form onSubmit={onSubmit} className="space-y-2">
        <label
          htmlFor="vpa-input"
          className="block text-sm font-medium text-slate-900"
        >
          Enter a UPI ID to check
        </label>
        <input
          id="vpa-input"
          type="text"
          value={vpa}
          onChange={(e) => setVpa(e.target.value)}
          placeholder="name@bank"
          className="w-full rounded border border-slate-400 p-2 text-base text-slate-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-slate-900 py-3 text-base font-medium text-white disabled:opacity-60"
        >
          {loading ? 'Checking...' : 'Check ID'}
        </button>
        {failed && (
          <p className="text-sm text-red-600">Could not reach the server.</p>
        )}
      </form>

      {result && (
        <div className="space-y-3">
          <div className={`rounded p-4 text-lg font-bold ${riskStyle}`}>
            {result.risk}
          </div>

          <div className="break-all text-sm text-slate-700">
            <div>UPI ID: {result.vpa}</div>
            <div>Fraud reports: {result.reports}</div>
            {result.known && <div>First seen: {result.age_days} days ago</div>}
          </div>

          <p className="text-sm text-slate-900">{result.message}</p>

          <button
            type="button"
            onClick={onReport}
            disabled={reporting}
            className="rounded border border-slate-400 px-3 py-2 text-sm text-slate-900 disabled:opacity-60"
          >
            {reporting ? 'Reporting...' : 'Report this ID as fraud'}
          </button>
        </div>
      )}
    </section>
  )
}
