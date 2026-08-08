import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const categories = [
    {
      id: 'operations',
      emoji: '🔧',
      title: 'Operations',
      description: 'Registry board, bookings, rental agreements, handover checklists and reminders.',
      tags: [
        { label: '2 overdue', color: 'red' },
        { label: '8 bookings', color: 'amber' },
        { label: '9 reminders', color: 'amber' },
      ],
    },
    {
      id: 'clients',
      emoji: '👥',
      title: 'Clients & Drivers',
      description: 'Manage your clients, drivers, staff performance and ratings across both branches.',
      tags: [
        { label: '24 clients', color: 'default' },
        { label: '8 drivers', color: 'default' },
      ],
    },
    {
      id: 'fleet',
      emoji: '🚗',
      title: 'Fleet',
      description: 'Vehicle maintenance, fuel consumption tracking and compliance calendar.',
      tags: [
        { label: '20 vehicles', color: 'green' },
        { label: '2 in service', color: 'amber' },
      ],
    },
    {
      id: 'owners',
      emoji: '🚙',
      title: 'Vehicle Owners',
      description: 'Owner profiles, monthly payouts and the owner self-service portal.',
      tags: [
        { label: '6 owners', color: 'default' },
        { label: '2 payouts pending', color: 'amber' },
      ],
    },
    {
      id: 'finance',
      emoji: '💰',
      title: 'Finance',
      description: 'P&L, invoices, M-Pesa reconciliation, expenses, owner payouts and reports.',
      tags: [
        { label: 'PIN protected', color: 'gold' },
        { label: '3 overdue invoices', color: 'red' },
      ],
      locked: true,
    },
    {
      id: 'intelligence',
      emoji: '📊',
      title: 'Intelligence',
      description: 'Analytics, audit logs, system settings and access control.',
      tags: [
        { label: 'Analytics', color: 'default' },
        { label: 'Audit log', color: 'default' },
        { label: 'Settings', color: 'default' },
      ],
    },
  ]

  const getTagColor = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      default: {
        bg: 'rgba(255,255,255,0.06)',
        border: 'rgba(255,255,255,0.08)',
        text: 'rgba(255,255,255,0.38)',
      },
      red: {
        bg: 'rgba(231,76,60,0.1)',
        border: 'rgba(231,76,60,0.18)',
        text: 'rgba(239,154,154,0.75)',
      },
      amber: {
        bg: 'rgba(255,149,0,0.1)',
        border: 'rgba(255,149,0,0.16)',
        text: 'rgba(255,183,77,0.8)',
      },
      gold: {
        bg: 'rgba(255,215,0,0.08)',
        border: 'rgba(255,215,0,0.16)',
        text: 'rgba(255,215,0,0.65)',
      },
      green: {
        bg: 'rgba(45,95,63,0.2)',
        border: 'rgba(76,175,114,0.2)',
        text: 'rgba(129,199,132,0.75)',
      },
    }
    return colors[color] || colors.default
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">
          {getGreeting()}, Ken 👋
        </h1>
        <p className="text-sm text-slate-400">
          Here's what's happening across both branches today.
        </p>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((category) => {
          return (
            <button
              key={category.id}
              onClick={() => navigate(`/${category.id === 'operations' ? 'operations' : category.id === 'clients' ? 'clients-drivers' : category.id === 'fleet' ? 'fleet-overview' : category.id === 'owners' ? 'owners-overview' : category.id === 'finance' ? 'finance-overview' : 'intelligence-overview'}`)}
              className="group text-left rounded-2xl p-4 transition-all duration-200 hover:scale-102 hover:shadow-lg"
              style={{
                background: 'rgba(255,255,255,0.045)',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.07)',
              }}
            >
              {/* Header Row */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{category.emoji}</span>
                <span className="text-slate-400 group-hover:text-slate-200 transition">→</span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-white mb-2">
                {category.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-400 mb-4 leading-relaxed line-clamp-2">
                {category.description}
              </p>

              {/* Tags */}
              <div 
                className="pt-3 border-t border-white/7 flex flex-wrap gap-2"
              >
                {category.tags.map((tag, idx) => {
                  const colors = getTagColor(tag.color)
                  return (
                    <span
                      key={idx}
                      className="text-[10px] font-medium px-2 py-1 rounded-md"
                      style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                    >
                      {tag.label}
                    </span>
                  )
                })}
                {category.locked && (
                  <span className="text-[10px] font-medium px-2 py-1 rounded-md ml-auto">
                    🔒
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Quick Stats Strip */}
      <div 
        className="rounded-2xl p-3 flex items-center gap-3 overflow-x-auto"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center gap-2 whitespace-nowrap px-3 py-2">
          <span className="text-lg">🚗</span>
          <span className="text-xs font-semibold text-white">12</span>
          <span className="text-xs text-slate-400">Available now</span>
        </div>

        <div className="w-px h-6 bg-white/10" />

        <div className="flex items-center gap-2 whitespace-nowrap px-3 py-2">
          <span className="text-lg">📅</span>
          <span className="text-xs font-semibold text-white">6</span>
          <span className="text-xs text-slate-400">Out on hire</span>
        </div>

        <div className="w-px h-6 bg-white/10" />

        <div className="flex items-center gap-2 whitespace-nowrap px-3 py-2">
          <span className="text-lg">⚠️</span>
          <span className="text-xs font-semibold text-white">2</span>
          <span className="text-xs text-slate-400">Overdue returns</span>
        </div>

        <div className="w-px h-6 bg-white/10" />

        <div className="flex items-center gap-2 whitespace-nowrap px-3 py-2">
          <span className="text-lg">📱</span>
          <span className="text-xs font-semibold text-white">5</span>
          <span className="text-xs text-slate-400">Unmatched M-Pesa</span>
        </div>

        <div className="w-px h-6 bg-white/10" />

        <div className="flex items-center gap-2 whitespace-nowrap px-3 py-2">
          <span className="text-lg">💰</span>
          <span className="text-xs font-semibold text-white">KES 425k</span>
          <span className="text-xs text-slate-400">Revenue (Aug)</span>
        </div>
      </div>
    </div>
  )
}
