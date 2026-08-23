/** Feeds feature 12 later — the per-signal breakdown. */
export default function ReasonsList({ reasons }) {
  return (
    <div>
      <h3 className="wk-h" style={{ fontSize: '18px' }}>
        Why this was flagged
      </h3>

      {reasons.length === 0 ? (
        <p className="wk-desc mt-2">No risk signals found.</p>
      ) : (
        <ul className="mt-3">
          {reasons.map((reason, i) => (
            <li
              key={`${reason.element}-${i}`}
              className="flex items-start justify-between gap-4 py-3"
              style={{
                borderTop: i === 0 ? 'none' : '1px solid var(--line)',
              }}
            >
              <div className="min-w-0">
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: 'var(--ink)',
                  }}
                >
                  {reason.label}
                </div>
                <div
                  className="truncate"
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    fontSize: '12px',
                    color: 'var(--slate)',
                    marginTop: '2px',
                  }}
                >
                  matched: "{reason.matched}"
                </div>
              </div>
              <div
                className="shrink-0"
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'var(--alarm)',
                }}
              >
                +{reason.points}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
