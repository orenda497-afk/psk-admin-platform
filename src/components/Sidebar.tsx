import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FinancePINLock from './FinancePINLock'
import { NAVIGATION_STRUCTURE } from '../data/navigation'
import { getStaffByEmail } from '../data/staff'

interface SidebarProps {
  onLogout: () => void
  currentUser?: string
}

export default function Sidebar({ onLogout, currentUser = '' }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [openCategory, setOpenCategory] = useState<string | null>('operations')
  const [financeUnlocked, setFinanceUnlocked] = useState(false)
  const [showFinancePIN, setShowFinancePIN] = useState(false)
  const [pendingFinanceOpen, setPendingFinanceOpen] = useState(false)
  const [showBranchMenu, setShowBranchMenu] = useState(false)
  const [currentBranch, setCurrentBranch] = useState<'eldoret' | 'kisumu'>('eldoret')

  const staffInfo = currentUser ? getStaffByEmail(currentUser) : null

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'finance' && !financeUnlocked) {
      setShowFinancePIN(true)
      setPendingFinanceOpen(true)
      return
    }

    if (categoryId === 'home') {
      navigate('/')
      setOpenCategory(null)
      return
    }

    setOpenCategory(openCategory === categoryId ? null : categoryId)
  }

  const handleSubcategoryClick = (route: string) => {
    navigate(route)
  }

  const handleFinanceUnlock = () => {
    setShowFinancePIN(false)
    setFinanceUnlocked(true)
    if (pendingFinanceOpen) {
      setOpenCategory('finance')
      setPendingFinanceOpen(false)
    }
  }

  const isSubcategoryActive = (route: string) => {
    return location.pathname === route
  }

  const isCategoryActive = (categoryId: string) => {
    const category = NAVIGATION_STRUCTURE.find(c => c.id === categoryId)
    if (!category) return false
    return category.subcategories.some(sub => isSubcategoryActive(sub.route))
  }

  const branchNames: Record<string, string> = {
    eldoret: 'Eldoret HQ',
    kisumu: 'Kisumu Branch',
    all: 'All Branches'
  }

  return (
    <>
      {showFinancePIN && <FinancePINLock onUnlock={handleFinanceUnlock} />}

      {/* Sidebar */}
      <aside className="h-full w-64 bg-gradient-to-b from-[#0a1118] to-[#0c1520] border-r border-slate-700 flex flex-col overflow-hidden">
        
        {/* Logo Section */}
        <div className="p-4 border-b border-white/7 flex-shrink-0">
          {/* Logo with Glow */}
          <div className="relative mb-4 flex justify-center">
            {/* Glow Background */}
            <div className="absolute inset-0 flex justify-center">
              <div 
                className="w-12 h-12 rounded-full animate-pulse"
                style={{
                  background: 'radial-gradient(circle, rgba(255,215,0,0.32), rgba(255,149,0,0.12) 50%, transparent 70%)',
                  animation: 'pulse 3s ease-in-out infinite'
                }}
              />
            </div>
            
            {/* Logo Circle */}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg relative z-10 border-1.5 flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #FF9500, #FFD700 45%, #2D5F3F)',
                border: '1.5px solid rgba(255,215,0,0.45)',
                boxShadow: '0 0 16px rgba(255,215,0,0.18)',
              }}
            >
              P
            </div>
          </div>

          {/* Company Name */}
          <div className="text-center">
            <p className="text-sm font-semibold text-white" style={{ color: 'rgba(255,255,255,0.9)' }}>
              PSK Safaris
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,215,0,0.5)' }}>
              Admin Platform
            </p>
          </div>
        </div>

        {/* Branch Selector */}
        <div className="px-4 py-3 border-b border-white/7 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="flex-1 text-left text-slate-300">{branchNames[currentBranch]}</span>
              <span className="text-slate-500">⌄</span>
            </button>

            {/* Branch Dropdown */}
            {showBranchMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50">
                {['eldoret', 'kisumi', 'all'].map((branch) => (
                  <button
                    key={branch}
                    onClick={() => {
                      setCurrentBranch(branch as 'eldoret' | 'kisumu')
                      setShowBranchMenu(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-xs border-b border-slate-800 last:border-b-0 transition ${
                      currentBranch === branch
                        ? 'bg-amber-600/20 text-amber-400'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {branchNames[branch]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAVIGATION_STRUCTURE.map((category) => {
            const isOpen = openCategory === category.id
            const isActive = isCategoryActive(category.id)
            const hasSubcats = category.subcategories.length > 0

            const visibleSubcats = category.id === 'finance' && !financeUnlocked 
              ? [] 
              : category.subcategories.filter(sub => {
                  if (sub.roleRestricted === 'owner' && staffInfo?.role !== 'owner') {
                    return false
                  }
                  return true
                })

            return (
              <div key={category.id}>
                {/* Category Button */}
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group ${
                    isActive || isOpen
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  style={
                    isActive || isOpen
                      ? {
                          background: 'linear-gradient(135deg, rgba(255,215,0,0.11), rgba(255,149,0,0.055))',
                          border: '1px solid rgba(255,215,0,0.18)',
                          color: 'rgba(255,255,255,0.92)',
                          fontWeight: '500',
                        }
                      : {}
                  }
                >
                  {/* Gold left bar for active */}
                  {(isActive || isOpen) && (
                    <div 
                      className="absolute left-0 top-4 bottom-4 w-0.5 rounded"
                      style={{
                        background: 'linear-gradient(180deg,#FFD700,#FF9500)',
                      }}
                    />
                  )}
                  
                  <span className="text-base flex-shrink-0">{category.icon}</span>
                  <span className="flex-1 text-left">{category.label}</span>
                  {hasSubcats && (
                    <span className={`text-xs transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                      ›
                    </span>
                  )}
                  {category.id === 'finance' && <span className="text-xs">🔒</span>}
                </button>

                {/* Subcategories */}
                {hasSubcats && (
                  <div
                    className={`transition-all duration-200 overflow-hidden`}
                    style={{
                      maxHeight: isOpen ? `${visibleSubcats.length * 36 + 8}px` : '0px',
                    }}
                  >
                    {visibleSubcats.map((subcat) => (
                      <button
                        key={subcat.id}
                        onClick={() => handleSubcategoryClick(subcat.route)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ml-2 ${
                          isSubcategoryActive(subcat.route)
                            ? 'text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        style={
                          isSubcategoryActive(subcat.route)
                            ? {
                                color: 'rgba(255,215,0,0.85)',
                                background: 'rgba(255,215,0,0.055)',
                                borderLeft: '2px solid rgba(255,215,0,0.42)',
                                paddingLeft: '12px',
                              }
                            : {
                                borderLeft: '2px solid rgba(255,255,255,0.06)',
                                paddingLeft: '12px',
                              }
                        }
                      >
                        <span className="text-sm flex-shrink-0">{subcat.icon}</span>
                        <span className="flex-1 text-left">{subcat.label}</span>
                        {subcat.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                            subcat.badgeColor === 'red'
                              ? 'bg-red-500/30 text-red-300'
                              : 'bg-amber-500/30 text-amber-300'
                          }`}>
                            {subcat.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* User Footer */}
        {staffInfo && (
          <div className="p-4 border-t border-white/7 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #FF9500, #FFD700)',
                }}
              >
                {staffInfo.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{staffInfo.name}</p>
                <p className="text-[10px] text-slate-400 truncate capitalize">{staffInfo.role} · All branches</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-3 border-t border-white/7 flex-shrink-0">
          <button
            onClick={onLogout}
            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.65;
          }
          50% {
            transform: scale(1.07);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
