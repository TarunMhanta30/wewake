import { useEffect, useState } from 'react'
import { riskColour } from './riskColour'

// Wait length comes from the danger level alone — never from an amount.
const DURATIONS = {
  DANGER: 60,
  HIGH: 30,
  CAUTION: 15,
}

const R = 54
const CIRC = 2 * Math.PI * R

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
      <p className="wk-desc">
        You waited. If you still feel unsure, stop and call someone you trust.
      </p>
    )
  }

  const done = remaining === 0
  const offset = CIRC - (remaining / duration) * CIRC
  const colour = riskColour(level)

  return (
    <div className="wk-inner">
      <p className="wk-eyebrow">⏸ Cooling period — take a breath</p>

      <p style={{ fontSize: '14px', color: 'var(--ink)', marginTop: '8px' }}>
        You seem to be under pressure. Please wait {duration} seconds before
        doing anything. Scams depend on you acting fast.
      </p>

      <div className="mt-4 flex justify-center">
        <svg
          viewBox="0 0 130 130"
          className="h-32 w-32"
          role="img"
          aria-label={`${remaining} seconds remaining`}
        >
          <circle
            cx="65"
            cy="65"
            r={R}
            fill="none"
            stroke="var(--mist-2)"
            strokeWidth="8"
          />
          <circle
            className="wk-ring"
            cx="65"
            cy="65"
            r={R}
            fill="none"
            stroke={colour}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            transform="rotate(-90 65 65)"
          />
          <text
            x="65"
            y="66"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'JetBrains Mono', ui-monospace, monospace"
            fontSize="34"
            fontWeight="700"
            fill="var(--ink)"
          >
            {remaining}
          </text>
        </svg>
      </div>

      <button
        type="button"
        onClick={() => setProceeded(true)}
        disabled={!done}
        className="wk-btn mt-3"
      >
        {done ? 'I understand — Proceed' : `Please wait… ${remaining}s`}
      </button>
    </div>
  )
}
