import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { SummaryCard } from '../components/SummaryCard'
import { EntityCard, colorForIndex } from '../components/BusinessCard'
import Sheet from '../components/Sheet'
import AddBusinessForm from '../components/forms/AddBusinessForm'
import AddLoanForm from '../components/forms/AddLoanForm'
import AddEmiForm from '../components/forms/AddEmiForm'
import AddAccountForm from '../components/forms/AddAccountForm'
import { fmt, bizTotals, overallTotals, loanTotals, loanOverall, emiTotals, emiOverall, dfmt } from '../lib/calc'

export default function Dashboard() {
  const {
    businesses,
    accounts,
    transactions,
    loans,
    loan_txns,
    emis,
    emi_txns,
    insert
  } = useOutletContext()
  const [sheet, setSheet] = useState(null) // 'business' | 'loan' | 'emi' | 'account' | null

  const o = overallTotals(transactions)
  const lo = loanOverall(loans, loan_txns)
  const eo = emiOverall(emis, emi_txns)

  const isDbEmpty = businesses.length === 0 && accounts.length === 0

  return (
    <div>
      <header className="px-[18px] pt-4 pb-3">
        <h1 className="text-[26px] font-bold text-ink">Capital Overview</h1>
        <p className="text-xs text-ink-dim mt-0.5">
          Realtime summary across all businesses, investments & loans
        </p>
      </header>

      {/* Fresh Account Quick Start (Zero Static Data) */}
      {isDbEmpty && (
        <div className="mx-[18px] mb-4 card p-5 border border-line bg-surface text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-violet/10 text-violet flex items-center justify-center text-2xl font-bold mb-3">
            ✨
          </div>
          <h2 className="text-base font-bold text-ink mb-1">Your Portfolio is Clean & Ready</h2>
          <p className="text-xs text-ink-dim mb-4 max-w-xs mx-auto">
            Get started with real data. Add your first commercial enterprise or bank account to begin tracking.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setSheet('business')}
              className="btn-primary flex-1 py-2.5 text-xs font-semibold cursor-pointer"
            >
              + Add Business
            </button>
            <button
              onClick={() => setSheet('account')}
              className="btn-ghost flex-1 py-2.5 text-xs font-semibold cursor-pointer"
            >
              + Add Bank Account
            </button>
          </div>
        </div>
      )}

      {/* Financial Metrics Summary Grid */}
      <div className="px-[18px] pb-4.5 grid grid-cols-2 gap-2.5">
        <SummaryCard wide label="Current Available Balance" value={fmt(o.balance)} />
        <SummaryCard label="Total Invested" value={fmt(o.invested)} />
        <SummaryCard label="Total Income" value={fmt(o.income)} tone="pos" />
        <SummaryCard label="Total Expenses" value={fmt(o.expense)} tone="neg" />
        <SummaryCard label="Total Withdrawn" value={fmt(o.withdrawn)} />
        <SummaryCard label="Total Transfers" value={fmt(o.transfers)} />
        <SummaryCard label="Money Lent (Outstanding)" value={fmt(lo.outstanding)} />
        <SummaryCard label="Interest Earned" value={fmt(lo.interestEarned)} tone="pos" />
        <SummaryCard label="EMI Outstanding" value={fmt(eo.outstanding)} tone="neg" />
        <SummaryCard label="Monthly EMI Outgo" value={fmt(eo.monthlyOutgo)} tone="neg" />
      </div>

      <Section title="Your Businesses" onAdd={() => setSheet('business')}>
        {businesses.length === 0 && (
          <Empty>
            No businesses added yet.
            <br />
            Tap "+ Add" to create your first business.
          </Empty>
        )}
        {businesses.map((b, i) => {
          const t = bizTotals(b.id, transactions)
          return (
            <EntityCard
              key={b.id}
              to={`/business/${b.id}`}
              avatarLetter={b.name[0]?.toUpperCase()}
              avatarColor={colorForIndex(i)}
              title={b.name}
              subtitle={b.type || 'Business'}
              balanceLabel="Balance"
              balanceValue={fmt(t.balance)}
              balanceTone={t.balance < 0 ? 'neg' : ''}
              stats={[
                { label: 'Invested', value: fmt(t.invested) },
                { label: 'Income', value: fmt(t.income), tone: 'pos' },
                { label: 'Expenses', value: fmt(t.expense), tone: 'neg' }
              ]}
            />
          )
        })}
      </Section>

      <Section title="Loans Given" onAdd={() => setSheet('loan')}>
        {loans.length === 0 && <Empty>No loans recorded yet.</Empty>}
        {loans.map((l) => {
          const t = loanTotals(l, loan_txns)
          return (
            <EntityCard
              key={l.id}
              to={`/loans/${l.id}`}
              avatarLetter={l.borrower[0]?.toUpperCase()}
              avatarColor="#FFA94D"
              title={l.borrower}
              subtitle={`${l.rate}%/month · since ${dfmt(l.start_date)}`}
              balanceLabel="Outstanding"
              balanceValue={fmt(t.outstanding)}
              stats={[
                { label: 'Principal', value: fmt(l.principal) },
                { label: 'Interest earned', value: fmt(t.interest), tone: 'pos' },
                { label: 'Due / month', value: fmt(t.monthlyDue), tone: 'neg' }
              ]}
            />
          )
        })}
      </Section>

      <Section title="Loans & EMIs Payable" onAdd={() => setSheet('emi')}>
        {emis.length === 0 && <Empty>No active EMIs or loans payable recorded.</Empty>}
        {emis.map((e) => {
          const t = emiTotals(e, emi_txns)
          return (
            <EntityCard
              key={e.id}
              to={`/emis/${e.id}`}
              avatarLetter={e.name[0]?.toUpperCase()}
              avatarColor="#FF6B6B"
              title={e.name}
              subtitle={`${e.lender ? `${e.lender} · ` : ''}${fmt(e.emi_amount)}/mo · ${t.paidCount}/${e.tenure_months} paid`}
              balanceLabel="Outstanding"
              balanceValue={fmt(t.remaining)}
              balanceTone="neg"
              stats={[
                { label: 'Principal', value: fmt(e.principal) },
                { label: 'Total paid', value: fmt(t.paidAmount), tone: 'pos' },
                { label: 'Remaining', value: `${t.remainingMonths} mo` }
              ]}
            />
          )
        })}
      </Section>

      <Sheet open={Boolean(sheet)} onClose={() => setSheet(null)} title={
        sheet === 'business' ? 'Add Business' :
        sheet === 'loan' ? 'Record Loan Given' :
        sheet === 'account' ? 'Add Account' : 'Add Loan / EMI'
      }>
        {sheet === 'business' && (
          <AddBusinessForm onCancel={() => setSheet(null)} onSave={async (v) => { await insert('businesses', v); setSheet(null) }} />
        )}
        {sheet === 'loan' && (
          <AddLoanForm accounts={accounts} onCancel={() => setSheet(null)} onSave={async (v) => { await insert('loans', v); setSheet(null) }} />
        )}
        {sheet === 'emi' && (
          <AddEmiForm accounts={accounts} onCancel={() => setSheet(null)} onSave={async (v) => { await insert('emis', v); setSheet(null) }} />
        )}
        {sheet === 'account' && (
          <AddAccountForm onCancel={() => setSheet(null)} onSave={async (v) => { await insert('accounts', v); setSheet(null) }} />
        )}
      </Sheet>
    </div>
  )
}

function Section({ title, onAdd, children }) {
  return (
    <div className="px-[18px] pb-5">
      <div className="flex justify-between items-baseline mb-3">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        <button className="text-[13px] text-violet font-semibold cursor-pointer hover:underline" onClick={onAdd}>+ Add</button>
      </div>
      {children}
    </div>
  )
}

function Empty({ children }) {
  return (
    <div className="text-center py-7 px-4 text-ink-faint text-xs bg-surface border border-dashed border-line rounded-2xl leading-relaxed">
      {children}
    </div>
  )
}
