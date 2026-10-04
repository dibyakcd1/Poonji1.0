import { useState } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { SummaryCard } from '../components/SummaryCard'
import Sheet from '../components/Sheet'
import ConfirmModal from '../components/ConfirmModal'
import { fmt, dfmt, emiTotals } from '../lib/calc'

export default function EmiDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { emis, emi_txns, insert, remove } = useOutletContext()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)

  const emi = emis.find((e) => e.id === id)
  if (!emi) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-bold">EMI Record Not Found</h2>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Back to Overview
        </button>
      </div>
    )
  }

  const totals = emiTotals(emi, emi_txns)
  const txns = emi_txns
    .filter((et) => et.emi_id === emi.id)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  const handleOpenPayment = () => {
    setAmount(String(emi.emi_amount))
    setDescription(`Installment #${totals.paidCount + 1}`)
    setSheetOpen(true)
  }

  const handleRecordPayment = async (e) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    setBusy(true)
    try {
      await insert('emi_txns', {
        emi_id: emi.id,
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
      await remove('emis', emi.id)
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
            <span className="text-[11px] font-semibold text-rose uppercase tracking-wider">
              {emi.lender || 'Commercial Loan'}
            </span>
            <h1 className="text-xl font-bold text-ink truncate max-w-[200px]">{emi.name}</h1>
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
        <SummaryCard wide label="Outstanding Balance" value={fmt(totals.remaining)} tone="neg" />
        <SummaryCard label="Monthly EMI" value={fmt(emi.emi_amount)} />
        <SummaryCard label="Tenure Progress" value={`${totals.paidCount} / ${emi.tenure_months} mo`} />
        <SummaryCard label="Total Paid" value={fmt(totals.paidAmount)} tone="pos" />
        <SummaryCard label="Original Principal" value={fmt(emi.principal)} />
      </div>

      <div className="px-[18px] mb-4">
        <button
          onClick={handleOpenPayment}
          className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <span>+ Record EMI Payment ({fmt(emi.emi_amount)})</span>
        </button>
      </div>

      <div className="px-[18px]">
        <h2 className="text-sm font-bold text-ink mb-3">Installment History ({txns.length})</h2>
        {txns.length === 0 ? (
          <div className="text-center py-8 text-ink-faint text-sm bg-surface border border-dashed border-line rounded-2xl">
            No EMI installments recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {txns.map((tx, idx) => (
              <div key={tx.id} className="card p-3.5 flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold text-ink">
                    {tx.description || `Installment #${txns.length - idx}`}
                  </div>
                  <div className="text-xs text-ink-faint mt-0.5">{dfmt(tx.date)}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-rose num">−{fmt(tx.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Record EMI Outflow">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="field-label">Installment Amount (₹) *</label>
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
            <label className="field-label">Payment Date</label>
            <input
              type="date"
              className="field-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Notes / Description</label>
            <input
              className="field-input"
              placeholder="e.g. Bank auto-debit confirmation ref..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button type="button" onClick={() => setSheetOpen(false)} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Saving...' : 'Confirm EMI Payment'}
            </button>
          </div>
        </form>
      </Sheet>

      <ConfirmModal
        open={showDeleteModal}
        title={`Delete EMI for ${emi.name}?`}
        message="All payment history associated with this EMI will be permanently removed. This cannot be undone."
        confirmText="Delete EMI"
        confirmTone="rose"
        busy={busy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}
