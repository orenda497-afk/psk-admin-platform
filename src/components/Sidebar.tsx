import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PskLogoOrbit from './PskLogoOrbit'
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

  return (
    <>
      {showFinancePIN && <FinancePINLock onUnlock={handleFinanceUnlock} />}

      <div className="h-full glass-lg border-r border-psk-border flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="p-4 border-b border-psk-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <PskLogoOrbit size="sm" showOrbit={false} />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">PSK</p>
              <p className="text-[10px] text-slate-400 truncate">Safaris</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {staffInfo && (
          <div className="px-4 py-3 border-b border-psk-border bg-slate-800/30 flex-shrink-0">
            <p className="text-xs font-semibold text-white truncate">{staffInfo.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{staffInfo.email}</p>
            <p className="text-[10px] text-amber-400 mt-1 capitalize">{staffInfo.role}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAVIGATION_STRUCTURE.map((category) => {
            const isOpen = openCategory === category.id
            const isActive = isCategoryActive(category.id)
            const hasSubcats = category.subcategories.length > 0

            // Hide Finance subcategories until unlocked
                const visibleSubcats = category.id === 'finance' && !financeUnlocked 
              ? [] 
              : category.subcategories.filter(sub => {
                  // Hide Owner Payouts for non-owner roles
                  if (sub.roleRestricted === 'owner' && staffInfo?.role !== 'owner' && staffInfo?.role !== undefined) {
                    return false
                  }
                  return true
                })

            return (
              <div key={category.id}>
                {/* Category Button */}
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`cat-btn w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all relative ${
                    isActive || isOpen
                      ? 'bg-gradient-to-r from-amber-500/15 to-amber-500/5 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                  }`}
                >
                  <span className="text-base">{category.icon}</span>
                  <span className="flex-1 text-left truncate">{category.label}</span>
                  {hasSubcats && (
                    <span className={`cat-arrow text-xs transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                      ›
                    </span>
                  )}
                  {isActive && !isOpen && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-gradient-to-b from-amber-400 to-amber-600 rounded" />
                  )}
                </button>

                {/* Subcategories */}
                {hasSubcats && (
                  <div
                    className={`subcats transition-all duration-200 ${isOpen ? 'open max-h-96' : 'max-h-0'}`}
                    style={{
                      maxHeight: isOpen ? `${visibleSubcats.length * 32 + 8}px` : '0px'
                    }}
                  >
                    {visibleSubcats.map((subcat) => (
                      <button
                        key={subcat.id}
                        onClick={() => handleSubcategoryClick(subcat.route)}
                        className={`subcat w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                          isSubcategoryActive(subcat.route)
                            ? 'text-amber-300 bg-amber-500/10 border-l-2 border-amber-400'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 border-l border-slate-600'
                        }`}
                      >
                        <span className="text-sm">{subcat.icon}</span>
                        <span className="flex-1 text-left truncate">{subcat.label}</span>
                        {subcat.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
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

        {/* Logout */}
        <div className="p-3 border-t border-psk-border flex-shrink-0">
          <button
            onClick={onLogout}
            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  )
}
