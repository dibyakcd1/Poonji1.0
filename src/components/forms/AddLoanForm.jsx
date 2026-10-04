import { useState } from 'react'

export default function AddLoanForm({ accounts = [], onCancel, onSave }) {
  const [borrower, setBorrower] = useState('')
  const [principal, setPrincipal] = useState('')
  const [rate, setRate] = useState('2.0')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [accountId, setAccountId] = useState(accounts[0]?.id || '')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!borrower.trim() || !principal) return
    setBusy(true)
    try {
      await onSave({
        borrower: borrower.trim(),
        principal: Number(principal),
        rate: Number(rate) || 0,
        start_date: startDate,
        account_id: accountId || null,
        notes: notes.trim()
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Borrower Name / Party *</label>
        <input
          required
          className="field-input"
          placeholder="e.g. Borrower or Counterparty Name"
          value={borrower}
          onChange={(e) => setBorrower(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Principal Amount (₹) *</label>
          <input
            required
            type="number"
            min="1"
            className="field-input font-mono font-bold"
            placeholder="150000"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Interest Rate (% / month)</label>
          <input
            type="number"
            step="0.1"
            className="field-input font-mono"
            placeholder="2.0"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Disbursement Date</label>
          <input
            type="date"
            className="field-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Disbursed From Account</label>
          <select
            className="field-input"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            <option value="">(None / External)</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">Notes / Agreement Details</label>
        <textarea
          rows={2}
          className="field-input resize-none"
          placeholder="e.g. Promissory note signed, expected return in 6 months..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex gap-2.5 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="btn-primary flex-1">
          {busy ? 'Saving...' : 'Record Loan'}
        </button>
      </div>
    </form>
  )
}
