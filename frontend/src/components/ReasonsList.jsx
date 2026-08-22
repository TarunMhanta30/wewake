/** Feeds feature 12 later — the per-signal breakdown. */
export default function ReasonsList({ reasons }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900">
        Why this was flagged
      </h2>

      {reasons.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">No risk signals found.</p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-200 border-y border-slate-200">
          {reasons.map((reason, i) => (
            <li
              key={`${reason.element}-${i}`}
              className="flex items-start justify-between gap-3 py-2"
            >
              <div>
                <div className="text-sm text-slate-900">{reason.label}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  matched: "{reason.matched}"
                </div>
              </div>
              <div className="shrink-0 text-sm font-semibold text-slate-900">
                +{reason.points}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
