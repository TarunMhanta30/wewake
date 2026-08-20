import { useState } from 'react'
import { analyze } from './lib/api'

export default function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      setResult(await analyze(text))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <main className="mx-auto w-full max-w-md">
        <h1 className="text-xl font-semibold text-slate-900">wewake</h1>
        <p className="mt-1 text-sm text-slate-500">Skeleton — wire check only.</p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Paste a message…"
            className="w-full rounded border border-slate-300 p-3 text-base"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-slate-900 py-3 text-base text-white disabled:opacity-50"
          >
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {result && (
          <pre className="mt-4 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </main>
    </div>
  )
}
