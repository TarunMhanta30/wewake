import { useState } from 'react'
import { getLogs, disputeLog } from '../lib/api'

// Full class strings per level so Tailwind's scanner keeps them.
const LEVEL_STYLES = {
  LOW: 'bg-green-600 text-white',
  CAUTION: 'bg-amber-400 text-black',
  HIGH: 'bg-orange-500 text-white',
  DANGER: 'bg-red-600 text-white',
}

/**
 * Why-It-Flagged Log.
 *
 * The answer to "is this app spyware?" — every score it has ever given is
 * listed here with the reasons behind it, and any of them can be disputed.
 */
export default function FlagLog() {
  const [entries, setEntries] = useState(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [disputing, setDisputing] = useState(null)

  async function load() {
    setLoading(true)
    setFailed(false)
    try {
      setEntries(await getLogs())
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  async function dispute(logId) {
    setDisputing(logId)
    setFailed(false)
    try {
      await disputeLog(logId)
      setEntries(await getLogs())
    } catch {
      setFailed(true)
    } finally {
      setDisputing(null)
    }
  }

  return (
    <section className="space-y-4 border-t border-slate-300 pt-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          🧾 Why-It-Flagged Log — every decision is explainable
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          WEWAKE never hides why it flagged something. Here is every analysis,
          with its reasons. Disagree with one? Dispute it.
        </p>
      </div>

      <button
        type="button"
        onClick={load}
        disabled={loading}
        className="w-full rounded bg-slate-900 py-3 text-base font-medium text-white disabled:opacity-60"
      >
        {loading ? 'Loading...' : 'Load history'}
      </button>

      {failed && (
        <p className="text-sm text-red-600">Could not reach the server.</p>
      )}

      {entries && entries.length === 0 && (
        <p className="text-sm text-slate-600">
          No analyses logged yet. Run one above and load the history again.
        </p>
      )}

      {entries && entries.length > 0 && (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded border border-slate-300 p-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs text-slate-500">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
                <span
                  className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${
                    LEVEL_STYLES[entry.level] || 'bg-slate-200 text-slate-900'
                  }`}
                >
                  {entry.level} · {entry.score}
                </span>
              </div>

              <p className="mt-2 break-words text-sm text-slate-800">
                “{entry.text_excerpt}”
              </p>

              {entry.reasons.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {entry.reasons.map((reason, i) => (
                    <li
                      key={`${reason.element}-${i}`}
                      className="text-xs text-slate-700"
                    >
                      <span className="font-semibold">+{reason.points}</span>{' '}
                      {reason.label} — matched: "{reason.matched}"
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  No risk signals found.
                </p>
              )}

              {entry.disputed ? (
                <span className="mt-3 inline-block rounded bg-slate-200 px-2 py-1 text-xs font-bold text-slate-900">
                  Disputed
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => dispute(entry.id)}
                  disabled={disputing === entry.id}
                  className="mt-3 rounded border border-slate-400 px-3 py-1 text-xs text-slate-900 disabled:opacity-60"
                >
                  {disputing === entry.id ? 'Disputing...' : 'Dispute this flag'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
