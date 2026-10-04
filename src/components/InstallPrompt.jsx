import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIos, setIsIos] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('poonji_install_dismissed') === 'true'
  })

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    setIsStandalone(standalone)

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(ua)
    setIsIos(iosDevice)

    // Listen for Android / Chromium install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  if (isStandalone) {
    return null // Already installed and running as native PWA
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    } else {
      setShowModal(true)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('poonji_install_dismissed', 'true')
  }

  return (
    <>
      {/* Banner on bottom or top for quick mobile installation */}
      {!dismissed && (
        <div className="mx-4 mb-3 p-3 bg-violet/10 border border-violet/20 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-violet flex items-center justify-center text-white text-base shrink-0 font-bold">
              ₹
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-ink leading-tight">Install Poonji App</div>
              <div className="text-[11px] text-ink-dim truncate">
                {isIos ? 'Add to iPhone Home Screen' : 'Install on Android / Phone'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="py-1.5 px-3 rounded-xl bg-violet text-white text-xs font-semibold hover:bg-violet/90 transition-colors cursor-pointer"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-xl text-ink-faint hover:text-ink text-sm flex items-center justify-center cursor-pointer"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Instructional modal for iOS & desktop browsers */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl max-w-sm w-full p-5 border border-line shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-ink-faint hover:text-ink text-lg"
            >
              ✕
            </button>

            <div className="text-center mb-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-violet flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-violet/20 mb-2">
                ₹
              </div>
              <h3 className="text-base font-bold text-ink">Install Poonji</h3>
              <p className="text-xs text-ink-dim mt-0.5">
                Run fullscreen with offline access on iPhone & Android
              </p>
            </div>

            {isIos ? (
              <div className="space-y-3 text-xs text-ink-dim bg-surface2/60 p-3.5 rounded-xl border border-line">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-violet text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Tap the <b>Share</b> button in Safari toolbar (<span className="text-sm">⎋</span> or{' '}
                    <span className="text-sm">⎙</span>).
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-violet text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Scroll down and tap <b>'Add to Home Screen'</b>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-violet text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>
                    Tap <b>'Add'</b> at top right to complete installation.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-ink-dim bg-surface2/60 p-3.5 rounded-xl border border-line">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-violet text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Tap the three dots (<b>⋮</b>) menu in Chrome or your browser.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-violet text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Select <b>'Install App'</b> or <b>'Add to Home screen'</b>.
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="btn-primary w-full mt-4 text-xs font-semibold py-2.5 cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
