/**
 * Feature 6 — secrecy trigger.
 * Renders nothing unless the engine flagged a secrecy demand.
 */
export default function SecrecyAlarm({ triggered }) {
  if (!triggered) return null

  return (
    <div
      className="wk-alarm-enter"
      role="alert"
      style={{
        background: 'var(--alarm)',
        color: '#ffffff',
        borderRadius: '10px',
        padding: '14px 16px',
        fontWeight: 700,
        fontSize: '14px',
        lineHeight: 1.45,
      }}
    >
      ⚠ SECRECY DEMAND DETECTED — no honest person asks you to hide a payment
      from your family.
    </div>
  )
}
