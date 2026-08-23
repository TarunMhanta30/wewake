/** Feature 4 — which known scam script this message follows. */
export default function MatchedScript({ script }) {
  if (!script) {
    return <p className="wk-desc">No known scam script strongly matched.</p>
  }

  return (
    <div className="wk-inner">
      <h3
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 600,
          fontSize: '18px',
          color: 'var(--ink)',
        }}
      >
        {script.name}
      </h3>
      <p
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: '13px',
          color: 'var(--slate)',
          marginTop: '4px',
        }}
      >
        Match confidence: {script.confidence}%
      </p>
      <p style={{ fontSize: '14px', color: 'var(--ink)', marginTop: '8px' }}>
        {script.tagline}
      </p>
    </div>
  )
}
