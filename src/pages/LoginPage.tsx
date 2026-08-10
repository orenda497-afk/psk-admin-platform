import { useState } from 'react'

interface Props { onLogin: (role: string) => void }

const DEFAULT_USERS = [
  { email:'ken@psksafaris.com',    password:'PSKOwner2026!',   role:'owner',   name:'Ken Mulanya',    title:'Owner' },
  { email:'miriam@psksafaris.com', password:'PSKFinance2026!', role:'finance', name:'Miriam Wanjiku', title:'Finance Manager' },
  { email:'faith@psksafaris.com',  password:'PSKKisumu2026!',  role:'manager', name:'Faith',          title:'Kisumu Branch Manager' },
  { email:'evans@psksafaris.com',  password:'PSKOps2026!',     role:'ops',     name:'Evans',          title:'Operations' },
  { email:'brenda@psksafaris.com', password:'PSKOps2026!',     role:'ops',     name:'Brenda',         title:'Operations Assistant' },
  { email:'intern@psksafaris.com', password:'PSKIntern2026!',  role:'intern',  name:'Intern',         title:'Intern' },
]

// Roles that can change password and set backup email
const CAN_CHANGE_PASSWORD = ['owner','finance','ops']

function getUsers() {
  try {
    const override = localStorage.getItem('psk_users_override')
    return override ? JSON.parse(override) : DEFAULT_USERS
  } catch { return DEFAULT_USERS }
}

function saveUsers(users: any[]) {
  localStorage.setItem('psk_users_override', JSON.stringify(users))
}

function isFirstLogin(email: string) {
  return !localStorage.getItem(`psk_pw_changed_${email}`)
}

function getBackupEmail(email: string) {
  return localStorage.getItem(`psk_backup_${email}`) || ''
}

function saveBackupEmail(email: string, backup: string) {
  localStorage.setItem(`psk_backup_${email}`, backup)
}

export default function LoginPage({ onLogin }: Props) {
  const [mode, setMode]         = useState<'login'|'forgot'|'change_pw'|'backup_email'>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPw, setShowPw]     = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<any>(null)

  // Change password state
  const [newPw, setNewPw]       = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError]   = useState('')

  // Backup email state
  const [backupEmail, setBackupEmail] = useState('')
  const [backupError, setBackupError] = useState('')
  const [backupSaved, setBackupSaved] = useState(false)

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }

    const users = getUsers()
    const user = users.find((u: any) =>
      u.email.toLowerCase() === email.toLowerCase().trim() &&
      u.password === password
    )

    if (!user) { setError('Invalid email or password. Please try again.'); return }

    setLoading(true)
    setTimeout(() => {
      localStorage.setItem('psk_user', JSON.stringify({
        name: user.name, role: user.role, title: user.title, email: user.email
      }))
      setLoggedInUser(user)
      setLoading(false)

      // First login + can change password → prompt
      if (isFirstLogin(user.email) && CAN_CHANGE_PASSWORD.includes(user.role)) {
        setMode('change_pw')
      } else {
        onLogin(user.role)
      }
    }, 500)
  }

  function handleChangePassword(skip = false) {
    if (skip) {
      onLogin(loggedInUser.role)
      return
    }
    setPwError('')
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }

    // Save new password
    const users = getUsers()
    const updated = users.map((u: any) =>
      u.email === loggedInUser.email ? { ...u, password: newPw } : u
    )
    saveUsers(updated)
    localStorage.setItem(`psk_pw_changed_${loggedInUser.email}`, '1')

    // Move to backup email step
    setMode('backup_email')
  }

  function handleSaveBackup(skip = false) {
    if (!skip) {
      if (!backupEmail || !backupEmail.includes('@')) { setBackupError('Please enter a valid email address.'); return }
      saveBackupEmail(loggedInUser.email, backupEmail)
      setBackupSaved(true)
    }
    setTimeout(() => onLogin(loggedInUser.role), skip ? 0 : 1200)
  }

  function handleForgotPassword() {
    setForgotMsg('')
    if (!forgotEmail || !forgotEmail.includes('@')) { setForgotMsg('Please enter your work email address.'); return }

    const users = getUsers()
    const user = users.find((u: any) => u.email.toLowerCase() === forgotEmail.toLowerCase().trim())
    if (!user) { setForgotMsg('No account found with that email.'); return }

    const backup = getBackupEmail(user.email)
    if (!backup) {
      setForgotMsg('No backup email set for this account. Please contact Kevin to reset your password.')
      return
    }

    // Show password hint (in production this would email it)
    setForgotMsg(`Your backup email is ${backup}. Please contact Kevin referencing your account and he will send your new password to that address.`)
  }

  const inputStyle = {
    width:'100%', padding:'12px 14px', borderRadius:'10px', fontSize:'13px',
    background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
    color:'rgba(255,255,255,0.88)', outline:'none', fontFamily:'inherit',
  }
  const btnPrimary = {
    width:'100%', padding:'14px', borderRadius:'11px', fontSize:'14px', fontWeight:700,
    background:'linear-gradient(135deg, rgba(255,215,0,0.90), rgba(255,149,0,0.80))',
    border:'none', color:'#1a1a1a', cursor:'pointer', fontFamily:'inherit',
  }
  const btnSecondary = {
    width:'100%', padding:'12px', borderRadius:'11px', fontSize:'13px', fontWeight:500,
    background:'transparent', border:'1px solid rgba(255,255,255,0.12)',
    color:'rgba(255,255,255,0.40)', cursor:'pointer', fontFamily:'inherit',
  }
  const lbl = {
    display:'block' as const, fontSize:'10px', fontWeight:600,
    color:'rgba(255,255,255,0.38)', letterSpacing:'1px',
    textTransform:'uppercase' as const, marginBottom:'7px',
  }

  return (
    <main style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'url(/branding/registry-landrover-bg.jpg)', backgroundSize:'cover', backgroundPosition:'center', filter:'brightness(0.45)' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(10,22,34,0.75),rgba(27,77,92,0.50),rgba(10,22,34,0.80))' }} />

      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:'420px', margin:'0 20px', background:'rgba(8,18,30,0.88)', border:'1.5px solid rgba(255,255,255,0.10)', borderRadius:'20px', backdropFilter:'blur(32px)', boxShadow:'0 32px 80px rgba(0,0,0,0.60)', padding:'40px 36px' }}>

        {/* Logo — always visible */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ width:'72px', height:'72px', borderRadius:'50%', border:'3px solid rgba(255,215,0,0.45)', boxShadow:'0 0 24px rgba(255,215,0,0.25)', margin:'0 auto 14px', overflow:'hidden' }}>
            <img src="/branding/psk-logo.png" alt="PSK" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
          <div style={{ fontSize:'22px', fontWeight:800, color:'rgba(255,255,255,0.95)' }}>PSK Safaris</div>
          <div style={{ fontSize:'13px', color:'rgba(255,215,0,0.75)', marginTop:'4px', fontWeight:500 }}>Admin Platform</div>
        </div>

        {/* ── LOGIN ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:'16px' }}>
              <label style={lbl}>Email Address</label>
              <input type="email" value={email} autoComplete="email" disabled={loading}
                onChange={e=>{setEmail(e.target.value);setError('')}}
                placeholder="your@psksafaris.com"
                style={{ ...inputStyle, border:`1px solid ${error?'rgba(239,154,154,0.50)':'rgba(255,255,255,0.12)'}` }} />
            </div>
            <div style={{ marginBottom:'20px' }}>
              <label style={lbl}>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPw?'text':'password'} value={password} autoComplete="current-password" disabled={loading}
                  onChange={e=>{setPassword(e.target.value);setError('')}}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight:'44px', border:`1px solid ${error?'rgba(239,154,154,0.50)':'rgba(255,255,255,0.12)'}` }} />
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,0.35)', cursor:'pointer', fontSize:'14px' }}>{showPw?'🙈':'👁'}</button>
              </div>
            </div>
            {error && <div style={{ marginBottom:'16px', padding:'10px 14px', borderRadius:'9px', background:'rgba(231,76,60,0.12)', border:'1px solid rgba(231,76,60,0.30)', color:'rgba(239,154,154,0.95)', fontSize:'12px' }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity:loading?0.75:1, marginBottom:'14px' }}>{loading?'Signing in...':'Sign In'}</button>
            <button type="button" onClick={()=>{setMode('forgot');setError('')}} style={{ ...btnSecondary }}>Forgot password?</button>
          </form>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {mode === 'forgot' && (
          <div>
            <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.90)', marginBottom:'6px' }}>Forgot Password</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.38)', marginBottom:'22px', lineHeight:'1.6' }}>
              Enter your work email. If you have a backup email saved, we'll show you what to do next.
            </div>
            <div style={{ marginBottom:'16px' }}>
              <label style={lbl}>Your work email</label>
              <input type="email" value={forgotEmail} onChange={e=>{setForgotEmail(e.target.value);setForgotMsg('')}}
                placeholder="your@psksafaris.com" style={inputStyle} />
            </div>
            {forgotMsg && (
              <div style={{ marginBottom:'16px', padding:'12px 14px', borderRadius:'9px', background: forgotMsg.includes('contact Kevin') ? 'rgba(255,149,0,0.10)' : 'rgba(129,199,132,0.10)', border:`1px solid ${forgotMsg.includes('contact Kevin')?'rgba(255,149,0,0.30)':'rgba(129,199,132,0.30)'}`, color: forgotMsg.includes('contact Kevin') ? 'rgba(255,183,77,0.95)' : 'rgba(129,199,132,0.95)', fontSize:'12px', lineHeight:'1.6' }}>
                {forgotMsg}
              </div>
            )}
            <button onClick={handleForgotPassword} style={{ ...btnPrimary, marginBottom:'12px' }}>Check my account</button>
            <button onClick={()=>{setMode('login');setForgotMsg('');setForgotEmail('')}} style={btnSecondary}>← Back to login</button>
          </div>
        )}

        {/* ── CHANGE PASSWORD (first login) ── */}
        {mode === 'change_pw' && (
          <div>
            <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.90)', marginBottom:'4px' }}>Welcome, {loggedInUser?.name}!</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.38)', marginBottom:'22px', lineHeight:'1.6' }}>
              You're using a temporary password. We recommend setting your own personal password now.
            </div>
            <div style={{ marginBottom:'14px' }}>
              <label style={lbl}>New password (min 6 characters)</label>
              <div style={{ position:'relative' }}>
                <input type={showPw?'text':'password'} value={newPw} onChange={e=>{setNewPw(e.target.value);setPwError('')}}
                  placeholder="Choose a strong password" style={{ ...inputStyle, paddingRight:'44px' }} />
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,0.35)', cursor:'pointer', fontSize:'14px' }}>{showPw?'🙈':'👁'}</button>
              </div>
            </div>
            <div style={{ marginBottom:'18px' }}>
              <label style={lbl}>Confirm new password</label>
              <input type="password" value={confirmPw} onChange={e=>{setConfirmPw(e.target.value);setPwError('')}}
                placeholder="Type password again" style={inputStyle} />
            </div>
            {pwError && <div style={{ marginBottom:'14px', padding:'10px 14px', borderRadius:'9px', background:'rgba(231,76,60,0.12)', border:'1px solid rgba(231,76,60,0.30)', color:'rgba(239,154,154,0.95)', fontSize:'12px' }}>{pwError}</div>}
            <button onClick={()=>handleChangePassword(false)} style={{ ...btnPrimary, marginBottom:'10px' }}>Set my password</button>
            <button onClick={()=>handleChangePassword(true)} style={btnSecondary}>Skip for now — use temporary password</button>
          </div>
        )}

        {/* ── BACKUP EMAIL ── */}
        {mode === 'backup_email' && (
          <div>
            <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.90)', marginBottom:'4px' }}>Add a Backup Email</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.38)', marginBottom:'22px', lineHeight:'1.6' }}>
              If you ever forget your password, we'll use this email to help you reset it. Use a personal email you always have access to — not your work email.
            </div>
            {backupSaved ? (
              <div style={{ padding:'16px', borderRadius:'10px', background:'rgba(129,199,132,0.10)', border:'1px solid rgba(129,199,132,0.28)', textAlign:'center' }}>
                <div style={{ fontSize:'24px', marginBottom:'8px' }}>✅</div>
                <div style={{ fontSize:'13px', fontWeight:600, color:'rgba(129,199,132,0.90)' }}>Backup email saved!</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'4px' }}>Taking you in...</div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom:'18px' }}>
                  <label style={lbl}>Personal backup email</label>
                  <input type="email" value={backupEmail} onChange={e=>{setBackupEmail(e.target.value);setBackupError('')}}
                    placeholder="e.g. yourname@gmail.com" style={inputStyle} />
                  {backupError && <div style={{ marginTop:'8px', fontSize:'11px', color:'rgba(239,154,154,0.90)' }}>{backupError}</div>}
                </div>
                <button onClick={()=>handleSaveBackup(false)} style={{ ...btnPrimary, marginBottom:'10px' }}>Save backup email</button>
                <button onClick={()=>handleSaveBackup(true)} style={btnSecondary}>Skip — I'll do this later</button>
              </>
            )}
          </div>
        )}

        <div style={{ textAlign:'center', marginTop:'20px', fontSize:'11px', color:'rgba(255,255,255,0.18)', lineHeight:'1.6' }}>
          PSK Safaris & Car Rentals · Secure admin access only
        </div>
      </div>
    </main>
  )
}
