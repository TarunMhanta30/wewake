import { useState } from 'react'
import { checkLink } from '../lib/api'

// Full class strings per verdict so Tailwind's scanner keeps them.
const VERDICT_STYLES = {
  DANGER: 'bg-red-600 text-white',
  SUSPICIOUS: 'bg-amber-400 text-black',
  LOOKS_OK: 'bg-green-600 text-white',
  NO_LINK: 'bg-slate-200 text-slate-900',
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

  const verdictStyle =
    (result && VERDICT_STYLES[result.verdict]) || 'bg-slate-200 text-slate-900'

  return (
    <section className="space-y-4 border-t border-slate-300 pt-6">
      <h2 className="text-lg font-bold text-slate-900">Link &amp; App Checker</h2>

      <form onSubmit={onSubmit} className="space-y-2">
        <label
          htmlFor="link-input"
          className="block text-sm font-medium text-slate-900"
        >
          Paste a link to check
        </label>
        <input
          id="link-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://..."
          className="w-full rounded border border-slate-400 p-2 text-base text-slate-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-slate-900 py-3 text-base font-medium text-white disabled:opacity-60"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
        {failed && (
          <p className="text-sm text-red-600">Could not reach the server.</p>
        )}
      </form>

      {result && (
        <div className="space-y-3">
          <div className={`rounded p-4 text-lg font-bold ${verdictStyle}`}>
            {result.verdict}
          </div>

          {result.host && (
            <div className="break-all text-sm text-slate-700">
              Host: {result.host}
            </div>
          )}

          {result.reasons.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800">
              {result.reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          )}

          <p className="text-sm text-slate-900">{result.advice}</p>
        </div>
      )}
    </section>
  )
}
