/** Feature 5 — the authority truth card. */
export default function TruthCard({ truth }) {
  if (!truth) return null

  return (
    <div className="rounded border-2 border-slate-800 p-3">
      <h2 className="text-sm font-bold uppercase text-slate-900">The truth:</h2>
      <p className="mt-1 text-sm text-slate-800">{truth}</p>
    </div>
  )
}
