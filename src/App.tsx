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
import AuditLog from './pages/AuditLog'
import VehicleOwners from './pages/VehicleOwners'
import PSKFleet from './pages/PSKFleet'
import Partners from './pages/Partners'
import Reminders from './pages/Reminders'
import Settings from './pages/Settings'
import RentalAgreements from './pages/RentalAgreements'
import HandoverChecklists from './pages/HandoverChecklists'

interface PSKUser { name:string; role:string; title:string; email:string }

function App() {
  const [user, setUser] = useState<PSKUser|null>(() => {
    try { const s = localStorage.getItem('psk_user'); return s ? JSON.parse(s) : null } catch { return null }
  })
  const [currentBranch] = useState<'eldoret' | 'kisumu'>('eldoret')
  const isAuthenticated = !!user

  const ComingSoon = ({ title }: { title: string }) => (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>🚧</div>
      <div style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.60)', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>This screen is being built. Check back soon.</div>
    </div>
  )


  const FinanceBlocked = () => (
    <div style={{ padding:'60px', textAlign:'center' }}>
      <div style={{ fontSize:'40px', marginBottom:'16px' }}>🔒</div>
      <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.60)', marginBottom:'8px' }}>Finance Access Restricted</div>
      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.30)' }}>You do not have permission to access the Finance section. Contact Ken or Miriam.</div>
    </div>
  )

  const FinancePIN = ({ children, userRole }: { children: React.ReactNode; userRole: string }) => {
    const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('fin_unlocked') === '1')
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')

    const PINS: Record<string,string> = { owner:'2026', finance:'447788' }

    function tryPin() {
      const correct = PINS[userRole]
      if (pin === correct) { sessionStorage.setItem('fin_unlocked','1'); setUnlocked(true) }
      else { setError('Incorrect PIN. Try again.'); setPin('') }
    }

    if (unlocked) return <>{children}</>

    return (
      <div style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ background:'rgba(10,22,34,0.90)', border:'1.5px solid rgba(255,215,0,0.20)', borderRadius:'18px', padding:'40px 36px', width:'320px', textAlign:'center', backdropFilter:'blur(20px)' }}>
          <div style={{ fontSize:'36px', marginBottom:'12px' }}>🔐</div>
          <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.90)', marginBottom:'4px' }}>Finance Section</div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.40)', marginBottom:'24px' }}>Enter your {userRole==='owner'?'4':'6'}-digit PIN to continue</div>
          <div style={{ display:'flex', gap:'8px', justifyContent:'center', marginBottom:'16px' }}>
            {Array.from({length: userRole==='owner'?4:6}).map((_,i)=>(
              <div key={i} style={{ width:'36px', height:'44px', borderRadius:'9px', background:'rgba(255,255,255,0.06)', border:`1.5px solid ${pin.length>i?'rgba(255,215,0,0.60)':'rgba(255,255,255,0.12)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', color:'rgba(255,215,0,0.90)' }}>
                {pin.length > i ? '●' : ''}
              </div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'12px' }}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k,i)=>(
              <button key={i} onClick={()=>{
                if(k==='⌫') setPin(p=>p.slice(0,-1))
                else if(k&&pin.length<(userRole==='owner'?4:6)) setPin(p=>p+k)
              }} style={{ padding:'14px', borderRadius:'10px', fontSize:'18px', fontWeight:600, background:k?'rgba(255,255,255,0.07)':'transparent', border:k?'1px solid rgba(255,255,255,0.10)':'none', color:'rgba(255,255,255,0.85)', cursor:k?'pointer':'default', fontFamily:'inherit' }}>{k}</button>
            ))}
          </div>
          {error && <div style={{ fontSize:'11px', color:'rgba(239,154,154,0.90)', marginBottom:'12px' }}>{error}</div>}
          <button onClick={tryPin} disabled={pin.length < (userRole==='owner'?4:6)} style={{ width:'100%', padding:'12px', borderRadius:'10px', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.38)', color:'rgba(255,215,0,0.95)', cursor:'pointer', fontFamily:'inherit', opacity:pin.length<(userRole==='owner'?4:6)?0.5:1 }}>Unlock Finance</button>
          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.20)', marginTop:'12px' }}>Session unlocks until you log out</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={(role) => {
      try { const s = localStorage.getItem('psk_user'); setUser(s ? JSON.parse(s) : {name:'Admin',role,title:'Admin',email:''}) } catch { setUser({name:'Admin',role,title:'Admin',email:''}) }
    }} />
  }

  return (
    <Router>
      <Layout onLogout={() => { setUser(null); localStorage.removeItem('psk_user') }} currentBranch={currentBranch} userRole={user?.role||'manager'} userName={user?.name||''}>
        <Routes>
          {/* HOME */}
          <Route path="/" element={<Home />} />

          {/* OPERATIONS */}
          <Route path="/registry" element={<RegistryBoard />} />
          <Route path="/operations/registry" element={<RegistryBoard />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/operations/bookings" element={<Bookings />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/operations/documents" element={<Documents />} />
          <Route path="/quotations" element={<Documents defaultTab="quotation" />} />
          <Route path="/operations/quotations" element={<Documents defaultTab="quotation" />} />
          <Route path="/invoices" element={<Documents defaultTab="invoice" />} />
          <Route path="/receipts" element={<Documents defaultTab="receipt" />} />
          <Route path="/credit-notes" element={<Documents defaultTab="credit_note" />} />
          <Route path="/debit-notes" element={<Documents defaultTab="debit_note" />} />
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
          <Route path="/partners/payouts" element={<VehicleOwners defaultTab="payouts" userRole={user?.role||'manager'} />} />
          <Route path="/owner-payouts" element={<VehicleOwners defaultTab="payouts" userRole={user?.role||'manager'} />} />
          <Route path="/partners/portal" element={<VehicleOwners defaultTab="portal" />} />
          <Route path="/owner-portal" element={<VehicleOwners defaultTab="portal" />} />

          {/* FINANCE — blocked for branch manager role */}
          <Route path="/finance" element={['manager','ops'].includes(user?.role||'') ? <FinanceBlocked /> : <FinancePIN userRole={user?.role||'manager'}><Finance currentBranch={currentBranch} userRole={user?.role||'manager'} /></FinancePIN>} />
          <Route path="/finance/documents" element={<Documents />} />
          <Route path="/finance/mpesa" element={['manager','ops'].includes(user?.role||'') ? <FinanceBlocked /> : <FinancePIN userRole={user?.role||'manager'}><Finance currentBranch={currentBranch} defaultTab="mpesa" userRole={user?.role||'manager'} /></FinancePIN>} />
          <Route path="/finance/expenses" element={['manager','ops'].includes(user?.role||'') ? <FinanceBlocked /> : <FinancePIN userRole={user?.role||'manager'}><Finance currentBranch={currentBranch} defaultTab="expenses" userRole={user?.role||'manager'} /></FinancePIN>} />
          <Route path="/finance/pl" element={['manager','ops'].includes(user?.role||'') ? <FinanceBlocked /> : <FinancePIN userRole={user?.role||'manager'}><Finance currentBranch={currentBranch} defaultTab="pl" userRole={user?.role||'manager'} /></FinancePIN>} />
          <Route path="/finance/payouts" element={['manager','ops'].includes(user?.role||'') ? <FinanceBlocked /> : <FinancePIN userRole={user?.role||'manager'}><Finance currentBranch={currentBranch} defaultTab="payouts" userRole={user?.role||'manager'} /></FinancePIN>} />
          <Route path="/finance/receivables" element={['manager','ops'].includes(user?.role||'') ? <FinanceBlocked /> : <FinancePIN userRole={user?.role||'manager'}><Finance currentBranch={currentBranch} defaultTab="receivables" userRole={user?.role||'manager'} /></FinancePIN>} />
          <Route path="/finance/reports" element={['manager','ops'].includes(user?.role||'') ? <FinanceBlocked /> : <FinancePIN userRole={user?.role||'manager'}><Finance currentBranch={currentBranch} defaultTab="reports" userRole={user?.role||'manager'} /></FinancePIN>} />

          {/* INTELLIGENCE */}
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/intelligence/analytics" element={<Analytics />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="/intelligence/audit" element={<AuditLog />} />
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
