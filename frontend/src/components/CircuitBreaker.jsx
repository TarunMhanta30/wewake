import { useEffect, useState } from 'react'
import { analyze } from '../lib/api'

// At or above this the typed reason carries scam-script language.
const SCAM_SCORE = 20

/**
 * The heart of WEWAKE. Someone under a scammer's control is repeating a
 * script they were fed. Forcing them to type the reason in their own
 * words, then scoring THAT text, shows them the scammer's language
 * coming out of their own mouth.
 */
export default function CircuitBreaker({ runId }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  // a brand-new top-level analysis wipes anything typed here before
  useEffect(() => {
    setText('')
    setResult(null)
    setFailed(false)
    setLoading(false)
  }, [runId])

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
    <div className="rounded border-2 border-slate-800 p-3">
      <h3 className="text-base font-bold text-slate-900">
        ✋ Before you pay — explain why
      </h3>

      <p className="mt-1 text-sm text-slate-800">
        In your own words, type why you are sending this money. Do not copy
        what the caller told you.
      </p>

      <form onSubmit={onSubmit} className="mt-3 space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
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
        <div className="mt-3 rounded bg-red-600 p-3 text-white">
          <h4 className="text-base font-bold">
            ⚠ These are the SCAMMER'S words, not yours.
          </h4>
          <p className="mt-1 text-sm">
            The reason you just typed contains language from a known scam
            script. This is what the fraudster wants you to believe. Stop and
            call someone you trust before paying.
          </p>

          {result.reasons.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm">
              {result.reasons.map((reason, i) => (
                <li key={`${reason.element}-${i}`}>
                  {reason.label} — matched: "{reason.matched}"
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {result && !caught && (
        <div className="mt-3 rounded bg-green-600 p-3 text-sm text-white">
          Your reason does not match a known scam script. If you are still
          unsure, pause and verify with someone you trust.
        </div>
      )}
    </div>
  )
}
