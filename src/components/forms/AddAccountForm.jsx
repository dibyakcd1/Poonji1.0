import { useState } from 'react'

export default function AddAccountForm({ initialData = null, onCancel, onSave, onDelete }) {
  const [name, setName] = useState(initialData?.name || '')
  const [kind, setKind] = useState(initialData?.kind || 'business')
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    try {
      await onSave({ name: name.trim(), kind })
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData || !onDelete) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 4000)
      return
    }
    setBusy(true)
    try {
      await onDelete(initialData.id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Account Name *</label>
        <input
          required
          className="field-input"
          placeholder="e.g. HDFC Current, ICICI Savings, Office Cash"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Account Kind</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`py-2 text-xs font-semibold rounded-xl border cursor-pointer ${
              kind === 'business'
                ? 'bg-violet text-white border-violet'
                : 'bg-surface border-line text-ink-dim hover:bg-surface2'
            }`}
            onClick={() => setKind('business')}
          >
            Business Account
          </button>
          <button
            type="button"
            className={`py-2 text-xs font-semibold rounded-xl border cursor-pointer ${
              kind === 'personal'
                ? 'bg-violet text-white border-violet'
                : 'bg-surface border-line text-ink-dim hover:bg-surface2'
            }`}
            onClick={() => setKind('personal')}
          >
            Personal Account
          </button>
        </div>
      </div>

      <div className="flex gap-2.5 pt-2">
        {initialData && onDelete && (
          <button
            type="button"
            disabled={busy}
            onClick={handleDelete}
            className={`btn-ghost ${
              confirmDelete
                ? 'bg-rose text-white border-rose font-bold'
                : 'text-rose hover:bg-rose/10'
            }`}
          >
            {confirmDelete ? 'Confirm Delete?' : 'Delete'}
          </button>
        )}
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="btn-primary flex-1">
          {busy ? 'Saving...' : initialData ? 'Update Account' : 'Save Account'}
        </button>
      </div>
    </form>
  )
}
