import { useEffect, useState } from 'react'

// Wait length comes from the danger level alone — never from an amount.
const DURATIONS = {
  DANGER: 60,
  HIGH: 30,
  CAUTION: 15,
}

/**
 * A forced pause. Scams work through speed and pressure, so the more
 * dangerous the result, the longer the user has to sit with it before
 * they can act.
 *
 * `runId` changes on every new analysis, so an identical level twice in
 * a row still restarts the countdown.
 */
export default function CoolingTimer({ level, runId }) {
  const duration = DURATIONS[level] || 0
  const [remaining, setRemaining] = useState(duration)
  const [proceeded, setProceeded] = useState(false)

  useEffect(() => {
    setRemaining(duration)
    setProceeded(false)

    if (duration <= 0) return undefined

    const intervalId = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          clearInterval(intervalId)
          return 0
        }
        return current - 1
      })
    }, 1000)

    // also clears when level/runId change, so no old interval survives
    return () => clearInterval(intervalId)
  }, [duration, runId])

  if (duration <= 0) return null

  if (proceeded) {
    return (
      <p className="text-sm text-slate-700">
        You waited. If you still feel unsure, stop and call someone you trust.
      </p>
    )
  }

  const done = remaining === 0

  return (
    <div className="rounded border-2 border-slate-800 p-3">
      <h3 className="text-base font-bold text-slate-900">
        ⏸ Cooling Period — take a breath
      </h3>

      <p className="mt-1 text-sm text-slate-800">
        You seem to be under pressure. Please wait {duration} seconds before
        doing anything. Scams depend on you acting fast.
      </p>

      <div className="mt-3 text-5xl font-bold text-slate-900">{remaining}</div>

      <button
        type="button"
        onClick={() => setProceeded(true)}
        disabled={!done}
        className="mt-3 w-full rounded bg-slate-900 py-3 text-base font-medium text-white disabled:opacity-60"
      >
        {done ? 'I understand — Proceed' : `Please wait… ${remaining}s`}
      </button>
    </div>
  )
}
