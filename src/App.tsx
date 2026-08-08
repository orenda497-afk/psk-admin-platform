import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import RegistryBoard from './pages/RegistryBoard'
import Bookings from './pages/Bookings'
import Clients from './pages/Clients'
import Drivers from './pages/Drivers'
import Investors from './pages/Investors'
import Finance from './pages/Finance'
import Quotations from './pages/Quotations'
import Analytics from './pages/Analytics'
import { getStaffBranch } from './data/staff'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<string>('')
  const [currentBranch, setCurrentBranch] = useState<'eldoret' | 'kisumu'>('eldoret')

  const handleLogin = (email: string) => {
    setIsAuthenticated(true)
    setCurrentUser(email)
    // Set branch based on staff member's assigned branch
    const userBranch = getStaffBranch(email)
    setCurrentBranch(userBranch)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser('')
    setCurrentBranch('eldoret')
  }

  const handleBranchChange = (branchId: 'eldoret' | 'kisumu') => {
    setCurrentBranch(branchId)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <Router>
      <Layout 
        onLogout={handleLogout}
        currentBranch={currentBranch}
        onBranchChange={handleBranchChange}
        currentUser={currentUser}
      >
        <Routes>
          <Route path="/" element={<RegistryBoard />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/finance" element={<Finance currentBranch={currentBranch} />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
