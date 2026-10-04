import { useOutletContext } from 'react-router-dom'
import { fmt, overallTotals, groupSum } from '../lib/calc'

export default function Reports() {
  const { businesses, transactions } = useOutletContext()
  const bizName = (id) => businesses.find((b) => b.id === id)?.name || 'Unknown'

  const inv = transactions.filter((t) => t.type === 'investment')
  const exp = transactions.filter((t) => t.type === 'expense')
  const invTotal = inv.reduce((s, t) => s + Number(t.amount), 0)
  const expTotal = exp.reduce((s, t) => s + Number(t.amount), 0)

  const invByBiz = groupSum(inv, (t) => bizName(t.biz_id))
  const invByType = groupSum(inv, (t) => t.purpose || t.category || 'General')
  const expByCat = groupSum(exp, (t) => t.category || 'Other')
  const expByBiz = groupSum(exp, (t) => bizName(t.biz_id))

  const o = overallTotals(transactions)
  const opening = 0
  const closing = opening + o.income + o.invested - o.expense - o.withdrawn

  return (
    <div>
      <header className="px-[18px] pt-5 pb-3.5">
        <div className="font-display text-violet text-[15px] font-bold tracking-tight">Poonji</div>
        <h1 className="text-[26px] font-bold mt-0.5">Capital Reports</h1>
      </header>

      <div className="px-[18px] pb-6">
        <div className="card p-4 mb-3">
          <div className="text-sm font-bold mb-3">Cash Flow Statement</div>
          <Row label="Opening Balance" value={fmt(opening)} />
          <Row label="+ Income" value={fmt(o.income)} tone="pos" />
          <Row label="+ Investment" value={fmt(o.invested)} tone="pos" />
          <Row label="− Expenses" value={fmt(o.expense)} tone="neg" />
          <Row label="− Withdrawals" value={fmt(o.withdrawn)} tone="neg" />
          <Row label="± Transfers (internal, net zero)" value={fmt(0)} />
          <Row label="Closing Balance" value={fmt(closing)} total />
        </div>

        <div className="card p-4 mb-3">
          <div className="text-sm font-bold mb-3">Investment Report · Total {fmt(invTotal)}</div>
          <div className="text-xs text-ink-faint mb-2.5">By business</div>
          <BarList pairs={invByBiz} total={invTotal} color="#6C5CE7" />
          <div className="text-xs text-ink-faint mt-3.5 mb-2.5">By purpose / type</div>
          <BarList pairs={invByType} total={invTotal} color="#12B886" />
        </div>

        <div className="card p-4">
          <div className="text-sm font-bold mb-3">Expense Report · Total {fmt(expTotal)}</div>
          <div className="text-xs text-ink-faint mb-2.5">By category</div>
          <BarList pairs={expByCat} total={expTotal} color="#FF6B6B" />
          <div className="text-xs text-ink-faint mt-3.5 mb-2.5">By business</div>
          <BarList pairs={expByBiz} total={expTotal} color="#FFA94D" />
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, tone, total }) {
  const cls = tone === 'pos' ? 'text-em' : tone === 'neg' ? 'text-rose' : ''
  return (
    <div className={total ? 'flex justify-between py-3 mt-1 border-t-2 border-ink font-bold text-[15px]' : 'flex justify-between py-2 text-[13.5px] border-b border-dashed border-line'}>
      <span>{label}</span><span className={`num ${cls}`}>{value}</span>
    </div>
  )
}
function BarList({ pairs, total, color }) {
  if (!pairs.length) return <div className="text-center py-5 text-ink-faint text-sm">No data yet.</div>
  return pairs.map(([label, val]) => {
    const pct = total ? Math.round((val / total) * 100) : 0
    return (
      <div key={label} className="mb-2.5">
        <div className="flex justify-between text-[12.5px] mb-1.5 text-ink-dim"><span>{label}</span><b className="text-ink num">{fmt(val)} · {pct}%</b></div>
        <div className="h-2 bg-surface2 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} /></div>
      </div>
    )
  })
}
