import { useState } from 'react'

export default function ExportModal({ open, onClose, data }) {
  const [copied, setCopied] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)

  if (!open) return null

  const jsonString = JSON.stringify(data, null, 2)

  const handleDownload = () => {
    try {
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `poonji-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 200)
    } catch (err) {
      console.error('Download error:', err)
      // Fallback: Copy to clipboard
      handleCopy()
    }
  }

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonString)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = jsonString
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      console.error('Clipboard copy failed:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Poonji Capital Backup',
          text: jsonString
        })
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2000)
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share error:', err)
      }
    }
  }

  const summary = [
    { label: 'Businesses', count: data?.businesses?.length || 0 },
    { label: 'Accounts', count: data?.accounts?.length || 0 },
    { label: 'Transactions', count: data?.transactions?.length || 0 },
    { label: 'Loans Given', count: data?.loans?.length || 0 },
    { label: 'EMIs', count: data?.emis?.length || 0 }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface rounded-2xl max-w-sm w-full p-5 border border-line shadow-2xl relative animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-ink-faint hover:text-ink text-lg cursor-pointer"
        >
          ✕
        </button>

        <h3 className="text-base font-bold text-ink mb-1">Export Portfolio Data</h3>
        <p className="text-xs text-ink-dim mb-3">
          Download or copy a complete JSON snapshot of all your accounts, businesses, and ledgers.
        </p>

        {/* Counts breakdown */}
        <div className="grid grid-cols-3 gap-1.5 p-2.5 bg-surface2/60 rounded-xl border border-line mb-3 text-center">
          {summary.map((s) => (
            <div key={s.label} className="p-1">
              <div className="text-sm font-bold text-violet">{s.count}</div>
              <div className="text-[10px] text-ink-dim">{s.label}</div>
            </div>
          ))}
        </div>

        {/* JSON Preview Snippet */}
        <div className="flex-1 overflow-y-auto max-h-40 bg-bg p-2.5 rounded-xl border border-line text-[10px] font-mono text-ink-dim mb-4 select-all">
          <pre>{jsonString.slice(0, 500)}...</pre>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleDownload}
            className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>⬇️</span>
            <span>Download .json File</span>
          </button>

          <button
            onClick={handleCopy}
            className="btn-ghost w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{copied ? '✓' : '📋'}</span>
            <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON to Clipboard'}</span>
          </button>

          {typeof navigator !== 'undefined' && !!navigator.share && (
            <button
              onClick={handleShare}
              className="btn-ghost w-full py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-violet"
            >
              <span>📤</span>
              <span>{shareSuccess ? 'Shared!' : 'Share via Mobile Sheet'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
