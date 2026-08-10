import { ReactNode } from 'react'

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


  // If user is assigned to a specific branch, lock them to that branch
  const userBranch = currentUser ? getStaffBranch(currentUser) : null
  const displayBranch = userBranch || currentBranch







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
