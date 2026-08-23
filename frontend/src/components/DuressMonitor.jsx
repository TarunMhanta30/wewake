import { useEffect, useRef, useState } from 'react'
import { riskOnDark } from './riskColour'

const R = 92
const DASH = 578 // 2πr, rounded as specified
const SWEEP = 900 // ms, matches the arc transition in index.css

// Idle trace is mostly flat; DANGER trace spikes harder.
const TRACE_CALM =
  'M0,20 L58,20 L64,16 L70,24 L76,20 L150,20 L156,17 L162,23 L168,20 L240,20'
const TRACE_ALERT =
  'M0,20 L40,20 L46,6 L52,34 L58,12 L64,20 L112,20 L118,3 L124,37 L130,13 L136,20 L188,20 L194,7 L200,33 L206,20 L240,20'

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * The Duress Monitor.
 *
 * Presentation only: it renders whatever the coercion analyser already
 * put in state. It never calls the API itself.
 */
export default function DuressMonitor({ result, loading }) {
  const score = result ? result.score : 0
  const level = result ? result.level : null
  const colour = result ? riskOnDark(level) : 'var(--dim)'
  const danger = level === 'DANGER'

  const [shown, setShown] = useState(0)
  const frame = useRef(0)

  // count the number up in step with the arc sweep
  useEffect(() => {
    cancelAnimationFrame(frame.current)
    if (prefersReducedMotion()) {
      setShown(score)
      return undefined
    }
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / SWEEP, 1)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setShown(Math.round(score * eased))
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [score, result])

  const offset = DASH - (Math.max(0, Math.min(score, 100)) / 100) * DASH

  const Row = ({ label, value }) => (
    <div className="wk-mono-row">
      <span style={{ color: 'var(--line)' }}>{label}</span>
      <span className="truncate pl-2 text-right text-white">{value}</span>
    </div>
  )

  return (
    <div
      className={danger ? 'wk-danger-glow' : ''}
      style={{
        background: 'var(--ink)',
        borderRadius: '20px',
        padding: '32px',
        color: '#ffffff',
        boxShadow: danger ? undefined : '0 20px 50px rgb(16 24 46 / 0.25)',
      }}
    >
      <h1
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 700,
          fontSize: '34px',
          letterSpacing: '1px',
          color: '#ffffff',
          lineHeight: 1.1,
        }}
      >
        WEWAKE
      </h1>
      <p
        style={{
          fontStyle: 'italic',
          color: 'var(--amber)',
          fontSize: '15px',
          marginTop: '4px',
        }}
      >
        Wake up before you pay.
      </p>
      <p
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: '11px',
          letterSpacing: '1px',
          color: 'var(--dim)',
          marginTop: '10px',
        }}
      >
        ENGLISH · हिंदी · मराठी
      </p>

      {/* gauge */}
      <div
        className={`relative mt-6 overflow-hidden rounded-2xl ${
          loading ? 'wk-scan' : ''
        }`}
      >
        <svg
          viewBox="0 0 210 210"
          className="mx-auto block h-[210px] w-[210px] max-w-full"
          role="img"
          aria-label={
            result
              ? `Threat score ${score} of 100, level ${level}`
              : 'Standby. No message analysed yet.'
          }
        >
          <circle
            cx="105"
            cy="105"
            r={R}
            fill="none"
            stroke="var(--track)"
            strokeWidth="14"
          />
          <circle
            className="wk-arc"
            cx="105"
            cy="105"
            r={R}
            fill="none"
            stroke={colour}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={DASH}
            strokeDashoffset={offset}
            transform="rotate(-90 105 105)"
          />
          <text
            x="105"
            y="102"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'JetBrains Mono', ui-monospace, monospace"
            fontSize="58"
            fontWeight="700"
            fill={colour}
          >
            {result ? shown : 0}
          </text>
          <text
            x="105"
            y="140"
            textAnchor="middle"
            fontFamily="'JetBrains Mono', ui-monospace, monospace"
            fontSize="13"
            fill="var(--dim)"
          >
            / 100
          </text>
        </svg>
      </div>

      {/* level word */}
      <p
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 700,
          fontSize: '26px',
          letterSpacing: '2px',
          textAlign: 'center',
          color: colour,
          marginTop: '8px',
        }}
      >
        {result ? level : 'STANDBY'}
      </p>

      {result && result.secrecy_triggered && (
        <p
          className="mt-3 rounded-lg px-3 py-2 text-center"
          style={{
            background: 'var(--alarm)',
            color: '#ffffff',
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: '11px',
            letterSpacing: '1px',
          }}
        >
          ⚠ SECRECY DEMAND DETECTED
        </p>
      )}

      {/* breakdown */}
      <div
        className="mt-5 pt-4"
        style={{ borderTop: '1px solid var(--track)' }}
      >
        <Row label="RULES" value={result ? result.rules_score : '—'} />
        <Row
          label="ML MODEL"
          value={
            result && result.ml && result.ml.available
              ? `${result.ml.percent}%`
              : '—'
          }
        />
        <Row
          label="LANGUAGE"
          value={result && result.language ? result.language : '—'}
        />
      </div>

      {/* ECG */}
      <svg
        viewBox="0 0 240 40"
        preserveAspectRatio="none"
        className="mt-4 block h-10 w-full"
        aria-hidden="true"
      >
        <path
          d={danger ? TRACE_ALERT : TRACE_CALM}
          fill="none"
          stroke="var(--track)"
          strokeWidth="1.5"
        />
        <path
          className={danger ? 'wk-ecg-alert' : 'wk-ecg-idle'}
          d={danger ? TRACE_ALERT : TRACE_CALM}
          pathLength="100"
          fill="none"
          stroke={colour}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {!result && (
        <p
          className="text-center"
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: '11px',
            letterSpacing: '1px',
            color: 'var(--dim)',
          }}
        >
          {loading ? 'ANALYSING…' : 'No message analysed yet.'}
        </p>
      )}
    </div>
  )
}
