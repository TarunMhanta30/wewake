import { useState } from 'react'
import { decodeUpi } from '../lib/api'

// Full class strings per verdict so Tailwind's scanner keeps them.
const VERDICT_STYLES = {
  SAFE_TO_REVIEW: 'bg-slate-200 text-slate-900',
  CAUTION: 'bg-amber-400 text-black',
  DANGER: 'bg-red-600 text-white',
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

  const verdictStyle =
    (result && VERDICT_STYLES[result.verdict]) || 'bg-slate-200 text-slate-900'

  return (
    <section className="space-y-4 border-t border-slate-300 pt-6">
      <h2 className="text-lg font-bold text-slate-900">UPI Link Decoder</h2>

      <form onSubmit={onSubmit} className="space-y-2">
        <label
          htmlFor="upi-link"
          className="block text-sm font-medium text-slate-900"
        >
          Paste a UPI payment link
        </label>
        <input
          id="upi-link"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="upi://pay?pa=...&am=..."
          className="w-full rounded border border-slate-400 p-2 text-base text-slate-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-slate-900 py-3 text-base font-medium text-white disabled:opacity-60"
        >
          {loading ? 'Decoding...' : 'Decode'}
        </button>
        {failed && (
          <p className="text-sm text-red-600">Could not reach the server.</p>
        )}
      </form>

      {result && (
        <div className="space-y-3">
          <div className={`rounded p-4 text-lg font-semibold ${verdictStyle}`}>
            {result.direction}
          </div>

          {(result.payee_name || result.payee_vpa || result.amount) && (
            <div className="text-sm text-slate-700">
              {(result.payee_name || result.payee_vpa) && (
                <div>
                  Payee: {result.payee_name}
                  {result.payee_name && result.payee_vpa ? ' — ' : ''}
                  {result.payee_vpa}
                </div>
              )}
              {result.amount && <div>Amount: ₹{result.amount}</div>}
            </div>
          )}

          {result.warnings.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800">
              {result.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
