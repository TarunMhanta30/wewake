import { useEffect, useState } from 'react'

const GOLDEN_HOUR_SECONDS = 60 * 60

// Order matters: blocking the account comes before any phone call,
// because every minute of delay lowers the chance of a freeze.
const STEPS = [
  'Hang up / stop all contact with the caller. Do not explain, do not pay more.',
  'Open your bank app and BLOCK your card, UPI, and net-banking now. Block first, ask questions later.',
  "Call your bank's 24x7 fraud helpline (number is on the back of your debit card). Ask them to freeze the account and note a reference number.",
  <>
    Call{' '}
    <a href="tel:1930" className="font-bold text-blue-700 underline">
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
      className="font-bold text-blue-700 underline"
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

  return (
    <section className="space-y-4 border-t border-slate-300 pt-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          🚨 Golden Hour Mode — money already sent?
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          The first hour decides whether you get your money back. Reported
          within minutes, banks can freeze it. Start now.
        </p>
      </div>

      {!started ? (
        <button
          type="button"
          onClick={start}
          className="w-full rounded bg-red-600 py-3 text-base font-bold text-white"
        >
          Start Golden Hour
        </button>
      ) : (
        <div className="space-y-4">
          <div className="rounded border-2 border-red-600 p-3 text-center">
            <div className="text-5xl font-bold text-slate-900">
              {formatTime(remaining)}
            </div>
            {expired && (
              <p className="mt-2 text-sm font-semibold text-slate-900">
                The easy window has passed — but still report. Recovery is
                harder now, not impossible.
              </p>
            )}
          </div>

          <p className="text-sm font-semibold text-slate-900">
            Step {done.length} of {STEPS.length} done
          </p>

          <ol className="space-y-2">
            {STEPS.map((step, index) => (
              <li key={index} className="rounded border border-slate-300 p-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={done.includes(index)}
                    onChange={() => toggle(index)}
                    className="mt-1 h-5 w-5 shrink-0"
                  />
                  <span className="text-sm text-slate-800">
                    <span className="font-semibold">{index + 1}.</span> {step}
                  </span>
                </label>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={reset}
            className="w-full rounded border border-slate-400 py-3 text-base font-medium text-slate-900"
          >
            Reset
          </button>
        </div>
      )}
    </section>
  )
}
