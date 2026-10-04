import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const TABLES = ['businesses', 'accounts', 'transactions', 'loans', 'loan_txns', 'emis', 'emi_txns']

export function useLedgerData() {
  const { user } = useAuth()
  const [data, setData] = useState({
    businesses: [],
    accounts: [],
    transactions: [],
    loans: [],
    loan_txns: [],
    emis: [],
    emi_txns: []
  })
  const [loading, setLoading] = useState(true)
  const [realtimeStatus, setRealtimeStatus] = useState('CONNECTING')
  const [clearing, setClearing] = useState(false)

  // Pure Supabase fetch - only queries authentic user data
  const refetch = useCallback(async () => {
    if (!user) {
      setData({
        businesses: [],
        accounts: [],
        transactions: [],
        loans: [],
        loan_txns: [],
        emis: [],
        emi_txns: []
      })
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const results = await Promise.all(
        TABLES.map((t) =>
          supabase
            .from(t)
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false, nullsFirst: false })
        )
      )
      const next = {}
      results.forEach((r, i) => {
        if (r.error) {
          console.warn(`Query for ${TABLES[i]}:`, r.error.message)
        }
        next[TABLES[i]] = r.data || []
      })
      setData(next)
    } catch (err) {
      console.error('Failed to fetch from Supabase:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Initial fetch on user login or auth state change
  useEffect(() => {
    refetch()
  }, [refetch])

  // Realtime subscription via Supabase channels
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`poonji-realtime-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          // Check if the change belongs to this user or affected their tables
          console.log('⚡ Realtime update received:', payload.table, payload.eventType)
          refetch()
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status)
      })

    // Periodic safety sync every 25 seconds
    const interval = setInterval(() => {
      refetch()
    }, 25000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [user, refetch])

  // Mutation helpers writing directly to authenticated Supabase database
  const insert = async (table, row) => {
    if (!user) throw new Error('User not authenticated')
    const { data: inserted, error } = await supabase
      .from(table)
      .insert({ ...row, user_id: user.id })
      .select()
    if (error) throw error
    await refetch()
    return inserted?.[0]
  }

  const update = async (table, id, patch) => {
    if (!user) throw new Error('User not authenticated')
    const { error } = await supabase
      .from(table)
      .update(patch)
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    await refetch()
  }

  const remove = async (table, id) => {
    if (!user) throw new Error('User not authenticated')
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    await refetch()
  }

  // Clear all data for this user to completely wipe any previous test/static rows
  const clearAllUserData = async () => {
    if (!user) return
    setClearing(true)
    try {
      // Optimistically wipe local state immediately
      setData({
        businesses: [],
        accounts: [],
        transactions: [],
        loans: [],
        loan_txns: [],
        emis: [],
        emi_txns: []
      })

      // Delete in cascade order (dependent tables first)
      for (const t of ['loan_txns', 'emi_txns', 'transactions', 'loans', 'emis', 'businesses', 'accounts']) {
        const { error } = await supabase.from(t).delete().eq('user_id', user.id)
        if (error) {
          console.warn(`Warning deleting from ${t}:`, error.message)
        }
      }
      await refetch()
    } catch (err) {
      console.error('Error clearing user data:', err)
      throw err
    } finally {
      setClearing(false)
    }
  }

  const uploadReceipt = async (file) => {
    if (!user) throw new Error('User not authenticated')
    const path = `${user.id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('receipts').upload(path, file)
    if (error) {
      console.warn('Storage upload error, using local data URL:', error)
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
    }
    const { data: signed } = await supabase.storage
      .from('receipts')
      .createSignedUrl(path, 60 * 60 * 24 * 365)
    return signed?.signedUrl || path
  }

  return {
    ...data,
    loading,
    clearing,
    realtimeStatus,
    isRealtimeActive: realtimeStatus === 'SUBSCRIBED',
    refetch,
    clearAllUserData,
    insert,
    update,
    remove,
    uploadReceipt
  }
}
