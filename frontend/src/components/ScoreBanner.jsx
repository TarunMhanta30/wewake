import { riskColour } from './riskColour'

export default function ScoreBanner({ score, level }) {
  return (
    <div
      style={{
        background: riskColour(level),
        color: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontWeight: 700,
          fontSize: '40px',
          lineHeight: 1,
        }}
      >
        {score}
        <span style={{ fontSize: '18px', opacity: 0.75 }}> / 100</span>
      </div>
      <div
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 600,
          fontSize: '20px',
          marginTop: '6px',
          letterSpacing: '1px',
        }}
      >
        {level}
      </div>
    </div>
  )
}
