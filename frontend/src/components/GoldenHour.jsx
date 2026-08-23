import { useEffect, useState } from 'react'
import Panel from './Panel'

const GOLDEN_HOUR_SECONDS = 60 * 60

// Order matters: blocking the account comes before any phone call,
// because every minute of delay lowers the chance of a freeze.
const STEPS = [
  'Hang up / stop all contact with the caller. Do not explain, do not pay more.',
  'Open your bank app and BLOCK your card, UPI, and net-banking now. Block first, ask questions later.',
  "Call your bank's 24x7 fraud helpline (number is on the back of your debit card). Ask them to freeze the account and note a reference number.",
  <>
    Call{' '}
    <a href="tel:1930" className="wk-link">
      1930
    </a>{' '}
    — the National Cyber Crime Helpline. Give them the transaction ID/UTR,
    amount, time. They alert the receiving bank to freeze the money.
  </>,
  'Note down the 1930 complaint reference number they give you.',
  <>
    File the complaint at{' '}
    <a
      href="https://cybercrime.gov.in"
      target="_blank"
      rel="noopener noreferrer"
      className="wk-link"
    >
      cybercrime.gov.in
    </a>{' '}
    within 24 hours using that reference number.
  </>,
  "In your UPI app (GPay/PhonePe/Paytm), open the transaction and raise a 'Fraudulent Transaction' dispute.",
  "Save all evidence: transaction IDs, SMS, screenshots, the scammer's number and any chat.",
]

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Golden Hour Mode.
 *
 * Recovery after a fraudulent transfer is a race: reported within minutes
 * the receiving bank can freeze the funds, after a couple of hours the
 * money is usually gone. The countdown exists to convey that urgency; the
 * checklist keeps a panicking person moving in the right order.
 */
export default function GoldenHour() {
  const [started, setStarted] = useState(false)
  const [remaining, setRemaining] = useState(GOLDEN_HOUR_SECONDS)
  const [done, setDone] = useState([])

  useEffect(() => {
    if (!started) return undefined

    const intervalId = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          clearInterval(intervalId)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [started])

  function start() {
    setRemaining(GOLDEN_HOUR_SECONDS)
    setDone([])
    setStarted(true)
  }

  function reset() {
    setStarted(false)
    setRemaining(GOLDEN_HOUR_SECONDS)
    setDone([])
  }

  function toggle(index) {
    setDone((current) =>
      current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index],
    )
  }

  const expired = started && remaining === 0
  const pct = Math.round((done.length / STEPS.length) * 100)

  return (
    <Panel
      index="07"
      eyebrow="Golden hour"
      title="🚨 Golden Hour Mode — money already sent?"
      description="The first hour decides whether you get your money back. Reported within minutes, banks can freeze it. Start now."
    >
      {!started ? (
        <button type="button" onClick={start} className="wk-btn-alarm">
          Start Golden Hour
        </button>
      ) : (
        <div className="space-y-4">
          <div
            className="text-center"
            style={{
              background: 'var(--alarm)',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <p
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: '11px',
                letterSpacing: '2px',
                opacity: 0.9,
              }}
            >
              TIME REMAINING
            </p>
            <div
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontWeight: 700,
                fontSize: '46px',
                lineHeight: 1.1,
                marginTop: '4px',
              }}
            >
              {formatTime(remaining)}
            </div>
            {expired && (
              <p style={{ fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>
                The easy window has passed — but still report. Recovery is
                harder now, not impossible.
              </p>
            )}
          </div>

          <div>
            <p
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: '12px',
                color: 'var(--slate)',
              }}
            >
              Step {done.length} of {STEPS.length} done
            </p>
            <div
              className="mt-2 overflow-hidden"
              style={{ height: '6px', borderRadius: '999px', background: 'var(--mist-2)' }}
            >
              <div
                className="wk-progress h-full"
                style={{ width: `${pct}%`, background: 'var(--ink)', borderRadius: '999px' }}
              />
            </div>
          </div>

          <ol className="space-y-2">
            {STEPS.map((step, index) => {
              const checked = done.includes(index)
              return (
                <li
                  key={index}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: '10px',
                    padding: '14px',
                    background: checked ? 'var(--mist)' : 'transparent',
                    transition: 'background 200ms ease',
                  }}
                >
                  <label className="flex cursor-pointer items-start gap-3">
                    <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(index)}
                        className="h-5 w-5 cursor-pointer appearance-none"
                        style={{
                          border: '1px solid var(--line)',
                          borderRadius: '5px',
                          background: checked ? 'var(--ink)' : 'var(--paper)',
                          transition: 'background 200ms ease',
                        }}
                      />
                      {checked && (
                        <svg
                          viewBox="0 0 16 16"
                          className="wk-tick pointer-events-none absolute h-3.5 w-3.5"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 8.5l3.2 3.2L13 5"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.5 }}>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                          fontWeight: 700,
                          color: 'var(--slate)',
                        }}
                      >
                        {index + 1}.
                      </span>{' '}
                      {step}
                    </span>
                  </label>
                </li>
              )
            })}
          </ol>

          <button type="button" onClick={reset} className="wk-btn-2 w-full">
            Reset
          </button>
        </div>
      )}
    </Panel>
  )
}
