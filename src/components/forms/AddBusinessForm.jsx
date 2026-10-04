import { useState } from 'react'

export default function AddBusinessForm({ onCancel, onSave }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('Distribution')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    try {
      await onSave({ name: name.trim(), type: type.trim(), notes: notes.trim() })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Business Name *</label>
        <input
          required
          className="field-input"
          placeholder="e.g. Retail Store, Logistics Co"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Industry / Business Type</label>
        <input
          className="field-input"
          placeholder="e.g. Retail, Distribution, Real Estate, Agency"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Description / Notes</label>
        <textarea
          rows={3}
          className="field-input resize-none"
          placeholder="Optional notes regarding partners, regional hub, or ownership stake..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex gap-2.5 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="btn-primary flex-1">
          {busy ? 'Saving...' : 'Create Business'}
        </button>
      </div>
    </form>
  )
}
