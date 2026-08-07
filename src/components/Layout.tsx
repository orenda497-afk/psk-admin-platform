import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

interface LayoutProps {
  children: ReactNode
  onLogout: () => void
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const location = useLocation()

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
      default:
        return { title: 'Dashboard', subtitle: '' }
    }
  }

  const pageInfo = getPageTitle()

  return (
    <div className="flex h-screen bg-psk-bg-base overflow-hidden">
      {/* Sidebar */}
      <Sidebar onLogout={onLogout} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <TopBar title={pageInfo.title} subtitle={pageInfo.subtitle} />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
