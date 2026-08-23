import { useState } from 'react'
import { analyze } from './lib/api'
import Panel from './components/Panel'
import DuressMonitor from './components/DuressMonitor'
import SecrecyAlarm from './components/SecrecyAlarm'
import ScoreBanner from './components/ScoreBanner'
import DetectionBreakdown from './components/DetectionBreakdown'
import MatchedScript from './components/MatchedScript'
import TruthCard from './components/TruthCard'
import ReasonsList from './components/ReasonsList'
import CoolingTimer from './components/CoolingTimer'
import UpiDecoder from './components/UpiDecoder'
import LinkChecker from './components/LinkChecker'
import PayeeCheck from './components/PayeeCheck'
import CircuitBreaker from './components/CircuitBreaker'
import ReverseVerification from './components/ReverseVerification'
import GoldenHour from './components/GoldenHour'
import EvidenceFile from './components/EvidenceFile'
import FlagLog from './components/FlagLog'
import AudioAnalyzer from './components/AudioAnalyzer'

export default function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  // bumped on every successful analysis so the cooling timer restarts
  const [runId, setRunId] = useState(0)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setFailed(false)
    setResult(null)
    try {
      setResult(await analyze(text))
      setRunId((n) => n + 1)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  // result blocks rise in with a short stagger
  const step = (i) => ({ animationDelay: `${i * 60}ms` })

  return (
    <div className="min-h-screen bg-mist">
      <div className="mx-auto flex w-full max-w-shell flex-col gap-5 p-4 lg:flex-row lg:items-start lg:gap-7 lg:p-7">
        {/* ---------------- LEFT: duress monitor ---------------- */}
        <aside className="w-full lg:sticky lg:top-7 lg:w-[400px] lg:shrink-0 lg:self-start">
          <DuressMonitor result={result} loading={loading} />
        </aside>

        {/* ---------------- RIGHT: the tools ---------------- */}
        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <Panel
            index="01"
            eyebrow="Analyse message"
            title="Analyse a message or call transcript"
            description="Works in English, Hindi and Marathi — in Devanagari or Roman script."
          >
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label htmlFor="message" className="wk-label">
                  Paste the message or call transcript
                </label>
                <textarea
                  id="message"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  placeholder="Paste in English, Hindi or Marathi — e.g. किसी को मत बताना, तुरंत पैसे भेजो"
                  className="wk-textarea"
                />
              </div>
              <button type="submit" disabled={loading} className="wk-btn-alarm">
                {loading ? 'Analysing...' : 'Analyse'}
              </button>
              {failed && <p className="wk-err">Could not reach the server.</p>}
            </form>

            {result && (
              <div className="space-y-4">
                <div className="wk-rise" style={step(0)}>
                  <SecrecyAlarm triggered={result.secrecy_triggered} />
                </div>
                <div className="wk-rise" style={step(1)}>
                  <ScoreBanner score={result.score} level={result.level} />
                </div>
                <div className="wk-rise" style={step(2)}>
                  <MatchedScript script={result.matched_script} />
                </div>
                <div className="wk-rise" style={step(3)}>
                  <TruthCard truth={result.truth_card} />
                </div>
                <div className="wk-rise" style={step(4)}>
                  <ReasonsList reasons={result.reasons} />
                </div>
                <div className="wk-rise" style={step(5)}>
                  <DetectionBreakdown result={result} />
                </div>
                <div className="wk-rise" style={step(6)}>
                  <CoolingTimer level={result.level} runId={runId} />
                </div>
              </div>
            )}
          </Panel>

          <UpiDecoder />
          <LinkChecker />
          <PayeeCheck />
          <CircuitBreaker />
          <ReverseVerification />
          <GoldenHour />
          <EvidenceFile />
          <FlagLog />
          <AudioAnalyzer />
        </main>
      </div>
    </div>
  )
}
