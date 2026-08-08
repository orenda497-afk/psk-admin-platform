import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { getStaffBranch } from '../data/staff'

interface LayoutProps {
  children: ReactNode
  onLogout: () => void
  currentBranch?: 'eldoret' | 'kisumu'
  currentUser?: string
}

export default function Layout({ 
  children, 
  onLogout,
  currentBranch = 'eldoret',
  currentUser = ''
}: LayoutProps) {
  const location = useLocation()

  // If user is assigned to a specific branch, lock them to that branch
  const userBranch = currentUser ? getStaffBranch(currentUser) : null
  const displayBranch = userBranch || currentBranch



  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'Registry Board', subtitle: 'Live fleet status' }
      case '/bookings':
        return { title: 'Bookings', subtitle: 'Manage reservations' }
      case '/clients':
        return { title: 'Clients', subtitle: 'Client management' }
      case '/drivers':
        return { title: 'Drivers & Staff', subtitle: 'Team management' }
      case '/investors':
        return { title: 'Investors', subtitle: 'Investor management' }
      case '/finance':
        return { title: 'Finance', subtitle: 'Financial overview' }
      case '/quotations':
        return { title: 'Quotations', subtitle: 'Quote management' }
      case '/analytics':
        return { title: 'Fleet Intelligence', subtitle: 'Utilization & maintenance analytics' }
      default:
        return { title: 'Dashboard', subtitle: '' }
    }
  }

  const pageInfo = getPageTitle()

  return (
    <div style={{ display: 'flex', height: '100vh' }} className="bg-psk-bg-base overflow-hidden">
      {/* Sidebar — fixed width 210px, full height */}
      <aside style={{ width: '210px', minWidth: '210px', flexShrink: 0 }}>
        <Sidebar onLogout={onLogout} currentUser={currentUser} />
      </aside>

      {/* Main — takes remaining width, flex column layout */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TopBar — only inside main, never over sidebar */}
        <header style={{ flexShrink: 0 }}>
          <TopBar 
            title={pageInfo.title} 
            subtitle={pageInfo.subtitle}
            currentBranch={displayBranch}
          />
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
