import { useState } from 'react'
import { analyze } from '../lib/api'

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
    <section className="space-y-4 border-t border-slate-300 pt-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">✋ Circuit Breaker</h2>
        <p className="mt-1 text-sm text-slate-600">
          About to pay someone under pressure? Type why — in your own words —
          before you send money.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-2">
        <label
          htmlFor="reason-input"
          className="block text-sm font-medium text-slate-900"
        >
          Why are you sending this money?
        </label>
        <textarea
          id="reason-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="e.g. paying my friend back for dinner"
          className="w-full rounded border border-slate-400 p-2 text-base text-slate-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-slate-900 py-3 text-base font-medium text-white disabled:opacity-60"
        >
          {loading ? 'Checking…' : 'Check my reason'}
        </button>
        {failed && (
          <p className="text-sm text-red-600">Could not reach the server.</p>
        )}
      </form>

      {result && caught && (
        <div className="rounded bg-red-600 p-3 text-white">
          <h3 className="text-base font-bold">
            ⚠ These are the SCAMMER'S words, not yours.
          </h3>
          <p className="mt-1 text-sm">
            The reason you typed contains language from a known scam script.
            This is what the fraudster wants you to believe. Stop and call
            someone you trust before paying.
          </p>

          {result.reasons.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm">
              {result.reasons.map((reason, i) => (
                <li key={`${reason.element}-${i}`}>
                  {reason.label} &nbsp;matched: "{reason.matched}"
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {result && !caught && (
        <div className="rounded bg-green-600 p-3 text-sm text-white">
          Your reason does not match a known scam script. If you are still
          unsure, pause and verify with someone you trust.
        </div>
      )}
    </section>
  )
}
