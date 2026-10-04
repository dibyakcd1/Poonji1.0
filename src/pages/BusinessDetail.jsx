import { useState } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { SummaryCard } from '../components/SummaryCard'
import TxnList from '../components/TxnRow'
import ConfirmModal from '../components/ConfirmModal'
import { fmt, bizTotals } from '../lib/calc'

export default function BusinessDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { businesses, transactions, openAddTxn, openEditTxn, remove } = useOutletContext()
  const [filterType, setFilterType] = useState('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [busy, setBusy] = useState(false)

  const biz = businesses.find((b) => b.id === id)
  if (!biz) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-bold">Business Not Found</h2>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Back to Overview
        </button>
      </div>
    )
  }

  const totals = bizTotals(biz.id, transactions)
  let txns = transactions.filter((t) => t.biz_id === biz.id)
  if (filterType !== 'all') {
    txns = txns.filter((t) => t.type === filterType)
  }

  const handleConfirmDelete = async () => {
    setBusy(true)
    try {
      await remove('businesses', biz.id)
      navigate('/')
    } finally {
      setBusy(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="px-[18px] pt-5 pb-3 flex items-center justify-between sticky top-0 bg-bg z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center text-ink text-sm hover:bg-surface2 transition-colors cursor-pointer"
          >
            ←
          </button>
          <div>
            <span className="text-[11px] font-semibold text-violet uppercase tracking-wider">
              {biz.type || 'Business'}
            </span>
            <h1 className="text-xl font-bold text-ink truncate max-w-[200px]">{biz.name}</h1>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-xs text-rose font-medium hover:underline p-1 cursor-pointer"
        >
          Delete
        </button>
      </header>

      {/* Financial Summary */}
      <div className="px-[18px] pb-4 grid grid-cols-2 gap-2.5">
        <SummaryCard wide label="Net Business Balance" value={fmt(totals.balance)} tone={totals.balance < 0 ? 'neg' : 'pos'} />
        <SummaryCard label="Total Invested" value={fmt(totals.invested)} />
        <SummaryCard label="Total Income" value={fmt(totals.income)} tone="pos" />
        <SummaryCard label="Total Expenses" value={fmt(totals.expense)} tone="neg" />
        <SummaryCard label="Total Withdrawn" value={fmt(totals.withdrawn)} />
      </div>

      {/* Quick Action Buttons */}
      <div className="px-[18px] mb-4">
        <div className="card p-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => openAddTxn(biz.id, 'investment')}
            className="px-3 py-2 rounded-xl bg-violet/10 text-violet text-xs font-bold hover:bg-violet/20 whitespace-nowrap cursor-pointer"
          >
            + Invest
          </button>
          <button
            onClick={() => openAddTxn(biz.id, 'income')}
            className="px-3 py-2 rounded-xl bg-em/10 text-em text-xs font-bold hover:bg-em/20 whitespace-nowrap cursor-pointer"
          >
            + Income
          </button>
          <button
            onClick={() => openAddTxn(biz.id, 'expense')}
            className="px-3 py-2 rounded-xl bg-rose/10 text-rose text-xs font-bold hover:bg-rose/20 whitespace-nowrap cursor-pointer"
          >
            − Expense
          </button>
          <button
            onClick={() => openAddTxn(biz.id, 'withdrawal')}
            className="px-3 py-2 rounded-xl bg-amber/10 text-amber text-xs font-bold hover:bg-amber/20 whitespace-nowrap cursor-pointer"
          >
            − Drawing
          </button>
        </div>
      </div>

      {/* Filter Tabs & Transactions */}
      <div className="px-[18px]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-ink">Transaction History ({txns.length})</h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {['all', 'investment', 'income', 'expense', 'withdrawal'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`chip ${filterType === t ? 'chip-active' : ''}`}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <TxnList txns={txns} onOpen={openEditTxn} />
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title={`Delete ${biz.name}?`}
        message="Transactions associated with this business may also be affected. This cannot be undone."
        confirmText="Delete Business"
        confirmTone="rose"
        busy={busy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}
