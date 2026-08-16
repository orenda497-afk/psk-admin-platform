import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
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
import SuperAdmin from './pages/SuperAdmin'
import UserManual from './pages/UserManual'
import VehicleOwners from './pages/VehicleOwners'
import PSKFleet from './pages/PSKFleet'
import Partners from './pages/Partners'
import Reminders from './pages/Reminders'
import Settings from './pages/Settings'
import RentalAgreements from './pages/RentalAgreements'
import HandoverChecklists from './pages/HandoverChecklists'

interface PSKUser { name:string; role:string; title:string; email:string }

function App() {
  const [user, setUser] = useState<PSKUser|null>(null)
  const [checking, setChecking] = useState(true)
  const [showSplash, setShowSplash] = useState(false)
  const [splashFading, setSplashFading] = useState(false)
  const [currentBranch, setCurrentBranch] = useState<'eldoret' | 'kisumu'>('eldoret')
  const isAuthenticated = !!user

  // Auto-logout after 30 minutes of inactivity.
  // Any mouse move, key press or touch resets the timer.
  useEffect(() => {
    if (!isAuthenticated) return
    const IDLE_MS = 30 * 60 * 1000 // 30 minutes
    let timer: ReturnType<typeof setTimeout>

    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        await supabase.auth.signOut()
        sessionStorage.clear()
        setUser(null)
        localStorage.removeItem('psk_user')
      }, IDLE_MS)
    }

    const events = ['mousemove','mousedown','keydown','touchstart','scroll','click']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset() // start the timer immediately

    return () => {
      clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [isAuthenticated])

  // The Supabase session is the source of truth. localStorage is only a
  // cache of display fields — it can no longer grant access on its own.
  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (!cancelled) { setUser(null); setChecking(false) }
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, role, title, email, branch, active')
        .eq('id', session.user.id)
        .maybeSingle()

      if (cancelled) return
      if (!profile || profile.active === false) {
        await supabase.auth.signOut()
        setUser(null)
      } else {
        setUser({ name: profile.name, role: profile.role, title: profile.title, email: profile.email })
        if (profile.branch === 'kisumu' || profile.branch === 'eldoret') setCurrentBranch(profile.branch)
      }
      setChecking(false)
    }

    loadProfile()
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        localStorage.removeItem('psk_user')
      }
      if (event === 'SIGNED_IN') {
        const wasLoggedOut = !localStorage.getItem('psk_user')
        if (wasLoggedOut && window.location.pathname !== '/' &&
            !window.location.pathname.startsWith('/kevin-admin') &&
            !window.location.pathname.startsWith('/help')) {
          window.location.replace('/')
        } else {
          loadProfile()
        }
        // Show splash screen on real fresh login
        if (wasLoggedOut) {
          setShowSplash(true)
          setTimeout(() => setSplashFading(true), 2800)
          setTimeout(() => setShowSplash(false), 3500)
        }
      }
      if (event === 'TOKEN_REFRESHED') loadProfile()
    })
    return () => { cancelled = true; sub.subscription.unsubscribe() }
  }, [])

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
    const sessionKey = `fin_unlocked_${userRole}`
    const pinLength = 4

    const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(sessionKey) === '1')
    const [mode, setMode] = useState<'enter'|'set_new'|'confirm_new'>('enter')
    const [pin, setPin] = useState('')
    const [newPin, setNewPin] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [busy, setBusy] = useState(false)

    function handleKey(k: string) {
      setError('')
      if (k === '\u232B') setPin(p => p.slice(0, -1))
      else if (k && pin.length < pinLength) setPin(p => p + k)
    }

    // The PIN is checked in Postgres against a bcrypt hash. It is never
    // compared in the browser, so reading this file tells you nothing.
    async function tryPin() {
      if (busy) return
      setBusy(true)

      // Get current user id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setBusy(false); setError('Not signed in.'); return }

      // Fetch profile directly - no RPC needed
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('finance_pin_hash, pin_attempts, pin_locked_until, role, active')
        .eq('id', user.id)
        .maybeSingle()

      if (pErr || !profile) {
        setBusy(false); setPin('')
        setError('Could not load profile: ' + (pErr?.message || 'not found'))
        return
      }

      if (!['owner','finance'].includes(profile.role)) {
        setBusy(false); setPin('')
        setError('Your role cannot access Finance.')
        return
      }

      if (!profile.finance_pin_hash) {
        setBusy(false); setPin('')
        setMode('set_new'); return
      }

      if (profile.pin_locked_until && new Date(profile.pin_locked_until) > new Date()) {
        setBusy(false); setPin('')
        setError('Finance locked for 15 minutes after too many attempts.')
        return
      }

      // Verify PIN via RPC (bcrypt check happens in Postgres)
      const { data, error: rpcErr } = await supabase.rpc('verify_finance_pin', { pin })
      setBusy(false)
      setPin('')

      if (rpcErr) {
        setError('PIN verification failed: ' + (rpcErr.message || rpcErr.code || 'unknown'))
        return
      }

      if (data?.ok) { sessionStorage.setItem(sessionKey, '1'); setUnlocked(true); return }
      if (data?.reason === 'no_pin_set') { setMode('set_new'); setError(''); return }
      if (data?.reason === 'locked') { setError('Finance locked for 15 minutes.'); return }
      if (data?.reason === 'not_permitted') { setError('Your role cannot open Finance.'); return }
      const left = data?.attempts_left
      setError(left ? `Incorrect PIN. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Incorrect PIN.')
    }

    async function saveNewPin() {
      if (pin.length < pinLength) return
      if (mode === 'set_new') { setNewPin(pin); setPin(''); setMode('confirm_new'); return }
      if (pin !== newPin) {
        setError('PINs do not match. Try again.')
        setPin(''); setNewPin(''); setMode('set_new'); return
      }
      setBusy(true)
      const { error: rpcErr } = await supabase.rpc('set_finance_pin', { new_pin: pin })
      setBusy(false)
      if (rpcErr) { setError(rpcErr.message || 'Could not save PIN.'); return }
      sessionStorage.setItem(sessionKey, '1')
      setSuccess('PIN saved. Finance section unlocked.')
      setTimeout(() => setUnlocked(true), 1000)
    }

    if (unlocked) return <>{children}</>

    const titleMap = { enter:'Finance Section', set_new:'Set Your Personal PIN', confirm_new:'Confirm New PIN' }
    const subMap = {
      enter: `Enter your ${pinLength}-digit PIN`,
      set_new: `Choose a ${pinLength}-digit PIN you will remember`,
      confirm_new: 'Enter your new PIN again to confirm',
    }
    const btnMap = { enter:'Unlock Finance', set_new:'Continue', confirm_new:'Save PIN' }

    return (
      <div style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ background:'rgba(10,22,34,0.92)', border:'1.5px solid rgba(255,215,0,0.25)', borderRadius:'18px', padding:'40px 36px', width:'340px', textAlign:'center', backdropFilter:'blur(20px)', boxShadow:'0 24px 60px rgba(0,0,0,0.60)' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>{mode==='enter'?'\u{1F510}':'\u{1F511}'}</div>
          <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.92)', marginBottom:'4px' }}>{titleMap[mode]}</div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.40)', marginBottom:'6px' }}>{user?.name} \u2014 {user?.title}</div>
          <div style={{ fontSize:'11px', color:'rgba(255,215,0,0.55)', marginBottom:'24px' }}>{subMap[mode]}</div>

          <div style={{ display:'flex', gap:'10px', justifyContent:'center', marginBottom:'20px' }}>
            {Array.from({length: pinLength}).map((_,i)=>(
              <div key={i} style={{ width:'38px', height:'46px', borderRadius:'10px', background:'rgba(255,255,255,0.06)', border:`1.5px solid ${pin.length>i ? 'rgba(255,215,0,0.70)' : 'rgba(255,255,255,0.12)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', color:'rgba(255,215,0,0.90)', transition:'border 0.15s' }}>
                {pin.length > i ? '\u25CF' : ''}
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'14px' }}>
            {['1','2','3','4','5','6','7','8','9','','0','\u232B'].map((k,i)=>(
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
            disabled={pin.length < pinLength || busy}
            style={{ width:'100%', padding:'13px', borderRadius:'11px', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,rgba(255,215,0,0.20),rgba(255,149,0,0.12))', border:'1.5px solid rgba(255,215,0,0.40)', color:'rgba(255,215,0,0.95)', cursor:(pin.length<pinLength||busy)?'not-allowed':'pointer', fontFamily:'inherit', opacity:(pin.length<pinLength||busy)?0.45:1, marginBottom:'10px' }}>
            {busy ? 'Checking\u2026' : btnMap[mode]}
          </button>

          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.20)', marginTop:'8px' }}>
            {mode === 'enter' ? 'Every attempt is recorded in the audit log' : 'Stored securely \u2014 nobody can read it back'}
          </div>
          <button onClick={()=>window.history.back()} style={{ marginTop:'16px', background:'none', border:'none', color:'rgba(255,255,255,0.30)', cursor:'pointer', fontSize:'13px', fontFamily:'inherit', textDecoration:'underline' }}>
            \u2190 Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  // Super admin route — completely outside normal app, no layout, no auth check
  if (typeof window !== 'undefined' && window.location.pathname === '/help') {
    return <UserManual />
  }

  if (typeof window !== 'undefined' && window.location.pathname === '/kevin-admin') {
    return <SuperAdmin />
  }

  if (checking) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0A1622', color:'rgba(255,215,0,0.55)', fontSize:'13px' }}>
        Loading PSK Admin\u2026
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => {
      try { const s = localStorage.getItem('psk_user'); if (s) setUser(JSON.parse(s)) } catch { /* session listener will fill this in */ }
      // Force home after login — replace current URL so back button doesn't return to sub-page
      if (window.location.pathname !== '/') {
        window.location.replace('/')
      }
    }} />
  }

  return (
    <>
    {/* ── SPLASH SCREEN ── */}
    {showSplash && (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1B4D5C 50%, #2D5F3F 100%)',
        transition: 'opacity 0.7s ease',
        opacity: splashFading ? 0 : 1,
        pointerEvents: splashFading ? 'none' : 'all',
      }}>
        <img
          src="/branding/happy_week.png"
          alt="Happy Week!"
          style={{
            width: 'min(520px, 85vw)',
            objectFit: 'contain',
            animation: 'splashBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
            filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.50))',
          }}
        />
        <div style={{
          marginTop: '32px',
          fontSize: '22px',
          fontWeight: 700,
          color: 'rgba(255,215,0,0.90)',
          letterSpacing: '1px',
          animation: 'splashFadeUp 0.8s 0.3s ease both',
          fontFamily: 'Inter, sans-serif',
        }}>
          Welcome back to PSK Admin 🌟
        </div>
        <style>{`
          @keyframes splashBounce {
            from { transform: scale(0.3) rotate(-8deg); opacity: 0; }
            to   { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes splashFadeUp {
            from { transform: translateY(20px); opacity: 0; }
            to   { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    )}
    <Router>
      <Layout onLogout={async () => { await supabase.rpc('log_action', { p_action:'Signed out', p_detail:null, p_entity:'auth', p_entity_id:null, p_icon:'\u{1F6AA}' }); await supabase.auth.signOut(); sessionStorage.clear(); setUser(null); localStorage.removeItem('psk_user') }} currentBranch={currentBranch} userRole={user?.role||'manager'} userName={user?.name||''} currentUser={user?.email||''}>
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
          <Route path="/finance" element={['manager','intern','social_media'].includes(user?.role||'') ? <FinanceBlocked /> : <Finance currentBranch={currentBranch} userRole={user?.role||'manager'} />} />
          <Route path="/finance/documents" element={<Documents />} />
          <Route path="/finance/mpesa" element={['manager','intern','social_media'].includes(user?.role||'') ? <FinanceBlocked /> : <Finance currentBranch={currentBranch} defaultTab="mpesa" userRole={user?.role||'manager'} />} />
          <Route path="/finance/expenses" element={['manager','intern','social_media'].includes(user?.role||'') ? <FinanceBlocked /> : <Finance currentBranch={currentBranch} defaultTab="expenses" userRole={user?.role||'manager'} />} />
          <Route path="/finance/pl" element={['manager','intern','social_media'].includes(user?.role||'') ? <FinanceBlocked /> : <Finance currentBranch={currentBranch} defaultTab="pl" userRole={user?.role||'manager'} />} />
          <Route path="/finance/payouts" element={['manager','intern','social_media'].includes(user?.role||'') ? <FinanceBlocked /> : <Finance currentBranch={currentBranch} defaultTab="payouts" userRole={user?.role||'manager'} />} />
          <Route path="/finance/receivables" element={['manager','intern','social_media'].includes(user?.role||'') ? <FinanceBlocked /> : <Finance currentBranch={currentBranch} defaultTab="receivables" userRole={user?.role||'manager'} />} />
          <Route path="/finance/reports" element={['manager','intern','social_media'].includes(user?.role||'') ? <FinanceBlocked /> : <Finance currentBranch={currentBranch} defaultTab="reports" userRole={user?.role||'manager'} />} />

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
  </>
  )
}

export default App
