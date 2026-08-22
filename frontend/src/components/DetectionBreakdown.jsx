/**
 * Feature 13 — shows how the score was reached: what the rules matched,
 * what the ML model thought, and which of them drove the final number.
 */
export default function DetectionBreakdown({ result }) {
  const ml = result.ml

  return (
    <div className="rounded border border-slate-300 p-3">
      <h3 className="text-sm font-bold text-slate-900">Detection breakdown</h3>

      <dl className="mt-2 space-y-1 text-sm text-slate-800">
        <div>Rule engine: {result.rules_score}/100</div>

        {!ml || !ml.available ? (
          <div>ML model unavailable (not trained)</div>
        ) : (
          <div>
            ML model: {ml.percent}% likelihood
            {!ml.counted && (
              <span className="text-slate-600">
                {' '}
                (below threshold — not counted)
              </span>
            )}
          </div>
        )}

        <div className="font-semibold">
          Final: {result.score}/100 — {result.level}
        </div>
      </dl>

      {result.detection_note && (
        <p className="mt-2 text-sm text-slate-600">{result.detection_note}</p>
      )}
    </div>
  )
}
