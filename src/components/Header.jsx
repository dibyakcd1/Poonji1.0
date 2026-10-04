import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ConfirmModal from './ConfirmModal'

export default function Header({ isRealtimeActive, realtimeStatus }) {
  const { user, signOut } = useAuth()
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [busy, setBusy] = useState(false)

  const handleConfirmSignOut = async () => {
    setBusy(true)
    try {
      await signOut()
    } finally {
      setBusy(false)
      setShowSignOutModal(false)
    }
  }

  return (
    <>
      <header className="px-4 py-3 bg-surface/90 backdrop-blur-md border-b border-line sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet flex items-center justify-center text-white font-bold text-sm shadow-xs">
            ₹
          </div>
          <div>
            <span className="font-display text-violet text-sm font-bold tracking-tight block leading-none">
              Poonji
            </span>
            <span className="text-[10px] text-ink-dim block leading-tight truncate max-w-[130px] sm:max-w-[180px]">
              {user?.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Realtime status badge */}
          <div
            className="flex items-center gap-1.5 text-[10.5px] font-medium bg-surface2/80 border border-line px-2 py-1 rounded-full text-ink-dim"
            title={`Sync status: ${realtimeStatus}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRealtimeActive ? 'bg-em animate-pulse' : 'bg-amber'
              }`}
            />
            <span className="hidden sm:inline">
              {isRealtimeActive ? 'Live Realtime' : realtimeStatus}
            </span>
          </div>

          {/* Realtime Sign Out Option */}
          <button
            onClick={() => setShowSignOutModal(true)}
            className="px-2.5 py-1 text-xs font-semibold text-rose hover:bg-rose/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose/20 active:scale-95"
            title="Sign out of your account"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* In-app Sign Out Confirmation (avoids browser iframe confirm() blocks) */}
      <ConfirmModal
        open={showSignOutModal}
        title="Sign Out"
        message={`Are you sure you want to sign out of ${user?.email || 'Poonji'}?`}
        confirmText="Sign Out"
        confirmTone="rose"
        busy={busy}
        onConfirm={handleConfirmSignOut}
        onCancel={() => setShowSignOutModal(false)}
      />
    </>
  )
}
