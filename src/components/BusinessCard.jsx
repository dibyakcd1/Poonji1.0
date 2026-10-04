import { Link } from 'react-router-dom'

const PALETTE = ['#6C5CE7', '#12B886', '#4C7BF3', '#FFA94D', '#FF6B6B', '#845EC2', '#00C9A7']

export function colorForIndex(i = 0) {
  return PALETTE[i % PALETTE.length]
}

export function EntityCard({
  to,
  avatarLetter = 'B',
  avatarColor = '#6C5CE7',
  title,
  subtitle,
  balanceLabel = 'Balance',
  balanceValue,
  balanceTone = '',
  stats = []
}) {
  const CardWrapper = to ? Link : 'div'

  return (
    <CardWrapper
      to={to}
      className="card p-4 mb-2.5 block hover:border-violet/40 transition-colors group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {avatarLetter}
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-ink group-hover:text-violet transition-colors">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-ink-dim mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {balanceValue !== undefined && (
          <div className="text-right">
            <div
              className={`text-[17px] font-bold num ${
                balanceTone === 'neg' ? 'text-rose' : balanceTone === 'pos' ? 'text-em' : 'text-ink'
              }`}
            >
              {balanceValue}
            </div>
            <div className="text-[10.5px] font-medium text-ink-faint uppercase tracking-wider">
              {balanceLabel}
            </div>
          </div>
        )}
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-line/70">
          {stats.map((s, idx) => (
            <div key={idx} className="text-left">
              <span className="text-[10px] uppercase font-semibold text-ink-faint block">
                {s.label}
              </span>
              <span
                className={`text-xs font-bold num ${
                  s.tone === 'pos' ? 'text-em' : s.tone === 'neg' ? 'text-rose' : 'text-ink'
                }`}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </CardWrapper>
  )
}
