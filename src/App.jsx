import { useState } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useLedgerData } from './hooks/useLedgerData'
import Header from './components/Header'
import Navbar from './components/Navbar'
import Sheet from './components/Sheet'
import AddTxnSheet from './components/forms/AddTxnSheet'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BusinessDetail from './pages/BusinessDetail'
import Ledger from './pages/Ledger'
import Reports from './pages/Reports'
import Accounts from './pages/Accounts'
import LoanDetail from './pages/LoanDetail'
import EmiDetail from './pages/EmiDetail'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg">
        <div className="w-10 h-10 border-3 border-violet/20 border-t-violet rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold text-ink-dim tracking-wide">
          Connecting to Poonji...
        </span>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-bg">
        <Login />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-ink max-w-md mx-auto relative shadow-2xl overflow-hidden pb-16">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/business/:id" element={<BusinessDetail />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/loans/:id" element={<LoanDetail />} />
          <Route path="/emis/:id" element={<EmiDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </div>
  )
}

function Layout() {
  const data = useLedgerData()
  const [txnSheet, setTxnSheet] = useState(null) // { defaultBizId, initialType, editTxn } | null

  const openAddTxn = (defaultBizId = null, type = 'expense') =>
    setTxnSheet({ defaultBizId, initialType: type, editTxn: null })

  const openEditTxn = (txn) =>
    setTxnSheet({ defaultBizId: txn.biz_id, editTxn: txn, initialType: txn.type })

  const closeTxn = () => setTxnSheet(null)

  const handleSaveTxn = async (type, form, file) => {
    let doc_url = txnSheet?.editTxn?.doc_url || null
    if (file) {
      doc_url = await data.uploadReceipt(file)
    }

    const payload = {
      type,
      amount: Number(form.amount),
      date: form.date,
      biz_id: form.biz_id || null,
      account_id: form.account_id || null,
      to_account_id: type === 'transfer' ? form.to_account_id || null : null,
      to_biz_id: type === 'transfer' ? form.to_biz_id || null : null,
      category: form.category || null,
      purpose: form.purpose || null,
      vendor: form.vendor || null,
      description: form.description || null,
      doc_url
    }

    if (txnSheet?.editTxn) {
      await data.update('transactions', txnSheet.editTxn.id, payload)
    } else {
      await data.insert('transactions', payload)
    }
    closeTxn()
  }

  const handleDeleteTxn = async (id) => {
    await data.remove('transactions', id)
    closeTxn()
  }

  return (
    <div>
      <Header isRealtimeActive={data.isRealtimeActive} realtimeStatus={data.realtimeStatus} />

      <Outlet
        context={{
          ...data,
          openAddTxn,
          openEditTxn
        }}
      />

      <Navbar onOpenAddTxn={() => openAddTxn()} />

      <Sheet
        open={Boolean(txnSheet)}
        onClose={closeTxn}
        title={txnSheet?.editTxn ? 'Edit Transaction' : 'Record Transaction'}
      >
        {txnSheet && (
          <AddTxnSheet
            businesses={data.businesses}
            accounts={data.accounts}
            initialType={txnSheet.initialType}
            defaultBizId={txnSheet.defaultBizId}
            editTxn={txnSheet.editTxn}
            onCancel={closeTxn}
            onSave={handleSaveTxn}
            onDelete={handleDeleteTxn}
          />
        )}
      </Sheet>
    </div>
  )
}
