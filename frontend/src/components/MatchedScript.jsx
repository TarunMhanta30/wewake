/** Feature 4 — which known scam script this message follows. */
export default function MatchedScript({ script }) {
  if (!script) {
    return (
      <p className="text-sm text-slate-600">
        No known scam script strongly matched.
      </p>
    )
  }

  return (
    <div className="rounded border border-slate-300 p-3">
      <h2 className="text-base font-semibold text-slate-900">{script.name}</h2>
      <p className="mt-1 text-sm text-slate-600">
        Match confidence: {script.confidence}%
      </p>
      <p className="mt-2 text-sm text-slate-700">{script.tagline}</p>
    </div>
  )
}
