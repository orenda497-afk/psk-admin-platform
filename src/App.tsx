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
import {
  HomeOverview,
  OperationsOverview,
  ClientsOverview,
  FleetOverview,
  OwnersOverview,
  FinanceOverview,
  IntelligenceOverview
} from './pages/CategoryPages'
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
          {/* Category Overviews */}
          <Route path="/" element={<HomeOverview />} />
          <Route path="/operations" element={<OperationsOverview />} />
          <Route path="/clients-drivers" element={<ClientsOverview />} />
          <Route path="/fleet-overview" element={<FleetOverview />} />
          <Route path="/owners-overview" element={<OwnersOverview />} />
          <Route path="/finance-overview" element={<FinanceOverview />} />
          <Route path="/intelligence-overview" element={<IntelligenceOverview />} />

          {/* Operations Routes */}
          <Route path="/registry" element={<RegistryBoard />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/agreements" element={<div className="text-white">Rental Agreements (Coming Soon)</div>} />
          <Route path="/handover" element={<div className="text-white">Handover Checklists (Coming Soon)</div>} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/reminders" element={<div className="text-white">Reminders (Coming Soon)</div>} />

          {/* Clients & Drivers Routes */}
          <Route path="/clients" element={<Clients />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/ratings" element={<div className="text-white">Ratings & Feedback (Coming Soon)</div>} />

          {/* Fleet Routes */}
          <Route path="/maintenance" element={<div className="text-white">Maintenance (Coming Soon)</div>} />
          <Route path="/fuel" element={<div className="text-white">Fuel Log (Coming Soon)</div>} />
          <Route path="/compliance" element={<div className="text-white">Compliance Calendar (Coming Soon)</div>} />

          {/* Owners Routes */}
          <Route path="/owners" element={<div className="text-white">Owner Profiles (Coming Soon)</div>} />
          <Route path="/owner-payouts" element={<div className="text-white">Owner Payouts (Coming Soon)</div>} />
          <Route path="/owner-portal" element={<div className="text-white">Owner Portal (Coming Soon)</div>} />

          {/* Finance Routes */}
          <Route path="/finance" element={<Finance currentBranch={currentBranch} />} />
          <Route path="/finance/documents" element={<Finance currentBranch={currentBranch} />} />
          <Route path="/finance/mpesa" element={<div className="text-white">M-Pesa Reconciliation (Coming Soon)</div>} />
          <Route path="/finance/expenses" element={<div className="text-white">Expenses (Coming Soon)</div>} />
          <Route path="/finance/pl" element={<div className="text-white">P&L by Vehicle (Coming Soon)</div>} />
          <Route path="/finance/payouts" element={<div className="text-white">Owner Payouts (Coming Soon)</div>} />
          <Route path="/finance/receivables" element={<div className="text-white">Receivables (Coming Soon)</div>} />
          <Route path="/finance/reports" element={<div className="text-white">Reports (Coming Soon)</div>} />

          {/* Intelligence Routes */}
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/audit" element={<div className="text-white">Audit Log (Coming Soon)</div>} />
          <Route path="/settings" element={<div className="text-white">Settings (Coming Soon)</div>} />

          {/* Legacy Routes */}
          <Route path="/investors" element={<Investors />} />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
