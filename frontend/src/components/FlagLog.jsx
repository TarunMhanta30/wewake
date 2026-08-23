import { useState } from 'react'
import { getLogs, disputeLog } from '../lib/api'
import Panel from './Panel'
import { riskColour } from './riskColour'

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
    <Panel
      index="09"
      eyebrow="Decision log"
      title="🧾 Why-It-Flagged Log — every decision is explainable"
      description="WEWAKE never hides why it flagged something. Here is every analysis, with its reasons. Disagree with one? Dispute it."
    >
      <button type="button" onClick={load} disabled={loading} className="wk-btn">
        {loading ? 'Loading...' : 'Load history'}
      </button>

      {failed && <p className="wk-err">Could not reach the server.</p>}

      {entries && entries.length === 0 && (
        <p className="wk-desc">
          No analyses logged yet. Run one above and load the history again.
        </p>
      )}

      {entries && entries.length > 0 && (
        <ul className="space-y-3">
          {entries.map((entry, i) => {
            const colour = riskColour(entry.level)
            return (
              <li
                key={entry.id}
                className="wk-rise"
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  padding: '16px',
                  animationDelay: `${Math.min(i, 8) * 60}ms`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                      fontSize: '12px',
                      color: 'var(--slate)',
                    }}
                  >
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                  <span
                    className="shrink-0"
                    style={{
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                      fontWeight: 700,
                      fontSize: '11px',
                      letterSpacing: '1px',
                      background: colour,
                      color: '#ffffff',
                      borderRadius: '6px',
                      padding: '3px 8px',
                    }}
                  >
                    {entry.level} · {entry.score}
                  </span>
                </div>

                <p
                  className="break-words"
                  style={{ fontSize: '14px', color: 'var(--ink)', marginTop: '10px' }}
                >
                  “{entry.text_excerpt}”
                </p>

                {entry.reasons.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {entry.reasons.map((reason, j) => (
                      <li
                        key={`${reason.element}-${j}`}
                        style={{
                          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                          fontSize: '12px',
                          color: 'var(--slate)',
                        }}
                      >
                        <span style={{ color: 'var(--alarm)', fontWeight: 700 }}>
                          +{reason.points}
                        </span>{' '}
                        {reason.label} — matched: "{reason.matched}"
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p
                    style={{
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                      fontSize: '12px',
                      color: 'var(--slate)',
                      marginTop: '8px',
                    }}
                  >
                    No risk signals found.
                  </p>
                )}

                {entry.disputed ? (
                  <span
                    className="mt-3 inline-block"
                    style={{
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                      fontWeight: 700,
                      fontSize: '11px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      color: 'var(--slate)',
                    }}
                  >
                    Disputed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => dispute(entry.id)}
                    disabled={disputing === entry.id}
                    className="wk-btn-2 mt-3"
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  >
                    {disputing === entry.id ? 'Disputing...' : 'Dispute this flag'}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
