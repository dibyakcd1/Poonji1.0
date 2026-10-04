import { useState } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { SummaryCard } from '../components/SummaryCard'
import Sheet from '../components/Sheet'
import ConfirmModal from '../components/ConfirmModal'
import { fmt, dfmt, loanTotals } from '../lib/calc'

export default function LoanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loans, loan_txns, insert, remove } = useOutletContext()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [type, setType] = useState('interest')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)

  const loan = loans.find((l) => l.id === id)
  if (!loan) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-bold">Loan Record Not Found</h2>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Back to Overview
        </button>
      </div>
    )
  }

  const totals = loanTotals(loan, loan_txns)
  const txns = loan_txns
    .filter((lt) => lt.loan_id === loan.id)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  const handleRecordTxn = async (e) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    setBusy(true)
    try {
      await insert('loan_txns', {
        loan_id: loan.id,
        type,
        amount: Number(amount),
        date,
        description: description.trim()
      })
      setSheetOpen(false)
      setAmount('')
      setDescription('')
    } finally {
      setBusy(false)
    }
  }

  const handleConfirmDelete = async () => {
    setBusy(true)
    try {
      await remove('loans', loan.id)
      navigate('/')
    } finally {
      setBusy(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="pb-20">
      <header className="px-[18px] pt-5 pb-3 flex items-center justify-between sticky top-0 bg-bg z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center text-ink text-sm hover:bg-surface2 transition-colors cursor-pointer"
          >
            ←
          </button>
          <div>
            <span className="text-[11px] font-semibold text-amber uppercase tracking-wider">
              Loan Given
            </span>
            <h1 className="text-xl font-bold text-ink truncate max-w-[200px]">{loan.borrower}</h1>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-xs text-rose font-medium hover:underline p-1 cursor-pointer"
        >
          Delete
        </button>
      </header>

      <div className="px-[18px] pb-4 grid grid-cols-2 gap-2.5">
        <SummaryCard wide label="Outstanding Principal" value={fmt(totals.outstanding)} tone="neg" />
        <SummaryCard label="Original Principal" value={fmt(loan.principal)} />
        <SummaryCard label="Interest Rate" value={`${loan.rate}% / mo`} />
        <SummaryCard label="Total Interest Earned" value={fmt(totals.interest)} tone="pos" />
        <SummaryCard label="Principal Repaid" value={fmt(totals.principalRepaid)} tone="pos" />
      </div>

      <div className="px-[18px] mb-4">
        <button
          onClick={() => setSheetOpen(true)}
          className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <span>+ Record Payment / Interest</span>
        </button>
      </div>

      <div className="px-[18px]">
        <h2 className="text-sm font-bold text-ink mb-3">Payment History ({txns.length})</h2>
        {txns.length === 0 ? (
          <div className="text-center py-8 text-ink-faint text-sm bg-surface border border-dashed border-line rounded-2xl">
            No payments recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {txns.map((tx) => (
              <div key={tx.id} className="card p-3.5 flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold text-ink">
                    {tx.type === 'interest' ? 'Interest Payment' : 'Principal Repayment'}
                  </div>
                  <div className="text-xs text-ink-faint mt-0.5">
                    {dfmt(tx.date)} {tx.description && `· ${tx.description}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-em num">+{fmt(tx.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Record Loan Receipt">
        <form onSubmit={handleRecordTxn} className="space-y-4">
          <div>
            <label className="field-label">Payment Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`py-2 text-xs font-semibold rounded-xl border ${
                  type === 'interest'
                    ? 'bg-violet text-white border-violet'
                    : 'bg-surface border-line text-ink-dim hover:bg-surface2'
                }`}
                onClick={() => setType('interest')}
              >
                Interest Payment
              </button>
              <button
                type="button"
                className={`py-2 text-xs font-semibold rounded-xl border ${
                  type === 'repayment'
                    ? 'bg-violet text-white border-violet'
                    : 'bg-surface border-line text-ink-dim hover:bg-surface2'
                }`}
                onClick={() => setType('repayment')}
              >
                Principal Repayment
              </button>
            </div>
          </div>

          <div>
            <label className="field-label">Amount Received (₹) *</label>
            <input
              required
              type="number"
              min="1"
              className="field-input text-lg font-bold font-mono"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Date Received</label>
            <input
              type="date"
              className="field-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Description / Remarks</label>
            <input
              className="field-input"
              placeholder="e.g. March interest payment, bank transfer..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button type="button" onClick={() => setSheetOpen(false)} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Sheet>

      <ConfirmModal
        open={showDeleteModal}
        title={`Delete Loan to ${loan.borrower}?`}
        message="All payment records associated with this loan will be removed. This cannot be undone."
        confirmText="Delete Loan"
        confirmTone="rose"
        busy={busy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}
