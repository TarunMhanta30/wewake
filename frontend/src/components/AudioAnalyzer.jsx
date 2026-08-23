import { useState } from 'react'
import { analyzeAudio } from '../lib/api'
import Panel from './Panel'
import SecrecyAlarm from './SecrecyAlarm'
import ScoreBanner from './ScoreBanner'
import DetectionBreakdown from './DetectionBreakdown'
import MatchedScript from './MatchedScript'
import TruthCard from './TruthCard'
import ReasonsList from './ReasonsList'

/**
 * Audio Scam-Call Analyzer.
 *
 * Transcribes an uploaded recording and runs the transcript through the
 * same hybrid pipeline as pasted text, so an audio scam call is scored
 * identically. Uploaded clips only — not live call interception.
 */
export default function AudioAnalyzer() {
  const [file, setFile] = useState(null)
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setFailed(false)
    setResponse(null)
    try {
      setResponse(await analyzeAudio(file))
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  const analysis = response && response.ok ? response.analysis : null
  const step = (i) => ({ animationDelay: `${i * 60}ms` })

  return (
    <Panel
      index="10"
      eyebrow="Audio call"
      title="🎙 Audio Scam-Call Analyzer"
      description="Upload a recording of a suspicious call. WEWAKE transcribes it and runs the same coercion analysis. (Analyses uploaded recordings — not live calls.)"
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="audio-file" className="wk-label">
            Choose a recording
          </label>
          <input
            id="audio-file"
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="wk-input file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-ink file:px-3 file:py-2 file:text-sm file:text-white"
            style={{ fontSize: '14px' }}
          />
        </div>
        <button type="submit" disabled={loading || !file} className="wk-btn">
          {loading ? 'Transcribing… this can take a moment' : 'Analyse Recording'}
        </button>
        {failed && <p className="wk-err">Could not reach the server.</p>}
      </form>

      {response && !response.ok && <p className="wk-err">{response.error}</p>}

      {response && response.ok && (
        <div className="space-y-4">
          <div className="wk-inner wk-rise">
            <p className="wk-eyebrow">Transcript</p>
            <p style={{ fontSize: '14px', color: 'var(--ink)', marginTop: '8px' }}>
              {response.transcript || '(nothing was said in this recording)'}
            </p>
            <p
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: '12px',
                color: 'var(--slate)',
                marginTop: '10px',
              }}
            >
              Audio language: {response.audio_language || 'unknown'}
              {response.duration != null && ` · ${response.duration}s`}
            </p>
          </div>

          {analysis && (
            <>
              <div className="wk-rise" style={step(1)}>
                <SecrecyAlarm triggered={analysis.secrecy_triggered} />
              </div>
              <div className="wk-rise" style={step(2)}>
                <ScoreBanner score={analysis.score} level={analysis.level} />
              </div>
              <div className="wk-rise" style={step(3)}>
                <MatchedScript script={analysis.matched_script} />
              </div>
              <div className="wk-rise" style={step(4)}>
                <TruthCard truth={analysis.truth_card} />
              </div>
              <div className="wk-rise" style={step(5)}>
                <ReasonsList reasons={analysis.reasons} />
              </div>
              <div className="wk-rise" style={step(6)}>
                <DetectionBreakdown result={analysis} />
              </div>
            </>
          )}
        </div>
      )}
    </Panel>
  )
}
