/**
 * Feature 13 — shows how the score was reached: what the rules matched,
 * what the ML model thought, and which of them drove the final number.
 */
export default function DetectionBreakdown({ result }) {
  const ml = result.ml

  const Row = ({ label, value }) => (
    <div
      className="wk-mono-row"
      style={{ borderTop: '1px solid var(--line)' }}
    >
      <span style={{ color: 'var(--slate)' }}>{label}</span>
      <span className="pl-2 text-right" style={{ color: 'var(--ink)' }}>
        {value}
      </span>
    </div>
  )

  return (
    <div className="wk-inner">
      <p className="wk-eyebrow">Detection breakdown</p>

      <div className="mt-2">
        <Row label="RULE ENGINE" value={`${result.rules_score}/100`} />

        {!ml || !ml.available ? (
          <Row label="ML MODEL" value="unavailable (not trained)" />
        ) : (
          <Row
            label="ML MODEL"
            value={
              <>
                {ml.percent}% likelihood
                {!ml.counted && (
                  <span style={{ color: 'var(--slate)' }}>
                    {' '}
                    (below threshold — not counted)
                  </span>
                )}
              </>
            }
          />
        )}

        {ml && ml.available && (
          <Row label="ML THRESHOLD" value={`${ml.threshold_percent}%`} />
        )}

        {result.language && <Row label="LANGUAGE" value={result.language} />}

        <Row label="FINAL" value={`${result.score}/100 — ${result.level}`} />
      </div>

      {result.detection_note && (
        <p style={{ fontSize: '14px', color: 'var(--slate)', marginTop: '10px' }}>
          {result.detection_note}
        </p>
      )}
    </div>
  )
}
