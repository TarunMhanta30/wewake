import { useState } from 'react'
import { checkPayee, reportPayee } from '../lib/api'
import Panel from './Panel'

const RISK_COLOUR = {
  HIGH: 'var(--alarm)',
  MEDIUM: 'var(--amber-dk)',
  NEW: 'var(--amber-dk)',
  LOW: 'var(--ink)',
  UNKNOWN: 'var(--slate)',
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

  const colour = (result && RISK_COLOUR[result.risk]) || 'var(--slate)'

  return (
    <Panel
      index="04"
      eyebrow="Payee"
      title="First-Time Payee Check"
      description="A community-reported registry seeded with sample data — not a bank or NPCI feed."
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="vpa-input" className="wk-label">
            Enter a UPI ID to check
          </label>
          <input
            id="vpa-input"
            type="text"
            value={vpa}
            onChange={(e) => setVpa(e.target.value)}
            placeholder="name@bank"
            className="wk-input"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '14px' }}
          />
        </div>
        <button type="submit" disabled={loading} className="wk-btn">
          {loading ? 'Checking...' : 'Check ID'}
        </button>
        {failed && <p className="wk-err">Could not reach the server.</p>}
      </form>

      {result && (
        <div className="wk-rise space-y-3">
          <div
            className="flex items-center justify-between gap-3"
            style={{
              background: colour,
              color: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <span
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 600,
                fontSize: '20px',
                letterSpacing: '1px',
              }}
            >
              {result.risk}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: '14px',
                opacity: 0.85,
              }}
            >
              {result.reports} report{result.reports === 1 ? '' : 's'}
            </span>
          </div>

          <div className="wk-inner">
            <div className="wk-mono-row">
              <span style={{ color: 'var(--slate)' }}>UPI ID</span>
              <span className="break-all text-right" style={{ color: 'var(--ink)' }}>
                {result.vpa}
              </span>
            </div>
            <div className="wk-mono-row">
              <span style={{ color: 'var(--slate)' }}>FRAUD REPORTS</span>
              <span style={{ color: 'var(--ink)' }}>{result.reports}</span>
            </div>
            {result.known && (
              <div className="wk-mono-row">
                <span style={{ color: 'var(--slate)' }}>FIRST SEEN</span>
                <span style={{ color: 'var(--ink)' }}>{result.age_days} days ago</span>
              </div>
            )}
          </div>

          <p style={{ fontSize: '14px', color: 'var(--ink)' }}>{result.message}</p>

          <button
            type="button"
            onClick={onReport}
            disabled={reporting}
            className="wk-btn-2"
          >
            {reporting ? 'Reporting...' : 'Report this ID as fraud'}
          </button>
        </div>
      )}
    </Panel>
  )
}
