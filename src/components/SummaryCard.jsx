export function SummaryCard({ label, value, tone, wide = false }) {
  let valColor = 'text-ink'
  if (tone === 'pos') valColor = 'text-em'
  else if (tone === 'neg') valColor = 'text-rose'

  return (
    <div className={`card p-4 flex flex-col justify-between ${wide ? 'col-span-2' : ''}`}>
      <span className="text-xs font-medium text-ink-dim tracking-tight">{label}</span>
      <span className={`text-[19px] font-bold num mt-1.5 ${valColor}`}>{value}</span>
    </div>
  )
}
