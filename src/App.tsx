import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import Home from './pages/Home'
import RegistryBoard from './pages/RegistryBoard'
import Bookings from './pages/Bookings'
import Clients from './pages/Clients'
import Drivers from './pages/Drivers'
import Finance from './pages/Finance'
import Documents from './pages/Documents'
import Analytics from './pages/Analytics'
import VehicleOwners from './pages/VehicleOwners'
import PSKFleet from './pages/PSKFleet'
import Partners from './pages/Partners'
import Reminders from './pages/Reminders'
import Settings from './pages/Settings'
import RentalAgreements from './pages/RentalAgreements'
import HandoverChecklists from './pages/HandoverChecklists'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentBranch] = useState<'eldoret' | 'kisumu'>('eldoret')

  const ComingSoon = ({ title }: { title: string }) => (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>🚧</div>
      <div style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.60)', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>This screen is being built. Check back soon.</div>
    </div>
  )

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <Router>
      <Layout onLogout={() => setIsAuthenticated(false)} currentBranch={currentBranch}>
        <Routes>
          {/* HOME */}
          <Route path="/" element={<Home />} />

          {/* OPERATIONS */}
          <Route path="/registry" element={<RegistryBoard />} />
          <Route path="/operations/registry" element={<RegistryBoard />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/operations/bookings" element={<Bookings />} />
          <Route path="/quotations" element={<Documents />} />
          <Route path="/operations/quotations" element={<Documents />} />
          <Route path="/agreements" element={<RentalAgreements />} />
          <Route path="/operations/agreements" element={<RentalAgreements />} />
          <Route path="/operations/handover" element={<HandoverChecklists />} />
          <Route path="/handover" element={<HandoverChecklists />} />
          <Route path="/operations/reminders" element={<Reminders />} />
          <Route path="/reminders" element={<Reminders />} />

          {/* CLIENTS */}
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/individual" element={<Clients defaultTab="individual" />} />
          <Route path="/clients/corporate" element={<Clients defaultTab="corporate" />} />
          <Route path="/clients/agency" element={<Clients defaultTab="agency" />} />
          <Route path="/clients/government" element={<Clients defaultTab="government" />} />

          {/* DRIVERS */}
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/partners/drivers" element={<Drivers />} />

          {/* PSK FLEET */}
          <Route path="/fleet/vehicles" element={<PSKFleet />} />
          <Route path="/fleet/maintenance" element={<PSKFleet defaultTab="maintenance" />} />
          <Route path="/maintenance" element={<PSKFleet defaultTab="maintenance" />} />
          <Route path="/fleet/fuel" element={<PSKFleet defaultTab="fuel" />} />
          <Route path="/fuel" element={<PSKFleet defaultTab="fuel" />} />
          <Route path="/fleet/compliance" element={<PSKFleet defaultTab="compliance" />} />
          <Route path="/compliance" element={<PSKFleet defaultTab="compliance" />} />

          {/* PARTNERS */}
          <Route path="/partners" element={<Partners />} />
          <Route path="/partners/owners" element={<VehicleOwners />} />
          <Route path="/owners" element={<VehicleOwners />} />
          <Route path="/partners/payouts" element={<VehicleOwners defaultTab="payouts" />} />
          <Route path="/owner-payouts" element={<VehicleOwners defaultTab="payouts" />} />
          <Route path="/partners/portal" element={<VehicleOwners defaultTab="portal" />} />
          <Route path="/owner-portal" element={<VehicleOwners defaultTab="portal" />} />

          {/* FINANCE */}
          <Route path="/finance" element={<Finance currentBranch={currentBranch} />} />
          <Route path="/finance/documents" element={<Documents />} />
          <Route path="/finance/mpesa" element={<Finance currentBranch={currentBranch} defaultTab="mpesa" />} />
          <Route path="/finance/expenses" element={<Finance currentBranch={currentBranch} defaultTab="expenses" />} />
          <Route path="/finance/pl" element={<Finance currentBranch={currentBranch} defaultTab="pl" />} />
          <Route path="/finance/payouts" element={<Finance currentBranch={currentBranch} defaultTab="payouts" />} />
          <Route path="/finance/receivables" element={<Finance currentBranch={currentBranch} defaultTab="receivables" />} />
          <Route path="/finance/reports" element={<Finance currentBranch={currentBranch} defaultTab="reports" />} />

          {/* INTELLIGENCE */}
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/intelligence/analytics" element={<Analytics />} />
          <Route path="/audit" element={<ComingSoon title="Audit Log" />} />
          <Route path="/intelligence/audit" element={<ComingSoon title="Audit Log" />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/intelligence/settings" element={<Settings />} />

          {/* CATCH ALL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
