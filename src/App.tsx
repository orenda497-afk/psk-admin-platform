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
    const sessionKey  = `fin_unlocked_${userRole}`
    const customPinKey = `fin_pin_${userRole}`

    // Default PINs — user can override by setting their own
    const DEFAULT_PINS: Record<string,string> = { owner:'1234', finance:'226688' }
    const pinLength = userRole === 'owner' ? 4 : 6

    const getCorrectPin = () => localStorage.getItem(customPinKey) || DEFAULT_PINS[userRole] || ''
    const isDefaultPin = () => !localStorage.getItem(customPinKey)

    const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(sessionKey) === '1')
    const [mode, setMode] = useState<'enter'|'set_new'|'confirm_new'>('enter')
    const [pin, setPin] = useState('')
    const [newPin, setNewPin] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const activeLength = mode === 'enter' ? pinLength : pinLength
    const activePin = mode === 'confirm_new' ? newPin : (mode === 'set_new' ? '' : '')

    function handleKey(k: string) {
      setError('')
      if (k === '⌫') {
        setPin(p => p.slice(0,-1))
      } else if (k && pin.length < pinLength) {
        setPin(p => p + k)
      }
    }

    function tryPin() {
      const correct = getCorrectPin()
      if (pin === correct) {
        sessionStorage.setItem(sessionKey, '1')
        setUnlocked(true)
        // If still on default PIN, prompt to change
        if (isDefaultPin()) {
          setMode('set_new')
          setUnlocked(false)
          setPin('')
          return
        }
      } else {
        setError('Incorrect PIN. Try again.')
        setPin('')
      }
    }

    function saveNewPin() {
      if (pin.length < pinLength) return
      if (mode === 'set_new') {
        setNewPin(pin)
        setPin('')
        setMode('confirm_new')
      } else if (mode === 'confirm_new') {
        if (pin === newPin) {
          localStorage.setItem(customPinKey, pin)
          sessionStorage.setItem(sessionKey, '1')
          setSuccess('PIN saved! Finance section unlocked.')
          setTimeout(() => setUnlocked(true), 1200)
        } else {
          setError('PINs do not match. Try again.')
          setPin('')
          setNewPin('')
          setMode('set_new')
        }
      }
    }

    function skipPinChange() {
      sessionStorage.setItem(sessionKey, '1')
      setUnlocked(true)
    }

    if (unlocked) return <>{children}</>

    const titleMap = {
      enter:       'Finance Section',
      set_new:     'Set Your Personal PIN',
      confirm_new: 'Confirm New PIN',
    }
    const subMap = {
      enter:       `Enter your ${pinLength}-digit PIN`,
      set_new:     `Choose a new ${pinLength}-digit PIN you will remember`,
      confirm_new: `Enter your new PIN again to confirm`,
    }
    const btnMap = {
      enter:       'Unlock Finance',
      set_new:     'Continue',
      confirm_new: 'Save PIN',
    }

    return (
      <div style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ background:'rgba(10,22,34,0.92)', border:'1.5px solid rgba(255,215,0,0.25)', borderRadius:'18px', padding:'40px 36px', width:'340px', textAlign:'center', backdropFilter:'blur(20px)', boxShadow:'0 24px 60px rgba(0,0,0,0.60)' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>{mode==='enter'?'🔐':'🔑'}</div>
          <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.92)', marginBottom:'4px' }}>{titleMap[mode]}</div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.40)', marginBottom:'6px' }}>
            {userRole === 'owner' ? 'Ken Mulanya — Owner' : 'Miriam Wanjiku — Finance Manager'}
          </div>
          <div style={{ fontSize:'11px', color:'rgba(255,215,0,0.55)', marginBottom:'24px' }}>{subMap[mode]}</div>

          {/* PIN dots */}
          <div style={{ display:'flex', gap:'10px', justifyContent:'center', marginBottom:'20px' }}>
            {Array.from({length: pinLength}).map((_,i)=>(
              <div key={i} style={{ width:'38px', height:'46px', borderRadius:'10px', background:'rgba(255,255,255,0.06)', border:`1.5px solid ${pin.length>i ? 'rgba(255,215,0,0.70)' : 'rgba(255,255,255,0.12)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', color:'rgba(255,215,0,0.90)', transition:'border 0.15s' }}>
                {pin.length > i ? '●' : ''}
              </div>
            ))}
          </div>

          {/* Numpad */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'14px' }}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k,i)=>(
              <button key={i} onClick={()=>handleKey(k)}
                style={{ padding:'15px', borderRadius:'10px', fontSize:'20px', fontWeight:600, background:k?'rgba(255,255,255,0.08)':'transparent', border:k?'1px solid rgba(255,255,255,0.10)':'none', color:'rgba(255,255,255,0.88)', cursor:k?'pointer':'default', fontFamily:'inherit' }}
                onMouseEnter={e=>k&&((e.target as HTMLElement).style.background='rgba(255,215,0,0.12)')}
                onMouseLeave={e=>k&&((e.target as HTMLElement).style.background='rgba(255,255,255,0.08)')}>{k}</button>
            ))}
          </div>

          {error && <div style={{ fontSize:'11px', color:'rgba(239,154,154,0.92)', marginBottom:'12px', padding:'8px', background:'rgba(231,76,60,0.10)', borderRadius:'8px' }}>{error}</div>}
          {success && <div style={{ fontSize:'11px', color:'rgba(129,199,132,0.92)', marginBottom:'12px', padding:'8px', background:'rgba(45,95,63,0.15)', borderRadius:'8px' }}>{success}</div>}

          <button
            onClick={mode === 'enter' ? tryPin : saveNewPin}
            disabled={pin.length < pinLength}
            style={{ width:'100%', padding:'13px', borderRadius:'11px', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.20),rgba(255,149,0,0.12))', border:'1.5px solid rgba(255,215,0,0.40)', color:'rgba(255,215,0,0.95)', cursor:pin.length<pinLength?'not-allowed':'pointer', fontFamily:'inherit', opacity:pin.length<pinLength?0.45:1, marginBottom:'10px' }}>
            {btnMap[mode]}
          </button>

          {/* Skip PIN change option */}
          {mode === 'set_new' && (
            <button onClick={skipPinChange} style={{ width:'100%', padding:'10px', borderRadius:'11px', fontSize:'12px', fontWeight:500, background:'transparent', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.35)', cursor:'pointer', fontFamily:'inherit' }}>
              Skip for now — keep default PIN
            </button>
          )}

          {mode === 'enter' && (
            <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.18)', marginTop:'8px' }}>Stays unlocked until you log out</div>
          )}
          {mode === 'set_new' && (
            <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', marginTop:'8px' }}>Your PIN is saved locally on this device</div>
          )}
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
          <Route path="/finance" element={['manager','ops','intern'].includes(user?.role||'') ? <FinanceBlocked /> : <FinancePIN userRole={user?.role||'manager'}><Finance currentBranch={currentBranch} userRole={user?.role||'manager'} /></FinancePIN>} />
          <Route path="/finance/documents" element={<Documents />} />
          <Route path="/finance/mpesa" element={['manager','ops','intern'].includes(user?.role||'') ? <FinanceBlocked /> : <FinancePIN userRole={user?.role||'manager'}><Finance currentBranch={currentBranch} defaultTab="mpesa" userRole={user?.role||'manager'} /></FinancePIN>} />
          <Route path="/finance/expenses" element={['manager','ops','intern'].includes(user?.role||'') ? <FinanceBlocked /> : <FinancePIN userRole={user?.role||'manager'}><Finance currentBranch={currentBranch} defaultTab="expenses" userRole={user?.role||'manager'} /></FinancePIN>} />
          <Route path="/finance/pl" element={['manager','ops','intern'].includes(user?.role||'') ? <FinanceBlocked /> : <FinancePIN userRole={user?.role||'manager'}><Finance currentBranch={currentBranch} defaultTab="pl" userRole={user?.role||'manager'} /></FinancePIN>} />
          <Route path="/finance/payouts" element={['manager','ops','intern'].includes(user?.role||'') ? <FinanceBlocked /> : <FinancePIN userRole={user?.role||'manager'}><Finance currentBranch={currentBranch} defaultTab="payouts" userRole={user?.role||'manager'} /></FinancePIN>} />
          <Route path="/finance/receivables" element={['manager','ops','intern'].includes(user?.role||'') ? <FinanceBlocked /> : <FinancePIN userRole={user?.role||'manager'}><Finance currentBranch={currentBranch} defaultTab="receivables" userRole={user?.role||'manager'} /></FinancePIN>} />
          <Route path="/finance/reports" element={['manager','ops','intern'].includes(user?.role||'') ? <FinanceBlocked /> : <FinancePIN userRole={user?.role||'manager'}><Finance currentBranch={currentBranch} defaultTab="reports" userRole={user?.role||'manager'} /></FinancePIN>} />

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
