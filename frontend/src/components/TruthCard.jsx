/** Feature 5 — the authority truth card. */
export default function TruthCard({ truth }) {
  if (!truth) return null

  return (
    <div
      style={{
        border: '2px solid var(--ink)',
        borderRadius: '10px',
        padding: '16px',
      }}
    >
      <p className="wk-eyebrow">The truth</p>
      <p style={{ fontSize: '14px', color: 'var(--ink)', marginTop: '8px' }}>
        {truth}
      </p>
    </div>
  )
}
