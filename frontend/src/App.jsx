import { useState } from 'react'
import { analyze } from './lib/api'
import SecrecyAlarm from './components/SecrecyAlarm'
import ScoreBanner from './components/ScoreBanner'
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

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[500px] space-y-6 p-4">
        <header>
          <h1 className="text-2xl font-bold tracking-wide text-slate-900">
            WEWAKE
          </h1>
          <p className="text-sm text-slate-600">Wake up before you pay.</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-2">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-slate-900"
          >
            Paste the message or call transcript
          </label>
          <textarea
            id="message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="e.g. Sir, a parcel in your name has drugs..."
            className="w-full rounded border border-slate-400 p-2 text-base text-slate-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-slate-900 py-3 text-base font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Analysing...' : 'Analyse'}
          </button>
          {failed && (
            <p className="text-sm text-red-600">Could not reach the server.</p>
          )}
        </form>

        {result && (
          <section className="space-y-4">
            <SecrecyAlarm triggered={result.secrecy_triggered} />
            <ScoreBanner score={result.score} level={result.level} />
            <MatchedScript script={result.matched_script} />
            <TruthCard truth={result.truth_card} />
            <ReasonsList reasons={result.reasons} />
            <CoolingTimer level={result.level} runId={runId} />
          </section>
        )}

        <UpiDecoder />

        <LinkChecker />

        <PayeeCheck />

        <CircuitBreaker />

        <ReverseVerification />

        <GoldenHour />

        <EvidenceFile />
      </div>
    </div>
  )
}
