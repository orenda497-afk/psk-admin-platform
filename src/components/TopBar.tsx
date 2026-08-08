import { Bell, MapPin } from 'lucide-react'
import { useState } from 'react'
import { BRANCHES } from '../data/branches'

interface TopBarProps {
  title: string
  subtitle: string
  currentBranch?: 'eldoret' | 'kisumu'
  onBranchChange?: (branchId: 'eldoret' | 'kisumu') => void
}

export default function TopBar({ 
  title, 
  subtitle, 
  currentBranch = 'eldoret',
  onBranchChange 
}: TopBarProps) {
  const [showBranchMenu, setShowBranchMenu] = useState(false)
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })

  const activeBranch = BRANCHES[currentBranch]

  const handleBranchSelect = (branchId: 'eldoret' | 'kisumu') => {
    onBranchChange?.(branchId)
    setShowBranchMenu(false)
  }

  return (
    <div className="h-16 glass-lg border-b border-slate-800 flex items-center justify-between px-6">
      {/* Left */}
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-psk-text-secondary">{subtitle}</p>}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-psk-text-secondary hover:bg-slate-700 transition"
          >
            <MapPin size={14} />
            <span className="font-medium">{activeBranch.displayName}</span>
          </button>

          {showBranchMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50">
              {Object.values(BRANCHES).map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch.id as 'eldoret' | 'kisumu')}
                  className={`w-full text-left px-4 py-3 text-sm border-b border-slate-800 last:border-b-0 transition ${
                    currentBranch === branch.id
                      ? 'bg-amber-600/20 text-amber-400'
                      : 'text-psk-text-secondary hover:bg-slate-800'
                  }`}
                >
                  <div className="font-medium">{branch.displayName}</div>
                  <div className="text-xs text-slate-500 mt-1">{branch.address}</div>
                </button>
              ))}
            </div>
          )}
        </div>

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
