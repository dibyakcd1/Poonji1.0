import { useState } from 'react'

export default function AddEmiForm({ accounts = [], onCancel, onSave }) {
  const [name, setName] = useState('')
  const [lender, setLender] = useState('')
  const [principal, setPrincipal] = useState('')
  const [emiAmount, setEmiAmount] = useState('')
  const [tenure, setTenure] = useState('')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [accountId, setAccountId] = useState(accounts[0]?.id || '')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !emiAmount) return
    setBusy(true)
    try {
      await onSave({
        name: name.trim(),
        lender: lender.trim(),
        principal: Number(principal) || (Number(emiAmount) * (Number(tenure) || 1)),
        emi_amount: Number(emiAmount),
        tenure_months: Number(tenure) || 12,
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
        <label className="field-label">Loan / Asset Name *</label>
        <input
          required
          className="field-input"
          placeholder="e.g. Delivery Van Commercial Loan, Store Fitout"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Lender / Financial Institution</label>
        <input
          className="field-input"
          placeholder="e.g. Tata Capital, HDFC Bank, Private Lender"
          value={lender}
          onChange={(e) => setLender(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Monthly EMI (₹) *</label>
          <input
            required
            type="number"
            min="1"
            className="field-input font-mono font-bold"
            placeholder="18500"
            value={emiAmount}
            onChange={(e) => setEmiAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Tenure (Months) *</label>
          <input
            required
            type="number"
            min="1"
            className="field-input font-mono"
            placeholder="36"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Total Principal Borrowed (₹)</label>
          <input
            type="number"
            className="field-input font-mono"
            placeholder="650000"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">First Installment Date</label>
          <input
            type="date"
            className="field-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="field-label">Auto-Debit Account</label>
        <select
          className="field-input"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="">(None / Other)</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Notes</label>
        <input
          className="field-input"
          placeholder="e.g. Vehicle reg number, loan account number..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex gap-2.5 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="btn-primary flex-1">
          {busy ? 'Saving...' : 'Add Loan / EMI'}
        </button>
      </div>
    </form>
  )
}
