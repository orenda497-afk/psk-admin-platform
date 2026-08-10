import { useState } from 'react'

interface Props { onLogin: (role: string) => void }

const USERS = [
  { email:'ken@psksafaris.com',    password:'PSKOwner2026!',   role:'owner',   name:'Ken Mulanya',    title:'Owner' },
  { email:'miriam@psksafaris.com', password:'PSKFinance2026!', role:'finance', name:'Miriam Wanjiku', title:'Finance Manager' },
  { email:'faith@psksafaris.com',  password:'PSKKisumu2026!',  role:'manager', name:'Faith',          title:'Kisumu Branch Manager' },
  { email:'evans@psksafaris.com',  password:'PSKOps2026!',     role:'ops',     name:'Evans',          title:'Operations' },
  { email:'brenda@psksafaris.com', password:'PSKOps2026!',     role:'ops',     name:'Brenda',         title:'Operations Assistant' },
]

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPw, setShowPw]     = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }

    const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password)
    if (!user) { setError('Invalid email or password. Please try again.'); return }

    setLoading(true)
    setTimeout(() => {
      localStorage.setItem('psk_user', JSON.stringify({ name: user.name, role: user.role, title: user.title, email: user.email }))
      onLogin(user.role)
      setLoading(false)
    }, 600)
  }

  return (
    <main style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', fontFamily:'system-ui, sans-serif' }}>
      {/* Background */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'url(/branding/registry-landrover-bg.jpg)', backgroundSize:'cover', backgroundPosition:'center', filter:'brightness(0.45)' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(10,22,34,0.75) 0%, rgba(27,77,92,0.50) 50%, rgba(10,22,34,0.80) 100%)' }} />

      {/* Card */}
      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:'420px', margin:'0 20px', background:'rgba(8,18,30,0.88)', border:'1.5px solid rgba(255,255,255,0.10)', borderRadius:'20px', backdropFilter:'blur(32px)', boxShadow:'0 32px 80px rgba(0,0,0,0.60)', padding:'40px 36px' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ width:'76px', height:'76px', borderRadius:'50%', border:'3px solid rgba(255,215,0,0.45)', boxShadow:'0 0 24px rgba(255,215,0,0.25)', margin:'0 auto 16px', overflow:'hidden' }}>
            <img src="/branding/psk-logo.png" alt="PSK Safaris" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
          <div style={{ fontSize:'22px', fontWeight:800, color:'rgba(255,255,255,0.95)', letterSpacing:'-0.3px' }}>PSK Safaris</div>
          <div style={{ fontSize:'13px', color:'rgba(255,215,0,0.75)', marginTop:'4px', fontWeight:500 }}>Admin Platform</div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'7px' }}>Email Address</label>
            <input
              type="email" value={email} autoComplete="email" disabled={loading}
              onChange={e=>{setEmail(e.target.value);setError('')}}
              placeholder="your@psksafaris.com"
              style={{ width:'100%', padding:'12px 14px', borderRadius:'10px', fontSize:'13px', background:'rgba(255,255,255,0.07)', border:`1.5px solid ${error?'rgba(239,154,154,0.50)':'rgba(255,255,255,0.12)'}`, color:'rgba(255,255,255,0.88)', outline:'none', fontFamily:'inherit', transition:'border 0.2s' }}
              onFocus={e=>(e.target.style.border='1.5px solid rgba(255,215,0,0.45)')}
              onBlur={e=>(e.target.style.border=`1.5px solid ${error?'rgba(239,154,154,0.50)':'rgba(255,255,255,0.12)'}`)}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block', fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.38)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'7px' }}>Password</label>
            <div style={{ position:'relative' }}>
              <input
                type={showPw?'text':'password'} value={password} autoComplete="current-password" disabled={loading}
                onChange={e=>{setPassword(e.target.value);setError('')}}
                placeholder="••••••••"
                style={{ width:'100%', padding:'12px 44px 12px 14px', borderRadius:'10px', fontSize:'13px', background:'rgba(255,255,255,0.07)', border:`1.5px solid ${error?'rgba(239,154,154,0.50)':'rgba(255,255,255,0.12)'}`, color:'rgba(255,255,255,0.88)', outline:'none', fontFamily:'inherit', transition:'border 0.2s' }}
                onFocus={e=>(e.target.style.border='1.5px solid rgba(255,215,0,0.45)')}
                onBlur={e=>(e.target.style.border=`1.5px solid ${error?'rgba(239,154,154,0.50)':'rgba(255,255,255,0.12)'}`)}
              />
              <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,0.35)', cursor:'pointer', fontSize:'14px', padding:'4px' }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom:'16px', padding:'10px 14px', borderRadius:'9px', background:'rgba(231,76,60,0.12)', border:'1px solid rgba(231,76,60,0.30)', color:'rgba(239,154,154,0.95)', fontSize:'12px' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', borderRadius:'11px', fontSize:'14px', fontWeight:700, background:'linear-gradient(135deg, rgba(255,215,0,0.90), rgba(255,149,0,0.80))', border:'none', color:'#1a1a1a', cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', opacity:loading?0.75:1, transition:'opacity 0.2s', letterSpacing:'0.3px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:'24px', fontSize:'11px', color:'rgba(255,255,255,0.22)', lineHeight:'1.6' }}>
          PSK Safaris & Car Rentals<br />
          Secure admin access only
        </div>
      </div>
    </main>
  )
}
