// Full class strings per level so Tailwind's scanner keeps them.
const LEVEL_STYLES = {
  LOW: 'bg-green-600 text-white',
  CAUTION: 'bg-amber-400 text-black',
  HIGH: 'bg-orange-500 text-white',
  DANGER: 'bg-red-600 text-white',
}

export default function ScoreBanner({ score, level }) {
  const style = LEVEL_STYLES[level] || 'bg-slate-600 text-white'

  return (
    <div className={`rounded p-4 ${style}`}>
      <div className="text-4xl font-bold">{score} / 100</div>
      <div className="mt-1 text-lg font-semibold tracking-wide">{level}</div>
    </div>
  )
}
