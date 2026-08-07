import { useNavigate, useLocation } from 'react-router-dom'
import PskLogoOrbit from './PskLogoOrbit'

interface SidebarProps {
  onLogout: () => void
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
      { icon: '🔔', label: 'Reminders', path: '#', badge: '9' },
      { icon: '📊', label: 'Analytics', path: '#', badge: null },
      { icon: '⚙️', label: 'Settings', path: '#', badge: null },
    ]
  }
]

export default function Sidebar({ onLogout }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavClick = (path: string) => {
    if (path !== '#') {
      navigate(path)
    }
  }

  return (
    <div className="w-56 glass-lg border-r border-psk-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-psk-border">
        <div className="flex items-center gap-3">
          {/* Authentic PSK Safari brand mark */}
          <PskLogoOrbit size="sm" showOrbit={false} />

          {/* Text */}
          <div>
            <p className="text-sm font-bold text-white">PSK Safaris</p>
            <p className="text-xs text-psk-text-gold">Admin Platform</p>
          </div>
        </div>
      </div>

      {/* Branch selector */}
      <div className="p-4 border-b border-psk-border">
        <button className="w-full flex items-center justify-between px-3 py-2 bg-psk-bg-surface border border-psk-border rounded-glass hover:border-psk-border-gold transition text-sm text-psk-text-primary">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-psk-gold shadow-glow-gold"></div>
            <span>Eldoret branch</span>
          </div>
          <span className="text-xs">▼</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.name}>
            <p className="text-xs font-semibold uppercase tracking-widest text-psk-text-tertiary mb-3 px-2">
              {group.name}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-glass transition relative group ${
                      isActive
                        ? 'glass-glossy text-psk-text-gold font-medium'
                        : 'text-psk-text-secondary hover:text-psk-text-primary hover:bg-psk-bg-surface'
                    }`}
                  >
                    {/* Active bar */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-psk-gold to-psk-gold-warm rounded-r"></div>
                    )}

                    {/* Icon */}
                    <div className="w-7 h-7 flex items-center justify-center text-lg rounded-glass bg-psk-bg-surface group-hover:bg-psk-bg-elevated transition">
                      {item.icon}
                    </div>

                    {/* Label */}
                    <span className="text-sm flex-1 text-left">{item.label}</span>

                    {/* Badge */}
                    {item.badge && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
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

      {/* Logout button */}
      <div className="p-4 border-t border-psk-border">
        <button
          onClick={onLogout}
          className="w-full py-2.5 px-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 rounded-glass text-red-300 text-sm font-medium transition"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
