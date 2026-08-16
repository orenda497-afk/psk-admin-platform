import { useState } from 'react'
import ProfilePanel from './ProfilePanel'
import { useNavigate, useLocation } from 'react-router-dom'
import { NAVIGATION_STRUCTURE } from '../data/navigation'

interface SidebarProps {
  userRole?: string
  onLogout: () => void
  currentUser?: string
  userName?: string
  userEmail?: string
  userTitle?: string
  userBranch?: string
}

export default function Sidebar({ userRole = 'owner', onLogout, userName = '', userEmail = '', userTitle = '', userBranch = 'eldoret' }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [openCategory, setOpenCategory] = useState<string | null>('operations')

  const [currentBranch, setCurrentBranch] = useState<'eldoret' | 'kisumu'>('eldoret')
  const [profileOpen, setProfileOpen] = useState(false)
  const [branchOpen, setBranchOpen] = useState(false)

  const handleCategoryClick = (categoryId: string) => {
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
      
      {/* Sidebar — 232px fixed width */}
      <aside
        className="h-screen flex flex-col flex-shrink-0 overflow-hidden"
        style={{
          width: '232px',
          minWidth: '232px',
          background: '#0F1E2E',
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
        onClick={() => setBranchOpen(o => !o)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-[6px] h-[6px] rounded-full flex-shrink-0"
              style={{
                background: '#FFD700',
                boxShadow: '0 0 7px rgba(255,215,0,0.65)',
              }}
            />
            <span className="text-[11.5px] truncate" style={{ color: 'rgba(255,255,255,0.80)' }}>
              {branchNames[currentBranch]}
            </span>
          </div>
          <span className="text-[10px] flex-shrink-0 ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {branchOpen ? '▲' : '▼'}
          </span>

          {/* Dropdown menu */}
          {branchOpen && (
          <div
            style={{
              position:'absolute', top:'100%', left:0, right:0, marginTop:'4px',
              borderRadius:'9px', overflow:'hidden', zIndex:50,
              background: '#0F1E2E',
              border: '1px solid rgba(255,215,0,0.16)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.50)',
            }}
          >
            {Object.entries(branchNames).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setCurrentBranch(id as 'eldoret' | 'kisumu')}
                className="w-full text-left px-3 py-2 text-[11px] transition"
                style={{
                  color: currentBranch === id ? 'rgba(255,215,0,0.95)' : 'rgba(255,255,255,0.55)',
                  background: currentBranch === id ? 'rgba(255,215,0,0.13)' : 'transparent',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          )}
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
              background: location.pathname === '/' ? 'rgba(255,215,0,0.13)' : 'transparent',
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
            <span>Home</span>
          </button>

          {/* Categories */}
          {NAVIGATION_STRUCTURE.filter(c => c.id !== 'home' && !(c.id === 'finance' && ['manager','intern','social_media'].includes(userRole))).map(category => {
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
                    background: isCategoryActive ? 'rgba(255,215,0,0.13)' : 'transparent',
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

                  <span className="flex-1 text-left" style={{ fontSize:'14px', fontWeight:600, color:'rgba(255,255,255,0.92)' }}>{category.label}</span>
                  
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
                          className="w-full flex items-center gap-2 px-[11px] py-[8px] rounded-[7px] text-[13px] mb-[1px] border-l-2 transition-all"
            style={{
              color: isSubcategoryActive(sub.route) ? 'rgba(255,215,0,0.95)' : 'rgba(255,255,255,0.58)',
              background: isSubcategoryActive(sub.route) ? 'rgba(255,215,0,0.13)' : 'transparent',
              borderLeftColor: isSubcategoryActive(sub.route) ? 'rgba(255,215,0,0.45)' : 'rgba(255,255,255,0.12)',
                            fontWeight: isSubcategoryActive(sub.route) ? 500 : 400,
                          }}
                        >
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



        {/* Sign out button — elevated, crisp */}
        <div style={{ padding:'10px 14px 4px' }}>
          <button
            onClick={() => { if(window.confirm('Sign out of PSK Admin?')) onLogout() }}
            style={{
              width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              padding:'11px 16px', borderRadius:'12px', cursor:'pointer', fontFamily:'inherit',
              fontSize:'13px', fontWeight:700, letterSpacing:'0.2px',
              background:'linear-gradient(135deg, rgba(231,76,60,0.18), rgba(192,57,43,0.12))',
              border:'1.5px solid rgba(231,76,60,0.40)',
              color:'rgba(239,154,154,0.95)',
              boxShadow:'0 4px 14px rgba(231,76,60,0.20), inset 0 1px 0 rgba(255,255,255,0.06)',
              transition:'all 0.18s ease',
            }}
            onMouseEnter={e=>{ const el=e.currentTarget; el.style.background='linear-gradient(135deg, rgba(231,76,60,0.30), rgba(192,57,43,0.22))'; el.style.borderColor='rgba(231,76,60,0.65)'; el.style.color='rgba(255,180,180,1)'; el.style.boxShadow='0 6px 20px rgba(231,76,60,0.35), inset 0 1px 0 rgba(255,255,255,0.08)'; el.style.transform='translateY(-1px)' }}
            onMouseLeave={e=>{ const el=e.currentTarget; el.style.background='linear-gradient(135deg, rgba(231,76,60,0.18), rgba(192,57,43,0.12))'; el.style.borderColor='rgba(231,76,60,0.40)'; el.style.color='rgba(239,154,154,0.95)'; el.style.boxShadow='0 4px 14px rgba(231,76,60,0.20), inset 0 1px 0 rgba(255,255,255,0.06)'; el.style.transform='translateY(0)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>

        {/* User avatar — opens profile panel */}
        <div style={{ padding:'8px 14px 12px', borderTop:'none' }}>
          <button
            onClick={() => setProfileOpen(true)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}
            onMouseEnter={e=>{ const el=e.currentTarget; el.style.background='rgba(255,215,0,0.07)'; el.style.borderColor='rgba(255,215,0,0.20)' }}
            onMouseLeave={e=>{ const el=e.currentTarget; el.style.background='rgba(255,255,255,0.04)'; el.style.borderColor='rgba(255,255,255,0.08)' }}
          >
            <div style={{ width:'30px', height:'30px', borderRadius:'50%', flexShrink:0, background:'rgba(255,215,0,0.15)', border:'1.5px solid rgba(255,215,0,0.40)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:800, color:'rgba(255,215,0,0.90)' }}>
              {(userName || 'U').split(' ').map((w:string) => w[0]).join('').toUpperCase().slice(0,2)}
            </div>
            <div style={{ flex:1, textAlign:'left', overflow:'hidden' }}>
              <div style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.80)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{userName || 'Staff'}</div>
              <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.30)', textTransform:'capitalize' }}>{userRole}</div>
            </div>
            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.25)' }}>⚙️</span>
          </button>
        </div>

        <ProfilePanel
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          onLogout={onLogout}
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
          userTitle={userTitle}
          userBranch={userBranch}
        />

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
