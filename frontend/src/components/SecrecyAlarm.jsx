/**
 * Feature 6 — secrecy trigger.
 * Renders nothing unless the engine flagged a secrecy demand.
 */
export default function SecrecyAlarm({ triggered }) {
  if (!triggered) return null

  return (
    <div className="rounded border border-red-700 bg-red-600 p-3 text-sm font-semibold text-white">
      ⚠ SECRECY DEMAND DETECTED — no honest person asks you to hide a payment
      from your family.
    </div>
  )
}
