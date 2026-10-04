import { useEffect } from 'react'

export default function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col z-10 border border-line animate-in fade-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line">
          <h2 className="text-base font-bold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-dim hover:text-ink hover:bg-surface2 transition-colors cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
