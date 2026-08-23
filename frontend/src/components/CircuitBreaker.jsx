import { useState } from 'react'
import { analyze } from '../lib/api'
import Panel from './Panel'

// At or above this the typed reason carries scam-script language.
const SCAM_SCORE = 20

/**
 * The heart of WEWAKE. Someone under a scammer's control is repeating a
 * script they were fed. Forcing them to type the reason in their own
 * words, then scoring THAT text, shows them the scammer's language
 * coming out of their own mouth.
 *
 * Standalone: it does not require a coercion analysis first, because the
 * moment someone is about to pay is exactly when they will not stop to
 * run one.
 */
export default function CircuitBreaker() {
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
      setResult(await analyze(text))
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  const caught = result && result.score >= SCAM_SCORE

  return (
    <Panel
      index="05"
      eyebrow="Circuit breaker"
      title="✋ Circuit Breaker"
      description="About to pay someone under pressure? Type why — in your own words — before you send money."
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="reason-input" className="wk-label">
            Why are you sending this money?
          </label>
          <textarea
            id="reason-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="e.g. paying my friend back for dinner"
            className="wk-textarea"
          />
        </div>
        <button type="submit" disabled={loading} className="wk-btn">
          {loading ? 'Checking…' : 'Check my reason'}
        </button>
        {failed && <p className="wk-err">Could not reach the server.</p>}
      </form>

      {result && caught && (
        <div
          className="wk-rise"
          style={{
            background: 'var(--alarm)',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <h3
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 700,
              fontSize: '19px',
            }}
          >
            ⚠ These are the SCAMMER'S words, not yours.
          </h3>
          <p style={{ fontSize: '14px', marginTop: '8px', lineHeight: 1.5 }}>
            The reason you typed contains language from a known scam script.
            This is what the fraudster wants you to believe. Stop and call
            someone you trust before paying.
          </p>

          {result.reasons.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {result.reasons.map((reason, i) => (
                <li key={`${reason.element}-${i}`} style={{ fontSize: '14px' }}>
                  {reason.label}{' '}
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                      fontSize: '12px',
                      opacity: 0.85,
                    }}
                  >
                    matched: "{reason.matched}"
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {result && !caught && (
        <div
          className="wk-rise"
          style={{
            border: '2px solid var(--ink)',
            borderRadius: '12px',
            padding: '20px',
            fontSize: '14px',
            color: 'var(--ink)',
          }}
        >
          Your reason does not match a known scam script. If you are still
          unsure, pause and verify with someone you trust.
        </div>
      )}
    </Panel>
  )
}
