import { Bell } from 'lucide-react'

interface TopBarProps {
  title: string
  subtitle: string
  currentBranch?: 'eldoret' | 'kisumu'
}

export default function TopBar({ 
  title, 
  subtitle, 
  currentBranch = 'eldoret'
}: TopBarProps) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })

  const branchNames: Record<string, string> = {
    eldoret: 'Eldoret HQ',
    kisumu: 'Kisumu Branch',
  }

  return (
    <div 
      className="h-14 flex items-center justify-between px-6 border-b flex-shrink-0"
      style={{
        background: 'rgba(255,255,255,0.025)',
        borderBottomColor: 'rgba(255,255,255,0.075)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Left */}
      <div>
        <h1 className="text-base font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Branch Pill */}
        <div 
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          <span>{branchNames[currentBranch]}</span>
        </div>

        {/* Date Chip */}
        <div 
          className="px-3 py-1.5 rounded-lg text-xs text-slate-400"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {today}
        </div>

        {/* Bell Icon */}
        <button 
          className="relative p-2 rounded-lg transition flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}
        >
          <Bell size={18} className="text-slate-400 hover:text-slate-200 transition" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* New Booking Button */}
        <button 
          className="px-4 py-2 rounded-lg text-sm font-semibold transition flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,149,0,0.09))',
            border: '1px solid rgba(255,215,0,0.3)',
            color: 'rgba(255,215,0,0.92)',
            boxShadow: '0 2px 12px rgba(255,215,0,0.08)',
          }}
        >
          + New booking
        </button>
      </div>
    </div>
  )
}
