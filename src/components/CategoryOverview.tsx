import { useNavigate } from 'react-router-dom'

interface QuickAccessButton {
  icon: string
  label: string
  route: string
  badge?: number
  badgeColor?: 'red' | 'amber'
}

interface CategoryOverviewProps {
  emoji: string
  iconImg?: string
  title: string
  description: string
  buttons: QuickAccessButton[]
}

export default function CategoryOverview({ emoji, iconImg, title, description, buttons }: CategoryOverviewProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        {iconImg ? (
          <img
            src={iconImg}
            alt=""
            className="mx-auto mb-4"
            style={{
              width: '96px',
              height: '96px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.45)) drop-shadow(0 0 22px rgba(255,215,0,0.18))',
            }}
          />
        ) : (
          <div className="text-7xl mb-4">{emoji}</div>
        )}
        <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
        <p className="text-lg text-slate-400">{description}</p>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => navigate(btn.route)}
            className="group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/20"
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition" />
            
            {/* Content */}
            <div className="relative z-10 flex items-start gap-2 sm:gap-4">
              <div className="text-3xl sm:text-4xl flex-shrink-0">{btn.icon}</div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-semibold text-white group-hover:text-amber-300 transition mb-1 text-sm sm:text-base truncate">{btn.label}</h3>
                {btn.badge && (
                  <div className={`inline-block text-xs font-bold px-2 py-1 rounded ${
                    btn.badgeColor === 'red'
                      ? 'bg-red-500/30 text-red-300'
                      : 'bg-amber-500/30 text-amber-300'
                  }`}>
                    {btn.badge} pending
                  </div>
                )}
              </div>
              <div className="text-slate-400 group-hover:text-amber-300 transition text-xl">→</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
