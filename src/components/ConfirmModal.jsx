export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  confirmTone = 'rose', // 'rose' | 'violet'
  busy = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface rounded-2xl max-w-xs w-full p-5 border border-line shadow-2xl animate-in zoom-in-95 duration-150">
        <h3 className="text-base font-bold text-ink mb-1.5">{title}</h3>
        <p className="text-xs text-ink-dim leading-relaxed mb-5">{message}</p>

        <div className="flex gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="btn-ghost flex-1 py-2 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl text-white transition-opacity cursor-pointer ${
              confirmTone === 'rose'
                ? 'bg-rose hover:bg-rose/90'
                : 'bg-violet hover:bg-violet/90'
            }`}
          >
            {busy ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
