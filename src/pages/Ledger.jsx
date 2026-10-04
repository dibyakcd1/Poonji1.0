import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import TxnList from '../components/TxnRow'
import { TYPES, fmt } from '../lib/calc'

function getPresets() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() // 0-indexed

  const pad = (n) => String(n).padStart(2, '0')
  const toStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  const todayStr = toStr(now)
  const firstOfMonth = `${y}-${pad(m + 1)}-01`
  const lastOfMonth = toStr(new Date(y, m + 1, 0))

  const past30 = new Date(now)
  past30.setDate(past30.getDate() - 30)
  const last30Str = toStr(past30)

  const qMonth = Math.floor(m / 3) * 3
  const qStart = `${y}-${pad(qMonth + 1)}-01`
  const qEnd = toStr(new Date(y, qMonth + 3, 0))

  const yearStart = `${y}-01-01`
  const yearEnd = `${y}-12-31`

  return {
    all: { label: 'All Time', from: '', to: '' },
    thisMonth: { label: 'This Month', from: firstOfMonth, to: lastOfMonth },
    last30: { label: 'Last 30 Days', from: last30Str, to: todayStr },
    thisQuarter: { label: 'This Quarter', from: qStart, to: qEnd },
    thisYear: { label: 'This Year', from: yearStart, to: yearEnd }
  }
}

export default function Ledger() {
  const { businesses, transactions, openEditTxn, openAddTxn } = useOutletContext()

  // Filter States
  const [activePreset, setActivePreset] = useState('all') // 'all' | 'thisMonth' | 'last30' | 'thisQuarter' | 'thisYear' | 'custom'
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [biz, setBiz] = useState('all')
  const [type, setType] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc') // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'
  const [q, setQ] = useState('')
  const [showCustomRange, setShowCustomRange] = useState(false)

  const presets = useMemo(() => getPresets(), [])

  // Apply quick date preset
  const handlePresetChange = (presetKey) => {
    setActivePreset(presetKey)
    if (presetKey === 'custom') {
      setShowCustomRange(true)
    } else {
      setShowCustomRange(false)
      const p = presets[presetKey]
      if (p) {
        setFrom(p.from)
        setTo(p.to)
      }
    }
  }

  // Filter & Sort Transactions
  const filteredTxns = useMemo(() => {
    let list = [...transactions]

    if (biz !== 'all') {
      list = list.filter((t) => t.biz_id === biz)
    }
    if (type !== 'all') {
      list = list.filter((t) => t.type === type)
    }
    if (from) {
      list = list.filter((t) => (t.date || '') >= from)
    }
    if (to) {
      list = list.filter((t) => (t.date || '') <= to)
    }
    if (q.trim()) {
      const ql = q.trim().toLowerCase()
      list = list.filter((t) =>
        [t.description, t.ref_code, t.vendor, t.category, t.purpose].some(
          (v) => v && String(v).toLowerCase().includes(ql)
        )
      )
    }

    // Sort order
    if (sortBy === 'date-desc') {
      list.sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.id.localeCompare(a.id))
    } else if (sortBy === 'date-asc') {
      list.sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.id.localeCompare(b.id))
    } else if (sortBy === 'amount-desc') {
      list.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
    } else if (sortBy === 'amount-asc') {
      list.sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0))
    }

    return list
  }, [transactions, biz, type, from, to, q, sortBy])

  // Aggregate stats for filtered view
  const stats = useMemo(() => {
    let inflow = 0
    let outflow = 0
    filteredTxns.forEach((t) => {
      const amt = Number(t.amount || 0)
      if (t.type === 'income' || t.type === 'investment') {
        inflow += amt
      } else if (t.type === 'expense' || t.type === 'withdrawal') {
        outflow += amt
      }
    })
    return {
      inflow,
      outflow,
      net: inflow - outflow,
      count: filteredTxns.length
    }
  }, [filteredTxns])

  const hasActiveFilters =
    biz !== 'all' || type !== 'all' || from !== '' || to !== '' || q.trim() !== ''

  const handleResetFilters = () => {
    setActivePreset('all')
    setFrom('')
    setTo('')
    setBiz('all')
    setType('all')
    setQ('')
    setSortBy('date-desc')
    setShowCustomRange(false)
  }

  // Export filtered transactions to CSV
  const handleExportCsv = () => {
    if (filteredTxns.length === 0) return

    const bizMap = {}
    businesses.forEach((b) => {
      bizMap[b.id] = b.name
    })

    const headers = [
      'Date',
      'Reference Code',
      'Type',
      'Business',
      'Category / Purpose',
      'Vendor / Party',
      'Amount (INR)',
      'Description'
    ]

    const rows = filteredTxns.map((t) => [
      t.date || '',
      t.ref_code || '',
      t.type || '',
      bizMap[t.biz_id] || '',
      t.category || t.purpose || '',
      t.vendor || '',
      t.amount || 0,
      `"${(t.description || '').replace(/"/g, '""')}"`
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `poonji-ledger-${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    setTimeout(() => document.body.removeChild(link), 150)
  }

  return (
    <div>
      {/* Top Header */}
      <header className="px-[18px] pt-4 pb-2.5 flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-ink">Transactions Ledger</h1>
          <p className="text-xs text-ink-dim mt-0.5">
            {stats.count} {stats.count === 1 ? 'transaction' : 'transactions'} in selected view
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportCsv}
            disabled={filteredTxns.length === 0}
            className="btn-ghost py-1.5 px-2.5 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
            title="Export filtered records to CSV"
          >
            <span>⬇️</span>
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={() => openAddTxn()}
            className="btn-primary py-1.5 px-3 text-xs font-semibold cursor-pointer shadow-xs"
          >
            + Add
          </button>
        </div>
      </header>

      {/* Filter & Duration Control Center */}
      <div className="px-[18px] space-y-3 pb-3">
        {/* Search Input Bar */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint text-sm">
            🔍
          </span>
          <input
            className="field-input pl-9 pr-9"
            placeholder="Search description, reference ID, vendor..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink text-xs w-5 h-5 flex items-center justify-center rounded-full bg-surface2 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Duration / Date Range Presets */}
        <div className="card p-3 border border-line bg-surface shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-ink uppercase tracking-wider">
              📅 Duration Range
            </span>
            {from || to ? (
              <span className="text-[11px] text-violet font-semibold">
                {from || 'Start'} → {to || 'Present'}
              </span>
            ) : (
              <span className="text-[11px] text-ink-faint">Showing all time</span>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {Object.entries(presets).map(([k, p]) => (
              <button
                key={k}
                type="button"
                onClick={() => handlePresetChange(k)}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center truncate ${
                  activePreset === k && !showCustomRange
                    ? 'bg-violet text-white shadow-xs'
                    : 'bg-surface2/70 text-ink-dim hover:text-ink hover:bg-surface2'
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handlePresetChange('custom')}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                showCustomRange
                  ? 'bg-violet text-white shadow-xs'
                  : 'bg-surface2/70 text-ink-dim hover:text-ink hover:bg-surface2'
              }`}
            >
              <span>Custom</span>
              <span>{showCustomRange ? '▲' : '▼'}</span>
            </button>
          </div>

          {/* Collapsible Custom Date Picker Box */}
          {showCustomRange && (
            <div className="mt-3 pt-3 border-t border-line/60 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2.5 mb-2">
                <div>
                  <label className="text-[10.5px] font-semibold text-ink-dim uppercase block mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    className="field-input text-xs py-1.5 px-2.5"
                    value={from}
                    onChange={(e) => {
                      setFrom(e.target.value)
                      setActivePreset('custom')
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-semibold text-ink-dim uppercase block mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    className="field-input text-xs py-1.5 px-2.5"
                    value={to}
                    onChange={(e) => {
                      setTo(e.target.value)
                      setActivePreset('custom')
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-ink-dim pt-1">
                <span>Select exact start & end dates</span>
                {(from || to) && (
                  <button
                    onClick={() => {
                      setFrom('')
                      setTo('')
                      setActivePreset('all')
                      setShowCustomRange(false)
                    }}
                    className="text-rose font-medium hover:underline cursor-pointer"
                  >
                    Clear dates
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Business, Type & Sort Bar */}
        <div className="card p-3 border border-line bg-surface space-y-2.5">
          {/* Business Selector */}
          <div>
            <div className="text-[11px] font-bold text-ink uppercase tracking-wider mb-1.5">
              🏢 Business Enterprise
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => setBiz('all')}
                className={`py-1 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  biz === 'all'
                    ? 'bg-violet text-white shadow-xs'
                    : 'bg-surface2 text-ink-dim hover:text-ink'
                }`}
              >
                All Businesses ({businesses.length})
              </button>
              {businesses.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBiz(b.id)}
                  className={`py-1 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    biz === b.id
                      ? 'bg-violet text-white shadow-xs'
                      : 'bg-surface2 text-ink-dim hover:text-ink'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Type Selector */}
          <div>
            <div className="text-[11px] font-bold text-ink uppercase tracking-wider mb-1.5">
              🏷️ Transaction Type
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => setType('all')}
                className={`py-1 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  type === 'all'
                    ? 'bg-ink text-surface shadow-xs'
                    : 'bg-surface2 text-ink-dim hover:text-ink'
                }`}
              >
                All Types
              </button>
              {Object.entries(TYPES).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setType(k)}
                  className={`py-1 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
                    type === k
                      ? 'bg-ink text-surface shadow-xs'
                      : 'bg-surface2 text-ink-dim hover:text-ink'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: v.color }}
                  />
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort Order Selector */}
          <div className="pt-1 border-t border-line/60 flex items-center justify-between text-xs">
            <span className="text-[11px] text-ink-dim font-medium">Sort Order</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface2 text-ink font-semibold text-xs py-1 px-2 rounded-lg border border-line cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Live Filter Summary Strip & Reset Bar */}
        <div className="card p-3 border border-violet/20 bg-violet/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[10px] text-ink-faint uppercase font-bold">Inflow</div>
              <div className="text-xs font-bold text-em num">+{fmt(stats.inflow)}</div>
            </div>
            <div>
              <div className="text-[10px] text-ink-faint uppercase font-bold">Outflow</div>
              <div className="text-xs font-bold text-rose num">−{fmt(stats.outflow)}</div>
            </div>
            <div>
              <div className="text-[10px] text-ink-faint uppercase font-bold">Net Flow</div>
              <div
                className={`text-xs font-bold num ${
                  stats.net > 0 ? 'text-em' : stats.net < 0 ? 'text-rose' : 'text-ink'
                }`}
              >
                {stats.net > 0 ? '+' : ''}
                {fmt(stats.net)}
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-rose font-bold hover:underline py-1 px-2 rounded-lg hover:bg-rose/10 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transaction List */}
      <div className="px-[18px] pb-6">
        <TxnList
          txns={filteredTxns}
          businesses={businesses}
          onOpen={openEditTxn}
        />
      </div>
    </div>
  )
}
