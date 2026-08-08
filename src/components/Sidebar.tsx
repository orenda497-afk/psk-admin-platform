import { useNavigate, useLocation } from 'react-router-dom'
import PskLogoOrbit from './PskLogoOrbit'
import { getStaffByEmail } from '../data/staff'

interface SidebarProps {
  onLogout: () => void
  currentUser?: string
}

const navGroups = [
  {
    name: 'OPERATIONS',
    items: [
      { icon: '🚗', label: 'Registry board', path: '/', badge: null },
      { icon: '📅', label: 'Bookings', path: '/bookings', badge: '8' },
      { icon: '👥', label: 'Clients', path: '/clients', badge: null },
      { icon: '🧑‍✈️', label: 'Drivers', path: '/drivers', badge: null },
    ]
  },
  {
    name: 'BUSINESS',
    items: [
      { icon: '🏦', label: 'Investors', path: '/investors', badge: null },
      { icon: '💰', label: 'Finance', path: '/finance', badge: null },
      { icon: '📄', label: 'Quotations', path: '/quotations', badge: '3' },
    ]
  },
  {
    name: 'INTELLIGENCE',
    items: [
      { icon: '📊', label: 'Fleet Intelligence', path: '/analytics', badge: null },
    ]
  }
]

export default function Sidebar({ onLogout, currentUser = '' }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const staffInfo = currentUser ? getStaffByEmail(currentUser) : null

  const handleNavClick = (path: string) => {
    if (path !== '#') {
      navigate(path)
    }
  }

  return (
    <div style={{ width: '210px', minWidth: '210px', flexShrink: 0 }} className="glass-lg border-r border-psk-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-psk-border">
        <div className="flex items-center gap-3">
          {/* Authentic PSK Safari brand mark */}
          <PskLogoOrbit size="sm" showOrbit={false} />
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">PSK</p>
            <p className="text-[10px] text-slate-400 truncate">Safaris</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {staffInfo && (
        <div className="px-4 py-3 border-b border-psk-border bg-slate-800/30">
          <p className="text-xs font-semibold text-white truncate">{staffInfo.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{staffInfo.email}</p>
          <p className="text-[10px] text-amber-400 mt-1 capitalize">{staffInfo.role}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.name}>
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              {group.name}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                        : 'text-slate-300 hover:bg-slate-700/40 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-psk-border">
        <button
          onClick={onLogout}
          className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700/40 hover:text-white transition"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  )
}
