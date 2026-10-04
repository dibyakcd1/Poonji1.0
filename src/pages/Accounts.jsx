import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sheet from '../components/Sheet'
import AddAccountForm from '../components/forms/AddAccountForm'
import ConfirmModal from '../components/ConfirmModal'
import ExportModal from '../components/ExportModal'
import { fmt, accountBalance } from '../lib/calc'

export default function Accounts() {
  const {
    businesses,
    accounts,
    transactions,
    loans,
    loan_txns,
    emis,
    emi_txns,
    insert,
    update,
    remove
  } = useOutletContext()

  const { signOut, user } = useAuth()
  const [sheetMode, setSheetMode] = useState(null) // 'add' | { edit: account } | null
  const [filterKind, setFilterKind] = useState('all') // 'all' | 'business' | 'personal'
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  // Calculate liquidity metrics
  const { totalBalance, businessBalance, personalBalance } = useMemo(() => {
    let total = 0
    let bizTotal = 0
    let personalTotal = 0

    accounts.forEach((a) => {
      const bal = accountBalance(a.id, transactions)
      total += bal
      if (a.kind === 'business') {
        bizTotal += bal
      } else {
        personalTotal += bal
      }
    })

    return {
      totalBalance: total,
      businessBalance: bizTotal,
      personalBalance: personalTotal
    }
  }, [accounts, transactions])

  const filteredAccounts = useMemo(() => {
    if (filterKind === 'all') return accounts
    return accounts.filter((a) => a.kind === filterKind)
  }, [accounts, filterKind])

  const handleConfirmSignOut = async () => {
    setShowSignOutModal(false)
    await signOut()
  }

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    user: user?.email,
    portfolioSummary: {
      businessesCount: businesses.length,
      accountsCount: accounts.length,
      transactionsCount: transactions.length,
      loansCount: loans.length,
      emisCount: emis.length
    },
    businesses,
    accounts,
    transactions,
    loans,
    loan_txns,
    emis,
    emi_txns
  }

  return (
    <div>
      {/* Header */}
      <header className="px-[18px] pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-ink">Accounts</h1>
          <p className="text-xs text-ink-dim mt-0.5">
            Liquid capital, bank accounts & cash ledgers
          </p>
        </div>

        <button
          onClick={() => setSheetMode('add')}
          className="btn-primary py-1.5 px-3 text-xs font-semibold cursor-pointer shadow-xs"
        >
          + Add Account
        </button>
      </header>

      {/* Total Liquidity Overview Card */}
      <div className="px-[18px] mb-4">
        <div className="card p-4 border border-line bg-surface shadow-xs">
          <div className="text-[11px] font-bold text-ink-dim uppercase tracking-wider mb-1">
            Total Liquid Capital
          </div>
          <div
            className={`text-2xl font-extrabold num mb-3 ${
              totalBalance < 0 ? 'text-rose' : 'text-ink'
            }`}
          >
            {fmt(totalBalance)}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-line/60">
            <div>
              <div className="text-[10.5px] text-ink-faint font-semibold uppercase">
                Business Funds
              </div>
              <div
                className={`text-sm font-bold num mt-0.5 ${
                  businessBalance < 0 ? 'text-rose' : 'text-violet'
                }`}
              >
                {fmt(businessBalance)}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] text-ink-faint font-semibold uppercase">
                Personal Funds
              </div>
              <div
                className={`text-sm font-bold num mt-0.5 ${
                  personalBalance < 0 ? 'text-rose' : 'text-em'
                }`}
              >
                {fmt(personalBalance)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-[18px] mb-3 flex gap-1.5">
        <button
          onClick={() => setFilterKind('all')}
          className={`py-1 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            filterKind === 'all'
              ? 'bg-ink text-surface shadow-xs'
              : 'bg-surface2 text-ink-dim hover:text-ink'
          }`}
        >
          All Accounts ({accounts.length})
        </button>
        <button
          onClick={() => setFilterKind('business')}
          className={`py-1 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            filterKind === 'business'
              ? 'bg-violet text-white shadow-xs'
              : 'bg-surface2 text-ink-dim hover:text-ink'
          }`}
        >
          Business
        </button>
        <button
          onClick={() => setFilterKind('personal')}
          className={`py-1 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            filterKind === 'personal'
              ? 'bg-em text-white shadow-xs'
              : 'bg-surface2 text-ink-dim hover:text-ink'
          }`}
        >
          Personal
        </button>
      </div>

      {/* Accounts List */}
      <div className="px-[18px] pb-5 space-y-2.5">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-10 px-4 text-ink-faint text-xs bg-surface border border-dashed border-line rounded-2xl">
            <div className="text-xl mb-1">🏦</div>
            <div className="font-semibold text-ink text-sm mb-0.5">No accounts found</div>
            <div>Tap "+ Add Account" above to register a bank account or cash ledger.</div>
          </div>
        ) : (
          filteredAccounts.map((a) => {
            const bal = accountBalance(a.id, transactions)
            const txnCount = transactions.filter(
              (t) => t.account_id === a.id || t.to_account_id === a.id
            ).length

            return (
              <div
                key={a.id}
                onClick={() => setSheetMode({ edit: a })}
                className="card p-4 flex justify-between items-center cursor-pointer hover:border-violet/40 transition-colors group active:scale-[0.99]"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[15px] font-semibold text-ink group-hover:text-violet transition-colors truncate">
                    {a.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-faint mt-0.5">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[10.5px] font-semibold ${
                        a.kind === 'personal'
                          ? 'bg-em/10 text-em'
                          : 'bg-violet/10 text-violet'
                      }`}
                    >
                      {a.kind === 'personal' ? 'Personal' : 'Business'}
                    </span>
                    <span>·</span>
                    <span>{txnCount} {txnCount === 1 ? 'entry' : 'entries'}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-[17px] font-bold num ${
                      bal < 0 ? 'text-rose' : 'text-ink'
                    }`}
                  >
                    {fmt(bal)}
                  </div>
                  <div className="text-[10px] text-ink-faint uppercase font-medium">Balance</div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Production Utilities: Backup & Session */}
      <div className="px-[18px] pb-6 space-y-3">
        {/* Backup Portfolio Card */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-ink">Backup Portfolio</div>
              <div className="text-xs text-ink-dim mt-0.5">
                Download a JSON snapshot of all your accounts and ledgers
              </div>
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              className="btn-ghost py-2 px-3 text-xs font-semibold cursor-pointer shrink-0"
            >
              Export JSON
            </button>
          </div>
        </div>

        {/* User Session Footer */}
        <div className="card p-3.5 flex items-center justify-between text-xs text-ink-dim">
          <div className="truncate pr-2">
            <span className="text-ink-faint">Signed in as </span>
            <span className="font-semibold text-ink truncate">{user?.email}</span>
          </div>
          <button
            onClick={() => setShowSignOutModal(true)}
            className="text-xs font-semibold text-rose hover:bg-rose/10 py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose/20 shrink-0"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Add / Edit Account Sheet */}
      <Sheet
        open={Boolean(sheetMode)}
        onClose={() => setSheetMode(null)}
        title={sheetMode?.edit ? 'Edit Account' : 'New Account'}
      >
        {sheetMode && (
          <AddAccountForm
            initialData={sheetMode?.edit || null}
            onCancel={() => setSheetMode(null)}
            onSave={async (v) => {
              if (sheetMode?.edit) {
                await update('accounts', sheetMode.edit.id, v)
              } else {
                await insert('accounts', v)
              }
              setSheetMode(null)
            }}
            onDelete={async (id) => {
              await remove('accounts', id)
              setSheetMode(null)
            }}
          />
        )}
      </Sheet>

      {/* In-app Sign Out Confirmation */}
      <ConfirmModal
        open={showSignOutModal}
        title="Sign Out"
        message={`Are you sure you want to sign out of ${user?.email || 'Poonji'}?`}
        confirmText="Sign Out"
        confirmTone="rose"
        onConfirm={handleConfirmSignOut}
        onCancel={() => setShowSignOutModal(false)}
      />

      {/* Export JSON Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={exportPayload}
      />
    </div>
  )
}
