import { useState } from 'react'
import { TYPES } from '../../lib/calc'

export default function AddTxnSheet({
  businesses = [],
  accounts = [],
  initialType = 'expense',
  defaultBizId = null,
  editTxn = null,
  onCancel,
  onSave,
  onDelete
}) {
  const [type, setType] = useState(editTxn?.type || initialType || 'expense')
  const [amount, setAmount] = useState(editTxn?.amount ? String(editTxn.amount) : '')
  const [date, setDate] = useState(
    editTxn?.date || new Date().toISOString().slice(0, 10)
  )
  const [bizId, setBizId] = useState(editTxn?.biz_id || defaultBizId || businesses[0]?.id || '')
  const [accountId, setAccountId] = useState(
    editTxn?.account_id || accounts[0]?.id || ''
  )
  const [toAccountId, setToAccountId] = useState(editTxn?.to_account_id || '')
  const [toBizId, setToBizId] = useState(editTxn?.to_biz_id || '')
  const [category, setCategory] = useState(editTxn?.category || '')
  const [purpose, setPurpose] = useState(editTxn?.purpose || '')
  const [vendor, setVendor] = useState(editTxn?.vendor || '')
  const [description, setDescription] = useState(editTxn?.description || '')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    setBusy(true)

    try {
      await onSave(
        type,
        {
          amount: Number(amount),
          date,
          biz_id: type === 'transfer' ? bizId || null : bizId,
          account_id: accountId || null,
          to_account_id: type === 'transfer' ? toAccountId || null : null,
          to_biz_id: type === 'transfer' ? toBizId || null : null,
          category: category.trim(),
          purpose: purpose.trim(),
          vendor: vendor.trim(),
          description: description.trim()
        },
        file
      )
    } finally {
      setBusy(false)
    }
  }

  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = async () => {
    if (!editTxn || !onDelete) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 4000)
      return
    }
    setBusy(true)
    try {
      await onDelete(editTxn.id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selector Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {Object.entries(TYPES).map(([k, v]) => (
          <button
            key={k}
            type="button"
            onClick={() => setType(k)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              type === k
                ? 'bg-violet text-white shadow-xs'
                : 'bg-surface2 text-ink-dim hover:text-ink'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <div>
        <label className="field-label">Amount (₹) *</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-ink-dim">
            ₹
          </span>
          <input
            required
            type="number"
            min="1"
            className="field-input pl-8 text-xl font-bold font-mono"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      {/* Date & Account */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Date</label>
          <input
            type="date"
            className="field-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">{type === 'transfer' ? 'From Account' : 'Account'}</label>
          <select
            className="field-input"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Business Association */}
      {type !== 'transfer' ? (
        <div>
          <label className="field-label">Business *</label>
          <select
            required
            className="field-input"
            value={bizId}
            onChange={(e) => setBizId(e.target.value)}
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">To Account</label>
            <select
              className="field-input"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
            >
              <option value="">(Select Account)</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Target Business (Opt)</label>
            <select
              className="field-input"
              value={toBizId}
              onChange={(e) => setToBizId(e.target.value)}
            >
              <option value="">(None / General)</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Dynamic fields based on type */}
      {type === 'expense' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Category</label>
            <input
              className="field-input"
              placeholder="e.g. Rent, Fleet, Raw Material"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Vendor / Payee</label>
            <input
              className="field-input"
              placeholder="e.g. Tata Motors, Landlord"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
            />
          </div>
        </div>
      )}

      {(type === 'investment' || type === 'withdrawal') && (
        <div>
          <label className="field-label">Purpose / Allocation</label>
          <input
            className="field-input"
            placeholder={
              type === 'investment'
                ? 'e.g. Working Capital, New Branch Setup'
                : 'e.g. Owner Drawing, Dividend, Personal Expense'
            }
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>
      )}

      {/* Description */}
      <div>
        <label className="field-label">Description / Memo</label>
        <input
          className="field-input"
          placeholder="Brief note about this transaction..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Optional Receipt Attachment */}
      <div>
        <label className="field-label">Attach Receipt / Voucher (Optional)</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          className="field-input text-xs"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {editTxn?.doc_url && (
          <div className="text-xs text-violet font-medium mt-1">
            <a href={editTxn.doc_url} target="_blank" rel="noopener noreferrer" className="underline">
              View existing attached document
            </a>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 pt-3">
        {editTxn && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className={`btn-ghost ${confirmDelete ? 'bg-rose text-white border-rose font-bold' : 'text-rose hover:bg-rose/10'}`}
          >
            {confirmDelete ? 'Confirm Delete?' : 'Delete'}
          </button>
        )}
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="btn-primary flex-1">
          {busy ? 'Saving...' : editTxn ? 'Update Entry' : 'Record Transaction'}
        </button>
      </div>
    </form>
  )
}
