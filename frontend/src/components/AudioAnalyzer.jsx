import { useState } from 'react'
import { analyzeAudio } from '../lib/api'
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

  return (
    <section className="space-y-4 border-t border-slate-300 pt-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          🎙 Audio Scam-Call Analyzer
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload a recording of a suspicious call. WEWAKE transcribes it and
          runs the same coercion analysis. (Analyses uploaded recordings — not
          live calls.)
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-2">
        <label
          htmlFor="audio-file"
          className="block text-sm font-medium text-slate-900"
        >
          Choose a recording
        </label>
        <input
          id="audio-file"
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0] || null)}
          className="w-full rounded border border-slate-400 p-2 text-sm text-slate-900"
        />
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full rounded bg-slate-900 py-3 text-base font-medium text-white disabled:opacity-60"
        >
          {loading ? 'Transcribing… this can take a moment' : 'Analyse Recording'}
        </button>
        {failed && (
          <p className="text-sm text-red-600">Could not reach the server.</p>
        )}
      </form>

      {response && !response.ok && (
        <p className="text-sm text-red-600">{response.error}</p>
      )}

      {response && response.ok && (
        <div className="space-y-4">
          <div className="rounded border border-slate-300 p-3">
            <h3 className="text-sm font-bold text-slate-900">Transcript</h3>
            <p className="mt-1 text-sm text-slate-800">
              {response.transcript || '(nothing was said in this recording)'}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Audio language: {response.audio_language || 'unknown'}
              {response.duration != null && ` · ${response.duration}s`}
            </p>
          </div>

          {analysis && (
            <>
              <SecrecyAlarm triggered={analysis.secrecy_triggered} />
              <ScoreBanner score={analysis.score} level={analysis.level} />
              <DetectionBreakdown result={analysis} />
              <MatchedScript script={analysis.matched_script} />
              <TruthCard truth={analysis.truth_card} />
              <ReasonsList reasons={analysis.reasons} />
            </>
          )}
        </div>
      )}
    </section>
  )
}
