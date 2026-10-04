import { NavLink } from 'react-router-dom'

export default function Navbar({ onOpenAddTxn }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line px-4 py-2 flex items-center justify-around max-w-md mx-auto shadow-lg">
      <NavItem to="/" icon="📊" label="Overview" end />
      <NavItem to="/ledger" icon="📒" label="Ledger" />

      {/* Floating Add Action Button */}
      <button
        onClick={() => onOpenAddTxn()}
        className="w-12 h-12 -mt-5 rounded-full bg-violet hover:bg-violet/90 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-violet/30 active:scale-95 transition-transform cursor-pointer"
        aria-label="Add Transaction"
      >
        +
      </button>

      <NavItem to="/reports" icon="📈" label="Reports" />
      <NavItem to="/accounts" icon="🏦" label="Accounts" />
    </nav>
  )
}

function NavItem({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors py-1 px-2 rounded-xl ${
          isActive ? 'text-violet' : 'text-ink-faint hover:text-ink'
        }`
      }
    >
      <span className="text-base leading-none">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}
