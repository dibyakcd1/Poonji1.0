import { TYPES, fmt, dfmt } from '../lib/calc'

export function TxnRow({ txn, bizName, onOpen }) {
  const conf = TYPES[txn.type] || TYPES.expense

  return (
    <div
      onClick={() => onOpen && onOpen(txn)}
      className="card p-3.5 mb-2 flex items-center justify-between cursor-pointer hover:border-violet/40 transition-colors group active:scale-[0.99]"
    >
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
          style={{ backgroundColor: `${conf.color}18`, color: conf.color }}
        >
          {conf.sign}
        </div>
        <div className="min-w-0 truncate">
          <div className="text-[14px] font-semibold text-ink group-hover:text-violet transition-colors truncate flex items-center gap-1.5">
            <span className="truncate">{txn.description || txn.category || conf.label}</span>
            {txn.doc_url && (
              <span className="text-xs text-violet shrink-0" title="Receipt Attached">
                📎
              </span>
            )}
          </div>
          <div className="text-[11px] text-ink-faint flex items-center gap-1.5 mt-0.5 truncate">
            <span>{dfmt(txn.date)}</span>
            {bizName && <span className="font-medium text-ink-dim truncate">· {bizName}</span>}
            {txn.ref_code && <span className="font-mono text-ink-dim/80">· {txn.ref_code}</span>}
            {txn.vendor && <span className="truncate">· {txn.vendor}</span>}
            {txn.category && !bizName && <span className="truncate">· {txn.category}</span>}
          </div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div
          className={`text-[15px] font-bold num ${
            conf.tone === 'pos' ? 'text-em' : conf.tone === 'neg' ? 'text-rose' : 'text-ink'
          }`}
        >
          {conf.sign} {fmt(txn.amount)}
        </div>
        <div className="text-[10px] uppercase font-semibold text-ink-faint tracking-wider">
          {conf.short || conf.label}
        </div>
      </div>
    </div>
  )
}

export default function TxnList({ txns = [], businesses = [], onOpen }) {
  if (txns.length === 0) {
    return (
      <div className="text-center py-12 px-4 text-ink-faint text-xs bg-surface border border-dashed border-line rounded-2xl">
        <div className="text-2xl mb-1.5">🔍</div>
        <div className="font-semibold text-ink text-sm mb-0.5">No transactions found</div>
        <div>Try adjusting your duration range, type, or search keywords.</div>
      </div>
    )
  }

  const bizMap = {}
  businesses.forEach((b) => {
    bizMap[b.id] = b.name
  })

  return (
    <div className="space-y-1">
      {txns.map((t) => (
        <TxnRow
          key={t.id}
          txn={t}
          bizName={t.biz_id ? bizMap[t.biz_id] : null}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}
