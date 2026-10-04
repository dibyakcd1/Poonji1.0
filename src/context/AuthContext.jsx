import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading, null = signed out
  const [authError, setAuthError] = useState(null)
  const [authConnected, setAuthConnected] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Retrieve initial session from Supabase
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) {
          console.warn('Supabase getSession failed:', error.message)
          setSession(null)
          setAuthConnected(false)
        } else {
          setSession(data?.session ?? null)
          setAuthConnected(true)
        }
      })
      .catch((err) => {
        console.warn('Supabase getSession error:', err)
        if (isMounted) {
          setSession(null)
          setAuthConnected(false)
        }
      })

    // Listen to realtime auth state changes across all tabs/windows
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('⚡ Auth state change event:', event)
      if (!isMounted) return
      setSession(newSession ?? null)
      setAuthConnected(true)
    })

    return () => {
      isMounted = false
      sub?.subscription?.unsubscribe()
    }
  }, [])

  const signInWithPassword = useCallback(async (email, password) => {
    setAuthError(null)
    const res = await supabase.auth.signInWithPassword({ email, password })
    if (res.error) {
      setAuthError(res.error.message)
    } else {
      setSession(res.data.session)
    }
    return res
  }, [])

  const signUp = useCallback(async (email, password) => {
    setAuthError(null)
    const res = await supabase.auth.signUp({ email, password })
    if (res.error) {
      setAuthError(res.error.message)
    } else if (res.data.session) {
      setSession(res.data.session)
    }
    return res
  }, [])

  const signOut = useCallback(async () => {
    setAuthError(null)
    // Clear session immediately for instant optimistic UI response
    setSession(null)
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('Sign out warning:', err)
    }
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))
    } catch (e) {
      console.warn('Error clearing localStorage keys:', e)
    }
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading: session === undefined,
    isSupabaseConfigured,
    authConnected,
    authError,
    signInWithPassword,
    signUp,
    signOut
  }

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
