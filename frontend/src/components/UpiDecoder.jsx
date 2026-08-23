import { useState } from 'react'
import { decodeUpi } from '../lib/api'
import Panel from './Panel'

const VERDICT_COLOUR = {
  SAFE_TO_REVIEW: 'var(--ink)',
  CAUTION: 'var(--amber-dk)',
  DANGER: 'var(--alarm)',
}

export default function UpiDecoder() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setFailed(false)
    setResult(null)
    try {
      setResult(await decodeUpi(text))
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  const colour = (result && VERDICT_COLOUR[result.verdict]) || 'var(--ink)'

  return (
    <Panel
      index="02"
      eyebrow="UPI link"
      title="UPI Link Decoder"
      description="Paste a UPI payment link to see which way the money actually moves."
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="upi-link" className="wk-label">
            Paste a UPI payment link
          </label>
          <input
            id="upi-link"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="upi://pay?pa=...&am=..."
            className="wk-input"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '14px' }}
          />
        </div>
        <button type="submit" disabled={loading} className="wk-btn">
          {loading ? 'Decoding...' : 'Decode'}
        </button>
        {failed && <p className="wk-err">Could not reach the server.</p>}
      </form>

      {result && (
        <div className="wk-rise space-y-3">
          <div
            style={{
              background: colour,
              color: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <p
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: '11px',
                letterSpacing: '2px',
                opacity: 0.85,
              }}
            >
              {result.verdict.replace(/_/g, ' ')}
            </p>
            <p style={{ fontSize: '17px', fontWeight: 600, marginTop: '8px', lineHeight: 1.45 }}>
              {result.direction}
            </p>
          </div>

          {(result.payee_name || result.payee_vpa || result.amount) && (
            <div className="wk-inner">
              {(result.payee_name || result.payee_vpa) && (
                <div className="wk-mono-row">
                  <span style={{ color: 'var(--slate)' }}>PAYEE</span>
                  <span className="break-all text-right" style={{ color: 'var(--ink)' }}>
                    {result.payee_name}
                    {result.payee_name && result.payee_vpa ? ' — ' : ''}
                    {result.payee_vpa}
                  </span>
                </div>
              )}
              {result.amount && (
                <div className="wk-mono-row">
                  <span style={{ color: 'var(--slate)' }}>AMOUNT</span>
                  <span style={{ color: 'var(--ink)' }}>₹{result.amount}</span>
                </div>
              )}
            </div>
          )}

          {result.warnings.length > 0 && (
            <ul className="space-y-2">
              {result.warnings.map((warning, i) => (
                <li key={i} className="flex gap-2" style={{ fontSize: '14px', color: 'var(--ink)' }}>
                  <span style={{ color: 'var(--alarm)' }} aria-hidden="true">▸</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Panel>
  )
}
