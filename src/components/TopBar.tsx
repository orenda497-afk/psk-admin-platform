import { Bell } from 'lucide-react'
import PskLogoOrbit from './PskLogoOrbit'

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
    <div className="h-16 glass-lg border-b border-psk-border flex items-center justify-between px-6">
      {/* Left */}
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-psk-text-secondary">{subtitle}</p>}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Date */}
        <div className="px-3 py-1.5 bg-psk-bg-surface border border-psk-border rounded-glass text-xs text-psk-text-secondary">
          {today}
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-psk-bg-surface rounded-glass transition">
          <Bell size={18} className="text-psk-text-secondary hover:text-psk-text-primary transition" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* New booking button */}
        <button className="px-4 py-2 glass-glossy text-psk-text-gold text-sm font-semibold rounded-glass transition hover:brightness-110">
          + New booking
        </button>

        {/* Authenticated PSK brand mark */}
        <PskLogoOrbit size="sm" className="ml-1" />
      </div>
    </div>
  )
}
