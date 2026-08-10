import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FinancePINLock from './FinancePINLock'
import { NAVIGATION_STRUCTURE } from '../data/navigation'

interface SidebarProps {
  onLogout: () => void
  currentUser?: string
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [openCategory, setOpenCategory] = useState<string | null>('operations')
  const [financeUnlocked, setFinanceUnlocked] = useState(false)
  const [showFinancePIN, setShowFinancePIN] = useState(false)
  const [pendingFinanceOpen, setPendingFinanceOpen] = useState(false)

  const [currentBranch, setCurrentBranch] = useState<'eldoret' | 'kisumu'>('eldoret')

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

  const getCategoryActive = (categoryId: string) => {
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

      {/* Sidebar — 232px fixed width */}
      <aside
        className="h-screen flex flex-col flex-shrink-0 overflow-hidden"
        style={{
          width: '232px',
          minWidth: '232px',
          background: 'rgba(8,20,30,0.72)',
          borderRight: '1.5px solid rgba(255,215,0,0.13)',
        }}
      >
        {/* Logo Zone */}
        <div
          className="flex items-center gap-[13px] flex-shrink-0"
          style={{
            padding: '24px 18px 20px',
            borderBottom: '1px solid rgba(255,215,0,0.10)',
          }}
        >
          {/* Logo with glow */}
          <div className="relative flex-shrink-0">
            {/* Glow aura */}
            <div
              className="absolute inset-[-10px] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,215,0,0.28) 0%, rgba(255,149,0,0.10) 50%, transparent 70%)',
                animation: 'logoPulse 3s ease-in-out infinite',
              }}
            />
            
            {/* Logo image */}
            <img
              src="/branding/psk-logo.png"
              alt="PSK Safaris"
              className="w-12 h-12 rounded-full relative z-10"
              style={{
                border: '2px solid rgba(255,215,0,0.55)',
                boxShadow: '0 0 22px rgba(255,215,0,0.28), 0 2px 8px rgba(0,0,0,0.35)',
              }}
            />
          </div>

          {/* Logo text */}
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>
              PSK Safaris
            </div>
            <div className="text-[10px] mt-[3px]" style={{ color: 'rgba(255,215,0,0.55)' }}>
              Admin Platform
            </div>
          </div>
        </div>

        {/* Branch Selector */}
        <div
          className="relative flex items-center justify-between rounded-[9px] px-[13px] py-2 cursor-pointer group"
          style={{
            margin: '12px 14px 14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,215,0,0.16)',
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-[6px] h-[6px] rounded-full flex-shrink-0"
              style={{
                background: '#FFD700',
                boxShadow: '0 0 7px rgba(255,215,0,0.65)',
              }}
            />
            <span className="text-[11.5px] truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {branchNames[currentBranch]}
            </span>
          </div>
          <span className="text-[10px] flex-shrink-0 ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            ⌄
          </span>

          {/* Dropdown menu */}
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
            style={{
              background: 'rgba(8,20,30,0.95)',
              border: '1px solid rgba(255,215,0,0.16)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            }}
          >
            {Object.entries(branchNames).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setCurrentBranch(id as 'eldoret' | 'kisumu')}
                className="w-full text-left px-3 py-2 text-[11px] transition"
                style={{
                  color: currentBranch === id ? 'rgba(255,215,0,0.95)' : 'rgba(255,255,255,0.55)',
                  background: currentBranch === id ? 'rgba(255,215,0,0.08)' : 'transparent',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation - scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-[2px]">
          {/* Home */}
          <button
            onClick={() => {
              navigate('/')
              setOpenCategory(null)
            }}
            className="w-full flex items-center gap-[10px] px-3 py-[10px] rounded-[9px] border border-transparent transition-all text-[12.5px] font-normal relative"
            style={{
              color: location.pathname === '/' ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.65)',
              background: location.pathname === '/' ? 'rgba(255,215,0,0.08)' : 'transparent',
              borderColor: location.pathname === '/' ? 'rgba(255,215,0,0.20)' : 'transparent',
              fontWeight: location.pathname === '/' ? 600 : 400,
            }}
          >
            {location.pathname === '/' && (
              <div
                className="absolute left-0 top-[16%] bottom-[16%] w-[3px] rounded-[2px]"
                style={{
                  background: 'linear-gradient(180deg, #FFD700, #FF9500)',
                }}
              />
            )}
            <span className="text-lg" style={{ filter: 'drop-shadow(0 0 3px rgba(255,215,0,0.4))' }}>🏠</span>
            <span>Home</span>
          </button>

          {/* Categories */}
          {NAVIGATION_STRUCTURE.map(category => {
            const isOpen = openCategory === category.id
            const isCategoryActive = getCategoryActive(category.id)

            return (
              <div key={category.id}>
                {/* Category button */}
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className="w-full flex items-center gap-[10px] px-3 py-[10px] rounded-[9px] border border-transparent transition-all text-[12.5px] font-normal relative"
            style={{
              color: isCategoryActive ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.65)',
                    background: isCategoryActive ? 'rgba(255,215,0,0.08)' : 'transparent',
                    borderColor: isCategoryActive ? 'rgba(255,215,0,0.20)' : 'transparent',
                    fontWeight: isCategoryActive ? 600 : 400,
                  }}
                >
                  {isCategoryActive && (
                    <div
                      className="absolute left-0 top-[16%] bottom-[16%] w-[3px] rounded-[2px]"
                      style={{
                        background: 'linear-gradient(180deg, #FFD700, #FF9500)',
                      }}
                    />
                  )}
                  <span className="text-lg" style={{ filter: 'drop-shadow(0 0 3px rgba(255,215,0,0.4))' }}>{category.icon}</span>
                  <span className="flex-1 text-left">{category.label}</span>
                  {category.id === 'finance' && <span>🔒</span>}
                  {category.subcategories.length > 0 && (
                    <span
                      className="text-[11px] transition-transform"
                      style={{
                        color: 'rgba(255,255,255,0.18)',
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}
                    >
                      ›
                    </span>
                  )}
                </button>

                {/* Subcategories */}
                {category.subcategories.length > 0 && (
                  <div
                    className="overflow-hidden transition-all"
                    style={{
                      maxHeight: isOpen ? '500px' : '0px',
                      transitionDuration: '240ms',
                      transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
                    }}
                  >
                    <div style={{ paddingLeft: '14px' }}>
                      {category.subcategories.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => handleSubcategoryClick(sub.route)}
                          className="w-full flex items-center gap-2 px-[11px] py-[7px] rounded-[7px] text-[11.5px] mb-[1px] border-l-2 transition-all"
            style={{
              color: isSubcategoryActive(sub.route) ? 'rgba(255,215,0,0.95)' : 'rgba(255,255,255,0.58)',
              background: isSubcategoryActive(sub.route) ? 'rgba(255,215,0,0.08)' : 'transparent',
              borderLeftColor: isSubcategoryActive(sub.route) ? 'rgba(255,215,0,0.45)' : 'rgba(255,255,255,0.12)',
                            fontWeight: isSubcategoryActive(sub.route) ? 500 : 400,
                          }}
                        >
                          <span className="text-base" style={{ filter: 'drop-shadow(0 0 2px rgba(255,215,0,0.3))' }}>{sub.icon}</span>
                          <span className="flex-1 text-left">{sub.label}</span>
                          {sub.badge && (
                            <span
                              className="text-[8px] font-bold px-[6px] py-[2px] rounded-[7px]"
                              style={{
                                background: sub.badgeColor === 'red' ? 'rgba(231,76,60,0.18)' : 'rgba(255,149,0,0.16)',
                                color: sub.badgeColor === 'red' ? 'rgba(239,120,120,0.95)' : 'rgba(255,183,50,0.95)',
                              }}
                            >
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Logout button at bottom */}
        <div
          className="flex-shrink-0 px-3 py-3 border-t"
          style={{
            borderColor: 'rgba(255,215,0,0.10)',
          }}
        >
          <button
            onClick={onLogout}
            className="w-full px-3 py-2 rounded-lg text-[11.5px] font-medium transition"
            style={{
              color: 'rgba(255,255,255,0.55)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            Logout
          </button>
        </div>

        <style>{`
          @keyframes logoPulse {
            0%, 100% {
              opacity: 0.55;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.10);
            }
          }
        `}</style>
      </aside>
    </>
  )
}
