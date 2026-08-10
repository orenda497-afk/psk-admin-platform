import { useState } from 'react'

interface LoginPageProps {
  onLogin: (email: string) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setTimeout(() => { onLogin(email); setLoading(false) }, 500)
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* BASE — full resolution safari image, never distorted */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/branding/registry-landrover-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        transform: 'scale(1.02)', // tiny scale to avoid edge bleed
      }} />

      {/* Layer 1 — warm golden safari tint to make it more vivid */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,100,0,0.18) 0%, rgba(255,180,0,0.12) 40%, rgba(0,0,0,0) 70%)',
        mixBlendMode: 'multiply',
      }} />

      {/* Layer 2 — dramatic top-to-bottom vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          linear-gradient(
            180deg,
            rgba(5,10,20,0.65) 0%,
            rgba(5,10,20,0.10) 30%,
            rgba(0,0,0,0.05) 55%,
            rgba(5,10,20,0.55) 85%,
            rgba(5,10,20,0.85) 100%
          )
        `,
      }} />

      {/* Layer 3 — side vignettes to frame the card */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 120% 100% at 50% 50%,
            transparent 40%,
            rgba(5,10,20,0.55) 100%
          )
        `,
      }} />

      {/* Layer 4 — golden hour sun glow from top right */}
      <div style={{
        position: 'absolute',
        top: '-10%', right: '-5%',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,180,0,0.22) 0%, rgba(255,100,0,0.10) 50%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Layer 5 — dust/atmosphere haze at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '30%',
        background: 'linear-gradient(0deg, rgba(180,80,0,0.20) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* PSK branding text — bottom left */}
      <div style={{
        position: 'absolute',
        bottom: '32px', left: '40px',
        zIndex: 5,
      }}>
        <div style={{
          fontSize: '11px', fontWeight: 600,
          color: 'rgba(255,215,0,0.55)',
          letterSpacing: '2px', textTransform: 'uppercase',
          marginBottom: '4px',
        }}>
          PSK Safaris & Car Rentals
        </div>
        <div style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.28)',
          letterSpacing: '0.5px',
        }}>
          Eldoret HQ · Kisumu Branch
        </div>
      </div>

      {/* Login Card */}
      <section style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '400px',
        margin: '0 20px',
        background: 'rgba(4,12,22,0.80)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,215,0,0.20)',
        borderRadius: '20px',
        padding: '44px 40px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.04) inset',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '36px' }}>
          <div style={{ position: 'relative', marginBottom: '18px' }}>
            <div style={{
              position: 'absolute', inset: -10, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,215,0,0.30), transparent 70%)',
              animation: 'logoPulse 3s ease-in-out infinite',
            }} />
            <img
              src="/branding/psk-logo.png"
              alt="PSK Safaris"
              style={{
                width: 72, height: 72, borderRadius: '50%',
                border: '2px solid rgba(255,215,0,0.60)',
                boxShadow: '0 0 28px rgba(255,215,0,0.35)',
                position: 'relative', zIndex: 1,
                display: 'block',
              }}
            />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.98)', letterSpacing: '-0.3px' }}>
            PSK Safaris
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,215,0,0.65)', marginTop: '4px', fontWeight: 500, letterSpacing: '0.5px' }}>
            Admin Platform
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.38)',
              letterSpacing: '0.8px', textTransform: 'uppercase',
              display: 'block', marginBottom: '7px',
            }}>Email address</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email" disabled={loading}
              style={{
                width: '100%', padding: '12px 14px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px', color: 'rgba(255,255,255,0.92)',
                fontSize: '13px', outline: 'none', fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,215,0,0.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.38)',
              letterSpacing: '0.8px', textTransform: 'uppercase',
              display: 'block', marginBottom: '7px',
            }}>Password</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password" disabled={loading}
              style={{
                width: '100%', padding: '12px 14px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px', color: 'rgba(255,255,255,0.92)',
                fontSize: '13px', outline: 'none', fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,215,0,0.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(231,76,60,0.10)', border: '1px solid rgba(231,76,60,0.22)',
              borderRadius: '9px', padding: '10px 14px', marginBottom: '16px',
              fontSize: '12px', color: 'rgba(239,154,154,0.92)',
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px',
            background: 'linear-gradient(135deg, rgba(255,215,0,0.20), rgba(255,149,0,0.14))',
            border: '1.5px solid rgba(255,215,0,0.40)',
            borderRadius: '10px', color: 'rgba(255,215,0,0.98)',
            fontSize: '13px', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', letterSpacing: '0.3px',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 20px rgba(255,149,0,0.15)',
          }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <style>{`
          @keyframes logoPulse {
            0%, 100% { opacity: 0.55; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.08); }
          }
          input::placeholder { color: rgba(255,255,255,0.18); }
        `}</style>
      </section>
    </main>
  )
}
