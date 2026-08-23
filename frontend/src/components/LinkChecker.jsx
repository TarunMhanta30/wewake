import { useState } from 'react'
import { checkLink } from '../lib/api'
import Panel from './Panel'

const VERDICT_COLOUR = {
  DANGER: 'var(--alarm)',
  SUSPICIOUS: 'var(--amber-dk)',
  LOOKS_OK: 'var(--ink)',
  NO_LINK: 'var(--slate)',
}

export default function LinkChecker() {
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
      setResult(await checkLink(text))
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  const colour = (result && VERDICT_COLOUR[result.verdict]) || 'var(--ink)'

  return (
    <Panel
      index="03"
      eyebrow="Link check"
      title="Link &amp; App Checker"
      description="Heuristic pattern-matching on the domain — not a live threat database."
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="link-input" className="wk-label">
            Paste a link to check
          </label>
          <input
            id="link-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://..."
            className="wk-input"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '14px' }}
          />
        </div>
        <button type="submit" disabled={loading} className="wk-btn">
          {loading ? 'Checking...' : 'Check'}
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
              {result.verdict.replace(/_/g, ' ')}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: '14px',
                opacity: 0.85,
              }}
            >
              score {result.score}
            </span>
          </div>

          {result.host && (
            <div className="wk-inner">
              <div className="wk-mono-row">
                <span style={{ color: 'var(--slate)' }}>HOST</span>
                <span className="break-all text-right" style={{ color: 'var(--ink)' }}>
                  {result.host}
                </span>
              </div>
            </div>
          )}

          {result.reasons.length > 0 && (
            <ul className="space-y-2">
              {result.reasons.map((reason, i) => (
                <li key={i} className="flex gap-2" style={{ fontSize: '14px', color: 'var(--ink)' }}>
                  <span style={{ color: 'var(--alarm)' }} aria-hidden="true">▸</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          )}

          <p style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 500 }}>
            {result.advice}
          </p>
        </div>
      )}
    </Panel>
  )
}
