import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signInWithPassword, signUp, authConnected } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)

    try {
      if (mode === 'signin') {
        const { error: signInErr } = await signInWithPassword(email.trim(), password)
        if (signInErr) {
          if (signInErr.message.toLowerCase().includes('email not confirmed')) {
            throw new Error(
              'Email not confirmed yet. Please verify via confirmation link in your inbox (or turn off "Confirm email" in Supabase Auth Settings for instant sign-in).'
            )
          }
          throw signInErr
        }
      } else {
        const { data, error: signUpErr } = await signUp(email.trim(), password)
        if (signUpErr) throw signUpErr
        if (data?.session) {
          setInfo('Account created and signed in successfully!')
        } else {
          setInfo(
            'Account created! A confirmation email has been sent. Check your inbox to confirm, or sign in directly if email verification is disabled in Supabase.'
          )
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-bg">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-violet flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-violet/25 mb-3">
            ₹
          </div>
          <div className="font-display text-violet text-2xl font-bold tracking-tight mb-0.5">
            Poonji
          </div>
          <h1 className="text-lg font-bold text-ink">
            {mode === 'signin' ? 'Sign In to Your Portfolio' : 'Create Your Capital Account'}
          </h1>
          <p className="text-xs text-ink-faint mt-1">
            Realtime Multi-Business Capital & Loan Tracker
          </p>
        </div>

        {/* Realtime Auth Connection Status */}
        <div className="flex items-center justify-center gap-2 mb-4 bg-surface border border-line rounded-full py-1.5 px-3.5 text-xs text-ink-dim shadow-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              authConnected ? 'bg-em animate-pulse' : 'bg-rose'
            }`}
          />
          <span className="font-medium">
            {authConnected ? 'Supabase Auth Realtime Active' : 'Connecting to Supabase...'}
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-surface2 p-1 mb-3.5 border border-line">
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setError('')
              setInfo('')
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signin' ? 'bg-surface text-ink shadow-xs' : 'text-ink-dim hover:text-ink'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setError('')
              setInfo('')
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-surface text-ink shadow-xs' : 'text-ink-dim hover:text-ink'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Auth Form Card */}
        <form onSubmit={submit} className="card p-5 mb-4 shadow-card">
          <div className="mb-3.5">
            <label className="field-label">Email address</label>
            <input
              required
              className="field-input"
              type="email"
              autoComplete="email"
              placeholder="e.g. founder@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="field-label mb-0">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-violet font-semibold hover:underline cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              required
              minLength={6}
              className="field-input"
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-rose/10 border border-rose/20 rounded-xl text-rose text-xs leading-relaxed mb-3.5">
              {error}
            </div>
          )}

          {info && (
            <div className="p-3 bg-em/10 border border-em/20 rounded-xl text-em text-xs leading-relaxed mb-3.5">
              {info}
            </div>
          )}

          <button
            disabled={busy}
            type="submit"
            className="btn-primary w-full py-2.5 cursor-pointer shadow-xs active:scale-[0.99] transition-transform"
          >
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
              </span>
            ) : mode === 'signin' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Security & Sync note */}
        <div className="card p-3 text-[11px] text-ink-dim bg-surface2/60 border border-line leading-relaxed text-center">
          🔒 Secure authentication with Supabase PostgreSQL Row-Level Security. Every device syncs in real time.
        </div>
      </div>
    </div>
  )
}
