import { Bell } from 'lucide-react'

interface TopBarProps {
  title: string
  subtitle: string
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })

  return (
    <div className="h-16 glass-lg border-b border-slate-800 flex items-center justify-between px-6">
      {/* Left */}
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-psk-text-secondary">{subtitle}</p>}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Date */}
        <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-psk-text-secondary">
          {today}
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-slate-800 rounded-lg transition">
          <Bell size={18} className="text-slate-400 hover:text-slate-200 transition" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* New booking button */}
        <button className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg transition hover:bg-amber-500">
          + New booking
        </button>
      </div>
    </div>
  )
}
