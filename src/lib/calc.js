// Calculation and formatting helpers for Poonji

export const TYPES = {
  investment: { label: 'Investment', short: 'Invest', sign: '+', color: '#6C5CE7', tone: 'pos' },
  income: { label: 'Income', short: 'Income', sign: '+', color: '#12B886', tone: 'pos' },
  expense: { label: 'Expense', short: 'Expense', sign: '−', color: '#FF6B6B', tone: 'neg' },
  withdrawal: { label: 'Withdrawal', short: 'Withdraw', sign: '−', color: '#FFA94D', tone: 'neg' },
  transfer: { label: 'Transfer', short: 'Transfer', sign: '⇄', color: '#4C7BF3', tone: '' }
}

export function fmt(n = 0) {
  const num = Number(n) || 0
  const isNeg = num < 0
  const abs = Math.abs(num)
  return `${isNeg ? '−' : ''}₹ ${abs.toLocaleString('en-IN')}`
}

export function dfmt(d) {
  if (!d) return ''
  try {
    const date = new Date(d)
    if (isNaN(date.getTime())) return d
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}

export function bizTotals(bizId, transactions = []) {
  const list = transactions.filter((t) => t.biz_id === bizId)
  let invested = 0
  let income = 0
  let expense = 0
  let withdrawn = 0

  list.forEach((t) => {
    const a = Number(t.amount) || 0
    if (t.type === 'investment') invested += a
    else if (t.type === 'income') income += a
    else if (t.type === 'expense') expense += a
    else if (t.type === 'withdrawal') withdrawn += a
  })

  // Net business capital/balance
  const balance = invested + income - expense - withdrawn
  return { invested, income, expense, withdrawn, balance }
}

export function overallTotals(transactions = []) {
  let invested = 0
  let income = 0
  let expense = 0
  let withdrawn = 0
  let transfers = 0

  transactions.forEach((t) => {
    const a = Number(t.amount) || 0
    if (t.type === 'investment') invested += a
    else if (t.type === 'income') income += a
    else if (t.type === 'expense') expense += a
    else if (t.type === 'withdrawal') withdrawn += a
    else if (t.type === 'transfer') transfers += a
  })

  const balance = invested + income - expense - withdrawn
  return { invested, income, expense, withdrawn, transfers, balance }
}

export function loanTotals(loan, loanTxns = []) {
  const principal = Number(loan?.principal) || 0
  const rate = Number(loan?.rate) || 0
  const txns = loanTxns.filter((lt) => lt.loan_id === loan?.id)

  let interestEarned = 0
  let principalRepaid = 0

  txns.forEach((tx) => {
    const a = Number(tx.amount) || 0
    if (tx.type === 'interest') interestEarned += a
    else if (tx.type === 'repayment') principalRepaid += a
  })

  const outstanding = Math.max(0, principal - principalRepaid)
  const monthlyDue = Math.round((outstanding * rate) / 100)

  return {
    principal,
    rate,
    interest: interestEarned,
    interestEarned,
    principalRepaid,
    outstanding,
    monthlyDue
  }
}

export function loanOverall(loans = [], loanTxns = []) {
  let totalLent = 0
  let outstanding = 0
  let interestEarned = 0

  loans.forEach((l) => {
    const t = loanTotals(l, loanTxns)
    totalLent += t.principal
    outstanding += t.outstanding
    interestEarned += t.interestEarned
  })

  return { totalLent, outstanding, interestEarned }
}

export function emiTotals(emi, emiTxns = []) {
  const principal = Number(emi?.principal) || 0
  const emiAmount = Number(emi?.emi_amount) || 0
  const tenure = Number(emi?.tenure_months) || 0
  const txns = emiTxns.filter((et) => et.emi_id === emi?.id)

  const paidAmount = txns.reduce((s, t) => s + (Number(t.amount) || 0), 0)
  const paidCount = txns.length
  const totalPayable = emiAmount > 0 && tenure > 0 ? emiAmount * tenure : principal
  const remaining = Math.max(0, totalPayable - paidAmount)
  const remainingMonths = Math.max(0, tenure - paidCount)

  return {
    principal,
    emiAmount,
    totalPayable,
    paidAmount,
    paidCount,
    remaining,
    remainingMonths
  }
}

export function emiOverall(emis = [], emiTxns = []) {
  let totalPrincipal = 0
  let outstanding = 0
  let monthlyOutgo = 0
  let totalPaid = 0

  emis.forEach((e) => {
    const t = emiTotals(e, emiTxns)
    totalPrincipal += t.principal
    outstanding += t.remaining
    monthlyOutgo += Number(e.emi_amount) || 0
    totalPaid += t.paidAmount
  })

  return { totalPrincipal, outstanding, monthlyOutgo, totalPaid }
}

export function accountBalance(accountId, transactions = []) {
  let bal = 0
  transactions.forEach((t) => {
    const a = Number(t.amount) || 0
    if (t.account_id === accountId) {
      if (t.type === 'investment' || t.type === 'income') bal += a
      else if (t.type === 'expense' || t.type === 'withdrawal') bal -= a
      else if (t.type === 'transfer') bal -= a // Outflow from account
    }
    if (t.to_account_id === accountId && t.type === 'transfer') {
      bal += a // Inflow to destination account
    }
  })
  return bal
}

export function groupSum(items = [], keyFn = () => '', valFn = (t) => Number(t.amount) || 0) {
  const map = {}
  items.forEach((item) => {
    const key = keyFn(item) || 'Other'
    map[key] = (map[key] || 0) + valFn(item)
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1])
}
